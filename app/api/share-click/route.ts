import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { referrerId, marketId } = await req.json();
    if (!referrerId || !marketId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Get visitor IP for dedup
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const supabase = await createClient();

    // Check if this IP already clicked for this referrer+market combo
    const { data: existing } = await supabase
      .from("share_clicks")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("market_id", marketId)
      .eq("visitor_ip", ip)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ rewarded: false, reason: "duplicate" });
    }

    // Check how much the referrer already earned from this market (max 100P = 20 clicks)
    const { count } = await supabase
      .from("share_clicks")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", referrerId)
      .eq("market_id", marketId);

    if ((count || 0) >= 20) {
      return NextResponse.json({ rewarded: false, reason: "max_reached" });
    }

    // Record click
    await supabase.from("share_clicks").insert({
      referrer_id: referrerId,
      market_id: marketId,
      visitor_ip: ip,
    });

    // Reward the referrer +5P
    const { data: profile } = await supabase
      .from("profiles")
      .select("points, xp")
      .eq("id", referrerId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ points: profile.points + 5, xp: profile.xp + 5 })
        .eq("id", referrerId);

      await supabase.from("point_transactions").insert({
        user_id: referrerId,
        amount: 5,
        type: "reward",
        description: "마켓 공유 클릭 보상",
      });
    }

    return NextResponse.json({ rewarded: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
