-- Hareket geçmişi event tipi
do $$ begin
  create type public.service_file_event_type as enum (
    'created',
    'updated',
    'status_changed',
    'payment_changed',
    'note_added',
    'expert_assigned'
  );
exception
  when duplicate_object then null;
end $$;

-- Timeline / audit tablosu
create table if not exists public.service_file_events (
  id uuid primary key default gen_random_uuid(),
  service_file_id uuid not null references public.servis_dosyalari (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  event_type public.service_file_event_type not null,
  title text not null,
  description text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_file_events_file_id
  on public.service_file_events (service_file_id);

create index if not exists idx_service_file_events_created_at
  on public.service_file_events (service_file_id, created_at desc);

create index if not exists idx_service_file_events_user_id
  on public.service_file_events (user_id);

-- Merkezi event insert (yalnızca bu fonksiyon üzerinden yazım)
create or replace function public.insert_service_file_event(
  p_service_file_id uuid,
  p_event_type public.service_file_event_type,
  p_title text,
  p_description text default null,
  p_old_value jsonb default null,
  p_new_value jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Kimlik doğrulaması gerekli';
  end if;

  if not public.is_active_user() then
    raise exception 'Aktif kullanıcı değilsiniz';
  end if;

  if not exists (
    select 1 from public.servis_dosyalari where id = p_service_file_id
  ) then
    raise exception 'Servis dosyası bulunamadı';
  end if;

  insert into public.service_file_events (
    service_file_id,
    user_id,
    event_type,
    title,
    description,
    old_value,
    new_value
  )
  values (
    p_service_file_id,
    auth.uid(),
    p_event_type,
    p_title,
    p_description,
    p_old_value,
    p_new_value
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on public.service_file_events from anon;
revoke insert, update, delete on public.service_file_events from authenticated;

grant select on public.service_file_events to authenticated;
grant execute on function public.insert_service_file_event(
  uuid,
  public.service_file_event_type,
  text,
  text,
  jsonb,
  jsonb
) to authenticated;

alter table public.service_file_events enable row level security;

drop policy if exists "Active users read service file events" on public.service_file_events;

create policy "Active users read service file events"
  on public.service_file_events
  for select
  to authenticated
  using (public.is_active_user());
