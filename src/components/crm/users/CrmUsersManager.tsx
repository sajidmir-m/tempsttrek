'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getSafeSession } from '@/lib/supabase-auth';
import {
  formatProfileRoleLabel,
  isStoredAdmin,
  profileRoleBadgeClass,
} from '@/lib/portal-role';
import { useToast } from '@/components/ui/Toast';
import CrmInput from '../ui/CrmInput';
import CrmButton from '../ui/CrmButton';
import CrmBadge from '../ui/CrmBadge';
import { CrmTable, CrmThead, CrmTbody, CrmTr, CrmTh, CrmTd } from '../ui/CrmTable';
import { CrmSkeleton } from '../ui/CrmSkeleton';
import {
  History,
  Mail,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';

export type ProfileRow = {
  id: string;
  email: string | null;
  role: string;
  is_active?: boolean;
  created_at: string;
};

type AuditRow = {
  id: string;
  actor_email: string | null;
  target_email: string | null;
  action: string;
  detail: Record<string, unknown> | null;
  created_at: string;
};

async function adminFetch(path: string, body: Record<string, unknown>) {
  const { session } = await getSafeSession();
  const token = session?.access_token;
  if (!token) throw new Error('You are not signed in.');
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error([json.error, json.hint].filter(Boolean).join('\n') || 'Request failed');
  }
  return json;
}

const CRM_SCOPES = [
  {
    role: 'Admin',
    tone: 'default' as const,
    items: [
      'Full CRM: leads, itineraries, vouchers, invoices, ledger, expenses',
      'Manage hotels, destinations, cabs, and catalog',
      'Invite staff, change roles, deactivate accounts (this page)',
      'Admin console at /admin for website content',
    ],
  },
  {
    role: 'Employee',
    tone: 'info' as const,
    items: [
      'CRM operations: leads, itineraries, booking vouchers, inquiries',
      'Hotels, destinations, and day-to-day sales work',
      'Cannot manage staff or change roles',
      'Sign in at /admin with employee credentials',
    ],
  },
];

function formatAuditAction(action: string) {
  const map: Record<string, string> = {
    staff_created: 'Account created',
    staff_invited: 'Email invite sent',
    role_changed: 'Role changed',
    deactivated: 'Deactivated',
    reactivated: 'Reactivated',
  };
  return map[action] || action;
}

export default function CrmUsersManager() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myId, setMyId] = useState('');
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [q, setQ] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [tab, setTab] = useState<'staff' | 'scopes' | 'audit'>('staff');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { session } = await getSafeSession();
      if (!session?.user) {
        setIsAdmin(false);
        setUsers([]);
        return;
      }
      setMyId(session.user.id);
      const { data: me } = await supabase
        .from('profiles')
        .select('role,is_active')
        .eq('id', session.user.id)
        .maybeSingle();
      const admin = isStoredAdmin(me?.role);
      setIsAdmin(admin);

      if (!admin) {
        setUsers([]);
        setAudit([]);
        return;
      }

      const [{ data: profiles }, { data: logs }] = await Promise.all([
        supabase.from('profiles').select('id,email,role,is_active,created_at').order('created_at', { ascending: false }),
        supabase
          .from('crm_staff_audit')
          .select('id,actor_email,target_email,action,detail,created_at')
          .order('created_at', { ascending: false })
          .limit(80),
      ]);

      setUsers((profiles || []) as ProfileRow[]);
      setAudit((logs || []) as AuditRow[]);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const staffUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    const portal = users.filter((u) => {
      const r = (u.role || '').toLowerCase();
      return r === 'admin' || r === 'employee';
    });
    const list = portal.length > 0 ? portal : users;
    if (!s) return list;
    return list.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(s) ||
        (u.role || '').toLowerCase().includes(s)
    );
  }, [users, q]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = inviteEmail.trim().toLowerCase();
    if (!em) return;
    setInviteLoading(true);
    try {
      await adminFetch('/api/admin/invite-staff', { email: em });
      setInviteEmail('');
      showToast(`Invite sent to ${em}`, 'success');
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Invite failed', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = newEmail.trim().toLowerCase();
    const pw = newPassword;
    if (!em || !pw) return;
    setCreateLoading(true);
    try {
      await adminFetch('/api/admin/create-employee', { email: em, password: pw });
      setNewEmail('');
      setNewPassword('');
      showToast(`Employee created — they can sign in at /admin`, 'success');
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Create failed', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const setRole = async (userId: string, role: 'admin' | 'employee' | 'user') => {
    try {
      await adminFetch('/api/admin/set-user-role', { userId, role });
      showToast('Role updated', 'success');
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const toggleActive = async (user: ProfileRow) => {
    const active = user.is_active !== false;
    try {
      if (active) {
        await adminFetch('/api/admin/deactivate-user', { userId: user.id });
        showToast('Account deactivated', 'success');
      } else {
        await adminFetch('/api/admin/reactivate-user', { userId: user.id });
        showToast('Account reactivated', 'success');
      }
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  if (!loading && !isAdmin) {
    return (
      <div className="crm-surface max-w-xl rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
        <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <Shield size={20} className="text-amber-700" />
          Admin access required
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Only users with the <strong>admin</strong> role can invite staff, assign roles, and view the audit trail.
          Ask an owner to set your role in Admin → Users, or use the same controls at{' '}
          <Link href="/admin" className="font-semibold text-teal-700 underline">
            /admin
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="crm-surface space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Users size={22} className="text-teal-700" />
          Staff &amp; access
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Invite staff, assign CRM roles, soft-disable accounts, and review who changed access.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
        {(
          [
            ['staff', 'Staff'],
            ['scopes', 'Roles & scopes'],
            ['audit', 'Audit trail'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              tab === id ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'staff' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <form onSubmit={handleInvite} className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Mail size={16} />
                Email invite
              </h3>
              <p className="text-xs text-gray-600">Sends a Supabase invite link so they set their own password.</p>
              <CrmInput
                label="Staff email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff@example.com"
              />
              <CrmButton type="submit" variant="primary" size="sm" disabled={inviteLoading}>
                {inviteLoading ? 'Sending…' : 'Send invite'}
              </CrmButton>
            </form>

            <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <UserPlus size={16} />
                Create with password
              </h3>
              <p className="text-xs text-gray-600">Instant login at /admin — share the temporary password securely.</p>
              <CrmInput label="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <CrmInput
                label="Temporary password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <CrmButton type="submit" variant="secondary" size="sm" disabled={createLoading}>
                {createLoading ? 'Creating…' : 'Create employee'}
              </CrmButton>
            </form>
          </div>

          <CrmInput label="Search staff" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email or role…" />

          {loading ? (
            <div className="space-y-2">
              <CrmSkeleton className="h-10 w-full" />
              <CrmSkeleton className="h-10 w-full" />
            </div>
          ) : staffUsers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-sm text-gray-500">
              No staff accounts yet. Send an invite or create an employee above.
            </p>
          ) : (
            <CrmTable>
              <CrmThead>
                <CrmTr>
                  <CrmTh>User</CrmTh>
                  <CrmTh>Role</CrmTh>
                  <CrmTh>Status</CrmTh>
                  <CrmTh>Joined</CrmTh>
                  <CrmTh className="text-right">Actions</CrmTh>
                </CrmTr>
              </CrmThead>
              <CrmTbody>
                  {staffUsers.map((user) => {
                    const active = user.is_active !== false;
                    return (
                      <CrmTr key={user.id}>
                        <CrmTd>
                          <p className="font-semibold text-gray-900">{user.email || '—'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{user.id.slice(0, 8)}…</p>
                        </CrmTd>
                        <CrmTd>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${profileRoleBadgeClass(user.role)}`}
                          >
                            {formatProfileRoleLabel(user.role)}
                          </span>
                        </CrmTd>
                        <CrmTd>
                          <CrmBadge tone={active ? 'success' : 'danger'}>{active ? 'Active' : 'Disabled'}</CrmBadge>
                        </CrmTd>
                        <CrmTd className="text-xs text-gray-600">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </CrmTd>
                        <CrmTd className="text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            <button
                              type="button"
                              className="text-[10px] font-bold px-2 py-1 rounded border border-purple-200 text-purple-800"
                              onClick={() => void setRole(user.id, 'admin')}
                            >
                              Admin
                            </button>
                            <button
                              type="button"
                              className="text-[10px] font-bold px-2 py-1 rounded border border-teal-200 text-teal-800"
                              onClick={() => void setRole(user.id, 'employee')}
                            >
                              Employee
                            </button>
                            {user.id !== myId ? (
                              <button
                                type="button"
                                className="text-[10px] font-bold px-2 py-1 rounded border border-red-200 text-red-800"
                                onClick={() => void toggleActive(user)}
                              >
                                {active ? (
                                  <>
                                    <UserMinus size={10} className="inline mr-0.5" />
                                    Disable
                                  </>
                                ) : (
                                  'Enable'
                                )}
                              </button>
                            ) : null}
                          </div>
                        </CrmTd>
                      </CrmTr>
                    );
                  })}
              </CrmTbody>
            </CrmTable>
          )}
        </>
      )}

      {tab === 'scopes' && (
        <div className="grid gap-4 md:grid-cols-2">
          {CRM_SCOPES.map((block) => (
            <div key={block.role} className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-teal-700" />
                {block.role}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <History size={18} className="text-gray-500" />
            <p className="text-sm font-bold text-gray-800">Recent access changes</p>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              <CrmSkeleton className="h-8 w-full" />
              <CrmSkeleton className="h-8 w-full" />
            </div>
          ) : audit.length === 0 ? (
            <p className="p-6 text-sm text-gray-500 text-center">
              No audit entries yet. Role changes and invites are logged here after you run migration{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">20260527_crm_staff_users.sql</code>.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {audit.map((row) => (
                <li key={row.id} className="px-4 py-3 text-sm">
                  <p className="font-semibold text-gray-900">{formatAuditAction(row.action)}</p>
                  <p className="text-gray-600 mt-0.5">
                    <span className="text-gray-500">Target:</span> {row.target_email || '—'}
                    {row.actor_email ? (
                      <>
                        {' '}
                        · <span className="text-gray-500">By:</span> {row.actor_email}
                      </>
                    ) : null}
                  </p>
                  {row.detail && Object.keys(row.detail).length > 0 ? (
                    <p className="text-xs text-gray-500 mt-1 font-mono">{JSON.stringify(row.detail)}</p>
                  ) : null}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
