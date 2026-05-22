import { ledgerCategoryErrorMessage } from '@/lib/crm-catalog';

/** Turn raw PostgREST / Postgres errors into staff-friendly messages. */
export function friendlyCrmError(error: unknown, context?: string): string {
  const msg =
    error && typeof error === 'object' && 'message' in error && typeof (error as { message: string }).message === 'string'
      ? (error as { message: string }).message
      : error instanceof Error
        ? error.message
        : 'Something went wrong';

  if (msg.includes('crm_trip_ledger_items_category_check') || msg.includes('crm_expenses_category_check')) {
    return ledgerCategoryErrorMessage();
  }
  if (msg.includes('category_check')) {
    return 'Invalid category selected. Please pick a value from the list.';
  }
  if (msg.includes('duplicate key') || msg.includes('unique')) {
    return 'This record already exists (duplicate ID or number).';
  }
  if (msg.includes('violates row-level security')) {
    return 'You do not have permission for this action. Sign in as admin or employee.';
  }
  if (context) return `${context}: ${msg}`;
  return msg;
}
