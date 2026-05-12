-- Allow employees to delete objects in CMS buckets (packages, places, cars, cabs)
-- so they can remove old images without admin-only storage deletes.

drop policy if exists "cms_buckets_admin_delete" on storage.objects;

create policy "cms_buckets_staff_delete_catalog"
on storage.objects for delete
using (
  bucket_id in ('packages','places','cars','cabs')
  and public.get_my_role() in ('admin','employee')
);
