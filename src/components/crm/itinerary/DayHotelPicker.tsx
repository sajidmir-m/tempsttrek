'use client';

import Image from 'next/image';
import { BedDouble } from 'lucide-react';
import { nightStayForDay } from '@/lib/itinerary-utils';
import type { ItineraryNightStay } from '../types';

export type CatalogHotel = {
  id: string;
  name: string;
  location: string | null;
  hotel_type: string | null;
  featured_image_url: string | null;
};

export default function DayHotelPicker({
  dayNumber,
  nightStays,
  hotels,
  roomCategories,
  travelDatesSet,
  onPatchNight,
}: {
  dayNumber: number;
  nightStays: ItineraryNightStay[];
  hotels: CatalogHotel[];
  roomCategories: { id: string; name: string }[];
  travelDatesSet: boolean;
  onPatchNight: (night: number, patch: Partial<ItineraryNightStay>) => void;
}) {
  const stay = nightStayForDay(dayNumber, nightStays);
  const hotel = stay?.hotel_id ? hotels.find((h) => h.id === stay.hotel_id) : null;

  if (!travelDatesSet) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <BedDouble size={14} className="inline mr-1" />
        Set travel dates above to assign hotel for Day {dayNumber}.
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
        No night slot for Day {dayNumber} — extend your travel end date.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white p-3 sm:p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1">
        <BedDouble size={12} />
        Hotel for Day {dayNumber}
        <span className="font-normal text-emerald-700/80">· Night {stay.night}</span>
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold uppercase text-gray-500">Select hotel</label>
          <select
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm"
            value={stay.hotel_id || ''}
            onChange={(e) => onPatchNight(stay.night, { hotel_id: e.target.value || null })}
          >
            <option value="">— Choose hotel for Day {dayNumber} —</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
                {h.location ? ` · ${h.location}` : ''}
                {h.hotel_type ? ` (${h.hotel_type})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-gray-500">Room category</label>
          <select
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
            value={stay.room_category || ''}
            onChange={(e) => onPatchNight(stay.night, { room_category: e.target.value })}
          >
            <option value="">— Room —</option>
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
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white"
            value={stay.meal_plan || 'MAP'}
            onChange={(e) => onPatchNight(stay.night, { meal_plan: e.target.value })}
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
        <div className="mt-3 flex gap-3 rounded-lg border border-white bg-white/80 p-2.5 shadow-sm">
          {hotel.featured_image_url ? (
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image src={hotel.featured_image_url} alt="" fill className="object-cover" sizes="96px" />
            </div>
          ) : (
            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <BedDouble size={24} />
            </div>
          )}
          <div className="min-w-0 text-sm">
            <p className="font-bold text-gray-900">{hotel.name}</p>
            {hotel.location ? <p className="text-xs text-gray-600">{hotel.location}</p> : null}
            <p className="text-xs text-emerald-900 mt-0.5 font-semibold">
              {stay.room_category || 'Room'} · {stay.meal_plan || 'MAP'}
            </p>
            <p className="text-[11px] text-gray-500">
              {stay.check_in} → {stay.check_out}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
