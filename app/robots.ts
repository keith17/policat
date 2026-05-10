import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/me/'], // 관리자 및 개인 설정 페이지는 크롤링 방지
    },
    sitemap: 'https://policat.kr/sitemap.xml',
  };
}
