-- Offbeat spots + car rental fleet + CRM dashboard tables (Supabase)
-- Run after 20260510_supabase_full_config.sql

create extension if not exists "uuid-ossp";

-- Offbeat / trekking / hidden places
create table if not exists public.offbeat_spots (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('trek', 'hidden_place')),
  name text not null,
  region text,
  difficulty text,
  best_season text,
  duration text,
  altitude text,
  description text,
  hero_image text,
  is_featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offbeat_spots enable row level security;
drop policy if exists "offbeat_spots_public_read" on public.offbeat_spots;
create policy "offbeat_spots_public_read" on public.offbeat_spots for select using (true);
drop policy if exists "offbeat_spots_admin_write" on public.offbeat_spots;
create policy "offbeat_spots_admin_write" on public.offbeat_spots for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

create index if not exists idx_offbeat_type on public.offbeat_spots(type);
create index if not exists idx_offbeat_featured on public.offbeat_spots(is_featured);

-- Car rental fleet
create table if not exists public.cars (
  id uuid primary key default uuid_generate_v4(),
  name text not null,            -- e.g. Toyota Etios
  slug text unique not null,     -- e.g. toyota-etios
  category text,                -- Sedan/SUV/4x4/Van
  seats int,
  transmission text,            -- Manual/Automatic
  fuel text,                    -- Petrol/Diesel
  price_per_day numeric(10,2),
  price_per_km numeric(10,2),
  image_url text,
  features text[],
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cars enable row level security;
drop policy if exists "cars_public_read" on public.cars;
create policy "cars_public_read" on public.cars for select using (true);
drop policy if exists "cars_admin_write" on public.cars;
create policy "cars_admin_write" on public.cars for all
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

create index if not exists idx_cars_available on public.cars(is_available);
create index if not exists idx_cars_sort on public.cars(sort_order);

-- CRM dashboard tables
create table if not exists public.crm_leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  source text,
  destination text,
  budget numeric(12,2),
  duration text,
  status text not null default 'new'
    check (status in ('new','contacted','quoted','confirmed','closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_quotations (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.crm_leads(id) on delete cascade,
  quote_id text not null, -- human readable e.g. Q-2026-0001
  duration text,
  budget numeric(12,2),
  destination text,
  status text not null default 'draft'
    check (status in ('draft','sent','accepted','rejected','closed')),
  remark text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_followups (
  id uuid primary key default uuid_generate_v4(),
  quotation_id uuid references public.crm_quotations(id) on delete cascade,
  followup_at timestamptz not null,
  remark text,
  status text not null default 'pending' check (status in ('pending','done')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_arrivals (
  id uuid primary key default uuid_generate_v4(),
  quotation_id uuid references public.crm_quotations(id) on delete cascade,
  arrival_date date not null,
  destination text,
  status text not null default 'scheduled' check (status in ('scheduled','arrived','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_leads enable row level security;
alter table public.crm_quotations enable row level security;
alter table public.crm_followups enable row level security;
alter table public.crm_arrivals enable row level security;

-- Staff read/write (admin+employee), admin delete
drop policy if exists "crm_leads_staff_read" on public.crm_leads;
create policy "crm_leads_staff_read" on public.crm_leads for select
using (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_leads_staff_write" on public.crm_leads;
create policy "crm_leads_staff_write" on public.crm_leads for insert
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_leads_staff_update" on public.crm_leads;
create policy "crm_leads_staff_update" on public.crm_leads for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_leads_admin_delete" on public.crm_leads;
create policy "crm_leads_admin_delete" on public.crm_leads for delete using (public.get_my_role() = 'admin');

drop policy if exists "crm_quotes_staff_read" on public.crm_quotations;
create policy "crm_quotes_staff_read" on public.crm_quotations for select
using (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_quotes_staff_write" on public.crm_quotations;
create policy "crm_quotes_staff_write" on public.crm_quotations for insert
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_quotes_staff_update" on public.crm_quotations;
create policy "crm_quotes_staff_update" on public.crm_quotations for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_quotes_admin_delete" on public.crm_quotations;
create policy "crm_quotes_admin_delete" on public.crm_quotations for delete using (public.get_my_role() = 'admin');

drop policy if exists "crm_followups_staff_read" on public.crm_followups;
create policy "crm_followups_staff_read" on public.crm_followups for select
using (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_followups_staff_write" on public.crm_followups;
create policy "crm_followups_staff_write" on public.crm_followups for insert
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_followups_staff_update" on public.crm_followups;
create policy "crm_followups_staff_update" on public.crm_followups for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_followups_admin_delete" on public.crm_followups;
create policy "crm_followups_admin_delete" on public.crm_followups for delete using (public.get_my_role() = 'admin');

drop policy if exists "crm_arrivals_staff_read" on public.crm_arrivals;
create policy "crm_arrivals_staff_read" on public.crm_arrivals for select
using (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_arrivals_staff_write" on public.crm_arrivals;
create policy "crm_arrivals_staff_write" on public.crm_arrivals for insert
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_arrivals_staff_update" on public.crm_arrivals;
create policy "crm_arrivals_staff_update" on public.crm_arrivals for update
using (public.get_my_role() in ('admin','employee'))
with check (public.get_my_role() in ('admin','employee'));
drop policy if exists "crm_arrivals_admin_delete" on public.crm_arrivals;
create policy "crm_arrivals_admin_delete" on public.crm_arrivals for delete using (public.get_my_role() = 'admin');

create index if not exists idx_crm_followups_due on public.crm_followups(followup_at);
create index if not exists idx_crm_arrivals_date on public.crm_arrivals(arrival_date);
