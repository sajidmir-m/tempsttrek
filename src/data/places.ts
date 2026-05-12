export type PlaceSlug =
  | "srinagar"
  | "gulmarg"
  | "pahalgam"
  | "sonmarg"
  | "doodhpathri"
  | "gurez-valley";

export interface PlaceActivity {
  title: string;
  timeNeeded?: string; // e.g. "1–2 Hours", "Half Day"
  bestFor?: string; // e.g. "Families, Couples"
  notes?: string;
}

export interface PlaceRoutePlan {
  title: string; // e.g. "Srinagar → Gulmarg (Day Trip)"
  type?: "day-trip" | "multi-day" | "transfer";
  duration?: string; // e.g. "Full Day"
  approxDistance?: string; // e.g. "~50 km one way"
  bestTime?: string;
  routeStops: string[]; // badge-style stops
  notes?: string;
}

export interface HowToReach {
  byAir?: string;
  byRoad?: string;
  byRail?: string;
  localTransport?: string;
}

export interface Place {
  slug: PlaceSlug;
  name: string;
  tag: string;
  location?: string;
  description: string;
  highlights: string[];
  bestTime: string;
  idealStay: string;
  heroImage?: string;
  gallery?: { url: string; caption?: string }[];
  activities: PlaceActivity[];
  routePlans: PlaceRoutePlan[];
  howToReach: HowToReach;
  localTips: string[];
  nearbyPlaces: { name: string; minutes?: string; notes?: string }[];
}

export const PLACES: Place[] = [
  {
    slug: "srinagar",
    name: "Srinagar",
    tag: "City of Lakes & Gardens",
    location: "Dal Lake, Nigeen Lake, Mughal Gardens",
    description:
      "Stay on iconic houseboats at Dal Lake, stroll through Mughal Gardens, and explore the old city's markets and shrines.",
    highlights: ["Dal Lake & Nigeen Lake", "Shikara Ride", "Mughal Gardens", "Old City & Markets"],
    bestTime: "March – November",
    idealStay: "2–3 Nights",
    activities: [
      { title: "Shikara ride on Dal Lake", timeNeeded: "1–2 Hours", bestFor: "Families, Couples", notes: "Sunset rides are the most scenic." },
      { title: "Houseboat stay experience", timeNeeded: "1 Night", bestFor: "Couples, Families", notes: "Choose Dal Lake for vibe, Nigeen for calmer stays." },
      { title: "Mughal Gardens visit", timeNeeded: "2–3 Hours", bestFor: "All travellers", notes: "Nishat & Shalimar are the top picks." },
      { title: "Old city & market walk", timeNeeded: "2–3 Hours", bestFor: "Food lovers, shoppers", notes: "Try local kehwa and traditional handicrafts." },
    ],
    routePlans: [
      {
        title: "Srinagar Local Sightseeing (City Tour)",
        type: "day-trip",
        duration: "Full Day",
        routeStops: ["Mughal Gardens", "Shankaracharya Temple", "Dal Lake", "Old City / Shopping"],
        notes: "Best for first-time visitors. Start early to avoid traffic in peak season.",
      },
      {
        title: "Srinagar → Gulmarg (Day Trip)",
        type: "day-trip",
        duration: "Full Day",
        approxDistance: "~50 km one way",
        routeStops: ["Tangmarg", "Gulmarg Meadows", "Gondola (optional)", "Back to Srinagar"],
      },
      {
        title: "Srinagar → Sonmarg (Day Trip)",
        type: "day-trip",
        duration: "Full Day",
        approxDistance: "~80 km one way",
        routeStops: ["Ganderbal", "Sindh River Views", "Sonmarg", "Back to Srinagar"],
      },
      {
        title: "Srinagar → Pahalgam (Transfer + Stops)",
        type: "transfer",
        duration: "5–6 Hours",
        routeStops: ["Pampore (Saffron)", "Awantipora Ruins", "Apple Orchards (seasonal)", "Pahalgam"],
      },
    ],
    howToReach: {
      byAir: "Srinagar International Airport (SXR) is the main entry point. We can arrange airport pickup.",
      byRoad: "Well-connected by road from Jammu. Travel time varies by weather and traffic.",
      byRail: "Nearest major railway connectivity is via Jammu Tawi (then road transfer).",
      localTransport: "Private cab is the most comfortable option for sightseeing and transfers.",
    },
    localTips: [
      "Keep a light jacket even in summer evenings near lakes.",
      "For shikara prices, confirm duration and inclusions before starting.",
      "Friday afternoons can be busy near old city—plan gardens/markets accordingly.",
      "Carry some cash for small vendors and local snacks.",
    ],
    nearbyPlaces: [
      { name: "Dal Lake", minutes: "10–20 min", notes: "Shikara + houseboats" },
      { name: "Mughal Gardens", minutes: "20–40 min", notes: "Best in spring/summer" },
      { name: "Doodhpathri", minutes: "2–3 hrs", notes: "Great day trip" },
      { name: "Gulmarg", minutes: "2–2.5 hrs", notes: "Snow/meadows" },
    ],
  },
  {
    slug: "gulmarg",
    name: "Gulmarg",
    tag: "Meadow of Flowers",
    location: "Gondola, Ski Slopes, Meadows",
    description:
      "Perfect for snow lovers and adventure seekers. Enjoy Gondola rides, skiing, and stunning meadows in summer.",
    highlights: ["Gulmarg Gondola", "Kongdoori & Apharwat", "Skiing & Snow Activities", "Golf Course"],
    bestTime: "December – March (snow), April – October (meadows)",
    idealStay: "1–2 Nights",
    activities: [
      { title: "Gulmarg Gondola ride", timeNeeded: "2–4 Hours", bestFor: "All travellers", notes: "Tickets can sell out in peak season." },
      { title: "Snow activities (winter)", timeNeeded: "Half Day", bestFor: "Families, Adventure", notes: "Sledging, snow bikes, beginner ski options." },
      { title: "Meadow walks & viewpoints (summer)", timeNeeded: "2–3 Hours", bestFor: "Nature lovers", notes: "Carry water and sun protection." },
      { title: "Gulmarg Golf Course (seasonal)", timeNeeded: "2–3 Hours", bestFor: "Leisure travellers", notes: "One of the highest golf courses in the world." },
    ],
    routePlans: [
      {
        title: "Srinagar → Gulmarg → Srinagar",
        type: "day-trip",
        duration: "Full Day",
        approxDistance: "~50 km one way",
        routeStops: ["Srinagar", "Tangmarg", "Gulmarg", "Back to Srinagar"],
        notes: "In snowfall, road conditions can slow the trip—start early.",
      },
      {
        title: "Gulmarg 1 Night Stay Plan",
        type: "multi-day",
        duration: "2 Days / 1 Night",
        routeStops: ["Day 1: Arrival + Meadows", "Day 2: Gondola + Return"],
        notes: "Best for relaxed experience without rushing.",
      },
    ],
    howToReach: {
      byAir: "Fly to Srinagar (SXR), then 2–2.5 hours drive to Gulmarg.",
      byRoad: "Drive via Tangmarg. In winters, allow extra time for snow traffic.",
      localTransport: "Private cab recommended. Local taxi union rules may apply for certain inner areas.",
    },
    localTips: [
      "Wear waterproof shoes in winter; snow can be slushy by afternoon.",
      "Keep ID proof for Gondola tickets (sometimes required).",
      "If you want Phase 2 (Apharwat), check weather/visibility before booking.",
    ],
    nearbyPlaces: [
      { name: "Tangmarg", minutes: "20–30 min", notes: "Base town for Gulmarg" },
      { name: "Drung Waterfall", minutes: "40–60 min", notes: "Great photo stop" },
      { name: "Srinagar", minutes: "2–2.5 hrs", notes: "Main hub for hotels/airport" },
    ],
  },
  {
    slug: "pahalgam",
    name: "Pahalgam",
    tag: "Valley of Shepherds",
    location: "Betaab Valley, Aru Valley, Lidder River",
    description:
      "A serene valley with rivers, pine forests, and beautiful viewpoints. Great for families and honeymooners.",
    highlights: ["Betaab Valley", "Aru Valley", "Chandanwari", "Lidder River"],
    bestTime: "April – October",
    idealStay: "2–3 Nights",
    activities: [
      { title: "Aru Valley visit", timeNeeded: "2–3 Hours", bestFor: "Families, Couples", notes: "Great for gentle walks and photo points." },
      { title: "Betaab Valley visit", timeNeeded: "2–3 Hours", bestFor: "All travellers", notes: "Entry fee applies. Best in morning." },
      { title: "Lidder River riverside walk", timeNeeded: "1–2 Hours", bestFor: "Relaxation", notes: "Perfect for evening strolls." },
      { title: "Chandanwari / seasonal routes", timeNeeded: "Half Day", bestFor: "Scenic drive", notes: "Road access depends on season/weather." },
    ],
    routePlans: [
      {
        title: "Srinagar → Pahalgam (Transfer + Stops)",
        type: "transfer",
        duration: "5–6 Hours",
        routeStops: ["Pampore (Saffron)", "Awantipora Ruins", "Pahalgam"],
      },
      {
        title: "Pahalgam Local (Aru + Betaab)",
        type: "day-trip",
        duration: "Half/Full Day",
        routeStops: ["Aru Valley", "Betaab Valley", "Local Market"],
        notes: "Local taxi union vehicles may be required for inner sightseeing.",
      },
    ],
    howToReach: {
      byAir: "Fly to Srinagar (SXR), then drive ~4–5 hours to Pahalgam.",
      byRoad: "Well-connected from Srinagar via Anantnag. Scenic route.",
      localTransport: "For valleys like Aru/Betaab, local union taxis may operate. We coordinate it for you.",
    },
    localTips: [
      "Carry light rain protection — weather can change quickly.",
      "Start sightseeing early to avoid crowd at popular valleys.",
      "Keep comfortable walking shoes for riverside and meadow walks.",
    ],
    nearbyPlaces: [
      { name: "Aru Valley", minutes: "30–45 min", notes: "Meadows and viewpoints" },
      { name: "Betaab Valley", minutes: "20–30 min", notes: "Iconic valley scenery" },
      { name: "Anantnag", minutes: "1.5–2 hrs", notes: "Town on the way to Srinagar" },
    ],
  },
  {
    slug: "sonmarg",
    name: "Sonmarg",
    tag: "Meadow of Gold",
    location: "Thajiwas Glacier, Sindh River",
    description:
      "Dramatic mountain scenery, glaciers, and river valleys. Ideal for day trips and scenic drives.",
    highlights: ["Thajiwas Glacier", "River Rafting (seasonal)", "Zoji La Viewpoints"],
    bestTime: "April – October",
    idealStay: "1 Night / Day Trip",
    activities: [
      { title: "Thajiwas Glacier excursion", timeNeeded: "3–5 Hours", bestFor: "Families, Couples", notes: "Often involves pony ride / walk depending on season." },
      { title: "Sindh river photo stops", timeNeeded: "1–2 Hours", bestFor: "Photographers", notes: "Best light is morning/late afternoon." },
      { title: "River rafting (seasonal)", timeNeeded: "1–2 Hours", bestFor: "Adventure", notes: "Available in summer depending on water levels." },
      { title: "Zoji La viewpoints (seasonal)", timeNeeded: "Half Day", bestFor: "Scenic drive lovers", notes: "Route depends on road opening." },
    ],
    routePlans: [
      {
        title: "Srinagar → Sonmarg → Srinagar",
        type: "day-trip",
        duration: "Full Day",
        approxDistance: "~80 km one way",
        routeStops: ["Ganderbal", "Sindh River Views", "Sonmarg", "Back to Srinagar"],
        notes: "Start early for relaxed Thajiwas visit and return before dark.",
      },
    ],
    howToReach: {
      byAir: "Fly to Srinagar (SXR), then drive ~2.5–3 hours to Sonmarg.",
      byRoad: "Drive via Ganderbal. Road closure can happen in winter due to snow.",
      localTransport: "Private cab is recommended. In peak season, plan for traffic.",
    },
    localTips: [
      "Carry a warm layer even in summer; glacier areas can feel cold.",
      "For Thajiwas, confirm pricing for pony/guide before starting.",
      "Keep snacks and water — options can be limited at certain stretches.",
    ],
    nearbyPlaces: [
      { name: "Thajiwas Glacier", minutes: "20–40 min", notes: "Main attraction" },
      { name: "Ganderbal", minutes: "1.5–2 hrs", notes: "Enroute stop" },
    ],
  },
  {
    slug: "doodhpathri",
    name: "Doodhpathri",
    tag: "Hidden Green Paradise",
    location: "Meadows & Pine Forests",
    description:
      "Rolling meadows, pine forests, and rivers – a less crowded gem ideal for picnics and peaceful day trips.",
    highlights: ["Meadows & Pine Forests", "Streams & Picnic Spots"],
    bestTime: "April – October",
    idealStay: "Day Trip",
    activities: [
      { title: "Meadow picnic & leisure time", timeNeeded: "Half Day", bestFor: "Families", notes: "Carry a mat and light snacks." },
      { title: "Pine forest walks", timeNeeded: "1–2 Hours", bestFor: "Nature lovers", notes: "Great for calm, easy walking trails." },
      { title: "Photography spots near streams", timeNeeded: "1–2 Hours", bestFor: "Photographers", notes: "Golden hour looks amazing here." },
    ],
    routePlans: [
      {
        title: "Srinagar → Doodhpathri → Srinagar",
        type: "day-trip",
        duration: "Full Day",
        routeStops: ["Srinagar", "Budgam", "Doodhpathri Meadows", "Back to Srinagar"],
        notes: "A perfect quiet alternative to crowded tourist spots.",
      },
    ],
    howToReach: {
      byAir: "Fly to Srinagar (SXR), then drive ~2–3 hours to Doodhpathri.",
      byRoad: "Best visited as a day trip from Srinagar.",
      localTransport: "Private cab recommended for comfort and flexibility.",
    },
    localTips: [
      "Mobile network can be weak in some parts — plan accordingly.",
      "Avoid littering; keep a small bag for waste.",
      "Carry light jacket; weather can change quickly in meadows.",
    ],
    nearbyPlaces: [
      { name: "Budgam", minutes: "1–1.5 hrs", notes: "Enroute" },
      { name: "Srinagar", minutes: "2–3 hrs", notes: "Main hub" },
    ],
  },
  {
    slug: "gurez-valley",
    name: "Gurez Valley",
    tag: "Offbeat Mountain Escape",
    location: "Habba Khatoon Peak, Kishanganga River",
    description:
      "A high-altitude valley near the Line of Control, now opening up for tourism. Perfect for explorers and photographers.",
    highlights: ["Habba Khatoon Peak", "Kishanganga River", "Traditional Wooden Homes"],
    bestTime: "May – September",
    idealStay: "2–3 Nights",
    activities: [
      { title: "Habba Khatoon viewpoint", timeNeeded: "1–2 Hours", bestFor: "Photographers", notes: "Early morning offers best light." },
      { title: "Kishanganga riverside time", timeNeeded: "1–2 Hours", bestFor: "Nature lovers", notes: "Peaceful spots for sitting and photos." },
      { title: "Village walk & culture", timeNeeded: "2–3 Hours", bestFor: "Explorers", notes: "Respect local customs and privacy." },
    ],
    routePlans: [
      {
        title: "Srinagar → Gurez Valley (2N/3D Suggested)",
        type: "multi-day",
        duration: "3 Days / 2 Nights",
        routeStops: ["Day 1: Srinagar → Bandipora → Gurez", "Day 2: Local sightseeing", "Day 3: Return to Srinagar"],
        notes: "Road and permits/ID checks can apply—carry valid ID proof.",
      },
    ],
    howToReach: {
      byAir: "Fly to Srinagar (SXR). Gurez is reached by road via Bandipora.",
      byRoad: "Road opens seasonally (mostly summer). Travel time varies by conditions.",
      localTransport: "Private cab recommended for comfort and flexibility.",
    },
    localTips: [
      "Carry ID proof for checkpoints.",
      "Pack warm clothes—nights can be cold even in summer.",
      "Book stays in advance; options are limited compared to Srinagar.",
    ],
    nearbyPlaces: [
      { name: "Bandipora", minutes: "2–3 hrs", notes: "Enroute base town" },
      { name: "Habba Khatoon Peak", minutes: "20–40 min", notes: "Iconic viewpoint" },
    ],
  },
];

export const normalizePlaceSlug = (slug: string) =>
  decodeURIComponent(slug).toLowerCase().trim();

export const getPlaceBySlug = (slug: string): Place | undefined => {
  const normalized = normalizePlaceSlug(slug);
  return PLACES.find((p) => p.slug === normalized);
};


