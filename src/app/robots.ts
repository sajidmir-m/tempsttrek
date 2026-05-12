import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Use environment variable in production; fall back to the correct .in domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tempesttrek.example';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

