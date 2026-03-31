import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/__/', '/admin/'],
      },
    ],
    sitemap: 'https://sentenly.com/sitemap.xml',
  };
}
