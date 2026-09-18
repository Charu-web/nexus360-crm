-- ============================================================
-- 0007_extended_modules.sql
-- Projects, service desk, sales targets, campaigns, custom
-- forms, HR (attendance/leave), saved reports
-- ============================================================

-- ---------- Projects ----------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  title       text not null,
  description text,
  status      text not null default 'IN_PROGRESS', -- PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED
  priority    text not null default 'Medium',
  start_date  date not null,
  deadline    date not null,
  budget      numeric(14,2) not null default 0,
  customer_id uuid references public.customers(id) on delete set null,
  owner_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_projects_tenant on public.projects (tenant_id);

create table public.project_tasks (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  project_id     uuid not null references public.projects(id) on delete cascade,
  title          text not null,
  status         text not null default 'Pending',
  priority       text not null default 'Medium',
  due_date       date not null,
  assigned_to_id uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);
create index idx_project_tasks_project on public.project_tasks (project_id);

create table public.project_milestones (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title      text not null,
  due_date   date not null,
  status     text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- ---------- Service desk / support tickets ----------
create table public.service_records (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  ticket_no      text not null,
  subject        text not null,
  description    text,
  priority       text not null default 'Medium',
  status         text not null default 'Open', -- Open, In Progress, Resolved, Closed
  customer_id    uuid not null references public.customers(id) on delete cascade,
  assigned_to_id uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (tenant_id, ticket_no)
);
create index idx_service_records_tenant on public.service_records (tenant_id, status);

-- ---------- Sales targets ----------
create table public.sales_targets (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  target_amount   numeric(14,2) not null,
  achieved_amount numeric(14,2) not null default 0,
  period_month    integer not null check (period_month between 1 and 12),
  period_year     integer not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, profile_id, period_month, period_year)
);

-- ---------- Marketing campaigns ----------
create table public.campaigns (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  name            text not null,
  channel         text not null, -- Facebook, Google Ads, WhatsApp, Email, SMS, Website
  budget          numeric(14,2) not null default 0,
  spent           numeric(14,2) not null default 0,
  start_date      date not null,
  end_date        date not null,
  leads_count     integer not null default 0,
  converted_count integer not null default 0,
  revenue         numeric(14,2) not null default 0,
  status          text not null default 'ACTIVE',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_campaigns_tenant on public.campaigns (tenant_id);

-- ---------- Public lead-capture forms ----------
create table public.custom_forms (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  title          text not null,
  form_slug      text not null unique,
  fields_json    jsonb not null default '[]'::jsonb,
  thank_you_msg  text default 'Thank you for submitting! Our team will contact you shortly.',
  lead_source    text default 'Website Form',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table public.form_submissions (
  id         uuid primary key default gen_random_uuid(),
  form_id    uuid not null references public.custom_forms(id) on delete cascade,
  data_json  jsonb not null,
  ip_address text,
  lead_id    uuid references public.leads(id) on delete set null, -- set once converted into a lead
  created_at timestamptz not null default now()
);
create index idx_form_submissions_form on public.form_submissions (form_id);

-- ---------- HR: attendance & leave ----------
create table public.attendance_records (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  check_in     timestamptz not null default now(),
  check_out    timestamptz,
  status       text not null default 'PRESENT',
  location_gps text
);
create index idx_attendance_profile on public.attendance_records (profile_id, check_in);

create table public.leave_requests (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  leave_type  text not null, -- CASUAL, SICK, PAID
  start_date  date not null,
  end_date    date not null,
  reason      text,
  status      text not null default 'PENDING', -- PENDING, APPROVED, REJECTED
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index idx_leave_profile on public.leave_requests (profile_id);

-- ---------- Saved / custom reports (report *definitions*; results are computed live) ----------
create table public.saved_reports (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  report_type text not null, -- 'leads' | 'deals' | 'sales' | 'activity' | 'custom'
  config_json jsonb not null default '{}'::jsonb, -- filters, group-by, date range
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
