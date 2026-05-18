'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmSelect from '../ui/CrmSelect';
import CrmBadge, { leadStatusTone } from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import { Eye, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import CrmEntityDetailModal from '../details/CrmEntityDetailModal';

export type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  destination: string | null;
  budget: number | null;
  duration: string | null;
  status: string;
  created_at: string;
};

const statuses = ['new', 'contacted', 'quoted', 'confirmed', 'closed'] as const;

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  source: '',
  destination: '',
  budget: '',
  duration: '',
  status: 'new' as (typeof statuses)[number],
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: LeadRow } | null;

export default function CrmLeadsTable({ title = 'Leads' }: { title?: string }) {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailRow, setDetailRow] = useState<LeadRow | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('id,name,phone,email,source,destination,budget,duration,status,created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data || []) as LeadRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load leads', 'error');
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
        (r.phone || '').includes(s) ||
        (r.email || '').toLowerCase().includes(s) ||
        (r.source || '').toLowerCase().includes(s) ||
        (r.destination || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    setForm({ ...emptyForm, status: 'new' });
    setModal({ mode: 'create' });
  };

  const openEdit = (row: LeadRow) => {
    setForm({
      name: row.name,
      phone: row.phone || '',
      email: row.email || '',
      source: row.source || '',
      destination: row.destination || '',
      budget: row.budget != null ? String(row.budget) : '',
      duration: row.duration || '',
      status: row.status as (typeof statuses)[number],
    });
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Name is required', 'error');
      return;
    }
    let budget: number | null = null;
    if (form.budget.trim()) {
      const b = Number.parseFloat(form.budget);
      if (!Number.isFinite(b)) {
        showToast('Invalid budget', 'error');
        return;
      }
      budget = b;
    }
    const payload = {
      name,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      source: form.source.trim() || null,
      destination: form.destination.trim() || null,
      budget,
      duration: form.duration.trim() || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_leads').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Lead updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_leads').insert({ ...payload, ...actor });
        if (error) throw error;
        showToast('Lead added', 'success');
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: LeadRow) => {
    if (!window.confirm(`Delete lead “${row.name}”?`)) return;
    try {
      const { error } = await supabase.from('crm_leads').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Lead deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h1>
          <p className="text-sm text-slate-500">Full CRUD on leads (admin and employee).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="max-w-xs flex-1">
            <CrmInput placeholder="Search name, phone, source…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add lead
          </CrmButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={UserPlus} title="No leads found" description="Add a lead or clear your search." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Name</CrmTh>
              <CrmTh>Phone</CrmTh>
              <CrmTh>Source</CrmTh>
              <CrmTh>Destination</CrmTh>
              <CrmTh>Status</CrmTh>
              <CrmTh className="hidden lg:table-cell">Created</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-medium text-slate-900">{r.name}</CrmTd>
                <CrmTd>{r.phone || '—'}</CrmTd>
                <CrmTd>{r.source || '—'}</CrmTd>
                <CrmTd className="max-w-[140px] truncate">{r.destination || '—'}</CrmTd>
                <CrmTd>
                  <CrmBadge tone={leadStatusTone(r.status)}>{r.status}</CrmBadge>
                </CrmTd>
                <CrmTd className="hidden text-xs text-slate-500 lg:table-cell">{new Date(r.created_at).toLocaleDateString()}</CrmTd>
                <CrmTd className="text-right">
                  <CrmButton variant="ghost" size="sm" className="mr-1" onClick={() => setDetailRow(r)} title="View details">
                    <Eye size={16} />
                  </CrmButton>
                  <CrmButton variant="ghost" size="sm" className="mr-1" onClick={() => openEdit(r)}>
                    <Pencil size={16} />
                  </CrmButton>
                  <CrmButton variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(r)}>
                    <Trash2 size={16} />
                  </CrmButton>
                </CrmTd>
              </CrmTr>
            ))}
          </CrmTbody>
        </CrmTable>
      )}

      <CrmDialog open={modal != null} title={modal?.mode === 'edit' ? 'Edit lead' : 'Add lead'} onClose={() => !saving && setModal(null)}>
        <div className="space-y-3">
          <CrmInput label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <CrmInput label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Source" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
            <CrmInput label="Destination" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Budget (₹)" type="number" step="0.01" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
            <CrmInput label="Duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 5N/6D" />
          </div>
          <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof statuses)[number] }))}>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </CrmSelect>
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

      <CrmEntityDetailModal
        open={detailRow != null}
        title={detailRow?.name || 'Lead details'}
        subtitle={detailRow?.destination || undefined}
        onClose={() => setDetailRow(null)}
        sections={[
          {
            heading: 'Customer',
            fields: detailRow
              ? [
                  { label: 'Phone', value: detailRow.phone || '—' },
                  { label: 'Email', value: detailRow.email || '—' },
                  { label: 'Source', value: detailRow.source || '—' },
                  { label: 'Duration', value: detailRow.duration || '—' },
                ]
              : [],
          },
          {
            heading: 'Booking / quote',
            fields: detailRow
              ? [
                  { label: 'Status', value: detailRow.status },
                  { label: 'Budget', value: detailRow.budget != null ? `₹${Number(detailRow.budget).toLocaleString()}` : '—' },
                  { label: 'Created', value: new Date(detailRow.created_at).toLocaleString() },
                ]
              : [],
          },
        ]}
      />
    </div>
  );
}
