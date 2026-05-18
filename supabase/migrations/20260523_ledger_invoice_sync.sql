-- Link invoices to trip ledgers; prevent duplicate payment lines

alter table public.crm_invoices
  add column if not exists ledger_id uuid references public.crm_trip_ledgers (id) on delete set null;

alter table public.crm_invoices
  add column if not exists synced_to_ledger_at timestamptz;

create index if not exists idx_crm_invoices_ledger on public.crm_invoices (ledger_id);

alter table public.crm_trip_ledger_items
  add column if not exists source_invoice_id uuid references public.crm_invoices (id) on delete set null;

create unique index if not exists idx_crm_trip_ledger_items_source_invoice
  on public.crm_trip_ledger_items (source_invoice_id)
  where source_invoice_id is not null;
