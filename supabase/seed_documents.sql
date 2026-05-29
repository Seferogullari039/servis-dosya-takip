-- Test evrak metadata (Storage'da dosya yoksa indirme çalışmaz; UI listesi için)
with dosya as (
  select id from public.servis_dosyalari order by created_at desc limit 1
),
uploader as (
  select id from public.profiles where is_active = true limit 1
)
insert into public.service_file_documents (
  service_file_id,
  uploaded_by,
  file_name,
  original_name,
  file_type,
  mime_type,
  file_size,
  storage_path,
  category,
  created_at
)
select
  d.id,
  u.id,
  v.file_name,
  v.original_name,
  v.file_type,
  v.mime_type,
  v.file_size,
  d.id::text || '/seed/' || v.file_name,
  v.category::public.document_category,
  v.created_at::timestamptz
from dosya d
cross join uploader u
cross join (
  values
    ('seed-eksper-rapor.pdf', 'eksper-raporu.pdf', 'pdf', 'application/pdf', 245760, 'eksper', (now() - interval '2 days')::text),
    ('seed-odeme-dekont.jpg', 'dekont.jpg', 'image', 'image/jpeg', 512000, 'odeme', (now() - interval '1 day')::text),
    ('seed-arac-foto.webp', 'arac-on.webp', 'image', 'image/webp', 890000, 'fotograf', (now() - interval '6 hours')::text)
) as v(file_name, original_name, file_type, mime_type, file_size, category, created_at)
where exists (select 1 from dosya) and exists (select 1 from uploader)
on conflict (storage_path) do nothing;
