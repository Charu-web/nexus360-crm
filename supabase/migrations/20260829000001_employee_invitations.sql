-- ============================================================
-- 20260829000001_employee_invitations.sql
-- Employee invitations table and RLS policies for Empire CRM
-- ============================================================

create table if not exists public.employee_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  employee_name text not null,
  role text not null default 'STAFF',
  invited_by text not null,
  status text not null default 'PENDING',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_employee_invitations_tenant on public.employee_invitations(tenant_id);
create index if not exists idx_employee_invitations_email on public.employee_invitations(email);
create index if not exists idx_employee_invitations_status on public.employee_invitations(status);

alter table public.employee_invitations enable row level security;

drop policy if exists "Admins can manage invitations for their tenant" on public.employee_invitations;

create policy "Admins can manage invitations for their tenant" on public.employee_invitations
  for all using (tenant_id = public.current_tenant_id() and public.is_tenant_admin_or_manager());

grant all on table public.employee_invitations to authenticated, service_role;
