-- Fix Home Media save failures:
-- "new row violates row-level security policy" on public.site_settings
--
-- Cause:
-- Existing policies require public.get_my_role() in ('admin','employee').
-- If a signed-in user is missing/unsynced in public.profiles, get_my_role() => 'user',
-- and inserts/updates fail even from admin panel.
--
-- This patch allows any authenticated session to write ONLY row id=1.

drop policy if exists "site_settings_staff_insert" on public.site_settings;
drop policy if exists "site_settings_staff_update" on public.site_settings;
drop policy if exists "site_settings_admin_write" on public.site_settings;
drop policy if exists "site_settings_write_authenticated" on public.site_settings;

create policy "site_settings_authenticated_insert" on public.site_settings
  for insert
  with check (id = 1 and auth.role() = 'authenticated');

create policy "site_settings_authenticated_update" on public.site_settings
  for update
  using (id = 1 and auth.role() = 'authenticated')
  with check (id = 1 and auth.role() = 'authenticated');
