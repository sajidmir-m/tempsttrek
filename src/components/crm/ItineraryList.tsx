'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Search } from 'lucide-react';
import ItineraryEditor from './ItineraryEditor';
import type { CRMItineraryRow } from './types';

export default function ItineraryList() {
  const search = useSearchParams();
  const editId = search.get('edit') || '';
  const [rows, setRows] = useState<CRMItineraryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [canDelete, setCanDelete] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        setCanDelete((prof?.role || 'user') === 'admin');
      }

      const { data, error } = await supabase
        .from('crm_itineraries')
        .select('id,title,customer_name,customer_phone,travel_start,travel_end,status,updated_at,sections,cover_image_url,itinerary_body,internal_notes,customer_email')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setRows((data || []) as CRMItineraryRow[]);
    } catch (e: any) {
      alert('Failed to load itineraries: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.title,
        r.customer_name || '',
        r.customer_phone || '',
        r.status || '',
        r.travel_start || '',
        r.travel_end || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="crm-surface min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-700">CRM</p>
          <h1 className="text-xl font-extrabold text-gray-900 mt-2">Itineraries</h1>
          <p className="text-sm text-gray-600 mt-1">Create structured itineraries with images and export to PDF.</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-stretch gap-2">
          <div className="flex min-w-0 flex-1 basis-[12rem] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:max-w-xs sm:flex-none">
            <Search size={16} className="shrink-0 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search itineraries…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <a
            href="/crm/itineraries?edit=new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
          >
            <Plus size={18} /> New itinerary
          </a>
        </div>
      </div>

      {editId ? (
        <ItineraryEditor
          itineraryId={editId === 'new' ? undefined : editId}
          canDelete={canDelete}
          onDone={async () => {
            await fetchRows();
            window.history.replaceState({}, '', '/crm/itineraries');
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="-mx-px overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Guest</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No itineraries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-900">{r.title}</td>
                      <td className="px-5 py-3">{[r.customer_name, r.customer_phone].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{[r.travel_start, r.travel_end].filter(Boolean).join(' → ') || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a href={`/crm/itineraries?edit=${r.id}`} className="font-semibold text-teal-700 hover:underline">
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

