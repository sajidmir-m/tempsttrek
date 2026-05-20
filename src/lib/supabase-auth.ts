import type { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** True when Supabase cannot refresh the session (expired/revoked/missing token in storage). */
export function isAuthRefreshTokenError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    typeof error === 'object' && error !== null && 'message' in error && typeof (error as AuthError).message === 'string'
      ? (error as AuthError).message
      : String(error);
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  return (
    /refresh token/i.test(msg) ||
    /invalid refresh/i.test(msg) ||
    code === 'refresh_token_not_found' ||
    code === 'invalid_refresh_token'
  );
}

/** Remove broken auth state from this browser without calling the server. */
export async function clearStaleAuthSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined') return;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}

/**
 * Safe session read — clears corrupt sessions instead of leaving invalid refresh tokens in storage.
 */
export async function getSafeSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && isAuthRefreshTokenError(error)) {
      await clearStaleAuthSession();
      return { session: null, error: null };
    }
    return { session: data.session, error: error ?? null };
  } catch (e: unknown) {
    if (isAuthRefreshTokenError(e)) {
      await clearStaleAuthSession();
      return { session: null, error: null };
    }
    throw e;
  }
}

let recoveryRegistered = false;

function hasCorruptAuthStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('sb-') || !key.includes('auth')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { refresh_token?: string | null; expires_at?: number };
      if (parsed && typeof parsed === 'object') {
        if ('refresh_token' in parsed && !parsed.refresh_token) return true;
        if (parsed.expires_at && parsed.expires_at * 1000 < Date.now() - 60_000) {
          return !parsed.refresh_token;
        }
      }
    }
  } catch {
    return true;
  }
  return false;
}

/** Run once in the browser to clear invalid tokens before Supabase tries to refresh them. */
export function registerSupabaseAuthRecovery(): () => void {
  if (typeof window === 'undefined' || recoveryRegistered) return () => undefined;
  recoveryRegistered = true;

  if (hasCorruptAuthStorage()) {
    void clearStaleAuthSession();
  } else {
    void getSafeSession();
  }

  return () => {
    recoveryRegistered = false;
  };
}
