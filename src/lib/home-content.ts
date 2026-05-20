export type HeroSlide = { src: string; title: string; subtitle: string };

export type SplitPanel = {
  badge?: string;
  headline?: string;
  body?: string;
  image?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type SiteBrandingConfig = {
  logoUrl?: string;
  companyName?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhones?: string;
  contactAddress?: string;
  aboutText?: string;
};

export type HomeContentConfig = {
  heroSlides?: HeroSlide[];
  /** Keyed by place slug e.g. srinagar, gulmarg, pahalgam */
  featuredPlaces?: Record<string, { image?: string; name?: string; description?: string; tag?: string }>;
  splitPanels?: { left?: SplitPanel; right?: SplitPanel };
  branding?: SiteBrandingConfig;
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { src: '/Ladakh.jpeg', title: 'Kashmir', subtitle: 'Spring Meadows & Lakes' },
  { src: '/gulmarg.jpeg', title: 'Valleys', subtitle: 'In Full Bloom' },
];

export const DEFAULT_SPLIT_LEFT: SplitPanel = {
  badge: 'POPULAR',
  headline: 'Dal Lake Adventure',
  body:
    'Experience Dal Lake with Shikara rides, houseboats and mountain vistas—beautiful in spring and summer alike.',
  image: '/videos/adventure-1.png',
  bullets: ['Premium Cab Facilities', 'Experienced Local Drivers', '24/7 Support'],
  ctaLabel: 'Explore Tours →',
  ctaHref: '/packages',
};

export const DEFAULT_SPLIT_RIGHT: SplitPanel = {
  badge: 'RECOMMENDED',
  headline: 'Alpine meadows & escapes',
  body:
    'Greener ridges, picnics by the riverside and breezy alpine days—perfect for spring and autumn travel.',
  image: '/videos/adventure-2.png',
  bullets: ['Luxury SUV & Sedan Options', 'Well-Maintained Vehicles', 'Safe & Comfortable Travel'],
  ctaLabel: 'Plan getaway →',
  ctaHref: '/packages',
};

export const DEFAULT_HOME_CONTENT: HomeContentConfig = {
  heroSlides: DEFAULT_HERO_SLIDES,
};

export function mergeHomeContent(overrides: HomeContentConfig | null | undefined): HomeContentConfig {
  const o = overrides || {};
  return {
    heroSlides:
      Array.isArray(o.heroSlides) && o.heroSlides.length > 0 ? o.heroSlides : DEFAULT_HERO_SLIDES,
    featuredPlaces: o.featuredPlaces || {},
    splitPanels: {
      left: { ...DEFAULT_SPLIT_LEFT, ...o.splitPanels?.left },
      right: { ...DEFAULT_SPLIT_RIGHT, ...o.splitPanels?.right },
    },
    branding: o.branding || {},
  };
}

export function placeSlugKey(path: string) {
  const seg = path.replace(/^\//, '').split('/').filter(Boolean);
  return seg[seg.length - 1] || path;
}
