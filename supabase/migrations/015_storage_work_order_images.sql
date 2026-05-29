-- Public bucket: iş emri hasar görselleri (public URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-order-images',
  'work-order-images',
  true,
  10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read work order images storage" on storage.objects;
drop policy if exists "Admin personel upload work order images storage" on storage.objects;
drop policy if exists "Admin delete work order images storage" on storage.objects;

create policy "Public read work order images storage"
  on storage.objects
  for select
  to public
  using (bucket_id = 'work-order-images');

create policy "Admin personel upload work order images storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'work-order-images'
    and public.is_active_user()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

create policy "Admin delete work order images storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'work-order-images'
    and public.is_admin()
  );
