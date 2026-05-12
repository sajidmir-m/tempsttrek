-- Ensures crm_itinerary_assets + itinerary columns exist (fixes PostgREST:
-- "Could not find the table 'public.crm_itinerary_assets' in the schema cache").
-- Idempotent: safe if 20260511_crm_itinerary_images_pdf.sql already ran.
-- Storage policies for bucket `itineraries` remain in 20260511; create that bucket in Dashboard if missing.

create extension if not exists "uuid-ossp";

alter table public.crm_itineraries
  add column if not exists sections jsonb not null default '{}'::jsonb,
  add column if not exists cover_image_url text;

create table if not exists public.crm_itinerary_assets (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid not null references public.crm_itineraries(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_itinerary_assets_itinerary on public.crm_itinerary_assets(itinerary_id);
create index if not exists idx_crm_itinerary_assets_sort on public.crm_itinerary_assets(sort_order);

alter table public.crm_itinerary_assets enable row level security;

drop policy if exists "crm_itinerary_assets_staff_read" on public.crm_itinerary_assets;
create policy "crm_itinerary_assets_staff_read"
on public.crm_itinerary_assets for select
using (public.get_my_role() in ('admin','employee'));

drop policy if exists "crm_itinerary_assets_staff_write" on public.crm_itinerary_assets;
create policy "crm_itinerary_assets_staff_write"
on public.crm_itinerary_assets for insert
with check (public.get_my_role() in ('admin','employee'));

drop policy if exists "crm_itinerary_assets_staff_update" on public.crm_itinerary_assets;
create policy "crm_itinerary_assets_staff_update"
on public.crm_itinerary_assets for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));

drop policy if exists "crm_itinerary_assets_admin_delete" on public.crm_itinerary_assets;
create policy "crm_itinerary_assets_admin_delete"
on public.crm_itinerary_assets for delete
using (public.get_my_role() = 'admin');
