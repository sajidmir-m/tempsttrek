import { cn } from '@/lib/cn';

const tone: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-sky-50 text-sky-900 border-sky-200',
  neutral: 'bg-slate-800 text-slate-100 border-slate-700',
};

export default function CrmBadge({
  children,
  className,
  tone: t = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: keyof typeof tone;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tone[t],
        className
      )}
    >
      {children}
    </span>
  );
}

export function arrivalStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'arrived') return 'success';
  if (s === 'cancelled') return 'danger';
  return 'info';
}

export function followupStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'done') return 'success';
  if (s === 'pending') return 'warning';
  return 'default';
}

export function leadStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'success';
  if (s === 'closed') return 'neutral';
  if (s === 'quoted') return 'info';
  if (s === 'contacted') return 'warning';
  return 'default';
}

export function quoteStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'accepted') return 'success';
  if (s === 'rejected' || s === 'closed') return 'danger';
  if (s === 'sent') return 'info';
  return 'default';
}

export function invoiceStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'success';
  if (s === 'void') return 'danger';
  if (s === 'sent') return 'info';
  return 'default';
}

export function voucherStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'redeemed') return 'success';
  if (s === 'cancelled') return 'danger';
  if (s === 'issued') return 'info';
  return 'default';
}

export function paymentStatusTone(status: string | null | undefined): keyof typeof tone {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'success';
  if (s === 'partial') return 'warning';
  if (s === 'pending') return 'danger';
  return 'default';
}
