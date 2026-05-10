import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "폴리캣 | 경제·스포츠·연예 예측 마켓",
  description: "광고 포인트로 경제·스포츠·연예 이슈를 예측하고 기프티콘을 받아가세요! 결제 없이 누구나 즐길 수 있는 한국형 예측 마켓, 폴리캣.",
  keywords: ["예측마켓", "폴리캣", "경제예측", "스포츠예측", "연예예측", "포인트", "기프티콘"],
  openGraph: {
    title: "폴리캣 | 경제·스포츠·연예 예측 마켓",
    description: "광고 포인트로 경제·스포츠·연예 이슈를 예측하고 기프티콘을 받아가세요!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light" data-accent="cobalt" data-density="comfy">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
