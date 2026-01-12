import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Kita larang Google masuk ke halaman Admin
    },
    sitemap: 'https://ruang-nadi-web.vercel.app/sitemap.xml', // Ganti dengan domain Vercel kamu
  };
}