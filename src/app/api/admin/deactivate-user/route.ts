import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-api-auth';
import { logStaffAudit } from '@/lib/staff-audit';

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi(req);
    if (!auth.ok) return auth.response;
    const { admin, actorId, actorEmail } = auth.ctx;

    let body: { userId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const userId = String(body.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (userId === actorId) {
      return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
    }

    const { data: target, error: readErr } = await admin
      .from('profiles')
      .select('email,role,is_active')
      .eq('id', userId)
      .maybeSingle();
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { error: profErr } = await admin.from('profiles').update({ is_active: false }).eq('id', userId);
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

    await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });

    await logStaffAudit(admin, {
      actorId,
      actorEmail,
      targetUserId: userId,
      targetEmail: target.email || '',
      action: 'deactivated',
      detail: { previous_role: target.role },
    });

    return NextResponse.json({ ok: true, userId, is_active: false });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected error' }, { status: 500 });
  }
}
