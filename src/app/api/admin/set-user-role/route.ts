import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-api-auth';
import { logStaffAudit } from '@/lib/staff-audit';

const ALLOWED = new Set(['admin', 'employee', 'user']);

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi(req);
    if (!auth.ok) return auth.response;
    const { admin, actorId, actorEmail } = auth.ctx;

    let body: { userId?: string; role?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const userId = String(body.userId || '').trim();
    const role = String(body.role || '').toLowerCase();
    if (!userId || !ALLOWED.has(role)) {
      return NextResponse.json({ error: 'userId and role (admin|employee|user) are required' }, { status: 400 });
    }

    const { data: before, error: readErr } = await admin
      .from('profiles')
      .select('email,role')
      .eq('id', userId)
      .maybeSingle();
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
    if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { error: updateErr } = await admin.from('profiles').update({ role }).eq('id', userId);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    await logStaffAudit(admin, {
      actorId,
      actorEmail,
      targetUserId: userId,
      targetEmail: before.email || '',
      action: 'role_changed',
      detail: { from: before.role, to: role },
    });

    return NextResponse.json({ ok: true, userId, role });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected error' }, { status: 500 });
  }
}
