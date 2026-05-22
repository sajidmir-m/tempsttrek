-- Per-night hotel stays in itinerary sections JSON; junction table night_number for sync.

alter table public.crm_itinerary_hotels add column if not exists night_number int;

-- Allow one hotel per night (drop old unique if present, add night-based unique)
alter table public.crm_itinerary_hotels drop constraint if exists crm_itinerary_hotels_itinerary_id_hotel_id_day_number_key;

create unique index if not exists idx_crm_itinerary_hotels_night
  on public.crm_itinerary_hotels (itinerary_id, night_number)
  where night_number is not null;

create index if not exists idx_crm_itinerary_hotels_night_order
  on public.crm_itinerary_hotels (itinerary_id, night_number);
