-- İş emri tipi ve ödeme takibi
alter table public.work_orders
  add column if not exists work_order_type text not null default 'Sigortalı İş',
  add column if not exists is_emri_durumu text not null default 'Açık',
  add column if not exists odeme_durumu text not null default 'Ödenmedi',
  add column if not exists tahsil_edilen_tutar numeric(12, 2) not null default 0,
  add column if not exists odeme_notu text;

alter table public.work_orders
  drop constraint if exists work_orders_work_order_type_check;

alter table public.work_orders
  add constraint work_orders_work_order_type_check
  check (
    work_order_type in (
      'Sigortalı İş',
      'Sigortasız / Müşteri Ödemeli İş'
    )
  );

alter table public.work_orders
  drop constraint if exists work_orders_is_emri_durumu_check;

alter table public.work_orders
  add constraint work_orders_is_emri_durumu_check
  check (
    is_emri_durumu in (
      'Açık',
      'Ödenmedi',
      'Kısmi Ödendi',
      'Ödendi',
      'Kapandı'
    )
  );

alter table public.work_orders
  drop constraint if exists work_orders_odeme_durumu_check;

alter table public.work_orders
  add constraint work_orders_odeme_durumu_check
  check (
    odeme_durumu in (
      'Ödenmedi',
      'Kısmi Ödendi',
      'Ödendi',
      'Kapandı'
    )
  );

create index if not exists work_orders_work_order_type_idx
  on public.work_orders (work_order_type);

create index if not exists work_orders_is_emri_durumu_idx
  on public.work_orders (is_emri_durumu);

create index if not exists work_orders_odeme_durumu_idx
  on public.work_orders (odeme_durumu);

comment on column public.work_orders.work_order_type is
  'Sigortalı veya sigortasız müşteri ödemeli iş';
comment on column public.work_orders.is_emri_durumu is
  'İş emri kapanış / ödeme durumu (liste rozeti)';
comment on column public.work_orders.odeme_durumu is
  'Tahsilat / ödeme durumu';
comment on column public.work_orders.tahsil_edilen_tutar is
  'Tahsil edilen tutar (TL)';
comment on column public.work_orders.odeme_notu is
  'Ödeme ile ilgili serbest not';
