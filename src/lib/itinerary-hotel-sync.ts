import { supabase } from '@/lib/supabase';
import type { ItineraryNightStay } from '@/components/crm/types';

/** Sync crm_itinerary_hotels from night_stays (source of truth in sections JSON). */
export async function syncItineraryHotelsFromNightStays(
  itineraryId: string,
  nightStays: ItineraryNightStay[]
): Promise<{ ok: boolean; error?: string }> {
  const { error: delErr } = await supabase.from('crm_itinerary_hotels').delete().eq('itinerary_id', itineraryId);
  if (delErr) return { ok: false, error: delErr.message };

  const rows = nightStays
    .filter((s) => s.hotel_id)
    .map((s, idx) => ({
      itinerary_id: itineraryId,
      hotel_id: s.hotel_id!,
      night_number: s.night,
      day_number: s.night,
      nights: 1,
      notes: [s.room_category, s.meal_plan].filter(Boolean).join(' · ') || null,
      sort_order: idx * 10 + 10,
    }));

  if (rows.length === 0) return { ok: true };

  const { error } = await supabase.from('crm_itinerary_hotels').insert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
