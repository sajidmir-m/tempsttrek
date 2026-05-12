import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Mountain, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugifyOffbeatName } from '@/lib/offbeat-slug';
import { FALLBACK_OFFBEAT_ALL } from '@/data/offbeat-spots-fallback';
import type { OffbeatSpotFallback as OffbeatSpot } from '@/data/offbeat-spots-fallback';

export const dynamic = 'force-dynamic';

function normalizeRow(r: Record<string, unknown>): OffbeatSpot {
  return {
    id: String(r.id),
    type: r.type === 'hidden_place' ? 'hidden_place' : 'trek',
    name: String(r.name || ''),
    slug: (r.slug as string) || null,
    region: (r.region as string) || null,
    difficulty: (r.difficulty as string) || null,
    best_season: (r.best_season as string) || null,
    duration: (r.duration as string) || null,
    altitude: (r.altitude as string) || null,
    description: (r.description as string) || null,
    detail_body: (r.detail_body as string) || null,
    hero_image: (r.hero_image as string) || null,
    is_featured: r.is_featured != null ? Boolean(r.is_featured) : null,
  };
}

async function fetchSpotBySlug(slug: string): Promise<OffbeatSpot | null> {
  const decoded = decodeURIComponent(slug).toLowerCase();
  const match = (r: OffbeatSpot) => {
    const s = (r.slug || '').trim().toLowerCase();
    if (s && s === decoded) return true;
    return slugifyOffbeatName(r.name) === decoded;
  };
  try {
    const { data, error } = await supabase.from('offbeat_spots').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
    const hit = rows.find(match);
    if (hit) return hit;
  } catch {
    /* use fallbacks */
  }
  return FALLBACK_OFFBEAT_ALL.find(match) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spot = await fetchSpotBySlug(slug);
  if (!spot) return { title: 'Off-beat spot | Tempesttrek' };
  return {
    title: `${spot.name} | Off Beat Kashmir | Tempesttrek`,
    description: spot.description || `Explore ${spot.name} with Tempesttrek — transport, seasons, and local routing.`,
  };
}

export default async function OffbeatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spot = await fetchSpotBySlug(slug);
  if (!spot) notFound();

  const img = spot.hero_image?.trim() || '/videos/adventure-1.png';
  const tag = spot.type === 'trek' ? 'Trek' : 'Hidden place';
  const body = (spot.detail_body || spot.description || '').trim();
  const listPath = '/offbeat';

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="relative h-[52vh] min-h-[280px] w-full overflow-hidden">
        <Image src={img} alt={spot.name} fill className="object-cover scale-[1.02]" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/15" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl">
          <Link
            href={listPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft size={16} />
            All off-beat spots
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 text-emerald-900">
              {spot.type === 'trek' ? <Mountain size={14} /> : <Sparkles size={14} />}
              {tag}
            </span>
            {spot.is_featured ? (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500 text-white">Featured</span>
            ) : null}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]">
            {spot.name}
          </h1>
          <p className="mt-2 text-white/90 flex flex-wrap items-center gap-2 text-sm md:text-base">
            <MapPin size={16} className="shrink-0" />
            {spot.region || 'Kashmir'}
            {spot.best_season ? <span className="text-white/75">• Best season: {spot.best_season}</span> : null}
          </p>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-sm">
          {spot.difficulty ? (
            <div className="rounded-xl border border-emerald-100 bg-white p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-emerald-700">Difficulty</dt>
              <dd className="mt-1 font-semibold text-gray-900">{spot.difficulty}</dd>
            </div>
          ) : null}
          {spot.duration ? (
            <div className="rounded-xl border border-sky-100 bg-white p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-sky-700">Duration</dt>
              <dd className="mt-1 font-semibold text-gray-900">{spot.duration}</dd>
            </div>
          ) : null}
          {spot.altitude ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-gray-600">Altitude / terrain</dt>
              <dd className="mt-1 font-semibold text-gray-900">{spot.altitude}</dd>
            </div>
          ) : null}
        </dl>

        <div className="prose prose-emerald max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
          {body || (
            <p>
              Full write-up for this spot can be added in your database (<code className="text-xs">detail_body</code> on{' '}
              <code className="text-xs">offbeat_spots</code>). Until then, contact Tempesttrek for routing, permits, and
              realistic day plans.
            </p>
          )}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-sm font-semibold"
          >
            Plan this route
          </Link>
          <Link href="/car-rental" className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-white">
            View cars
          </Link>
        </div>
      </article>
    </div>
  );
}
