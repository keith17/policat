// Mock data removed. Data is now fetched from Supabase.

export const tierConfig = {
  rookie: { label: "루키", color: "#94a3b8", minPoints: 0, emoji: "🐣" },
  predictor: { label: "예측가", color: "#22d3a0", minPoints: 5000, emoji: "🔮" },
  analyst: { label: "분석가", color: "#60a5fa", minPoints: 25000, emoji: "📊" },
  strategist: { label: "전략가", color: "#c084fc", minPoints: 100000, emoji: "🧠" },
  oracle: { label: "오라클", color: "#f59e0b", minPoints: 500000, emoji: "👑" },
};

export function getTier(points: number) {
  if (points >= 500000) return "oracle";
  if (points >= 100000) return "strategist";
  if (points >= 25000) return "analyst";
  if (points >= 5000) return "predictor";
  return "rookie";
}

export function formatPoints(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만P`;
  return `${n.toLocaleString()}P`;
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
