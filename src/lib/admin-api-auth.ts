import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { isStoredAdmin } from '@/lib/portal-role';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type AdminApiContext = {
  admin: ReturnType<typeof createSupabaseAdmin>;
  actorId: string;
  actorEmail: string;
};

export async function requireAdminApi(req: Request): Promise<
  | { ok: true; ctx: AdminApiContext }
  | { ok: false; response: Response }
> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: Response.json({ error: 'Missing or invalid Authorization header' }, { status: 401 }),
    };
  }
  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return {
      ok: false,
      response: Response.json({ error: 'Missing access token' }, { status: 401 }),
    };
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
    return {
      ok: false,
      response: Response.json({ error: 'Invalid or expired session' }, { status: 401 }),
    };
  }

  let admin: ReturnType<typeof createSupabaseAdmin>;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return {
      ok: false,
      response: Response.json(
        {
          error: 'Server is not configured with SUPABASE_SERVICE_ROLE_KEY.',
          hint: 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.',
        },
        { status: 500 }
      ),
    };
  }

  const { data: profile, error: profReadErr } = await admin
    .from('profiles')
    .select('role,is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (profReadErr) {
    return {
      ok: false,
      response: Response.json({ error: profReadErr.message }, { status: 500 }),
    };
  }
  if (profile?.is_active === false) {
    return {
      ok: false,
      response: Response.json({ error: 'Your account is deactivated' }, { status: 403 }),
    };
  }

  if (!isStoredAdmin(profile?.role)) {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        response: Response.json({ error: 'Only admins can perform this action' }, { status: 403 }),
      };
    }
  }

  return {
    ok: true,
    ctx: {
      admin,
      actorId: user.id,
      actorEmail: user.email || '',
    },
  };
}
