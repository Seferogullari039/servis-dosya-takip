-- Müşteri dijital imzası (PNG base64 data URL)
alter table public.work_orders
  add column if not exists customer_signature text;

comment on column public.work_orders.customer_signature is
  'Müşteri dijital imzası (image/png base64 data URL)';
