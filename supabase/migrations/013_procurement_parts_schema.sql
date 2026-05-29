-- Sigorta tedarik takibi: parts jsonb alan şeması (uygulama katmanı)
-- Her parça: procurement_status, shipment_date, arrival_date,
-- purchased_by_service, unit_price, total_price, procurement_note
-- (+ parcaAdi, adet, id)

comment on column public.work_orders.parts is
  'Sigorta tedarik parça listesi (jsonb). Örnek: {"id","parcaAdi","adet","procurement_status","shipment_date","arrival_date","purchased_by_service","unit_price","total_price","procurement_note"}';
