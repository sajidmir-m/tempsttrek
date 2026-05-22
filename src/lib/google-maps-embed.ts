import { SITE_CONTACT } from '@/lib/site-contact';

/** Public Google Maps / Business Profile page (reviews open here). */
export function getGoogleMapsPageUrl(): string {
  const url = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL?.trim();
  if (url && !url.includes('...')) return url;
  return SITE_CONTACT.googleMapsUrl;
}

/** Optional direct Maps embed iframe `src` from Google “Embed a map”. */
export function getGoogleMapsEmbedUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();
  return url && !url.includes('...') ? url : null;
}

function extractMapsPlaceQuery(pageUrl: string): string {
  try {
    const u = new URL(pageUrl);
    const ftid = u.searchParams.get('ftid');
    if (ftid) return ftid;
    const q = u.searchParams.get('q');
    if (q) return q;
    const placeMatch = u.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch?.[1]) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
  } catch {
    /* fall through */
  }
  return pageUrl;
}

/**
 * Resolve iframe src for office map on Contact.
 * Prefers explicit embed URL, then derives from page URL, then address search.
 */
export function resolveGoogleMapsEmbedSrc(): string {
  const embed = getGoogleMapsEmbedUrl();
  if (embed) return embed;

  const pageUrl = getGoogleMapsPageUrl();
  if (pageUrl.includes('google.com/maps/embed')) return pageUrl;

  const query = extractMapsPlaceQuery(pageUrl);
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=16&output=embed`;
}

/** Link for “Read reviews on Google” (Business Profile). */
export function resolveGoogleMapsReviewsUrl(): string {
  return getGoogleMapsPageUrl();
}
