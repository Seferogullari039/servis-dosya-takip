-- Profil rolü
do $$ begin
  create type public.user_role as enum ('admin', 'personel');
exception
  when duplicate_object then null;
end $$;

-- Profiller tablosu
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'personel',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_is_active on public.profiles (is_active);

-- Yeni auth kullanıcısı → otomatik profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
begin
  meta_role := new.raw_user_meta_data ->> 'role';

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Kullanıcı'
    ),
    case
      when meta_role in ('admin', 'personel') then meta_role::public.user_role
      else 'personel'::public.user_role
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Admin kontrolü (RLS içinde kullanılır)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'::public.user_role
      and is_active = true
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

-- profiles RLS
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;

create policy "Users read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Admins read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

create policy "Users update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (
      select p.role from public.profiles p where p.id = auth.uid()
    )
    and is_active = (
      select p.is_active from public.profiles p where p.id = auth.uid()
    )
  );

create policy "Admins manage profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
