/** URL-safe slug for offbeat spot routes (matches DB slug when set). */
export function slugifyOffbeatName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function offbeatSpotPath(spot: { slug?: string | null; name: string }): string {
  const raw = (spot.slug || '').trim();
  const key = raw || slugifyOffbeatName(spot.name);
  return `/offbeat/${encodeURIComponent(key)}`;
}
