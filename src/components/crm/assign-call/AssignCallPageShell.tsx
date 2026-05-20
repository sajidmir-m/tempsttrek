'use client';

/**
 * Wraps CRM pages that need guaranteed readable text on light surfaces (tables, forms).
 */
export default function AssignCallPageShell({ children }: { children: React.ReactNode }) {
  return <div className="crm-surface text-slate-900">{children}</div>;
}
