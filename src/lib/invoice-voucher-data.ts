/** Optional JSON in invoice `notes` for hotel voucher PDF fields. */

export type VoucherStayRow = {
  destination: string;
  checkIn: string;
  checkOut: string;
  hotel: string;
  roomCategory: string;
  nights: string;
};

export type VoucherPayload = {
  mealPlan?: string;
  pax?: number;
  rooms?: number;
  extraBeds?: number;
  childWithoutBed?: number;
  nights?: number;
  stays?: VoucherStayRow[];
  cab?: { name?: string; driver?: string; contact?: string };
  inclusions?: string[];
  exclusions?: string[];
};

const DEFAULT_INCLUSIONS = [
  'All Taxes are included in the package cost.',
  'All Transfers including Airport/Railway Station.',
  '60 Minutes Shikara Boat ride on Dal Lake.',
  'All tolls, parking, and driver allowances.',
  'Non-AC Vehicle as per itinerary.',
];

const DEFAULT_EXCLUSIONS = [
  'Airfare / Train fare.',
  'Personal expenses such as laundry, telephone, tips, etc.',
  'Entry fees at monuments / attractions.',
  'Any item not mentioned in inclusions.',
];

export function parseVoucherPayload(notes: string | null | undefined): VoucherPayload | null {
  const raw = notes?.trim();
  if (!raw || !raw.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw) as VoucherPayload;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function voucherInclusions(payload: VoucherPayload | null): string[] {
  return payload?.inclusions?.length ? payload.inclusions : DEFAULT_INCLUSIONS;
}

export function voucherExclusions(payload: VoucherPayload | null): string[] {
  return payload?.exclusions?.length ? payload.exclusions : DEFAULT_EXCLUSIONS;
}

export function formatVoucherDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function voucherStatusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'sent') return 'CONFIRMED';
  if (s === 'void') return 'CANCELLED';
  return s.toUpperCase();
}

export function voucherStatusConfirmed(status: string): boolean {
  const label = voucherStatusLabel(status);
  return label === 'CONFIRMED';
}
