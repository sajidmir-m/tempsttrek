import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { PLACES } from "@/data/places";
import { firebaseClient } from "@/lib/firebase-client";

async function getPlaces() {
  try {
    const { data, error } = await firebaseClient
      .from("places")
      .select("id,name,slug,tag,location,description,highlights,best_time,ideal_stay,hero_image,is_featured")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch {
    // fallback below
  }

  // Fallback to local seed data
  return PLACES.map((p: any) => ({
    name: p.name,
    slug: p.slug,
    tag: p.tag,
    location: p.location,
    description: p.description,
    highlights: p.highlights,
    best_time: p.bestTime,
    ideal_stay: p.idealStay,
    hero_image: p.heroImage,
    is_featured: true,
  }));
}

export default async function PlacesPage() {
  const places = await getPlaces();

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="text-center mb-12">
              <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">
                Kashmir Destinations
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Places You&apos;ll Fall in Love With
              </h1>
              <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
              <p className="text-gray-800 mt-4 max-w-2xl mx-auto">
                From lakes and meadows to high mountain valleys, explore the most beautiful places in Kashmir
                and plan your perfect route.
              </p>
            </div>
          </ScrollReveal>

          {/* Places Grid */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {places.map((place: any, index: number) => (
              <ScrollReveal key={place.slug || place.name} delay={index * 0.1}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="relative h-44 bg-gradient-to-r from-teal-600 to-emerald-500 flex items-end p-4 text-white overflow-hidden">
                    {place.hero_image ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${place.hero_image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      </>
                    ) : null}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={18} />
                        <h2 className="text-lg font-bold">{place.name}</h2>
                      </div>
                      <p className="text-sm text-teal-100">{place.tag}</p>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-sm text-gray-800 mb-4">{place.description}</p>
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Highlights</p>
                      <div className="flex flex-wrap gap-2">
                        {(place.highlights || []).map((h: string) => (
                          <span
                            key={h}
                            className="px-2.5 py-1 text-[11px] rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-700">
                        <span>Best time: {place.best_time || place.bestTime}</span>
                        <span>Ideal stay: {place.ideal_stay || place.idealStay}</span>
                      </div>
                      <Link
                        href={`/places/${place.slug}`}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Explore {place.name}
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal width="100%" delay={0.3}>
            <div className="mt-16 bg-white rounded-2xl border border-teal-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confused Where to Start?</h2>
                <p className="text-gray-800">
                  Tell us your travel dates and preferences, and we&apos;ll design a custom Kashmir itinerary
                  covering the best places with perfect hotel and cab combinations.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                >
                  Browse Packages
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-700 text-sm font-semibold border border-teal-200 hover:bg-teal-50 transition-colors"
                >
                  Talk to an Expert
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}


