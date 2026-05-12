import CrmModulePlaceholder from '@/components/crm/CrmModulePlaceholder';
import { Blocks } from 'lucide-react';

export default function Page() {
  return (
    <CrmModulePlaceholder
      icon={Blocks}
      title="Manage Module"
      description="Toggle ERP modules, feature flags, and integrations without redeploying — reserved for super-admins."
      adminHint="Until this screen is live, admins perform every catalogue and portal operation from the main Admin console at /admin (packages, places, users, employees, itineraries, and more)."
      nextSteps={[
        { title: 'Module registry', detail: 'Turn modules on/off per organisation.' },
        { title: 'Feature flags', detail: 'Ship UI safely without redeploying.' },
        { title: 'Integrations', detail: 'Webhooks, email, payments — connect when ready.' },
      ]}
    />
  );
}
