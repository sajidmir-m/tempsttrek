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
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';

export type ExpenseRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  payee: string | null;
  notes: string | null;
  created_at: string;
};

const cats = ['vendor', 'staff', 'trip', 'office', 'other'] as const;

const emptyForm = {
  title: '',
  category: 'other' as (typeof cats)[number],
  amount: '',
  expense_date: new Date().toISOString().slice(0, 10),
  payee: '',
  notes: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: ExpenseRow } | null;

export default function CrmExpensesManager() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
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
        .from('crm_expenses')
        .select('id,title,category,amount,expense_date,payee,notes,created_at')
        .order('expense_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data || []) as ExpenseRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load expenses', 'error');
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
        r.title.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        (r.payee || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    setForm({ ...emptyForm, expense_date: new Date().toISOString().slice(0, 10) });
    setModal({ mode: 'create' });
  };

  const openEdit = (row: ExpenseRow) => {
    setForm({
      title: row.title,
      category: row.category as (typeof cats)[number],
      amount: String(row.amount),
      expense_date: row.expense_date,
      payee: row.payee || '',
      notes: row.notes || '',
    });
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) {
      showToast('Title is required', 'error');
      return;
    }
    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    const payload = {
      title,
      category: form.category,
      amount,
      expense_date: form.expense_date,
      payee: form.payee.trim() || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_expenses').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Expense updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_expenses').insert({ ...payload, ...actor });
        if (error) throw error;
        showToast('Expense added', 'success');
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: ExpenseRow) => {
    if (!window.confirm(`Delete expense “${row.title}”?`)) return;
    try {
      const { error } = await supabase.from('crm_expenses').delete().eq('id', row.id);
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
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Expenses</h1>
          <p className="text-sm text-slate-500">Log costs by category. Staff and admins have full CRUD.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <CrmInput placeholder="Search title, payee…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add expense
          </CrmButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Wallet} title="No expenses" description="Record vendor payouts, staff claims, or trip costs." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Date</CrmTh>
              <CrmTh>Title</CrmTh>
              <CrmTh className="hidden sm:table-cell">Category</CrmTh>
              <CrmTh>Amount</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="whitespace-nowrap text-xs text-slate-600">{r.expense_date}</CrmTd>
                <CrmTd className="font-medium text-slate-900">{r.title}</CrmTd>
                <CrmTd className="hidden sm:table-cell">{r.category}</CrmTd>
                <CrmTd>₹{Number(r.amount).toLocaleString()}</CrmTd>
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

      <CrmDialog open={modal != null} title={modal?.mode === 'edit' ? 'Edit expense' : 'Add expense'} onClose={() => !saving && setModal(null)}>
        <div className="space-y-3">
          <CrmInput label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmSelect label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as (typeof cats)[number] }))}>
              {cats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </CrmSelect>
            <CrmInput label="Amount (₹)" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <CrmInput label="Date" type="date" value={form.expense_date} onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))} />
          <CrmInput label="Payee / vendor" value={form.payee} onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))} />
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
