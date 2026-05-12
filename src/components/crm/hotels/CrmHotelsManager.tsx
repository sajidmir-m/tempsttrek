'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmBadge from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { Hotel, Pencil, Plus, Trash2 } from 'lucide-react';

export type HotelRow = {
  id: string;
  name: string;
  region: string | null;
  category: string | null;
  meal_plan: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  gstin: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

const emptyForm = {
  name: '',
  region: '',
  category: '',
  meal_plan: '',
  contact_name: '',
  contact_phone: '',
  gstin: '',
  notes: '',
  is_active: true,
  sort_order: '0',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: HotelRow } | null;

export default function CrmHotelsManager() {
  const [rows, setRows] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_hotels')
        .select(
          'id,name,region,category,meal_plan,contact_name,contact_phone,gstin,notes,is_active,sort_order,created_at'
        )
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

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        (r.region || '').toLowerCase().includes(s) ||
        (r.category || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  };

  const openEdit = (row: HotelRow) => {
    setForm({
      name: row.name,
      region: row.region || '',
      category: row.category || '',
      meal_plan: row.meal_plan || '',
      contact_name: row.contact_name || '',
      contact_phone: row.contact_phone || '',
      gstin: row.gstin || '',
      notes: row.notes || '',
      is_active: row.is_active,
      sort_order: String(row.sort_order ?? 0),
    });
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Name is required', 'error');
      return;
    }
    const sort = Number.parseInt(form.sort_order, 10);
    const payload = {
      name,
      region: form.region.trim() || null,
      category: form.category.trim() || null,
      meal_plan: form.meal_plan.trim() || null,
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
        showToast('Hotel added', 'success');
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
    if (!window.confirm(`Delete hotel “${row.name}”?`)) return;
    try {
      const { error } = await supabase.from('crm_hotels').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Hotel deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Hotels</h1>
          <p className="text-sm text-slate-500">Master list for properties (admin and staff can add, edit, delete).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <CrmInput placeholder="Search name, region…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add hotel
          </CrmButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Hotel} title="No hotels yet" description="Add your first property to use in quotes and vouchers." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Name</CrmTh>
              <CrmTh className="hidden md:table-cell">Region</CrmTh>
              <CrmTh className="hidden lg:table-cell">Category</CrmTh>
              <CrmTh>Active</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-medium text-slate-900">{r.name}</CrmTd>
                <CrmTd className="hidden md:table-cell">{r.region || '—'}</CrmTd>
                <CrmTd className="hidden lg:table-cell">{r.category || '—'}</CrmTd>
                <CrmTd>
                  <CrmBadge tone={r.is_active ? 'success' : 'neutral'}>{r.is_active ? 'Yes' : 'No'}</CrmBadge>
                </CrmTd>
                <CrmTd className="text-right">
                  <CrmButton variant="ghost" size="sm" className="mr-1" onClick={() => openEdit(r)} aria-label="Edit">
                    <Pencil size={16} />
                  </CrmButton>
                  <CrmButton variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(r)} aria-label="Delete">
                    <Trash2 size={16} />
                  </CrmButton>
                </CrmTd>
              </CrmTr>
            ))}
          </CrmTbody>
        </CrmTable>
      )}

      <CrmDialog
        open={modal != null}
        title={modal?.mode === 'edit' ? 'Edit hotel' : 'Add hotel'}
        onClose={() => !saving && setModal(null)}
      >
        <div className="space-y-3">
          <CrmInput label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Region" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
            <CrmInput label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <CrmInput label="Meal plan" value={form.meal_plan} onChange={(e) => setForm((f) => ({ ...f, meal_plan: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Contact name" value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} />
            <CrmInput label="Contact phone" value={form.contact_phone} onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))} />
          </div>
          <CrmInput label="GSTIN" value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput
              label="Sort order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            />
            <label className="flex cursor-pointer items-center gap-2 pt-6 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              Active
            </label>
          </div>
          <CrmTextarea label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
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
    </div>
  );
}
