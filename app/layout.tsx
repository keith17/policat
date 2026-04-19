import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "폴리캣 | 경제·정치 예측 마켓",
  description: "광고 포인트로 경제·정치 이슈를 예측하고 기프티콘을 받아가세요! 결제 없이 누구나 즐길 수 있는 한국형 예측 마켓, 폴리캣.",
  keywords: ["예측마켓", "폴리캣", "경제예측", "정치예측", "포인트", "기프티콘"],
  openGraph: {
    title: "폴리캣 | 경제·정치 예측 마켓",
    description: "광고 포인트로 경제·정치 이슈를 예측하고 기프티콘을 받아가세요!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
