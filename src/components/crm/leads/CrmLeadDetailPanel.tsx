'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmActorFields } from '@/lib/crm-auth';
import { useToast } from '@/components/ui/Toast';
import { LEAD_STATUSES, leadStatusLabel } from '@/lib/crm-leads';
import CrmInput from '../ui/CrmInput';
import CrmTextarea from '../ui/CrmTextarea';
import CrmButton from '../ui/CrmButton';
import CrmSelect from '../ui/CrmSelect';
import CrmBadge, { leadStatusTone } from '../ui/CrmBadge';
import type { LeadRow } from './CrmLeadsTable';

type NoteRow = { id: string; body: string; created_at: string };
type CallRow = { id: string; called_at: string; duration_minutes: number | null; outcome: string | null; notes: string | null };

export default function CrmLeadDetailPanel({
  lead,
  isAdmin,
  employees,
  onUpdated,
  onClose,
}: {
  lead: LeadRow;
  isAdmin: boolean;
  employees: { id: string; email: string }[];
  onUpdated: () => void;
  onClose: () => void;
}) {
  const primary = 'text-slate-900';
  const muted = 'text-slate-600';
  const mutedSm = 'text-slate-500';
  const tabInactive = 'text-slate-600';
  const tabActive = 'border-teal-600 text-teal-800';
  const body = 'text-slate-800';
  const { showToast } = useToast();
  const [tab, setTab] = useState<'overview' | 'notes' | 'calls'>('overview');
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [noteText, setNoteText] = useState('');
  const [callForm, setCallForm] = useState({ outcome: '', notes: '', duration: '' });
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(lead);

  useEffect(() => setLocal(lead), [lead]);

  const loadExtras = useCallback(async () => {
    const [n, c] = await Promise.all([
      supabase.from('crm_lead_notes').select('id,body,created_at').eq('lead_id', lead.id).order('created_at', { ascending: false }),
      supabase.from('crm_lead_calls').select('id,called_at,duration_minutes,outcome,notes').eq('lead_id', lead.id).order('called_at', { ascending: false }),
    ]);
    if (!n.error) setNotes((n.data || []) as NoteRow[]);
    if (!c.error) setCalls((c.data || []) as CallRow[]);
  }, [lead.id]);

  useEffect(() => {
    void loadExtras();
  }, [loadExtras]);

  const saveLead = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        status: local.status,
        follow_up_at: local.follow_up_at || null,
        message: local.message?.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (isAdmin) payload.assigned_to = local.assigned_to || null;
      const { error } = await supabase.from('crm_leads').update(payload).eq('id', lead.id);
      if (error) throw error;
      showToast('Lead updated', 'success');
      onUpdated();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    const body = noteText.trim();
    if (!body) return;
    const actor = await crmActorFields();
    const { error } = await supabase.from('crm_lead_notes').insert({ lead_id: lead.id, body, ...actor });
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setNoteText('');
    await loadExtras();
    showToast('Note added', 'success');
  };

  const addCall = async () => {
    const actor = await crmActorFields();
    const dur = callForm.duration.trim() ? Number.parseInt(callForm.duration, 10) : null;
    const { error } = await supabase.from('crm_lead_calls').insert({
      lead_id: lead.id,
      outcome: callForm.outcome.trim() || null,
      notes: callForm.notes.trim() || null,
      duration_minutes: Number.isFinite(dur as number) ? dur : null,
      ...actor,
    });
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setCallForm({ outcome: '', notes: '', duration: '' });
    await loadExtras();
    showToast('Call logged', 'success');
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'notes' as const, label: `Notes (${notes.length})` },
    { id: 'calls' as const, label: `Calls (${calls.length})` },
  ];

  return (
    <div className="crm-surface space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-lg font-bold ${primary}`}>{local.name}</h2>
          <p className={`text-sm ${muted}`}>{local.phone || '—'} · {local.email || '—'}</p>
          <div className="mt-2">
            <CrmBadge tone={leadStatusTone(local.status)}>{leadStatusLabel(local.status)}</CrmBadge>
          </div>
        </div>
        <CrmButton variant="secondary" size="sm" onClick={onClose}>
          Close
        </CrmButton>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px ${
              tab === t.id ? tabActive : `border-transparent ${tabInactive}`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <CrmSelect label="Status" value={local.status} onChange={(e) => setLocal((l) => ({ ...l, status: e.target.value }))}>
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {leadStatusLabel(st)}
                </option>
              ))}
            </CrmSelect>
            <CrmInput
              label="Follow-up reminder"
              type="datetime-local"
              value={local.follow_up_at ? local.follow_up_at.slice(0, 16) : ''}
              onChange={(e) =>
                setLocal((l) => ({
                  ...l,
                  follow_up_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                }))
              }
            />
          </div>
          {isAdmin && (
            <CrmSelect
              label="Assigned to"
              value={local.assigned_to || ''}
              onChange={(e) => setLocal((l) => ({ ...l, assigned_to: e.target.value || null }))}
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.email}
                </option>
              ))}
            </CrmSelect>
          )}
          <CrmTextarea label="Message / requirements" value={local.message || ''} onChange={(e) => setLocal((l) => ({ ...l, message: e.target.value }))} rows={3} />
          <dl className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-800 sm:grid-cols-2">
            <div>
              <dt className={muted}>Address</dt>
              <dd className={`font-medium ${primary}`}>{local.address || '—'}</dd>
            </div>
            <div>
              <dt className={muted}>Hotel requirement</dt>
              <dd className={`font-medium ${primary}`}>{local.hotel_requirement || local.destination || '—'}</dd>
            </div>
            <div>
              <dt className={muted}>Check-in</dt>
              <dd className={`font-medium ${primary}`}>{local.check_in || '—'}</dd>
            </div>
            <div>
              <dt className={muted}>Check-out</dt>
              <dd className={`font-medium ${primary}`}>{local.check_out || '—'}</dd>
            </div>
            <div>
              <dt className={muted}>Source</dt>
              <dd className={`font-medium ${primary}`}>{local.source || '—'}</dd>
            </div>
            <div>
              <dt className={muted}>Budget</dt>
              <dd className={`font-medium ${primary}`}>{local.budget != null ? `₹${Number(local.budget).toLocaleString()}` : '—'}</dd>
            </div>
          </dl>
          <div className="flex justify-end">
            <CrmButton variant="primary" size="md" onClick={() => void saveLead()} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </CrmButton>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-3">
          <CrmTextarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" rows={3} />
          <CrmButton variant="primary" size="sm" onClick={() => void addNote()}>
            Add note
          </CrmButton>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm">
                <p className={body}>{n.body}</p>
                <p className={`mt-1 text-[10px] ${mutedSm}`}>{new Date(n.created_at).toLocaleString()}</p>
              </li>
            ))}
            {notes.length === 0 && <p className={`text-sm ${muted}`}>No notes yet.</p>}
          </ul>
        </div>
      )}

      {tab === 'calls' && (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <CrmInput placeholder="Outcome" value={callForm.outcome} onChange={(e) => setCallForm((f) => ({ ...f, outcome: e.target.value }))} />
            <CrmInput placeholder="Duration (min)" type="number" value={callForm.duration} onChange={(e) => setCallForm((f) => ({ ...f, duration: e.target.value }))} />
            <CrmButton variant="primary" size="sm" onClick={() => void addCall()}>
              Log call
            </CrmButton>
          </div>
          <CrmTextarea placeholder="Call notes" value={callForm.notes} onChange={(e) => setCallForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {calls.map((c) => (
              <li key={c.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <p className="font-medium text-slate-800">{c.outcome || 'Call'}</p>
                {c.notes && <p className="text-slate-600">{c.notes}</p>}
                <p className="mt-1 text-[10px] text-slate-400">
                  {new Date(c.called_at).toLocaleString()}
                  {c.duration_minutes != null ? ` · ${c.duration_minutes} min` : ''}
                </p>
              </li>
            ))}
            {calls.length === 0 && <p className={`text-sm ${muted}`}>No call history.</p>}
          </ul>
        </div>
      )}
    </div>
  );
}
