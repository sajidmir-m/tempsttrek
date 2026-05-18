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
import { syncPaidInvoiceToLedger, type InvoiceForSync } from '@/lib/ledger-invoice-sync';

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  status: string;
  issue_date: string;
  notes: string | null;
  ledger_id: string | null;
  synced_to_ledger_at: string | null;
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
  ledger_id: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: InvoiceRow } | null;

type TripLedgerOption = { id: string; title: string };

export default function CrmInvoicesManager() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [tripLedgers, setTripLedgers] = useState<TripLedgerOption[]>([]);
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
        .select('id,invoice_number,customer_name,customer_email,amount,status,issue_date,notes,ledger_id,synced_to_ledger_at,created_at')
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

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('crm_trip_ledgers').select('id,title').order('updated_at', { ascending: false }).limit(50);
      setTripLedgers((data || []) as TripLedgerOption[]);
    })();
  }, []);

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
      ledger_id: row.ledger_id || '',
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
      ledger_id: form.ledger_id || null,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      const prevStatus = modal?.mode === 'edit' ? modal.row.status : null;
      let savedId = modal?.mode === 'edit' ? modal.row.id : '';

      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_invoices').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Invoice updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { data: inserted, error } = await supabase
          .from('crm_invoices')
          .insert({ ...payload, ...actor })
          .select('id')
          .single();
        if (error) throw error;
        savedId = inserted?.id || '';
        showToast('Invoice added', 'success');
      }

      if (form.status === 'paid' && (prevStatus !== 'paid' || modal?.mode === 'create')) {
        const invoiceId = modal?.mode === 'edit' ? modal.row.id : savedId;
        if (invoiceId) {
          const syncPayload: InvoiceForSync = {
            id: invoiceId,
            invoice_number: inv,
            customer_name: customer,
            amount,
            status: 'paid',
            issue_date: form.issue_date,
            ledger_id: form.ledger_id || null,
            synced_to_ledger_at: modal?.mode === 'edit' ? modal.row.synced_to_ledger_at : null,
          };
          const sync = await syncPaidInvoiceToLedger(syncPayload);
          if (sync.ok && form.ledger_id) {
            showToast('Payment synced to trip ledger', 'success');
          } else if (!form.ledger_id) {
            showToast('Paid — select a trip ledger to sync payment into accounting', 'error');
          }
        }
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
                    title="Hotel voucher PDF"
                    aria-label="Download hotel voucher PDF"
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
          <CrmSelect
            label="Link to trip ledger (auto-sync when paid)"
            value={form.ledger_id}
            onChange={(e) => setForm((f) => ({ ...f, ledger_id: e.target.value }))}
          >
            <option value="">— None —</option>
            {tripLedgers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </CrmSelect>
          {form.status === 'paid' && form.ledger_id ? (
            <p className="text-xs text-teal-700">Saving as paid will add a client payment line to the selected ledger.</p>
          ) : null}
          <CrmTextarea
            label="Notes (plain text or JSON for voucher stays/cab)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
          />
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
