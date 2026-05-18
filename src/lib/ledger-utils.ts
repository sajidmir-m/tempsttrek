export const LEDGER_CATEGORIES = ['hotel', 'cab', 'office', 'other'] as const;
export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

/** Same categories for Manage Expenses */
export const EXPENSE_CATEGORIES = LEDGER_CATEGORIES;

export type PaymentStatus = 'paid' | 'partial' | 'pending';

const LEGACY_CATEGORY_MAP: Record<string, LedgerCategory> = {
  hotel: 'hotel',
  cab: 'cab',
  office: 'office',
  other: 'other',
  transport: 'cab',
  driver: 'office',
  misc: 'other',
  vendor: 'hotel',
  staff: 'office',
  trip: 'cab',
};

export function normalizeCategory(category: string): LedgerCategory {
  const c = category.toLowerCase().trim();
  return LEGACY_CATEGORY_MAP[c] ?? 'other';
}

export function formatCategoryLabel(category: string): string {
  const c = normalizeCategory(category);
  if (c === 'hotel') return 'Hotels';
  if (c === 'cab') return 'Cabs';
  if (c === 'office') return 'Offices';
  return 'Other';
}

export const VENDOR_LABEL_BY_CATEGORY: Record<LedgerCategory, string> = {
  hotel: 'Hotel / property name',
  cab: 'Cab / transport vendor',
  office: 'Office expense (rent, bills, etc.)',
  other: 'Vendor / description',
};

export function computeRemaining(totalCost: number, paidAmount: number): number {
  return Math.max(0, Number(totalCost) - Number(paidAmount));
}

export function computePaymentStatus(totalCost: number, paidAmount: number): PaymentStatus {
  const total = Number(totalCost) || 0;
  const paid = Number(paidAmount) || 0;

  if (total <= 0) {
    return paid > 0 ? 'partial' : 'pending';
  }
  if (paid >= total) return 'paid';
  if (paid <= 0) return 'pending';
  return 'partial';
}

export function paymentStatusLabel(status: PaymentStatus): string {
  if (status === 'paid') return 'Paid';
  if (status === 'partial') return 'Partial';
  return 'Unpaid';
}

export type PaymentBreakdown = {
  status: PaymentStatus;
  remaining: number;
  total: number;
  paid: number;
  hasValidTotal: boolean;
  summary: string;
};

export function getPaymentBreakdown(totalCost: number, paidAmount: number): PaymentBreakdown {
  const total = Number(totalCost) || 0;
  const paid = Number(paidAmount) || 0;
  const hasValidTotal = total > 0;
  const remaining = computeRemaining(total, paid);
  const status = computePaymentStatus(total, paid);

  let summary: string;
  if (!hasValidTotal) {
    summary =
      paid > 0
        ? `Advance paid ${formatInr(paid)} — enter total cost to calculate due amount`
        : 'Enter total cost — status will show Unpaid, Partial, or Paid';
  } else if (status === 'paid') {
    summary = `Fully paid · ${formatInr(paid)} of ${formatInr(total)}`;
  } else if (status === 'partial') {
    summary = `${formatInr(paid)} paid of ${formatInr(total)} · ${formatInr(remaining)} still due`;
  } else {
    summary = `Unpaid · ${formatInr(remaining)} due (nothing paid yet)`;
  }

  return { status, remaining, total, paid, hasValidTotal, summary };
}

export function sumLedgerCosts(items: { total_cost: number }[]): number {
  return items.reduce((acc, row) => acc + Number(row.total_cost), 0);
}

export function sumLedgerPaid(items: { paid_amount: number }[]): number {
  return items.reduce((acc, row) => acc + Number(row.paid_amount), 0);
}

export function computeNetProfit(packageSellingPrice: number, totalCompanyCost: number): number {
  return Number(packageSellingPrice) - Number(totalCompanyCost);
}

export function formatInr(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
