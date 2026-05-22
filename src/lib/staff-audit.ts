import type { createSupabaseAdmin } from '@/lib/supabase-admin';

export type StaffAuditAction =
  | 'staff_created'
  | 'staff_invited'
  | 'role_changed'
  | 'deactivated'
  | 'reactivated';

export async function logStaffAudit(
  admin: ReturnType<typeof createSupabaseAdmin>,
  entry: {
    actorId: string;
    actorEmail: string;
    targetUserId: string;
    targetEmail: string;
    action: StaffAuditAction;
    detail?: Record<string, unknown>;
  }
) {
  await admin.from('crm_staff_audit').insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    target_user_id: entry.targetUserId,
    target_email: entry.targetEmail,
    action: entry.action,
    detail: entry.detail || {},
  });
}
