export type PortalRole = 'admin' | 'employee';

/** Aligns with /admin: employee → staff; otherwise portal admin (including missing role). */
export function resolvePortalRole(role: string | null | undefined): PortalRole {
  return (role || '').toLowerCase() === 'employee' ? 'employee' : 'admin';
}
