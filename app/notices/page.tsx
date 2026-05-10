import Navbar from "@/components/Navbar";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60; // 1분 캐싱

export default async function NoticesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: notices } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <Navbar points={0} streak={0} />
      
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <span style={{ fontSize: 32 }}>📢</span>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)" }}>
            공지사항
          </h1>
        </div>

        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {notices && notices.length > 0 ? (
            notices.map((notice) => (
              <details 
                key={notice.id} 
                style={{ 
                  background: "var(--bg-card)", 
                  border: "1px solid var(--border)", 
                  borderRadius: 12, 
                  overflow: "hidden" 
                }}
              >
                <summary 
                  style={{ 
                    padding: "20px 24px", 
                    cursor: "pointer", 
                    fontWeight: 700, 
                    fontSize: 16, 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    listStyle: "none"
                  }}
                  className="notice-summary"
                >
                  <span>{notice.title}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </summary>
                <div style={{ padding: "0 24px 24px", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", fontSize: 15, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                  {notice.content}
                </div>
              </details>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)" }}>
              등록된 공지사항이 없습니다.
            </div>
          )}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        details > summary::-webkit-details-marker { display: none; }
        details[open] summary { color: var(--purple-primary); }
        .notice-summary:hover { background: var(--surface-alt); }
      `}} />
    </div>
  );
}
