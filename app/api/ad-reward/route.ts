import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const AD_REWARD = 50;
const MAX_PER_DAY = 20;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // 일일 한도 확인 (서버사이드 검증)
  const { count } = await supabase
    .from("point_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", "ad_reward")
    .gte("created_at", today);

  if ((count ?? 0) >= MAX_PER_DAY) {
    return NextResponse.json({ error: "오늘의 광고 시청 한도에 도달했습니다." }, { status: 429 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("points, xp")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 404 });

  const newPoints = profile.points + AD_REWARD;
  const newXp = (profile.xp ?? profile.points) + AD_REWARD;

  await supabase.from("profiles").update({ points: newPoints, xp: newXp }).eq("id", user.id);
  await supabase.from("point_transactions").insert({
    user_id: user.id,
    amount: AD_REWARD,
    type: "ad_reward",
    description: "광고 시청 리워드",
  });

  return NextResponse.json({ points: newPoints, xp: newXp, earned: AD_REWARD });
}
