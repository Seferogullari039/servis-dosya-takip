-- Güvenlik: işlem kayıtları ve giriş denemeleri

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  user_name text not null default '',
  user_role text,
  action text not null,
  entity_type text,
  entity_id text,
  entity_label text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at
  on public.audit_logs (created_at desc);

create index if not exists idx_audit_logs_user_id
  on public.audit_logs (user_id);

create index if not exists idx_audit_logs_action
  on public.audit_logs (action);

create index if not exists idx_audit_logs_entity
  on public.audit_logs (entity_type, entity_id);

comment on table public.audit_logs is
  'KVKK ve güvenlik: kullanıcı işlem geçmişi (sunucu tarafı yazım).';

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  success boolean not null default false,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_attempts_email_created
  on public.login_attempts (lower(email), created_at desc);

comment on table public.login_attempts is
  'Başarılı/başarısız giriş denemeleri; kilitleme sunucu tarafında değerlendirilir.';

alter table public.audit_logs enable row level security;
alter table public.login_attempts enable row level security;

drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (public.is_admin());

-- Yazım yalnızca service role (RLS bypass); istemci insert yok.

-- login_attempts: authenticated erişim yok (yalnızca service role)
