'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { inferBaseLocationFromDayText } from '@/lib/crm-catalog';
import { MapPin } from 'lucide-react';

type Dest = {
  id: string;
  name: string;
  base_location: string;
  route_from: string | null;
  route_to: string | null;
  description: string | null;
};

export default function ItineraryDestinationSuggest({
  dayTitle,
  dayBody,
  onInsertRoute,
}: {
  dayTitle: string;
  dayBody: string;
  onInsertRoute: (text: string) => void;
}) {
  const [all, setAll] = useState<Dest[]>([]);

  useEffect(() => {
    void supabase
      .from('crm_destinations')
      .select('id,name,base_location,route_from,route_to,description')
      .eq('status', 'active')
      .order('sort_order')
      .then(({ data }) => setAll((data || []) as Dest[]));
  }, []);

  const base = useMemo(() => inferBaseLocationFromDayText(`${dayTitle} ${dayBody}`), [dayTitle, dayBody]);

  const suggested = useMemo(() => {
    const list = all.filter((d) => d.base_location === base);
    if (list.length > 0) return list;
    return all.filter((d) => d.base_location === 'Srinagar').slice(0, 6);
  }, [all, base]);

  if (suggested.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
      <p className="flex items-center gap-1 text-xs font-bold text-teal-800">
        <MapPin size={12} />
        Suggested for {base}
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {suggested.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className="rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs font-semibold text-teal-900 hover:bg-teal-100"
              title={d.description || undefined}
              onClick={() => {
                const line = [d.name, d.route_from && d.route_to ? `(${d.route_from} → ${d.route_to})` : '']
                  .filter(Boolean)
                  .join(' ');
                onInsertRoute(line);
              }}
            >
              {d.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
