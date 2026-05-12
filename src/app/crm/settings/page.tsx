import CrmModulePlaceholder from '@/components/crm/CrmModulePlaceholder';
import { Settings } from 'lucide-react';

export default function Page() {
  return (
    <CrmModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Branding, tax profiles, notification rules, and API keys — configure your organisation profile here soon."
    />
  );
}
