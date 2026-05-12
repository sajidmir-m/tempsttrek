-- Relax storage RLS for upload buckets (selected scope).
-- This removes role-gated checks so uploads do not fail due to profile role mismatches.
-- Buckets covered: site-media, packages, places, cars, cabs

drop policy if exists "cms_buckets_public_read" on storage.objects;
drop policy if exists "cms_buckets_staff_insert" on storage.objects;
drop policy if exists "cms_buckets_staff_update" on storage.objects;
drop policy if exists "site_media_staff_delete" on storage.objects;
drop policy if exists "cms_buckets_admin_delete" on storage.objects;
drop policy if exists "cms_buckets_staff_delete_catalog" on storage.objects;
drop policy if exists "cms_buckets_open_insert" on storage.objects;
drop policy if exists "cms_buckets_open_update" on storage.objects;
drop policy if exists "cms_buckets_open_delete" on storage.objects;

create policy "cms_buckets_public_read"
on storage.objects
for select
using (bucket_id in ('site-media','packages','places','cars','cabs'));

create policy "cms_buckets_open_insert"
on storage.objects
for insert
with check (bucket_id in ('site-media','packages','places','cars','cabs'));

create policy "cms_buckets_open_update"
on storage.objects
for update
using (bucket_id in ('site-media','packages','places','cars','cabs'))
with check (bucket_id in ('site-media','packages','places','cars','cabs'));

create policy "cms_buckets_open_delete"
on storage.objects
for delete
using (bucket_id in ('site-media','packages','places','cars','cabs'));
