"use client";
import { useEffect, useRef } from "react";

interface KakaoAdProps {
  desktopUnit: string;
  desktopWidth: string;
  desktopHeight: string;
  mobileUnit: string;
  mobileWidth: string;
  mobileHeight: string;
}

export function KakaoAd({
  desktopUnit, desktopWidth, desktopHeight,
  mobileUnit, mobileWidth, mobileHeight
}: KakaoAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isLoaded.current) return;
    
    const isMobile = window.innerWidth < 768;
    const unit = isMobile ? mobileUnit : desktopUnit;
    const width = isMobile ? mobileWidth : desktopWidth;
    const height = isMobile ? mobileHeight : desktopHeight;

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);
    
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//t1.kakaocdn.net/kas/static/ba.min.js";
    script.async = true;
    
    containerRef.current.appendChild(ins);
    containerRef.current.appendChild(script);
    
    isLoaded.current = true;
  }, [desktopUnit, mobileUnit]);

  return <div ref={containerRef} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", overflow: "hidden" }} />;
}

export default function KakaoAdFit() {
  return <KakaoAd desktopUnit="DAN-zApd7Em8ZlHIkbhG" desktopWidth="728" desktopHeight="90" mobileUnit="DAN-Hm8ojyt3Iohd2Lvn" mobileWidth="320" mobileHeight="50" />;
}

export function KakaoAdFitInFeed({ index = 1 }: { index?: number }) {
  const isSecond = index % 2 === 0;
  const unit = isSecond ? "DAN-xbNJKSEOzNo0mhFH" : "DAN-C5UNTpwRjq7K37ui";
  return <KakaoAd desktopUnit={unit} desktopWidth="300" desktopHeight="250" mobileUnit={unit} mobileWidth="300" mobileHeight="250" />;
}

export function KakaoAdFitBottom() {
  return <KakaoAd desktopUnit="DAN-BYDq3An3ulHR9dLB" desktopWidth="728" desktopHeight="90" mobileUnit="DAN-4mIINsmXCf8YesT8" mobileWidth="320" mobileHeight="50" />;
}

export function KakaoAdFitLeaderboard() {
  return <KakaoAd desktopUnit="DAN-2lPOcGFsdE76LhfR" desktopWidth="728" desktopHeight="90" mobileUnit="DAN-N0wYjj6TrctgPqkU" mobileWidth="320" mobileHeight="50" />;
}
