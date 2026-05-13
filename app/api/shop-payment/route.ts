import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/app/actions/email";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { paymentId, itemId, itemName, price, contactInfo, pointsUsed = 0 } = await req.json();

  if (!itemId || !price || !contactInfo) {
    return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
  }
  if (typeof pointsUsed !== "number" || pointsUsed < 0 || pointsUsed > price) {
    return NextResponse.json({ error: "잘못된 포인트 사용량입니다." }, { status: 400 });
  }

  const cardAmount = price - pointsUsed;

  if (cardAmount > 0 && cardAmount < 100) {
    return NextResponse.json({ error: "카드 최소 결제 금액은 100원입니다." }, { status: 400 });
  }

  // 포인트 잔액 사전 확인
  let currentPoints = 0;
  if (pointsUsed > 0) {
    const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single();
    if (!profile || profile.points < pointsUsed) {
      return NextResponse.json({ error: "보유 포인트가 부족합니다." }, { status: 400 });
    }
    currentPoints = profile.points;
  }

  // 카드 결제가 포함된 경우 PortOne 검증
  if (cardAmount > 0) {
    if (!paymentId) {
      return NextResponse.json({ error: "카드 결제 정보가 없습니다." }, { status: 400 });
    }

    const secretKey = process.env.PORTONE_API_SECRET;
    if (!secretKey) {
      return NextResponse.json({ error: "결제 서버 설정 오류입니다. 관리자에게 문의하세요." }, { status: 500 });
    }

    const portoneRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${secretKey}` },
    });
    if (!portoneRes.ok) {
      return NextResponse.json({ error: "결제 정보 조회에 실패했습니다." }, { status: 400 });
    }

    const payment = await portoneRes.json();

    if (payment.status !== "PAID") {
      return NextResponse.json({ error: `결제가 완료되지 않았습니다. (상태: ${payment.status})` }, { status: 400 });
    }
    if (payment.amount?.total !== cardAmount) {
      return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
    }

    // 중복 결제 방지
    const { data: existing } = await supabase
      .from("shop_orders").select("id").eq("payment_id", paymentId).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "이미 처리된 결제입니다." }, { status: 409 });
    }
  }

  // 포인트 차감
  if (pointsUsed > 0) {
    const { error: pointsErr } = await supabase
      .from("profiles").update({ points: currentPoints - pointsUsed }).eq("id", user.id);
    if (pointsErr) {
      return NextResponse.json({ error: "포인트 차감 중 오류가 발생했습니다." }, { status: 500 });
    }
    await supabase.from("point_transactions").insert({
      user_id: user.id,
      amount: -pointsUsed,
      type: "shop_purchase",
      description: `포인트 상점: ${itemName}${cardAmount > 0 ? ` (복합결제 포인트분)` : ""}`,
    });
  }

  // 주문 기록
  const paymentMethod = cardAmount > 0 ? (pointsUsed > 0 ? "hybrid" : "card") : "points";
  const { error: insertErr } = await supabase.from("shop_orders").insert({
    user_id: user.id,
    item_id: itemId,
    item_name: itemName,
    price,
    contact_info: contactInfo,
    status: "pending",
    payment_method: paymentMethod,
    payment_id: paymentId || null,
  });

  if (insertErr) {
    console.error("shop_orders insert error:", insertErr);
    return NextResponse.json({ error: "주문 기록 중 오류가 발생했습니다." }, { status: 500 });
  }

  // Admin notification (fire and forget)
  sendAdminOrderNotification({
    itemName,
    price,
    pointsUsed,
    cardAmount,
    paymentMethod,
    contactInfo,
  }).catch(console.error);

  const newPoints = pointsUsed > 0 ? currentPoints - pointsUsed : undefined;
  return NextResponse.json({ success: true, points: newPoints });
}
