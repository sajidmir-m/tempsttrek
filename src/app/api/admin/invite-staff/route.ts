import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-api-auth';
import { profileWritePayload } from '@/lib/profiles-db';
import { logStaffAudit } from '@/lib/staff-audit';

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi(req);
    if (!auth.ok) return auth.response;
    const { admin, actorId, actorEmail } = auth.ctx;

    let body: { email?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role: 'employee' },
      redirectTo: `${origin}/admin`,
    });

    if (inviteErr || !invited?.user) {
      return NextResponse.json({ error: inviteErr?.message || 'Failed to send invite' }, { status: 400 });
    }

    const uid = invited.user.id;
    const profileRow = profileWritePayload({ id: uid, email, role: 'employee' });

    const { data: updated, error: updateErr } = await admin
      .from('profiles')
      .update({ email: profileRow.email, role: profileRow.role, is_active: true })
      .eq('id', uid)
      .select('role')
      .maybeSingle();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    if (!updated) {
      const { error: insertErr } = await admin.from('profiles').insert({ ...profileRow, is_active: true });
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    await logStaffAudit(admin, {
      actorId,
      actorEmail,
      targetUserId: uid,
      targetEmail: email,
      action: 'staff_invited',
      detail: { method: 'email_invite' },
    });

    return NextResponse.json({ ok: true, userId: uid, email, role: 'employee' });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected error' }, { status: 500 });
  }
}
