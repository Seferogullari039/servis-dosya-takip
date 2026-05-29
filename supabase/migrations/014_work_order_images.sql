-- Hasar / iş emri görselleri metadata
create table if not exists public.work_order_images (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  category text not null,
  note text,
  created_at timestamptz not null default now(),
  constraint work_order_images_category_check check (
    category in (
      'Hasar',
      'Araç Genel',
      'Ekspertiz',
      'Parça',
      'Teslim Öncesi',
      'Teslim Sonrası'
    )
  )
);

create unique index if not exists work_order_images_storage_path_key
  on public.work_order_images (storage_path);

create index if not exists work_order_images_work_order_id_idx
  on public.work_order_images (work_order_id);

create index if not exists work_order_images_category_idx
  on public.work_order_images (work_order_id, category);

create index if not exists work_order_images_created_at_idx
  on public.work_order_images (created_at desc);

alter table public.work_order_images enable row level security;

drop policy if exists "Authenticated read work order images" on public.work_order_images;
create policy "Authenticated read work order images"
  on public.work_order_images
  for select
  to authenticated
  using (public.is_active_user());

drop policy if exists "Admin personel insert work order images" on public.work_order_images;
create policy "Admin personel insert work order images"
  on public.work_order_images
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

drop policy if exists "Admin delete work order images" on public.work_order_images;
create policy "Admin delete work order images"
  on public.work_order_images
  for delete
  to authenticated
  using (public.is_admin());

revoke all on public.work_order_images from anon;
grant select, insert, delete on public.work_order_images to authenticated;
