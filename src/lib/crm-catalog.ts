/** CRM catalog constants: destinations, hotels, cabs, ledger categories. */

export const HOTEL_TYPES = ['hotel', 'houseboat', 'resort', 'villa', 'other'] as const;
export type HotelType = (typeof HOTEL_TYPES)[number];

export const HOTEL_TYPE_LABELS: Record<HotelType, string> = {
  hotel: 'Hotel',
  houseboat: 'Houseboat',
  resort: 'Resort',
  villa: 'Villa',
  other: 'Other',
};

export const DESTINATION_BASE_LOCATIONS = [
  'Srinagar',
  'Gulmarg',
  'Pahalgam',
  'Sonamarg',
  'Jammu',
  'Leh',
  'Other',
] as const;

export type DestinationBase = (typeof DESTINATION_BASE_LOCATIONS)[number];

/** Map day title / body text to a base location for destination suggestions. */
export function inferBaseLocationFromDayText(text: string): DestinationBase {
  const t = text.toLowerCase();
  if (/\bsonamarg\b|\bsonmarg\b/.test(t)) return 'Sonamarg';
  if (/\bgulmarg\b/.test(t)) return 'Gulmarg';
  if (/\bpahalgam\b/.test(t)) return 'Pahalgam';
  if (/\bsrinagar\b|\bdal lake\b|\bmughal garden/.test(t)) return 'Srinagar';
  if (/\bjammu\b/.test(t)) return 'Jammu';
  if (/\bleh\b|\bladakh\b/.test(t)) return 'Leh';
  return 'Srinagar';
}

export const LEDGER_CATEGORIES = [
  'hotel',
  'cab',
  'meal',
  'activity',
  'transport',
  'office',
  'other',
] as const;

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

export const EXPENSE_CATEGORIES = LEDGER_CATEGORIES;

const LEGACY_CATEGORY_MAP: Record<string, LedgerCategory> = {
  hotel: 'hotel',
  cab: 'cab',
  meal: 'meal',
  activity: 'activity',
  transport: 'transport',
  office: 'office',
  other: 'other',
  driver: 'transport',
  misc: 'other',
  vendor: 'hotel',
  staff: 'office',
  trip: 'transport',
  food: 'meal',
};

export function normalizeCategory(category: string): LedgerCategory {
  const c = category.toLowerCase().trim();
  return LEGACY_CATEGORY_MAP[c] ?? 'other';
}

export function isValidLedgerCategory(category: string): boolean {
  return LEDGER_CATEGORIES.includes(normalizeCategory(category));
}

export function formatCategoryLabel(category: string): string {
  const c = normalizeCategory(category);
  const labels: Record<LedgerCategory, string> = {
    hotel: 'Hotels',
    cab: 'Cabs',
    meal: 'Meals',
    activity: 'Activities',
    transport: 'Transport',
    office: 'Offices',
    other: 'Other',
  };
  return labels[c];
}

export function ledgerCategoryErrorMessage(raw?: string): string {
  return `Invalid category “${raw ?? ''}”. Choose one of: ${LEDGER_CATEGORIES.map(formatCategoryLabel).join(', ')}.`;
}

export const VENDOR_LABEL_BY_CATEGORY: Record<LedgerCategory, string> = {
  hotel: 'Hotel / property name',
  cab: 'Cab / transport vendor',
  meal: 'Restaurant / meal vendor',
  activity: 'Activity / sightseeing vendor',
  transport: 'Transport vendor',
  office: 'Office expense (rent, bills, etc.)',
  other: 'Vendor / description',
};

export type BookingVoucherStay = {
  destination: string;
  check_in: string;
  check_out: string;
  acc_type: string;
  acc_name: string;
  room_category?: string;
  status: string;
};

export type BookingVoucherPayload = {
  meal_plan?: string;
  pax?: number;
  adults?: number;
  children?: number;
  rooms?: number;
  nights?: number;
  extra_beds?: number;
  child_without_bed?: number;
  cab_name?: string;
  cab_driver?: string;
  cab_contact?: string;
  accommodations?: BookingVoucherStay[];
  payment_status?: string;
  advance_paid?: number;
  total_amount?: number;
  terms_conditions?: string;
};
