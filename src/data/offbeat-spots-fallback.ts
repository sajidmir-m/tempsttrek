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

const TARSAR_DETAIL = `The Tarsar Marsar circuit is one of Kashmir’s most rewarding alpine treks: two high-altitude lakes linked by ridges and meadows that stay carpeted with wildflowers through monsoon.

Most teams start from Aru near Pahalgam, climbing through pine and birch into shepherd camps before the first big views open toward the Tarsar basin. Days are long but paced sensibly—altitude and weather, not ego, should set the rhythm.

Camping beside Tarsar and Marsar is the highlight: mirror-still water, snow patches on the passes, and quiet evenings away from road noise. After Marsar, routes descend through Lidder-side valleys back toward civilization.

Tempesttrek helps with realistic road access to trailheads, backup plans if rain closes a pass, and transport on either side of the trek so you are not juggling unreliable cabs at odd hours.`;

const KOLAHOI_DETAIL = `The Kolahoi Glacier sits above the Lidder Valley and rewards strong hikers with close-up ice and moraine scenery beneath the highest peak in the Kashmir Valley.

This is a serious mountain route: steep climbs, possible snow early or late season, and exposure to fast-changing weather. A fit group with prior Himalayan trekking experience will enjoy it most; first-timers should consider shorter acclimatisation walks first.

Typical approaches stage out of Pahalgam or nearby villages, with guides handling permits and camp logistics where required. We recommend building in buffer days in Srinagar or Pahalgam for weather holds.

We coordinate dependable vehicles for valley transfers, realistic day-zero timing from Srinagar airport, and clear communication on what gear and fitness level this trek expects.`;

const GUREZ_DETAIL = `Gurez and Tulail feel like Kashmir’s quiet north: wooden homes, the Kishanganga’s blue-green water, and ridges that look toward the Line of Control—peaceful for visitors, but sensitive on permits and routing.

Driving in from Bandipora is an experience in itself: switchbacks, forests, and sudden wide views. Once in Gurez, short walks, village tea stops, and riverside picnics fill two to five days without needing hardcore trekking boots.

Seasonal road closures and security checks can affect timing; we keep itineraries flexible and advise on ID documents and realistic night halts.

Tempesttrek arranges road transport with drivers who know the Bandipora–Gurez rhythm, suggests low-crowd viewpoints, and pairs Gurez with Srinagar or Sonmarg legs so your overall trip stays balanced.`;

const BANGUS_DETAIL = `Bangus is a wide high-altitude meadow ringed by forest—more “open sky picnic” than cliff-edge drama, which is exactly why locals love it when they want space and cool air without the Gulmarg crowds.

Access is typically a day trip from Kupwara or longer loops through the Lolab valley depending on road conditions and permissions of the season. Spring and early summer bring flowers; autumn turns the grass gold.

There is little commercial infrastructure at the meadow itself, so carry snacks, layers, and rain cover. Respect grazing communities and leave no trace.

We help with private cab timing (early starts beat afternoon cloud on the ridge), realistic expectations on walking distance from the last motorable point, and combining Bangus with Srinagar or Lolab for a fuller north-Kashmir story.`;

const DOODHPATHRI_DETAIL = `Doodhpathri—“valley of milk”—is a family-friendly day or overnight escape from Srinagar: rolling green slopes, pine woods, and shallow streams that look milky-grey against the grass.

The drive from Srinagar passes Budgam’s orchards and climbs into cooler air; pony rides and short ridge walks are optional. It suits couples, parents with kids, and anyone who wants mountain scenery without multi-day trekking.

Weekends can be busy; weekday visits or early arrivals keep the experience calmer. Monsoon months mean mist and mud—beautiful, but slower driving.

Book a cab with us for fixed pricing, a driver who knows the parking and walking entry points, and optional add-ons like picnic setups or a second stop (e.g. Yusmarg) if you want a longer day on the road.`;

const AHARBAL_DETAIL = `Aharbal is Kashmir’s most photogenic waterfall: the Veshu River drops in a single powerful sheet into a gorge, with forested walks and viewpoints above and below the main fall.

It works brilliantly as a half-day or full-day outing from Srinagar with Kulgam district’s orchard roads en route. Paths can be slippery; sturdy shoes beat sandals.

Combine Aharbal with a village lunch or a quiet riverside stretch away from the main viewpoint if you want more than a “park, selfie, leave” visit.

Tempesttrek schedules sensible driving times, suggests less crowded time slots, and can chain Aharbal with Shopian apple country or a return via different villages so the drive feels like part of the tour, not just transit.`;

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
    detail_body: TARSAR_DETAIL,
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
    detail_body: KOLAHOI_DETAIL,
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
    detail_body: GUREZ_DETAIL,
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
    detail_body: BANGUS_DETAIL,
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
    detail_body: DOODHPATHRI_DETAIL,
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
    detail_body: AHARBAL_DETAIL,
    hero_image: '/videos/adventure-1.png',
    is_featured: false,
  },
];

export const FALLBACK_OFFBEAT_ALL: OffbeatSpotFallback[] = [...FALLBACK_OFFBEAT_TREKS, ...FALLBACK_OFFBEAT_HIDDEN];
