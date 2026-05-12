import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CrmSkeleton } from '../ui/CrmSkeleton';

function CrmStatCardInner({
  label,
  value,
  hint,
  icon: Icon,
  loading,
  accent = 'teal',
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  loading?: boolean;
  accent?: 'teal' | 'sky' | 'amber' | 'rose';
}) {
  const wash =
    accent === 'teal'
      ? 'before:from-teal-500/15 before:to-emerald-500/5'
      : accent === 'sky'
        ? 'before:from-sky-500/15 before:to-blue-500/5'
        : accent === 'amber'
          ? 'before:from-amber-500/15 before:to-orange-500/5'
          : 'before:from-rose-500/15 before:to-red-500/5';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:shadow-md',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-50',
        wash
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          {loading ? (
            <CrmSkeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
          )}
          {hint && !loading ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="rounded-xl bg-slate-100 p-2.5 text-teal-700">
          <Icon size={22} aria-hidden />
        </div>
      </div>
    </div>
  );
}

export default memo(CrmStatCardInner);
