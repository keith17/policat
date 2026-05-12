"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare, Send, Reply, Trash2, User } from "lucide-react";

const ADJECTIVES = ['빠른', '조용한', '용감한', '영리한', '귀여운', '재빠른', '슬기로운', '당찬', '명랑한', '든든한', '유쾌한', '차분한'];
const ANIMALS   = ['고양이', '여우', '독수리', '사자', '호랑이', '펭귄', '판다', '늑대', '거북이', '토끼', '부엉이', '다람쥐'];

function generateNickname(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash);
  const adj    = ADJECTIVES[abs % ADJECTIVES.length];
  const animal = ANIMALS[(abs >> 4) % ANIMALS.length];
  const suffix = userId.replace(/-/g, '').slice(0, 4);
  return `${adj}${animal}_${suffix}`;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  profiles: { avatar_url: string | null };
  replies?: Comment[];
}

interface CommentSectionProps {
  marketId?: string;
  eventId?: string;
  currentUser: any;
}

export default function CommentSection({ marketId, eventId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
  }, [marketId, eventId]);

  const fetchComments = async () => {
    let query = supabase.from("comments").select("*, profiles(avatar_url)").order("created_at", { ascending: true });
    if (marketId) query = query.eq("market_id", marketId);
    if (eventId) query = query.eq("event_id", eventId);
    
    const { data } = await query;
    if (data) {
      // Build tree
      const map = new Map<string, Comment>();
      const roots: Comment[] = [];
      data.forEach(c => map.set(c.id, { ...c, replies: [] }));
      data.forEach(c => {
        if (c.parent_id) {
          const parent = map.get(c.parent_id);
          if (parent) parent.replies!.push(map.get(c.id)!);
        } else {
          roots.push(map.get(c.id)!);
        }
      });
      setComments(roots);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!input.trim() || !currentUser) return;
    
    const newComment = {
      user_id: currentUser.id,
      content: input.trim(),
      market_id: marketId || null,
      event_id: eventId || null,
      parent_id: replyTo ? replyTo.id : null,
    };

    setInput("");
    setReplyTo(null);

    await supabase.from("comments").insert(newComment);
    fetchComments(); // Reload
  };

  const handleDelete = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  };

  const CommentItem = ({ c, isReply = false }: { c: Comment, isReply?: boolean }) => {
    const isOwner = currentUser?.id === c.user_id;
    const name = generateNickname(c.user_id);
    return (
      <div style={{ marginLeft: isReply ? 40 : 0, marginTop: 16, borderLeft: isReply ? "2px solid var(--border)" : "none", paddingLeft: isReply ? 16 : 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-alt)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={18} color="var(--text-muted)" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{name}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.created_at.substring(0, 16).replace("T", " ")}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8, whiteSpace: "pre-wrap" }}>
              {c.content}
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              {!isReply && currentUser && (
                <button onClick={() => setReplyTo({ id: c.id, name })} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Reply size={14} /> 답글 달기
                </button>
              )}
              {isOwner && (
                <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", color: "var(--accent-no)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Trash2 size={14} /> 삭제
                </button>
              )}
            </div>
          </div>
        </div>
        {c.replies && c.replies.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {c.replies.map(r => <CommentItem key={r.id} c={r} isReply={true} />)}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div style={{ height: 100 }} className="animated-bg" />;

  return (
    <div style={{ marginTop: 60 }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <MessageSquare size={20} color="var(--accent)" /> 의견 나누기
      </h3>
      
      {currentUser ? (
        <div style={{ marginBottom: 32 }}>
          {replyTo && (
            <div style={{ fontSize: 13, color: "var(--purple-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Reply size={14} /> {replyTo.name}님에게 답글 작성 중
              <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline" }}>취소</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-alt)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {currentUser.user_metadata?.avatar_url ? <img src={currentUser.user_metadata.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={20} color="var(--text-muted)" />}
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="자유롭게 의견을 남겨주세요..."
                style={{ width: "100%", minHeight: 80, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", resize: "vertical", fontSize: 14 }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                style={{ position: "absolute", bottom: 12, right: 12, background: input.trim() ? "var(--text-primary)" : "var(--border)", color: "var(--bg-primary)", padding: "8px 16px", borderRadius: 8, border: "none", fontWeight: 700, cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Send size={14} /> 등록
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 24, background: "var(--bg-card)", borderRadius: 12, textAlign: "center", border: "1px solid var(--border)", marginBottom: 32, color: "var(--text-secondary)" }}>
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}

      <div>
        {comments.length > 0 ? comments.map(c => <CommentItem key={c.id} c={c} />) : (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: 12, border: "1px dashed var(--border)" }}>
            아직 의견이 없습니다. 첫 번째로 의견을 남겨보세요!
          </div>
        )}
      </div>
    </div>
  );
}
