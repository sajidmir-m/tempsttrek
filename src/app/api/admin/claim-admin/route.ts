import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { profileWritePayload } from '@/lib/profiles-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Promote the signed-in user to admin when no admin exists yet (first-time bootstrap). */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const accessToken = authHeader.slice('Bearer '.length).trim();
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    let admin;
    try {
      admin = createSupabaseAdmin();
    } catch {
      return NextResponse.json(
        {
          error: 'Server is not configured with SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 500 }
      );
    }

    const { count, error: countErr } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json({ ok: true, promoted: false, reason: 'admin_exists' });
    }

    const email = user.email?.toLowerCase() || null;
    const { error: upsertErr } = await admin
      .from('profiles')
      .upsert(profileWritePayload({ id: user.id, email, role: 'admin' }), { onConflict: 'id' });

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, promoted: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
