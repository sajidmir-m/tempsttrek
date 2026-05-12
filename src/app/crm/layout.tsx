import type { Metadata } from 'next';
import CrmShell from '@/components/crm/layout/CrmShell';

export const metadata: Metadata = {
  title: 'CRM | Tempesttrek',
  robots: { index: false, follow: false },
};

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}

