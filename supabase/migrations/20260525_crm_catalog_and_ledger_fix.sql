-- Destinations, hotel/room categories, cabs, hotel fields, itinerary booking voucher, ledger categories fix.

-- ---------------------------------------------------------------------------
-- Ledger & expense categories (hotel, cab, meal, activity, transport, office, other)
-- ---------------------------------------------------------------------------
update public.crm_trip_ledger_items set category = 'transport' where category in ('driver', 'misc');
update public.crm_trip_ledger_items set category = 'meal' where category = 'food';
update public.crm_trip_ledger_items set category = 'other' where category not in (
  'hotel', 'cab', 'meal', 'activity', 'transport', 'office', 'other'
);

alter table public.crm_trip_ledger_items drop constraint if exists crm_trip_ledger_items_category_check;
alter table public.crm_trip_ledger_items
  add constraint crm_trip_ledger_items_category_check
  check (category in ('hotel', 'cab', 'meal', 'activity', 'transport', 'office', 'other'));

update public.crm_expenses set category = 'transport' where category in ('vendor', 'trip', 'driver');
update public.crm_expenses set category = 'office' where category = 'staff';
update public.crm_expenses set category = 'other' where category not in (
  'hotel', 'cab', 'meal', 'activity', 'transport', 'office', 'other'
);

alter table public.crm_expenses drop constraint if exists crm_expenses_category_check;
alter table public.crm_expenses
  add constraint crm_expenses_category_check
  check (category in ('hotel', 'cab', 'meal', 'activity', 'transport', 'office', 'other'));

-- ---------------------------------------------------------------------------
-- Hotel categories
-- ---------------------------------------------------------------------------
create table if not exists public.crm_hotel_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

-- ---------------------------------------------------------------------------
-- Room categories
-- ---------------------------------------------------------------------------
create table if not exists public.crm_room_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

-- ---------------------------------------------------------------------------
-- Destinations (routes / sightseeing)
-- ---------------------------------------------------------------------------
create table if not exists public.crm_destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_location text not null,
  route_from text,
  route_to text,
  description text,
  featured_image_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_destinations_base on public.crm_destinations (base_location, status);
create index if not exists idx_crm_destinations_status on public.crm_destinations (status, sort_order);

create table if not exists public.crm_destination_images (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.crm_destinations (id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_destination_images_dest on public.crm_destination_images (destination_id, sort_order);

-- ---------------------------------------------------------------------------
-- Cabs
-- ---------------------------------------------------------------------------
create table if not exists public.crm_cabs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vehicle_type text,
  seating_capacity int,
  driver_name text,
  driver_contact text,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_cabs_status on public.crm_cabs (status, name);

-- ---------------------------------------------------------------------------
-- Hotels: extended fields
-- ---------------------------------------------------------------------------
alter table public.crm_hotels add column if not exists hotel_category_id uuid references public.crm_hotel_categories (id) on delete set null;
alter table public.crm_hotels add column if not exists hotel_type text not null default 'hotel'
  check (hotel_type in ('hotel', 'houseboat', 'resort', 'villa', 'other'));
alter table public.crm_hotels add column if not exists star_rating int check (star_rating is null or (star_rating >= 1 and star_rating <= 5));
alter table public.crm_hotels add column if not exists address text;

-- ---------------------------------------------------------------------------
-- Invoices: advance / balance for Wintsum-style PDF
-- ---------------------------------------------------------------------------
alter table public.crm_invoices add column if not exists advance_paid numeric(12, 2) not null default 0;
alter table public.crm_invoices add column if not exists itinerary_id uuid references public.crm_itineraries (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Itineraries: booking voucher payload + quote
-- ---------------------------------------------------------------------------
alter table public.crm_itineraries add column if not exists quote_price numeric(12, 2);
alter table public.crm_itineraries add column if not exists booking_voucher jsonb not null default '{}'::jsonb;
alter table public.crm_itineraries add column if not exists itinerary_number text;

create unique index if not exists idx_crm_itineraries_number on public.crm_itineraries (itinerary_number)
  where itinerary_number is not null;

-- ---------------------------------------------------------------------------
-- Booking confirmation vouchers (standalone records, optional itinerary link)
-- ---------------------------------------------------------------------------
create table if not exists public.crm_booking_vouchers (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid references public.crm_itineraries (id) on delete set null,
  booking_id text not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  travel_start date,
  travel_end date,
  meal_plan text,
  pax int default 0,
  rooms int default 0,
  nights int default 0,
  extra_beds int default 0,
  child_without_bed int default 0,
  total_amount numeric(12, 2) default 0,
  advance_paid numeric(12, 2) default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'partial', 'paid')),
  cab_id uuid references public.crm_cabs (id) on delete set null,
  cab_details jsonb default '{}'::jsonb,
  accommodations jsonb not null default '[]'::jsonb,
  day_itinerary jsonb not null default '[]'::jsonb,
  terms_conditions text,
  status text not null default 'confirmed' check (status in ('draft', 'confirmed', 'cancelled')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id)
);

create index if not exists idx_crm_booking_vouchers_itinerary on public.crm_booking_vouchers (itinerary_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.crm_hotel_categories enable row level security;
alter table public.crm_room_categories enable row level security;
alter table public.crm_destinations enable row level security;
alter table public.crm_destination_images enable row level security;
alter table public.crm_cabs enable row level security;
alter table public.crm_booking_vouchers enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'crm_hotel_categories', 'crm_room_categories', 'crm_destinations',
    'crm_destination_images', 'crm_cabs', 'crm_booking_vouchers'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_staff', t);
    execute format(
      'create policy %I on public.%I for all using (public.get_my_role() in (''admin'', ''employee'')) with check (public.get_my_role() in (''admin'', ''employee''))',
      t || '_staff', t
    );
  end loop;
end $$;

-- Storage: destinations bucket
insert into storage.buckets (id, name, public)
values ('destinations', 'destinations', true)
on conflict (id) do update set public = true;

drop policy if exists "destinations_bucket_public_read" on storage.objects;
create policy "destinations_bucket_public_read" on storage.objects for select
  using (bucket_id = 'destinations');

drop policy if exists "destinations_bucket_staff_write" on storage.objects;
create policy "destinations_bucket_staff_write" on storage.objects for all
  using (bucket_id = 'destinations' and public.get_my_role() in ('admin', 'employee'))
  with check (bucket_id = 'destinations' and public.get_my_role() in ('admin', 'employee'));

-- ---------------------------------------------------------------------------
-- Seed: hotel categories, room categories, sample destinations
-- ---------------------------------------------------------------------------
insert into public.crm_hotel_categories (name, sort_order) values
  ('Deluxe', 1), ('Premium', 2), ('Luxury', 3), ('Budget', 4), ('Houseboat Premium', 5)
on conflict (name) do nothing;

insert into public.crm_room_categories (name, description, sort_order) values
  ('Classic Room', 'Standard comfortable room', 1),
  ('Deluxe Room', 'Upgraded room with better amenities', 2),
  ('Lake Facing Suite', 'Suite with lake views', 3),
  ('Mountain View Room', 'Room facing mountains', 4),
  ('Family Suite', 'Spacious suite for families', 5)
on conflict (name) do nothing;

insert into public.crm_destinations (name, base_location, route_from, route_to, description, sort_order) values
  ('Srinagar to Sonamarg', 'Srinagar', 'Srinagar', 'Sonamarg', 'Day trip / transfer to Sonamarg', 1),
  ('Srinagar to Gulmarg', 'Srinagar', 'Srinagar', 'Gulmarg', 'Gulmarg meadow day trip', 2),
  ('Srinagar to Pahalgam', 'Srinagar', 'Srinagar', 'Pahalgam', 'Pahalgam valley excursion', 3),
  ('Srinagar Local Sightseeing', 'Srinagar', 'Srinagar', 'Srinagar', 'Mughal gardens, Dal Lake, Shankaracharya', 4),
  ('Gulmarg Local Sightseeing', 'Gulmarg', 'Gulmarg', 'Gulmarg', 'Gondola, golf course, snow activities', 10),
  ('Pahalgam Local Sightseeing', 'Pahalgam', 'Pahalgam', 'Pahalgam', 'Betaab, Aru, Baisaran (union cab)', 11),
  ('Sonamarg Local Sightseeing', 'Sonamarg', 'Sonamarg', 'Sonamarg', 'Thajiwas glacier, Sindh river', 12)
on conflict do nothing;

insert into public.crm_cabs (name, vehicle_type, seating_capacity, description, sort_order)
select * from (values
  ('Swift Dzire', 'Sedan', 4, 'Compact sedan for small groups', 1),
  ('Innova Crysta', 'SUV', 7, 'Premium SUV for families', 2),
  ('Tempo Traveller', 'Van', 12, 'Group transport', 3)
) as v(name, vehicle_type, seating_capacity, description, sort_order)
where not exists (select 1 from public.crm_cabs c where c.name = v.name);
