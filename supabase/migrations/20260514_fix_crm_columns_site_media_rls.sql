-- Production patch: idempotent CRM columns + tighten site_settings writes + stable get_my_role().
-- Safe after 20260210120000, 20260510, 20260511_crm_itinerary_images_pdf, 20260512, 20260513.
-- Run in Supabase SQL Editor or via CLI. Re-run safe: uses IF NOT EXISTS / DROP IF EXISTS.

-- ---------------------------------------------------------------------------
-- 1) CRM itineraries: columns (no-op if 20260511_crm_itinerary_images_pdf ran)
-- ---------------------------------------------------------------------------
alter table public.crm_itineraries
  add column if not exists sections jsonb not null default '{}'::jsonb,
  add column if not exists cover_image_url text;

-- ---------------------------------------------------------------------------
-- 2) site_settings: remove permissive authenticated write; staff-only insert/update
-- ---------------------------------------------------------------------------
drop policy if exists "site_settings_write_authenticated" on public.site_settings;

drop policy if exists "site_settings_staff_insert" on public.site_settings;
create policy "site_settings_staff_insert" on public.site_settings
  for insert
  with check (
    id = 1
    and public.get_my_role() in ('admin', 'employee')
  );

drop policy if exists "site_settings_staff_update" on public.site_settings;
create policy "site_settings_staff_update" on public.site_settings
  for update
  using (
    id = 1
    and public.get_my_role() in ('admin', 'employee')
  )
  with check (
    id = 1
    and public.get_my_role() in ('admin', 'employee')
  );

-- ---------------------------------------------------------------------------
-- 3) get_my_role: SECURITY DEFINER + fixed search_path (avoids RLS/search_path surprises)
-- ---------------------------------------------------------------------------
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'user');
$$;
