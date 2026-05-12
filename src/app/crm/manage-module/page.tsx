import CrmModulePlaceholder from '@/components/crm/CrmModulePlaceholder';
import { Blocks } from 'lucide-react';

export default function Page() {
  return (
    <CrmModulePlaceholder
      icon={Blocks}
      title="Manage Module"
      description="Toggle ERP modules, feature flags, and integrations without redeploying — reserved for super-admins."
    />
  );
}
