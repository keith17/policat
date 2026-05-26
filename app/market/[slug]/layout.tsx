import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Use public client to fetch market data without cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const query = isUuid 
    ? supabase.from("markets").select("title, description, yes_pool, no_pool").eq("id", slug).single()
    : supabase.from("markets").select("title, description, yes_pool, no_pool").eq("slug", slug).single();
    
  const { data: market } = await query;

  if (!market) {
    return {
      title: "마켓을 찾을 수 없습니다 | PoliCat",
    };
  }

  const totalVolume = market.yes_pool + market.no_pool;
  const descriptionText = totalVolume > 0 
    ? `현재 총 ${totalVolume.toLocaleString()}P가 참여 중입니다. 폴리캣에서 실시간 확률을 확인하고 참여해보세요!`
    : market.description || "지금 예측에 참여하고 기프티콘을 받아가세요!";

  return {
    title: `${market.title} | PoliCat 마켓`,
    description: descriptionText,
    openGraph: {
      title: `${market.title} | PoliCat 마켓`,
      description: descriptionText,
      images: [
        {
          url: `/api/og?type=market&slug=${slug}`,
          width: 1200,
          height: 630,
          alt: market.title,
        },
      ],
      type: "website",
    },
  };
}

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
