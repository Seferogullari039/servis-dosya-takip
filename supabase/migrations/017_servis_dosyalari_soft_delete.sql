-- Soft delete: servis dosyaları
alter table public.servis_dosyalari
  add column if not exists deleted_at timestamptz;

comment on column public.servis_dosyalari.deleted_at is
  'Soft delete zamanı; null = aktif kayıt';

create index if not exists idx_servis_dosyalari_active
  on public.servis_dosyalari (created_at desc)
  where deleted_at is null;

-- Aktif kayıtlar listelenir
drop policy if exists "Authenticated read servis dosyalari" on public.servis_dosyalari;
create policy "Authenticated read servis dosyalari"
  on public.servis_dosyalari
  for select
  to authenticated
  using (public.is_active_user() and deleted_at is null);
