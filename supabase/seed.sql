-- ====================================================================
-- EMPIRE CRM - SEED DATA FOR DEMO & TESTING
-- File: supabase/seed.sql
-- ====================================================================

-- Demo Tenant
INSERT INTO public.tenants (id, name, slug, status, industry)
VALUES ('00000000-0000-0000-0000-000000000001', 'Empire CRM Enterprise', 'empire-demo', 'ACTIVE', 'Financial Services')
ON CONFLICT (slug) DO NOTHING;

-- Default Roles
INSERT INTO public.roles (id, tenant_id, name, description, permissions, is_default)
VALUES 
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'TENANT_ADMIN', 'Workspace Administrator', '["*"]'::jsonb, true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MANAGER', 'Sales Manager', '["LEADS_VIEW", "LEADS_CREATE", "DEALS_VIEW", "DEALS_MANAGE"]'::jsonb, false),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'SALES', 'Sales Representative', '["LEADS_VIEW", "LEADS_CREATE"]'::jsonb, false)
ON CONFLICT DO NOTHING;

-- Plans
INSERT INTO public.plans (id, name, description, max_users, max_leads, max_customers, price)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'STARTER', 'Starter Plan for Small Teams', 5, 1000, 500, 49),
  ('00000000-0000-0000-0000-000000000006', 'PRO', 'Pro Plan for Growing Businesses', 25, 10000, 5000, 149)
ON CONFLICT (name) DO NOTHING;

-- Pipelines & Pipeline Stages
INSERT INTO public.pipelines (id, tenant_id, name, is_default)
VALUES ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Standard Sales Pipeline', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.pipeline_stages (id, tenant_id, pipeline_id, name, stage_key, stage_order, color, probability)
VALUES 
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'New Lead', 'new', 1, '#3b82f6', 10),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'Contacted', 'contacted', 2, '#f59e0b', 30),
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'Qualified', 'qualified', 3, '#8b5cf6', 60),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'Closed Won', 'won', 4, '#10b981', 100)
ON CONFLICT DO NOTHING;

-- Demo Leads
INSERT INTO public.leads (tenant_id, lead_code, customer_name, phone, email, city, amount, status, source)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'EMP-LD-1001', 'Rajesh Sharma', '+91 9876543210', 'rajesh@example.com', 'Mumbai', 500000, 'New', 'Website'),
  ('00000000-0000-0000-0000-000000000001', 'EMP-LD-1002', 'Anita Desai', '+91 9812345678', 'anita@example.com', 'Delhi', 750000, 'Contacted', 'Referral'),
  ('00000000-0000-0000-0000-000000000001', 'EMP-LD-1003', 'Apex Corp', '+91 9988776655', 'info@apexcorp.com', 'Bangalore', 1200000, 'Converted', 'Cold Call')
ON CONFLICT DO NOTHING;
