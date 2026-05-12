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
import CrmBadge, { invoiceStatusTone } from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import Link from 'next/link';
import { Pencil, Plus, Receipt, Trash2, FileDown } from 'lucide-react';

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  status: string;
  issue_date: string;
  notes: string | null;
  created_at: string;
};

const statuses = ['draft', 'sent', 'paid', 'void'] as const;

const emptyForm = {
  invoice_number: '',
  customer_name: '',
  customer_email: '',
  amount: '',
  status: 'draft' as (typeof statuses)[number],
  issue_date: new Date().toISOString().slice(0, 10),
  notes: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: InvoiceRow } | null;

export default function CrmInvoicesManager() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
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
        .from('crm_invoices')
        .select('id,invoice_number,customer_name,customer_email,amount,status,issue_date,notes,created_at')
        .order('issue_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data || []) as InvoiceRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load invoices', 'error');
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
        r.invoice_number.toLowerCase().includes(s) ||
        r.customer_name.toLowerCase().includes(s) ||
        (r.customer_email || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    const n = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setForm({ ...emptyForm, invoice_number: n, issue_date: new Date().toISOString().slice(0, 10) });
    setModal({ mode: 'create' });
  };

  const openEdit = (row: InvoiceRow) => {
    setForm({
      invoice_number: row.invoice_number,
      customer_name: row.customer_name,
      customer_email: row.customer_email || '',
      amount: String(row.amount),
      status: row.status as (typeof statuses)[number],
      issue_date: row.issue_date,
      notes: row.notes || '',
    });
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    const inv = form.invoice_number.trim();
    const customer = form.customer_name.trim();
    if (!inv || !customer) {
      showToast('Invoice # and customer name are required', 'error');
      return;
    }
    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount)) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    const payload = {
      invoice_number: inv,
      customer_name: customer,
      customer_email: form.customer_email.trim() || null,
      amount,
      status: form.status,
      issue_date: form.issue_date,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_invoices').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Invoice updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_invoices').insert({ ...payload, ...actor });
        if (error) throw error;
        showToast('Invoice added', 'success');
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: InvoiceRow) => {
    if (!window.confirm(`Delete invoice ${row.invoice_number}?`)) return;
    try {
      const { error } = await supabase.from('crm_invoices').delete().eq('id', row.id);
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
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Invoices</h1>
          <p className="text-sm text-slate-500">Track invoice numbers, customers, amounts, and status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <CrmInput placeholder="Search #, customer…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add invoice
          </CrmButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={Receipt} title="No invoices" description="Create billing records as you issue GST invoices." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Number</CrmTh>
              <CrmTh>Customer</CrmTh>
              <CrmTh className="hidden md:table-cell">Date</CrmTh>
              <CrmTh>Amount</CrmTh>
              <CrmTh>Status</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-mono text-xs font-semibold text-teal-800">{r.invoice_number}</CrmTd>
                <CrmTd className="font-medium text-slate-900">{r.customer_name}</CrmTd>
                <CrmTd className="hidden text-xs md:table-cell">{r.issue_date}</CrmTd>
                <CrmTd>₹{Number(r.amount).toLocaleString()}</CrmTd>
                <CrmTd>
                  <CrmBadge tone={invoiceStatusTone(r.status)}>{r.status}</CrmBadge>
                </CrmTd>
                <CrmTd className="text-right">
                  <Link
                    href={`/crm/manage-invoice/${r.id}/print?download=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-1 inline-flex items-center justify-center rounded-lg p-2 text-teal-700 hover:bg-teal-50"
                    title="PDF (download)"
                    aria-label="Download invoice PDF"
                  >
                    <FileDown size={16} />
                  </Link>
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

      <CrmDialog open={modal != null} title={modal?.mode === 'edit' ? 'Edit invoice' : 'Add invoice'} onClose={() => !saving && setModal(null)}>
        <div className="space-y-3">
          <CrmInput label="Invoice number" value={form.invoice_number} onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))} />
          <CrmInput label="Customer name" value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} />
          <CrmInput label="Customer email" type="email" value={form.customer_email} onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Amount (₹)" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            <CrmInput label="Issue date" type="date" value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
          </div>
          <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof statuses)[number] }))}>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </CrmSelect>
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
