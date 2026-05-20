import AssignCallPageShell from '@/components/crm/assign-call/AssignCallPageShell';
import CrmLeadsTable from '@/components/crm/leads/CrmLeadsTable';

export default function AssignCallViewPage() {
  return (
    <AssignCallPageShell>
      <CrmLeadsTable title="Assign call · View" subtitle="View leads and assign follow-up calls to your team." />
    </AssignCallPageShell>
  );
}
