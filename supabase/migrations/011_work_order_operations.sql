-- Operasyon paneli: ekspertiz checklist + işçilik kalemleri
alter table public.work_orders
  add column if not exists expertise_checklist jsonb not null default '[]'::jsonb,
  add column if not exists labor_items jsonb not null default '[]'::jsonb;

comment on column public.work_orders.expertise_checklist is
  'Ekspertiz kontrol listesi: [{ key, label, checked, note }]';

comment on column public.work_orders.labor_items is
  'İşçilik satırları: [{ id, aciklama, tutar }]';

-- parts jsonb içinde status ve arrived alanları uygulama katmanında tutulur
