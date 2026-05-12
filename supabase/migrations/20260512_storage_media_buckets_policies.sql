-- Storage RLS for site homepage + CMS uploads.
-- Create these buckets in Supabase Dashboard (public buckets recommended):
--   site-media   — homepage hero videos, hero images, split panels
--   packages     — package featured images
--   places       — place hero images
--   cars         — car rental images
--   cabs         — optional cab visuals if added later

-- Public read (site loads assets without login)
drop policy if exists "cms_buckets_public_read" on storage.objects;
create policy "cms_buckets_public_read"
on storage.objects for select
using (
  bucket_id in ('site-media','packages','places','cars','cabs')
);

-- Staff upload / replace files
drop policy if exists "cms_buckets_staff_insert" on storage.objects;
create policy "cms_buckets_staff_insert"
on storage.objects for insert
with check (
  bucket_id in ('site-media','packages','places','cars','cabs')
  and public.get_my_role() in ('admin','employee')
);

drop policy if exists "cms_buckets_staff_update" on storage.objects;
create policy "cms_buckets_staff_update"
on storage.objects for update
using (
  bucket_id in ('site-media','packages','places','cars','cabs')
  and public.get_my_role() in ('admin','employee')
)
with check (
  bucket_id in ('site-media','packages','places','cars','cabs')
  and public.get_my_role() in ('admin','employee')
);

-- Homepage bucket: staff can delete old hero uploads without blocking UX
drop policy if exists "site_media_staff_delete" on storage.objects;
create policy "site_media_staff_delete"
on storage.objects for delete
using (
  bucket_id = 'site-media'
  and public.get_my_role() in ('admin','employee')
);

-- Other CMS buckets: only admin deletes (avoid accidental asset wipes)
drop policy if exists "cms_buckets_admin_delete" on storage.objects;
create policy "cms_buckets_admin_delete"
on storage.objects for delete
using (
  bucket_id in ('packages','places','cars','cabs')
  and public.get_my_role() = 'admin'
);
