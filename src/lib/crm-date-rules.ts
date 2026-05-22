/** Travel/booking dates: today or future only. Ledger/invoices keep unrestricted past dates. */

export function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPastDate(ymd: string): boolean {
  if (!ymd) return false;
  return ymd < todayYmd();
}

export function validateTravelRange(
  start: string | null | undefined,
  end: string | null | undefined
): { ok: true } | { ok: false; message: string } {
  if (!start || !end) return { ok: true };
  if (isPastDate(start)) return { ok: false, message: 'Travel start cannot be in the past.' };
  if (isPastDate(end)) return { ok: false, message: 'Travel end cannot be in the past.' };
  if (end < start) return { ok: false, message: 'Travel end must be on or after travel start.' };
  return { ok: true };
}

export function validateTravelDate(ymd: string | null | undefined): { ok: true } | { ok: false; message: string } {
  if (!ymd) return { ok: true };
  if (isPastDate(ymd)) return { ok: false, message: 'Date cannot be in the past.' };
  return { ok: true };
}
