import { MetadataRoute } from 'next';

const BASE_URL = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://bearlog.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup'],
        disallow: ['/dashboard', '/calendar', '/mypage', '/goal/', '/auth/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
