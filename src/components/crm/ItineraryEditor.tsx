'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Loader2, UploadCloud, FileText } from 'lucide-react';
import type { CRMItineraryAssetKind, CRMItineraryAssetRow, CRMItineraryRow, ItineraryDay, ItinerarySections } from './types';
import ItineraryNightHotelsPanel from './itinerary/ItineraryNightHotelsPanel';
import DestinationTypeahead from './itinerary/DestinationTypeahead';
import DestinationDayCards from './itinerary/DestinationDayCards';
import DayHotelPicker, { type CatalogHotel } from './itinerary/DayHotelPicker';
import { normalizeItinerarySections, buildNightStaysForRange, buildHotelNotesFromNightStays } from '@/lib/itinerary-utils';
import type { ItineraryNightStay } from './types';
import { syncItineraryHotelsFromNightStays } from '@/lib/itinerary-hotel-sync';
import { DEFAULT_ITINERARY_POLICIES } from '@/lib/itinerary-policies';
import { todayYmd, validateTravelRange } from '@/lib/crm-date-rules';

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
    { day: 1, title: 'Arrival & Srinagar', body: '', destination_ids: [] },
    { day: 2, title: 'Local sightseeing', body: '', destination_ids: [] },
  ],
  night_stays: [],
  inclusions: ['Hotel stay', 'Private cab'],
  exclusions: [],
  transfers: '',
  hotel_notes: '',
  ...DEFAULT_ITINERARY_POLICIES,
});

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
  const [catalogHotels, setCatalogHotels] = useState<CatalogHotel[]>([]);
  const [roomCategories, setRoomCategories] = useState<{ id: string; name: string }[]>([]);

  const sections = useMemo(() => normalizeItinerarySections(row.sections as ItinerarySections), [row.sections]);

  const travelStart = (row.travel_start as string) || null;
  const travelEnd = (row.travel_end as string) || null;
  const minDate = todayYmd();

  useEffect(() => {
    if (!travelStart || !travelEnd) return;
    setRow((p) => {
      const sec = normalizeItinerarySections(p.sections as ItinerarySections);
      const built = buildNightStaysForRange(travelStart, travelEnd, sec.night_stays);
      if (built.length === sec.night_stays.length && built.every((b, i) => b.night === sec.night_stays[i]?.night)) {
        return p;
      }
      return { ...p, sections: { ...sec, night_stays: built } };
    });
  }, [travelStart, travelEnd]);

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

  const loadAssets = async () => {
    if (!itineraryId) return;
    try {
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
        }
      } else {
        setAssets((a || []).map((r) => normalizeAssetRow(r as Record<string, unknown>)));
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraryId]);

  useEffect(() => {
    void Promise.all([
      supabase
        .from('crm_hotels')
        .select('id,name,location,hotel_type,featured_image_url')
        .eq('is_active', true)
        .order('name'),
      supabase.from('crm_room_categories').select('id,name').eq('status', 'active').order('sort_order'),
    ]).then(([hRes, rRes]) => {
      setCatalogHotels((hRes.data || []) as CatalogHotel[]);
      setRoomCategories((rRes.data || []) as { id: string; name: string }[]);
    });
  }, []);

  const patchNightStay = (night: number, patch: Partial<ItineraryNightStay>) => {
    const next = sections.night_stays.map((s) => (s.night === night ? { ...s, ...patch } : s));
    const hotelMap = new Map(
      catalogHotels.map((h) => [h.id, { name: h.name, location: h.location, category: null }])
    );
    const hotel_notes = buildHotelNotesFromNightStays(next, hotelMap);
    setRow((p) => ({
      ...p,
      sections: { ...sections, night_stays: next, hotel_notes },
    }));
  };

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
    const rangeCheck = validateTravelRange(travelStart, travelEnd);
    if (!rangeCheck.ok) return alert(rangeCheck.message);

    const finalSections = normalizeItinerarySections({
      ...sections,
      night_stays: buildNightStaysForRange(travelStart, travelEnd, sections.night_stays),
    });

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
        travel_start: travelStart,
        travel_end: travelEnd,
        status: row.status || 'draft',
        internal_notes: row.internal_notes || null,
        itinerary_body: row.itinerary_body || '',
        sections: finalSections,
        cover_image_url: row.cover_image_url || null,
        quote_price: (row as { quote_price?: number | null }).quote_price ?? null,
        ...(itineraryId ? {} : { created_by: session?.user?.id ?? null }),
      };

      let savedId = itineraryId;

      if (itineraryId) {
        const { error } = await supabase.from('crm_itineraries').update(payload).eq('id', itineraryId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('crm_itineraries').insert(payload).select('id').maybeSingle();
        if (error) throw error;
        savedId = (data as { id?: string })?.id;
        if (savedId) window.history.replaceState({}, '', `/crm/itineraries?edit=${savedId}`);
      }

      if (savedId) {
        const sync = await syncItineraryHotelsFromNightStays(savedId, finalSections.night_stays);
        if (!sync.ok) alert('Itinerary saved but hotel links failed: ' + sync.error);
      }

      onDone();
    } catch (e: any) {
      alert('Save failed: ' + (e?.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  const attachDestinationToDay = async (
    dest: {
      id: string;
      name: string;
      description: string | null;
      base_location: string;
      featured_image_url: string | null;
      route_from: string | null;
      route_to: string | null;
    },
    dayIdx: number
  ) => {
    const d = sections.days[dayIdx];
    if (!d) return;

    const route =
      dest.route_from && dest.route_to ? `${dest.route_from} → ${dest.route_to}` : dest.base_location;

    // Check if day title is default/generic and auto-set it to the destination name
    const trimmedTitle = (d.title || '').trim();
    const isGenericTitle =
      !trimmedTitle ||
      /^Day\s*\d+$/i.test(trimmedTitle) ||
      trimmedTitle === 'Arrival & Srinagar' ||
      trimmedTitle === 'Local sightseeing';
    const newTitle = isGenericTitle ? dest.name : d.title;

    // Put the detailed description cleanly into the details box
    const cleanDesc = dest.description?.trim() || '';
    let newBody = d.body.trim();
    if (!newBody) {
      newBody = cleanDesc || `${dest.name} (${route})`;
    } else {
      newBody = `${newBody}\n\n${dest.name} (${route}):\n${cleanDesc || ''}`.trim();
    }

    const ids = [...(d.destination_ids || [])];
    if (!ids.includes(dest.id)) ids.push(dest.id);

    updateDay(dayIdx, { title: newTitle, body: newBody, destination_ids: ids });

    if (!itineraryId || assetsTableMissing) return;
    const dayNum = d.day;
    const urls: string[] = [];
    if (dest.featured_image_url) urls.push(dest.featured_image_url);
    const { data: gallery } = await supabase
      .from('crm_destination_images')
      .select('image_url,sort_order')
      .eq('destination_id', dest.id)
      .order('sort_order')
      .limit(3);
    for (const g of gallery || []) {
      const u = String((g as { image_url: string }).image_url);
      if (u && !urls.includes(u)) urls.push(u);
    }
    const existingUrls = new Set(assets.filter((a) => Number(a.after_day) === dayNum).map((a) => a.image_url));
    let order = assets.filter((a) => Number(a.after_day) === dayNum).reduce((m, a) => Math.max(m, a.sort_order), 0);
    for (const url of urls) {
      if (existingUrls.has(url)) continue;
      order += 10;
      const { error } = await supabase.from('crm_itinerary_assets').insert({
        itinerary_id: itineraryId,
        image_url: url,
        caption: dest.name,
        sort_order: order,
        after_day: dayNum,
        kind: 'place',
      });
      if (error) break;
      existingUrls.add(url);
    }
    await loadAssets();
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
      await loadAssets();
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
    else await loadAssets();
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
            <>
              <Link
                href={`/crm/itineraries/${itineraryId}/print?download=1`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-sm font-semibold"
              >
                <FileText size={16} />
                Itinerary PDF
              </Link>
              <Link
                href={`/crm/itineraries/${itineraryId}/voucher`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-950"
              >
                <FileText size={16} />
                Booking voucher
              </Link>
            </>
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
            min={minDate}
            className="border rounded-xl px-4 py-3 text-sm"
            value={(row.travel_start as string) || ''}
            onChange={(e) => setRow((p) => ({ ...p, travel_start: e.target.value || null }))}
          />
          <input
            type="date"
            min={minDate}
            className="border rounded-xl px-4 py-3 text-sm"
            value={(row.travel_end as string) || ''}
            onChange={(e) => setRow((p) => ({ ...p, travel_end: e.target.value || null }))}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Package Rate / Quote (₹)</label>
              {(row as { quote_price?: number | null }).quote_price != null && Number((row as { quote_price?: number | null }).quote_price) > 0 ? (
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  ₹ {Number((row as { quote_price?: number | null }).quote_price).toLocaleString('en-IN')}
                </span>
              ) : null}
            </div>
            <input
              type="number"
              className="border rounded-xl px-4 py-3 text-sm font-bold text-gray-900 bg-white"
              placeholder="e.g. 45000"
              value={(row as { quote_price?: number | null }).quote_price ?? ''}
              onChange={(e) =>
                setRow((p) => ({ ...p, quote_price: e.target.value ? Number(e.target.value) : null }))
              }
            />
          </div>
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
                  <DestinationTypeahead
                    dayTitle={d.title}
                    dayBody={d.body}
                    destinationIds={d.destination_ids || []}
                    onSelectDestination={(dest) => void attachDestinationToDay(dest, idx)}
                  />
                  {(d.destination_ids?.length ?? 0) > 0 ? (
                    <DestinationDayCards
                      destinationIds={d.destination_ids || []}
                      onRemoveDestination={(destId) => {
                        const ids = (d.destination_ids || []).filter((id) => id !== destId);
                        updateDay(idx, { destination_ids: ids });
                      }}
                    />
                  ) : null}
                  <DayHotelPicker
                    dayNumber={d.day}
                    nightStays={sections.night_stays || []}
                    hotels={catalogHotels}
                    roomCategories={roomCategories}
                    travelDatesSet={Boolean(travelStart && travelEnd)}
                    onPatchNight={patchNightStay}
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

        <details className="rounded-2xl border border-emerald-100 bg-emerald-50/30">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-emerald-950">
            All nights overview (bulk edit)
          </summary>
          <div className="px-2 pb-2">
            <ItineraryNightHotelsPanel
              travelStart={travelStart}
              travelEnd={travelEnd}
              sections={sections}
              onSectionsChange={(next) => setRow((p) => ({ ...p, sections: next }))}
            />
          </div>
        </details>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
          <h3 className="mb-3 font-extrabold text-gray-900">Package summary</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="number"
              min={0}
              placeholder="Pax"
              className="border rounded-xl px-3 py-2 text-sm"
              value={sections.package_summary?.pax ?? ''}
              onChange={(e) =>
                setRow((p) => ({
                  ...p,
                  sections: {
                    ...sections,
                    package_summary: { ...sections.package_summary, pax: Number(e.target.value) || undefined },
                  },
                }))
              }
            />
            <input
              type="number"
              min={0}
              placeholder="Adults"
              className="border rounded-xl px-3 py-2 text-sm"
              value={sections.package_summary?.adults ?? ''}
              onChange={(e) =>
                setRow((p) => ({
                  ...p,
                  sections: {
                    ...sections,
                    package_summary: { ...sections.package_summary, adults: Number(e.target.value) || undefined },
                  },
                }))
              }
            />
            <input
              type="number"
              min={0}
              placeholder="Rooms"
              className="border rounded-xl px-3 py-2 text-sm"
              value={sections.package_summary?.rooms ?? ''}
              onChange={(e) =>
                setRow((p) => ({
                  ...p,
                  sections: {
                    ...sections,
                    package_summary: { ...sections.package_summary, rooms: Number(e.target.value) || undefined },
                  },
                }))
              }
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(sections.package_summary?.flights_included)}
                onChange={(e) =>
                  setRow((p) => ({
                    ...p,
                    sections: {
                      ...sections,
                      package_summary: { ...sections.package_summary, flights_included: e.target.checked },
                    },
                  }))
                }
              />
              Flights included
            </label>
          </div>
        </div>

        {itineraryId ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5">
            <h3 className="font-extrabold text-gray-900">Booking confirmation voucher</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create and edit vouchers in Manage Voucher — linked to this itinerary with the same stays, cab, and payment fields.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/crm/manage-voucher?itinerary=${itineraryId}`}
                className="inline-flex items-center rounded-xl bg-amber-800 px-4 py-2 text-sm font-bold text-white hover:bg-amber-900"
              >
                Open Manage Voucher
              </Link>
              <Link
                href={`/crm/itineraries/${itineraryId}/print`}
                target="_blank"
                className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900"
              >
                Itinerary PDF
              </Link>
            </div>
          </div>
        ) : null}

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
          <div className="min-w-0 rounded-2xl border border-gray-100 bg-slate-50 p-4 sm:p-5">
            <h3 className="mb-2 font-extrabold text-gray-900">Hotel summary (auto)</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{sections.hotel_notes || 'Assign hotels per night above.'}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-gray-900">Policies &amp; information (PDF)</h3>
            <button
              type="button"
              className="text-xs font-bold text-teal-800 hover:text-teal-950 underline"
              onClick={() =>
                setRow((p) => ({
                  ...p,
                  sections: { ...sections, ...DEFAULT_ITINERARY_POLICIES },
                }))
              }
            >
              Reset to professional template
            </button>
          </div>
          <p className="text-xs text-gray-600 -mt-2">Shown on the last pages of the itinerary PDF — disclaimer, terms, cancellation, and how to reach.</p>
          {(
            [
              ['disclaimer', 'Disclaimer'],
              ['terms_conditions', 'Terms & conditions'],
              ['cancellation_policy', 'Cancellation policy'],
              ['how_to_reach', 'How to reach'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-bold uppercase text-gray-500">{label}</label>
              <textarea
                className="mt-1 w-full border rounded-xl px-3 py-2 text-sm min-h-[80px] bg-white"
                value={(sections[key] as string) || ''}
                onChange={(e) => setRow((p) => ({ ...p, sections: { ...sections, [key]: e.target.value } }))}
              />
            </div>
          ))}
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

