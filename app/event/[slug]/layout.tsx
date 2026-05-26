import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const query = isUuid 
    ? supabase.from("events").select("title, description").eq("id", slug).single()
    : supabase.from("events").select("title, description").eq("slug", slug).single();
    
  const { data: event } = await query;

  if (!event) {
    return {
      title: "이벤트를 찾을 수 없습니다 | PoliCat",
    };
  }

  return {
    title: `${event.title} | PoliCat 이벤트`,
    description: event.description || "다중 후보 이벤트 예측에 참여하고 리워드를 받으세요!",
    openGraph: {
      title: `${event.title} | PoliCat 이벤트`,
      description: event.description || "다중 후보 이벤트 예측에 참여하고 리워드를 받으세요!",
      images: [
        {
          url: `/api/og?type=event&slug=${slug}`,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: "website",
    },
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
