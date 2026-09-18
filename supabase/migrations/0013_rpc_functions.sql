-- ============================================================
-- 0013_rpc_functions.sql
-- Application RPCs: public form intake, tenant/signup
-- provisioning, and server-computed dashboard statistics.
-- ============================================================

-- ---------- 1) Public lead-capture form submission ----------
-- Called with the ANON key from a public embed/landing page — never
-- exposes tenant data, only accepts a slug + form payload, and writes
-- through SECURITY DEFINER so RLS never needs to be opened up for anon.
create or replace function public.submit_lead_form(p_form_slug text, p_data jsonb, p_ip text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form   public.custom_forms%rowtype;
  v_lead_id uuid;
begin
  select * into v_form from public.custom_forms where form_slug = p_form_slug and is_active = true;
  if not found then
    raise exception 'Form not found or inactive';
  end if;

  insert into public.leads (tenant_id, customer_name, phone, email, city, source, status)
  values (
    v_form.tenant_id,
    coalesce(p_data->>'name', 'Unknown'),
    coalesce(p_data->>'phone', ''),
    p_data->>'email',
    p_data->>'city',
    v_form.lead_source,
    'New'
  )
  returning id into v_lead_id;

  insert into public.form_submissions (form_id, data_json, ip_address, lead_id)
  values (v_form.id, p_data, p_ip, v_lead_id);

  insert into public.lead_activities (tenant_id, lead_id, type, title, details)
  values (v_form.tenant_id, v_lead_id, 'NOTE', 'Lead captured from form: ' || v_form.title, null);

  return v_lead_id;
end;
$$;
grant execute on function public.submit_lead_form(text, jsonb, text) to anon, authenticated;

-- ---------- 2) First-user-of-a-tenant signup provisioning ----------
-- Flow: client calls supabase.auth.signUp({email, password}) with NO
-- tenant metadata, then (once the session exists) calls this RPC once
-- to create the tenant + default ADMIN role + default pipeline and to
-- attach the caller's own profile as that tenant's admin.
create or replace function public.complete_signup_provisioning(p_tenant_name text, p_slug text, p_full_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_admin_role_id uuid;
  v_pipeline_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated';
  end if;
  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Profile already provisioned for this user';
  end if;

  insert into public.tenants (name, slug, status, trial_ends_at)
  values (p_tenant_name, p_slug, 'TRIAL', now() + interval '14 days')
  returning id into v_tenant_id;

  insert into public.roles (tenant_id, name, description, permissions, is_default)
  values (v_tenant_id, 'ADMIN', 'Full access to this tenant', '{"*":["read","write","delete"]}'::jsonb, false)
  returning id into v_admin_role_id;

  insert into public.roles (tenant_id, name, description, permissions, is_default)
  values
    (v_tenant_id, 'MANAGER', 'Manage own team records', '{"leads":["read","write"],"deals":["read","write"]}'::jsonb, false),
    (v_tenant_id, 'SALES', 'Own records only', '{"leads":["read","write"],"deals":["read","write"]}'::jsonb, true);

  insert into public.profiles (id, tenant_id, role_id, email, full_name)
  values (auth.uid(), v_tenant_id, v_admin_role_id, (select email from auth.users where id = auth.uid()), p_full_name);

  insert into public.pipelines (tenant_id, name, is_default)
  values (v_tenant_id, 'Standard Sales Pipeline', true)
  returning id into v_pipeline_id;

  insert into public.pipeline_stages (pipeline_id, tenant_id, name, stage_key, sort_order, probability)
  values
    (v_pipeline_id, v_tenant_id, 'New', 'new', 1, 10),
    (v_pipeline_id, v_tenant_id, 'Qualified', 'qualified', 2, 30),
    (v_pipeline_id, v_tenant_id, 'Proposal', 'proposal', 3, 60),
    (v_pipeline_id, v_tenant_id, 'Negotiation', 'negotiation', 4, 80),
    (v_pipeline_id, v_tenant_id, 'Won', 'won', 5, 100),
    (v_pipeline_id, v_tenant_id, 'Lost', 'lost', 6, 0);

  insert into public.usage_counters (tenant_id, user_count) values (v_tenant_id, 1)
  on conflict (tenant_id) do nothing;

  insert into public.subscriptions (tenant_id, plan_id, status, trial_ends_at)
  select v_tenant_id, id, 'TRIAL', now() + interval '14 days' from public.plans where name = 'FREE' limit 1;

  return v_tenant_id;
end;
$$;
grant execute on function public.complete_signup_provisioning(text, text, text) to authenticated;

-- ---------- 3) Invite a team member into an existing tenant ----------
-- Creates the profile row ahead of time so an admin-triggered invite
-- (sent via Supabase Auth admin.inviteUserByEmail from a trusted server
-- context / edge function using the service-role key) lands correctly
-- once the invited user completes signup and their auth.users id is known.
-- This variant is called by the edge function AFTER the invited user's
-- auth.users row exists, passing that user's id explicitly.
create or replace function public.attach_invited_profile(p_user_id uuid, p_tenant_id uuid, p_role_id uuid, p_full_name text, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_tenant_admin() and auth.uid() <> p_user_id then
    raise exception 'Not authorized to provision this profile';
  end if;
  insert into public.profiles (id, tenant_id, role_id, email, full_name)
  values (p_user_id, p_tenant_id, p_role_id, p_email, p_full_name)
  on conflict (id) do nothing;

  insert into public.usage_counters (tenant_id, user_count) values (p_tenant_id, 1)
  on conflict (tenant_id) do update set user_count = public.usage_counters.user_count + 1, updated_at = now();
end;
$$;
grant execute on function public.attach_invited_profile(uuid, uuid, uuid, text, text) to authenticated, service_role;

-- ---------- 4) Dashboard statistics (SECURITY INVOKER: respects caller's RLS) ----------
create or replace function public.get_dashboard_stats()
returns jsonb
language plpgsql
security invoker
stable
as $$
declare
  v_tenant uuid := public.current_tenant_id();
  result jsonb;
begin
  select jsonb_build_object(
    'total_leads', (select count(*) from public.leads where tenant_id = v_tenant),
    'new_leads', (select count(*) from public.leads where tenant_id = v_tenant and status = 'New'),
    'converted_leads', (select count(*) from public.leads where tenant_id = v_tenant and status = 'Converted'),
    'total_deals', (select count(*) from public.deals where tenant_id = v_tenant),
    'open_pipeline_value', (select coalesce(sum(amount),0) from public.deals where tenant_id = v_tenant and status = 'OPEN'),
    'won_deals', (select count(*) from public.deals where tenant_id = v_tenant and status = 'WON'),
    'lost_deals', (select count(*) from public.deals where tenant_id = v_tenant and status = 'LOST'),
    'won_value', (select coalesce(sum(amount),0) from public.deals where tenant_id = v_tenant and status = 'WON'),
    'total_tasks', (select count(*) from public.tasks where tenant_id = v_tenant),
    'pending_tasks', (select count(*) from public.tasks where tenant_id = v_tenant and status <> 'Completed'),
    'overdue_tasks', (select count(*) from public.tasks where tenant_id = v_tenant and status <> 'Completed' and due_date < now()),
    'upcoming_meetings', (select count(*) from public.meetings where tenant_id = v_tenant and start_time > now() and status = 'SCHEDULED'),
    'recent_activities', (
      select coalesce(jsonb_agg(a), '[]'::jsonb) from (
        select id, title, type, created_at from public.activities
        where tenant_id = v_tenant order by created_at desc limit 10
      ) a
    )
  ) into result;
  return result;
end;
$$;
grant execute on function public.get_dashboard_stats() to authenticated;

-- ---------- 5) Notifications helper ----------
create or replace function public.mark_notification_read(p_id uuid)
returns void
language sql
security invoker
as $$
  update public.notifications set is_read = true where id = p_id and profile_id = auth.uid();
$$;
grant execute on function public.mark_notification_read(uuid) to authenticated;
