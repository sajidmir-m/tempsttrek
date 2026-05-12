/**
 * Optional layered hero backgrounds (CSS `url()`). Keep this list short and
 * limited to files that exist under `public/` to avoid 404s and slow paints.
 * Empty = gradient-only hero (fastest).
 */
export const SITE_HERO_LAYER_PATHS = [] as const;

export function siteHeroLayerUrls(): string[] {
  return SITE_HERO_LAYER_PATHS.map((p) => encodeURI(p));
}
