import { supabase, createClient as createSupabaseClient } from '@/lib/supabase';

/**
 * Backward-compatible shim while imports are normalized.
 * Project runtime is Supabase-only.
 */
export const firebaseClient = supabase as any;

export function createClient() {
  return createSupabaseClient() as any;
}
