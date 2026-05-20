'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
  assignInquiryToEmployee,
  fetchCrmEmployees,
  type EmployeeOption,
  type InquiryForLead,
} from '@/lib/inquiry-lead';
import { useToast } from '@/components/ui/Toast';
import CrmSelect from '../ui/CrmSelect';
import CrmButton from '../ui/CrmButton';

export default function AssignInquiryLead({
  inquiry,
  currentAssigneeId,
  onAssigned,
  compact,
}: {
  inquiry: InquiryForLead;
  currentAssigneeId?: string | null;
  onAssigned: () => void;
  compact?: boolean;
}) {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selected, setSelected] = useState(currentAssigneeId || '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setSelected(currentAssigneeId || '');
  }, [currentAssigneeId, inquiry.id]);

  useEffect(() => {
    void fetchCrmEmployees().then(setEmployees).catch(() => setEmployees([]));
  }, []);

  const assign = async () => {
    setSaving(true);
    try {
      const leadId = await assignInquiryToEmployee(inquiry, selected || null);
      showToast(
        selected
          ? 'Lead assigned to employee. They will see it in their CRM.'
          : 'Lead unassigned',
        'success'
      );
      onAssigned();
      return leadId;
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Assignment failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-900"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={saving}
        >
          <option value="">Assign to…</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.email.split('@')[0]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={saving}
          onClick={() => void assign()}
          className="rounded-lg bg-teal-600 px-2 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? '…' : 'Assign'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
        <UserPlus size={18} />
        Assign as lead to employee
      </div>
      <p className="text-xs text-teal-800/80">
        Creates a CRM lead if needed, then assigns it. The employee will only see this lead in{' '}
        <strong>Manage Leads</strong>.
      </p>
      <CrmSelect
        label="Employee"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={saving}
      >
        <option value="">— Unassigned —</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.email}
          </option>
        ))}
      </CrmSelect>
      <CrmButton variant="primary" size="md" onClick={() => void assign()} disabled={saving}>
        {saving ? 'Assigning…' : selected ? 'Assign lead' : 'Clear assignment'}
      </CrmButton>
    </div>
  );
}
