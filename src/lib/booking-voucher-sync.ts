import type { BookingVoucherPayload } from '@/lib/crm-catalog';

export type BookingVoucherRecord = {
  id: string;
  itinerary_id: string | null;
  booking_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  travel_start: string | null;
  travel_end: string | null;
  meal_plan: string | null;
  pax: number | null;
  rooms: number | null;
  nights: number | null;
  extra_beds: number | null;
  child_without_bed: number | null;
  total_amount: number | null;
  advance_paid: number | null;
  payment_status: string;
  cab_details: Record<string, unknown> | null;
  accommodations: unknown;
  terms_conditions: string | null;
  status: string;
  created_at: string;
};

export function cabDetailsFromPayload(p: BookingVoucherPayload): Record<string, unknown> {
  return {
    cab_name: p.cab_name || '',
    cab_driver: p.cab_driver || '',
    cab_contact: p.cab_contact || '',
  };
}

export function payloadFromCabDetails(cab: Record<string, unknown> | null | undefined): Pick<BookingVoucherPayload, 'cab_name' | 'cab_driver' | 'cab_contact'> {
  const c = cab || {};
  return {
    cab_name: String(c.cab_name || ''),
    cab_driver: String(c.cab_driver || ''),
    cab_contact: String(c.cab_contact || ''),
  };
}

export function payloadFromVoucherRow(row: BookingVoucherRecord): BookingVoucherPayload {
  const cab = payloadFromCabDetails(row.cab_details);
  return {
    meal_plan: row.meal_plan || undefined,
    pax: row.pax ?? undefined,
    rooms: row.rooms ?? undefined,
    nights: row.nights ?? undefined,
    extra_beds: row.extra_beds ?? undefined,
    child_without_bed: row.child_without_bed ?? undefined,
    accommodations: Array.isArray(row.accommodations) ? (row.accommodations as BookingVoucherPayload['accommodations']) : [],
    payment_status: row.payment_status,
    advance_paid: Number(row.advance_paid) || 0,
    total_amount: Number(row.total_amount) || 0,
    terms_conditions: row.terms_conditions || undefined,
    ...cab,
  };
}

export function rowPatchFromPayload(
  payload: BookingVoucherPayload,
  meta: {
    booking_id: string;
    customer_name: string;
    customer_phone?: string | null;
    customer_email?: string | null;
    itinerary_id?: string | null;
    travel_start?: string | null;
    travel_end?: string | null;
  }
) {
  return {
    booking_id: meta.booking_id.trim(),
    customer_name: meta.customer_name.trim(),
    customer_phone: meta.customer_phone?.trim() || null,
    customer_email: meta.customer_email?.trim() || null,
    itinerary_id: meta.itinerary_id || null,
    travel_start: meta.travel_start || null,
    travel_end: meta.travel_end || null,
    meal_plan: payload.meal_plan || null,
    pax: payload.pax ?? 0,
    rooms: payload.rooms ?? 0,
    nights: payload.nights ?? 0,
    extra_beds: payload.extra_beds ?? 0,
    child_without_bed: payload.child_without_bed ?? 0,
    total_amount: payload.total_amount ?? 0,
    advance_paid: payload.advance_paid ?? 0,
    payment_status: payload.payment_status || 'pending',
    cab_details: cabDetailsFromPayload(payload),
    accommodations: payload.accommodations || [],
    terms_conditions: payload.terms_conditions || null,
    updated_at: new Date().toISOString(),
  };
}

/** Keep itinerary JSON in sync for print fallbacks. */
export async function syncItineraryBookingVoucherJson(
  itineraryId: string | null,
  payload: BookingVoucherPayload,
  quotePrice?: number | null
) {
  if (!itineraryId) return;
  const { supabase } = await import('@/lib/supabase');
  await supabase
    .from('crm_itineraries')
    .update({
      booking_voucher: payload,
      quote_price: payload.total_amount ?? quotePrice ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itineraryId);
}
