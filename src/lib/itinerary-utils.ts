import type { ItineraryNightStay, ItinerarySections, ItineraryDay } from '@/components/crm/types';

export function parseYmd(ymd: string): Date {
  return new Date(`${ymd}T12:00:00`);
}

export function addDaysYmd(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Nights between check-in and check-out (hotel style: 4 nights = start + 4 days end). */
export function countNightsBetween(travelStart: string | null, travelEnd: string | null): number {
  if (!travelStart || !travelEnd) return 0;
  const a = parseYmd(travelStart).getTime();
  const b = parseYmd(travelEnd).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.max(1, Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

export function countDaysBetween(travelStart: string | null, travelEnd: string | null): number {
  const nights = countNightsBetween(travelStart, travelEnd);
  return nights > 0 ? nights + 1 : 0;
}

/** Day 1 maps to night 1 (check-in night for that calendar day in the plan). */
export function nightStayForDay(dayNumber: number, stays: ItineraryNightStay[]): ItineraryNightStay | undefined {
  return stays.find((s) => s.night === dayNumber);
}

export function nightCheckDates(travelStart: string, night: number): { check_in: string; check_out: string } {
  const check_in = addDaysYmd(travelStart, night - 1);
  const check_out = addDaysYmd(travelStart, night);
  return { check_in, check_out };
}

export function buildNightStaysForRange(
  travelStart: string | null,
  travelEnd: string | null,
  existing: ItineraryNightStay[] = []
): ItineraryNightStay[] {
  const count = countNightsBetween(travelStart, travelEnd);
  if (!travelStart || count === 0) return [];
  const byNight = new Map(existing.map((n) => [n.night, n]));
  return Array.from({ length: count }, (_, i) => {
    const night = i + 1;
    const prev = byNight.get(night);
    const dates = nightCheckDates(travelStart, night);
    return {
      night,
      hotel_id: prev?.hotel_id ?? null,
      room_category: prev?.room_category ?? '',
      meal_plan: prev?.meal_plan ?? 'MAP',
      check_in: dates.check_in,
      check_out: dates.check_out,
    };
  });
}

export function buildHotelNotesFromNightStays(
  stays: ItineraryNightStay[],
  hotelNames: Map<string, { name: string; location: string | null; category: string | null }>
): string {
  return stays
    .filter((s) => s.hotel_id)
    .map((s) => {
      const h = hotelNames.get(s.hotel_id!);
      const loc = h?.location ? ` (${h.location})` : '';
      const meal = s.meal_plan ? ` · ${s.meal_plan}` : '';
      const room = s.room_category ? ` · ${s.room_category}` : '';
      return `Night ${s.night}: ${h?.name || 'Hotel'}${loc}${room}${meal} (${s.check_in} → ${s.check_out})`;
    })
    .join('\n');
}

export function normalizeItinerarySections(raw: ItinerarySections | Record<string, unknown> | null | undefined): ItinerarySections {
  const s = (raw || {}) as Partial<ItinerarySections>;
  const daysRaw = Array.isArray(s.days) ? (s.days as ItineraryDay[]) : [];
  const days =
    daysRaw.length > 0
      ? daysRaw.map((d, idx) => ({
          day: idx + 1,
          title: d?.title || `Day ${idx + 1}`,
          body: d?.body || '',
          destination_ids: Array.isArray(d.destination_ids) ? d.destination_ids : [],
        }))
      : [
          { day: 1, title: 'Arrival & Srinagar', body: '', destination_ids: [] },
          { day: 2, title: 'Local sightseeing', body: '', destination_ids: [] },
        ];

  const night_stays = Array.isArray(s.night_stays)
    ? (s.night_stays as ItineraryNightStay[]).map((n) => ({
        night: Number(n.night) || 1,
        hotel_id: n.hotel_id || null,
        room_category: n.room_category || '',
        meal_plan: n.meal_plan || 'MAP',
        check_in: n.check_in || '',
        check_out: n.check_out || '',
      }))
    : [];

  return {
    days,
    night_stays,
    inclusions: Array.isArray(s.inclusions) ? (s.inclusions as string[]).filter(Boolean) : ['Hotel stay', 'Private cab'],
    exclusions: Array.isArray(s.exclusions) ? (s.exclusions as string[]).filter(Boolean) : [],
    transfers: typeof s.transfers === 'string' ? s.transfers : '',
    hotel_notes: typeof s.hotel_notes === 'string' ? s.hotel_notes : '',
    disclaimer: typeof s.disclaimer === 'string' ? s.disclaimer : undefined,
    terms_conditions: typeof s.terms_conditions === 'string' ? s.terms_conditions : undefined,
    cancellation_policy: typeof s.cancellation_policy === 'string' ? s.cancellation_policy : undefined,
    how_to_reach: typeof s.how_to_reach === 'string' ? s.how_to_reach : undefined,
    package_summary:
      s.package_summary && typeof s.package_summary === 'object'
        ? (s.package_summary as ItinerarySections['package_summary'])
        : undefined,
  };
}
