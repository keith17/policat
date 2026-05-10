import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("id", params.id)
    .single();

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
          url: "/logo.svg", // Default generic image
          width: 800,
          height: 600,
          alt: "PoliCat Logo",
        },
      ],
      type: "website",
    },
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
