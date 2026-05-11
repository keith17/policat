import { Resend } from "resend";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = "tlw.seoul@gmail.com";
const SENDER_EMAIL = "Policat <noreply@policat.kr>";

async function testMissing() {
  console.log("Sending the last 2 test emails to", toEmail, "...");

  // 3. 마켓 승인/반려
  const marketTitle = "내일 비가 올까?";
  const res3 = await resend.emails.send({
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
        <a href="https://policat.kr" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Policat 확인하기</a>
        <br/><br/>
        <p>감사합니다.<br/>Policat 팀 드림</p>
      </div>
    `,
  });
  console.log("Result 3:", res3);

  // 4. 마켓 정산(결과) 알림
  const res4 = await resend.emails.send({
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
  console.log("Result 4:", res4);
}

testMissing();
