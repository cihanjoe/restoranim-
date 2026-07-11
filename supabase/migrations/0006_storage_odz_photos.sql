-- ============================================================
-- Storage bucket: ODZ ziyaret fotoğrafları
-- ============================================================

-- Bucket oluştur (Supabase Dashboard'dan da yapılabilir)
insert into storage.buckets (id, name, public)
values ('odz-photos', 'odz-photos', false)
on conflict (id) do nothing;

-- Authenticated kullanıcılar kendi tenant'ına ait dosyaları yükleyebilsin
create policy "odz_photos_insert" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'odz-photos');

create policy "odz_photos_select" on storage.objects for select
  to authenticated
  using (bucket_id = 'odz-photos');

create policy "odz_photos_delete" on storage.objects for delete
  to authenticated
  using (bucket_id = 'odz-photos');
