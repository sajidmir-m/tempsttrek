'use client';

import { useEffect } from 'react';
import { registerSupabaseAuthRecovery } from '@/lib/supabase-auth';

/** Clears invalid Supabase refresh tokens so the console stays clean and users can log in again. */
export default function SupabaseAuthRecovery() {
  useEffect(() => registerSupabaseAuthRecovery(), []);
  return null;
}
