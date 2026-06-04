-- Servis dosyası durumları: pert süreçleri (mevcut kayıtlar değişmez; yalnızca yeni değerler için doğrulama)

alter table public.servis_dosyalari
  drop constraint if exists servis_dosyalari_durum_check;

alter table public.servis_dosyalari
  add constraint servis_dosyalari_durum_check
  check (
    durum in (
      'Yeni Açıldı',
      'Evrak Bekleniyor',
      'Eksper Sürecinde',
      'Tedarik Sürecinde',
      'Onarımda',
      'Pert İncelemesinde',
      'Pert Onaylandı',
      'Ödeme Bekleniyor',
      'Tamamlandı',
      'Kapandı'
    )
  );

comment on constraint servis_dosyalari_durum_check on public.servis_dosyalari is
  'İzin verilen servis dosyası durumları (pert dahil)';
