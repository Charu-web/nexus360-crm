-- ============================================================
-- 0015_grants.sql
-- Table/sequence/function-level privileges. Supabase projects
-- normally set these as schema defaults automatically, but we
-- grant explicitly here so this migration set is portable and
-- self-contained (safe to re-run; RLS still governs row access —
-- these GRANTs only unlock which statements a role may attempt).
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;              -- narrowed further by each table's RLS policy (most tables have no anon SELECT policy, so this is inert)
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;
grant execute on all functions in schema public to anon;          -- individual functions still require explicit GRANT EXECUTE above to matter; harmless catch-all

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema public grant execute on functions to authenticated, service_role;
