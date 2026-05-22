import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-api-auth';
import { profileWritePayload } from '@/lib/profiles-db';
import { logStaffAudit } from '@/lib/staff-audit';

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi(req);
    if (!auth.ok) return auth.response;
    const { admin, actorId, actorEmail } = auth.ctx;

    let body: { email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'employee' },
      app_metadata: { role: 'employee' },
    });

    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 400 });
    }

    const uid = created.user.id;
    const profileRow = profileWritePayload({ id: uid, email, role: 'employee' });

    const { data: updated, error: updateErr } = await admin
      .from('profiles')
      .update({ email: profileRow.email, role: profileRow.role, is_active: true })
      .eq('id', uid)
      .select('role')
      .maybeSingle();

    if (updateErr) {
      await admin.auth.admin.deleteUser(uid);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    if (!updated) {
      const { error: insertErr } = await admin.from('profiles').insert({ ...profileRow, is_active: true });
      if (insertErr) {
        await admin.auth.admin.deleteUser(uid);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    await logStaffAudit(admin, {
      actorId,
      actorEmail,
      targetUserId: uid,
      targetEmail: email,
      action: 'staff_created',
      detail: { method: 'password' },
    });

    return NextResponse.json({ ok: true, userId: uid, email, role: 'employee' });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected error' }, { status: 500 });
  }
}
