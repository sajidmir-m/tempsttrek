-- Hotels, Cabs, Offices, Other (replaces transport/driver/misc and old expense categories)

-- Trip ledger items
update public.crm_trip_ledger_items set category = 'cab' where category = 'transport';
update public.crm_trip_ledger_items set category = 'office' where category = 'driver';
update public.crm_trip_ledger_items set category = 'other' where category = 'misc';

alter table public.crm_trip_ledger_items drop constraint if exists crm_trip_ledger_items_category_check;
alter table public.crm_trip_ledger_items
  add constraint crm_trip_ledger_items_category_check
  check (category in ('hotel', 'cab', 'office', 'other'));

-- Expenses
update public.crm_expenses set category = 'hotel' where category in ('vendor', 'trip');
update public.crm_expenses set category = 'office' where category = 'staff';
update public.crm_expenses set category = 'office' where category = 'office';
update public.crm_expenses set category = 'other' where category not in ('hotel', 'cab', 'office', 'other');

alter table public.crm_expenses drop constraint if exists crm_expenses_category_check;
alter table public.crm_expenses
  add constraint crm_expenses_category_check
  check (category in ('hotel', 'cab', 'office', 'other'));
