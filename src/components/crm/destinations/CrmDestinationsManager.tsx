'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DESTINATION_BASE_LOCATIONS } from '@/lib/crm-catalog';
import { uploadToBucket, deleteStorageObjectByPublicUrl } from '@/lib/storage-upload';
import StorageUploadField from '@/components/admin/StorageUploadField';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

type DestRow = {
  id: string;
  name: string;
  base_location: string;
  route_from: string | null;
  route_to: string | null;
  description: string | null;
  featured_image_url: string | null;
  status: string;
  sort_order: number;
};

type DestImage = { id: string; image_url: string; caption: string | null; sort_order: number };

const empty = {
  name: '',
  base_location: 'Srinagar',
  route_from: '',
  route_to: '',
  description: '',
  featured_image_url: '',
  status: 'active',
  sort_order: '0',
};

export default function CrmDestinationsManager() {
  const [rows, setRows] = useState<DestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [baseFilter, setBaseFilter] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; row: DestRow } | null>(null);
  const [form, setForm] = useState(empty);
  const [gallery, setGallery] = useState<DestImage[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_destinations')
        .select('id,name,base_location,route_from,route_to,description,featured_image_url,status,sort_order')
        .order('sort_order')
        .order('name');
      if (error) throw error;
      setRows((data || []) as DestRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadGallery = async (id: string) => {
    const { data } = await supabase
      .from('crm_destination_images')
      .select('id,image_url,caption,sort_order')
      .eq('destination_id', id)
      .order('sort_order');
    setGallery((data || []) as DestImage[]);
  };

  const filtered = useMemo(() => {
    let list = rows;
    if (baseFilter) list = list.filter((r) => r.base_location === baseFilter);
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.base_location.toLowerCase().includes(s) ||
        (r.route_from || '').toLowerCase().includes(s) ||
        (r.route_to || '').toLowerCase().includes(s)
    );
  }, [rows, q, baseFilter]);

  const openEdit = (row: DestRow) => {
    setForm({
      name: row.name,
      base_location: row.base_location,
      route_from: row.route_from || '',
      route_to: row.route_to || '',
      description: row.description || '',
      featured_image_url: row.featured_image_url || '',
      status: row.status,
      sort_order: String(row.sort_order),
    });
    setModal({ mode: 'edit', row });
    void loadGallery(row.id);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Destination name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        base_location: form.base_location,
        route_from: form.route_from.trim() || null,
        route_to: form.route_to.trim() || null,
        description: form.description.trim() || null,
        featured_image_url: form.featured_image_url.trim() || null,
        status: form.status,
        sort_order: Number(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_destinations').update(payload).eq('id', modal.row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crm_destinations').insert(payload);
        if (error) throw error;
      }
      showToast('Saved', 'success');
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: DestRow) => {
    if (!window.confirm(`Delete “${row.name}”?`)) return;
    try {
      const { error } = await supabase.from('crm_destinations').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const addGalleryImage = async (file: File, destId: string) => {
    const url = await uploadToBucket('destinations', `destinations/${destId}`, file);
    const maxOrder = gallery.reduce((m, g) => Math.max(m, g.sort_order), -1);
    const { error } = await supabase.from('crm_destination_images').insert({
      destination_id: destId,
      image_url: url,
      sort_order: maxOrder + 1,
    });
    if (error) throw error;
    await loadGallery(destId);
  };

  const removeGalleryImage = async (img: DestImage, destId: string) => {
    await deleteStorageObjectByPublicUrl(img.image_url);
    await supabase.from('crm_destination_images').delete().eq('id', img.id);
    await loadGallery(destId);
  };

  return (
    <div className="crm-surface space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Destinations</h1>
        <p className="text-sm text-slate-600">
          Routes and sightseeing options grouped by base location (Srinagar, Gulmarg, etc.). Suggested automatically while building itineraries.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CrmInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <CrmSelect value={baseFilter} onChange={(e) => setBaseFilter(e.target.value)} className="max-w-[180px]">
          <option value="">All bases</option>
          {DESTINATION_BASE_LOCATIONS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </CrmSelect>
        <CrmButton variant="primary" onClick={() => { setForm(empty); setGallery([]); setModal({ mode: 'create' }); }}>
          <Plus size={16} /> Add destination
        </CrmButton>
      </div>
      {loading ? (
        <CrmSkeleton className="h-48 w-full" />
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={MapPin} title="No destinations" description="Add Srinagar → Sonamarg, local sightseeing, etc." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Route</CrmTh>
              <CrmTh>Base</CrmTh>
              <CrmTh>From → To</CrmTh>
              <CrmTh>Status</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd>
                  <div className="flex items-center gap-2">
                    {r.featured_image_url ? (
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg">
                        <Image src={r.featured_image_url} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    ) : null}
                    <span className="font-semibold text-slate-950">{r.name}</span>
                  </div>
                </CrmTd>
                <CrmTd>{r.base_location}</CrmTd>
                <CrmTd className="text-sm text-slate-600">
                  {[r.route_from, r.route_to].filter(Boolean).join(' → ') || '—'}
                </CrmTd>
                <CrmTd className="capitalize">{r.status}</CrmTd>
                <CrmTd className="text-right">
                  <button type="button" className="p-1 text-teal-700" onClick={() => openEdit(r)}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="p-1 text-red-600" onClick={() => void remove(r)}>
                    <Trash2 size={16} />
                  </button>
                </CrmTd>
              </CrmTr>
            ))}
          </CrmTbody>
        </CrmTable>
      )}
      <CrmDialog open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit destination' : 'Add destination'} wide>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <CrmInput label="Destination name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Srinagar to Sonamarg" />
          <CrmSelect label="Base location (for suggestions)" value={form.base_location} onChange={(e) => setForm((f) => ({ ...f, base_location: e.target.value }))}>
            {DESTINATION_BASE_LOCATIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </CrmSelect>
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Route from" value={form.route_from} onChange={(e) => setForm((f) => ({ ...f, route_from: e.target.value }))} />
            <CrmInput label="Route to" value={form.route_to} onChange={(e) => setForm((f) => ({ ...f, route_to: e.target.value }))} />
          </div>
          <CrmTextarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          <div className="flex flex-wrap items-end gap-2">
            <CrmInput label="Featured image URL" value={form.featured_image_url} onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))} className="flex-1" />
            {modal?.mode === 'edit' ? (
              <StorageUploadField
                label="Upload featured"
                bucket="destinations"
                folder={modal.row.id}
                accept="image/*"
                onUploaded={(url) => setForm((f) => ({ ...f, featured_image_url: url }))}
              />
            ) : null}
          </div>
          {modal?.mode === 'edit' ? (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Gallery images</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {gallery.map((img) => (
                  <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image src={img.image_url} alt="" fill className="object-cover" sizes="120px" />
                    <button type="button" className="absolute top-1 right-1 bg-white/90 text-red-600 rounded p-0.5" onClick={() => void removeGalleryImage(img, modal.row.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void addGalleryImage(f, modal.row.id).catch((err) => showToast(err instanceof Error ? err.message : 'Upload failed', 'error'));
                  e.target.value = '';
                }}
              />
            </div>
          ) : null}
          <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </CrmSelect>
          <div className="flex justify-end gap-2 pt-2">
            <CrmButton variant="secondary" onClick={() => setModal(null)}>Cancel</CrmButton>
            <CrmButton variant="primary" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</CrmButton>
          </div>
        </div>
      </CrmDialog>
    </div>
  );
}
