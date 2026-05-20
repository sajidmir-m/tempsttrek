'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolvePortalRole } from '@/lib/portal-role';
import { useToast } from '@/components/ui/Toast';
import { downloadElementAsPdf } from '@/lib/crm-pdf-download';
import CrmInput from '../ui/CrmInput';
import CrmSelect from '../ui/CrmSelect';
import CrmBadge from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmButton from '../ui/CrmButton';
import CrmDialog from '../ui/CrmDialog';
import CrmPagination from '../ui/CrmPagination';
import { CrmPdfDocument } from '../pdf/CrmPdfDocument';
import AssignInquiryLead from './AssignInquiryLead';
import { fetchCrmEmployees, type EmployeeOption } from '@/lib/inquiry-lead';
import { Eye, FileDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  address: string | null;
  hotel_requirement: string | null;
  check_in: string | null;
  check_out: string | null;
  status: string;
  source: string | null;
  package_id: string | null;
  lead_id: string | null;
  created_at: string;
  assigned_to?: string | null;
  assignee_email?: string | null;
};

const INQUIRY_SELECT =
  'id,name,email,phone,message,address,hotel_requirement,check_in,check_out,status,source,package_id,lead_id,created_at';

const SOURCE_LABELS: Record<string, string> = {
  'book-now': 'Book Now popup',
  contact: 'Contact page',
  'package-booking': 'Package booking',
  website: 'Website',
};

const PAGE_SIZE = 15;

function normalizeInquiryRows(
  inquiries: Record<string, unknown>[],
  leadsByInquiry: Map<string, { assigned_to: string | null }>,
  emailByUserId: Map<string, string>
): InquiryRow[] {
  return inquiries.map((row) => {
    const leadId = row.lead_id as string | null;
    const lead = leadId ? leadsByInquiry.get(leadId) : undefined;
    const assigned_to = lead?.assigned_to ?? null;
    return {
      ...(row as InquiryRow),
      assigned_to,
      assignee_email: assigned_to ? emailByUserId.get(assigned_to) ?? null : null,
    };
  });
}

export default function CrmInquiriesTable() {
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<InquiryRow | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfRow, setPdfRow] = useState<InquiryRow | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: inqData, error } = await supabase
        .from('inquiries')
        .select(INQUIRY_SELECT)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      const inquiries = (inqData || []) as Record<string, unknown>[];
      const leadIds = inquiries.map((i) => i.lead_id).filter(Boolean) as string[];

      let leadsById = new Map<string, { assigned_to: string | null }>();
      if (leadIds.length > 0) {
        const { data: leads } = await supabase
          .from('crm_leads')
          .select('id,assigned_to')
          .in('id', leadIds);
        leadsById = new Map(
          (leads || []).map((l) => [l.id as string, { assigned_to: l.assigned_to as string | null }])
        );
      }

      const emps = await fetchCrmEmployees();
      setEmployees(emps);
      const emailByUserId = new Map(emps.map((e) => [e.id, e.email]));

      const leadsByInquiry = new Map<string, { assigned_to: string | null }>();
      for (const inq of inquiries) {
        const lid = inq.lead_id as string | null;
        if (lid && leadsById.has(lid)) leadsByInquiry.set(lid, leadsById.get(lid)!);
      }

      setRows(normalizeInquiryRows(inquiries, leadsByInquiry, emailByUserId));
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        setIsAdmin(resolvePortalRole(p?.role) === 'admin');
      }
    })();
    void load();
  }, [load]);

  useEffect(() => {
    if (!detail) return;
    const fresh = rows.find((r) => r.id === detail.id);
    if (fresh) setDetail(fresh);
  }, [rows, detail?.id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (sourceFilter && (r.source || 'website') !== sourceFilter) return false;
      if (!s) return true;
      return (
        r.name.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        (r.phone || '').includes(s) ||
        (r.hotel_requirement || '').toLowerCase().includes(s) ||
        (r.assignee_email || '').toLowerCase().includes(s)
      );
    });
  }, [rows, q, statusFilter, sourceFilter]);

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const updateStatus = async (row: InquiryRow, status: string) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) showToast(error.message, 'error');
    else {
      showToast('Status updated', 'success');
      await load();
    }
  };

  const exportPdf = async (row: InquiryRow) => {
    setPdfRow(row);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (!pdfRef.current) return;
    try {
      await downloadElementAsPdf(pdfRef.current, `inquiry-${row.name.replace(/\s+/g, '-')}.pdf`);
      showToast('PDF downloaded', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'PDF failed', 'error');
    } finally {
      setPdfRow(null);
    }
  };

  const sourceLabel = (src: string | null) => SOURCE_LABELS[src || 'website'] || src || 'Website';

  return (
    <div className="crm-surface space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Website Bookings & Inquiries</h1>
        <p className="text-sm text-slate-600">
          All bookings from Book Now, contact form, and package pages. Assign each one as a lead to an employee.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <CrmInput placeholder="Search name, email, assignee…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <CrmSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[160px]">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="read">Read</option>
          <option value="contacted">Contacted</option>
          <option value="booked">Booked</option>
          <option value="closed">Closed</option>
        </CrmSelect>
        <CrmSelect value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="max-w-[180px]">
          <option value="">All sources</option>
          <option value="book-now">Book Now</option>
          <option value="contact">Contact</option>
          <option value="package-booking">Package</option>
          <option value="website">Website</option>
        </CrmSelect>
      </div>

      {loading ? (
        <CrmSkeleton className="h-24 w-full" />
      ) : filtered.length === 0 ? (
        <CrmEmptyState
          icon={MessageSquare}
          title="No inquiries yet"
          description="Book Now popup, contact form, and package bookings will appear here automatically."
        />
      ) : (
        <>
          <CrmTable>
            <CrmThead>
              <CrmTr>
                <CrmTh>Customer</CrmTh>
                <CrmTh>Source</CrmTh>
                <CrmTh>Status</CrmTh>
                <CrmTh>Assigned to</CrmTh>
                {isAdmin && <CrmTh>Quick assign</CrmTh>}
                <CrmTh className="text-right">Actions</CrmTh>
              </CrmTr>
            </CrmThead>
            <CrmTbody>
              {paged.map((r) => (
                <CrmTr key={r.id}>
                  <CrmTd>
                    <div className="font-semibold text-slate-950">{r.name}</div>
                    <div className="text-xs text-slate-500">{r.phone}</div>
                    <div className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleString()}</div>
                  </CrmTd>
                  <CrmTd>
                    <CrmBadge tone="info">{sourceLabel(r.source)}</CrmBadge>
                  </CrmTd>
                  <CrmTd>
                    <CrmBadge tone={r.status === 'pending' ? 'warning' : 'info'}>{r.status}</CrmBadge>
                  </CrmTd>
                  <CrmTd className="text-sm">
                    {r.assignee_email ? (
                      <span className="font-medium text-teal-800">
                        {r.assignee_email.split('@')[0]}
                      </span>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </CrmTd>
                  {isAdmin && (
                    <CrmTd>
                      <AssignInquiryLead
                        compact
                        inquiry={r}
                        currentAssigneeId={r.assigned_to}
                        onAssigned={() => void load()}
                      />
                    </CrmTd>
                  )}
                  <CrmTd className="text-right whitespace-nowrap">
                    <CrmButton variant="ghost" size="sm" onClick={() => setDetail(r)} title="View & assign">
                      <Eye size={16} />
                    </CrmButton>
                    <CrmButton variant="ghost" size="sm" onClick={() => void exportPdf(r)}>
                      <FileDown size={16} />
                    </CrmButton>
                  </CrmTd>
                </CrmTr>
              ))}
            </CrmTbody>
          </CrmTable>
          <CrmPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      <CrmDialog open={detail != null} title="Booking / inquiry" wide onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <CrmBadge tone="info">{sourceLabel(detail.source)}</CrmBadge>
              <CrmBadge tone={detail.status === 'pending' ? 'warning' : 'info'}>{detail.status}</CrmBadge>
              {detail.lead_id && (
                <Link href="/crm/manage-leads" className="text-xs font-semibold text-teal-700 hover:underline">
                  Open in Manage Leads →
                </Link>
              )}
            </div>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium">{detail.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium">{detail.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium">{detail.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Address</dt>
                <dd className="font-medium">{detail.address || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Hotel / trip requirement</dt>
                <dd className="font-medium">{detail.hotel_requirement || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Dates</dt>
                <dd className="font-medium">
                  {detail.check_in || '—'} → {detail.check_out || '—'}
                </dd>
              </div>
            </dl>
            <p className="rounded-lg bg-slate-50 p-3 text-slate-800">
              {detail.message || 'No message'}
            </p>
            {isAdmin && (
              <>
                <CrmSelect label="Update status" value={detail.status} onChange={(e) => void updateStatus(detail, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="read">Read</option>
                  <option value="contacted">Contacted</option>
                  <option value="booked">Booked</option>
                  <option value="closed">Closed</option>
                </CrmSelect>
                <AssignInquiryLead
                  inquiry={detail}
                  currentAssigneeId={detail.assigned_to}
                  onAssigned={() => void load()}
                />
              </>
            )}
          </div>
        )}
      </CrmDialog>

      {pdfRow && (
        <div className="pointer-events-none fixed -left-[9999px] top-0">
          <CrmPdfDocument
            ref={pdfRef}
            title="Inquiry Report"
            subtitle={pdfRow.name}
            rows={[
              { label: 'Source', value: sourceLabel(pdfRow.source) },
              { label: 'Email', value: pdfRow.email },
              { label: 'Phone', value: pdfRow.phone },
              { label: 'Assigned', value: pdfRow.assignee_email || 'Unassigned' },
              { label: 'Hotel requirement', value: pdfRow.hotel_requirement || '—' },
              { label: 'Check-in / Check-out', value: `${pdfRow.check_in || '—'} → ${pdfRow.check_out || '—'}` },
              { label: 'Message', value: pdfRow.message || '—' },
              { label: 'Status', value: pdfRow.status },
            ]}
          />
        </div>
      )}
    </div>
  );
}
