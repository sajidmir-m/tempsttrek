/** Canonical production origin (no trailing slash). */
export const PRODUCTION_SITE_URL = 'https://www.tempesttreks.in';

/** Site origin for metadata, sitemap, robots, and structured data. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return PRODUCTION_SITE_URL;
}
