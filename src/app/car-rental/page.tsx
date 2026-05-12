import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Car, Phone, Users, Gauge, Fuel, CheckCircle2 } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Car Rental in Kashmir | Fleet & Pricing | Tempesttrek',
  description:
    'Browse Tempesttrek’s Kashmir car rental fleet: Etios, Dzire, Thar, Innova and more. Transparent pricing and quick WhatsApp confirmations.',
};

type CarRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  seats: number | null;
  transmission: string | null;
  fuel: string | null;
  price_per_day: number | null;
  price_per_km: number | null;
  image_url: string | null;
  features: string[] | null;
  is_available: boolean | null;
  sort_order: number | null;
};

const FALLBACK_CARS: CarRow[] = [
  {
    id: 'fallback-etios',
    name: 'Toyota Etios',
    slug: 'toyota-etios',
    category: 'Sedan',
    seats: 4,
    transmission: 'Manual',
    fuel: 'Diesel',
    price_per_day: 2800,
    price_per_km: 16,
    image_url: '/videos/adventure-1.png',
    features: ['AC', 'Comfort seats', 'Airport pickup'],
    is_available: true,
    sort_order: 10,
  },
  {
    id: 'fallback-dzire',
    name: 'Maruti Dzire',
    slug: 'maruti-dzire',
    category: 'Sedan',
    seats: 4,
    transmission: 'Manual',
    fuel: 'Petrol',
    price_per_day: 2600,
    price_per_km: 15,
    image_url: '/videos/adventure-2.png',
    features: ['AC', 'City + valley trips'],
    is_available: true,
    sort_order: 20,
  },
  {
    id: 'fallback-thar',
    name: 'Mahindra Thar',
    slug: 'mahindra-thar',
    category: '4x4',
    seats: 4,
    transmission: 'Manual',
    fuel: 'Diesel',
    price_per_day: 5200,
    price_per_km: 22,
    image_url: '/videos/adventure-1.png',
    features: ['4x4', 'Off-road', 'Adventure'],
    is_available: true,
    sort_order: 30,
  },
  {
    id: 'fallback-innova',
    name: 'Toyota Innova',
    slug: 'toyota-innova',
    category: 'SUV/MPV',
    seats: 7,
    transmission: 'Manual',
    fuel: 'Diesel',
    price_per_day: 4200,
    price_per_km: 20,
    image_url: '/videos/adventure-2.png',
    features: ['Spacious', 'Family trips', 'Long routes'],
    is_available: true,
    sort_order: 40,
  },
];

async function fetchCars(): Promise<CarRow[]> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []) as CarRow[];
    return rows.length ? rows : FALLBACK_CARS;
  } catch {
    return FALLBACK_CARS;
  }
}

function formatMoney(n: number | null) {
  if (n === null || n === undefined) return null;
  try {
    return `₹${n.toLocaleString()}`;
  } catch {
    return `₹${n}`;
  }
}

export default async function CarRentalPage() {
  const cars = await fetchCars();

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal width="100%">
            <div className="rounded-3xl overflow-hidden mb-10 text-white px-6 py-12 md:px-14 md:py-14 relative min-h-[320px] md:min-h-[380px] flex flex-col justify-center">
              <Image
                src="/Gemini_Generated_Image_5iocyp5iocyp5ioc.png"
                alt=""
                fill
                className="object-cover scale-[1.02]"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/55 via-teal-900/35 to-sky-950/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
              <div className="relative z-10">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-50 mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]">
                  Car rental • Kashmir
                </p>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-3 max-w-3xl [text-shadow:0_2px_28px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.9)]">
                  Choose the right car for your route
                </h1>
                <p className="text-white max-w-2xl mb-7 [text-shadow:0_2px_14px_rgba(0,0,0,0.8)]">
                  From comfortable sedans to 4x4 adventures and family MPVs—book with transparent pricing and fast
                  confirmation.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/917006796123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-900 px-5 py-3 text-sm font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    WhatsApp booking
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition-colors"
                  >
                    <Phone size={16} />
                    Request callback
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((c, idx) => {
              const img = c.image_url?.trim() || '/videos/adventure-1.png';
              return (
                <ScrollReveal key={c.id} delay={idx * 0.05}>
                  <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all [transform-style:preserve-3d] hover:[transform:rotateX(2deg)_rotateY(2deg)_translateY(-2px)]">
                    <div className="relative h-44">
                      <Image
                        src={img}
                        alt={c.name}
                        fill
                        className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-extrabold text-white">{c.name}</h3>
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/90 text-emerald-900">
                            {c.category || 'Car'}
                          </span>
                        </div>
                      </div>
                      {c.is_available === false && (
                        <div className="absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full bg-red-600 text-white">
                          Not available
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                        <p className="flex items-center gap-2">
                          <Users size={16} className="text-emerald-600" />
                          <span className="font-semibold">{c.seats || '—'}</span> seats
                        </p>
                        <p className="flex items-center gap-2">
                          <Gauge size={16} className="text-sky-600" />
                          {c.transmission || '—'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Fuel size={16} className="text-gray-800" />
                          {c.fuel || '—'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Car size={16} className="text-emerald-700" />
                          {formatMoney(c.price_per_day) ? (
                            <span className="font-extrabold text-emerald-700">{formatMoney(c.price_per_day)}/day</span>
                          ) : (
                            <span className="text-gray-700">Quote</span>
                          )}
                        </p>
                      </div>

                      {c.features?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {c.features.slice(0, 4).map((f) => (
                            <span
                              key={f}
                              className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold"
                            >
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle2 size={13} /> {f}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href="/contact"
                          className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-3 text-sm font-semibold transition-colors"
                        >
                          Get price
                        </Link>
                        <a
                          className="inline-flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors"
                          href={`https://wa.me/917006796123?text=${encodeURIComponent(`Hi Tempesttrek, I want to book ${c.name}. Please share price & availability.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                      {c.price_per_km ? (
                        <p className="text-xs text-gray-700 mt-3">Indicative: {formatMoney(c.price_per_km)}/km (seasonal variations apply)</p>
                      ) : null}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

