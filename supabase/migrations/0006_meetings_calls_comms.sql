-- ============================================================
-- 0006_meetings_calls_comms.sql
-- Meetings/appointments, calls, chat, email templates,
-- notifications, documents
-- ============================================================

-- ---------- Meetings / Appointments ----------
create table public.meetings (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  title        text not null,
  description  text,
  start_time   timestamptz not null,
  end_time     timestamptz not null,
  location     text,
  meeting_link text,
  status       text not null default 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
  lead_id      uuid references public.leads(id) on delete set null,
  contact_id   uuid references public.contacts(id) on delete set null,
  deal_id      uuid references public.deals(id) on delete set null,
  owner_id     uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_meetings_tenant on public.meetings (tenant_id, start_time);
create index idx_meetings_owner on public.meetings (owner_id);

create table public.meeting_attendees (
  id         uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  rsvp       text default 'PENDING', -- PENDING, ACCEPTED, DECLINED
  check (profile_id is not null or contact_id is not null)
);
create unique index uq_meeting_attendee_profile on public.meeting_attendees (meeting_id, profile_id) where profile_id is not null;
create unique index uq_meeting_attendee_contact on public.meeting_attendees (meeting_id, contact_id) where contact_id is not null;

-- ---------- Calls ----------
create table public.call_logs (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  agent_id       uuid not null references public.profiles(id) on delete cascade,
  lead_id        uuid references public.leads(id) on delete set null,
  customer_id    uuid references public.customers(id) on delete set null,
  call_type      text not null default 'OUTGOING', -- INCOMING, OUTGOING, MISSED
  duration_sec   integer not null default 0,
  recording_url  text,
  notes          text,
  created_at     timestamptz not null default now()
);
create index idx_calls_tenant on public.call_logs (tenant_id, created_at desc);
create index idx_calls_agent on public.call_logs (agent_id);
create index idx_calls_lead on public.call_logs (lead_id);

-- ---------- Internal chat ----------
create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content     text not null,
  attachment_url text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index idx_chat_participants on public.chat_messages (tenant_id, sender_id, receiver_id, created_at);

-- ---------- Email templates ----------
create table public.email_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  subject     text not null,
  body_html   text not null,
  category    text default 'General',
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_email_templates_tenant on public.email_templates (tenant_id);

-- ---------- Notifications ----------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade, -- recipient
  title       text not null,
  body        text,
  type        text not null default 'INFO', -- INFO, TASK, LEAD, DEAL, SYSTEM
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index idx_notifications_recipient on public.notifications (profile_id, is_read, created_at desc);

-- ---------- Documents (metadata; binary lives in Supabase Storage) ----------
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  file_name    text not null,
  storage_path text not null,     -- path within the 'crm-documents' bucket
  mime_type    text,
  size_bytes   bigint,
  lead_id      uuid references public.leads(id) on delete cascade,
  customer_id  uuid references public.customers(id) on delete cascade,
  deal_id      uuid references public.deals(id) on delete cascade,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  is_deleted   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index idx_documents_tenant on public.documents (tenant_id);
create index idx_documents_lead on public.documents (lead_id);
