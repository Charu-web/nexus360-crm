-- ============================================================
-- 0009_billing_security_settings.sql
-- Invoices, payments, security events, audit logs, settings
-- (Refresh tokens / password reset / email verification are
-- handled natively by Supabase Auth and are NOT reimplemented here.)
-- ============================================================

create table public.invoices (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id),
  amount          numeric(14,2) not null,
  currency        text not null default 'INR',
  status          text not null default 'PAID', -- PAID, PENDING, FAILED
  invoice_url     text,
  created_at      timestamptz not null default now()
);
create index idx_invoices_tenant on public.invoices (tenant_id);

create table public.payments (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  amount           numeric(14,2) not null,
  currency         text not null default 'INR',
  payment_provider text not null default 'RAZORPAY',
  transaction_id   text not null unique,
  status           text not null default 'SUCCESS',
  created_at       timestamptz not null default now()
);
create index idx_payments_tenant on public.payments (tenant_id);

create table public.security_events (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid references public.tenants(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  email      text,
  event_type text not null,  -- LOGIN_SUCCESS, LOGIN_FAILED, PASSWORD_RESET, MFA_ENABLED ...
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_security_events_tenant on public.security_events (tenant_id, created_at desc);

create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid references public.tenants(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  action     text not null,   -- CREATE, UPDATE, DELETE
  entity     text not null,   -- 'lead', 'deal', ...
  entity_id  uuid,
  details    jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_tenant on public.audit_logs (tenant_id, created_at desc);
create index idx_audit_logs_entity on public.audit_logs (entity, entity_id);

create table public.system_settings (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade, -- null = platform-wide default
  key         text not null,
  value       jsonb not null,
  category    text not null default 'General',
  description text,
  updated_at  timestamptz not null default now(),
  unique (tenant_id, key)
);
