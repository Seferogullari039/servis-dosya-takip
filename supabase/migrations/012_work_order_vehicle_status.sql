-- Araç durum takibi
alter table public.work_orders
  add column if not exists vehicle_status text not null default 'Kabul Edildi';

alter table public.work_orders
  drop constraint if exists work_orders_vehicle_status_check;

alter table public.work_orders
  add constraint work_orders_vehicle_status_check
  check (
    vehicle_status in (
      'Kabul Edildi',
      'Ekspertizde',
      'Parça Bekleniyor',
      'İşlemde',
      'Hazır',
      'Teslim Edildi'
    )
  );

create index if not exists work_orders_vehicle_status_idx
  on public.work_orders (vehicle_status);

create index if not exists work_orders_entry_date_idx
  on public.work_orders (entry_date desc);

comment on column public.work_orders.vehicle_status is
  'Servisteki aracın operasyonel durumu';
