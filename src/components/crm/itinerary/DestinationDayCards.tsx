'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export type DestinationDetail = {
  id: string;
  name: string;
  base_location: string;
  route_from: string | null;
  route_to: string | null;
  description: string | null;
  featured_image_url: string | null;
};

export default function DestinationDayCards({
  destinationIds,
  onRemoveDestination,
}: {
  destinationIds: string[];
  onRemoveDestination?: (id: string) => void;
}) {
  const [dests, setDests] = useState<DestinationDetail[]>([]);
  const [gallery, setGallery] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const ids = [...new Set(destinationIds)].filter(Boolean);
    if (ids.length === 0) {
      setDests([]);
      setGallery({});
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from('crm_destinations')
        .select('id,name,base_location,route_from,route_to,description,featured_image_url')
        .in('id', ids);
      setDests((data || []) as DestinationDetail[]);
      const { data: imgs } = await supabase
        .from('crm_destination_images')
        .select('destination_id,image_url,sort_order')
        .in('destination_id', ids)
        .order('sort_order');
      const byDest: Record<string, string[]> = {};
      for (const row of imgs || []) {
        const did = String((row as { destination_id: string }).destination_id);
        const url = String((row as { image_url: string }).image_url);
        if (!byDest[did]) byDest[did] = [];
        if (byDest[did].length < 4) byDest[did].push(url);
      }
      setGallery(byDest);
    })();
  }, [destinationIds.join(',')]);

  if (dests.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-semibold text-teal-900">Destinations on this day</p>
      {dests.map((d) => {
        const imgs = [
          ...(d.featured_image_url ? [d.featured_image_url] : []),
          ...(gallery[d.id] || []).filter((u) => u !== d.featured_image_url),
        ].slice(0, 4);
        return (
          <div key={d.id} className="rounded-xl border border-teal-200 bg-white shadow-sm overflow-hidden">
            {imgs[0] ? (
              <div className="relative h-32 w-full">
                <Image src={imgs[0]} alt="" fill className="object-cover" sizes="400px" />
              </div>
            ) : null}
            <div className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 min-w-0 flex-1">
                {imgs[0] ? null : (
                  <div className="h-12 w-16 shrink-0 rounded-lg bg-teal-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-teal-950">{d.name}</p>
                  <p className="text-xs text-teal-800">
                    {d.base_location}
                    {d.route_from && d.route_to ? ` · ${d.route_from} → ${d.route_to}` : ''}
                  </p>
                  {d.description ? (
                    <p className="text-xs text-gray-700 mt-1.5 whitespace-pre-wrap">{d.description}</p>
                  ) : null}
                </div>
              </div>
              {onRemoveDestination && (
                <button
                  type="button"
                  onClick={() => onRemoveDestination(d.id)}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800 hover:underline px-2 py-1 rounded"
                  title="Remove destination from this day"
                >
                  Remove
                </button>
              )}
            </div>
            {imgs.length > 1 ? (
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {imgs.slice(1).map((url, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-md border border-teal-100">
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                ))}
              </div>
            ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
