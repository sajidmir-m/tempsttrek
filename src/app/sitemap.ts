import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { PLACES } from '@/data/places';
import { offbeatSpotPath } from '@/lib/offbeat-slug';
import { getSiteUrl } from '@/lib/site-url';

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  opts: {
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
    lastModified?: Date | string;
  }
): SitemapEntry {
  const baseUrl = getSiteUrl();
  const loc = path === '/' ? baseUrl : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    url: loc,
    lastModified: opts.lastModified ? new Date(opts.lastModified) : new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: Array<{
    path: string;
    changeFrequency: SitemapEntry['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/packages', changeFrequency: 'daily', priority: 0.9 },
    { path: '/places', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/offbeat', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/cabs', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/car-rental', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/social', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/refund-policy', changeFrequency: 'yearly', priority: 0.4 },
  ];

  const staticRoutes = staticPages.map((p) =>
    entry(p.path, { changeFrequency: p.changeFrequency, priority: p.priority })
  );

  const placeRoutes = PLACES.map((place) =>
    entry(`/places/${place.slug}`, {
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  );

  let packageRoutes: SitemapEntry[] = [];
  try {
    const { data } = await supabase.from('packages').select('slug, updated_at');
    if (data?.length) {
      packageRoutes = data.map((pkg) =>
        entry(`/packages/${pkg.slug}`, {
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: pkg.updated_at ?? undefined,
        })
      );
    }
  } catch (e) {
    console.error('[sitemap] packages:', e);
  }

  let offbeatRoutes: SitemapEntry[] = [];
  try {
    const { data } = await supabase.from('offbeat_spots').select('slug, name, updated_at');
    if (data?.length) {
      const seen = new Set<string>();
      offbeatRoutes = data
        .map((spot) => {
          const path = offbeatSpotPath(spot);
          if (seen.has(path)) return null;
          seen.add(path);
          return entry(path, {
            changeFrequency: 'weekly',
            priority: 0.75,
            lastModified: spot.updated_at ?? undefined,
          });
        })
        .filter((r): r is SitemapEntry => r != null);
    }
  } catch (e) {
    console.error('[sitemap] offbeat_spots:', e);
  }

  return [...staticRoutes, ...placeRoutes, ...packageRoutes, ...offbeatRoutes];
}
