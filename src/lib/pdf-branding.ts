/** Default hero background for itinerary & booking voucher PDFs */
export const DEFAULT_PDF_HERO_IMAGE = '/Lehladakh.jpeg';

export function resolvePdfHeroImage(customUrl?: string | null): string {
  const u = (customUrl || '').trim();
  if (u && u !== '/gem.png') return u;
  return DEFAULT_PDF_HERO_IMAGE;
}
