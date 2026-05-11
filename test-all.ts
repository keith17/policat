import { Resend } from "resend";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = "tlw.seoul@gmail.com";
const SENDER_EMAIL = "Policat <noreply@policat.kr>";

async function testAll() {
  console.log("Sending all 4 test emails to", toEmail, "...");

  try {
    // 1. 마켓 제안 접수
    const marketTitle = "내일 비가 올까?";
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
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    console.log("1. Market Creation Email sent.");

    // 2. 상점 기프티콘 교환
    const itemName = "스타벅스 아메리카노 T";
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
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    console.log("2. Shop Order Email sent.");

    // 3. 마켓 승인/반려
    const isApproved = true;
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: toEmail,
      subject: `[Policat] 제안하신 마켓이 승인되어 오픈되었습니다!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">마켓 검토 결과 안내</h2>
          <p>안녕하세요!</p>
          <p>제안해 주신 <strong>'${marketTitle}'</strong> 마켓에 대한 검토 결과입니다.</p>
          <p><strong>결과:</strong> <span style="color: #22c55e">승인 및 오픈</span></p>
          <br/>
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    console.log("3. Market Approval Email sent.");

    // 4. 마켓 정산(결과) 알림
    const winningSide = "yes";
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: toEmail,
      subject: `[Policat] 참여하신 마켓의 결과가 판정되었습니다.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">마켓 결과 안내 🏁</h2>
          <p>안녕하세요!</p>
          <p>참여하셨던 <strong>'${marketTitle}'</strong> 마켓의 결과가 확정되었습니다.</p>
          <p><strong>최종 결과:</strong> YES</p>
          <p>회원님의 예측은 <strong>적중했습니다! 🎉 배당금(포인트/XP)이 지급되었습니다.</strong></p>
          <br/>
          <a href="https://policat.kr/profile/me" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">내역 확인하기</a>
          <br/><br/>
          <p>감사합니다.<br/>Policat 팀 드림</p>
        </div>
      `,
    });
    console.log("4. Market Settlement Email sent.");

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAll();
