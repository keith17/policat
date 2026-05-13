"use server";

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const SENDER_EMAIL = "Policat <noreply@policat.kr>";

// 1. 마켓 생성 신청 알림 (유저에게 발송)
export async function sendMarketCreationEmail(toEmail: string, marketTitle: string) {
  if (!resend) return { success: false, message: "이메일 서비스가 설정되지 않았습니다." };
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: toEmail,
      subject: `[Policat] '${marketTitle}' 마켓 제안이 접수되었습니다.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">마켓 제안 접수 완료 🎉</h2>
          <p>안녕하세요!</p>
          <p>요청하신 <strong>'${marketTitle}'</strong> 마켓의 제안이 성공적으로 접수되었습니다.</p>
          <p>관리자의 승인을 거친 후 정식으로 오픈되며, 반려될 경우 별도 안내해 드립니다.</p>
          <br/>
          <a href="https://policat.kr" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Policat 바로가기</a>
          <br/><br/>
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false };
  }
}

// 2. 상점 기프티콘 교환 알림 (유저에게 발송)
export async function sendShopOrderEmail(toEmail: string, itemName: string) {
  if (!resend) return { success: false };
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: toEmail,
      subject: `[Policat] '${itemName}' 교환 신청이 완료되었습니다.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">상점 교환 신청 완료 🎁</h2>
          <p>안녕하세요!</p>
          <p>포인트 상점에서 <strong>'${itemName}'</strong> 상품 교환을 신청하셨습니다.</p>
          <p>기프티콘 발송은 관리자 확인 후 평일 기준 1~2일 내에 입력하신 연락처/이메일로 전송됩니다.</p>
          <br/>
          <a href="https://policat.kr/shop" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">포인트 상점 가기</a>
          <br/><br/>
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false };
  }
}

// 3. 마켓 승인/반려 알림 (유저에게 발송)
export async function sendMarketApprovalEmail(toEmail: string, marketTitle: string, status: "active" | "cancelled", reason?: string) {
  if (!resend) return { success: false };
  
  const isApproved = status === "active";
  const subject = isApproved 
    ? `[Policat] 제안하신 마켓이 승인되어 오픈되었습니다!`
    : `[Policat] 제안하신 마켓이 반려되었습니다.`;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">마켓 검토 결과 안내</h2>
          <p>안녕하세요!</p>
          <p>제안해 주신 <strong>'${marketTitle}'</strong> 마켓에 대한 검토 결과입니다.</p>
          <p><strong>결과:</strong> <span style="color: ${isApproved ? '#22c55e' : '#ef4444'}">${isApproved ? '승인 및 오픈' : '반려(취소)'}</span></p>
          <br/>
          <a href="https://policat.kr" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Policat 확인하기</a>
          <br/><br/>
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false };
  }
}

// 4. 관리자 주문 알림 (koesig@gmail.com에게 발송)
export async function sendAdminOrderNotification(params: {
  itemName: string;
  price: number;
  pointsUsed: number;
  cardAmount: number;
  paymentMethod: string;
  contactInfo: string;
}) {
  if (!resend) return { success: false };
  const methodLabel = params.paymentMethod === "hybrid" ? `복합결제 (포인트 ${params.pointsUsed.toLocaleString()}P + 카드 ${params.cardAmount.toLocaleString()}원)` : params.paymentMethod === "card" ? `카드결제 ${params.cardAmount.toLocaleString()}원` : `포인트 ${params.pointsUsed.toLocaleString()}P`;
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: ["koesig@gmail.com", "tlw.seoul@gmail.com"],
      subject: `[Policat 상점] 새 주문: ${params.itemName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">새 상점 주문이 접수되었습니다 🛒</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <tr style="background:#f9fafb"><td style="padding:12px 16px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb">상품명</td><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">${params.itemName}</td></tr>
            <tr><td style="padding:12px 16px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb">총 금액</td><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">${params.price.toLocaleString()}원</td></tr>
            <tr style="background:#f9fafb"><td style="padding:12px 16px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb">결제 방식</td><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">${methodLabel}</td></tr>
            <tr><td style="padding:12px 16px;font-weight:bold;color:#374151">연락처/이메일</td><td style="padding:12px 16px">${params.contactInfo}</td></tr>
          </table>
          <br/>
          <a href="https://policat.kr/admin" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:10px">어드민에서 처리하기 →</a>
          <p style="color:#9ca3af;font-size:13px;margin-top:20px">이 메일은 Policat 상점 주문 알림입니다.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Admin order notification failed:", error);
    return { success: false };
  }
}

// 5. 마켓 정산(결과) 알림 (다수의 유저에게 발송)
// Note: 이건 수십/수백 명에게 한 번에 발송해야 하므로 Vercel Edge Function이나 Background Job에서 실행하는 것이 좋습니다.
export async function sendMarketSettlementEmails(bettings: any[], marketTitle: string, winningSide: string) {
  if (!resend) return { success: false };
  
  // bettings 배열에는 { user_id, amount, side, profiles: { email, full_name } } 구조가 들어온다고 가정합니다.
  try {
    const emails = bettings
      .filter(bet => bet.profiles?.email) // 이메일이 있는 유저만
      .map(bet => {
        const isWinner = bet.side === winningSide;
        return {
          from: SENDER_EMAIL,
          to: bet.profiles.email,
          subject: `[Policat] 참여하신 마켓의 결과가 판정되었습니다.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">마켓 결과 안내 🏁</h2>
              <p>안녕하세요!</p>
              <p>참여하셨던 <strong>'${marketTitle}'</strong> 마켓의 결과가 확정되었습니다.</p>
              <p><strong>최종 결과:</strong> ${winningSide.toUpperCase()}</p>
              <p>회원님의 예측은 <strong>${isWinner ? '적중했습니다! 🎉 배당금(포인트/XP)이 지급되었습니다.' : '아쉽게도 빗나갔습니다. 다음 예측에 다시 도전해 보세요!'}</strong></p>
              <br/>
              <a href="https://policat.kr/profile/me" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">내역 확인하기</a>
              <br/><br/>
              <p>감사합니다.<br/>Policat 팀 드림</p>
            </div>
          `
        };
      });

    if (emails.length > 0) {
      // Resend Batch API 지원 여부에 따라 나눠서 보내거나 Batch 사용
      await resend.batch.send(emails);
    }
    return { success: true };
  } catch (error) {
    console.error("Batch Email send failed:", error);
    return { success: false };
  }
}
