import CrmModulePlaceholder from '@/components/crm/CrmModulePlaceholder';
import { Users } from 'lucide-react';

export default function Page() {
  return (
    <CrmModulePlaceholder
      icon={Users}
      title="Users"
      description="Invite staff, assign roles, and audit CRM access from here — coming soon."
      adminHint="For now, invite staff, create employee logins, and change roles only from the Admin console → Users tab at /admin. That path already has full access for admins."
      nextSteps={[
        { title: 'Invite & deactivate staff', detail: 'Email-based invites and soft-disable accounts.' },
        { title: 'Roles & CRM scopes', detail: 'Who can see leads, quotes, and ledgers.' },
        { title: 'Audit trail', detail: 'Who changed what and when.' },
      ]}
    />
  );
}
