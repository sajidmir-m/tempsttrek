import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  PhoneForwarded,
  Eye,
  PieChart,
  Hotel,
  FileText,
  Wallet,
  Receipt,
  Ticket,
  Settings,
  Blocks,
  Users,
  BookOpen,
  UserPlus,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

export type CrmNavEntry = {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: CrmNavEntry[];
};

export const CRM_NAV: CrmNavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/crm/dashboard', icon: LayoutDashboard },
  { id: 'itineraries', label: 'Itineraries', href: '/crm/itineraries', icon: ClipboardList },
  {
    id: 'assign-call',
    label: 'Assign Call',
    icon: PhoneForwarded,
    children: [
      { id: 'assign-view', label: 'View', href: '/crm/assign-call/view', icon: Eye },
      { id: 'assign-source', label: 'Lead Source', href: '/crm/assign-call/lead-source', icon: PieChart },
    ],
  },
  { id: 'hotel', label: 'Manage Hotel', href: '/crm/manage-hotel', icon: Hotel },
  { id: 'quotations', label: 'Manage Quotations', href: '/crm/manage-quotations', icon: FileText },
  { id: 'expense', label: 'Manage Expense', href: '/crm/manage-expense', icon: Wallet },
  { id: 'invoice', label: 'Manage Invoice', href: '/crm/manage-invoice', icon: Receipt },
  { id: 'voucher', label: 'Manage Voucher', href: '/crm/manage-voucher', icon: Ticket },
  { id: 'settings', label: 'Settings', href: '/crm/settings', icon: Settings },
  { id: 'module', label: 'Manage Module', href: '/crm/manage-module', icon: Blocks },
  { id: 'users', label: 'Users', href: '/crm/users', icon: Users },
  { id: 'ledger', label: 'Ledger', href: '/crm/ledger', icon: BookOpen },
  { id: 'leads', label: 'Manage Leads', href: '/crm/manage-leads', icon: UserPlus },
  { id: 'inquiries', label: 'Inquiries', href: '/crm/manage-inquiries', icon: MessageSquare },
];

export function flattenNavLabels(entries: CrmNavEntry[]): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = [];
  for (const e of entries) {
    if (e.href) out.push({ label: e.label, href: e.href });
    if (e.children) out.push(...flattenNavLabels(e.children));
  }
  return out;
}
