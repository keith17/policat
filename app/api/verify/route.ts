import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { identityVerificationId, userId } = await request.json();

    if (!identityVerificationId || !userId) {
      return NextResponse.json({ success: false, message: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    const portoneSecret = process.env.PORTONE_API_SECRET;
    if (!portoneSecret) {
      return NextResponse.json({ success: false, message: "서버 설정 오류 (PortOne Secret 누락)" }, { status: 500 });
    }

    // 1. 포트원 서버에 인증 내역 조회
    const verifyResponse = await fetch(`https://api.portone.io/identity-verifications/${identityVerificationId}`, {
      method: "GET",
      headers: {
        "Authorization": `PortOne ${portoneSecret}`,
      },
    });

    if (!verifyResponse.ok) {
      const errText = await verifyResponse.text();
      console.error("PortOne Verify Error:", errText);
      return NextResponse.json({ success: false, message: "본인인증 내역을 확인할 수 없습니다." }, { status: 400 });
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.status !== "VERIFIED") {
      return NextResponse.json({ success: false, message: "본인인증이 완료되지 않았습니다." }, { status: 400 });
    }

    const { ci, di, name, phoneNumber } = verifyData.verifiedCustomer || {};
    const fullName = name?.full || "";

    if (!ci) {
      return NextResponse.json({ success: false, message: "인증 정보(CI)를 가져오지 못했습니다." }, { status: 400 });
    }

    // 2. Supabase 연결 (Service Role Key로 서버 권한 실행)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Service Role Key가 없다면 Anon Key를 쓰되, RLS 정책에 주의해야 합니다.
    // 안전한 처리를 위해 NEXT_PUBLIC_SUPABASE_ANON_KEY를 사용하거나 별도 관리자 키를 사용합니다.
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. 중복 가입(CI) 확인
    const { data: existingProfiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("ci", ci);

    if (fetchError) {
      console.error("Supabase Error:", fetchError);
      return NextResponse.json({ success: false, message: "DB 확인 중 오류가 발생했습니다." }, { status: 500 });
    }

    const isDuplicate = existingProfiles && existingProfiles.length > 0 && !existingProfiles.some((p: any) => p.id === userId);

    if (isDuplicate) {
      return NextResponse.json({ success: false, message: "이미 해당 명의로 본인인증이 완료된 계정이 존재합니다. (1인 1계정 원칙)" }, { status: 400 });
    }

    // 4. 프로필 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_verified: true,
        real_name: fullName,
        phone_number: phoneNumber,
        ci: ci,
        di: di,
        verified_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return NextResponse.json({ success: false, message: "프로필 업데이트에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "본인인증이 완료되었습니다.", realName: fullName });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, message: "서버 내부 오류가 발생했습니다." }, { status: 500 });
  }
}
