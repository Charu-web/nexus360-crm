-- ============================================================
-- 0004_helper_functions.sql
-- SECURITY DEFINER helper functions used by RLS policies.
-- Kept minimal and STABLE so they inline efficiently in policies.
-- ============================================================

-- Current user's tenant (null for platform admins / signed-out)
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- Current user's profile row id (== auth.uid(), exposed for readability in policies/services)
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where id = auth.uid();
$$;

-- Current user's role name within their tenant, e.g. 'ADMIN' / 'MANAGER' / 'SALES'
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.platform_admins where id = auth.uid());
$$;

create or replace function public.is_tenant_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() = 'ADMIN';
$$;

create or replace function public.is_tenant_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('ADMIN','MANAGER');
$$;

-- Set of profile ids whose "own" records the current user is allowed to see:
--   ADMIN   -> every profile in the tenant
--   MANAGER -> themself + everyone who reports to them (direct reports, one level)
--             + everyone on a team they lead (profiles.team_id joined via team_members where they are a member with MANAGER role acts as team-wide access)
--   SALES/other -> just themself
create or replace function public.accessible_profile_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.tenant_id = public.current_tenant_id()
    and (
      public.is_tenant_admin()
      or p.id = auth.uid()
      or (public.is_tenant_admin_or_manager() and (
            p.manager_id = auth.uid()
            or p.team_id in (select team_id from public.profiles where id = auth.uid() and team_id is not null)
          ))
    );
$$;

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
