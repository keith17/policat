const fs = require('fs');

let content = fs.readFileSync('app/market/[id]/page.tsx', 'utf-8');

// 1. Update loadData to handle end_date and status
const oldLoadDataStart = `        setMarket({
          ...mData,
          categoryLabel: mData.category === 'economy' ? '경제' : mData.category === 'politics' ? '정치' : mData.category === 'society' ? '사회' : '스포츠',
          emoji: mData.category === 'economy' ? '📈' : mData.category === 'politics' ? '🏛️' : mData.category === 'society' ? '🤝' : '⚽',
          yesProb, noProb, totalVolume: total,
          daysLeft: Math.max(0, 7 - Math.floor((new Date().getTime() - new Date(mData.created_at).getTime()) / (1000 * 60 * 60 * 24))),
          endDate: mData.created_at
        });`;

const newLoadDataStart = `        const endDateObj = new Date(mData.end_date || mData.created_at);
        let derivedStatus = mData.status;
        if (mData.status === "active" && new Date() >= endDateObj) {
          derivedStatus = "ended";
        }
        
        setMarket({
          ...mData,
          categoryLabel: mData.category === 'economy' ? '경제' : mData.category === 'politics' ? '정치' : mData.category === 'society' ? '사회' : '스포츠',
          emoji: mData.category === 'economy' ? '📈' : mData.category === 'politics' ? '🏛️' : mData.category === 'society' ? '🤝' : '⚽',
          yesProb, noProb, totalVolume: total,
          daysLeft: Math.max(0, Math.ceil((endDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
          endDate: mData.end_date || mData.created_at,
          status: derivedStatus
        });`;

content = content.replace(oldLoadDataStart, newLoadDataStart);

// 2. Update the Breadcrumb/Header to show correct days left text
content = content.replace(
  `<span>📅 기준 30일 ({market.daysLeft}일 남음)</span>`,
  `<span>📅 {market.status === 'resolved_yes' || market.status === 'resolved_no' ? "마감됨" : market.status === 'ended' ? "결과 대기중" : market.daysLeft > 0 ? \`\${market.daysLeft}일 남음\` : "오늘 마감"}</span>`
);

// 3. Update the Bet Panel
const oldBetPanel = `              {userBet ? (
                <div style={{
                  textAlign: "center", padding: 24,
                  background: "var(--bg-secondary)",
                  borderRadius: 8, border: \`1px solid \${userBet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)"}\`,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 800, color: userBet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)" }}>
                    {userBet.side === "yes" ? "YES" : "NO"} 예측 완료!
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>베팅금액: {userBet.amount}P</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                    {(["yes", "no"] as const).map(side => (
                      <motion.button
                        key={side}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBetSide(side)}
                        style={{
                          padding: "14px 8px", borderRadius: 8, fontWeight: 800,
                          fontSize: 15, cursor: "pointer", transition: "all 0.1s",
                          background: betSide === side
                            ? (side === "yes" ? "var(--accent-yes)" : "var(--accent-no)")
                            : "var(--bg-card-hover)",
                          color: betSide === side ? "white" : "var(--text-primary)",
                          border: betSide === side
                            ? "1px solid transparent"
                            : "1px solid var(--border)"
                        }}
                      >
                        {side === "yes" ? "📈 YES" : "📉 NO"}
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: betSide === side ? 0.9 : 0.6 }}>
                          {side === "yes" ? market.yesProb : market.noProb}%
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>베팅 포인트 설정</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[10, 50, 100, 200, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          style={{
                            padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.1s",
                            background: betAmount === amt ? "var(--purple-primary)" : "var(--bg-secondary)",
                            color: betAmount === amt ? "white" : "var(--text-secondary)",
                            border: betAmount === amt ? "none" : "1px solid var(--border)"
                          }}
                        >
                          {amt}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {betSide && (
                    <div style={{
                      padding: 16, borderRadius: 8, marginBottom: 16,
                      background: "var(--bg-secondary)", border: "1px solid var(--border)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>적중 시 예상 수익</span>
                        <span style={{ color: "var(--accent-yes)", fontWeight: 800 }}>
                          +{Math.round(betAmount * (100 / (betSide === "yes" ? market.yesProb : market.noProb)) - betAmount)}P
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button
                    className="btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 8, opacity: betSide ? 1 : 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmBet}
                    disabled={!betSide}
                  >
                    {betSide ? \`\${betAmount}P 예측 확정\` : "조건을 선택해주세요"}
                  </motion.button>
                </>
              )}`;

const newBetPanel = `              {market.status === "resolved_yes" || market.status === "resolved_no" ? (
                <div style={{ textAlign: "center", padding: 24, background: "var(--bg-secondary)", borderRadius: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: market.status === "resolved_yes" ? "var(--accent-yes)" : "var(--accent-no)" }}>
                    최종 결과: {market.status === "resolved_yes" ? "YES 승리" : "NO 승리"}
                  </div>
                  {userBet && (
                    <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: userBet.side === (market.status.replace("resolved_", "")) ? "#22c55e" : "#ef4444" }}>
                      {userBet.side === (market.status.replace("resolved_", "")) ? "🎉 예측 적중! 배당금을 획득했습니다." : "😢 예측 실패"}
                    </div>
                  )}
                </div>
              ) : market.status === "ended" ? (
                <div style={{ textAlign: "center", padding: 24, background: "var(--bg-secondary)", borderRadius: 8, color: "var(--text-secondary)", fontWeight: 700 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                  베팅이 마감되었습니다.<br/>결과 판정 대기중입니다.
                  {userBet && <div style={{ marginTop: 12, fontSize: 13 }}>내 예측: {userBet.side.toUpperCase()} ({userBet.amount}P)</div>}
                </div>
              ) : userBet ? (
                <div style={{
                  textAlign: "center", padding: 24,
                  background: "var(--bg-secondary)",
                  borderRadius: 8, border: \`1px solid \${userBet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)"}\`,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 800, color: userBet.side === "yes" ? "var(--accent-yes)" : "var(--accent-no)" }}>
                    {userBet.side === "yes" ? "YES" : "NO"} 예측 완료!
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>베팅금액: {userBet.amount}P</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                    {(["yes", "no"] as const).map(side => (
                      <motion.button
                        key={side}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBetSide(side)}
                        style={{
                          padding: "14px 8px", borderRadius: 8, fontWeight: 800,
                          fontSize: 15, cursor: "pointer", transition: "all 0.1s",
                          background: betSide === side
                            ? (side === "yes" ? "var(--accent-yes)" : "var(--accent-no)")
                            : "var(--bg-card-hover)",
                          color: betSide === side ? "white" : "var(--text-primary)",
                          border: betSide === side
                            ? "1px solid transparent"
                            : "1px solid var(--border)"
                        }}
                      >
                        {side === "yes" ? "📈 YES" : "📉 NO"}
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: betSide === side ? 0.9 : 0.6 }}>
                          {side === "yes" ? market.yesProb : market.noProb}%
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>베팅 포인트 설정</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[10, 50, 100, 200, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          style={{
                            padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.1s",
                            background: betAmount === amt ? "var(--purple-primary)" : "var(--bg-secondary)",
                            color: betAmount === amt ? "white" : "var(--text-secondary)",
                            border: betAmount === amt ? "none" : "1px solid var(--border)"
                          }}
                        >
                          {amt}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {betSide && (
                    <div style={{
                      padding: 16, borderRadius: 8, marginBottom: 16,
                      background: "var(--bg-secondary)", border: "1px solid var(--border)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>적중 시 예상 수익</span>
                        <span style={{ color: "var(--accent-yes)", fontWeight: 800 }}>
                          +{Math.round(betAmount * (100 / (betSide === "yes" ? market.yesProb : market.noProb)) - betAmount)}P
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button
                    className="btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 8, opacity: betSide ? 1 : 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmBet}
                    disabled={!betSide}
                  >
                    {betSide ? \`\${betAmount}P 예측 확정\` : "조건을 선택해주세요"}
                  </motion.button>
                </>
              )}`;

content = content.replace(oldBetPanel, newBetPanel);

fs.writeFileSync('app/market/[id]/page.tsx', content);
console.log('Successfully refactored app/market/[id]/page.tsx');
