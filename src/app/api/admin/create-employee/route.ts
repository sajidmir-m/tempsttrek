import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from '@/lib/supabase-admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
          error: 'Server is not configured with SUPABASE_SERVICE_ROLE_KEY. Add it to your environment.',
          hint: 'Add SUPABASE_SERVICE_ROLE_KEY from Supabase → Project Settings → API → service_role (secret) to .env.local on your machine (or your host’s env vars), then restart the Next.js server.',
        },
        { status: 500 }
      );
    }

    const { data: profile, error: profReadErr } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profReadErr) {
      return NextResponse.json({ error: profReadErr.message }, { status: 500 });
    }
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create employees' }, { status: 403 });
    }

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
    });

    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 400 });
    }

    const uid = created.user.id;

    const { error: upsertErr } = await admin.from('profiles').upsert(
      {
        id: uid,
        email,
        role: 'employee',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertErr) {
      await admin.auth.admin.deleteUser(uid);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, userId: uid, email });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
