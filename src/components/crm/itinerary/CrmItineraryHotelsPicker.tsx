'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import type { ItinerarySections } from '../types';

type LinkedHotel = {
  id: string;
  hotel_id: string;
  day_number: number | null;
  nights: number;
  notes: string | null;
  crm_hotels: { name: string; location: string | null; price_per_night: number | null } | null;
};

export default function CrmItineraryHotelsPicker({
  itineraryId,
  sections,
  onSectionsChange,
}: {
  itineraryId?: string;
  sections: ItinerarySections;
  onSectionsChange: (next: ItinerarySections) => void;
}) {
  const [hotels, setHotels] = useState<{ id: string; name: string; location: string | null }[]>([]);
  const [linked, setLinked] = useState<LinkedHotel[]>([]);
  const [pickId, setPickId] = useState('');
  const [dayNum, setDayNum] = useState('1');
  const [nights, setNights] = useState('1');

  const loadHotels = useCallback(async () => {
    const { data } = await supabase
      .from('crm_hotels')
      .select('id,name,location')
      .eq('is_active', true)
      .order('name');
    setHotels((data || []) as { id: string; name: string; location: string | null }[]);
  }, []);

  const loadLinked = useCallback(async () => {
    if (!itineraryId) {
      setLinked([]);
      return;
    }
    const { data, error } = await supabase
      .from('crm_itinerary_hotels')
      .select('id,hotel_id,day_number,nights,notes,crm_hotels(name,location,price_per_night)')
      .eq('itinerary_id', itineraryId)
      .order('sort_order');
    if (!error) {
      setLinked(
        (data || []).map((row: Record<string, unknown>) => {
          const h = row.crm_hotels;
          const hotel = Array.isArray(h) ? h[0] : h;
          return {
            id: String(row.id),
            hotel_id: String(row.hotel_id),
            day_number: row.day_number != null ? Number(row.day_number) : null,
            nights: Number(row.nights) || 1,
            notes: (row.notes as string) || null,
            crm_hotels: hotel
              ? {
                  name: String((hotel as { name: string }).name),
                  location: ((hotel as { location: string | null }).location as string) ?? null,
                  price_per_night: (hotel as { price_per_night: number | null }).price_per_night ?? null,
                }
              : null,
          };
        })
      );
    }
  }, [itineraryId]);

  useEffect(() => {
    void loadHotels();
    void loadLinked();
  }, [loadHotels, loadLinked]);

  const syncHotelNotes = (items: LinkedHotel[]) => {
    const lines = items.map((l) => {
      const h = l.crm_hotels;
      const day = l.day_number != null ? `Day ${l.day_number}` : 'General';
      const loc = h?.location ? ` (${h.location})` : '';
      const price = h?.price_per_night != null ? ` — ₹${h.price_per_night}/night` : '';
      return `${day}: ${h?.name || 'Hotel'}${loc}${price} · ${l.nights} night(s)`;
    });
    onSectionsChange({
      ...sections,
      hotel_notes: lines.join('\n'),
      inclusions: [
        ...sections.inclusions.filter((i) => !i.startsWith('Hotel:')),
        ...items.map((l) => `Hotel: ${l.crm_hotels?.name || 'Property'} (${l.nights}N)`),
      ],
    });
  };

  const addHotel = async () => {
    if (!itineraryId) {
      alert('Save the itinerary first, then add hotels.');
      return;
    }
    if (!pickId) return;
    const day = Number.parseInt(dayNum, 10);
    const n = Number.parseInt(nights, 10) || 1;
    const { error } = await supabase.from('crm_itinerary_hotels').insert({
      itinerary_id: itineraryId,
      hotel_id: pickId,
      day_number: Number.isFinite(day) ? day : null,
      nights: n,
      sort_order: linked.length * 10 + 10,
    });
    if (error) {
      alert(error.message);
      return;
    }
    await loadLinked();
    const { data } = await supabase
      .from('crm_itinerary_hotels')
      .select('id,hotel_id,day_number,nights,notes,crm_hotels(name,location,price_per_night)')
      .eq('itinerary_id', itineraryId)
      .order('sort_order');
    const next = (data || []).map((row: Record<string, unknown>) => {
      const h = row.crm_hotels;
      const hotel = Array.isArray(h) ? h[0] : h;
      return {
        id: String(row.id),
        hotel_id: String(row.hotel_id),
        day_number: row.day_number != null ? Number(row.day_number) : null,
        nights: Number(row.nights) || 1,
        notes: (row.notes as string) || null,
        crm_hotels: hotel
          ? {
              name: String((hotel as { name: string }).name),
              location: ((hotel as { location: string | null }).location as string) ?? null,
              price_per_night: (hotel as { price_per_night: number | null }).price_per_night ?? null,
            }
          : null,
      };
    }) as LinkedHotel[];
    setLinked(next);
    syncHotelNotes(next);
    setPickId('');
  };

  const removeLinked = async (id: string) => {
    if (!itineraryId) return;
    await supabase.from('crm_itinerary_hotels').delete().eq('id', id);
    const next = linked.filter((l) => l.id !== id);
    setLinked(next);
    syncHotelNotes(next);
  };

  return (
    <section className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
      <h4 className="text-sm font-bold text-emerald-900">Hotels on this itinerary</h4>
      <p className="text-xs text-emerald-800/80">
        Pick from your hotel catalog. Selected hotels update hotel notes and inclusions automatically.
      </p>

      {!itineraryId ? (
        <p className="text-xs text-amber-800">Save the itinerary once to link hotels.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="min-w-[180px] flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-500">Hotel</label>
              <select
                className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white"
                value={pickId}
                onChange={(e) => setPickId(e.target.value)}
              >
                <option value="">Select hotel…</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} {h.location ? `— ${h.location}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold uppercase text-gray-500">Day</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border rounded-lg px-2 py-2 text-sm"
                value={dayNum}
                onChange={(e) => setDayNum(e.target.value)}
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold uppercase text-gray-500">Nights</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border rounded-lg px-2 py-2 text-sm"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => void addHotel()}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <ul className="space-y-2">
            {linked.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 rounded-lg bg-white border border-gray-100 px-3 py-2 text-sm">
                <span>
                  <strong>{l.crm_hotels?.name}</strong>
                  {l.day_number != null && <span className="text-gray-500"> · Day {l.day_number}</span>}
                  <span className="text-gray-500"> · {l.nights}N</span>
                </span>
                <button type="button" className="text-red-600 p-1" onClick={() => void removeLinked(l.id)}>
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {linked.length === 0 && <li className="text-xs text-gray-500">No hotels linked yet.</li>}
          </ul>
        </>
      )}
    </section>
  );
}
