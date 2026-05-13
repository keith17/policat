import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { paymentId, itemId, itemName, price, contactInfo } = await req.json();

  if (!paymentId || !itemId || !price || !contactInfo) {
    return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
  }

  // PortOne 서버 API로 결제 상태 검증
  const secretKey = process.env.PORTONE_SECRET_KEY;
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

  // 결제 금액·상태 검증
  if (payment.status !== "PAID") {
    return NextResponse.json({ error: `결제가 완료되지 않았습니다. (상태: ${payment.status})` }, { status: 400 });
  }
  if (payment.amount?.total !== price) {
    return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
  }

  // 중복 결제 방지
  const { data: existing } = await supabase
    .from("shop_orders")
    .select("id")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 처리된 결제입니다." }, { status: 409 });
  }

  // 주문 기록
  const { error: insertErr } = await supabase.from("shop_orders").insert({
    user_id: user.id,
    item_id: itemId,
    item_name: itemName,
    price,
    contact_info: contactInfo,
    status: "pending",
    payment_method: "card",
    payment_id: paymentId,
  });

  if (insertErr) {
    console.error("shop_orders insert error:", insertErr);
    return NextResponse.json({ error: "주문 기록 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
