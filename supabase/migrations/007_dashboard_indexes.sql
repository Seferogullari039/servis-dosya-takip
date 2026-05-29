-- Dashboard sorguları için ek indeksler
create index if not exists idx_service_file_events_created_at_desc
  on public.service_file_events (created_at desc);

create index if not exists idx_service_file_events_type_created
  on public.service_file_events (event_type, created_at desc);

create index if not exists idx_servis_dosyalari_durum
  on public.servis_dosyalari (durum);

create index if not exists idx_servis_dosyalari_odeme
  on public.servis_dosyalari (odeme_durumu);

create index if not exists idx_servis_dosyalari_created_at_day
  on public.servis_dosyalari (created_at desc);
