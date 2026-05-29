-- Opsiyonel örnek veriler (SQL Editor'da migration sonrası çalıştırın)
insert into public.servis_dosyalari (
  dosya_no, plaka, musteri_adi, telefon, arac_marka_model, eksper_adi, durum, odeme_durumu, notlar, created_at
) values
  ('SD-2026-0142', '34 ABC 123', 'Ahmet Yılmaz', '0532 111 22 33', 'Volkswagen Passat', 'Mehmet Kaya', 'Tedarik Sürecinde', 'Ödenmedi', 'Ön tampon parçası bekleniyor.', '2026-05-20T10:00:00Z'),
  ('SD-2026-0138', '06 XYZ 456', 'Ayşe Demir', '0533 222 33 44', 'Toyota Corolla', 'Ali Vural', 'Ödeme Bekleniyor', 'Kısmi Ödendi', 'Müşteri kalan ödemeyi cuma günü yapacak.', '2026-05-18T14:30:00Z'),
  ('SD-2026-0135', '35 DEF 789', 'Can Öztürk', '0544 333 44 55', 'Renault Megane', 'Mehmet Kaya', 'Onarımda', 'Ödendi', 'Boyahane işlemi devam ediyor.', '2026-05-15T09:15:00Z'),
  ('SD-2026-0129', '16 GHI 321', 'Elif Korkmaz', '0555 444 55 66', 'Fiat Egea', 'Zeynep Arslan', 'Eksper Sürecinde', 'Ödenmedi', 'Eksper raporu bekleniyor.', '2026-05-12T11:00:00Z'),
  ('SD-2026-0120', '41 JKL 654', 'Burak Şahin', '0536 555 66 77', 'Hyundai i20', 'Ali Vural', 'Evrak Bekleniyor', 'Ödenmedi', 'Ruhsat fotokopisi eksik.', '2026-05-10T08:45:00Z')
on conflict (dosya_no) do nothing;
