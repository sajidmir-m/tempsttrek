import AssignCallPageShell from '@/components/crm/assign-call/AssignCallPageShell';
import CrmLeadsTable from '@/components/crm/leads/CrmLeadsTable';

export default function ManageLeadsPage() {
  return (
    <AssignCallPageShell>
      <CrmLeadsTable title="Manage Leads" />
    </AssignCallPageShell>
  );
}
