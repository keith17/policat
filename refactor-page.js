const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf-8');

// 1. Add import
if (!content.includes('useInView')) {
  content = content.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect, useCallback } from "react";\nimport { useInView } from "react-intersection-observer";'
  );
}

// 2. Add new states inside Home
content = content.replace(
  'const [filter, setFilter] = useState("all");',
  `const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();`
);

// 3. Rewrite fetchMarketsAndBets to be a useCallback and handle pagination/filter
const oldFetchEffect = content.substring(
  content.indexOf('useEffect(() => {\n    async function fetchMarketsAndBets() {'),
  content.indexOf('fetchMarketsAndBets();\n  }, [user, supabase]);') + 'fetchMarketsAndBets();\n  }, [user, supabase]);'.length
);

const newFetchEffect = `
  const fetchMarketsAndBets = useCallback(async (currentPage: number, currentFilter: string, reset: boolean = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    setIsLoading(true);

    try {
      const now = new Date().toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      let query = supabase.from("markets").select("*").order("created_at", { ascending: false });
      
      if (currentFilter === "closed") {
        // 종료 필터: resolved_yes, resolved_no 이거나 (active 인데 end_date 지났을 때)
        query = query.or(\`status.in.(resolved_yes,resolved_no),and(status.eq.active,end_date.lte.\${now})\`);
      } else {
        // 기본 필터: active 이거나 (resolved 이면서 7일 이내)
        query = query.or(\`status.eq.active,and(status.in.(resolved_yes,resolved_no),resolved_at.gte.\${sevenDaysAgo})\`);
        if (currentFilter !== "all") {
          query = query.eq("category", currentFilter);
        }
      }

      // Pagination
      query = query.range(currentPage * 10, currentPage * 10 + 9);
      
      const { data: mkts } = await query;
      
      let userBets: any[] = [];
      if (user && mkts && mkts.length > 0) {
        const marketIds = mkts.map(m => m.id);
        const { data: bets } = await supabase.from("bets").select("*").eq("user_id", user.id).in("market_id", marketIds);
        userBets = bets || [];
      }

      let enhancedMkts: any[] = [];
      if (mkts && mkts.length > 0) {
        enhancedMkts = mkts.map((m: any) => {
           const total = m.yes_pool + m.no_pool;
           const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
           const noProb = total > 0 ? 100 - yesProb : 50;
           
           const myBetRecord = userBets.find(b => b.market_id === m.id);
           const endDateObj = new Date(m.end_date || m.created_at);
           
           let derivedStatus = m.status;
           if (m.status === "active" && new Date() >= endDateObj) {
             derivedStatus = "ended";
           }
           
           return {
             id: m.id,
             title: m.title,
             category: m.category,
             event_id: m.event_id,
             categoryLabel: m.category === 'economy' ? '경제' : m.category === 'politics' ? '정치' : m.category === 'society' ? '사회' : '스포츠',
             emoji: m.category === 'economy' ? '📈' : m.category === 'politics' ? '🏛️' : m.category === 'society' ? '🤝' : '⚽',
             yesProb, noProb,
             yesAmount: m.yes_pool,
             noAmount: m.no_pool,
             endDate: m.end_date || m.created_at,
             description: m.description || "",
             totalVolume: total,
             participants: Math.floor(total / 100) + 1,
             daysLeft: Math.max(0, Math.ceil((endDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
             hot: total > 5000,
             new: new Date().getTime() - new Date(m.created_at).getTime() < 86400000 * 2,
             myBet: myBetRecord ? myBetRecord.side : null,
             myBetAmount: myBetRecord ? myBetRecord.amount : 0,
             status: derivedStatus
           };
         });
         
         setMarkets(prev => reset ? enhancedMkts : [...prev, ...enhancedMkts]);
         if (mkts.length < 10) setHasMore(false);
      } else {
         if (reset) setMarkets([]);
         setHasMore(false);
      }

      // Fetch events only on first page
      if (reset) {
        const { data: evts } = await supabase.from("events").select("*").eq("status", "active").order("created_at", { ascending: false });
        let fItems: any[] = [];
        if (evts) {
          const enrichedEvents = evts.map((e: any) => ({ ...e, markets: [] })); // Mock markets for event, in real app need proper join
          setEvents(enrichedEvents);
          fItems = [...enrichedEvents.filter(e => e.is_featured).map(e => ({
            id: e.id, type: 'event', title: e.title, description: e.description, emoji: '🎉', markets: e.markets
          }))];
        } else setEvents([]);
        
        // We can't fetch all featured markets easily with pagination, so we'll just fetch top 5 featured
        const { data: featMkts } = await supabase.from("markets").select("*").eq("is_featured", true).order("created_at", { ascending: false }).limit(5);
        if (featMkts) {
          fItems = [...fItems, ...featMkts.map((m:any) => {
            const total = m.yes_pool + m.no_pool;
            const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
            const noProb = total > 0 ? 100 - yesProb : 50;
            return {
              id: m.id, type: 'market', title: m.title, description: m.description,
              emoji: m.category === 'economy' ? '📈' : m.category === 'politics' ? '🏛️' : m.category === 'society' ? '🤝' : '⚽',
              yesProb, noProb, totalVolume: total
            };
          })];
        }
        setFeaturedItems(fItems);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase, hasMore, isLoading]);

  useEffect(() => {
    // Reset and fetch when filter changes or on mount
    setPage(0);
    setHasMore(true);
    fetchMarketsAndBets(0, filter, true);
  }, [filter, user, supabase]); // Do NOT include fetchMarketsAndBets as it will cause loop

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(p => p + 1);
      fetchMarketsAndBets(page + 1, filter, false);
    }
  }, [inView, hasMore, isLoading]);
`;

content = content.replace(oldFetchEffect, newFetchEffect);

// 4. Update the filter buttons UI
const filterHtml = `<div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {["all", "economy", "politics", "society", "sports"].map(cat => (`;

const newFilterHtml = `<div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {["all", "economy", "politics", "society", "sports", "closed"].map(cat => (`;

content = content.replace(filterHtml, newFilterHtml);

const categoryLabelReplacer = `{cat === "all" ? "전체" : cat === "economy" ? "경제" : cat === "politics" ? "정치" : cat === "society" ? "사회" : "스포츠"}`;
const newCategoryLabelReplacer = `{cat === "all" ? "전체" : cat === "economy" ? "경제" : cat === "politics" ? "정치" : cat === "society" ? "사회" : cat === "sports" ? "스포츠" : "종료됨"}`;
content = content.replace(categoryLabelReplacer, newCategoryLabelReplacer);

// 5. Update the markets rendering logic to use markets instead of filteredMarkets, since we filter on DB
content = content.replace(
  `const filteredMarkets = filter === "all"\n    ? markets\n    : markets.filter(m => m.category === filter);`,
  `const filteredMarkets = markets; // Filtering is handled in DB query now`
);

// 6. Add intersection observer ref at the bottom of the list
const marketListEnd = `</AnimatePresence>\n          </div>`;
const newMarketListEnd = `</AnimatePresence>\n          </div>\n          {hasMore && (\n            <div ref={ref} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>\n              {isLoading ? "불러오는 중..." : "스크롤하여 더 보기"}\n            </div>\n          )}\n          {!hasMore && markets.length > 0 && (\n            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>\n              모든 마켓을 불러왔습니다.\n            </div>\n          )}`;

content = content.replace(marketListEnd, newMarketListEnd);

fs.writeFileSync('app/page.tsx', content);
console.log('Successfully refactored app/page.tsx');
