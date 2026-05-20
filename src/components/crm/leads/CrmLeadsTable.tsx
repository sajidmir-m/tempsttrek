'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { resolvePortalRole } from '@/lib/portal-role';
import { useToast } from '@/components/ui/Toast';
import { LEAD_STATUSES, leadStatusLabel } from '@/lib/crm-leads';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';
import CrmInput from '../ui/CrmInput';
import CrmSelect from '../ui/CrmSelect';
import CrmTextarea from '../ui/CrmTextarea';
import CrmBadge, { leadStatusTone } from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmPagination from '../ui/CrmPagination';
import { CrmPdfDocument } from '../pdf/CrmPdfDocument';
import CrmLeadDetailPanel from './CrmLeadDetailPanel';
import { Eye, FileDown, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';

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
  assigned_to: string | null;
  address: string | null;
  hotel_requirement: string | null;
  check_in: string | null;
  check_out: string | null;
  message: string | null;
  follow_up_at: string | null;
  inquiry_id: string | null;
  created_at: string;
};

const LEAD_SELECT =
  'id,name,phone,email,source,destination,budget,duration,status,assigned_to,address,hotel_requirement,check_in,check_out,message,follow_up_at,inquiry_id,created_at';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  source: 'manual',
  destination: '',
  budget: '',
  duration: '',
  status: 'new' as (typeof LEAD_STATUSES)[number],
  address: '',
  hotel_requirement: '',
  check_in: '',
  check_out: '',
  message: '',
  assigned_to: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; row: LeadRow } | null;

const PAGE_SIZE = 15;

export default function CrmLeadsTable({
  title = 'Leads',
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const headingClass = 'text-slate-900 sm:text-2xl';
  const mutedClass = 'text-slate-600';
  const cellPrimary = 'font-semibold text-slate-950';
  const cellMuted = 'hidden text-xs text-slate-700 md:table-cell';
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'status'>('created_at');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailRow, setDetailRow] = useState<LeadRow | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; email: string }[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfLead, setPdfLead] = useState<LeadRow | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      const role = resolvePortalRole(profile?.role);
      setIsAdmin(role === 'admin');
      if (role === 'admin') {
        const { data: staff } = await supabase
          .from('profiles')
          .select('id,email')
          .in('role', ['admin', 'employee'])
          .order('email');
        setEmployees((staff || []).map((s) => ({ id: s.id, email: s.email || s.id })));
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('crm_leads').select(LEAD_SELECT).order(sortBy, { ascending: sortBy === 'name' });
      if (sortBy === 'created_at') query = query.order('created_at', { ascending: false });
      const { data, error } = await query.limit(1000);
      if (error) throw error;
      setRows((data || []) as LeadRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, sortBy]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (assigneeFilter && r.assigned_to !== assigneeFilter) return false;
      if (!s) return true;
      return (
        r.name.toLowerCase().includes(s) ||
        (r.phone || '').includes(s) ||
        (r.email || '').toLowerCase().includes(s) ||
        (r.source || '').toLowerCase().includes(s) ||
        (r.destination || '').toLowerCase().includes(s) ||
        (r.hotel_requirement || '').toLowerCase().includes(s)
      );
    });
  }, [rows, q, statusFilter, assigneeFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [q, statusFilter, assigneeFilter, sortBy]);

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
      status: (LEAD_STATUSES.includes(row.status as (typeof LEAD_STATUSES)[number])
        ? row.status
        : 'new') as (typeof LEAD_STATUSES)[number],
      address: row.address || '',
      hotel_requirement: row.hotel_requirement || '',
      check_in: row.check_in || '',
      check_out: row.check_out || '',
      message: row.message || '',
      assigned_to: row.assigned_to || '',
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
    const payload: Record<string, unknown> = {
      name,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      source: form.source.trim() || null,
      destination: form.destination.trim() || null,
      hotel_requirement: form.hotel_requirement.trim() || null,
      address: form.address.trim() || null,
      check_in: form.check_in || null,
      check_out: form.check_out || null,
      message: form.message.trim() || null,
      budget,
      duration: form.duration.trim() || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };
    if (isAdmin) payload.assigned_to = form.assigned_to || null;

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
    if (!window.confirm(`Delete lead "${row.name}"?`)) return;
    try {
      const { error } = await supabase.from('crm_leads').delete().eq('id', row.id);
      if (error) throw error;
      showToast('Lead deleted', 'success');
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const exportPdf = async (row: LeadRow) => {
    setPdfLead(row);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (!pdfRef.current) return;
    try {
      await downloadElementAsPdf(pdfRef.current, `lead-${row.name.replace(/\s+/g, '-')}.pdf`);
      showToast('PDF downloaded', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'PDF failed', 'error');
    } finally {
      setPdfLead(null);
    }
  };

  const assigneeName = (id: string | null) => {
    if (!id) return '—';
    return employees.find((e) => e.id === id)?.email?.split('@')[0] || 'Assigned';
  };

  return (
    <div className="crm-surface space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`text-xl font-extrabold sm:text-2xl ${headingClass}`}>{title}</h1>
          <p className={`text-sm ${mutedClass}`}>
            {subtitle ??
              (isAdmin
                ? 'Manage and assign leads. Website inquiries sync automatically.'
                : 'Your assigned leads only.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="max-w-xs flex-1 min-w-[140px]">
            <CrmInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <CrmButton variant="primary" size="md" onClick={openCreate}>
            <Plus size={18} />
            Add lead
          </CrmButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CrmSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[130px]">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((st) => (
            <option key={st} value={st}>
              {leadStatusLabel(st)}
            </option>
          ))}
        </CrmSelect>
        <CrmSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="min-w-[130px]">
          <option value="created_at">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="status">Status</option>
        </CrmSelect>
        {isAdmin && (
          <CrmSelect value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="min-w-[160px]">
            <option value="">All assignees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.email}
              </option>
            ))}
          </CrmSelect>
        )}
      </div>

      {loading ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <CrmSkeleton className="h-10 w-full" />
          <CrmSkeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <CrmEmptyState icon={UserPlus} title="No leads found" description="Add a lead or adjust filters." />
      ) : (
        <>
          <CrmTable>
            <CrmThead>
              <CrmTr>
                <CrmTh>Name</CrmTh>
                <CrmTh>Phone</CrmTh>
                <CrmTh>Status</CrmTh>
                {isAdmin && <CrmTh>Assigned</CrmTh>}
                <CrmTh className="hidden md:table-cell">Follow-up</CrmTh>
                <CrmTh className="text-right">Actions</CrmTh>
              </CrmTr>
            </CrmThead>
            <CrmTbody>
              {paged.map((r) => (
                <CrmTr key={r.id}>
                  <CrmTd className={cellPrimary}>
                    <span className="block min-w-0 text-slate-950">{r.name || '—'}</span>
                  </CrmTd>
                  <CrmTd className="text-slate-800">{r.phone || '—'}</CrmTd>
                  <CrmTd>
                    <CrmBadge tone={leadStatusTone(r.status)}>{leadStatusLabel(r.status)}</CrmBadge>
                  </CrmTd>
                  {isAdmin && <CrmTd className="text-xs text-slate-800">{assigneeName(r.assigned_to)}</CrmTd>}
                  <CrmTd className={cellMuted}>
                    {r.follow_up_at ? new Date(r.follow_up_at).toLocaleDateString() : '—'}
                  </CrmTd>
                  <CrmTd className="text-right whitespace-nowrap">
                    <CrmButton variant="ghost" size="sm" onClick={() => setDetailRow(r)} title="Details">
                      <Eye size={16} />
                    </CrmButton>
                    <CrmButton variant="ghost" size="sm" onClick={() => void exportPdf(r)} title="PDF">
                      <FileDown size={16} />
                    </CrmButton>
                    <CrmButton variant="ghost" size="sm" onClick={() => openEdit(r)}>
                      <Pencil size={16} />
                    </CrmButton>
                    {isAdmin && (
                      <CrmButton variant="ghost" size="sm" className="text-red-600" onClick={() => void remove(r)}>
                        <Trash2 size={16} />
                      </CrmButton>
                    )}
                  </CrmTd>
                </CrmTr>
              ))}
            </CrmTbody>
          </CrmTable>
          <CrmPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      <CrmDialog open={modal != null} title={modal?.mode === 'edit' ? 'Edit lead' : 'Add lead'} onClose={() => !saving && setModal(null)}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <CrmInput label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <CrmInput label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <CrmInput label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <CrmInput label="Hotel requirement" value={form.hotel_requirement} onChange={(e) => setForm((f) => ({ ...f, hotel_requirement: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Check-in" type="date" value={form.check_in} onChange={(e) => setForm((f) => ({ ...f, check_in: e.target.value }))} />
            <CrmInput label="Check-out" type="date" value={form.check_out} onChange={(e) => setForm((f) => ({ ...f, check_out: e.target.value }))} />
          </div>
          <CrmTextarea label="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={2} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Source" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
            <CrmInput label="Destination" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmInput label="Budget (₹)" type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
            <CrmInput label="Duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
          </div>
          <CrmSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof LEAD_STATUSES)[number] }))}>
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>
                {leadStatusLabel(st)}
              </option>
            ))}
          </CrmSelect>
          {isAdmin && (
            <CrmSelect label="Assign to" value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}>
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.email}
                </option>
              ))}
            </CrmSelect>
          )}
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

      <CrmDialog open={detailRow != null} title="Lead workspace" onClose={() => setDetailRow(null)} wide>
        {detailRow && (
          <div className="crm-surface">
            <CrmLeadDetailPanel
              lead={detailRow}
              isAdmin={isAdmin}
              employees={employees}
              onUpdated={async () => {
                await load();
                const { data } = await supabase.from('crm_leads').select(LEAD_SELECT).eq('id', detailRow.id).maybeSingle();
                if (data) setDetailRow(data as LeadRow);
              }}
              onClose={() => setDetailRow(null)}
            />
          </div>
        )}
      </CrmDialog>

      {pdfLead && (
        <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0" aria-hidden>
          <CrmPdfDocument
            ref={pdfRef}
            title="Lead Report"
            subtitle={pdfLead.name}
            rows={[
              { label: 'Status', value: leadStatusLabel(pdfLead.status) },
              { label: 'Phone', value: pdfLead.phone || '—' },
              { label: 'Email', value: pdfLead.email || '—' },
              { label: 'Address', value: pdfLead.address || '—' },
              { label: 'Hotel requirement', value: pdfLead.hotel_requirement || '—' },
              { label: 'Check-in / Check-out', value: `${pdfLead.check_in || '—'} → ${pdfLead.check_out || '—'}` },
              { label: 'Budget', value: pdfLead.budget != null ? `₹${pdfLead.budget}` : '—' },
              { label: 'Message', value: pdfLead.message || '—' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
