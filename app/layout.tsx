import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import TermsGate from "@/components/TermsGate";
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4553206222153896"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          id="channel-io"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){var w=window;if(w.ChannelIO){return;}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
ChannelIO('boot',{"pluginKey":"9f4d4b97-4990-4df1-8879-ea583562aa60","hideChannelButtonOnBoot":true});
            `
          }}
        />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <TermsGate />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
