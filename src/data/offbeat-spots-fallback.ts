export type OffbeatSpotFallback = {
  id: string;
  type: 'trek' | 'hidden_place';
  name: string;
  slug: string | null;
  region: string | null;
  difficulty: string | null;
  best_season: string | null;
  duration: string | null;
  altitude: string | null;
  description: string | null;
  detail_body: string | null;
  hero_image: string | null;
  is_featured: boolean | null;
};

export const FALLBACK_OFFBEAT_TREKS: OffbeatSpotFallback[] = [
  {
    id: 'fallback-trek-1',
    type: 'trek',
    name: 'Tarsar Marsar Trek',
    slug: null,
    region: 'Anantnag',
    difficulty: 'Moderate',
    best_season: 'Jul - Sep',
    duration: '7 Days',
    altitude: '~ 4,000m',
    description: 'Twin alpine lakes trek with unreal meadows and campsites.',
    detail_body: null,
    hero_image: '/videos/adventure-1.png',
    is_featured: true,
  },
  {
    id: 'fallback-trek-2',
    type: 'trek',
    name: 'Kolahoi Glacier Trek',
    slug: null,
    region: 'Pahalgam',
    difficulty: 'Challenging',
    best_season: 'Jun - Sep',
    duration: '5 Days',
    altitude: '~ 4,700m',
    description: 'Classic Kashmir glacier trek for serious hikers.',
    detail_body: null,
    hero_image: '/videos/adventure-2.png',
    is_featured: true,
  },
  {
    id: 'fallback-trek-3',
    type: 'trek',
    name: 'Gurez Tulail Trail',
    slug: null,
    region: 'Gurez Valley',
    difficulty: 'Moderate',
    best_season: 'Jun - Oct',
    duration: '3–5 Days',
    altitude: '~ 3,000m',
    description: 'Hidden routes in Gurez with river views and wooden villages.',
    detail_body: null,
    hero_image: '/videos/adventure-2.png',
    is_featured: false,
  },
];

export const FALLBACK_OFFBEAT_HIDDEN: OffbeatSpotFallback[] = [
  {
    id: 'fallback-hidden-1',
    type: 'hidden_place',
    name: 'Bangus Valley',
    slug: null,
    region: 'Kupwara',
    difficulty: 'Easy',
    best_season: 'May - Oct',
    duration: null,
    altitude: null,
    description: 'Wide grasslands, pine forests, and minimal crowds.',
    detail_body: null,
    hero_image: '/videos/adventure-1.png',
    is_featured: true,
  },
  {
    id: 'fallback-hidden-2',
    type: 'hidden_place',
    name: 'Doodhpathri Meadows',
    slug: null,
    region: 'Budgam',
    difficulty: 'Easy',
    best_season: 'Apr - Oct',
    duration: null,
    altitude: null,
    description: 'Green valleys and milky streams—perfect for spring picnics.',
    detail_body: null,
    hero_image: '/videos/adventure-2.png',
    is_featured: true,
  },
  {
    id: 'fallback-hidden-3',
    type: 'hidden_place',
    name: 'Aharbal Waterfall',
    slug: null,
    region: 'Kulgam',
    difficulty: 'Easy',
    best_season: 'Apr - Oct',
    duration: null,
    altitude: null,
    description: 'Powerful waterfall with forest roads and quiet viewpoints.',
    detail_body: null,
    hero_image: '/videos/adventure-1.png',
    is_featured: false,
  },
];

export const FALLBACK_OFFBEAT_ALL: OffbeatSpotFallback[] = [...FALLBACK_OFFBEAT_TREKS, ...FALLBACK_OFFBEAT_HIDDEN];
