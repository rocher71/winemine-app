-- 20260519000500_storage_label_photos.sql: private bucket for label photos + per-user folder isolation
-- Source: docs/spec/v0.1.0.md <database_schema>

insert into storage.buckets (id, name, public)
values ('label-photos', 'label-photos', false)
on conflict (id) do nothing;

drop policy if exists "label_photos_own_select" on storage.objects;
create policy "label_photos_own_select" on storage.objects for select
  using (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "label_photos_own_insert" on storage.objects;
create policy "label_photos_own_insert" on storage.objects for insert
  with check (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "label_photos_own_update" on storage.objects;
create policy "label_photos_own_update" on storage.objects for update
  using (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "label_photos_own_delete" on storage.objects;
create policy "label_photos_own_delete" on storage.objects for delete
  using (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text);
