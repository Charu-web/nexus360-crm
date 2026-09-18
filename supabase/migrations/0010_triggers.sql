-- ============================================================
-- 0010_triggers.sql
-- updated_at triggers, auto-profile-on-signup, human-friendly
-- display IDs (LEAD-0001 etc.), usage counters
-- ============================================================

-- ---------- updated_at on every table that has the column ----------
do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------- Auto-create a profile when a new auth.users row appears ----------
-- Expects tenant_id and role_id to be passed via user_metadata at signup:
--   supabase.auth.signUp({ email, password, options: { data: { tenant_id, role_id, full_name } }})
-- Falls back gracefully if metadata is missing (e.g. platform admin signup handled separately).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_role_id   uuid;
begin
  v_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;
  v_role_id   := (new.raw_user_meta_data->>'role_id')::uuid;

  -- Platform-admin signups set raw_user_meta_data->>'is_platform_admin' = 'true'
  if (new.raw_user_meta_data->>'is_platform_admin')::boolean is true then
    insert into public.platform_admins (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
    return new;
  end if;

  if v_tenant_id is null then
    -- No tenant context supplied; skip automatic profile creation.
    -- The app's signup flow (tenant provisioning) should call
    -- a dedicated RPC (see 0013 seed/RPC notes) instead in that case.
    return new;
  end if;

  if v_role_id is null then
    select id into v_role_id from public.roles
    where tenant_id = v_tenant_id and is_default = true
    limit 1;
  end if;

  insert into public.profiles (id, tenant_id, role_id, email, full_name)
  values (
    new.id,
    v_tenant_id,
    v_role_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  insert into public.usage_counters (tenant_id, user_count)
  values (v_tenant_id, 1)
  on conflict (tenant_id) do update set user_count = public.usage_counters.user_count + 1, updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Human-friendly display IDs ----------
create or replace function public.generate_display_id(p_tenant_id uuid, p_table text, p_prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  execute format('select count(*) from public.%I where tenant_id = $1', p_table)
    into v_count using p_tenant_id;
  return p_prefix || '-' || lpad((v_count + 1)::text, 4, '0');
end;
$$;

create or replace function public.set_lead_display_id()
returns trigger language plpgsql as $$
begin
  if new.display_id is null or new.display_id = '' then
    new.display_id := public.generate_display_id(new.tenant_id, 'leads', 'LEAD');
  end if;
  return new;
end $$;
drop trigger if exists trg_lead_display_id on public.leads;
create trigger trg_lead_display_id before insert on public.leads
  for each row execute function public.set_lead_display_id();

create or replace function public.set_customer_display_id()
returns trigger language plpgsql as $$
begin
  if new.display_id is null or new.display_id = '' then
    new.display_id := public.generate_display_id(new.tenant_id, 'customers', 'CUST');
  end if;
  return new;
end $$;
drop trigger if exists trg_customer_display_id on public.customers;
create trigger trg_customer_display_id before insert on public.customers
  for each row execute function public.set_customer_display_id();

-- ---------- Lead counter on usage_counters ----------
create or replace function public.bump_lead_count()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.usage_counters (tenant_id, lead_count)
    values (new.tenant_id, 1)
    on conflict (tenant_id) do update set lead_count = public.usage_counters.lead_count + 1, updated_at = now();
  elsif tg_op = 'DELETE' then
    update public.usage_counters set lead_count = greatest(lead_count - 1, 0), updated_at = now()
    where tenant_id = old.tenant_id;
  end if;
  return null;
end $$;
drop trigger if exists trg_bump_lead_count on public.leads;
create trigger trg_bump_lead_count after insert or delete on public.leads
  for each row execute function public.bump_lead_count();

-- ---------- Auto-log lead status changes into lead_activities ----------
create or replace function public.log_lead_status_change()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_activities (tenant_id, lead_id, type, title, details, created_by)
    values (new.tenant_id, new.id, 'STATUS_CHANGE',
            'Status changed to ' || new.status,
            'Previous status: ' || old.status,
            auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists trg_log_lead_status on public.leads;
create trigger trg_log_lead_status after update on public.leads
  for each row execute function public.log_lead_status_change();
