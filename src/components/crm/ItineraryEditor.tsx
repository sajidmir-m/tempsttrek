'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Loader2, UploadCloud, FileText } from 'lucide-react';
import type { CRMItineraryAssetKind, CRMItineraryAssetRow, CRMItineraryRow, ItineraryDay, ItinerarySections } from './types';
import CrmItineraryHotelsPicker from './itinerary/CrmItineraryHotelsPicker';

function isMissingCrmItineraryAssetsTable(err: unknown): boolean {
  const msg =
    typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string'
      ? (err as { message: string }).message
      : String(err);
  const m = msg.toLowerCase();
  return (
    m.includes('crm_itinerary_assets') ||
    (m.includes('could not find') && m.includes('schema cache')) ||
    m.includes('pgrst205')
  );
}

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

const KIND_OPTIONS: { value: CRMItineraryAssetKind; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'cab', label: 'Cab' },
  { value: 'place', label: 'Place' },
];

function normalizeAssetRow(r: Record<string, unknown>): CRMItineraryAssetRow {
  const k = r.kind != null ? String(r.kind) : null;
  const kind =
    k === 'hotel' || k === 'cab' || k === 'place' || k === 'general' ? (k as CRMItineraryAssetKind) : null;
  return {
    id: String(r.id),
    itinerary_id: String(r.itinerary_id),
    image_url: String(r.image_url),
    caption: (r.caption as string) || null,
    sort_order: Number(r.sort_order) || 0,
    after_day: r.after_day != null && r.after_day !== '' ? Number(r.after_day) : null,
    kind,
  };
}

function SlotImageUploader({
  afterDay,
  disabled,
  uploading,
  onUpload,
}: {
  afterDay: number | null;
  disabled: boolean;
  uploading: boolean;
  onUpload: (file: File, afterDay: number | null, kind: CRMItineraryAssetKind) => void;
}) {
  const [kind, setKind] = useState<CRMItineraryAssetKind>('general');
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Type</span>
      <select
        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold bg-white"
        value={kind}
        onChange={(e) => setKind(e.target.value as CRMItineraryAssetKind)}
        disabled={disabled}
      >
        {KIND_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
          disabled ? 'cursor-not-allowed opacity-50 border-gray-100 bg-gray-100' : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        <UploadCloud size={14} />
        {uploading ? 'Uploading…' : afterDay == null ? 'Add highlight' : 'Add after this day'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f, afterDay, kind);
            e.currentTarget.value = '';
          }}
        />
      </label>
    </div>
  );
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
  const [assetsTableMissing, setAssetsTableMissing] = useState(false);
  const [newInc, setNewInc] = useState('');
  const [newExc, setNewExc] = useState('');

  const sections = useMemo(() => normalizeSections(row.sections as any), [row.sections]);

  const load = async () => {
    setLoading(true);
    setAssetsTableMissing(false);
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
      if (aErr) {
        if (isMissingCrmItineraryAssetsTable(aErr)) {
          setAssets([]);
          setAssetsTableMissing(true);
        } else {
          throw aErr;
        }
      } else {
        setAssets((a || []).map((row) => normalizeAssetRow(row as Record<string, unknown>)));
      }
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

  const uploadImage = async (file: File, afterDay: number | null, kind: CRMItineraryAssetKind) => {
    if (assetsTableMissing) {
      alert(
        'The database table crm_itinerary_assets is missing. Run the SQL migration supabase/migrations/20260516_ensure_crm_itinerary_assets.sql in the Supabase SQL Editor (or supabase db push), then reload this page.'
      );
      return;
    }
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

      const sameSlot = assets.filter((a) =>
        afterDay == null ? a.after_day == null : Number(a.after_day) === afterDay
      );
      const sort_order = sameSlot.length ? Math.max(...sameSlot.map((a) => a.sort_order), 0) + 10 : 10;

      const { error } = await supabase.from('crm_itinerary_assets').insert({
        itinerary_id: itineraryId,
        image_url: url,
        caption: null,
        sort_order,
        after_day: afterDay,
        kind: kind === 'general' ? null : kind,
      });
      if (error) throw error;
      await load();
    } catch (e: any) {
      alert('Upload failed: ' + (e?.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  const updateAssetCaption = async (assetId: string, caption: string) => {
    if (!itineraryId) return;
    try {
      const { error } = await supabase
        .from('crm_itinerary_assets')
        .update({ caption: caption.trim() || null })
        .eq('id', assetId);
      if (error) throw error;
      setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, caption: caption.trim() || null } : a)));
    } catch (e: any) {
      alert('Could not update caption: ' + (e?.message || String(e)));
    }
  };

  const assetsForSlot = (afterDay: number | null) =>
    assets
      .filter((a) => (afterDay == null ? a.after_day == null : Number(a.after_day) === afterDay))
      .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));

  const removeAsset = async (assetId: string) => {
    if (!canDelete) return;
    const { error } = await supabase.from('crm_itinerary_assets').delete().eq('id', assetId);
    if (error) alert(error.message);
    else await load();
  };

  if (loading) return <p className="text-gray-500 py-10">Loading itinerary…</p>;

  return (
    <div className="crm-surface min-w-0 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-700">Itinerary</p>
          <h2 className="text-lg font-extrabold text-gray-900">{itineraryId ? 'Edit itinerary' : 'New itinerary'}</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {itineraryId && (
            <Link
              href={`/crm/itineraries/${itineraryId}/print?download=1`}
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

      {assetsTableMissing ? (
        <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:mx-6">
          <p className="font-semibold">Itinerary images are unavailable</p>
          <p className="mt-1 text-amber-900/90">
            Your project is missing the table <code className="text-xs bg-white/80 px-1 rounded border border-amber-200">public.crm_itinerary_assets</code>.
            In Supabase: <strong>SQL Editor</strong> → paste and run{' '}
            <code className="text-xs bg-white/80 px-1 rounded border border-amber-200">supabase/migrations/20260516_ensure_crm_itinerary_assets.sql</code>{' '}
            (or run <code className="text-xs bg-white/80 px-1 rounded">supabase db push</code>). Then reload this page. You can still edit and save the itinerary
            text below.
          </p>
        </div>
      ) : null}

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
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

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="min-w-0 font-extrabold text-gray-900">Day-wise itinerary</h3>
              <button
                type="button"
                onClick={addDay}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                <Plus size={16} />
                Add day
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700 mb-2">Top highlights</p>
              <p className="text-xs text-gray-600 mb-3">Shown before day 1 on the printout. Use for hero shots, maps, or property exteriors.</p>
              {assetsForSlot(null).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {assetsForSlot(null).map((a) => (
                    <div key={a.id} className="relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <div className="relative aspect-[4/3]">
                        <Image src={a.image_url} alt="" fill className="object-cover" sizes="120px" />
                      </div>
                      {a.kind ? (
                        <span className="absolute bottom-1 left-1 text-[10px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded">
                          {a.kind}
                        </span>
                      ) : null}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void removeAsset(a.id)}
                          className="absolute top-1 right-1 p-1 rounded bg-white/90 text-red-600"
                          aria-label="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <input
                        className="w-full text-[11px] border-t border-gray-100 px-2 py-1"
                        placeholder="Caption"
                        defaultValue={a.caption ?? ''}
                        onBlur={(e) => {
                          const v = e.target.value;
                          if (v !== (a.caption ?? '')) void updateAssetCaption(a.id, v);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <SlotImageUploader
                afterDay={null}
                disabled={assetsTableMissing || !itineraryId}
                uploading={uploading}
                onUpload={(f, ad, k) => void uploadImage(f, ad, k)}
              />
            </div>

            <div className="space-y-4">
              {sections.days.map((d, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Day {d.day}</p>
                    {sections.days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(idx)}
                        className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700"
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

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-700 mb-2">Photos after this day</p>
                    {assetsForSlot(d.day).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                        {assetsForSlot(d.day).map((a) => (
                          <div key={a.id} className="relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                            <div className="relative aspect-[4/3]">
                              <Image src={a.image_url} alt="" fill className="object-cover" sizes="120px" />
                            </div>
                            {a.kind ? (
                              <span className="absolute bottom-1 left-1 text-[10px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded">
                                {a.kind}
                              </span>
                            ) : null}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => void removeAsset(a.id)}
                                className="absolute top-1 right-1 p-1 rounded bg-white/90 text-red-600"
                                aria-label="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            <input
                              className="w-full text-[11px] border-t border-gray-100 px-2 py-1"
                              placeholder="Caption"
                              defaultValue={a.caption ?? ''}
                              onBlur={(e) => {
                                const v = e.target.value;
                                if (v !== (a.caption ?? '')) void updateAssetCaption(a.id, v);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 mb-2">No images for this slot yet.</p>
                    )}
                    <SlotImageUploader
                      afterDay={d.day}
                      disabled={assetsTableMissing || !itineraryId}
                      uploading={uploading}
                      onUpload={(f, ad, k) => void uploadImage(f, ad, k)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
              <h3 className="mb-3 font-extrabold text-gray-900">Inclusions</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                  value={newInc}
                  onChange={(e) => setNewInc(e.target.value)}
                  placeholder="Add inclusion"
                />
                <button
                  type="button"
                  onClick={() => addListItem('inclusions', newInc)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 sm:self-start"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {sections.inclusions.length === 0 ? (
                  <p className="text-sm text-gray-500">No inclusions yet.</p>
                ) : (
                  sections.inclusions.map((x, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <p className="min-w-0 flex-1 break-words text-sm text-gray-800">{x}</p>
                      <button
                        type="button"
                        onClick={() => removeListItem('inclusions', i)}
                        className="shrink-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
              <h3 className="mb-3 font-extrabold text-gray-900">Exclusions</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                  value={newExc}
                  onChange={(e) => setNewExc(e.target.value)}
                  placeholder="Add exclusion"
                />
                <button
                  type="button"
                  onClick={() => addListItem('exclusions', newExc)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:self-start"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {sections.exclusions.length === 0 ? (
                  <p className="text-sm text-gray-500">No exclusions yet.</p>
                ) : (
                  sections.exclusions.map((x, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <p className="min-w-0 flex-1 break-words text-sm text-gray-800">{x}</p>
                      <button
                        type="button"
                        onClick={() => removeListItem('exclusions', i)}
                        className="shrink-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <CrmItineraryHotelsPicker
          itineraryId={itineraryId}
          sections={sections}
          onSectionsChange={(next) => setRow((p) => ({ ...p, sections: next }))}
        />

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <h3 className="mb-3 font-extrabold text-gray-900">Transfers</h3>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm min-h-[100px]"
              value={sections.transfers}
              onChange={(e) => setRow((p) => ({ ...p, sections: { ...sections, transfers: e.target.value } }))}
              placeholder="Airport pickup, local transfers, intercity etc."
            />
          </div>
          <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <h3 className="mb-3 font-extrabold text-gray-900">Hotel notes</h3>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm min-h-[100px]"
              value={sections.hotel_notes}
              onChange={(e) => setRow((p) => ({ ...p, sections: { ...sections, hotel_notes: e.target.value } }))}
              placeholder="Hotel category, meal plan, check-in/out, etc."
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 px-1">
          Images are attached under <strong>Top highlights</strong> and <strong>each day</strong> above. They sync to the print/PDF view. Bucket:{' '}
          <code className="bg-gray-100 px-1 rounded">itineraries</code>.
        </p>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
          <h3 className="mb-2 font-extrabold text-gray-900">Internal notes</h3>
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

