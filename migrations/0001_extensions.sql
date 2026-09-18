-- ============================================================
-- 0001_extensions.sql
-- Core Postgres extensions required by the schema
-- ============================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "uuid-ossp";  -- fallback uuid helpers
create extension if not exists "pg_trgm";    -- fuzzy/ILIKE search on names, emails, phone
