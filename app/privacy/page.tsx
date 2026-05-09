import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <Navbar points={0} streak={0} />
      
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          개인정보 처리방침 (Privacy Policy)
        </h1>

        <section style={{ display: "flex", flexDirection: "column", gap: 24, padding: "32px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>1. 개인정보 수집 항목</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              Policat은 회원가입, 고객상담, 서비스 제공을 위해 최소한의 개인정보를 수집합니다.<br/>
              - <strong>필수항목:</strong> 이메일 주소, 닉네임 (Google OAuth 제공 정보)<br/>
              - <strong>수집방법:</strong> 소셜 로그인(Google)을 통한 자동 수집
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>2. 개인정보 수집 및 이용 목적</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              수집한 개인정보는 다음의 목적을 위해 활용됩니다.<br/>
              - 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 콘텐츠 제공<br/>
              - 회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존, 불만처리 등 민원처리<br/>
              - <strong>(마케팅 동의 시)</strong> 신규 서비스(제품) 개발 및 특화, 이벤트 등 광고성 정보 전달
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>3. 개인정보의 보유 및 이용기간</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.<br/>
              - 보존 항목: 로그인 기록, 결제/포인트 거래기록<br/>
              - 보존 근거: 통신비밀보호법, 전자상거래 등에서의 소비자보호에 관한 법률<br/>
              - 보존 기간: 3개월 ~ 최대 5년
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>4. 개인정보의 파기절차 및 방법</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
            </p>
          </div>
          
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", fontSize: 14, color: "var(--text-muted)" }}>
            * 본 개인정보 처리방침은 Policat 베타 서비스 기간 동안 적용되는 표준 방침입니다.
          </div>
        </section>
      </main>
    </div>
  );
}
