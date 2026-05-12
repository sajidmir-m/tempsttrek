'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Loader2, UploadCloud, FileText } from 'lucide-react';
import type { CRMItineraryAssetRow, CRMItineraryRow, ItineraryDay, ItinerarySections } from './types';

const defaultSections = (): ItinerarySections => ({
  days: [
    { day: 1, title: 'Arrival & Srinagar', body: '' },
    { day: 2, title: 'Local sightseeing', body: '' },
  ],
  inclusions: ['Hotel stay', 'Private cab'],
  exclusions: [],
  transfers: '',
  hotel_notes: '',
});

function normalizeSections(raw: CRMItineraryRow['sections']): ItinerarySections {
  const s = (raw || {}) as Partial<ItinerarySections>;
  const days = Array.isArray(s.days) ? (s.days as ItineraryDay[]) : [];
  return {
    days:
      days.length > 0
        ? days.map((d, idx) => ({ day: idx + 1, title: d?.title || `Day ${idx + 1}`, body: d?.body || '' }))
        : defaultSections().days,
    inclusions: Array.isArray(s.inclusions) ? (s.inclusions as string[]).filter(Boolean) : [],
    exclusions: Array.isArray(s.exclusions) ? (s.exclusions as string[]).filter(Boolean) : [],
    transfers: typeof s.transfers === 'string' ? s.transfers : '',
    hotel_notes: typeof s.hotel_notes === 'string' ? s.hotel_notes : '',
  };
}

export default function ItineraryEditor({
  itineraryId,
  canDelete,
  onDone,
}: {
  itineraryId?: string;
  canDelete: boolean;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [row, setRow] = useState<Partial<CRMItineraryRow>>({
    title: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    travel_start: '',
    travel_end: '',
    status: 'draft',
    internal_notes: '',
    itinerary_body: '',
    sections: defaultSections(),
    cover_image_url: '',
  });
  const [assets, setAssets] = useState<CRMItineraryAssetRow[]>([]);
  const [newInc, setNewInc] = useState('');
  const [newExc, setNewExc] = useState('');

  const sections = useMemo(() => normalizeSections(row.sections as any), [row.sections]);

  const load = async () => {
    setLoading(true);
    try {
      if (!itineraryId) {
        setRow((p) => ({ ...p, sections: defaultSections() }));
        setAssets([]);
        return;
      }

      const { data, error } = await supabase.from('crm_itineraries').select('*').eq('id', itineraryId).maybeSingle();
      if (error) throw error;
      if (data) {
        setRow(data as CRMItineraryRow);
      }

      const { data: a, error: aErr } = await supabase
        .from('crm_itinerary_assets')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (aErr) throw aErr;
      setAssets((a || []) as CRMItineraryAssetRow[]);
    } catch (e: any) {
      alert('Failed to load itinerary: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraryId]);

  const addDay = () => {
    const next = [...sections.days, { day: sections.days.length + 1, title: `Day ${sections.days.length + 1}`, body: '' }];
    setRow((p) => ({ ...p, sections: { ...sections, days: next } }));
  };

  const removeDay = (idx: number) => {
    const next = sections.days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 }));
    setRow((p) => ({ ...p, sections: { ...sections, days: next } }));
  };

  const updateDay = (idx: number, patch: Partial<ItineraryDay>) => {
    const next = sections.days.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    setRow((p) => ({ ...p, sections: { ...sections, days: next } }));
  };

  const addListItem = (key: 'inclusions' | 'exclusions', val: string) => {
    const v = val.trim();
    if (!v) return;
    setRow((p) => ({ ...p, sections: { ...sections, [key]: [...(sections as any)[key], v] } }));
    if (key === 'inclusions') setNewInc('');
    else setNewExc('');
  };

  const removeListItem = (key: 'inclusions' | 'exclusions', idx: number) => {
    const next = (sections as any)[key].filter((_: string, i: number) => i !== idx);
    setRow((p) => ({ ...p, sections: { ...sections, [key]: next } }));
  };

  const save = async () => {
    if (!row.title?.trim()) return alert('Title is required');
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = {
        title: row.title!.trim(),
        customer_name: row.customer_name || null,
        customer_email: row.customer_email || null,
        customer_phone: row.customer_phone || null,
        travel_start: row.travel_start || null,
        travel_end: row.travel_end || null,
        status: row.status || 'draft',
        internal_notes: row.internal_notes || null,
        itinerary_body: row.itinerary_body || '',
        sections: sections,
        cover_image_url: row.cover_image_url || null,
        ...(itineraryId ? {} : { created_by: session?.user?.id ?? null }),
      };

      if (itineraryId) {
        const { error } = await supabase.from('crm_itineraries').update(payload).eq('id', itineraryId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('crm_itineraries').insert(payload).select('id').maybeSingle();
        if (error) throw error;
        const newId = (data as any)?.id as string | undefined;
        if (newId) window.history.replaceState({}, '', `/crm/itineraries?edit=${newId}`);
      }

      onDone();
    } catch (e: any) {
      alert('Save failed: ' + (e?.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!canDelete || !itineraryId) return;
    if (!confirm('Delete this itinerary and all images?')) return;
    const { error } = await supabase.from('crm_itineraries').delete().eq('id', itineraryId);
    if (error) alert(error.message);
    onDone();
  };

  const uploadImage = async (file: File) => {
    if (!itineraryId) {
      alert('Save itinerary first, then upload images.');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${itineraryId}/${Date.now()}_${safe}.${ext}`;
      const { error: upErr } = await supabase.storage.from('itineraries').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('itineraries').getPublicUrl(path);
      const url = data.publicUrl;

      const { error } = await supabase.from('crm_itinerary_assets').insert({
        itinerary_id: itineraryId,
        image_url: url,
        caption: null,
        sort_order: assets.length ? Math.max(...assets.map((a) => a.sort_order)) + 10 : 10,
      });
      if (error) throw error;
      await load();
    } catch (e: any) {
      alert('Upload failed: ' + (e?.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  const removeAsset = async (assetId: string) => {
    if (!canDelete) return;
    const { error } = await supabase.from('crm_itinerary_assets').delete().eq('id', assetId);
    if (error) alert(error.message);
    else await load();
  };

  if (loading) return <p className="text-gray-500 py-10">Loading itinerary…</p>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-700">Itinerary</p>
          <h2 className="text-lg font-extrabold text-gray-900">{itineraryId ? 'Edit itinerary' : 'New itinerary'}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {itineraryId && (
            <Link
              href={`/crm/itineraries/${itineraryId}/print`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-sm font-semibold"
            >
              <FileText size={16} />
              Generate PDF
            </Link>
          )}
          {canDelete && itineraryId && (
            <button
              onClick={del}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-semibold shadow-lg shadow-teal-600/20 disabled:opacity-70"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <input
            className="border rounded-xl px-4 py-3 text-sm"
            placeholder="Title *"
            value={row.title || ''}
            onChange={(e) => setRow((p) => ({ ...p, title: e.target.value }))}
          />
          <select
            className="border rounded-xl px-4 py-3 text-sm"
            value={(row.status as any) || 'draft'}
            onChange={(e) => setRow((p) => ({ ...p, status: e.target.value as any }))}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="confirmed">Confirmed</option>
            <option value="archived">Archived</option>
          </select>
          <input
            className="border rounded-xl px-4 py-3 text-sm"
            placeholder="Guest name"
            value={row.customer_name ?? ''}
            onChange={(e) => setRow((p) => ({ ...p, customer_name: e.target.value }))}
          />
          <input
            className="border rounded-xl px-4 py-3 text-sm"
            placeholder="Phone"
            value={row.customer_phone ?? ''}
            onChange={(e) => setRow((p) => ({ ...p, customer_phone: e.target.value }))}
          />
          <input
            className="border rounded-xl px-4 py-3 text-sm lg:col-span-2"
            placeholder="Email"
            value={row.customer_email ?? ''}
            onChange={(e) => setRow((p) => ({ ...p, customer_email: e.target.value }))}
          />
          <input
            type="date"
            className="border rounded-xl px-4 py-3 text-sm"
            value={(row.travel_start as string) || ''}
            onChange={(e) => setRow((p) => ({ ...p, travel_start: e.target.value || null }))}
          />
          <input
            type="date"
            className="border rounded-xl px-4 py-3 text-sm"
            value={(row.travel_end as string) || ''}
            onChange={(e) => setRow((p) => ({ ...p, travel_end: e.target.value || null }))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-extrabold text-gray-900">Day-wise itinerary</h3>
              <button
                type="button"
                onClick={addDay}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 text-sm font-semibold"
              >
                <Plus size={16} />
                Add day
              </button>
            </div>

            <div className="space-y-4">
              {sections.days.map((d, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500">Day {d.day}</p>
                    {sections.days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(idx)}
                        className="text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
                    value={d.title}
                    onChange={(e) => updateDay(idx, { title: e.target.value })}
                    placeholder="Day title"
                  />
                  <textarea
                    className="w-full border rounded-xl px-3 py-2 text-sm min-h-[110px]"
                    value={d.body}
                    onChange={(e) => updateDay(idx, { body: e.target.value })}
                    placeholder="Write details, timings, sightseeing, stay, etc."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-extrabold text-gray-900 mb-3">Inclusions</h3>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-xl px-3 py-2 text-sm"
                  value={newInc}
                  onChange={(e) => setNewInc(e.target.value)}
                  placeholder="Add inclusion"
                />
                <button
                  type="button"
                  onClick={() => addListItem('inclusions', newInc)}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-semibold"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {sections.inclusions.length === 0 ? (
                  <p className="text-sm text-gray-500">No inclusions yet.</p>
                ) : (
                  sections.inclusions.map((x, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                      <p className="text-sm text-gray-800">{x}</p>
                      <button type="button" onClick={() => removeListItem('inclusions', i)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-extrabold text-gray-900 mb-3">Exclusions</h3>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-xl px-3 py-2 text-sm"
                  value={newExc}
                  onChange={(e) => setNewExc(e.target.value)}
                  placeholder="Add exclusion"
                />
                <button
                  type="button"
                  onClick={() => addListItem('exclusions', newExc)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-semibold"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {sections.exclusions.length === 0 ? (
                  <p className="text-sm text-gray-500">No exclusions yet.</p>
                ) : (
                  sections.exclusions.map((x, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                      <p className="text-sm text-gray-800">{x}</p>
                      <button type="button" onClick={() => removeListItem('exclusions', i)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-extrabold text-gray-900 mb-3">Transfers</h3>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm min-h-[100px]"
              value={sections.transfers}
              onChange={(e) => setRow((p) => ({ ...p, sections: { ...sections, transfers: e.target.value } }))}
              placeholder="Airport pickup, local transfers, intercity etc."
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-extrabold text-gray-900 mb-3">Hotel notes</h3>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm min-h-[100px]"
              value={sections.hotel_notes}
              onChange={(e) => setRow((p) => ({ ...p, sections: { ...sections, hotel_notes: e.target.value } }))}
              placeholder="Hotel category, meal plan, check-in/out, etc."
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-gray-900">Itinerary images</h3>
              <p className="text-xs text-gray-500 mt-1">
                Upload images to Supabase Storage bucket <code className="text-[11px] bg-white border px-1 rounded">itineraries</code>.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-sm font-semibold cursor-pointer">
              <UploadCloud size={16} />
              {uploading ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadImage(f);
                  e.currentTarget.value = '';
                }}
                disabled={uploading}
              />
            </label>
          </div>

          {assets.length === 0 ? (
            <p className="text-sm text-gray-500">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {assets.map((a) => (
                <div key={a.id} className="relative rounded-xl overflow-hidden border border-gray-100 bg-white">
                  <div className="relative aspect-[4/3]">
                    <Image src={a.image_url} alt={a.caption || 'Itinerary image'} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => void removeAsset(a.id)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 backdrop-blur shadow text-red-600 hover:text-red-700"
                      aria-label="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-extrabold text-gray-900 mb-2">Internal notes</h3>
          <textarea
            className="w-full border rounded-xl px-3 py-2 text-sm min-h-[90px]"
            value={row.internal_notes ?? ''}
            onChange={(e) => setRow((p) => ({ ...p, internal_notes: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}

