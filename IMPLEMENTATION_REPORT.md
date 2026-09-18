# Empire CRM — Supabase Backend: Implementation Report

## Scope of this delivery

You asked to start with **backend only**: Supabase schema, RLS, and migrations —
because the uploaded project contains a compiled frontend bundle, not editable
source. This delivery covers that scope. Frontend integration is **not**
included yet (see "Not done" below).

Everything was derived from your existing `prisma/schema.prisma` (52 models,
SQLite) and re-modeled as a production Postgres/Supabase schema, extended with
the tables your spec explicitly asked for that weren't in the original schema
(meetings, email templates, notifications, documents, vendors, companies,
teams).

**All 15 migration files were executed against a real local PostgreSQL 16
instance (stubbed with Supabase's `auth`/`storage` schemas and roles) and
verified to run cleanly end-to-end**, including a live two-tenant test:
two separate sign-ups were provisioned, each inserted a lead, and RLS was
confirmed to hide tenant A's data from tenant B's user (and vice versa) while
`get_dashboard_stats()` returned correctly tenant-scoped counts for each.
This is schema/RLS/RPC-level verification — it does not touch the frontend
because there's no frontend source to run.

## Files delivered

```
supabase/
  migrations/
    0001_extensions.sql            pgcrypto, pg_trgm
    0002_platform_and_tenants.sql  tenants, platform_admins, plans, subscriptions, usage_counters, teams
    0003_roles_profiles.sql        roles, profiles (1:1 with auth.users), team_members
    0004_helper_functions.sql      current_tenant_id(), accessible_profile_ids(), role checks
    0005_crm_core.sql              companies, vendors, leads, contacts, customers, pipelines, deals, tasks, notes, activities, custom fields
    0006_meetings_calls_comms.sql  meetings, calls, chat, email_templates, notifications, documents
    0007_extended_modules.sql      projects, service desk, sales targets, campaigns, public forms, HR attendance/leave, saved reports
    0008_integrations_automation.sql  integration catalog, automation engine, api keys, webhooks
    0009_billing_security_settings.sql invoices, payments, security_events, audit_logs, system_settings
    0010_triggers.sql              updated_at triggers, auto-profile-on-signup, display IDs, usage counters, status-change logging
    0011_rls_policies.sql          RLS enabled + policies on every table
    0012_storage.sql               storage buckets (crm-documents, avatars, tenant-logos) + policies
    0013_rpc_functions.sql         submit_lead_form(), complete_signup_provisioning(), attach_invited_profile(), get_dashboard_stats(), mark_notification_read()
    0014_seed_catalog.sql          plans, integration catalog, CRM templates (production-safe, no fake tenant data)
    0015_grants.sql                explicit table/function grants for anon/authenticated/service_role
  services/                        thin TypeScript data-layer examples (supabase-js) for auth, leads, dashboard — a starting pattern, not the full data layer
  .env.example
```

## Tables created (56 total)

**Platform/billing:** tenants, platform_admins, plans, subscriptions,
tenant_features, usage_counters, invoices, payments

**Identity/RBAC:** roles, profiles, teams, team_members

**Core CRM:** companies, vendors, lead_sources, lead_labels, leads,
lead_activities, follow_ups, customers, contacts, pipelines, pipeline_stages,
deals, custom_fields, custom_field_values, tasks, notes, activities

**Scheduling/comms:** meetings, meeting_attendees, call_logs, chat_messages,
email_templates, notifications, documents

**Extended modules:** projects, project_tasks, project_milestones,
service_records, sales_targets, campaigns, custom_forms, form_submissions,
attendance_records, leave_requests, saved_reports

**Platform tooling:** crm_templates, tenant_modules, integrations,
integration_credentials, integration_logs, automation_rules,
automation_logs, api_keys, webhook_endpoints

**Ops:** security_events, audit_logs, system_settings

**Not reimplemented:** `RefreshToken`, `PasswordResetToken`,
`EmailVerificationToken` from the old Prisma schema — Supabase Auth
(`auth.users`, sessions, password-reset emails) replaces all three natively.

## Authentication design

- Supabase Auth (`auth.users`) owns credentials. We never store or touch
  passwords ourselves — the old `password` column and bcrypt logic in
  `src/controllers/*Auth.controller.ts` goes away entirely.
- `public.profiles` is the 1:1 "app user" row, linked by matching primary key
  to `auth.users.id`.
- **Signup flow (fixes the old `/api/v1/auth/signup` 500):**
  1. Client calls `supabase.auth.signUp({ email, password })` — no metadata.
  2. Immediately after (session now exists), client calls the
     `complete_signup_provisioning(tenant_name, slug, full_name)` RPC, which
     atomically creates the tenant, three default roles (ADMIN/MANAGER/SALES),
     a default profile as ADMIN, a default pipeline with 6 stages, a usage
     counter row, and a TRIAL subscription on the FREE plan.
  3. Inviting teammates into an *existing* tenant is a separate, admin-only
     flow (`attach_invited_profile` RPC), meant to be called from a trusted
     server context (Edge Function using `service_role`) after
     `supabase.auth.admin.inviteUserByEmail(...)`.
- Session persistence, refresh, and protected routes are handled by
  `supabase-js`'s built-in session management (`persistSession: true`,
  `autoRefreshToken: true`) — see `services/supabaseClient.ts`.

## RLS design

- Every business table has `tenant_id` (directly or via a parent join for
  `team_members`/`meeting_attendees`) and RLS is **enabled on all 56 tables**
  — nothing is left open.
- Four helper functions drive every policy: `current_tenant_id()`,
  `current_role_name()`, `is_tenant_admin()` /
  `is_tenant_admin_or_manager()`, and `accessible_profile_ids()` (self, or
  self + direct reports/team for MANAGER, or the whole tenant for ADMIN).
- **ADMIN** — full CRUD on everything in their tenant.
- **MANAGER** — full CRUD on records owned by themself or anyone reporting to
  them (`profiles.manager_id`) or on their team (`profiles.team_id`) — this
  satisfies "managers can access their team's records." *Note: the original
  schema had no manager/team hierarchy at all, so `manager_id` and `team_id`
  are new columns I added to `profiles` to make this possible — confirm this
  matches how you actually want reporting lines modeled.*
- **SALES/other roles** — CRUD limited to records they're assigned to /
  created.
- Deletes are generally restricted to ADMIN/MANAGER even where reads/writes
  are open to everyone, to avoid accidental data loss.
- `platform_admins` (the SaaS operator, separate from any tenant) can read
  across all tenants for support purposes, but cannot write into tenant data
  through RLS — only through the explicit provisioning/billing RPCs.
- Public, unauthenticated lead-capture forms never touch the anon key against
  a table directly — they go through `submit_lead_form()`, a
  `SECURITY DEFINER` RPC scoped to one form's tenant.

## Storage

Three buckets, all RLS-protected by folder-prefix convention:
- `crm-documents` (private) — path `{tenant_id}/...`
- `avatars` (public read) — path `{profile_id}/...`
- `tenant-logos` (public read, admin-write) — path `{tenant_id}/...`

## Dashboard statistics

`get_dashboard_stats()` is a `SECURITY INVOKER` RPC — it runs under the
caller's own RLS, so a SALES rep calling it gets stats for *their* leads/deals
only, while an ADMIN gets tenant-wide numbers, with zero duplicated
filtering logic between the RPC and the RLS policies.

## What's genuinely done vs. not

**Done and verified:** schema, RLS, storage policies, triggers, core RPCs,
seed catalog, multi-tenant isolation (tested live).

**Not done (needs your input to proceed):**
1. **Frontend integration** — blocked on missing source, as discussed. The
   `services/` folder has 3 example files (auth, leads, dashboard) showing the
   intended pattern (`supabase-js` calls, RLS does the filtering, no manual
   `tenant_id` checks needed client-side) — this is a starting pattern, not
   a full data layer for all ~20 modules.
2. **Encryption for `integration_credentials.config_enc`** — the column
   exists but actual encryption (e.g. via `pgsodium`/Vault, or app-side AES
   before insert) isn't wired up yet.
3. **Notification-sending logic** — the `notifications` table and RLS exist;
   nothing yet inserts rows on lead/deal/task events (would be automation
   rules or triggers you'd add per event).
4. **PHP gateway (`api.php`) / Hostinger deploy scripts** — untouched; once
   the frontend is rebuilt against Supabase directly, this proxy layer to the
   Node/Prisma backend can likely be retired.

## Environment variables

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY   # server/edge-function only, never in frontend bundle
```

## How to run the migrations

**Option A — Supabase CLI (recommended):**
```bash
supabase link --project-ref YOUR_PROJECT_REF
cp -r supabase/migrations ./supabase/migrations   # if not already at repo root
supabase db push
```

**Option B — psql directly against your project's connection string:**
```bash
for f in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```
Run them **in filename order** (`0001` → `0015`) — later files depend on
tables/functions created earlier.

After migrating, create the three storage buckets' public/private settings
match what's in `0012_storage.sql` (the SQL creates them, but double-check in
Dashboard → Storage that `crm-documents` is private and the other two are
public, since bucket visibility is also enforceable in the dashboard UI).

## Next step

Once you're ready to move to the frontend: the cleanest path, given there's
no original source, is either (a) you locate/export the real `.tsx` source
from wherever it was originally built, or (b) we rebuild the UI module by
module against this schema. Let me know which and I'll proceed.
