-- Private bucket: service-documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-documents',
  'service-documents',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS
drop policy if exists "Active users read service documents storage" on storage.objects;
drop policy if exists "Admin personel upload service documents storage" on storage.objects;
drop policy if exists "Admin delete service documents storage" on storage.objects;

create policy "Active users read service documents storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'service-documents'
    and public.is_active_user()
  );

create policy "Admin personel upload service documents storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'service-documents'
    and public.is_active_user()
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

create policy "Admin delete service documents storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'service-documents'
    and public.is_admin()
  );
