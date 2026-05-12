import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Image from 'next/image';
import { Car, Compass, Phone, Shield, MapPin, Mountain, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/social-links';
import { supabase } from '@/lib/supabase';
import type { OffbeatSpotFallback as OffbeatSpot } from '@/data/offbeat-spots-fallback';
import { FALLBACK_OFFBEAT_HIDDEN, FALLBACK_OFFBEAT_TREKS } from '@/data/offbeat-spots-fallback';
import { offbeatSpotPath } from '@/lib/offbeat-slug';

export const metadata: Metadata = {
  title: 'Off Beat Kashmir | Transport & Rentals | Tempesttrek',
  description:
    'Hidden valleys, quieter routes, and dependable wheels. Tempesttrek helps you combine off-beat Kashmir with car hire and private cab plans.',
};

const highlights = [
  {
    icon: Compass,
    title: 'Fewer crowds',
    desc: 'Valleys and viewpoints away from the standard circuit—planned with realistic drive times.',
  },
  {
    icon: Shield,
    title: 'Trusted fleet',
    desc: 'Well-maintained sedans, SUVs, and tempo travellers with licensed local drivers.',
  },
  {
    icon: MapPin,
    title: 'Local routing',
    desc: 'Road conditions and season-specific advice so your off-beat day actually works.',
  },
];

async function fetchOffbeat(): Promise<{ treks: OffbeatSpot[]; hidden: OffbeatSpot[] }> {
  try {
    const { data, error } = await supabase
      .from('offbeat_spots')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(24);
    if (error) throw error;
    const rows = (data || []) as OffbeatSpot[];
    const treks = rows.filter((r) => r.type === 'trek');
    const hidden = rows.filter((r) => r.type === 'hidden_place');
    return {
      treks: treks.length ? treks : FALLBACK_OFFBEAT_TREKS,
      hidden: hidden.length ? hidden : FALLBACK_OFFBEAT_HIDDEN,
    };
  } catch {
    return { treks: FALLBACK_OFFBEAT_TREKS, hidden: FALLBACK_OFFBEAT_HIDDEN };
  }
}

function SpotCard({ spot, tag }: { spot: OffbeatSpot; tag: 'Trek' | 'Hidden' }) {
  const img = spot.hero_image?.trim() || '/videos/adventure-1.png';
  const href = offbeatSpotPath(spot);
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-xl transition-all [transform-style:preserve-3d] hover:[transform:rotateX(2deg)_rotateY(-2deg)_translateY(-2px)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
    >
      <div className="relative h-44">
        <Image src={img} alt={spot.name} fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/90 text-emerald-900 border border-white/60">
            {tag === 'Trek' ? <Mountain size={14} /> : <Sparkles size={14} />}
            {tag}
          </span>
        </div>
        {spot.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-md">
              Featured
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-extrabold text-white">{spot.name}</h3>
          <p className="text-xs text-white/85 mt-1">{spot.region || 'Kashmir'}{spot.best_season ? ` • Best: ${spot.best_season}` : ''}</p>
        </div>
      </div>
      <div className="p-5">
        {spot.description && <p className="text-sm text-gray-700 line-clamp-3">{spot.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {spot.difficulty && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold">
              Difficulty: {spot.difficulty}
            </span>
          )}
          {spot.duration && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-100 font-semibold">
              Duration: {spot.duration}
            </span>
          )}
          {spot.altitude && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-gray-50 text-gray-800 border border-gray-100 font-semibold">
              Altitude: {spot.altitude}
            </span>
          )}
        </div>
        <p className="mt-3 text-xs font-semibold text-emerald-700">View details →</p>
      </div>
    </Link>
  );
}

export default async function OffBeatPage() {
  const { treks, hidden } = await fetchOffbeat();
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="relative rounded-3xl overflow-hidden mb-14 text-white px-6 py-14 md:px-14 md:py-16 min-h-[300px] md:min-h-[380px] flex flex-col justify-center">
              <Image
                src="/Ladakh.jpeg"
                alt=""
                fill
                className="object-cover scale-[1.02]"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-teal-900/32 to-sky-950/48" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              <div className="relative z-10">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-50 mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]">
                Off the beaten path
              </p>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 max-w-3xl [text-shadow:0_2px_28px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.9)]">
                Off Beat Kashmir — routes, rhythm, and the right wheels
              </h1>
              <p className="text-lg text-white max-w-2xl mb-8 [text-shadow:0_2px_14px_rgba(0,0,0,0.8)]">
                Pair quieter destinations with reliable transport: private cab packages for sightseeing and
                transfers, plus flexible car hire for your itinerary. Tell us how adventurous you want to go—we
                will shape realistic days on the road.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/places"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-900 px-5 py-3 text-sm font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Explore places
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition-colors"
                >
                  Plan an off-beat route
                </Link>
              </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {highlights.map((h, i) => (
              <ScrollReveal key={h.title} delay={i * 0.08}>
                <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm h-full">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <h.icon size={22} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{h.title}</h2>
                  <p className="text-sm text-gray-800 leading-relaxed">{h.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Treks */}
          <section className="mb-16">
            <ScrollReveal width="100%">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-700">Kashmir trekking</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">Most loved treks & trails</h2>
                  <p className="text-sm text-gray-800 mt-2 max-w-2xl">
                    Hidden alpine lakes, glacier routes, and valley trails—curated for real drive times and seasons.
                  </p>
                </div>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-semibold shadow-md">
                  Get a trekking plan
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {treks.map((s, idx) => (
                <ScrollReveal key={s.id} delay={idx * 0.06}>
                  <SpotCard spot={s} tag="Trek" />
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Hidden places */}
          <section className="mb-16">
            <ScrollReveal width="100%">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.25em] uppercase text-sky-700">Offbeat sightseeing</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">Hidden tourist places</h2>
                  <p className="text-sm text-gray-800 mt-2 max-w-2xl">
                    Quiet meadows, waterfall drives, and less-crowded valleys—perfect for spring and summer.
                  </p>
                </div>
                <Link href="/places" className="inline-flex items-center justify-center rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 text-sm font-semibold">
                  Explore popular places
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hidden.map((s, idx) => (
                <ScrollReveal key={s.id} delay={idx * 0.06}>
                  <SpotCard spot={s} tag="Hidden" />
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Car hire / fleet */}
          <ScrollReveal width="100%">
            <div className="grid md:grid-cols-2 gap-10 items-start mb-16">
              <div className="bg-white rounded-2xl border border-sky-100 p-8 shadow-sm">
                <span className="text-emerald-600 text-xs font-bold uppercase tracking-wide">Car hire & fleet</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-4">
                  Vehicles matched to terrain and group size
                </h2>
                <p className="text-gray-800 mb-6">
                  Sedans for couples, SUVs for families and hillside roads, tempo travellers when you roll deep.
                  Hire options are tailored to permits, timings, and the season—we confirm what is realistic before
                  you pay.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 mb-8">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    Sedan · 4–5 seats · city & valley hops
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    SUV · 6–7 seats · Gurez, Sonmarg stretches, luggage
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    Tempo traveller · groups & corporate outings
                  </li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/917006796123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-semibold"
                  >
                    WhatsApp fleet enquiry
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <Phone size={16} />
                    Callback request
                  </Link>
                  <Link
                    href="/car-rental"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 text-sm font-semibold"
                  >
                    <Car size={16} />
                    View cars
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 via-white to-sky-50 rounded-2xl border border-emerald-200 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Car size={24} />
                  </div>
                  <div>
                    <span className="text-sky-800 text-xs font-bold uppercase tracking-wide">Cabs section</span>
                    <h2 className="text-xl font-bold text-gray-900">Popular routes & indicative plans</h2>
                  </div>
                </div>
                <p className="text-gray-800 text-sm mb-6">
                  See day-wise cab plans, transfer ideas, and starting prices on the dedicated cabs page. Same team,
                  same vehicles—formatted for quicker browsing.
                </p>
                <Link
                  href="/cabs"
                  className="inline-flex items-center gap-2 w-full md:w-auto justify-center rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 text-base font-semibold shadow-md"
                >
                  View cab plans &amp; transfers
                </Link>
                <p className="text-xs text-gray-700 mt-4">
                  For something truly custom,{' '}
                  <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">
                    contact Tempesttrek
                  </Link>{' '}
                  and we will stitch cab days into your off-beat route.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal width="100%">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">See trip moments</h3>
                <p className="text-sm text-gray-800 mt-1">
                  Videos and photos on{' '}
                  <a href={SOCIAL_LINKS.instagram} className="text-emerald-700 font-semibold hover:underline">
                    Instagram
                  </a>
                  ,{' '}
                  <a href={SOCIAL_LINKS.facebook} className="text-sky-700 font-semibold hover:underline">
                    Facebook
                  </a>{' '}
                  and{' '}
                  <a href={SOCIAL_LINKS.youtubeChannel} className="text-red-600 font-semibold hover:underline">
                    YouTube
                  </a>
                  .
                </p>
              </div>
              <Link
                href="/social"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white px-5 py-3 text-sm font-semibold hover:bg-gray-800 shrink-0"
              >
                Open Social hub
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
