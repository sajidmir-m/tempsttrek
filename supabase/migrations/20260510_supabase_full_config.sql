-- Supabase full configuration for Tempesttrek
-- Safe to run in SQL Editor.

create extension if not exists "uuid-ossp";

-- Helpers
create or replace function public.get_my_role()
returns text
language sql
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user');
$$;

-- Profiles (auth role map)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'employee', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (auth.uid() = id or public.get_my_role() = 'admin');

drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only"
on public.profiles for update
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

-- Core content tables
create table if not exists public.packages (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  duration text not null,
  price numeric(10,2) not null,
  location text not null,
  description text,
  inclusions text[],
  exclusions text[],
  itinerary jsonb,
  is_popular boolean default false,
  featured_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cabs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  duration text,
  starting_from text,
  vehicle_type text,
  ideal_for text,
  routes text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  tag text,
  location text,
  description text,
  highlights text[],
  best_time text,
  ideal_stay text,
  hero_image text,
  is_featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  message text,
  package_id uuid references public.packages(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','read','contacted','booked','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text,
  rating int check (rating between 1 and 5),
  comment text not null,
  is_approved boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.chatbot_faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  home_content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, home_content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.crm_itineraries (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  travel_start date,
  travel_end date,
  status text not null default 'draft' check (status in ('draft','sent','confirmed','archived')),
  itinerary_body text not null default '',
  internal_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_packages_popular on public.packages(is_popular);
create index if not exists idx_inquiries_created on public.inquiries(created_at desc);
create index if not exists idx_crm_itineraries_updated on public.crm_itineraries(updated_at desc);

-- RLS content tables
alter table public.packages enable row level security;
alter table public.cabs enable row level security;
alter table public.places enable row level security;
alter table public.inquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.chatbot_faqs enable row level security;
alter table public.site_settings enable row level security;
alter table public.crm_itineraries enable row level security;

-- Public read tables
drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read" on public.packages for select using (true);
drop policy if exists "cabs_public_read" on public.cabs;
create policy "cabs_public_read" on public.cabs for select using (true);
drop policy if exists "places_public_read" on public.places;
create policy "places_public_read" on public.places for select using (true);
drop policy if exists "faqs_public_read" on public.chatbot_faqs;
create policy "faqs_public_read" on public.chatbot_faqs for select using (true);
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings for select using (true);

-- Admin writes on catalog/settings/faqs/testimonials
drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_admin_write" on public.packages for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "cabs_admin_write" on public.cabs;
create policy "cabs_admin_write" on public.cabs for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "places_admin_write" on public.places;
create policy "places_admin_write" on public.places for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "faqs_admin_write" on public.chatbot_faqs;
create policy "faqs_admin_write" on public.chatbot_faqs for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "testimonials_admin_write" on public.testimonials;
create policy "testimonials_admin_write" on public.testimonials for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

-- Inquiries: public create, staff/admin read+update, admin delete
drop policy if exists "inquiries_public_create" on public.inquiries;
create policy "inquiries_public_create" on public.inquiries for insert with check (true);
drop policy if exists "inquiries_staff_read" on public.inquiries;
create policy "inquiries_staff_read" on public.inquiries for select
using (public.get_my_role() in ('admin','employee'));
drop policy if exists "inquiries_staff_update" on public.inquiries;
create policy "inquiries_staff_update" on public.inquiries for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete" on public.inquiries for delete
using (public.get_my_role() = 'admin');

-- CRM: employee/admin read-create-update, admin delete
drop policy if exists "crm_staff_read" on public.crm_itineraries;
create policy "crm_staff_read" on public.crm_itineraries for select
using (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_staff_insert" on public.crm_itineraries;
create policy "crm_staff_insert" on public.crm_itineraries for insert
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_staff_update" on public.crm_itineraries;
create policy "crm_staff_update" on public.crm_itineraries for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_admin_delete" on public.crm_itineraries;
create policy "crm_admin_delete" on public.crm_itineraries for delete
using (public.get_my_role() = 'admin');
