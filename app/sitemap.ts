import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://policat.kr'; // 향후 실제 도메인으로 변경하세요.

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 기본 정적 페이지
  const routes = ['', '/guide', '/leaderboard', '/shop', '/notices'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 동적 마켓 페이지
  const { data: markets } = await supabase.from('markets').select('id, created_at').eq('status', 'active');
  const marketRoutes = (markets || []).map((market) => ({
    url: `${baseUrl}/market/${market.id}`,
    lastModified: market.created_at,
    changeFrequency: 'always' as const,
    priority: 0.9,
  }));

  // 동적 이벤트 페이지
  const { data: events } = await supabase.from('events').select('id, created_at').eq('status', 'active');
  const eventRoutes = (events || []).map((event) => ({
    url: `${baseUrl}/event/${event.id}`,
    lastModified: event.created_at,
    changeFrequency: 'always' as const,
    priority: 0.9,
  }));

  return [...routes, ...marketRoutes, ...eventRoutes];
}
