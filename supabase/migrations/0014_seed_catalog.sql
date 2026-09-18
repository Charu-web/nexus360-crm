-- ============================================================
-- 0014_seed_catalog.sql
-- PRODUCTION seed data: global catalogs only (plans, integration
-- catalog, CRM templates). No tenant-specific or fake data here.
-- ============================================================

insert into public.plans (name, display_name, description, price_monthly, price_yearly, user_limit, lead_limit, storage_limit_mb, custom_fields, custom_pipeline, automations, white_label, api_access)
values
  ('FREE',       'Free',       'Get started with the basics',            0,     0,      3,   500,    500,  false, false, false, false, false),
  ('STARTER',    'Starter',    'For small sales teams',                  999,   9999,   10,  5000,   5000,  true,  false, false, false, false),
  ('PRO',        'Pro',        'Full pipeline & automation tooling',     2499,  24999,  25,  25000,  20000, true,  true,  true,  false, true),
  ('BUSINESS',   'Business',   'For growing multi-team organizations',   4999,  49999,  75,  100000, 50000, true,  true,  true,  true,  true),
  ('ENTERPRISE', 'Enterprise', 'Custom limits, SSO, dedicated support',  0,     0,      999999, 999999, 999999, true, true, true, true, true)
on conflict (name) do nothing;

insert into public.integrations (provider_key, name, category, description)
values
  ('FACEBOOK_ADS', 'Facebook Lead Ads', 'Lead Capture', 'Sync leads from Facebook/Instagram lead forms'),
  ('GOOGLE_ADS',   'Google Ads',        'Lead Capture', 'Sync leads from Google Lead Form extensions'),
  ('INDIAMART',    'IndiaMART',         'Lead Capture', 'Pull B2B buy-leads from IndiaMART'),
  ('JUSTDIAL',     'JustDial',          'Lead Capture', 'Pull leads from JustDial listings'),
  ('WHATSAPP',     'WhatsApp Business', 'Messaging',    'Send/receive WhatsApp messages tied to CRM records'),
  ('SMTP',         'Email (SMTP)',      'Email',        'Send transactional and campaign email via your own SMTP'),
  ('SMS',          'SMS Gateway',       'Messaging',    'Send SMS notifications and campaigns')
on conflict (provider_key) do nothing;

insert into public.crm_templates (key, name, description, modules_json, pipeline_json, fields_json)
values
  ('STANDARD', 'Standard CRM', 'General-purpose sales CRM', '["leads","deals","contacts","tasks"]'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('REAL_ESTATE', 'Real Estate', 'Property leads & site-visit pipeline', '["leads","deals","projects"]'::jsonb, '[]'::jsonb, '[]'::jsonb),
  ('EDUCATION', 'Education', 'Admissions/enrollment pipeline', '["leads","deals","tasks"]'::jsonb, '[]'::jsonb, '[]'::jsonb)
on conflict (key) do nothing;
