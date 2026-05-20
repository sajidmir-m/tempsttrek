/** Canonical production origin (no trailing slash). */
export const PRODUCTION_SITE_URL = 'https://www.tempesttreks.in';

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, '');
}

/** True for localhost, loopback, and other non-public hosts unsuitable for sitemaps/SEO. */
export function isLocalSiteUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local')
    );
  } catch {
    return true;
  }
}

/** Site origin for metadata, sitemap, robots, and structured data. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const configured = raw ? normalizeOrigin(raw) : null;

  // Production must never emit localhost in sitemap, robots, or OG tags.
  if (process.env.NODE_ENV === 'production') {
    if (!configured || isLocalSiteUrl(configured)) {
      return PRODUCTION_SITE_URL;
    }
    return configured;
  }

  if (configured) return configured;
  return 'http://localhost:3000';
}
