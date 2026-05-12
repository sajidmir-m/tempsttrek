import { redirect } from 'next/navigation';

/** Employees sign in here; same UI as `/admin`, access controlled via `profiles.role = employee`. */
export default function StaffPortalRedirect() {
  redirect('/admin');
}
