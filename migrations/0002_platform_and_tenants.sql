-- ============================================================
-- 0002_platform_and_tenants.sql
-- SaaS platform-level entities: platform admins, tenants,
-- plans, subscriptions, usage counters, teams
-- ============================================================

-- ---------- Tenants (each tenant = one CRM "company/workspace") ----------
create table public.tenants (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  domain         text unique,
  status         text not null default 'TRIAL' check (status in ('TRIAL','ACTIVE','SUSPENDED','CANCELLED')),
  industry       text default 'Generic',
  company_size   text default '1-10',
  country        text default 'India',
  template       text default 'Standard CRM',
  logo_url       text,
  primary_color  text default '#1e3a5f',
  trial_ends_at  timestamptz,
  is_deleted     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_tenants_slug on public.tenants (slug);

-- ---------- Platform admins (Anthropic/Empire staff who manage all tenants) ----------
-- One row per auth.users.id that is a platform owner/operator (not tied to a tenant).
create table public.platform_admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null default 'PLATFORM_OWNER' check (role in ('PLATFORM_OWNER','PLATFORM_ADMIN','PLATFORM_SUPPORT')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Plans (billing tiers) ----------
create table public.plans (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique, -- FREE, STARTER, PRO, BUSINESS, ENTERPRISE
  display_name     text not null,
  description      text,
  price_monthly    numeric(12,2) not null default 0,
  price_yearly     numeric(12,2) not null default 0,
  user_limit       integer not null default 3,
  lead_limit       integer not null default 500,
  storage_limit_mb integer not null default 500,
  custom_fields    boolean not null default false,
  custom_pipeline  boolean not null default false,
  automations      boolean not null default false,
  white_label      boolean not null default false,
  api_access       boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- Subscriptions ----------
create table public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  plan_id          uuid not null references public.plans(id),
  status           text not null default 'TRIAL' check (status in ('TRIAL','ACTIVE','PAST_DUE','CANCELLED')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at    timestamptz,
  start_date       timestamptz not null default now(),
  end_date         timestamptz,
  canceled_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_subscriptions_tenant on public.subscriptions (tenant_id);

-- ---------- Tenant feature flags / usage ----------
create table public.tenant_features (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  feature_key text not null,
  enabled     boolean not null default true,
  limit_value integer,
  updated_at  timestamptz not null default now(),
  unique (tenant_id, feature_key)
);

create table public.usage_counters (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null unique references public.tenants(id) on delete cascade,
  user_count     integer not null default 1,
  lead_count     integer not null default 0,
  customer_count integer not null default 0,
  deal_count     integer not null default 0,
  storage_mb     numeric(12,2) not null default 0,
  api_calls_count integer not null default 0,
  updated_at     timestamptz not null default now()
);

-- ---------- Teams (spec requirement: users can belong to a team, managers own a team) ----------
create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_teams_tenant on public.teams (tenant_id);
