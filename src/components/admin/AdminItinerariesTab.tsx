'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Save, ClipboardList } from 'lucide-react';

export type CRMItinerary = {
  id: string;
  title: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  travel_start: string | null;
  travel_end: string | null;
  status: 'draft' | 'sent' | 'confirmed' | 'archived';
  itinerary_body: string;
  internal_notes: string | null;
};

const blankTemplate = () =>
  `Day 1 —
Day 2 —
Day 3 —

Inclusions / exclusions:
Transfers:
Hotel notes:`;

export default function AdminItinerariesTab({ canDelete }: { canDelete: boolean }) {
  const [rows, setRows] = useState<CRMItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Partial<CRMItinerary> | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_itineraries')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) setRows(data as CRMItinerary[]);
    } catch {
      console.error('crm_itineraries fetch failed — apply SQL migration?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const startNew = () => {
    setDraft({
      title: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      travel_start: '',
      travel_end: '',
      status: 'draft',
      itinerary_body: blankTemplate(),
      internal_notes: '',
    });
  };

  const saveDraft = async () => {
    if (!draft?.title?.trim()) {
      alert('Title is required');
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSaving(true);
    try {
      const payload = {
        title: draft.title!.trim(),
        customer_name: draft.customer_name || null,
        customer_email: draft.customer_email || null,
        customer_phone: draft.customer_phone || null,
        travel_start: draft.travel_start || null,
        travel_end: draft.travel_end || null,
        status: draft.status || 'draft',
        itinerary_body: draft.itinerary_body || '',
        internal_notes: draft.internal_notes || null,
        ...(draft.id ? {} : { created_by: session?.user?.id ?? null }),
      };

      if (draft.id) {
        const { error } = await supabase.from('crm_itineraries').update(payload).eq('id', draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crm_itineraries').insert(payload as Record<string, unknown>);
        if (error) throw error;
      }
      await fetchRows();
      setDraft(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      alert(msg + '. Run supabase migration for crm_itineraries + policies.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!canDelete || !confirm('Delete this itinerary?')) return;
    await supabase.from('crm_itineraries').delete().eq('id', id);
    await fetchRows();
    if (draft?.id === id) setDraft(null);
  };

  const openExisting = (r: CRMItinerary) => {
    setDraft({
      ...r,
      travel_start: r.travel_start || '',
      travel_end: r.travel_end || '',
    });
  };

  if (loading && rows.length === 0)
    return <p className="text-gray-500 py-12">Loading itineraries…</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">CRM — Itineraries</h3>
          <p className="text-sm text-gray-500">Paste your day-wise template into the itinerary field.</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-700"
        >
          <Plus size={18} /> New itinerary
        </button>
      </div>

      {draft && (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8 space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <ClipboardList size={20} /> {draft.id ? 'Edit itinerary' : 'New itinerary'}
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
              placeholder="Title *"
              value={draft.title || ''}
              onChange={(e) => setDraft((d) => ({ ...d!, title: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Guest name"
              value={draft.customer_name ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d!, customer_name: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Phone"
              value={draft.customer_phone ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d!, customer_phone: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
              placeholder="Email"
              value={draft.customer_email ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d!, customer_email: e.target.value }))}
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={(draft.travel_start as string) || ''}
              onChange={(e) => setDraft((d) => ({ ...d!, travel_start: e.target.value || null }))}
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm"
              value={(draft.travel_end as string) || ''}
              onChange={(e) => setDraft((d) => ({ ...d!, travel_end: e.target.value || null }))}
            />
            <select
              className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
              value={draft.status || 'draft'}
              onChange={(e) => setDraft((d) => ({ ...d!, status: e.target.value as CRMItinerary['status'] }))}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-teal-800 uppercase">Itinerary</label>
            <textarea
              className="w-full mt-1 border rounded-lg px-3 py-2 font-mono text-sm min-h-[220px]"
              value={draft.itinerary_body ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d!, itinerary_body: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Internal notes</label>
            <textarea
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm min-h-[72px]"
              value={draft.internal_notes ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d!, internal_notes: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-60"
            >
              <Save size={16} /> Save
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="px-5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Guest</th>
              <th className="px-5 py-3">Dates</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No itineraries. Create tables via{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">supabase/migrations/</code>.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{r.title}</td>
                <td className="px-5 py-3">{[r.customer_name, r.customer_phone].filter(Boolean).join(' · ') || '—'}</td>
                <td className="px-5 py-3 text-gray-600">{[r.travel_start, r.travel_end].filter(Boolean).join(' → ') || '—'}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{r.status}</span>
                </td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button type="button" className="text-teal-600 font-semibold" onClick={() => openExisting(r)}>
                    Edit
                  </button>
                  {canDelete && (
                    <button type="button" className="text-red-500 p-1" aria-label="Delete" onClick={() => void remove(r.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
