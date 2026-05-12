'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { ClipboardList, Clock, PlaneLanding } from 'lucide-react';
import CrmCard from '../ui/CrmCard';
import CrmEmptyState from '../ui/CrmEmptyState';
import CrmDateRangeControl from './CrmDateRangeControl';
import CrmDataRow from './CrmDataRow';
import CrmStatCard from './CrmStatCard';
import { endOfDay, parseYmd, startOfDay, yyyyMmDd } from './date-utils';
import type { ArrivalRow, FollowupRow } from './types';

const CrmSummaryChart = dynamic(() => import('./CrmSummaryChart'), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-xl bg-slate-100" aria-hidden />,
});

export default function CrmDashboardView() {
  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState<string>(yyyyMmDd(today));
  const [toDate, setToDate] = useState<string>(
    yyyyMmDd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7))
  );

  const [loading, setLoading] = useState(false);
  const [arrivals, setArrivals] = useState<ArrivalRow[]>([]);
  const [followupsInRange, setFollowupsInRange] = useState<FollowupRow[]>([]);
  const [missedFollowups, setMissedFollowups] = useState<FollowupRow[]>([]);
  const { showToast } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rangeStart = startOfDay(parseYmd(fromDate));
      const rangeEnd = endOfDay(parseYmd(toDate));
      const now = new Date();
      const nowIso = now.toISOString();
      const lowerBound = rangeStart.getTime() < now.getTime() ? now : rangeStart;

      const [arr, fuRange, fuMissed] = await Promise.all([
        supabase
          .from('crm_arrivals')
          .select('id,arrival_date,destination,status,crm_quotations(quote_id,crm_leads(name,phone))')
          .gte('arrival_date', fromDate)
          .lte('arrival_date', toDate)
          .order('arrival_date', { ascending: true }),
        supabase
          .from('crm_followups')
          .select('id,followup_at,remark,status,crm_quotations(quote_id,crm_leads(name,phone))')
          .eq('status', 'pending')
          .gte('followup_at', lowerBound.toISOString())
          .lte('followup_at', rangeEnd.toISOString())
          .order('followup_at', { ascending: true }),
        supabase
          .from('crm_followups')
          .select('id,followup_at,remark,status,crm_quotations(quote_id,crm_leads(name,phone))')
          .eq('status', 'pending')
          .lt('followup_at', nowIso)
          .order('followup_at', { ascending: true }),
      ]);

      if (arr.error) throw arr.error;
      if (fuRange.error) throw fuRange.error;
      if (fuMissed.error) throw fuMissed.error;

      setArrivals(((arr.data || []) as unknown) as ArrivalRow[]);
      setFollowupsInRange(((fuRange.data || []) as unknown) as FollowupRow[]);
      setMissedFollowups(((fuMissed.data || []) as unknown) as FollowupRow[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('CRM dashboard fetch failed: ' + msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, showToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo(
    () => ({
      arrivals: arrivals.length,
      due: followupsInRange.length,
      overdue: missedFollowups.length,
    }),
    [arrivals.length, followupsInRange.length, missedFollowups.length]
  );

  return (
    <div className="space-y-6">
      <CrmDateRangeControl
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApplyPreset={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
        onRefresh={() => void refresh()}
        loading={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CrmStatCard
          label="Arrivals in range"
          value={stats.arrivals}
          hint={`${fromDate} → ${toDate}`}
          icon={PlaneLanding}
          loading={loading}
          accent="teal"
        />
        <CrmStatCard
          label="Follow-ups due"
          value={stats.due}
          hint="Pending in selected window"
          icon={Clock}
          loading={loading}
          accent="sky"
        />
        <CrmStatCard
          label="Overdue follow-ups"
          value={stats.overdue}
          hint="Pending before now"
          icon={ClipboardList}
          loading={loading}
          accent="rose"
        />
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <CrmSummaryChart arrivals={stats.arrivals} followupsDue={stats.due} overdue={stats.overdue} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CrmCard
          title={`Arrivals (${arrivals.length})`}
          subtitle={`Scheduled between ${fromDate} and ${toDate}`}
          icon={<PlaneLanding size={18} />}
        >
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : arrivals.length === 0 ? (
            <CrmEmptyState
              icon={PlaneLanding}
              title="No arrivals in this range"
              description="Try widening your date range or refresh after new bookings are added."
              actionHref="/crm/manage-quotations"
              actionLabel="View quotations"
            />
          ) : (
            arrivals.map((a) => (
              <CrmDataRow
                key={a.id}
                primary={`${a.crm_quotations?.crm_leads?.name || 'Customer'} · ${a.destination || 'Destination'}`}
                secondary={`${a.arrival_date} · ${a.crm_quotations?.quote_id || '—'} · ${a.crm_quotations?.crm_leads?.phone || ''}`.trim()}
                status={a.status}
                statusKind="arrival"
              />
            ))
          )}
        </CrmCard>

        <CrmCard
          title={`Follow-ups due (${followupsInRange.length})`}
          subtitle="Pending items in the selected date window"
          icon={<Clock size={18} />}
        >
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : followupsInRange.length === 0 ? (
            <CrmEmptyState
              icon={Clock}
              title="No follow-ups in this window"
              description="Adjust the range or refresh — pending follow-ups in range appear here."
              actionHref="/crm/manage-leads"
              actionLabel="Manage leads"
            />
          ) : (
            followupsInRange.map((f) => (
              <CrmDataRow
                key={f.id}
                primary={`${f.crm_quotations?.crm_leads?.name || 'Customer'} · ${f.crm_quotations?.quote_id || '—'}`}
                secondary={`${new Date(f.followup_at).toLocaleString()}${f.remark ? ` · ${f.remark}` : ''}`}
                status={f.status}
                statusKind="followup"
              />
            ))
          )}
        </CrmCard>

        <CrmCard
          title={`Overdue follow-ups (${missedFollowups.length})`}
          subtitle="Still pending with follow-up time in the past"
          icon={<ClipboardList size={18} />}
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : missedFollowups.length === 0 ? (
            <CrmEmptyState
              icon={ClipboardList}
              title="You're all caught up"
              description="No overdue pending follow-ups right now."
            />
          ) : (
            <div className="grid gap-0 md:grid-cols-2 md:gap-x-6">
              {missedFollowups.map((f) => (
                <CrmDataRow
                  key={f.id}
                  primary={`${f.crm_quotations?.crm_leads?.name || 'Customer'} · ${f.crm_quotations?.quote_id || '—'}`}
                  secondary={`${new Date(f.followup_at).toLocaleString()}${f.remark ? ` · ${f.remark}` : ''}`}
                  status={f.status}
                  statusKind="followup"
                />
              ))}
            </div>
          )}
        </CrmCard>
      </div>
    </div>
  );
}
