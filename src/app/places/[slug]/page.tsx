import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Car, Info, MapPin, Route } from "lucide-react";
import { getPlaceBySlug, PLACES } from "@/data/places";
import { supabase } from "@/lib/supabase";

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PLACES.map((place) => ({ slug: place.slug }));
}

export const dynamicParams = true;

async function getSupabasePlace(slug: string) {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("id,name,slug,tag,location,description,highlights,best_time,ideal_stay,hero_image,is_featured")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch {
    return null;
  }
}

export default async function PlaceDetailPage({ params }: PlacePageProps) {
  const { slug } = await params;
  const staticPlace = getPlaceBySlug(slug);
  const dbPlace = await getSupabasePlace(slug);

  const place: any = {
    ...(staticPlace || {}),
    ...(dbPlace || {}),
    // normalize names for existing UI
    bestTime: dbPlace?.best_time ?? staticPlace?.bestTime,
    idealStay: dbPlace?.ideal_stay ?? staticPlace?.idealStay,
    heroImage: dbPlace?.hero_image ?? staticPlace?.heroImage,
    routePlans: staticPlace?.routePlans ?? [],
    activities: staticPlace?.activities ?? [],
    howToReach: staticPlace?.howToReach ?? {},
    localTips: staticPlace?.localTips ?? [],
    nearbyPlaces: staticPlace?.nearbyPlaces ?? [],
  };

  if (!staticPlace && !dbPlace) {
    return notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-16">
      <section className="px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-700">
            <Link href="/places" className="hover:text-teal-700">
              Places
            </Link>{" "}
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">{place.name}</span>
          </div>

          {/* Hero */}
          <ScrollReveal width="100%">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-56 sm:h-72 md:h-80 bg-gradient-to-r from-teal-700 to-emerald-500">
                {place.heroImage && (
                  <Image
                    src={place.heroImage}
                    alt={place.name}
                    fill
                    className="object-cover opacity-85"
                  />
                )}
                <div className="relative h-full w-full bg-black/30 flex items-end">
                  <div className="p-6 sm:p-8 text-white max-w-2xl">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-teal-100">
                      <MapPin size={18} />
                      <span>{place.location || "Kashmir"}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{place.name}</h1>
                    <p className="mt-2 text-sm sm:text-base text-teal-50">{place.tag}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm">
                      <span className="px-3 py-1 rounded-full bg-white/15 border border-white/30">
                        Best time: {place.bestTime}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/15 border border-white/30">
                        Ideal stay: {place.idealStay}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
            {/* Left: description + highlights + new sections */}
            <ScrollReveal width="100%">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    Why Visit {place.name}?
                  </h2>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    {place.description}
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    Highlights & Experiences
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(place.highlights || []).map((h: string) => (
                      <span
                        key={h}
                        className="px-3 py-1 text-xs sm:text-sm rounded-full bg-gray-50 text-gray-700 border border-gray-200"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                {place.activities?.length ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                      Top Activities in {place.name}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {place.activities.map((a: any) => (
                        <div key={a.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <p className="font-semibold text-gray-900">{a.title}</p>
                          <div className="mt-2 text-xs text-gray-800 space-y-1">
                            {a.timeNeeded && (
                              <p>
                                <span className="font-semibold">Time:</span> {a.timeNeeded}
                              </p>
                            )}
                            {a.bestFor && (
                              <p>
                                <span className="font-semibold">Best for:</span> {a.bestFor}
                              </p>
                            )}
                            {a.notes && <p className="text-gray-700">{a.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Routes / Plans */}
                {place.routePlans?.length ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Route size={18} className="text-teal-600" />
                      Suggested Routes & Plans
                    </h2>
                    <span className="text-xs text-gray-700">
                      We can customize routes based on your dates and season.
                    </span>
                  </div>
                  <div className="space-y-4">
                    {place.routePlans.map((r: any) => (
                      <div key={r.title} className="rounded-2xl border border-gray-100 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-gray-900">{r.title}</p>
                            <p className="text-xs text-gray-700 mt-1">
                              {r.type ? r.type.replace("-", " ") : "route"}
                              {r.duration ? ` • ${r.duration}` : ""}
                              {r.approxDistance ? ` • ${r.approxDistance}` : ""}
                              {r.bestTime ? ` • Best: ${r.bestTime}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-xs font-semibold">
                            {r.type === "multi-day" ? "Multi Day" : r.type === "transfer" ? "Transfer" : "Day Trip"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.routeStops.map((s: string) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 text-[11px] rounded-full bg-gray-50 text-gray-700 border border-gray-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        {r.notes && <p className="text-sm text-gray-800 mt-3">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                ) : null}

                {/* How to reach */}
                {place.howToReach && (place.howToReach.byAir || place.howToReach.byRoad || place.howToReach.byRail || place.howToReach.localTransport) ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    How to Reach {place.name}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {place.howToReach.byAir && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="font-semibold text-gray-900">By Air</p>
                        <p className="text-sm text-gray-800 mt-1">{place.howToReach.byAir}</p>
                      </div>
                    )}
                    {place.howToReach.byRoad && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="font-semibold text-gray-900">By Road</p>
                        <p className="text-sm text-gray-800 mt-1">{place.howToReach.byRoad}</p>
                      </div>
                    )}
                    {place.howToReach.byRail && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="font-semibold text-gray-900">By Rail</p>
                        <p className="text-sm text-gray-800 mt-1">{place.howToReach.byRail}</p>
                      </div>
                    )}
                    {place.howToReach.localTransport && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="font-semibold text-gray-900">Local Transport</p>
                        <p className="text-sm text-gray-800 mt-1">{place.howToReach.localTransport}</p>
                      </div>
                    )}
                  </div>
                </div>
                ) : null}

                {/* Tips + Nearby */}
                {(place.localTips?.length || place.nearbyPlaces?.length) ? (
                  <div className="grid gap-6 md:grid-cols-2">
                  {place.localTips?.length ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info size={18} className="text-teal-600" />
                      Local Tips
                    </h2>
                    <ul className="space-y-2 text-sm text-gray-800">
                      {place.localTips.map((t: string) => (
                        <li key={t} className="flex gap-2">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  ) : null}

                  {place.nearbyPlaces?.length ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin size={18} className="text-teal-600" />
                      Nearby Places
                    </h2>
                    <div className="space-y-3">
                      {place.nearbyPlaces.map((n: any) => (
                        <div key={n.name} className="rounded-xl border border-gray-100 p-4">
                          <p className="font-semibold text-gray-900">{n.name}</p>
                          <p className="text-xs text-gray-700 mt-1">
                            {n.minutes ? `${n.minutes} • ` : ""}
                            {n.notes || "Great add-on to your itinerary"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  ) : null}
                </div>
                ) : null}
              </div>
            </ScrollReveal>

            {/* Right: CTA */}
            <ScrollReveal width="100%" delay={0.1}>
              <aside className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Plan {place.name} with Tempesttrek
                  </h3>
                  <p className="text-sm text-gray-800 mb-4">
                    Tell us your dates and travel style. We&apos;ll suggest the best packages and cab
                    options that include {place.name}.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/packages"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                    >
                      View Tour Packages
                    </Link>
                    <Link
                      href="/cabs"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-teal-700 text-sm font-semibold border border-teal-200 hover:bg-teal-50 transition-colors"
                    >
                      Explore Cab Options
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
                    >
                      Talk to a Travel Expert
                    </Link>
                  </div>
                </div>

                <div className="bg-teal-600 rounded-2xl p-5 sm:p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Car size={18} />
                    <h3 className="text-lg font-bold">Cab & Route Help</h3>
                  </div>
                  <p className="text-sm text-teal-50 mb-4">
                    Want this place added into your tour route? We&apos;ll plan the cab route, timing and
                    stop points based on season.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-white text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors"
                  >
                    Get Custom Route Plan
                  </Link>
                </div>
              </aside>
            </ScrollReveal>
          </div>

          {/* Gallery */}
          {place.gallery && place.gallery.length > 0 && (
            <ScrollReveal width="100%" delay={0.15}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {place.name} Photo Gallery
                  </h2>
                  <span className="text-xs text-gray-700 hidden sm:inline">
                    You can replace these with your own images later.
                  </span>
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">
                  {place.gallery.map((img: { url: string; caption?: string }) => (
                    <div
                      key={img.url}
                      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={img.url}
                        alt={img.caption || place.name}
                        fill
                        className="object-cover"
                      />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-[11px] sm:text-xs text-white line-clamp-2">
                            {img.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}


