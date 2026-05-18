import type { LedgerCategory, PaymentStatus } from '@/lib/ledger-utils';

export type TripLedgerRow = {
  id: string;
  title: string;
  customer_name: string | null;
  package_selling_price: number;
  notes: string | null;
  updated_at: string;
};

export type TripLedgerItemRow = {
  id: string;
  ledger_id: string;
  category: LedgerCategory | string;
  vendor: string;
  total_cost: number;
  paid_amount: number;
  entry_date: string;
  notes: string | null;
  created_at?: string;
};

export type TripLedgerItemComputed = TripLedgerItemRow & {
  remaining: number;
  status: PaymentStatus;
};

export const DEMO_LEDGER_ITEMS: Omit<TripLedgerItemRow, 'id' | 'ledger_id'>[] = [
  { category: 'hotel', vendor: 'Royal Heritage Srinagar', total_cost: 4000, paid_amount: 2000, entry_date: new Date().toISOString().slice(0, 10), notes: null },
  { category: 'hotel', vendor: 'Pine Retreat Pahalgam', total_cost: 6000, paid_amount: 6000, entry_date: new Date().toISOString().slice(0, 10), notes: null },
  { category: 'hotel', vendor: 'Gulmarg Hill View', total_cost: 5000, paid_amount: 3000, entry_date: new Date().toISOString().slice(0, 10), notes: null },
  { category: 'cab', vendor: 'Etios Cab', total_cost: 14000, paid_amount: 7000, entry_date: new Date().toISOString().slice(0, 10), notes: null },
  { category: 'office', vendor: 'Driver Allowance', total_cost: 2000, paid_amount: 2000, entry_date: new Date().toISOString().slice(0, 10), notes: null },
  { category: 'other', vendor: 'Food & Misc', total_cost: 3000, paid_amount: 1000, entry_date: new Date().toISOString().slice(0, 10), notes: null },
];
