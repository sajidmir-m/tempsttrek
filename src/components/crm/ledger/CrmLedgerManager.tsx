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
import CrmBadge from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export type LedgerRow = {
  id: string;
  entry_date: string;
  description: string;
  flow: 'in' | 'out';
  amount: number;
  reference: string | null;
  created_at: string;
};

const emptyForm = {
  entry_date: new Date().toISOString().slice(0, 10),
  description: '',
  flow: 'out' as 'in' | 'out',
  amount: '',
  reference: '',
};

export default function CrmLedgerManager() {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_ledger_entries')
        .select('id,entry_date,description,flow,amount,reference,created_at')
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data || []) as LedgerRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load ledger', 'error');
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
        r.description.toLowerCase().includes(s) ||
        (r.reference || '').toLowerCase().includes(s) ||
        r.flow.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const totals = useMemo(() => {
    let inn = 0;
    let out = 0;
    for (const r of filtered) {
      if (r.flow === 'in') inn += Number(r.amount);
      else out += Number(r.amount);
    }
    return { inn, out, net: inn - out };
  }, [filtered]);

  const openCreate = () => {
    setForm({ ...emptyForm, entry_date: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  };

  const save = async () => {
    const description = form.description.trim();
    if (!description) {
      showToast('Description is required', 'error');
      return;
    }
    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    setSaving(true);
    try {
      const actor = await crmActorFields();
      const { error } = await supabase.from('crm_ledger_entries').insert({
        entry_date: form.entry_date,
        description,
        flow: form.flow,
        amount,
        reference: form.reference.trim() || null,
        ...actor,
      });
      if (error) throw error;
      showToast('Entry added', 'success');
      setOpen(false);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: LedgerRow) => {
    if (!window.confirm('Delete this ledger line?')) return;
    try {
      const { error } = await supabase.from('crm_ledger_entries').delete().eq('id', row.id);
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
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Ledger</h1>
          <p className="text-sm text-slate-500">Simple cashbook: money in vs money out (staff full CRUD).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <CrmInput placeholder="Search description…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add entry
          </CrmButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Money in (filtered)</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">₹{totals.inn.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Money out (filtered)</p>
          <p className="mt-1 text-lg font-bold text-red-700">₹{totals.out.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Net (filtered)</p>
          <p className="mt-1 text-lg font-bold text-slate-900">₹{totals.net.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={BookOpen} title="No ledger lines" description="Add manual entries; later you can link payouts from expenses." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Date</CrmTh>
              <CrmTh>Description</CrmTh>
              <CrmTh>Flow</CrmTh>
              <CrmTh>Amount</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="whitespace-nowrap text-xs text-slate-600">{r.entry_date}</CrmTd>
                <CrmTd className="max-w-[220px]">
                  <div className="font-medium text-slate-900">{r.description}</div>
                  {r.reference ? <div className="text-xs text-slate-500">{r.reference}</div> : null}
                </CrmTd>
                <CrmTd>
                  <CrmBadge tone={r.flow === 'in' ? 'success' : 'danger'}>{r.flow === 'in' ? 'In' : 'Out'}</CrmBadge>
                </CrmTd>
                <CrmTd>₹{Number(r.amount).toLocaleString()}</CrmTd>
                <CrmTd className="text-right">
                  <CrmButton variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(r)}>
                    <Trash2 size={16} />
                  </CrmButton>
                </CrmTd>
              </CrmTr>
            ))}
          </CrmTbody>
        </CrmTable>
      )}

      <CrmDialog open={open} title="Add ledger entry" onClose={() => !saving && setOpen(false)}>
        <div className="space-y-3">
          <CrmInput label="Date" type="date" value={form.entry_date} onChange={(e) => setForm((f) => ({ ...f, entry_date: e.target.value }))} />
          <CrmTextarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmSelect label="Flow" value={form.flow} onChange={(e) => setForm((f) => ({ ...f, flow: e.target.value as 'in' | 'out' }))}>
              <option value="in">Money in</option>
              <option value="out">Money out</option>
            </CrmSelect>
            <CrmInput label="Amount (₹)" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <CrmInput label="Reference (optional)" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <CrmButton variant="secondary" size="md" onClick={() => setOpen(false)} disabled={saving}>
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
