-- İş emirleri tablosu
create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  work_order_no text not null,
  customer_name text not null,
  phone text,
  plate text not null,
  brand text,
  model text,
  km text,
  entry_date date not null default (current_date),
  expertise_notes text,
  work_description text,
  labor_total numeric(12, 2) not null default 0,
  parts_total numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,
  parts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists work_orders_work_order_no_key
  on public.work_orders (work_order_no);

create index if not exists work_orders_created_at_idx
  on public.work_orders (created_at desc);

create index if not exists work_orders_plate_idx
  on public.work_orders (plate);

alter table public.work_orders enable row level security;

drop policy if exists "Authenticated read work orders" on public.work_orders;
create policy "Authenticated read work orders"
  on public.work_orders
  for select
  to authenticated
  using (public.is_active_user());

drop policy if exists "Admin personel insert work orders" on public.work_orders;
create policy "Admin personel insert work orders"
  on public.work_orders
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

drop policy if exists "Admin personel update work orders" on public.work_orders;
create policy "Admin personel update work orders"
  on public.work_orders
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_active = true
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

drop policy if exists "Admin delete work orders" on public.work_orders;
create policy "Admin delete work orders"
  on public.work_orders
  for delete
  to authenticated
  using (public.is_admin());

revoke all on public.work_orders from anon;
grant select, insert, update, delete on public.work_orders to authenticated;
