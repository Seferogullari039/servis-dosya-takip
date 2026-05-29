-- Dashboard test verileri (migration 004+ sonrası, mevcut dosyalar üzerine)
-- Eski tarihli status_changed eventleri → geciken dosya simülasyonu

with hedef as (
  select id, dosya_no, durum
  from public.servis_dosyalari
  where durum not in ('Kapandı', 'Tamamlandı')
  order by created_at desc
  limit 3
),
admin_user as (
  select id from public.profiles where is_active = true limit 1
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
  h.id,
  u.id,
  'status_changed'::public.service_file_event_type,
  'Durum güncellendi',
  'Test: gecikme simülasyonu',
  jsonb_build_object('durum', 'Yeni Açıldı'),
  jsonb_build_object('durum', h.durum),
  v.created_at
from hedef h
cross join admin_user u
cross join (
  values
    (now() - interval '10 days'),
    (now() - interval '16 days'),
    (now() - interval '8 days')
) as v(created_at)
where exists (select 1 from admin_user)
on conflict do nothing;

-- Ödeme hareketi örnekleri (son 7 gün)
with hedef as (
  select id from public.servis_dosyalari limit 2
),
admin_user as (
  select id from public.profiles where is_active = true limit 1
)
insert into public.service_file_events (
  service_file_id, user_id, event_type, title, description,
  old_value, new_value, created_at
)
select
  h.id, u.id, 'payment_changed'::public.service_file_event_type,
  'Ödeme durumu değiştirildi',
  'Test ödeme hareketi',
  '{"odeme_durumu":"Ödenmedi"}'::jsonb,
  '{"odeme_durumu":"Kısmi Ödendi"}'::jsonb,
  now() - (n || ' days')::interval
from hedef h
cross join admin_user u
cross join generate_series(0, 1) as n
where exists (select 1 from admin_user);
