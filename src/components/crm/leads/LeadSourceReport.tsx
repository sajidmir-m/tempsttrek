'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import CrmEmptyState from '../ui/CrmEmptyState';
import { PieChart } from 'lucide-react';

export default function LeadSourceReport() {
  const [sources, setSources] = useState<{ source: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('crm_leads').select('source');
        if (error) throw error;
        const map = new Map<string, number>();
        for (const row of data || []) {
          const s = ((row as { source?: string | null }).source || 'Unknown').trim() || 'Unknown';
          map.set(s, (map.get(s) || 0) + 1);
        }
        const list = [...map.entries()]
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count);
        if (!cancelled) setSources(list);
      } catch (e: unknown) {
        if (!cancelled) showToast(e instanceof Error ? e.message : 'Failed to load', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const max = useMemo(() => sources.reduce((m, x) => Math.max(m, x.count), 0), [sources]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Lead source</h1>
        <p className="text-sm text-slate-500">Distribution of `crm_leads.source` (aggregated in browser).</p>
      </div>
      {loading ? (
        <div className="space-y-2">
          <CrmSkeleton className="h-12 w-full" />
          <CrmSkeleton className="h-12 w-full" />
        </div>
      ) : sources.length === 0 ? (
        <CrmEmptyState icon={PieChart} title="No lead data" description="Add leads with a source field to see this report." />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ul className="space-y-3">
            {sources.map((s) => (
              <li key={s.source} className="flex items-center gap-3">
                <div className="w-28 shrink-0 truncate text-sm font-medium text-slate-800" title={s.source}>
                  {s.source}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all"
                    style={{ width: max ? `${Math.max(8, (s.count / max) * 100)}%` : '8%' }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
