import { MetadataRoute } from 'next';

const locales = ['en', 'de', 'es', 'fr', 'it', 'pt'];
const baseUrl = 'https://sentenly.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/translate',
    '/rewrite-email-professionally',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      // Determine priority and changeFrequency based on route
      let priority = 0.5;
      let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';

      if (route === '') {
        priority = 1.0;
        changeFrequency = 'daily';
      } else if (route === '/translate' || route === '/rewrite-email-professionally') {
        priority = 0.9;
        changeFrequency = 'daily';
      } else if (route === '/pricing') {
        priority = 0.8;
        changeFrequency = 'weekly';
      } else if (route === '/privacy' || route === '/terms') {
        priority = 0.3;
        changeFrequency = 'monthly';
      }

      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${route}`])
          ),
        },
      });
    });
  });

  return sitemap;
}
