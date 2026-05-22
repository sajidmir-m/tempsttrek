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
import type { LucideIcon } from 'lucide-react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type Row = { id: string; name: string; description?: string | null; status: string; sort_order: number };

type Props = {
  title: string;
  subtitle: string;
  table: string;
  select: string;
  icon: LucideIcon;
  hasDescription?: boolean;
};

const empty = { name: '', description: '', status: 'active', sort_order: '0' };

export default function CrmSimpleCatalogManager({ title, subtitle, table, select, icon: Icon, hasDescription }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; row: Row } | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from(table).select(select).order('sort_order').order('name');
      if (error) throw error;
      setRows((data || []) as unknown as Row[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [table, select, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s));
  }, [rows, q]);

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        description: hasDescription ? form.description.trim() || null : undefined,
        status: form.status,
        sort_order: Number(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from(table).update(payload).eq('id', modal.row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
      }
      showToast('Saved', 'success');
      setModal(null);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      showToast(msg.includes('category_check') ? 'Invalid data — check status field.' : msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete “${row.name}”?`)) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', row.id);
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
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CrmInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <CrmButton variant="primary" onClick={() => { setForm(empty); setModal({ mode: 'create' }); }}>
          <Plus size={16} /> Add
        </CrmButton>
      </div>
      {loading ? (
        <CrmSkeleton className="h-48 w-full" />
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Icon} title="No records" description="Add your first entry." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Name</CrmTh>
              {hasDescription ? <CrmTh>Description</CrmTh> : null}
              <CrmTh>Status</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-semibold text-slate-950">{r.name}</CrmTd>
                {hasDescription ? <CrmTd>{r.description || '—'}</CrmTd> : null}
                <CrmTd className="capitalize">{r.status}</CrmTd>
                <CrmTd className="text-right">
                  <button type="button" className="p-1 text-teal-700" onClick={() => { setForm({ name: r.name, description: r.description || '', status: r.status, sort_order: String(r.sort_order) }); setModal({ mode: 'edit', row: r }); }}>
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
      <CrmDialog open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit' : 'Add'}>
        <div className="space-y-3">
          <CrmInput label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          {hasDescription ? (
            <CrmTextarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          ) : null}
          <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </CrmSelect>
          <CrmInput label="Sort order" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <CrmButton variant="secondary" onClick={() => setModal(null)}>Cancel</CrmButton>
            <CrmButton variant="primary" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</CrmButton>
          </div>
        </div>
      </CrmDialog>
    </div>
  );
}
