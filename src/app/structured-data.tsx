import { SOCIAL_LINKS } from '@/lib/social-links';

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tempesttrek.example';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Tempesttrek',
    description:
      'Kashmir-based travel agency offering tour packages, off-beat routes, hotel bookings, and transport services',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-6005107475',
      contactType: 'Customer Service',
      email: 'mirbabatourtravels@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Kashmiri'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Srinagar',
      addressRegion: 'Jammu and Kashmir',
      addressCountry: 'IN',
    },
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.facebook, SOCIAL_LINKS.youtubeChannel],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
