-- Run in Supabase SQL editor or via CLI. Safe to re-run: uses IF NOT EXISTS where possible.

-- Site-wide JSON (homepage hero slides, featured place images, split panels)
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  home_content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

insert into public.site_settings (id, home_content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_write_authenticated" on public.site_settings;
create policy "site_settings_write_authenticated" on public.site_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- CRM itineraries (paste your format in itinerary_body)
create table if not exists public.crm_itineraries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  travel_start date,
  travel_end date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'confirmed', 'archived')),
  itinerary_body text not null default '',
  internal_notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists crm_itineraries_status_idx on public.crm_itineraries (status);
create index if not exists crm_itineraries_created_idx on public.crm_itineraries (created_at desc);

alter table public.crm_itineraries enable row level security;

drop policy if exists "crm_itineraries_authenticated" on public.crm_itineraries;
create policy "crm_itineraries_authenticated" on public.crm_itineraries
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- profiles (portal roles). Create if your project never had this table.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists role text default 'user';

comment on column public.profiles.role is 'Portal: admin = full CMS; employee = packages + bookings + CRM';
