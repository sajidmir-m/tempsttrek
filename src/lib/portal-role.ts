export type PortalRole = 'admin' | 'employee';
export type StoredProfileRole = 'admin' | 'employee' | 'user' | string;

/** Aligns with /admin: employee → staff; otherwise portal admin (including missing role). */
export function resolvePortalRole(role: string | null | undefined): PortalRole {
  return (role || '').toLowerCase() === 'employee' ? 'employee' : 'admin';
}

export function normalizeStoredRole(role: string | null | undefined): StoredProfileRole {
  const r = (role || '').toLowerCase();
  if (r === 'admin' || r === 'employee' || r === 'user') return r;
  return r || 'user';
}

/** Label shown in admin user tables (raw DB value). */
export function formatProfileRoleLabel(role: string | null | undefined): string {
  const r = normalizeStoredRole(role);
  if (r === 'admin') return 'Admin';
  if (r === 'employee') return 'Employee';
  if (r === 'user') return 'User';
  return String(r);
}

export function profileRoleBadgeClass(role: string | null | undefined): string {
  const r = normalizeStoredRole(role);
  if (r === 'admin') return 'bg-purple-100 text-purple-800';
  if (r === 'employee') return 'bg-teal-100 text-teal-800';
  return 'bg-gray-100 text-gray-800';
}

/** True when the profiles.role column is explicitly admin. */
export function isStoredAdmin(role: string | null | undefined): boolean {
  return (role || '').toLowerCase() === 'admin';
}
