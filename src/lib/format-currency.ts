/** Stable INR formatting for SSR + client (avoids locale-based hydration mismatches). */
export function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
