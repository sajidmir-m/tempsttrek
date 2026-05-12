-- CRM operational modules: hotels, expenses, invoices, vouchers, ledger.
-- Staff (admin + employee): select / insert / update / delete on these tables.
-- Also allow employees to delete core CRM rows (same as admin) for day-to-day ops.
-- Run after 20260511_offbeat_cars_crm_dashboard.sql and 20260514_fix_crm_columns_site_media_rls.sql.

-- ---------------------------------------------------------------------------
-- New tables
-- ---------------------------------------------------------------------------

create table if not exists public.crm_hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  category text,
  meal_plan text,
  contact_name text,
  contact_phone text,
  gstin text,
  notes text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other' check (category in ('vendor', 'staff', 'trip', 'office', 'other')),
  amount numeric(12, 2) not null check (amount >= 0),
  expense_date date not null default (now()::date),
  payee text,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null,
  customer_name text not null,
  customer_email text,
  amount numeric(12, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),
  issue_date date not null default (now()::date),
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invoice_number)
);

create table if not exists public.crm_vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  voucher_type text not null default 'hotel' check (voucher_type in ('hotel', 'cab', 'experience', 'other')),
  status text not null default 'draft' check (status in ('draft', 'issued', 'redeemed', 'cancelled')),
  valid_until date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code)
);

create table if not exists public.crm_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default (now()::date),
  description text not null,
  flow text not null check (flow in ('in', 'out')),
  amount numeric(12, 2) not null check (amount >= 0),
  reference text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_hotels_active on public.crm_hotels (is_active);
create index if not exists idx_crm_hotels_name on public.crm_hotels (name);
create index if not exists idx_crm_expenses_date on public.crm_expenses (expense_date desc);
create index if not exists idx_crm_invoices_status on public.crm_invoices (status);
create index if not exists idx_crm_vouchers_status on public.crm_vouchers (status);
create index if not exists idx_crm_ledger_date on public.crm_ledger_entries (entry_date desc);

-- ---------------------------------------------------------------------------
-- RLS: staff full CRUD on new tables
-- ---------------------------------------------------------------------------

alter table public.crm_hotels enable row level security;
alter table public.crm_expenses enable row level security;
alter table public.crm_invoices enable row level security;
alter table public.crm_vouchers enable row level security;
alter table public.crm_ledger_entries enable row level security;

drop policy if exists "crm_hotels_staff_select" on public.crm_hotels;
create policy "crm_hotels_staff_select" on public.crm_hotels for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_hotels_staff_insert" on public.crm_hotels;
create policy "crm_hotels_staff_insert" on public.crm_hotels for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_hotels_staff_update" on public.crm_hotels;
create policy "crm_hotels_staff_update" on public.crm_hotels for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_hotels_staff_delete" on public.crm_hotels;
create policy "crm_hotels_staff_delete" on public.crm_hotels for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_expenses_staff_select" on public.crm_expenses;
create policy "crm_expenses_staff_select" on public.crm_expenses for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_expenses_staff_insert" on public.crm_expenses;
create policy "crm_expenses_staff_insert" on public.crm_expenses for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_expenses_staff_update" on public.crm_expenses;
create policy "crm_expenses_staff_update" on public.crm_expenses for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_expenses_staff_delete" on public.crm_expenses;
create policy "crm_expenses_staff_delete" on public.crm_expenses for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_invoices_staff_select" on public.crm_invoices;
create policy "crm_invoices_staff_select" on public.crm_invoices for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_invoices_staff_insert" on public.crm_invoices;
create policy "crm_invoices_staff_insert" on public.crm_invoices for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_invoices_staff_update" on public.crm_invoices;
create policy "crm_invoices_staff_update" on public.crm_invoices for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_invoices_staff_delete" on public.crm_invoices;
create policy "crm_invoices_staff_delete" on public.crm_invoices for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_vouchers_staff_select" on public.crm_vouchers;
create policy "crm_vouchers_staff_select" on public.crm_vouchers for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_vouchers_staff_insert" on public.crm_vouchers;
create policy "crm_vouchers_staff_insert" on public.crm_vouchers for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_vouchers_staff_update" on public.crm_vouchers;
create policy "crm_vouchers_staff_update" on public.crm_vouchers for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_vouchers_staff_delete" on public.crm_vouchers;
create policy "crm_vouchers_staff_delete" on public.crm_vouchers for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_ledger_staff_select" on public.crm_ledger_entries;
create policy "crm_ledger_staff_select" on public.crm_ledger_entries for select
  using (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_ledger_staff_insert" on public.crm_ledger_entries;
create policy "crm_ledger_staff_insert" on public.crm_ledger_entries for insert
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_ledger_staff_update" on public.crm_ledger_entries;
create policy "crm_ledger_staff_update" on public.crm_ledger_entries for update
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));
drop policy if exists "crm_ledger_staff_delete" on public.crm_ledger_entries;
create policy "crm_ledger_staff_delete" on public.crm_ledger_entries for delete
  using (public.get_my_role() in ('admin', 'employee'));

-- ---------------------------------------------------------------------------
-- Employees may delete leads / quotes / followups / arrivals (same as admin)
-- ---------------------------------------------------------------------------

drop policy if exists "crm_leads_admin_delete" on public.crm_leads;
drop policy if exists "crm_leads_staff_delete" on public.crm_leads;
create policy "crm_leads_staff_delete" on public.crm_leads for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_quotes_admin_delete" on public.crm_quotations;
drop policy if exists "crm_quotes_staff_delete" on public.crm_quotations;
create policy "crm_quotes_staff_delete" on public.crm_quotations for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_followups_admin_delete" on public.crm_followups;
drop policy if exists "crm_followups_staff_delete" on public.crm_followups;
create policy "crm_followups_staff_delete" on public.crm_followups for delete
  using (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "crm_arrivals_admin_delete" on public.crm_arrivals;
drop policy if exists "crm_arrivals_staff_delete" on public.crm_arrivals;
create policy "crm_arrivals_staff_delete" on public.crm_arrivals for delete
  using (public.get_my_role() in ('admin', 'employee'));

-- ---------------------------------------------------------------------------
-- 4) CMS catalog: employees can manage packages, places, cabs, FAQs, cars (matches admin UI)
-- ---------------------------------------------------------------------------

drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_staff_write" on public.packages for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "cabs_admin_write" on public.cabs;
create policy "cabs_staff_write" on public.cabs for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "places_admin_write" on public.places;
create policy "places_staff_write" on public.places for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "faqs_admin_write" on public.chatbot_faqs;
create policy "faqs_staff_write" on public.chatbot_faqs for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "testimonials_admin_write" on public.testimonials;
create policy "testimonials_staff_write" on public.testimonials for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

drop policy if exists "cars_admin_write" on public.cars;
create policy "cars_staff_write" on public.cars for all
  using (public.get_my_role() in ('admin', 'employee'))
  with check (public.get_my_role() in ('admin', 'employee'));

-- Itineraries: allow staff delete (draft cleanup)
drop policy if exists "crm_admin_delete" on public.crm_itineraries;
drop policy if exists "crm_staff_delete" on public.crm_itineraries;
create policy "crm_staff_delete" on public.crm_itineraries for delete
  using (public.get_my_role() in ('admin', 'employee'));
