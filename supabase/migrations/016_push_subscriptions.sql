-- FCM push abonelikleri (PWA / iOS Ana Ekran)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_type text not null default 'unknown',
  fcm_token text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint push_subscriptions_device_type_check check (
    device_type in ('ios', 'android', 'web', 'unknown')
  )
);

create unique index if not exists push_subscriptions_user_token_key
  on public.push_subscriptions (user_id, fcm_token);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

create index if not exists push_subscriptions_last_seen_idx
  on public.push_subscriptions (last_seen_at desc);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users read own push subscriptions" on public.push_subscriptions;
create policy "Users read own push subscriptions"
  on public.push_subscriptions
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users insert own push subscriptions" on public.push_subscriptions;
create policy "Users insert own push subscriptions"
  on public.push_subscriptions
  for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users update own push subscriptions" on public.push_subscriptions;
create policy "Users update own push subscriptions"
  on public.push_subscriptions
  for update
  to authenticated
  using (user_id = auth.uid() and public.is_active_user())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own push subscriptions" on public.push_subscriptions;
create policy "Users delete own push subscriptions"
  on public.push_subscriptions
  for delete
  to authenticated
  using (user_id = auth.uid());

revoke all on public.push_subscriptions from anon;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
