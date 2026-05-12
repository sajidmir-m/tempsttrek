-- CRM Itinerary structured sections + assets (images) + Storage policies
-- Run after your base config migrations.

create extension if not exists "uuid-ossp";

-- Extend existing itineraries table
alter table public.crm_itineraries
  add column if not exists sections jsonb not null default '{}'::jsonb,
  add column if not exists cover_image_url text;

-- Assets table for multiple images per itinerary
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

-- RLS (staff can select/insert/update; only admin can delete)
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

-- Storage bucket expectations:
-- Create a bucket named: itineraries
-- Bucket can be public to simplify printing and image embeds in PDFs.

-- Storage policies (Supabase Storage uses storage.objects)
-- Allow public read for images in itineraries bucket
drop policy if exists "itineraries_public_read" on storage.objects;
create policy "itineraries_public_read"
on storage.objects for select
using (bucket_id = 'itineraries');

-- Allow staff upload/update; admin delete
drop policy if exists "itineraries_staff_insert" on storage.objects;
create policy "itineraries_staff_insert"
on storage.objects for insert
with check (
  bucket_id = 'itineraries'
  and public.get_my_role() in ('admin','employee')
);

drop policy if exists "itineraries_staff_update" on storage.objects;
create policy "itineraries_staff_update"
on storage.objects for update
using (
  bucket_id = 'itineraries'
  and public.get_my_role() in ('admin','employee')
)
with check (
  bucket_id = 'itineraries'
  and public.get_my_role() in ('admin','employee')
);

drop policy if exists "itineraries_admin_delete" on storage.objects;
create policy "itineraries_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'itineraries'
  and public.get_my_role() = 'admin'
);

