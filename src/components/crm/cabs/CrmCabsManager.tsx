'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { Car, Pencil, Plus, Trash2 } from 'lucide-react';

type CabRow = {
  id: string;
  name: string;
  vehicle_type: string | null;
  seating_capacity: number | null;
  driver_name: string | null;
  driver_contact: string | null;
  description: string | null;
  status: string;
  sort_order: number;
};

const empty = {
  name: '',
  vehicle_type: '',
  seating_capacity: '',
  driver_name: '',
  driver_contact: '',
  description: '',
  status: 'active',
  sort_order: '0',
};

export default function CrmCabsManager() {
  const [rows, setRows] = useState<CabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; row: CabRow } | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_cabs')
        .select('id,name,vehicle_type,seating_capacity,driver_name,driver_contact,description,status,sort_order')
        .order('sort_order')
        .order('name');
      if (error) throw error;
      setRows((data || []) as CabRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load cabs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        (r.vehicle_type || '').toLowerCase().includes(s) ||
        (r.driver_name || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Cab name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        vehicle_type: form.vehicle_type.trim() || null,
        seating_capacity: form.seating_capacity ? Number(form.seating_capacity) : null,
        driver_name: form.driver_name.trim() || null,
        driver_contact: form.driver_contact.trim() || null,
        description: form.description.trim() || null,
        status: form.status,
        sort_order: Number(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_cabs').update(payload).eq('id', modal.row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crm_cabs').insert(payload);
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

  const remove = async (row: CabRow) => {
    if (!window.confirm(`Delete “${row.name}”?`)) return;
    try {
      const { error } = await supabase.from('crm_cabs').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="crm-surface space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Cabs</h1>
        <p className="text-sm text-slate-600">Fleet catalog for vouchers and itineraries.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CrmInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <CrmButton variant="primary" onClick={() => { setForm(empty); setModal({ mode: 'create' }); }}>
          <Plus size={16} /> Add cab
        </CrmButton>
      </div>
      {loading ? (
        <CrmSkeleton className="h-48 w-full" />
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Car} title="No cabs" description="Add Swift Dzire, Innova, Tempo Traveller, etc." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Cab</CrmTh>
              <CrmTh>Type</CrmTh>
              <CrmTh>Seats</CrmTh>
              <CrmTh>Driver</CrmTh>
              <CrmTh>Status</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-semibold text-slate-950">{r.name}</CrmTd>
                <CrmTd>{r.vehicle_type || '—'}</CrmTd>
                <CrmTd>{r.seating_capacity ?? '—'}</CrmTd>
                <CrmTd className="text-sm">
                  {r.driver_name || '—'}
                  {r.driver_contact ? <span className="block text-slate-500">{r.driver_contact}</span> : null}
                </CrmTd>
                <CrmTd className="capitalize">{r.status}</CrmTd>
                <CrmTd className="text-right">
                  <button type="button" className="p-1 text-teal-700" onClick={() => { setForm({ name: r.name, vehicle_type: r.vehicle_type || '', seating_capacity: r.seating_capacity != null ? String(r.seating_capacity) : '', driver_name: r.driver_name || '', driver_contact: r.driver_contact || '', description: r.description || '', status: r.status, sort_order: String(r.sort_order) }); setModal({ mode: 'edit', row: r }); }}>
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
      <CrmDialog open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit cab' : 'Add cab'}>
        <div className="space-y-3">
          <CrmInput label="Cab name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Vehicle type" value={form.vehicle_type} onChange={(e) => setForm((f) => ({ ...f, vehicle_type: e.target.value }))} placeholder="Sedan / SUV" />
            <CrmInput label="Seating capacity" type="number" value={form.seating_capacity} onChange={(e) => setForm((f) => ({ ...f, seating_capacity: e.target.value }))} />
          </div>
          <CrmInput label="Driver name" value={form.driver_name} onChange={(e) => setForm((f) => ({ ...f, driver_name: e.target.value }))} />
          <CrmInput label="Driver contact" value={form.driver_contact} onChange={(e) => setForm((f) => ({ ...f, driver_contact: e.target.value }))} />
          <CrmTextarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
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
