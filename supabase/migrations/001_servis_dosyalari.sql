-- servis_dosyalari tablosu
create table if not exists public.servis_dosyalari (
  id uuid primary key default gen_random_uuid(),
  dosya_no text not null unique,
  plaka text not null,
  musteri_adi text not null,
  telefon text,
  arac_marka_model text,
  eksper_adi text,
  durum text not null,
  odeme_durumu text not null,
  notlar text,
  created_at timestamptz not null default now()
);

create index if not exists idx_servis_dosyalari_plaka
  on public.servis_dosyalari (plaka);

create index if not exists idx_servis_dosyalari_dosya_no
  on public.servis_dosyalari (dosya_no);

create index if not exists idx_servis_dosyalari_created_at
  on public.servis_dosyalari (created_at desc);

-- Geliştirme için RLS (anon key ile okuma/yazma)
alter table public.servis_dosyalari enable row level security;

create policy "Anon okuma"
  on public.servis_dosyalari for select
  to anon, authenticated
  using (true);

create policy "Anon ekleme"
  on public.servis_dosyalari for insert
  to anon, authenticated
  with check (true);

create policy "Anon güncelleme"
  on public.servis_dosyalari for update
  to anon, authenticated
  using (true);

create policy "Anon silme"
  on public.servis_dosyalari for delete
  to anon, authenticated
  using (true);
