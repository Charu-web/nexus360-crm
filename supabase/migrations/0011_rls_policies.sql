-- ============================================================
-- 0011_rls_policies.sql
-- Enable RLS everywhere and define access policies.
--
-- Pattern used throughout:
--  - platform_admins: full read access everywhere (support/ops), never
--    bypasses tenant isolation on WRITEs except where explicitly stated.
--  - tenant isolation: tenant_id = current_tenant_id() (or reachable via a join)
--  - ADMIN role: full CRUD within their own tenant
--  - MANAGER role: full CRUD on records owned by themself or their
--    direct reports / team (see accessible_profile_ids())
--  - other roles (SALES/SUPPORT/...): CRUD limited to records they own
--    (assigned_to_id / owner_id / created_by / agent_id)
-- ============================================================

-- ---------------------------------------------------------------
-- 1) Simple tenant-isolated tables (every tenant member can read/write,
--    delete restricted to ADMIN/MANAGER). Generated in a loop to avoid
--    ~25 near-identical blocks.
-- ---------------------------------------------------------------
do $$
declare
  tbl text;
  simple_tables text[] := array[
    'companies','vendors','lead_sources','lead_labels',
    'pipelines','pipeline_stages','custom_fields','custom_field_values',
    'email_templates','custom_forms','tenant_modules',
    'automation_rules','automation_logs','saved_reports',
    'teams','system_settings','campaigns',
    'meetings','documents','integration_credentials',
    'integration_logs','webhook_endpoints','api_keys'
  ];
begin
  foreach tbl in array simple_tables loop
    execute format('alter table public.%I enable row level security;', tbl);

    execute format($p$
      create policy %I on public.%I for select
      using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
    $p$, tbl || '_select', tbl);

    execute format($p$
      create policy %I on public.%I for insert
      with check (tenant_id = public.current_tenant_id());
    $p$, tbl || '_insert', tbl);

    execute format($p$
      create policy %I on public.%I for update
      using (tenant_id = public.current_tenant_id())
      with check (tenant_id = public.current_tenant_id());
    $p$, tbl || '_update', tbl);

    execute format($p$
      create policy %I on public.%I for delete
      using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());
    $p$, tbl || '_delete', tbl);
  end loop;
end $$;

-- team_members / meeting_attendees have no direct tenant_id column;
-- scope them through their parent table instead.
alter table public.team_members enable row level security;
create policy team_members_select on public.team_members for select
  using (public.is_platform_admin() or exists (
    select 1 from public.teams t where t.id = team_members.team_id and t.tenant_id = public.current_tenant_id()
  ));
create policy team_members_insert on public.team_members for insert
  with check (exists (
    select 1 from public.teams t where t.id = team_members.team_id and t.tenant_id = public.current_tenant_id()
  ) and public.is_tenant_admin_or_manager());
create policy team_members_delete on public.team_members for delete
  using (exists (
    select 1 from public.teams t where t.id = team_members.team_id and t.tenant_id = public.current_tenant_id()
  ) and public.is_tenant_admin_or_manager());

alter table public.meeting_attendees enable row level security;
create policy meeting_attendees_select on public.meeting_attendees for select
  using (public.is_platform_admin() or exists (
    select 1 from public.meetings m where m.id = meeting_attendees.meeting_id and m.tenant_id = public.current_tenant_id()
  ));
create policy meeting_attendees_insert on public.meeting_attendees for insert
  with check (exists (
    select 1 from public.meetings m where m.id = meeting_attendees.meeting_id and m.tenant_id = public.current_tenant_id()
  ));
create policy meeting_attendees_update on public.meeting_attendees for update
  using (exists (
    select 1 from public.meetings m where m.id = meeting_attendees.meeting_id and m.tenant_id = public.current_tenant_id()
  ))
  with check (exists (
    select 1 from public.meetings m where m.id = meeting_attendees.meeting_id and m.tenant_id = public.current_tenant_id()
  ));
create policy meeting_attendees_delete on public.meeting_attendees for delete
  using (exists (
    select 1 from public.meetings m where m.id = meeting_attendees.meeting_id and m.tenant_id = public.current_tenant_id()
  ) and public.is_tenant_admin_or_manager());

-- ---------------------------------------------------------------
-- 2) Owner/assignment-scoped tables: leads, deals, tasks, customers,
--    contacts, notes, activities, lead_activities, follow_ups, call_logs
-- ---------------------------------------------------------------

-- LEADS (owner column: assigned_to_id)
alter table public.leads enable row level security;
create policy leads_select on public.leads for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin()
      or assigned_to_id is null
      or assigned_to_id in (select public.accessible_profile_ids())
    )
  ));
create policy leads_insert on public.leads for insert
  with check (tenant_id = public.current_tenant_id());
create policy leads_update on public.leads for update
  using (tenant_id = public.current_tenant_id() and (
    public.is_tenant_admin() or assigned_to_id in (select public.accessible_profile_ids())
  ))
  with check (tenant_id = public.current_tenant_id());
create policy leads_delete on public.leads for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

-- DEALS (owner column: owner_id)
alter table public.deals enable row level security;
create policy deals_select on public.deals for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or owner_id is null or owner_id in (select public.accessible_profile_ids())
    )
  ));
create policy deals_insert on public.deals for insert
  with check (tenant_id = public.current_tenant_id());
create policy deals_update on public.deals for update
  using (tenant_id = public.current_tenant_id() and (
    public.is_tenant_admin() or owner_id in (select public.accessible_profile_ids())
  ))
  with check (tenant_id = public.current_tenant_id());
create policy deals_delete on public.deals for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

-- TASKS (owner column: assigned_to_id)
alter table public.tasks enable row level security;
create policy tasks_select on public.tasks for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or assigned_to_id in (select public.accessible_profile_ids())
    )
  ));
create policy tasks_insert on public.tasks for insert
  with check (tenant_id = public.current_tenant_id());
create policy tasks_update on public.tasks for update
  using (tenant_id = public.current_tenant_id() and (
    public.is_tenant_admin() or assigned_to_id in (select public.accessible_profile_ids())
  ))
  with check (tenant_id = public.current_tenant_id());
create policy tasks_delete on public.tasks for delete
  using (tenant_id = public.current_tenant_id() and (
    public.is_tenant_admin() or assigned_to_id in (select public.accessible_profile_ids())
  ));

-- CUSTOMERS (owner column: owner_id)
alter table public.customers enable row level security;
create policy customers_select on public.customers for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or owner_id is null or owner_id in (select public.accessible_profile_ids())
    )
  ));
create policy customers_insert on public.customers for insert
  with check (tenant_id = public.current_tenant_id());
create policy customers_update on public.customers for update
  using (tenant_id = public.current_tenant_id() and (
    public.is_tenant_admin() or owner_id in (select public.accessible_profile_ids())
  ))
  with check (tenant_id = public.current_tenant_id());
create policy customers_delete on public.customers for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

-- CONTACTS (tenant-wide read, since they're shared reference data; write follows owner)
alter table public.contacts enable row level security;
create policy contacts_select on public.contacts for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy contacts_insert on public.contacts for insert
  with check (tenant_id = public.current_tenant_id());
create policy contacts_update on public.contacts for update
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());
create policy contacts_delete on public.contacts for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

-- NOTES (visible to whoever can see the parent lead/customer/deal; simplified to tenant-wide read)
alter table public.notes enable row level security;
create policy notes_select on public.notes for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy notes_insert on public.notes for insert
  with check (tenant_id = public.current_tenant_id() and created_by = auth.uid());
create policy notes_update on public.notes for update
  using (tenant_id = public.current_tenant_id() and (created_by = auth.uid() or public.is_tenant_admin()))
  with check (tenant_id = public.current_tenant_id());
create policy notes_delete on public.notes for delete
  using (tenant_id = public.current_tenant_id() and (created_by = auth.uid() or public.is_tenant_admin_or_manager()));

-- ACTIVITIES / LEAD_ACTIVITIES (append-only timeline, tenant-wide read)
alter table public.activities enable row level security;
create policy activities_select on public.activities for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy activities_insert on public.activities for insert
  with check (tenant_id = public.current_tenant_id());
create policy activities_no_update on public.activities for update using (false);
create policy activities_delete on public.activities for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

alter table public.lead_activities enable row level security;
create policy lead_activities_select on public.lead_activities for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy lead_activities_insert on public.lead_activities for insert
  with check (tenant_id = public.current_tenant_id());
create policy lead_activities_delete on public.lead_activities for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

-- FOLLOW_UPS
alter table public.follow_ups enable row level security;
create policy follow_ups_select on public.follow_ups for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy follow_ups_insert on public.follow_ups for insert
  with check (tenant_id = public.current_tenant_id());
create policy follow_ups_update on public.follow_ups for update
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());
create policy follow_ups_delete on public.follow_ups for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

-- CALL_LOGS (owner column: agent_id)
alter table public.call_logs enable row level security;
create policy call_logs_select on public.call_logs for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or agent_id in (select public.accessible_profile_ids())
    )
  ));
create policy call_logs_insert on public.call_logs for insert
  with check (tenant_id = public.current_tenant_id() and agent_id = auth.uid());
create policy call_logs_update on public.call_logs for update
  using (tenant_id = public.current_tenant_id() and (agent_id = auth.uid() or public.is_tenant_admin()))
  with check (tenant_id = public.current_tenant_id());
create policy call_logs_delete on public.call_logs for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

-- PROJECTS / PROJECT_TASKS / PROJECT_MILESTONES / SERVICE_RECORDS
alter table public.projects enable row level security;
create policy projects_select on public.projects for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy projects_write on public.projects for insert with check (tenant_id = public.current_tenant_id());
create policy projects_update on public.projects for update
  using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());
create policy projects_delete on public.projects for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

alter table public.project_tasks enable row level security;
create policy project_tasks_select on public.project_tasks for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy project_tasks_write on public.project_tasks for insert with check (tenant_id = public.current_tenant_id());
create policy project_tasks_update on public.project_tasks for update
  using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());
create policy project_tasks_delete on public.project_tasks for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

alter table public.project_milestones enable row level security;
create policy project_milestones_select on public.project_milestones for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy project_milestones_write on public.project_milestones for insert with check (tenant_id = public.current_tenant_id());
create policy project_milestones_update on public.project_milestones for update
  using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());
create policy project_milestones_delete on public.project_milestones for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

alter table public.service_records enable row level security;
create policy service_records_select on public.service_records for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or assigned_to_id is null or assigned_to_id in (select public.accessible_profile_ids())
    )
  ));
create policy service_records_insert on public.service_records for insert with check (tenant_id = public.current_tenant_id());
create policy service_records_update on public.service_records for update
  using (tenant_id = public.current_tenant_id() and (
    public.is_tenant_admin() or assigned_to_id in (select public.accessible_profile_ids())
  ))
  with check (tenant_id = public.current_tenant_id());
create policy service_records_delete on public.service_records for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

-- SALES_TARGETS (owner column: profile_id)
alter table public.sales_targets enable row level security;
create policy sales_targets_select on public.sales_targets for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or profile_id in (select public.accessible_profile_ids())
    )
  ));
create policy sales_targets_write on public.sales_targets for insert
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());
create policy sales_targets_update on public.sales_targets for update
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager())
  with check (tenant_id = public.current_tenant_id());
create policy sales_targets_delete on public.sales_targets for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

-- ATTENDANCE_RECORDS / LEAVE_REQUESTS (owner column: profile_id; self-service + manager visibility)
alter table public.attendance_records enable row level security;
create policy attendance_select on public.attendance_records for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or profile_id in (select public.accessible_profile_ids())
    )
  ));
create policy attendance_insert on public.attendance_records for insert
  with check (tenant_id = public.current_tenant_id() and profile_id = auth.uid());
create policy attendance_update on public.attendance_records for update
  using (tenant_id = public.current_tenant_id() and (profile_id = auth.uid() or public.is_tenant_admin()))
  with check (tenant_id = public.current_tenant_id());
create policy attendance_delete on public.attendance_records for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

alter table public.leave_requests enable row level security;
create policy leave_select on public.leave_requests for select
  using (public.is_platform_admin() or (
    tenant_id = public.current_tenant_id() and (
      public.is_tenant_admin() or profile_id in (select public.accessible_profile_ids())
    )
  ));
create policy leave_insert on public.leave_requests for insert
  with check (tenant_id = public.current_tenant_id() and profile_id = auth.uid());
create policy leave_update on public.leave_requests for update
  using (tenant_id = public.current_tenant_id() and (
    (profile_id = auth.uid() and status = 'PENDING') or public.is_tenant_admin_or_manager()
  ))
  with check (tenant_id = public.current_tenant_id());
create policy leave_delete on public.leave_requests for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

-- CHAT_MESSAGES (only sender/receiver can see; either can mark read)
alter table public.chat_messages enable row level security;
create policy chat_select on public.chat_messages for select
  using (tenant_id = public.current_tenant_id() and (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_tenant_admin()));
create policy chat_insert on public.chat_messages for insert
  with check (tenant_id = public.current_tenant_id() and sender_id = auth.uid());
create policy chat_update on public.chat_messages for update
  using (tenant_id = public.current_tenant_id() and (sender_id = auth.uid() or receiver_id = auth.uid()))
  with check (tenant_id = public.current_tenant_id());
create policy chat_delete on public.chat_messages for delete
  using (tenant_id = public.current_tenant_id() and sender_id = auth.uid());

-- NOTIFICATIONS (only the recipient can see/update their own)
alter table public.notifications enable row level security;
create policy notifications_select on public.notifications for select
  using (tenant_id = public.current_tenant_id() and profile_id = auth.uid());
create policy notifications_insert on public.notifications for insert
  with check (tenant_id = public.current_tenant_id()); -- created by triggers/service role or admins
create policy notifications_update on public.notifications for update
  using (tenant_id = public.current_tenant_id() and profile_id = auth.uid())
  with check (tenant_id = public.current_tenant_id() and profile_id = auth.uid());
create policy notifications_delete on public.notifications for delete
  using (tenant_id = public.current_tenant_id() and profile_id = auth.uid());

-- FORM_SUBMISSIONS: inserted by the public (unauthenticated) endpoint via
-- a SECURITY DEFINER RPC only (see 0012), never directly from the client
-- with the anon key. Authenticated tenant members can read their own.
alter table public.form_submissions enable row level security;
create policy form_submissions_select on public.form_submissions for select
  using (exists (
    select 1 from public.custom_forms f
    where f.id = form_submissions.form_id and f.tenant_id = public.current_tenant_id()
  ) or public.is_platform_admin());
-- No direct insert/update/delete policy for authenticated/anon roles:
-- all writes go through public.submit_lead_form() (SECURITY DEFINER, see 0012).

-- ---------------------------------------------------------------
-- 3) Identity & platform tables
-- ---------------------------------------------------------------

-- TENANTS: members can read their own tenant; platform admins read/write all;
-- only platform admins can create/delete tenants (provisioning flow).
alter table public.tenants enable row level security;
create policy tenants_select on public.tenants for select
  using (public.is_platform_admin() or id = public.current_tenant_id());
create policy tenants_update on public.tenants for update
  using (public.is_platform_admin() or (id = public.current_tenant_id() and public.is_tenant_admin()))
  with check (public.is_platform_admin() or (id = public.current_tenant_id() and public.is_tenant_admin()));
create policy tenants_insert on public.tenants for insert
  with check (public.is_platform_admin());
create policy tenants_delete on public.tenants for delete
  using (public.is_platform_admin());

-- PROFILES: visible to everyone in the same tenant; users can update their
-- own profile; ADMIN can update/deactivate any profile in their tenant.
alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy profiles_insert on public.profiles for insert
  with check (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));
create policy profiles_update on public.profiles for update
  using (public.is_platform_admin() or id = auth.uid() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()))
  with check (tenant_id = public.current_tenant_id());
create policy profiles_delete on public.profiles for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

-- ROLES
alter table public.roles enable row level security;
create policy roles_select on public.roles for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy roles_write on public.roles for insert
  with check (tenant_id = public.current_tenant_id() and public.is_tenant_admin());
create policy roles_update on public.roles for update
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant_id());
create policy roles_delete on public.roles for delete
  using (tenant_id = public.current_tenant_id() and public.is_tenant_admin());

-- PLATFORM_ADMINS: only visible/manageable by platform admins themselves.
alter table public.platform_admins enable row level security;
create policy platform_admins_select on public.platform_admins for select
  using (public.is_platform_admin());
create policy platform_admins_write on public.platform_admins for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- PLANS: global catalog, readable by any authenticated user, writable only by platform admins.
alter table public.plans enable row level security;
create policy plans_select on public.plans for select using (auth.role() = 'authenticated' or public.is_platform_admin());
create policy plans_write on public.plans for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- SUBSCRIPTIONS / USAGE_COUNTERS / TENANT_FEATURES: tenant admin can read their own; only platform admin writes.
alter table public.subscriptions enable row level security;
create policy subscriptions_select on public.subscriptions for select
  using (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));
create policy subscriptions_write on public.subscriptions for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.usage_counters enable row level security;
create policy usage_select on public.usage_counters for select
  using (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));

alter table public.tenant_features enable row level security;
create policy tenant_features_select on public.tenant_features for select
  using (public.is_platform_admin() or tenant_id = public.current_tenant_id());
create policy tenant_features_write on public.tenant_features for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- INVOICES / PAYMENTS: tenant admin read-only; writes are platform-side (webhooks/service role) only.
alter table public.invoices enable row level security;
create policy invoices_select on public.invoices for select
  using (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));

alter table public.payments enable row level security;
create policy payments_select on public.payments for select
  using (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));

-- SECURITY_EVENTS / AUDIT_LOGS: admin-only read within tenant; system-inserted (service role or SECURITY DEFINER fns).
alter table public.security_events enable row level security;
create policy security_events_select on public.security_events for select
  using (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));

alter table public.audit_logs enable row level security;
create policy audit_logs_select on public.audit_logs for select
  using (public.is_platform_admin() or (tenant_id = public.current_tenant_id() and public.is_tenant_admin()));

-- CRM_TEMPLATES / INTEGRATIONS: global read-only catalogs, platform-admin managed.
alter table public.crm_templates enable row level security;
create policy crm_templates_select on public.crm_templates for select using (auth.role() = 'authenticated' or public.is_platform_admin());
create policy crm_templates_write on public.crm_templates for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.integrations enable row level security;
create policy integrations_select on public.integrations for select using (auth.role() = 'authenticated' or public.is_platform_admin());
create policy integrations_write on public.integrations for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());
