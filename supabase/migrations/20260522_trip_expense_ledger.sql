-- Package / trip expense ledger (category, vendor, cost, paid, remaining computed in app)
-- Run after 20260515_crm_staff_crud_modules.sql

create table if not exists public.crm_trip_ledgers (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Trip ledger',
  customer_name text,
  package_selling_price numeric(12, 2) not null default 0 check (package_selling_price >= 0),
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_trip_ledger_items (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.crm_trip_ledgers (id) on delete cascade,
  category text not null check (category in ('hotel', 'transport', 'driver', 'misc')),
  vendor text not null,
  total_cost numeric(12, 2) not null check (total_cost >= 0),
  paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
  entry_date date not null default (now()::date),
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_trip_ledgers_updated on public.crm_trip_ledgers (updated_at desc);
create index if not exists idx_crm_trip_ledger_items_ledger on public.crm_trip_ledger_items (ledger_id);
create index if not exists idx_crm_trip_ledger_items_date on public.crm_trip_ledger_items (entry_date desc);
create index if not exists idx_crm_trip_ledger_items_category on public.crm_trip_ledger_items (category);

alter table public.crm_trip_ledgers enable row level security;
alter table public.crm_trip_ledger_items enable row level security;

drop policy if exists "crm_trip_ledgers_staff_select" on public.crm_trip_ledgers;
create policy "crm_trip_ledgers_staff_select" on public.crm_trip_ledgers for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_trip_ledgers_staff_insert" on public.crm_trip_ledgers;
create policy "crm_trip_ledgers_staff_insert" on public.crm_trip_ledgers for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_trip_ledgers_staff_update" on public.crm_trip_ledgers;
create policy "crm_trip_ledgers_staff_update" on public.crm_trip_ledgers for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_trip_ledgers_staff_delete" on public.crm_trip_ledgers;
create policy "crm_trip_ledgers_staff_delete" on public.crm_trip_ledgers for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_trip_ledger_items_staff_select" on public.crm_trip_ledger_items;
create policy "crm_trip_ledger_items_staff_select" on public.crm_trip_ledger_items for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_trip_ledger_items_staff_insert" on public.crm_trip_ledger_items;
create policy "crm_trip_ledger_items_staff_insert" on public.crm_trip_ledger_items for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_trip_ledger_items_staff_update" on public.crm_trip_ledger_items;
create policy "crm_trip_ledger_items_staff_update" on public.crm_trip_ledger_items for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_trip_ledger_items_staff_delete" on public.crm_trip_ledger_items;
create policy "crm_trip_ledger_items_staff_delete" on public.crm_trip_ledger_items for delete
  using (public.get_my_role() in ('admin', 'employee'));
