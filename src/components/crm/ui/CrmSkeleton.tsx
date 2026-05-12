import { cn } from '@/lib/cn';

export function CrmSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/80', className)} aria-hidden />;
}

export function CrmDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <CrmSkeleton className="h-8 w-48 mb-4" />
        <div className="flex flex-wrap gap-3">
          <CrmSkeleton className="h-10 w-40" />
          <CrmSkeleton className="h-10 w-40" />
          <CrmSkeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <CrmSkeleton className="h-4 w-24 mb-3" />
            <CrmSkeleton className="h-9 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <CrmSkeleton className="h-5 w-40 mb-4" />
            <CrmSkeleton className="h-12 w-full mb-2" />
            <CrmSkeleton className="h-12 w-full mb-2" />
            <CrmSkeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
