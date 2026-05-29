-- Test timeline verileri (SQL Editor — migration 004 sonrası)
-- Mevcut ilk servis dosyası ve ilk admin profiline örnek eventler ekler.

with dosya as (
  select id from public.servis_dosyalari order by created_at desc limit 1
),
admin_user as (
  select id from public.profiles where role = 'admin' and is_active = true limit 1
)
insert into public.service_file_events (
  service_file_id,
  user_id,
  event_type,
  title,
  description,
  old_value,
  new_value,
  created_at
)
select
  d.id,
  u.id,
  v.event_type::public.service_file_event_type,
  v.title,
  v.description,
  v.old_value::jsonb,
  v.new_value::jsonb,
  v.created_at::timestamptz
from dosya d
cross join admin_user u
cross join (
  values
    (
      'created',
      'Dosya oluşturuldu',
      'Servis dosyası sisteme kaydedildi.',
      null::text,
      '{"durum":"Yeni Açıldı","odeme_durumu":"Ödenmedi"}'::text,
      (now() - interval '5 days')::text
    ),
    (
      'status_changed',
      'Durum güncellendi',
      'Durum ''Evrak Bekleniyor'' olarak güncellendi.',
      '{"durum":"Yeni Açıldı"}'::text,
      '{"durum":"Evrak Bekleniyor"}'::text,
      (now() - interval '4 days')::text
    ),
    (
      'status_changed',
      'Durum güncellendi',
      'Durum ''Onarımda'' olarak güncellendi.',
      '{"durum":"Evrak Bekleniyor"}'::text,
      '{"durum":"Onarımda"}'::text,
      (now() - interval '2 days')::text
    ),
    (
      'payment_changed',
      'Ödeme durumu değiştirildi',
      'Ödeme durumu ''Kısmi Ödendi'' olarak güncellendi.',
      '{"odeme_durumu":"Ödenmedi"}'::text,
      '{"odeme_durumu":"Kısmi Ödendi"}'::text,
      (now() - interval '1 day')::text
    ),
    (
      'note_added',
      'Not eklendi',
      'Dosya notları güncellendi.',
      null::text,
      '{"notlar":"Parça tedariki bekleniyor."}'::text,
      (now() - interval '6 hours')::text
    )
) as v(event_type, title, description, old_value, new_value, created_at)
where exists (select 1 from dosya) and exists (select 1 from admin_user);
