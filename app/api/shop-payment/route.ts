import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/app/actions/email";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { itemId, itemName, price, contactInfo, emailInfo = "" } = await req.json();

  if (!itemId || !price || !contactInfo) {
    return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
  }

  // 포인트 잔액 확인
  const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single();
  if (!profile || profile.points < price) {
    return NextResponse.json({ error: "보유 포인트가 부족합니다." }, { status: 400 });
  }
  const currentPoints: number = profile.points;

  // 포인트 차감
  const { error: pointsErr } = await supabase
    .from("profiles").update({ points: currentPoints - price }).eq("id", user.id);
  if (pointsErr) {
    return NextResponse.json({ error: "포인트 차감 중 오류가 발생했습니다." }, { status: 500 });
  }
  await supabase.from("point_transactions").insert({
    user_id: user.id,
    amount: -price,
    type: "shop_purchase",
    description: `포인트 상점: ${itemName}`,
  });

  // 주문 기록
  const { error: insertErr } = await supabase.from("shop_orders").insert({
    user_id: user.id,
    item_id: itemId,
    item_name: itemName,
    price,
    contact_info: contactInfo,
    email_info: emailInfo || null,
    status: "pending",
    payment_method: "points",
  });

  if (insertErr) {
    console.error("shop_orders insert error:", insertErr);
    // 주문 기록 실패 시 포인트 복구
    await supabase.from("profiles").update({ points: currentPoints }).eq("id", user.id);
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: price,
      type: "refund",
      description: `주문 실패로 인한 포인트 복구: ${itemName}`,
    });
    return NextResponse.json({ error: "주문 기록 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 관리자 알림 (fire and forget)
  sendAdminOrderNotification({
    itemName,
    price,
    pointsUsed: price,
    contactInfo,
    emailInfo,
  }).catch(console.error);

  return NextResponse.json({ success: true, points: currentPoints - price });
}
