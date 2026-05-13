"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TermsGate from "@/components/TermsGate";
import { createClient } from "@/utils/supabase/client";

function AgreeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") ?? "/";
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else router.replace("/");
    });
  }, [router]);

  if (!userId) {
    return <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />;
  }

  return (
    <TermsGate
      userId={userId}
      onComplete={(agreed) => {
        router.replace(agreed ? next : "/");
      }}
    />
  );
}

export default function AgreePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />}>
      <AgreeContent />
    </Suspense>
  );
}
