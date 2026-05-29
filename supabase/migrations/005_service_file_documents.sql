-- Evrak kategorisi
do $$ begin
  create type public.document_category as enum (
    'eksper',
    'evrak',
    'odeme',
    'fotograf',
    'diger'
  );
exception
  when duplicate_object then null;
end $$;

-- Timeline: evrak yükleme event tipi
do $$ begin
  alter type public.service_file_event_type add value 'document_uploaded';
exception
  when duplicate_object then null;
end $$;

-- Evrak metadata tablosu (soft delete hazır)
create table if not exists public.service_file_documents (
  id uuid primary key default gen_random_uuid(),
  service_file_id uuid not null references public.servis_dosyalari (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  file_name text not null,
  original_name text not null,
  file_type text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  storage_path text not null unique,
  category public.document_category not null default 'diger',
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_file_documents_file_id
  on public.service_file_documents (service_file_id)
  where deleted_at is null;

create index if not exists idx_service_file_documents_category
  on public.service_file_documents (service_file_id, category)
  where deleted_at is null;

-- Merkezi evrak kaydı insert
create or replace function public.insert_service_file_document(
  p_service_file_id uuid,
  p_file_name text,
  p_original_name text,
  p_file_type text,
  p_mime_type text,
  p_file_size bigint,
  p_storage_path text,
  p_category public.document_category
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_document_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Kimlik doğrulaması gerekli';
  end if;

  if not public.is_active_user() then
    raise exception 'Aktif kullanıcı değilsiniz';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin'::public.user_role, 'personel'::public.user_role)
  ) then
    raise exception 'Yükleme yetkiniz yok';
  end if;

  if not exists (
    select 1 from public.servis_dosyalari where id = p_service_file_id
  ) then
    raise exception 'Servis dosyası bulunamadı';
  end if;

  insert into public.service_file_documents (
    service_file_id,
    uploaded_by,
    file_name,
    original_name,
    file_type,
    mime_type,
    file_size,
    storage_path,
    category
  )
  values (
    p_service_file_id,
    auth.uid(),
    p_file_name,
    p_original_name,
    p_file_type,
    p_mime_type,
    p_file_size,
    p_storage_path,
    p_category
  )
  returning id into v_document_id;

  return v_document_id;
end;
$$;

-- Soft delete (admin)
create or replace function public.soft_delete_service_file_document(
  p_document_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Silme yetkisi yalnızca yöneticide';
  end if;

  update public.service_file_documents
  set deleted_at = now()
  where id = p_document_id
    and deleted_at is null;

  if not found then
    raise exception 'Evrak bulunamadı';
  end if;
end;
$$;

revoke all on public.service_file_documents from anon;
revoke delete on public.service_file_documents from authenticated;

grant select on public.service_file_documents to authenticated;
grant execute on function public.insert_service_file_document to authenticated;
grant execute on function public.soft_delete_service_file_document to authenticated;

alter table public.service_file_documents enable row level security;

drop policy if exists "Active users read documents" on public.service_file_documents;
drop policy if exists "Admin personel insert documents" on public.service_file_documents;
drop policy if exists "Admin update documents" on public.service_file_documents;

create policy "Active users read documents"
  on public.service_file_documents
  for select
  to authenticated
  using (public.is_active_user() and deleted_at is null);

create policy "Admin personel insert documents"
  on public.service_file_documents
  for insert
  to authenticated
  with check (
    public.is_active_user()
    and uploaded_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin'::public.user_role, 'personel'::public.user_role)
    )
  );

create policy "Admin update documents"
  on public.service_file_documents
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
