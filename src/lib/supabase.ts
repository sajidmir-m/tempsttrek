import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const authOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
} as const;

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey, { auth: authOptions });

// Export createClient function for client components
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey, { auth: authOptions });
}
