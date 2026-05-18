'use client';

import CrmBadge, { paymentStatusTone } from '../ui/CrmBadge';
import { formatInr, getPaymentBreakdown, paymentStatusLabel } from '@/lib/ledger-utils';

export default function CrmPaymentPreview({
  totalCost,
  paidAmount,
  compact,
}: {
  totalCost: number | string;
  paidAmount: number | string;
  compact?: boolean;
}) {
  const total = typeof totalCost === 'string' ? Number.parseFloat(totalCost) || 0 : totalCost;
  const paid = typeof paidAmount === 'string' ? Number.parseFloat(paidAmount) || 0 : paidAmount;
  const b = getPaymentBreakdown(total, paid);

  if (compact) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-slate-600">{b.summary}</p>
        <div className="flex flex-wrap items-center gap-2">
          <CrmBadge tone={paymentStatusTone(b.status)}>{paymentStatusLabel(b.status)}</CrmBadge>
          {b.hasValidTotal ? (
            <>
              <span className="text-slate-500">Paid: {formatInr(b.paid)}</span>
              <span className="text-slate-500">Due: {formatInr(b.remaining)}</span>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-lg bg-slate-50 p-2.5 text-center">
        <p className="text-[10px] font-semibold uppercase text-slate-500">Total cost</p>
        <p className="mt-1 text-base font-bold text-slate-900">{formatInr(b.total)}</p>
      </div>
      <div className="rounded-lg bg-emerald-50 p-2.5 text-center">
        <p className="text-[10px] font-semibold uppercase text-emerald-700">Paid so far</p>
        <p className="mt-1 text-base font-bold text-emerald-800">{formatInr(b.paid)}</p>
      </div>
      <div className="rounded-lg bg-amber-50 p-2.5 text-center">
        <p className="text-[10px] font-semibold uppercase text-amber-800">Still due</p>
        <p className="mt-1 text-base font-bold text-amber-900">{formatInr(b.remaining)}</p>
      </div>
      <p className="sm:col-span-3 text-sm text-slate-600">{b.summary}</p>
      <div className="sm:col-span-3">
        <CrmBadge tone={paymentStatusTone(b.status)}>{paymentStatusLabel(b.status)}</CrmBadge>
      </div>
    </div>
  );
}
