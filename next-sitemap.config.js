/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tempesttrek.example',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/admin/*', '/_next/*', '/static/*'],
  
  // Explicitly define robots.txt content
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    additionalSitemaps: [
      `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tempesttrek.example').replace(/\/$/, '')}/sitemap.xml`,
    ],
  },

  transform: async (config, path) => {
    let priority = 0.8;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/packages') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.startsWith('/packages/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path === '/about' || path === '/contact' || path === '/offbeat' || path === '/social') {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path === '/terms') {
      priority = 0.5;
      changefreq = 'yearly';
    }

    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
      lastmod: new Date().toISOString(),
    };
  },
};