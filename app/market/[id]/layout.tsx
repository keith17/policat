import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Use public client to fetch market data without cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: market } = await supabase
    .from("markets")
    .select("title, description")
    .eq("id", params.id)
    .single();

  if (!market) {
    return {
      title: "마켓을 찾을 수 없습니다 | PoliCat",
    };
  }

  return {
    title: `${market.title} | PoliCat 마켓`,
    description: market.description || "지금 예측에 참여하고 기프티콘을 받아가세요!",
    openGraph: {
      title: `${market.title} | PoliCat 마켓`,
      description: market.description || "지금 예측에 참여하고 기프티콘을 받아가세요!",
      images: [
        {
          url: "/logo.svg", // Default generic image for now
          width: 800,
          height: 600,
          alt: "PoliCat Logo",
        },
      ],
      type: "website",
    },
  };
}

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
