-- Eski geliştirme (anon) politikalarını kaldır
drop policy if exists "Anon okuma" on public.servis_dosyalari;
drop policy if exists "Anon ekleme" on public.servis_dosyalari;
drop policy if exists "Anon güncelleme" on public.servis_dosyalari;
drop policy if exists "Anon silme" on public.servis_dosyalari;

-- Kimlik doğrulanmış + aktif profil: okuma
drop policy if exists "Authenticated read servis dosyalari" on public.servis_dosyalari;
create policy "Authenticated read servis dosyalari"
  on public.servis_dosyalari
  for select
  to authenticated
  using (public.is_active_user());

-- Admin + personel: oluşturma
drop policy if exists "Admin personel insert servis dosyalari" on public.servis_dosyalari;
create policy "Admin personel insert servis dosyalari"
  on public.servis_dosyalari
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

-- Admin + personel: güncelleme
drop policy if exists "Admin personel update servis dosyalari" on public.servis_dosyalari;
create policy "Admin personel update servis dosyalari"
  on public.servis_dosyalari
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

-- Sadece admin: silme
drop policy if exists "Admin delete servis dosyalari" on public.servis_dosyalari;
create policy "Admin delete servis dosyalari"
  on public.servis_dosyalari
  for delete
  to authenticated
  using (public.is_admin());

revoke all on public.servis_dosyalari from anon;
grant select, insert, update, delete on public.servis_dosyalari to authenticated;
