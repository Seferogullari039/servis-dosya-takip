-- Soft delete kaldırıldı: okuma politikası deleted_at filtresi olmadan
drop policy if exists "Authenticated read servis dosyalari" on public.servis_dosyalari;
create policy "Authenticated read servis dosyalari"
  on public.servis_dosyalari
  for select
  to authenticated
  using (public.is_active_user());
