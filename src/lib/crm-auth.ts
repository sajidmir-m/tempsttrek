import { supabase } from '@/lib/supabase';

/** Attach on insert when the column exists (crm_* tables). */
export async function crmActorFields(): Promise<{ created_by?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ? { created_by: user.id } : {};
}
