-- Sigorta şirketi alanı (servis dosyası)
alter table public.servis_dosyalari
  add column if not exists sigorta_sirketi text;

create index if not exists idx_servis_dosyalari_sigorta_sirketi
  on public.servis_dosyalari (sigorta_sirketi);

comment on column public.servis_dosyalari.sigorta_sirketi is
  'Sigorta şirketi adı (liste veya serbest metin)';
