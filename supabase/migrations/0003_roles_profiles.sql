-- ============================================================
-- 0003_roles_profiles.sql
-- Roles (per-tenant, with permission JSON) and profiles
-- (1:1 extension of auth.users — this is the "users" table).
-- Supabase Auth (auth.users) owns email/password/session; we
-- never store passwords ourselves.
-- ============================================================

create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,                 -- ADMIN, MANAGER, SALES, SUPPORT, ...
  description text,
  permissions jsonb not null default '{}'::jsonb, -- {"leads":["read","write","delete"], "deals":["read"]}
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, name)
);

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  role_id       uuid not null references public.roles(id),
  team_id       uuid references public.teams(id) on delete set null,
  manager_id    uuid references public.profiles(id) on delete set null, -- direct reporting manager (for "manager sees team's records")
  email         text not null unique,
  full_name     text not null,
  phone         text,
  avatar_url    text,
  department    text default 'Sales',
  designation   text default 'Agent',
  is_active     boolean not null default true,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_profiles_tenant on public.profiles (tenant_id);
create index idx_profiles_manager on public.profiles (manager_id);
create index idx_profiles_role on public.profiles (role_id);

-- Explicit team membership (supports users belonging to >1 team if ever needed;
-- profiles.team_id above covers the common "primary team" case used by RLS).
create table public.team_members (
  team_id    uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (team_id, profile_id)
);
