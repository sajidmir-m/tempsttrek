'use client';

import { CalendarDays, RefreshCcw } from 'lucide-react';
import CrmButton from '../ui/CrmButton';
import { yyyyMmDd } from './date-utils';

const presets = (today: Date) =>
  [
    { id: 'today', label: 'Today', from: yyyyMmDd(today), to: yyyyMmDd(today) },
    {
      id: 'week',
      label: 'Next 7 days',
      from: yyyyMmDd(today),
      to: yyyyMmDd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)),
    },
    {
      id: 'month',
      label: 'Next 30 days',
      from: yyyyMmDd(today),
      to: yyyyMmDd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)),
    },
  ] as const;

export default function CrmDateRangeControl({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onApplyPreset,
  onRefresh,
  loading,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApplyPreset: (from: string, to: string) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const today = new Date();
  const ps = presets(today);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Operations</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">CRM Dashboard</h1>
          <p className="mt-1 text-xs text-slate-500">
            Arrivals and follow-ups respect the selected date range. Overdue follow-ups include all pending items before
            now.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ps.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p.from, p.to)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">From</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <CalendarDays size={16} className="text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromChange(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">To</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <CalendarDays size={16} className="text-slate-400" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToChange(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <CrmButton variant="primary" size="lg" onClick={onRefresh} disabled={loading} className="min-w-[8rem]">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </CrmButton>
      </div>
    </div>
  );
}
