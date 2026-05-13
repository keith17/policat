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

export default function TOSPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      <Navbar points={0} xp={0} streak={0} />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "100px 20px 40px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>서비스 이용약관</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>시행일: 2026년 5월 13일 · 트루러브웨이츠</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 36px" }}>
          <Section title="제1조 (목적)">
            본 약관은 폴리캣(이하 '회사')이 제공하는 예측 콘텐츠, 포인트 적립 및 보상 서비스(이하 '서비스')의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
          </Section>

          <Section title="제2조 (용어의 정의)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>'포인트'란 회원이 서비스 내 예측 참여, 광고 시청, 이벤트 참여 등을 통해 무상으로 적립 받고, 상품권 교환 등에 사용할 수 있는 가상의 데이터를 말합니다.</li>
              <li>'보상'이란 회원이 보유한 포인트를 소진하여 획득할 수 있는 네이버페이, 배달의민족, 카카오톡 상품권 등의 모바일 교환권을 말합니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (회원가입 및 계정 정책)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>회원가입은 구글(Google) 소셜 로그인 연동을 통해 이루어집니다.</li>
              <li style={{ marginBottom: 6 }}>회사는 보상의 중복 수령 및 어뷰징 방지를 위해, <strong>보상 신청(상품 구매) 시점에 최초 1회의 휴대전화 본인인증</strong>을 요구합니다.</li>
              <li>1인의 회원은 본인인증을 완료한 1개의 계정만으로 보상을 수령할 수 있으며, 타인의 명의를 도용하거나 다중 계정을 생성하는 경우 서비스 이용이 제한될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제4조 (포인트의 적립 및 유효기간)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>회원은 서비스 내 콘텐츠 참여 및 광고 시청 등을 통해 포인트를 무상으로 적립할 수 있습니다.</li>
              <li style={{ marginBottom: 6 }}><strong>포인트의 유효기간은 적립일로부터 6개월</strong>이며, 유효기간이 경과한 포인트는 순차적으로 자동 소멸됩니다.</li>
              <li>회원이 최종 접속일로부터 <strong>180일</strong>간 로그인 기록이 없는 경우 휴면 계정으로 전환되며, 보유 중인 모든 포인트는 자동 소멸됩니다.</li>
            </ol>
          </Section>

          <Section title="제5조 (포인트 사용 및 보상 지급)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>회원은 누적된 포인트를 사용하여 상점에서 상품을 구매할 수 있습니다.</li>
              <li style={{ marginBottom: 6 }}>상품권은 본인인증된 휴대폰 번호로 발송되며, 번호 오기재로 인한 책임은 회원에게 있습니다.</li>
              <li style={{ marginBottom: 6 }}><strong>포인트는 현금으로 환전할 수 없으며, 제3자에게 양도하거나 유료로 구매할 수 없습니다.</strong></li>
              <li>부정한 방법으로 포인트를 획득한 경우 회사는 즉각 포인트 몰수 및 계정 정지 조치를 취할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (콘텐츠의 성격 및 책임 제한)">
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>서비스 내 예측 콘텐츠는 정보 제공 및 재미를 위한 것이며, 실제 결과에 대한 보증이나 금융·투자 조언이 아닙니다.</li>
              <li>회원은 예측 결과를 기반으로 사적인 금전 거래나 불법 도박 행위를 할 수 없습니다.</li>
            </ol>
          </Section>
        </div>
      </main>
    </div>
  );
}
