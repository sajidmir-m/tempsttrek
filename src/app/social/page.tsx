import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Facebook, Instagram, Youtube, ArrowLeft } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/social-links';

export const metadata: Metadata = {
  title: 'Social & Media | Instagram · Facebook · YouTube | Tempesttrek',
  description:
    'Follow Tempesttrek on Instagram, Facebook, and YouTube. Watch Kashmir trip clips and browse photo highlights.',
};

/** Add `{ title, youtubeId }` entries to show embedded players (youtube-nocookie). */
const YOUTUBE_VIDEOS: { title: string; youtubeId: string }[] = [];

/** Paths under `public/` — swap for your originals. */
const GALLERY_IMAGES: { src: string; alt: string }[] = [
  { src: '/WhatsApp Image 2026-05-11 at 2.34.56 PM.jpeg', alt: 'Tempesttrek Kashmir moment' },
  { src: '/videos/adventure-1.png', alt: 'Snowy valley and traveller' },
  { src: '/videos/adventure-2.png', alt: 'Mountain lake vista' },
  { src: '/videos/adventure-1.png', alt: 'Another moment from our tours' },
];

export default function SocialPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal width="100%">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-900 mb-8"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </ScrollReveal>

        <ScrollReveal width="100%">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-800 text-white px-6 py-12 md:px-12 md:py-14 mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-100 mb-3">Stay connected</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Tempesttrek on social media</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-10">
              Daily reels and photos from the mountains, ride-along snippets, and longer trip edits. Follow wherever
              you scroll most—we publish across Instagram, Facebook, and YouTube.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-white text-emerald-900 px-5 py-3 text-sm font-semibold hover:bg-emerald-50"
              >
                <Instagram size={20} />
                Instagram
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/25"
              >
                <Facebook size={20} />
                Facebook
              </a>
              <a
                href={SOCIAL_LINKS.youtubeChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-3 text-sm font-semibold"
              >
                <Youtube size={22} />
                YouTube channel
              </a>
            </div>
          </div>
        </ScrollReveal>

        <section className="mb-16">
          <ScrollReveal width="100%">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured videos</h2>
            <p className="text-gray-800 text-sm mb-8">
              Hosted on YouTube. Add entries to <code className="text-emerald-800 bg-emerald-50 px-1 rounded">YOUTUBE_VIDEOS</code> in{' '}
              <code className="text-emerald-800 bg-emerald-50 px-1 rounded">social/page.tsx</code>.
            </p>
          </ScrollReveal>
          {YOUTUBE_VIDEOS.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-10 text-center text-sm text-gray-800">
              No videos configured yet. Use your YouTube video IDs (the part after <code className="text-xs">watch?v=</code>) in{' '}
              <code className="text-xs text-emerald-800">YOUTUBE_VIDEOS</code>, or open your{' '}
              <a href={SOCIAL_LINKS.youtubeChannel} className="text-sky-700 font-semibold hover:underline">
                YouTube channel
              </a>
              .
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {YOUTUBE_VIDEOS.map((v, index) => (
                <ScrollReveal key={v.youtubeId + index} delay={index * 0.08}>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <p className="px-4 pt-4 text-sm font-semibold text-gray-900">{v.title}</p>
                    <div className="relative aspect-video mt-3 bg-black">
                      <iframe
                        title={v.title}
                        src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>

        <section>
          <ScrollReveal width="100%">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos</h2>
            <p className="text-gray-800 text-sm mb-8">
              Snapshot grid from public assets—you can swap paths in <code className="text-emerald-800 bg-emerald-50 px-1 rounded">GALLERY_IMAGES</code>.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {GALLERY_IMAGES.map((img, index) => (
              <ScrollReveal key={img.src + index} delay={index * 0.05}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-emerald-100 bg-gray-200 shadow-sm">
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ScrollReveal width="100%" delay={0.15}>
          <div className="mt-16 text-center rounded-2xl bg-white border border-emerald-100 p-8">
            <p className="text-gray-700 mb-4">Planning a trip? We reply fastest on WhatsApp and call.</p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-sm font-semibold"
            >
              Get in touch
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
