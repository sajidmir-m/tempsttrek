'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { nightStayForDay } from '@/lib/itinerary-utils';
import type { ItineraryNightStay } from '../types';
import { BedDouble } from 'lucide-react';

type HotelInfo = {
  id: string;
  name: string;
  location: string | null;
  hotel_type: string | null;
  featured_image_url: string | null;
};

export default function DayHotelStayStrip({
  dayNumber,
  nightStays,
}: {
  dayNumber: number;
  nightStays: ItineraryNightStay[];
}) {
  const stay = nightStayForDay(dayNumber, nightStays);
  const [hotel, setHotel] = useState<HotelInfo | null>(null);

  useEffect(() => {
    if (!stay?.hotel_id) {
      setHotel(null);
      return;
    }
    void supabase
      .from('crm_hotels')
      .select('id,name,location,hotel_type,featured_image_url')
      .eq('id', stay.hotel_id)
      .maybeSingle()
      .then(({ data }) => setHotel((data as HotelInfo) || null));
  }, [stay?.hotel_id]);

  if (!stay) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-500">
        <BedDouble size={14} className="inline mr-1 opacity-60" />
        No hotel linked for Day {dayNumber} (set travel dates and assign Night {dayNumber} in accommodation panel).
      </div>
    );
  }

  if (!stay.hotel_id) {
    return (
      <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
        <BedDouble size={14} className="inline mr-1" />
        Night {stay.night} (Day {dayNumber}): hotel not selected yet — assign in <strong>Hotel accommodation — per night</strong> above.
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      {hotel?.featured_image_url ? (
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white">
          <Image src={hotel.featured_image_url} alt="" fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
          <BedDouble size={22} />
        </div>
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Stay for Day {dayNumber} · Night {stay.night}</p>
        <p className="font-bold text-gray-900">{hotel?.name || 'Hotel'}</p>
        {hotel?.location ? <p className="text-xs text-gray-600">{hotel.location}</p> : null}
        <p className="text-xs text-gray-700 mt-0.5">
          {stay.room_category ? <span className="font-semibold">{stay.room_category}</span> : 'Room TBD'}
          {stay.meal_plan ? ` · ${stay.meal_plan}` : ''}
          {stay.check_in ? ` · ${stay.check_in} → ${stay.check_out}` : ''}
        </p>
        {hotel?.hotel_type ? <p className="text-[11px] text-gray-500 capitalize">{hotel.hotel_type}</p> : null}
      </div>
    </div>
  );
}
