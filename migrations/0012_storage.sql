-- ============================================================
-- 0012_storage.sql
-- Supabase Storage buckets + policies for CRM documents and
-- user/tenant avatars & logos.
--
-- Path convention (enforced by policy, not just app code):
--   crm-documents/{tenant_id}/{...file path}
--   avatars/{profile_id}/{...file path}
--   tenant-logos/{tenant_id}/{...file path}
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('crm-documents', 'crm-documents', false, 26214400),   -- 25MB, private
  ('avatars', 'avatars', true, 5242880),                 -- 5MB, public read
  ('tenant-logos', 'tenant-logos', true, 5242880)
on conflict (id) do nothing;

-- ---------- crm-documents: private, tenant-isolated ----------
create policy "crm_documents_select" on storage.objects for select
  using (
    bucket_id = 'crm-documents'
    and (public.is_platform_admin() or (storage.foldername(name))[1] = public.current_tenant_id()::text)
  );

create policy "crm_documents_insert" on storage.objects for insert
  with check (
    bucket_id = 'crm-documents'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
  );

create policy "crm_documents_update" on storage.objects for update
  using (bucket_id = 'crm-documents' and (storage.foldername(name))[1] = public.current_tenant_id()::text)
  with check (bucket_id = 'crm-documents' and (storage.foldername(name))[1] = public.current_tenant_id()::text);

create policy "crm_documents_delete" on storage.objects for delete
  using (
    bucket_id = 'crm-documents'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
    and (public.is_tenant_admin_or_manager() or owner = auth.uid())
  );

-- ---------- avatars: public read, owner-only write, path = {profile_id}/... ----------
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- tenant-logos: public read, tenant-admin-only write, path = {tenant_id}/... ----------
create policy "tenant_logos_public_read" on storage.objects for select
  using (bucket_id = 'tenant-logos');

create policy "tenant_logos_admin_write" on storage.objects for insert
  with check (
    bucket_id = 'tenant-logos'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
    and public.is_tenant_admin()
  );

create policy "tenant_logos_admin_update" on storage.objects for update
  using (bucket_id = 'tenant-logos' and (storage.foldername(name))[1] = public.current_tenant_id()::text and public.is_tenant_admin())
  with check (bucket_id = 'tenant-logos' and (storage.foldername(name))[1] = public.current_tenant_id()::text and public.is_tenant_admin());

create policy "tenant_logos_admin_delete" on storage.objects for delete
  using (bucket_id = 'tenant-logos' and (storage.foldername(name))[1] = public.current_tenant_id()::text and public.is_tenant_admin());
