import { Resend } from "resend";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = "tlw.seoul@gmail.com";

async function sendTest() {
  console.log("Attempting to send using noreply@policat.kr...");
  try {
    const res = await resend.emails.send({
      from: "PoliCat <noreply@policat.kr>",
      to: toEmail,
      subject: "[PoliCat] 이메일 발송 테스트 (policat.kr 연동 완료)",
      html: "<p>축하합니다! 이 메일은 noreply@policat.kr 도메인으로 정상 발송되었습니다!</p>"
    });
    
    if (res.error) {
      console.log("Error details:", res.error);
      return;
    }
    console.log("Success with policat.kr!", res);
  } catch (err: any) {
    console.error("Error with policat.kr:", err.message || err);
  }
}

sendTest();
