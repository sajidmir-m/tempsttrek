'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmSelect from '../ui/CrmSelect';
import CrmBadge, { quoteStatusTone } from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';

type QuoteRow = {
  id: string;
  lead_id: string | null;
  quote_id: string;
  duration: string | null;
  budget: number | null;
  destination: string | null;
  status: string;
  remark: string | null;
  created_at: string;
  crm_leads: { name: string | null; phone: string | null } | null;
};

type LeadOption = { id: string; name: string };

const statuses = ['draft', 'sent', 'accepted', 'rejected', 'closed'] as const;

const emptyForm = {
  lead_id: '',
  quote_id: '',
  duration: '',
  budget: '',
  destination: '',
  status: 'draft' as (typeof statuses)[number],
  remark: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: QuoteRow } | null;

export default function ManageQuotationsView() {
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useToast();

  const loadLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('crm_leads').select('id,name').order('name', { ascending: true }).limit(300);
      if (error) throw error;
      setLeads((data || []) as LeadOption[]);
    } catch {
      /* optional for quote form */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_quotations')
        .select('id,lead_id,quote_id,duration,budget,destination,status,remark,created_at,crm_leads(name,phone)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      const normalized =
        (data || []).map((row: Record<string, unknown>) => {
          const lead = row.crm_leads;
          const leadObj = Array.isArray(lead) ? lead[0] : lead;
          return { ...row, crm_leads: leadObj ?? null } as QuoteRow;
        }) ?? [];
      setRows(normalized);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
    void loadLeads();
  }, [load, loadLeads]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.quote_id.toLowerCase().includes(s) ||
        (r.crm_leads?.name || '').toLowerCase().includes(s) ||
        (r.destination || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    const id = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setForm({ ...emptyForm, quote_id: id, status: 'draft' });
    setModal({ mode: 'create' });
  };

  const openEdit = (row: QuoteRow) => {
    setForm({
      lead_id: row.lead_id || '',
      quote_id: row.quote_id,
      duration: row.duration || '',
      budget: row.budget != null ? String(row.budget) : '',
      destination: row.destination || '',
      status: row.status as (typeof statuses)[number],
      remark: row.remark || '',
    });
    setModal({ mode: 'edit', row });
  };

  const save = async () => {
    const quoteId = form.quote_id.trim();
    if (!quoteId) {
      showToast('Quote ID is required', 'error');
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
    const leadId = form.lead_id.trim() || null;
    const payload = {
      lead_id: leadId,
      quote_id: quoteId,
      duration: form.duration.trim() || null,
      budget,
      destination: form.destination.trim() || null,
      status: form.status,
      remark: form.remark.trim() || null,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        const { error } = await supabase.from('crm_quotations').update(payload).eq('id', modal.row.id);
        if (error) throw error;
        showToast('Quotation updated', 'success');
      } else {
        const actor = await crmActorFields();
        const { error } = await supabase.from('crm_quotations').insert({ ...payload, ...actor });
        if (error) throw error;
        showToast('Quotation added', 'success');
      }
      setModal(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: QuoteRow) => {
    if (!window.confirm(`Delete quotation ${row.quote_id}?`)) return;
    try {
      const { error } = await supabase.from('crm_quotations').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="crm-surface space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Manage Quotations</h1>
          <p className="text-sm text-slate-500">Create and edit quotes; link an optional lead.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="max-w-xs flex-1">
            <CrmInput placeholder="Search quote #, customer…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add quotation
          </CrmButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={FileText} title="No quotations" description="Add a quotation or adjust your search." />
      ) : (
        <CrmTable>
          <CrmThead>
            <CrmTr>
              <CrmTh>Quote</CrmTh>
              <CrmTh>Customer</CrmTh>
              <CrmTh>Destination</CrmTh>
              <CrmTh>Status</CrmTh>
              <CrmTh className="hidden md:table-cell">Budget</CrmTh>
              <CrmTh className="text-right">Actions</CrmTh>
            </CrmTr>
          </CrmThead>
          <CrmTbody>
            {filtered.map((r) => (
              <CrmTr key={r.id}>
                <CrmTd className="font-mono text-xs font-semibold text-teal-800">{r.quote_id}</CrmTd>
                <CrmTd>
                  <div className="font-semibold text-slate-950">{r.crm_leads?.name || '—'}</div>
                  <div className="text-xs text-slate-500">{r.crm_leads?.phone || ''}</div>
                </CrmTd>
                <CrmTd className="max-w-[160px] truncate">{r.destination || '—'}</CrmTd>
                <CrmTd>
                  <CrmBadge tone={quoteStatusTone(r.status)}>{r.status}</CrmBadge>
                </CrmTd>
                <CrmTd className="hidden md:table-cell">{r.budget != null ? `₹${Number(r.budget).toLocaleString()}` : '—'}</CrmTd>
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

      <CrmDialog
        open={modal != null}
        title={modal?.mode === 'edit' ? 'Edit quotation' : 'Add quotation'}
        onClose={() => !saving && setModal(null)}
      >
        <div className="space-y-3">
          <CrmSelect label="Linked lead (optional)" value={form.lead_id} onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}>
            <option value="">— None —</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </CrmSelect>
          <CrmInput label="Quote ID" value={form.quote_id} onChange={(e) => setForm((f) => ({ ...f, quote_id: e.target.value }))} />
          <CrmInput label="Destination" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
            <CrmInput label="Budget (₹)" type="number" step="0.01" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
          </div>
          <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof statuses)[number] }))}>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </CrmSelect>
          <CrmTextarea label="Remark" value={form.remark} onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))} rows={3} />
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
