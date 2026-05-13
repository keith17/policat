import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GIFTISHOW_API = "https://biz.giftishow.com/fo_api/ggoods/detail";

async function uploadToSupabase(imageUrl: string, goodsNo: number): Promise<string> {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return imageUrl;

  try {
    const imgRes = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://biz.giftishow.com/" },
    });
    if (!imgRes.ok) return imageUrl;

    const buffer      = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext         = contentType.includes("png") ? "png" : "jpg";
    const path        = `gifti-${goodsNo}.${ext}`;

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin.storage
      .from("shop-images")
      .upload(path, buffer, { contentType, upsert: true });

    if (error) return imageUrl;

    const { data: urlData } = admin.storage.from("shop-images").getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch {
    return imageUrl;
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url || typeof url !== "string" || !url.includes("giftishow.com")) {
    return NextResponse.json({ error: "유효한 Giftishow URL이 아닙니다." }, { status: 400 });
  }

  const goodsNoMatch = url.match(/goodsNo=(\d+)/);
  if (!goodsNoMatch) {
    return NextResponse.json({ error: "URL에서 상품 번호(goodsNo)를 찾을 수 없습니다." }, { status: 400 });
  }
  const goodsNo = parseInt(goodsNoMatch[1]);

  try {
    const res = await fetch(GIFTISHOW_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": `https://biz.giftishow.com/ggoods/detail?goodsNo=${goodsNo}`,
        "Origin": "https://biz.giftishow.com",
      },
      body: JSON.stringify({ goodsNo }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API 호출 실패 (${res.status})` }, { status: 400 });
    }

    const data = await res.json();

    if (data.code !== "SUC0000" || !data.result?.goodsDetail?.length) {
      return NextResponse.json({ error: "상품 정보를 가져올 수 없습니다." }, { status: 404 });
    }

    const items: any[]  = data.result.goodsDetail;
    const baseItem      = items.find(g => g.baseGoodsYn === "Y") ?? items[0];
    const targetItem    = items.find(g => g.goodsNo === goodsNo) ?? baseItem;

    // 정상가: base 상품의 판매가
    const originalPrice: number = baseItem.salePrice ?? baseItem.realPrice ?? 0;
    // 할인율: target 상품의 기본 할인율
    const discountRate: number  = targetItem.baseDiscountRate ?? 0;
    // 판매가: 할인 적용
    const price: number = discountRate > 0
      ? Math.round(originalPrice * (1 - discountRate / 100))
      : targetItem.discountPrice ?? originalPrice;

    const name       = [targetItem.brandName, targetItem.goodsName].filter(Boolean).join(" ");
    const category   = targetItem.categoryName?.split(",")?.[0]?.trim() ?? targetItem.brandName ?? "";
    const issuerName = targetItem.issuerNm ?? "";
    const usageNotes = targetItem.content ?? "";

    // subtitle: contentAddDesc 우선, 없으면 브랜드명 + 상품유형
    const contentAdd = targetItem.contentAddDesc ? stripHtml(targetItem.contentAddDesc) : "";
    const subtitle   = contentAdd || `${targetItem.brandName} ${targetItem.goodsTypeDtlNm ?? "기프티콘"}`;

    // description: 이용안내 앞 3줄
    const description = usageNotes
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter((l: string) => l.trim())
      .slice(0, 3)
      .join(" ")
      .trim();

    // 이미지 Supabase 업로드
    const rawImageUrl = targetItem.goodsImgB ?? targetItem.goodsImgS ?? "";
    const imageUrl    = rawImageUrl ? await uploadToSupabase(rawImageUrl, goodsNo) : "";

    return NextResponse.json({
      suggestedId:   `gifti-${goodsNo}`,
      name,
      category,
      originalPrice,
      price,
      discountRate,
      imageUrl,
      description,
      subtitle,
      issuerName,
      usageNotes,
      giftishow_url: url,
    });
  } catch (error) {
    console.error("Giftishow scrape error:", error);
    return NextResponse.json({ error: "스크래핑 중 오류가 발생했습니다." }, { status: 500 });
  }
}
