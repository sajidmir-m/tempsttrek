import { SOCIAL_LINKS } from '@/lib/social-links';
import { SITE_BRAND } from '@/lib/site-contact';
import { getSiteUrl } from '@/lib/site-url';

export default function StructuredData() {
  const baseUrl = getSiteUrl();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_BRAND.fullName,
    description: SITE_BRAND.description,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-7006796123',
      contactType: 'Customer Service',
      email: 'info@tempesttreks.in',
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
