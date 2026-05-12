import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import CrmButton from './CrmButton';

export default function CrmEmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <Icon className="h-8 w-8 text-slate-400" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-4">
          <CrmButton variant="primary" size="sm">
            {actionLabel}
          </CrmButton>
        </Link>
      ) : null}
    </div>
  );
}
