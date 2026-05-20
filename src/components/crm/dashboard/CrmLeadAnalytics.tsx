'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolvePortalRole } from '@/lib/portal-role';
import { Hotel, MessageSquare, UserCheck, Users, UserPlus } from 'lucide-react';
import CrmStatCard from './CrmStatCard';
import Link from 'next/link';

export default function CrmLeadAnalytics() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    assignedLeads: 0,
    convertedLeads: 0,
    activeEmployees: 0,
    hotelCount: 0,
    inquiryCount: 0,
    myLeads: 0,
    followUpsToday: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let role = 'admin';
      if (user) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        role = resolvePortalRole(p?.role);
        setIsAdmin(role === 'admin');
      }

      const leadQ = supabase.from('crm_leads').select('id,status,assigned_to,follow_up_at', { count: 'exact', head: false });
      const { data: leads } = role === 'employee' && user
        ? await leadQ.eq('assigned_to', user.id)
        : await leadQ.limit(2000);

      const today = new Date().toISOString().slice(0, 10);
      const leadList = leads || [];
      const converted = leadList.filter((l) => l.status === 'converted').length;
      const assigned = leadList.filter((l) => l.assigned_to).length;
      const followUpsToday = leadList.filter((l) => l.follow_up_at?.startsWith(today)).length;

      const [emp, hotels, inquiries] = await Promise.all([
        role === 'admin'
          ? supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'employee')
          : Promise.resolve({ count: 0 }),
        supabase.from('crm_hotels').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalLeads: leadList.length,
        assignedLeads: assigned,
        convertedLeads: converted,
        activeEmployees: emp.count ?? 0,
        hotelCount: hotels.count ?? 0,
        inquiryCount: inquiries.count ?? 0,
        myLeads: role === 'employee' ? leadList.length : assigned,
        followUpsToday,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (isAdmin) {
    return (
      <div className="crm-surface space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">CRM overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CrmStatCard label="Total leads" value={stats.totalLeads} icon={UserPlus} loading={loading} accent="teal" />
          <CrmStatCard label="Assigned leads" value={stats.assignedLeads} icon={UserCheck} loading={loading} accent="sky" />
          <CrmStatCard label="Converted leads" value={stats.convertedLeads} icon={Users} loading={loading} accent="sky" />
          <CrmStatCard label="Active employees" value={stats.activeEmployees} icon={Users} loading={loading} accent="teal" />
          <CrmStatCard label="Active hotels" value={stats.hotelCount} icon={Hotel} loading={loading} accent="amber" />
          <CrmStatCard label="Inquiries" value={stats.inquiryCount} icon={MessageSquare} loading={loading} accent="rose" />
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/crm/manage-leads" className="font-semibold text-teal-700 hover:underline">
            Manage leads →
          </Link>
          <Link href="/crm/manage-inquiries" className="font-semibold text-teal-700 hover:underline">
            View inquiries →
          </Link>
          <Link href="/crm/manage-hotel" className="font-semibold text-teal-700 hover:underline">
            Hotels →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-surface space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Your workspace</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CrmStatCard label="Assigned leads" value={stats.myLeads} icon={UserPlus} loading={loading} accent="teal" />
        <CrmStatCard label="Converted" value={stats.convertedLeads} icon={UserCheck} loading={loading} accent="sky" />
        <CrmStatCard label="Follow-ups today" value={stats.followUpsToday} icon={MessageSquare} loading={loading} accent="amber" />
      </div>
      <Link href="/crm/manage-leads" className="text-sm font-semibold text-teal-700 hover:underline">
        Open my leads →
      </Link>
    </div>
  );
}
