import { SOCIAL_LINKS } from '@/lib/social-links';

export type SocialYoutubeEntry = { title: string; youtubeId: string };
export type SocialGalleryEntry = { src: string; alt: string };

export type SocialPageConfig = {
  heroTitle?: string;
  heroSubtitle?: string;
  links?: Partial<{
    facebook: string;
    instagram: string;
    youtubeChannel: string;
  }>;
  youtubeVideos?: SocialYoutubeEntry[];
  galleryImages?: SocialGalleryEntry[];
};

const DEFAULT_GALLERY: SocialGalleryEntry[] = [
  { src: '/WhatsApp Image 2026-05-11 at 2.34.56 PM.jpeg', alt: 'Tempesttrek Kashmir moment' },
  { src: '/videos/adventure-1.png', alt: 'Snowy valley and traveller' },
  { src: '/videos/adventure-2.png', alt: 'Mountain lake vista' },
];

export function mergeSocialPage(raw: unknown): SocialPageConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as SocialPageConfig;
  const links = {
    facebook: r.links?.facebook?.trim() || SOCIAL_LINKS.facebook,
    instagram: r.links?.instagram?.trim() || SOCIAL_LINKS.instagram,
    youtubeChannel: r.links?.youtubeChannel?.trim() || SOCIAL_LINKS.youtubeChannel,
  };
  const youtubeVideos = Array.isArray(r.youtubeVideos)
    ? r.youtubeVideos.filter((v) => v?.youtubeId?.trim()).map((v) => ({ title: v.title?.trim() || 'Video', youtubeId: v.youtubeId.trim() }))
    : [];
  const galleryImages = Array.isArray(r.galleryImages) && r.galleryImages.length
    ? r.galleryImages.filter((g) => g?.src?.trim()).map((g) => ({ src: g.src.trim(), alt: g.alt?.trim() || 'Photo' }))
    : DEFAULT_GALLERY;

  return {
    heroTitle: r.heroTitle?.trim() || 'Tempesttrek on social media',
    heroSubtitle:
      r.heroSubtitle?.trim() ||
      'Daily reels and photos from the mountains, ride-along snippets, and longer trip edits.',
    links,
    youtubeVideos,
    galleryImages,
  };
}
