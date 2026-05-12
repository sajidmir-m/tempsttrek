import CrmModulePlaceholder from '@/components/crm/CrmModulePlaceholder';
import { Settings } from 'lucide-react';

export default function Page() {
  return (
    <CrmModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Branding, tax profiles, notification rules, and API keys — configure your organisation profile here soon."
      adminHint="Site-wide content and many operational defaults are already managed from /admin (home media, FAQs, packages). Organisation-level CRM settings will move here when implemented."
    />
  );
}
