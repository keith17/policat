import Navbar from "@/components/Navbar";

export default function TOSPage() {
  return (
    <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Assuming Navbar can handle default non-user states if we don't pass points/streak, or we pass 0 */}
      <Navbar points={0} streak={0} />
      
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          Policat 이용약관 (Terms of Service)
        </h1>

        <section style={{ display: "flex", flexDirection: "column", gap: 24, padding: "32px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>1. 목적 및 기본 원칙</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              본 약관은 Policat(이하 "회사")이 제공하는 예측 마켓 서비스의 이용조건 및 절차를 규정합니다. Policat은 암호화폐나 실제 현금이 아닌 플랫폼 내 무료 '포인트'를 사용하여 대중의 지혜와 예측을 모으는 즐거운 엔터테인먼트 플랫폼입니다.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>2. 시장 생성 및 참여 (Market Generation & Trading)</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              이용자는 누구나 흥미로운 이슈를 기반으로 마켓을 생성(제안)할 수 있습니다. 단, 마켓 제안 시 다음 규칙을 엄격히 따릅니다 (Polymarket 규칙 준용):
              <br/><br/>
              - <strong>명확성(Unambiguity):</strong> 예측 가능한 명확한 종료 날짜와 객관적 판정 기준을 제공해야 합니다.<br/>
              - <strong>공정성(No Insider Trading):</strong> 답변을 임의로 조작할 수 있는 개인적인 사안, 미리 결과를 알고 있는 내부자 정보 기반의 제안은 엄격히 금지됩니다.<br/>
              - <strong>준법성:</strong> 범죄, 폭력 조장, 불법적 요소를 포함하는 마켓은 생성할 수 없습니다.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>3. 결과 판정 및 관리자 권한 (Resolution & Admin Authority)</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              제안된 마켓의 최종 정답(결과) 입력은 생성자가 추천하더라도, 어뷰징(Abuse) 및 포인트 조작을 막기 위해 <strong>오직 '관리자(Admin)'만이 승인하고 마감(Resolution)</strong>할 수 있습니다. 관리자는 신뢰할 수 있는 퍼블릭 소스(뉴스, 공식 보도자료 등)를 바탕으로 최종 판정을 내리며, 해당 판정은 최종적이고 구속력을 가집니다.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>4. 포인트 가치 및 보상 (Points & Rewards)</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              플랫폼 내 예측과 거래에 사용되는 <strong>포인트(Points)는 실제 현금이나 법정화폐로서의 가치를 지니지 않습니다.</strong> 어떠한 경우에도 포인트는 현금으로 환불되거나 교환될 수 없습니다.<br/>
              단, 정해진 예측 티어와 랭킹에 도달한 우수 활동자에게는 회사의 정책에 따라 리워드(음료 기프티콘 등 실물 경품 쿠폰)가 무상으로 차등 지급될 수 있습니다.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--purple-primary)", marginBottom: 12 }}>5. 면책 조항 (Disclaimers)</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
              회사는 예측 마켓 플랫폼의 장을 제공할 뿐, 예측 결과의 사실성 или 이용자 간의 분쟁에 대해 법적 책임을 지지 않습니다. 이용자는 자신의 판단 하에 서비스에 참여하며, 포인트 결과 변동에 따른 책임을 전적으로 부담합니다.
            </p>
          </div>
          
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", fontSize: 14, color: "var(--text-muted)" }}>
            * 본 약관은 세계 최대 예측 시장 플랫폼인 Polymarket의 운용 철학과 투명성 원칙(Transparency & Resolution)을 준용하여 작성되었습니다.
          </div>
        </section>
      </main>
    </div>
  );
}
