'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Loader2, Pencil, Plus, Trash2, ExternalLink } from 'lucide-react';
import AdminOffbeatModal, { type OffbeatSpotRow } from '@/components/admin/AdminOffbeatModal';
import { offbeatSpotPath } from '@/lib/offbeat-slug';

export default function AdminOffbeatTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState<OffbeatSpotRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OffbeatSpotRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.from('offbeat_spots').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data || []) as Record<string, unknown>[];
      setSpots(
        rows.map((r) => ({
          id: String(r.id),
          type: r.type === 'hidden_place' ? 'hidden_place' : 'trek',
          name: String(r.name || ''),
          slug: (r.slug as string) || null,
          region: (r.region as string) || null,
          difficulty: (r.difficulty as string) || null,
          best_season: (r.best_season as string) || null,
          duration: (r.duration as string) || null,
          altitude: (r.altitude as string) || null,
          description: (r.description as string) || null,
          detail_body: (r.detail_body as string) || null,
          hero_image: (r.hero_image as string) || null,
          is_featured: r.is_featured != null ? Boolean(r.is_featured) : null,
        }))
      );
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Failed to load off-beat spots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: OffbeatSpotRow) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleDelete = async (row: OffbeatSpotRow) => {
    if (!window.confirm(`Delete “${row.name}”? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('offbeat_spots').delete().eq('id', row.id);
      if (error) throw error;
      setMessage('Deleted.');
      await load();
      router.refresh();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-600 gap-2">
        <Loader2 className="animate-spin" size={22} />
        Loading off-beat spots…
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Off-beat spots</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Edit treks and hidden places shown on <span className="font-medium">/offbeat</span>. Long copy lives in{' '}
            <span className="font-medium">Detail page copy</span>; short text is used for cards and SEO. Only admin
            accounts can write (Supabase RLS).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-teal-700 shrink-0"
        >
          <Plus size={18} />
          Add spot
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>
      ) : null}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Region</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {spots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-600">
                    No rows in <code className="text-xs bg-gray-100 px-1 rounded">offbeat_spots</code>. Add a spot or run{' '}
                    <code className="text-xs bg-gray-100 px-1 rounded">seed.sql</code>.
                  </td>
                </tr>
              ) : (
                spots.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-700">{s.type === 'trek' ? 'Trek' : 'Hidden place'}</td>
                    <td className="px-4 py-3 text-gray-700">{s.region || '—'}</td>
                    <td className="px-4 py-3">{s.is_featured ? <span className="text-emerald-700 font-semibold">Yes</span> : '—'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={offbeatSpotPath(s)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline mr-3"
                      >
                        View <ExternalLink size={14} />
                      </Link>
                      <button type="button" onClick={() => openEdit(s)} className="inline-flex items-center gap-1 text-gray-800 font-semibold hover:text-teal-800 mr-3">
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(s)}
                        className="inline-flex items-center gap-1 text-red-600 font-semibold hover:text-red-800"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminOffbeatModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={() => {
          void load();
          router.refresh();
          setMessage(null);
        }}
        spot={editing}
      />
    </div>
  );
}
