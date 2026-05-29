-- Dosya tutarı ve tahsilat takibi
alter table public.servis_dosyalari
  add column if not exists dosya_tutari numeric(14, 2) check (dosya_tutari is null or dosya_tutari >= 0),
  add column if not exists odenen_tutar numeric(14, 2) not null default 0 check (odenen_tutar >= 0);

create index if not exists idx_servis_dosyalari_odenen_tutar
  on public.servis_dosyalari (odenen_tutar desc)
  where odenen_tutar > 0;
