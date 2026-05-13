import Navbar from "@/components/Navbar";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
        {title}
      </h2>
      <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      <Navbar points={0} xp={0} streak={0} />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "100px 20px 40px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>개인정보 처리방침</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>시행일: 2026년 5월 13일 · 트루러브웨이츠</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 36px" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
            폴리캣(이하 '회사')은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <Section title="제1조 (개인정보의 처리 목적)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}><strong>홈페이지 회원 가입 및 관리:</strong> 회원 가입 의사 확인, 본인 식별·인증, 서비스 부정이용 방지, 각종 고지·통지</li>
              <li style={{ marginBottom: 6 }}><strong>재화 또는 서비스 제공:</strong> 예측 콘텐츠 제공, 포인트 적립, 보상 신청 시 본인인증, 모바일 상품권(기프티콘) 발송</li>
              <li><strong>마케팅 및 광고에의 활용 (동의한 회원에 한함):</strong> 신규 서비스 및 맞춤형 혜택(이벤트) 안내, 서비스 이용 통계 분석</li>
            </ol>
          </Section>

          <Section title="제2조 (처리하는 개인정보의 항목)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}><strong>회원 가입 시 (구글 소셜 로그인):</strong> 구글 계정 이메일, 닉네임, 프로필 이미지</li>
              <li style={{ marginBottom: 6 }}><strong>보상 신청 및 지급 시 (최초 1회 본인인증):</strong> 이름, 휴대전화 번호, 생년월일, 성별, 연계정보(CI), 중복가입확인정보(DI)</li>
              <li><strong>자동 수집 정보:</strong> IP 주소, 쿠키, 서비스 이용 기록, 기기 식별자</li>
            </ol>
          </Section>

          <Section title="제3조 (개인정보의 처리 및 보유 기간)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}><strong>홈페이지 회원 가입 및 관리:</strong> 회원 탈퇴 시까지 (단, 법령 위반 수사 진행 중인 경우 해당 수사 종료 시까지)</li>
              <li style={{ marginBottom: 6 }}><strong>재화 또는 서비스 제공:</strong> 쿠폰 발송 완료 시까지
                <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                  <li>대금결제 및 재화 공급 기록: 5년</li>
                  <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제4조 (개인정보의 제3자 제공)">
            회사는 원칙적으로 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의 또는 법률의 특별한 규정이 있는 경우에만 제3자에게 제공합니다. (현재 회사는 개인정보를 제3자에게 제공하지 않습니다.)
          </Section>

          <Section title="제5조 (개인정보 처리업무의 위탁)">
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}><strong>(주)포트원:</strong> 보상 신청 시 휴대전화 본인인증</li>
              <li><strong>기프티쇼 비즈:</strong> 모바일 상품권(기프티콘) 발송 대행</li>
            </ul>
          </Section>

          <Section title="제6조 (개인정보의 파기)">
            개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로, 종이 문서는 분쇄 또는 소각하여 파기합니다.
          </Section>

          <Section title="제7조 (정보주체의 권리·의무)">
            정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. 서비스 내 설정 메뉴 또는 이메일(tlw.seoul@gmail.com)을 통해 요청하실 수 있습니다.
          </Section>

          <Section title="제8조 (개인정보의 안전성 확보 조치)">
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 교육</li>
              <li><strong>기술적 조치:</strong> 접근권한 관리, 접근통제시스템 설치, 고유식별정보 암호화, 보안프로그램 설치</li>
            </ul>
          </Section>

          <Section title="제9조 (쿠키 운영)">
            회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(cookie)를 사용합니다. 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 맞춤형 서비스 이용에 어려움이 있을 수 있습니다.
          </Section>

          <Section title="제10조 (개인정보 보호책임자)">
            <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
              <li><strong>책임자:</strong> 박기석 (대표)</li>
              <li><strong>연락처:</strong> tlw.seoul@gmail.com</li>
            </ul>
          </Section>

          <Section title="제11조 (처리방침 변경)">
            이 개인정보 처리방침은 시행일로부터 적용되며, 변경 시 시행 7일 전 공지사항을 통해 고지합니다.
          </Section>
        </div>
      </main>
    </div>
  );
}
