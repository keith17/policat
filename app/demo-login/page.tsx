import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const DEMO_EMAIL = "demo@policat.kr";
const DEMO_NAME  = "PG심사 데모계정";

async function generateDemoMagicLink(origin: string): Promise<string | null> {
  const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Generate magic link (creates user automatically if email auth is enabled,
  // otherwise we create the user first and retry)
  let { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: DEMO_EMAIL,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    // User may not exist — create them
    const { data: created } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: DEMO_NAME },
    });
    if (created?.user) {
      // Ensure profile row with terms_agreed and demo points
      await admin.from("profiles").upsert({
        id: created.user.id,
        email: DEMO_EMAIL,
        full_name: DEMO_NAME,
        points: 50000,
        xp: 50000,
        terms_agreed: true,
        terms_agreed_at: new Date().toISOString(),
      });
    }
    // Retry
    const retry = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: DEMO_EMAIL,
      options: { redirectTo: `${origin}/auth/callback` },
    });
    data  = retry.data;
    error = retry.error;
  }

  if (error || !data?.properties?.hashed_token) return null;

  // Make sure profile has terms_agreed (in case user existed but flag was missing)
  if (data.user) {
    await admin.from("profiles").update({ terms_agreed: true }).eq("id", data.user.id);
  }

  // Bypass Supabase's own verify URL — redirect straight to our callback with the token_hash
  return `${origin}/auth/callback?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink`;
}

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function DemoLoginPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const demoKey = process.env.DEMO_LOGIN_KEY;

  // --- Invalid or missing key: show static info page ---
  if (!key || !demoKey || key !== demoKey) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f13", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 460, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>PG 심사 접근</h1>
          <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7 }}>
            이 페이지는 PG사 심사용 임시 접근 경로입니다.<br />
            올바른 접근 키가 포함된 링크를 사용해 주세요.
          </p>
        </div>
      </div>
    );
  }

  // --- Valid key: generate magic link and redirect ---
  const headersList = await headers();
  const host    = headersList.get("host") ?? "policat.kr";
  const proto   = headersList.get("x-forwarded-proto") ?? "https";
  const origin  = `${proto}://${host}`;

  const magicLink = await generateDemoMagicLink(origin);

  if (!magicLink) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f13", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 460, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>로그인 링크 생성 실패</h1>
          <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7 }}>
            서버 설정을 확인해주세요.<br />
            <code style={{ fontSize: 12, color: "#6366f1" }}>SUPABASE_SERVICE_ROLE_KEY</code> 환경변수가 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  redirect(magicLink);
}
