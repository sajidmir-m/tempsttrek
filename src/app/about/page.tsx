import Image from 'next/image';
import SectionHeading from '@/components/ui/SectionHeading';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us - Tempesttrek',
  description:
    'Learn more about Tempesttrek, our mission, and the team behind your Kashmir travel experience.',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden text-white min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center py-20 px-4 text-center">
        <Image
          src="/gem.png"
          alt="Kashmir valley — mountains, river, and village"
          fill
          className="object-cover object-center scale-[1.02]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/45 via-teal-900/35 to-emerald-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 [text-shadow:0_2px_28px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.9)]">
            About Tempesttrek
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.82),0_1px_3px_rgba(0,0,0,0.85)] leading-relaxed">
            Your trusted partner from Srinagar for exploring the paradise on earth – Kashmir.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Locally owned. Personally managed.</h2>
            <p className="text-gray-800 mb-4 leading-relaxed">
              Tempesttrek is a Srinagar-based travel brand. We specialize in crafting unforgettable Kashmir
              experiences – from houseboat stays on Dal Lake to snow adventures in Gulmarg and serene escapes in
              Pahalgam and Sonmarg.
            </p>
            <p className="text-gray-800 mb-4 leading-relaxed">
              Being from Kashmir, we know every season, every shortcut, and every hidden viewpoint. This helps us
              design honest, value-for-money itineraries that balance sightseeing, comfort, and local culture.
            </p>
            <p className="text-gray-800 leading-relaxed">
              We believe in transparency, safety, and genuine hospitality. From your first WhatsApp message till you
              board your return flight, our team stays with you like a local guardian in Kashmir.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-emerald-500/70 shadow-lg bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-8 flex flex-col justify-center min-h-[220px]">
              <p className="text-xs font-semibold tracking-[0.2em] text-emerald-100 uppercase mb-2">Owner</p>
              <p className="text-3xl font-extrabold mb-3">Saqib</p>
              <p className="text-sm text-white/90 leading-relaxed">
                Leads Tempesttrek with a focus on guest experience, trusted partners, and on-ground quality across
                Kashmir.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-sky-400/50 shadow-lg bg-gradient-to-br from-sky-900 to-emerald-950 text-white p-8 flex flex-col justify-center min-h-[220px]">
              <p className="text-xs font-semibold tracking-[0.2em] text-sky-100 uppercase mb-2">Created by</p>
              <p className="text-2xl sm:text-3xl font-extrabold mb-1">ER Sajid Nazir</p>
              <p className="text-sm text-white/90 leading-relaxed mt-2">
                Built the digital side of Tempesttrek—website, systems, and the tools that keep bookings and
                itineraries clear for every guest.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <SectionHeading title="Leadership" center={true} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 max-w-4xl mx-auto">
            <div className="border border-emerald-100 rounded-2xl p-6 shadow-sm bg-emerald-50/50">
              <h3 className="text-xl font-bold text-emerald-900 mb-1">Saqib</h3>
              <p className="text-sm font-semibold text-emerald-700 mb-3">Owner – Tempesttrek</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Oversees operations, vendor relationships, and the experience you receive in Kashmir—from arrival to
                departure.
              </p>
              <p className="text-sm text-gray-700 mt-4">
                <span className="font-semibold">Phone (Primary):</span>{' '}
                <a href="tel:+917006796123" className="text-emerald-700 font-semibold">
                  +91 7006796123
                </a>
              </p>
            </div>
            <div className="border border-sky-100 rounded-2xl p-6 shadow-sm bg-sky-50/50">
              <h3 className="text-xl font-bold text-sky-950 mb-1">ER Sajid Nazir</h3>
              <p className="text-sm font-semibold text-sky-800 mb-3">Created by – digital &amp; systems</p>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Responsible for building and evolving the Tempesttrek platform so enquiries, confirmations, and
                itineraries stay smooth and professional.
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">WhatsApp (Support):</span>{' '}
                <a
                  href="https://wa.me/917006796123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-800 font-semibold hover:underline"
                >
                  +91 7006796123
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-100">
            <h3 className="text-2xl font-bold text-emerald-900 mb-4">Our Mission</h3>
            <p className="text-gray-800">
              To provide honest, transparent, and memorable Kashmir travel experiences that feel like visiting a
              local friend rather than a tour operator. We aim to showcase the real Kashmir – its people, culture,
              food, and landscapes – while maintaining safety and comfort for every guest.
            </p>
          </div>
          <div className="bg-sky-50 p-8 rounded-xl border border-sky-100">
            <h3 className="text-2xl font-bold text-sky-950 mb-4">Our Vision</h3>
            <p className="text-gray-800">
              To be one of the most trusted names in Kashmir tourism, known for integrity, warm hospitality, and
              value-driven packages. We want every Tempesttrek guest to become a lifelong ambassador for Kashmir.
            </p>
          </div>
        </div>

        <SectionHeading title="Why We Are Different" center={true} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-emerald-600 mb-2">10+</div>
            <div className="text-gray-900 font-semibold mb-2">Years of Experience</div>
            <p className="text-gray-700 text-sm">Serving happy customers with dedication and honesty.</p>
          </div>
          <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
            <div className="text-gray-900 font-semibold mb-2">Tour Packages</div>
            <p className="text-gray-700 text-sm">Customizable options for couples, families, and groups.</p>
          </div>
          <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-gray-900 font-semibold mb-2">Support</div>
            <p className="text-gray-700 text-sm">A local team in Srinagar always available on call or WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
