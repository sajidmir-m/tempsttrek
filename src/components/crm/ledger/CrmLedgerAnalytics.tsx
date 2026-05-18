'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCategoryLabel, formatInr } from '@/lib/ledger-utils';
import type { TripLedgerItemRow } from './ledger-types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CrmLedgerAnalytics({ items }: { items: TripLedgerItemRow[] }) {
  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of items) {
      const key = row.entry_date.slice(0, 7);
      map.set(key, (map.get(key) || 0) + Number(row.total_cost));
    }
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    return {
      labels: sorted.map(([k]) => {
        const [y, m] = k.split('-');
        return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }),
      values: sorted.map(([, v]) => v),
    };
  }, [items]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of items) {
      const label = formatCategoryLabel(row.category);
      map.set(label, (map.get(label) || 0) + Number(row.total_cost));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const recent = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return items
      .filter((r) => new Date(r.entry_date) >= cutoff)
      .reduce((acc, r) => acc + Number(r.total_cost), 0);
  }, [items]);

  const chartData = {
    labels: monthly.labels,
    datasets: [
      {
        label: 'Expense (₹)',
        data: monthly.values,
        backgroundColor: 'rgba(13, 148, 136, 0.65)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-900">Monthly expense trend</h3>
        <p className="mb-3 text-xs text-slate-500">Last 6 months by entry date</p>
        <div className="h-48">
          {monthly.labels.length > 0 ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (v) => `₹${v}` } },
                  x: { grid: { display: false } },
                },
              }}
            />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-slate-400">No dated entries yet</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Last 30 days</p>
          <p className="mt-2 text-2xl font-extrabold text-teal-900">{formatInr(recent)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">By category</p>
          <ul className="mt-3 space-y-2">
            {byCategory.length === 0 ? (
              <li className="text-sm text-slate-400">—</li>
            ) : (
              byCategory.map(([label, amount]) => (
                <li key={label} className="flex justify-between text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{formatInr(amount)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
