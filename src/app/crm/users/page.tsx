import CrmModulePlaceholder from '@/components/crm/CrmModulePlaceholder';
import { Users } from 'lucide-react';

export default function Page() {
  return (
    <CrmModulePlaceholder
      icon={Users}
      title="Users"
      description="Invite staff, assign roles, and audit CRM access. Until then, manage portal users from the main Admin console."
    />
  );
}
