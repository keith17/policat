"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AdBanner } from "@/components/AdBanner";

const leagues = [
  {
    id: "weekly",
    title: "주간 예측 리그",
    subtitle: "매주 월~일 / 상위 10명 기프티콘 지급",
    emoji: "⚡",
    status: "진행 중",
    endDate: "2026-04-20",
    daysLeft: 3,
    color: "#8b5cf6",
    prize: "스타벅스 10잔 (1위)",
    participants: 1284,
    myRank: 47,
    myPoints: 840,
    top5: [
      { rank: 1, name: "전설의고양이", points: 3200, streak: 12 },
      { rank: 2, name: "경제달인김씨", points: 2850, streak: 7 },
      { rank: 3, name: "판세읽는자", points: 2310, streak: 5 },
      { rank: 4, name: "뇨앙군", points: 1980, streak: 3 },
      { rank: 5, name: "정치고수", points: 1760, streak: 4 },
    ]
  },
  {
    id: "economy",
    title: "경제 예측 챌린지",
    subtitle: "금리·환율·주가 예측 특별 리그",
    emoji: "📈",
    status: "진행 중",
    endDate: "2026-04-30",
    daysLeft: 13,
    color: "#f59e0b",
    prize: "네이버페이 5만원 (1위)",
    participants: 892,
    myRank: 23,
    myPoints: 550,
    top5: [
      { rank: 1, name: "코스피박사", points: 1800, streak: 8 },
      { rank: 2, name: "환율여왕", points: 1620, streak: 5 },
      { rank: 3, name: "마켓마스터", points: 1400, streak: 2 },
      { rank: 4, name: "금리예측가", points: 1200, streak: 4 },
      { rank: 5, name: "나는야예측왕", points: 980, streak: 1 },
    ]
  },
  {
    id: "politics",
    title: "총선 예측 대전",
    subtitle: "정치 이슈 전문 마켓 리그",
    emoji: "🗳️",
    status: "모집 중",
    endDate: "2026-06-30",
    daysLeft: 74,
    color: "#ec4899",
    prize: "CGV 영화 5매 (1위)",
    participants: 0,
    myRank: null,
    myPoints: 0,
    top5: []
  },
];

export default function LeaguePage() {
  const [userPoints] = useState(500);
  const [joined, setJoined] = useState<string[]>([]);

  const handleJoin = (id: string) => {
    setJoined(j => j.includes(id) ? j : [...j, id]);
  };

  return (
    <div className="animated-bg" style={{ minHeight: "100vh" }}>
      <Navbar points={userPoints} streak={3} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "90px 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
            ⚡ <span className="gradient-text">예측 리그</span>
          </h1>
          <p style={{ color: "#9090b0", marginBottom: 28 }}>
            테마별 리그에서 경쟁하고 기프티콘을 받아가세요!
          </p>
        </motion.div>

        <AdBanner type="horizontal" />
        <div style={{ marginBottom: 24 }} />

        {/* League Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {leagues.map((league, i) => (
            <motion.div
              key={league.id}
              className="glass-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ padding: 28, position: "relative", overflow: "hidden" }}
            >
              {/* Background gradient */}
              <div style={{
                position: "absolute", top: -60, right: -60,
                width: 180, height: 180, borderRadius: "50%",
                background: `${league.color}10`, pointerEvents: "none"
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                {/* Icon */}
                <div style={{
                  width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                  background: `${league.color}20`, border: `2px solid ${league.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
                }}>
                  {league.emoji}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h2 style={{ fontWeight: 800, fontSize: 20 }}>{league.title}</h2>
                    <span style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                      background: league.status === "진행 중"
                        ? "rgba(34,211,160,0.15)" : "rgba(139,92,246,0.15)",
                      color: league.status === "진행 중" ? "#22d3a0" : "#a78bfa",
                      border: `1px solid ${league.status === "진행 중" ? "rgba(34,211,160,0.3)" : "rgba(139,92,246,0.3)"}`
                    }}>
                      {league.status === "진행 중" ? "🟢" : "🔵"} {league.status}
                    </span>
                  </div>
                  <p style={{ color: "#9090b0", fontSize: 14, marginBottom: 12 }}>{league.subtitle}</p>

                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "#5a5a7a", fontSize: 13, marginBottom: 16 }}>
                    <span>🎁 상품: {league.prize}</span>
                    <span>⏰ {league.daysLeft}일 남음</span>
                    <span>👥 {league.participants.toLocaleString()}명 참여</span>
                    {league.myRank && <span style={{ color: league.color, fontWeight: 700 }}>내 순위: #{league.myRank}</span>}
                  </div>

                  {/* Top 5 mini table */}
                  {league.top5.length > 0 && (
                    <div style={{
                      background: "rgba(255,255,255,0.03)", borderRadius: 10,
                      padding: 12, marginBottom: 16
                    }}>
                      <div style={{ color: "#5a5a7a", fontSize: 11, marginBottom: 8 }}>TOP 5</div>
                      {league.top5.map((user, j) => (
                        <div key={j} style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", marginBottom: j < 4 ? 8 : 0
                        }}>
                          <span style={{ fontSize: 13 }}>
                            {j === 0 ? "🥇" : j === 1 ? "🥈" : j === 2 ? "🥉" : `#${user.rank}`}
                            <span style={{ marginLeft: 8, fontWeight: 600 }}>{user.name}</span>
                            {user.streak >= 5 && <span style={{ marginLeft: 6, fontSize: 11, color: "#f59e0b" }}>🔥{user.streak}</span>}
                          </span>
                          <span style={{ color: league.color, fontWeight: 700, fontSize: 13 }}>
                            {user.points.toLocaleString()}P
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Join button */}
                <div style={{ flexShrink: 0 }}>
                  {joined.includes(league.id) || league.status === "진행 중" ? (
                    <motion.button
                      className="btn-primary"
                      whileTap={{ scale: 0.97 }}
                      style={{ padding: "12px 24px", fontSize: 14 }}
                      onClick={() => handleJoin(league.id)}
                    >
                      {joined.includes(league.id) ? "✅ 참가 중" : "리그 참가"}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: "12px 24px", fontSize: 14, fontWeight: 700,
                        background: `${league.color}20`, border: `1px solid ${league.color}40`,
                        borderRadius: 12, color: league.color, cursor: "pointer"
                      }}
                      onClick={() => handleJoin(league.id)}
                    >
                      {joined.includes(league.id) ? "✅ 참가 신청됨" : "사전 참가 신청"}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How to earn leagues */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: 24, padding: 24 }}
        >
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>📖 리그 포인트 적립 방법</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: "✅", title: "예측 적중", desc: "적중 시 베팅P × 배당률" },
              { icon: "🔥", title: "연속 적중", desc: "3연속 보너스 ×1.5P" },
              { icon: "💬", title: "근거 공유", desc: "댓글 작성 +5P" },
              { icon: "🔗", title: "마켓 공유", desc: "공유 클릭당 +3P" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <div style={{ color: "#9090b0", fontSize: 13 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
