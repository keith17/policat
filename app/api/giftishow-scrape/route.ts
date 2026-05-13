import { NextResponse } from "next/server";

const GIFTISHOW_API = "https://biz.giftishow.com/fo_api/ggoods/detail";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url || typeof url !== "string" || !url.includes("giftishow.com")) {
    return NextResponse.json({ error: "유효한 Giftishow URL이 아닙니다." }, { status: 400 });
  }

  // Extract goodsNo from URL
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

    // Find the exact item, preferring baseGoodsYn="Y" (primary variant)
    const items: any[] = data.result.goodsDetail;
    const item =
      items.find((g) => g.goodsNo === goodsNo) ??
      items.find((g) => g.baseGoodsYn === "Y") ??
      items[0];

    const name        = [item.brandName, item.goodsName].filter(Boolean).join(" ");
    const category    = item.categoryName?.split(",")?.[0]?.trim() ?? item.brandName ?? "";
    const price       = item.salePrice ?? item.realPrice ?? 0;
    const imageUrl    = item.goodsImgB ?? item.goodsImgS ?? "";
    const description = (item.content ?? "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .slice(0, 4)
      .join(" ")
      .trim();

    return NextResponse.json({
      name,
      category,
      price,
      imageUrl,
      description,
      giftishow_url: url,
    });
  } catch (error) {
    console.error("Giftishow scrape error:", error);
    return NextResponse.json({ error: "스크래핑 중 오류가 발생했습니다." }, { status: 500 });
  }
}
