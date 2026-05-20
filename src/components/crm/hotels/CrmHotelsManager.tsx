'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import { HOTEL_AVAILABILITY, HOTEL_AVAILABILITY_LABELS } from '@/lib/crm-leads';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';
import { uploadToBucket, deleteStorageObjectByPublicUrl } from '@/lib/storage-upload';
import StorageUploadField from '@/components/admin/StorageUploadField';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmBadge from '../ui/CrmBadge';
import CrmSelect from '../ui/CrmSelect';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmPagination from '../ui/CrmPagination';
import { CrmPdfDocument } from '../pdf/CrmPdfDocument';
import { Hotel, Pencil, Plus, Trash2, FileDown, GripVertical } from 'lucide-react';

export type HotelRow = {
  id: string;
  name: string;
  region: string | null;
  location: string | null;
  category: string | null;
  meal_plan: string | null;
  price_per_night: number | null;
  amenities: string[] | null;
  room_details: string | null;
  description: string | null;
  availability_status: string;
  featured_image_url: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  gstin: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type HotelImage = { id: string; image_url: string; caption: string | null; sort_order: number };

const HOTEL_SELECT =
  'id,name,region,location,category,meal_plan,price_per_night,amenities,room_details,description,availability_status,featured_image_url,contact_name,contact_phone,gstin,notes,is_active,sort_order,created_at';

const emptyForm = {
  name: '',
  region: '',
  location: '',
  category: '',
  meal_plan: '',
  price_per_night: '',
  amenities: '',
  room_details: '',
  description: '',
  availability_status: 'available',
  featured_image_url: '',
  contact_name: '',
  contact_phone: '',
  gstin: '',
  notes: '',
  is_active: true,
  sort_order: '0',
};

const PAGE_SIZE = 12;

type ModalState = { mode: 'create' } | { mode: 'edit'; row: HotelRow } | null;

export default function CrmHotelsManager() {
  const [rows, setRows] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [gallery, setGallery] = useState<HotelImage[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfHotel, setPdfHotel] = useState<HotelRow | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_hotels')
        .select(HOTEL_SELECT)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .limit(500);
      if (error) throw error;
      setRows((data || []) as HotelRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load hotels', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadGallery = async (hotelId: string) => {
    const { data, error } = await supabase
      .from('crm_hotel_images')
      .select('id,image_url,caption,sort_order')
      .eq('hotel_id', hotelId)
      .order('sort_order');
    if (!error) setGallery((data || []) as HotelImage[]);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (availFilter && r.availability_status !== availFilter) return false;
      if (!s) return true;
      return (
        r.name.toLowerCase().includes(s) ||
        (r.region || '').toLowerCase().includes(s) ||
        (r.location || '').toLowerCase().includes(s)
      );
    });
  }, [rows, q, availFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const openCreate = () => {
    setForm(emptyForm);
    setGallery([]);
    setModal({ mode: 'create' });
  };

  const openEdit = async (row: HotelRow) => {
    setForm({
      name: row.name,
      region: row.region || '',
      location: row.location || '',
      category: row.category || '',
      meal_plan: row.meal_plan || '',
      price_per_night: row.price_per_night != null ? String(row.price_per_night) : '',
      amenities: (row.amenities || []).join(', '),
      room_details: row.room_details || '',
      description: row.description || '',
      availability_status: row.availability_status || 'available',
      featured_image_url: row.featured_image_url || '',
      contact_name: row.contact_name || '',
      contact_phone: row.contact_phone || '',
      gstin: row.gstin || '',
      notes: row.notes || '',
      is_active: row.is_active,
      sort_order: String(row.sort_order ?? 0),
    });
    setModal({ mode: 'edit', row });
    await loadGallery(row.id);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Name is required', 'error');
      return;
    }
    const sort = Number.parseInt(form.sort_order, 10);
    const price = form.price_per_night.trim() ? Number.parseFloat(form.price_per_night) : null;
    const amenities = form.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const payload = {
      name,
      region: form.region.trim() || null,
      location: form.location.trim() || null,
      category: form.category.trim() || null,
      meal_plan: form.meal_plan.trim() || null,
      price_per_night: Number.isFinite(price as number) ? price : null,
      amenities,
      room_details: form.room_details.trim() || null,
      description: form.description.trim() || null,
      availability_status: form.availability_status,
      featured_image_url: form.featured_image_url.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      gstin: form.gstin.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
      sort_order: Number.isFinite(sort) ? sort : 0,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_hotels').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Hotel updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_hotels').insert({ ...payload, ...actor });
        if (error) throw error;
        showToast('Hotel added — open edit to upload gallery images', 'success');
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: HotelRow) => {
    if (!window.confirm(`Delete hotel "${row.name}"?`)) return;
    try {
      const { error } = await supabase.from('crm_hotels').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Hotel deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const addGalleryImage = async (file: File, hotelId: string) => {
    const url = await uploadToBucket('hotels', hotelId, file);
    const maxSort = gallery.length ? Math.max(...gallery.map((g) => g.sort_order)) : 0;
    const { error } = await supabase.from('crm_hotel_images').insert({
      hotel_id: hotelId,
      image_url: url,
      sort_order: maxSort + 10,
    });
    if (error) throw error;
    await loadGallery(hotelId);
    if (!form.featured_image_url) setForm((f) => ({ ...f, featured_image_url: url }));
  };

  const removeGalleryImage = async (img: HotelImage, hotelId: string) => {
    await supabase.from('crm_hotel_images').delete().eq('id', img.id);
    try {
      await deleteStorageObjectByPublicUrl(img.image_url);
    } catch {
      /* optional */
    }
    await loadGallery(hotelId);
  };

  const reorderGallery = async (targetId: string, hotelId: string) => {
    if (!dragId || dragId === targetId) return;
    const list = [...gallery];
    const from = list.findIndex((g) => g.id === dragId);
    const to = list.findIndex((g) => g.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setGallery(list);
    setDragId(null);
    await Promise.all(list.map((g, i) => supabase.from('crm_hotel_images').update({ sort_order: (i + 1) * 10 }).eq('id', g.id)));
    await loadGallery(hotelId);
  };

  const exportPdf = async (row: HotelRow) => {
    setPdfHotel(row);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (!pdfRef.current) return;
    try {
      await downloadElementAsPdf(pdfRef.current, `hotel-${row.name.replace(/\s+/g, '-')}.pdf`);
      showToast('PDF downloaded', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'PDF failed', 'error');
    } finally {
      setPdfHotel(null);
    }
  };

  const editHotelId = modal?.mode === 'edit' ? modal.row.id : null;

  return (
    <div className="crm-surface space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Hotel Management</h1>
          <p className="text-sm text-slate-500">Properties with gallery, pricing, and itinerary linking.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CrmInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="min-w-[180px]" />
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add hotel
          </CrmButton>
        </div>
      </div>

      <CrmSelect value={availFilter} onChange={(e) => setAvailFilter(e.target.value)} className="max-w-[180px]">
        <option value="">All availability</option>
        {HOTEL_AVAILABILITY.map((a) => (
          <option key={a} value={a}>
            {HOTEL_AVAILABILITY_LABELS[a]}
          </option>
        ))}
      </CrmSelect>

      {loading ? (
        <CrmSkeleton className="h-32 w-full" />
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Hotel} title="No hotels yet" description="Add properties to use in itineraries and quotes." />
      ) : (
        <>
          <CrmTable>
            <CrmThead>
              <CrmTr>
                <CrmTh>Hotel</CrmTh>
                <CrmTh>Location</CrmTh>
                <CrmTh>Price/night</CrmTh>
                <CrmTh>Availability</CrmTh>
                <CrmTh className="text-right">Actions</CrmTh>
              </CrmTr>
            </CrmThead>
            <CrmTbody>
              {paged.map((r) => (
                <CrmTr key={r.id}>
                  <CrmTd>
                    <div className="flex items-center gap-2">
                      {r.featured_image_url && (
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg">
                          <Image src={r.featured_image_url} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <span className="font-semibold text-slate-950">{r.name}</span>
                    </div>
                  </CrmTd>
                  <CrmTd>{r.location || r.region || '—'}</CrmTd>
                  <CrmTd>{r.price_per_night != null ? `₹${Number(r.price_per_night).toLocaleString()}` : '—'}</CrmTd>
                  <CrmTd>
                    <CrmBadge tone={r.availability_status === 'available' ? 'success' : 'warning'}>
                      {HOTEL_AVAILABILITY_LABELS[r.availability_status as keyof typeof HOTEL_AVAILABILITY_LABELS] || r.availability_status}
                    </CrmBadge>
                  </CrmTd>
                  <CrmTd className="text-right whitespace-nowrap">
                    <CrmButton variant="ghost" size="sm" onClick={() => void exportPdf(r)}>
                      <FileDown size={16} />
                    </CrmButton>
                    <CrmButton variant="ghost" size="sm" onClick={() => void openEdit(r)}>
                      <Pencil size={16} />
                    </CrmButton>
                    <CrmButton variant="ghost" size="sm" className="text-red-600" onClick={() => void remove(r)}>
                      <Trash2 size={16} />
                    </CrmButton>
                  </CrmTd>
                </CrmTr>
              ))}
            </CrmTbody>
          </CrmTable>
          <CrmPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      <CrmDialog open={modal != null} title={modal?.mode === 'edit' ? 'Edit hotel' : 'Add hotel'} wide onClose={() => !saving && setModal(null)}>
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          <CrmInput label="Hotel name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <CrmInput label="Region" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <CrmInput label="Price per night (₹)" type="number" value={form.price_per_night} onChange={(e) => setForm((f) => ({ ...f, price_per_night: e.target.value }))} />
          </div>
          <CrmSelect label="Availability" value={form.availability_status} onChange={(e) => setForm((f) => ({ ...f, availability_status: e.target.value }))}>
            {HOTEL_AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {HOTEL_AVAILABILITY_LABELS[a]}
              </option>
            ))}
          </CrmSelect>
          <CrmInput label="Amenities (comma-separated)" value={form.amenities} onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))} />
          <CrmTextarea label="Room details" value={form.room_details} onChange={(e) => setForm((f) => ({ ...f, room_details: e.target.value }))} rows={2} />
          <CrmTextarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          <div className="flex flex-wrap items-center gap-2">
            <CrmInput label="Featured image URL" value={form.featured_image_url} onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))} className="flex-1" />
            {editHotelId && (
              <StorageUploadField
                bucket="hotels"
                folder={editHotelId}
                accept="image/*"
                label="Upload featured"
                onUploaded={(url) => setForm((f) => ({ ...f, featured_image_url: url }))}
              />
            )}
          </div>
          {form.featured_image_url && (
            <div className="relative h-32 w-full max-w-sm overflow-hidden rounded-xl border border-slate-200">
              <Image src={form.featured_image_url} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}

          {editHotelId && (
            <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
              <h4 className="mb-2 text-sm font-bold text-slate-800">Gallery — drag to reorder</h4>
              <label className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal-300 bg-white py-6 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                Drop images here or click to upload
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    e.currentTarget.value = '';
                    for (const f of files) {
                      try {
                        await addGalleryImage(f, editHotelId);
                      } catch (err: unknown) {
                        showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
                      }
                    }
                  }}
                />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => setDragId(img.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => void reorderGallery(img.id, editHotelId)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    <GripVertical className="absolute left-1 top-1 z-10 h-4 w-4 text-white drop-shadow" />
                    <Image src={img.image_url} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100"
                      onClick={() => void removeGalleryImage(img, editHotelId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!editHotelId && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Save the hotel first, then edit to upload gallery images.</p>
          )}

          <CrmTextarea label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          <div className="flex justify-end gap-2 pt-2">
            <CrmButton variant="secondary" size="md" onClick={() => setModal(null)} disabled={saving}>
              Cancel
            </CrmButton>
            <CrmButton variant="primary" size="md" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </CrmButton>
          </div>
        </div>
      </CrmDialog>

      {pdfHotel && (
        <div className="pointer-events-none fixed -left-[9999px] top-0">
          <CrmPdfDocument
            ref={pdfRef}
            title="Hotel Details"
            subtitle={pdfHotel.name}
            rows={[
              { label: 'Location', value: pdfHotel.location || pdfHotel.region || '—' },
              { label: 'Price/night', value: pdfHotel.price_per_night != null ? `₹${pdfHotel.price_per_night}` : '—' },
              { label: 'Availability', value: pdfHotel.availability_status },
              { label: 'Amenities', value: (pdfHotel.amenities || []).join(', ') || '—' },
              { label: 'Room details', value: pdfHotel.room_details || '—' },
              { label: 'Description', value: pdfHotel.description || '—' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
