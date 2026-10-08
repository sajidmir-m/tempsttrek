'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
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
  featured_image_url: string | null;
};

export default function DestinationTypeahead({
  dayTitle,
  dayBody,
  destinationIds,
  onSelectDestination,
}: {
  dayTitle: string;
  dayBody: string;
  destinationIds: string[];
  onSelectDestination: (dest: Dest) => void;
}) {
  const [all, setAll] = useState<Dest[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void supabase
      .from('crm_destinations')
      .select('id,name,base_location,route_from,route_to,description,featured_image_url')
      .eq('status', 'active')
      .order('sort_order')
      .then(({ data }) => setAll((data || []) as Dest[]));
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const base = useMemo(() => inferBaseLocationFromDayText(`${dayTitle} ${dayBody} ${query}`), [dayTitle, dayBody, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all;
    if (q) {
      list = all.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.base_location.toLowerCase().includes(q) ||
          (d.route_from || '').toLowerCase().includes(q) ||
          (d.route_to || '').toLowerCase().includes(q)
      );
    } else {
      const byBase = all.filter((d) => d.base_location === base);
      list = byBase.length > 0 ? byBase : all.filter((d) => d.base_location === 'Srinagar').slice(0, 8);
    }
    return list.slice(0, 12);
  }, [all, query, base]);

  const linked = useMemo(
    () => all.filter((d) => destinationIds.includes(d.id)),
    [all, destinationIds]
  );

  return (
    <div className="mt-3 space-y-2" ref={wrapRef}>
      <label className="flex items-center gap-1 text-xs font-bold text-teal-800">
        <MapPin size={12} />
        Search destinations
      </label>
      <input
        type="text"
        className="w-full border border-teal-200 rounded-xl px-3 py-2 text-sm bg-white"
        placeholder="Type Srinagar, Gulmarg, Sonamarg…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 ? (
        <ul className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {filtered.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-teal-50"
                onClick={() => {
                  onSelectDestination(d);
                  setQuery('');
                  setOpen(false);
                }}
              >
                {d.featured_image_url ? (
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
                    <Image src={d.featured_image_url} alt="" fill className="object-cover" sizes="56px" />
                  </div>
                ) : (
                  <div className="h-10 w-14 shrink-0 rounded-md bg-slate-100" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-900 block truncate">{d.name}</span>
                  <span className="text-xs text-slate-500 block">
                    {d.base_location}
                    {d.route_from && d.route_to ? ` · ${d.route_from} → ${d.route_to}` : ''}
                  </span>
                  {d.description ? (
                    <span className="text-[11px] text-slate-600 line-clamp-2 block mt-0.5">{d.description}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {linked.length > 0 ? (
        <p className="text-xs font-semibold text-teal-800">Linked destinations (shown on PDF)</p>
      ) : null}
    </div>
  );
}
