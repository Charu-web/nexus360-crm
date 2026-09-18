-- ============================================================
-- 0008_integrations_automation.sql
-- Integration catalog, automation engine, API keys, webhooks,
-- CRM templates, per-tenant module toggles
-- ============================================================

create table public.crm_templates (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique, -- REAL_ESTATE, EDUCATION, AUTOMOBILE, INSURANCE, TRAVEL, AGENCY, B2B, CUSTOM
  name          text not null,
  description   text,
  modules_json  jsonb not null default '[]'::jsonb,
  pipeline_json jsonb not null default '[]'::jsonb,
  fields_json   jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

create table public.tenant_modules (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  module_key text not null,
  enabled    boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, module_key)
);

create table public.integrations (
  id           uuid primary key default gen_random_uuid(),
  provider_key text not null unique, -- FACEBOOK_ADS, GOOGLE_ADS, INDIAMART, JUSTDIAL, WHATSAPP, SMTP, SMS
  name         text not null,
  category     text not null default 'Lead Capture',
  description  text,
  logo_url     text,
  created_at   timestamptz not null default now()
);

-- Tenant-specific integration credentials. Secrets are encrypted application-side
-- (or via pgsodium/Vault) before insert — never store plaintext API keys.
create table public.integration_credentials (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  integration_id uuid not null references public.integrations(id) on delete cascade,
  config_enc     text not null, -- encrypted JSON blob
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (tenant_id, integration_id)
);

create table public.integration_logs (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  integration_id uuid not null references public.integrations(id) on delete cascade,
  status         text not null,
  payload        jsonb,
  message        text,
  created_at     timestamptz not null default now()
);
create index idx_integration_logs_tenant on public.integration_logs (tenant_id, created_at desc);

create table public.automation_rules (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  name          text not null,
  trigger_event text not null,     -- e.g. LEAD_CREATED, DEAL_STAGE_CHANGED
  conditions    jsonb not null default '[]'::jsonb,
  actions       jsonb not null default '[]'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.automation_logs (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  rule_id    uuid references public.automation_rules(id) on delete set null,
  rule_name  text not null,
  trigger    text not null,
  action     text not null,
  status     text not null default 'SUCCESS',
  details    text,
  created_at timestamptz not null default now()
);

create table public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  key_hash    text not null unique,   -- store only a hash, never the raw key
  key_prefix  text not null,          -- short prefix shown in UI, e.g. "ecrm_live_ab12"
  permissions jsonb not null default '[]'::jsonb,
  revoked     boolean not null default false,
  last_used_at timestamptz,
  created_at  timestamptz not null default now()
);

create table public.webhook_endpoints (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  url        text not null,
  events     jsonb not null default '[]'::jsonb,
  secret     text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
