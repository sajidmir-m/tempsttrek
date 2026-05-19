import Hero from "@/components/ui/Hero";
import PackageCard from "@/components/ui/PackageCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ShieldCheck, Heart, Map, MapPin, Sun } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { fetchHomeContentFromDb } from "@/lib/fetch-home-content";
import { placeSlugKey } from "@/lib/home-content";

import { MOCK_PACKAGES } from "@/data/packages";
import { formatInr } from "@/lib/format-currency";

/** ISR: refresh homepage data periodically (faster TTFB than force-dynamic). */
export const revalidate = 60;

async function getPopularPackages() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_popular', true)
      .limit(3);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.log('Using fallback mock data');
  }

  // Fallback Mock Data
  return MOCK_PACKAGES.filter(pkg => pkg.is_popular).slice(0, 3);
}

async function getTestimonials() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.log('Using fallback mock testimonials');
  }

  // Fallback Mock Data
  return [
    {
      id: '1',
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      rating: 5,
      comment: 'Amazing experience! The team was very professional and the Kashmir trip exceeded all expectations.',
      is_approved: true
    },
    {
      id: '2',
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      comment: 'Best travel agency in Kashmir. They took care of everything and made our honeymoon unforgettable.',
      is_approved: true
    },
    {
      id: '3',
      name: 'Amit Patel',
      location: 'Ahmedabad',
      rating: 5,
      comment: 'Excellent service! The guides were knowledgeable and the hotels were top-notch. Highly recommended!',
      is_approved: true
    }
  ];
}

const features = [
  {
    icon: <ShieldCheck size={32} />,
    title: "Trusted & Safe",
    desc: "Your safety is our priority. We provide verified hotels and trusted drivers.",
  },
  {
    icon: <Heart size={32} />,
    title: "Best Hospitality",
    desc: "Experience the warm Kashmiri hospitality with our personalized service.",
  },
  {
    icon: <Map size={32} />,
    title: "Custom Itineraries",
    desc: "We craft tours that match your interests, budget, and time.",
  },
];

const featuredPlacesBase = [
  {
    name: "Srinagar & Dal Lake",
    slug: "/places/srinagar",
    tag: "Houseboats • Shikara • Old City",
    description:
      "Wake up on a traditional houseboat, glide through Dal Lake in a shikara and explore Mughal gardens and old Srinagar lanes.",
    bestTime: "All year • Peak: Mar – Nov",
    badge: "Most Booked",
    image: "/videos/adventure-2.png",
  },
  {
    name: "Gulmarg",
    slug: "/places/gulmarg",
    tag: "Snow • Gondola • Skiing",
    description:
      "Perfect for snow-lovers and honeymooners, with one of the highest cable cars in the world and breathtaking meadows.",
    bestTime: "Dec – Feb (Snow) • Apr – Jun (Meadows)",
    badge: "Winter Favourite",
    image: "/videos/adventure-1.png",
  },
  {
    name: "Pahalgam",
    slug: "/places/pahalgam",
    tag: "Rivers • Pine Forests • Valleys",
    description:
      "Crystal-clear rivers, pine forests and valleys like Betaab & Aru make Pahalgam perfect for families and nature lovers.",
    bestTime: "Mar – Oct",
    badge: "Family Friendly",
    image: "/videos/adventure-1.png",
  },
];

export default async function Home() {
  const [popularPackages, testimonials, homeCfg] = await Promise.all([
    getPopularPackages(),
    getTestimonials(),
    fetchHomeContentFromDb(),
  ]);

  const featuredPlaces = featuredPlacesBase.map((place) => {
    const key = placeSlugKey(place.slug);
    const ov = homeCfg.featuredPlaces?.[key];
    return {
      ...place,
      name: ov?.name ?? place.name,
      description: ov?.description ?? place.description,
      tag: ov?.tag ?? place.tag,
      image: ov?.image?.trim() ? ov.image.trim() : place.image,
    };
  });

  const splitL = homeCfg.splitPanels!.left!;
  const splitR = homeCfg.splitPanels!.right!;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <Hero heroSlides={homeCfg.heroSlides} />

      {/* Featured Places Strip */}
      <section className="py-14 px-4 bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-800">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-100">
                  Top Kashmir Destinations
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
                  Handpicked places our guests love the most
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/places"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/95 bg-white/10 border border-white/25 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <MapPin size={16} />
                  Explore all places
                </Link>
                <Link
                  href="/offbeat"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 bg-emerald-100 px-4 py-2 rounded-full hover:bg-white transition-colors"
                >
                  Off beat &amp; transport
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredPlaces.map((place, index) => (
              <ScrollReveal key={place.slug} delay={index * 0.15}>
                <Link
                  href={place.slug}
                  className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="relative h-48">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${place.image})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/95 text-emerald-900">
                        {place.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-200" />
                        {place.name}
                      </h3>
                      <p className="text-xs text-emerald-100 mt-1 line-clamp-1">{place.tag}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-gray-800 line-clamp-3 mb-3">{place.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Sun size={14} />
                        Best time: {place.bestTime}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-700 group-hover:text-emerald-700">
                        View details →
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="text-center mb-16">
              <span className="text-emerald-700 font-semibold tracking-wider uppercase text-sm">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Experience Kashmir with Local Experts
              </h2>
              <div className="w-20 h-1 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.2}>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-xl transition-shadow text-center group">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-700 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-800 leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tour Packages & Cab Deals (Most Popular Adventures) */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="grid md:grid-cols-2 gap-10 items-start mb-12">
              {/* Left: Text & Highlights */}
              <div>
                <span className="text-emerald-700 font-semibold tracking-wider uppercase text-sm">
                  Tour Packages
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                  Most Popular Adventures in Kashmir
                </h2>
                <div className="w-20 h-1 bg-emerald-600 mt-4 rounded-full" />
                <p className="text-gray-800 mt-4">
                  Handpicked Kashmir tour packages with premium cabs, curated stays, and local experts.
                  From romantic houseboats on Dal Lake to thrilling drives to Gulmarg and Sonmarg,
                  we take care of everything so you travel stress-free.
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-teal-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Verified Hotels & Houseboats</h4>
                      <p className="text-sm text-gray-800">
                        Stay in handpicked 3★–5★ hotels, cozy houseboats on Dal Lake, and premium camps in
                        Gulmarg & Pahalgam.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-teal-600">
                      <Map size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Private Cabs & Transfers</h4>
                      <p className="text-sm text-gray-800">
                        Comfortable Sedans, SUVs & Tempo Travellers with professional local drivers for all
                        transfers & sightseeing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Popular Places */}
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Top Destinations We Cover</p>
                  <div className="flex flex-wrap gap-2">
                    {["Srinagar", "Gulmarg", "Pahalgam", "Sonmarg", "Doodhpathri", "Gurez Valley", "Daksum", "Yusmarg"].map((place) => (
                      <span
                        key={place}
                        className="px-3 py-1 text-xs md:text-sm rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30"
                  >
                    View All Packages
                    <span className="text-xl">→</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
                  >
                    Get a Custom Quote
                  </Link>
                </div>
              </div>

              {/* Right: Highlighted Deals */}
              <div className="space-y-4">
                {popularPackages.slice(0, 3).map((pkg: any, index: number) => (
                  <ScrollReveal key={pkg.id} delay={index * 0.15}>
                    <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative w-full md:w-1/2 h-52 md:h-auto">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: pkg.featured_image
                              ? `url(${pkg.featured_image})`
                              : "url(/videos/adventure-1.png)",
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <p className="text-xs uppercase tracking-wide text-teal-200 mb-1">Featured Package</p>
                          <h3 className="text-lg font-bold line-clamp-2">{pkg.title}</h3>
                          <p className="text-sm text-gray-200 mt-1 flex items-center gap-2">
                            <Map size={14} /> {pkg.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 rounded-full">
                              {pkg.duration}
                            </span>
                            <span className="text-xs text-gray-700">
                              Starting from ₹{formatInr(Number(pkg.price ?? 0))}
                            </span>
                          </p>
                          <p className="text-sm text-gray-800 line-clamp-3">{pkg.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(pkg.inclusions || []).slice(0, 3).map((inc: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                {inc}
                              </span>
                            ))}
                            {pkg.inclusions && pkg.inclusions.length > 3 && (
                              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                +{pkg.inclusions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-gray-700">
                            Private cabs • Flexible dates • Local support
                          </p>
              <Link 
                            href={`/packages/${pkg.slug}`}
                            className="text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
              >
                            View Details
                            <span>→</span>
              </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Unforgettable Adventures - Split Screen Background Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
        <div className="grid md:grid-cols-2 h-full min-h-[600px] md:min-h-[700px]">
          {/* Left Side - Adventure 1 */}
          <ScrollReveal delay={0.2} width="100%">
            <div className="relative h-[500px] md:h-full group overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${splitL.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

              <div className="relative h-full flex flex-col justify-end p-8 md:p-12 text-white z-10">
                <span className="inline-block mb-4 bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full w-fit">
                  {splitL.badge}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">{splitL.headline}</h3>
                <p className="text-gray-200 mb-4 text-lg max-w-md">{splitL.body}</p>
                <div className="mb-6 space-y-2 text-sm text-gray-300">
                  {(splitL.bullets || []).map((line, idx) => (
                    <p key={idx} className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span> {line}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href={splitL.ctaHref || '/packages'}
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {splitL.ctaLabel || 'Explore →'}
                  </Link>
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all border border-white/30"
                    aria-label="Follow us on Instagram"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
          </div>
        </div>
      </ScrollReveal>

          {/* Right Side - Adventure 2 */}
          <ScrollReveal delay={0.4} width="100%">
            <div className="relative h-[500px] md:h-full group overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${splitR.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

              <div className="relative h-full flex flex-col justify-end p-8 md:p-12 text-white z-10">
                <span className="inline-block mb-4 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full w-fit">
                  {splitR.badge}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">{splitR.headline}</h3>
                <p className="text-gray-200 mb-4 text-lg max-w-md">{splitR.body}</p>
                <div className="mb-6 space-y-2 text-sm text-gray-300">
                  {(splitR.bullets || []).map((line, idx) => (
                    <p key={idx} className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span> {line}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href={splitR.ctaHref || '/packages'}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {splitR.ctaLabel || 'Plan trip →'}
                  </Link>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all border border-white/30"
                    aria-label="Follow us on Facebook"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Services Info Section - Below the split screen */}
        <div className="bg-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal width="100%">
              <div className="text-center mb-12">
                <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">
                  Our Services
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                  Complete Travel Solutions
                </h2>
                <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
                <p className="text-gray-800 mt-4 max-w-2xl mx-auto">
                  We provide comprehensive travel services to make your Kashmir experience seamless and memorable.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              <ScrollReveal delay={0.1}>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl border border-teal-200">
                  <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Cab Services</h3>
                  <p className="text-gray-800 mb-4">
                    Choose from our fleet of well-maintained vehicles including Sedans, SUVs, and Tempo Travellers for groups.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">•</span> Sedan (4-5 Seater)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">•</span> SUV (6-7 Seater)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">•</span> Tempo Traveller (12-14 Seater)
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Experienced Drivers</h3>
                  <p className="text-gray-800 mb-4">
                    Our professional local drivers know every corner of Kashmir, ensuring safe and comfortable journeys.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span> Licensed & Verified
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span> Local Knowledge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span> 24/7 Availability
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-8 rounded-2xl border border-emerald-200">
                  <div className="w-16 h-16 bg-emerald-700 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Support</h3>
                  <p className="text-gray-800 mb-4">
                    From booking to return, we provide end-to-end support for a hassle-free travel experience.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">•</span> Hotel Bookings
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">•</span> Guide Services
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">•</span> Emergency Assistance
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* Social Media CTA Section */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal delay={0.6}>
              <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-teal-100 shadow-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Follow Our Adventures
                </h3>
                <p className="text-gray-800 mb-8 max-w-2xl mx-auto">
                  Get daily updates, stunning photos, and travel tips from Kashmir. Join our community of adventure lovers!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Follow on Instagram</span>
                  </a>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Follow on Facebook</span>
                  </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </div>
</section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="text-center mb-16">
              <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">What Our Travelers Say</h2>
              <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
              <p className="text-gray-800 mt-4 max-w-2xl mx-auto">
                Don't just take our word for it. Here's what our satisfied customers have to say about their Kashmir experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <ScrollReveal key={testimonial.id} delay={index * 0.1}>
                <TestimonialCard
                  name={testimonial.name}
                  location={testimonial.location}
                  comment={testimonial.comment}
                  rating={testimonial.rating}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
