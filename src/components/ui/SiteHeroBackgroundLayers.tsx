'use client';

import { siteHeroLayerUrls } from '@/lib/public-hero-assets';

type Overlay = 'emerald' | 'teal' | 'dark';

const overlayClass: Record<Overlay, string> = {
  emerald:
    'bg-gradient-to-r from-emerald-950/92 via-teal-900/88 to-sky-950/90',
  teal: 'bg-gradient-to-r from-teal-950/90 via-emerald-950/85 to-sky-950/88',
  dark: 'bg-gradient-to-b from-black/78 via-black/55 to-black/75',
};

type Props = {
  overlay?: Overlay;
  bare?: boolean;
  className?: string;
};

export default function SiteHeroBackgroundLayers({ overlay = 'emerald', bare = false, className = '' }: Props) {
  const urls = siteHeroLayerUrls();
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {urls.map((url, i) => (
        <div
          key={url}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${url}")`,
            opacity: bare ? 0.12 + i * 0.02 : 0.06 + i * 0.035,
            zIndex: i,
          }}
        />
      ))}
      {!bare && <div className={`absolute inset-0 z-[30] ${overlayClass[overlay]}`} />}
    </div>
  );
}
