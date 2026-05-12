'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmBadge, { voucherStatusTone } from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';

export type VoucherRow = {
  id: string;
  code: string;
  title: string;
  voucher_type: string;
  status: string;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
};

const vtypes = ['hotel', 'cab', 'experience', 'other'] as const;
const vst = ['draft', 'issued', 'redeemed', 'cancelled'] as const;

const emptyForm = {
  code: '',
  title: '',
  voucher_type: 'hotel' as (typeof vtypes)[number],
  status: 'draft' as (typeof vst)[number],
  valid_until: '',
  notes: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: VoucherRow } | null;

export default function CrmVouchersManager() {
  const [rows, setRows] = useState<VoucherRow[]>([]);
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
        .from('crm_vouchers')
        .select('id,code,title,voucher_type,status,valid_until,notes,created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data || []) as VoucherRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load vouchers', 'error');
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
      (r) => r.code.toLowerCase().includes(s) || r.title.toLowerCase().includes(s) || r.voucher_type.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    const code = `VCH-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    setForm({ ...emptyForm, code });
    setModal({ mode: 'create' });
  };

  const openEdit = (row: VoucherRow) => {
    setForm({
      code: row.code,
      title: row.title,
      voucher_type: row.voucher_type as (typeof vtypes)[number],
      status: row.status as (typeof vst)[number],
      valid_until: row.valid_until || '',
      notes: row.notes || '',
    });
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    const code = form.code.trim();
    const title = form.title.trim();
    if (!code || !title) {
      showToast('Code and title are required', 'error');
      return;
    }
    const payload = {
      code,
      title,
      voucher_type: form.voucher_type,
      status: form.status,
      valid_until: form.valid_until.trim() || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_vouchers').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Voucher updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_vouchers').insert({ ...payload, ...actor });
        if (error) throw error;
        showToast('Voucher added', 'success');
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: VoucherRow) => {
    if (!window.confirm(`Delete voucher ${row.code}?`)) return;
    try {
      const { error } = await supabase.from('crm_vouchers').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Vouchers</h1>
          <p className="text-sm text-slate-500">Hotel, cab, or experience codes with lifecycle status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <CrmInput placeholder="Search code, title…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add voucher
          </CrmButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Ticket} title="No vouchers" description="Issue codes for partners or customers and track status." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Code</CrmTh>
              <CrmTh>Title</CrmTh>
              <CrmTh className="hidden sm:table-cell">Type</CrmTh>
              <CrmTh>Status</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-mono text-xs font-semibold text-teal-800">{r.code}</CrmTd>
                <CrmTd className="font-medium text-slate-900">{r.title}</CrmTd>
                <CrmTd className="hidden sm:table-cell">{r.voucher_type}</CrmTd>
                <CrmTd>
                  <CrmBadge tone={voucherStatusTone(r.status)}>{r.status}</CrmBadge>
                </CrmTd>
                <CrmTd className="text-right">
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

      <CrmDialog open={modal != null} title={modal?.mode === 'edit' ? 'Edit voucher' : 'Add voucher'} onClose={() => !saving && setModal(null)}>
        <div className="space-y-3">
          <CrmInput label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <CrmInput label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmSelect label="Type" value={form.voucher_type} onChange={(e) => setForm((f) => ({ ...f, voucher_type: e.target.value as (typeof vtypes)[number] }))}>
              {vtypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </CrmSelect>
            <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof vst)[number] }))}>
              {vst.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </CrmSelect>
          </div>
          <CrmInput label="Valid until" type="date" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} />
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
    </div>
  );
}
