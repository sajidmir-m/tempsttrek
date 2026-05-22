'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { buildHotelNotesFromNightStays, buildNightStaysForRange } from '@/lib/itinerary-utils';
import type { ItineraryNightStay, ItinerarySections } from '../types';

type HotelOption = {
  id: string;
  name: string;
  location: string | null;
  category: string | null;
  hotel_type: string | null;
  featured_image_url: string | null;
};

export default function ItineraryNightHotelsPanel({
  travelStart,
  travelEnd,
  sections,
  onSectionsChange,
}: {
  travelStart: string | null;
  travelEnd: string | null;
  sections: ItinerarySections;
  onSectionsChange: (next: ItinerarySections) => void;
}) {
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [roomCategories, setRoomCategories] = useState<{ id: string; name: string }[]>([]);

  const load = useCallback(async () => {
    const [hRes, rRes] = await Promise.all([
      supabase
        .from('crm_hotels')
        .select('id,name,location,category,hotel_type,featured_image_url')
        .eq('is_active', true)
        .order('name'),
      supabase.from('crm_room_categories').select('id,name').eq('status', 'active').order('sort_order'),
    ]);
    setHotels((hRes.data || []) as HotelOption[]);
    setRoomCategories((rRes.data || []) as { id: string; name: string }[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const nightStays = useMemo(() => {
    if (!travelStart || !travelEnd) return sections.night_stays || [];
    return buildNightStaysForRange(travelStart, travelEnd, sections.night_stays || []);
  }, [travelStart, travelEnd, sections.night_stays]);

  const hotelMap = useMemo(() => {
    const m = new Map<string, { name: string; location: string | null; category: string | null }>();
    for (const h of hotels) m.set(h.id, { name: h.name, location: h.location, category: h.category });
    return m;
  }, [hotels]);

  const updateStays = (stays: ItineraryNightStay[]) => {
    const hotel_notes = buildHotelNotesFromNightStays(stays, hotelMap);
    const hotelInclusions = stays
      .filter((s) => s.hotel_id)
      .map((s) => {
        const h = hotelMap.get(s.hotel_id!);
        return `Night ${s.night}: ${h?.name || 'Hotel'} (${s.meal_plan || 'MAP'})`;
      });
    onSectionsChange({
      ...sections,
      night_stays: stays,
      hotel_notes,
      inclusions: [
        ...sections.inclusions.filter((i) => !i.startsWith('Night ') || !i.includes(': Hotel')),
        ...hotelInclusions,
      ],
    });
  };

  const patchNight = (night: number, patch: Partial<ItineraryNightStay>) => {
    const next = nightStays.map((s) => (s.night === night ? { ...s, ...patch } : s));
    updateStays(next);
  };

  if (!travelStart || !travelEnd) {
    return (
      <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
        <h4 className="font-extrabold text-gray-900">Hotel accommodation (per night)</h4>
        <p className="text-sm text-amber-800 mt-1">Set travel start and end dates to assign a hotel for each night.</p>
      </section>
    );
  }

  if (nightStays.length === 0) {
    return (
      <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
        <p className="text-sm text-amber-800">End date must be after start date to calculate nights.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5 space-y-4">
      <div>
        <h4 className="font-extrabold text-emerald-950">Hotel accommodation — per night</h4>
        <p className="text-xs text-emerald-800/90 mt-1">
          {nightStays.length} night(s) from {travelStart} to {travelEnd}. Select a hotel from your catalog for each night.
        </p>
      </div>

      <div className="space-y-3">
        {nightStays.map((stay) => {
          const hotel = hotels.find((h) => h.id === stay.hotel_id);
          return (
            <div key={stay.night} className="rounded-xl border border-white bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
                  N{stay.night}
                </div>
                {hotel?.featured_image_url ? (
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border">
                    <Image src={hotel.featured_image_url} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1 text-xs text-gray-500">
                  Check-in <strong className="text-gray-800">{stay.check_in}</strong> · Check-out{' '}
                  <strong className="text-gray-800">{stay.check_out}</strong>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Hotel *</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white"
                    value={stay.hotel_id || ''}
                    onChange={(e) => patchNight(stay.night, { hotel_id: e.target.value || null })}
                  >
                    <option value="">— Select hotel —</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.location ? `· ${h.location}` : ''} {h.hotel_type ? `(${h.hotel_type})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500">Room category</label>
                  <select
                    className="mt-1 w-full border rounded-lg px-2 py-2 text-sm"
                    value={stay.room_category || ''}
                    onChange={(e) => patchNight(stay.night, { room_category: e.target.value })}
                  >
                    <option value="">—</option>
                    {roomCategories.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500">Meal plan</label>
                  <select
                    className="mt-1 w-full border rounded-lg px-2 py-2 text-sm"
                    value={stay.meal_plan || 'MAP'}
                    onChange={(e) => patchNight(stay.night, { meal_plan: e.target.value })}
                  >
                    <option value="EP">EP</option>
                    <option value="CP">CP</option>
                    <option value="MAP">MAP</option>
                    <option value="AP">AP</option>
                    <option value="MAPAI">MAPAI</option>
                  </select>
                </div>
              </div>
              {hotel ? (
                <p className="mt-2 text-xs font-semibold text-emerald-900">
                  Night {stay.night}: {hotel.name}
                  {stay.room_category ? ` · ${stay.room_category}` : ''} · {stay.meal_plan || 'MAP'}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
