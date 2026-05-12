-- Itinerary assets: placement after a day + optional category (hotel / cab / place)
alter table public.crm_itinerary_assets
  add column if not exists after_day int,
  add column if not exists kind text;

alter table public.crm_itinerary_assets
  drop constraint if exists crm_itinerary_assets_kind_check;

alter table public.crm_itinerary_assets
  add constraint crm_itinerary_assets_kind_check
  check (kind is null or kind in ('general', 'hotel', 'cab', 'place'));

create index if not exists idx_crm_itinerary_assets_itinerary_after_day
  on public.crm_itinerary_assets (itinerary_id, after_day, sort_order);

-- Cab plans: hero image (public path or Supabase URL) + optional featured flag for UI
alter table public.cabs add column if not exists image_url text;
alter table public.cabs add column if not exists is_featured boolean default false;
