# PoliCat 🐱

한국 최초의 **무료 예측 마켓 플랫폼**. 
정치, 경제, 사회, 스포츠 등의 주요 이슈 결과를 예측하고 적중하여 포인트를 모으고, 이를 실물 기프티콘으로 교환할 수 있습니다. 결제 없이 광고 시청 보상으로만 참여할 수 있는 혁신적인 리워드 기반 예측 플랫폼입니다.

## 🚀 기능 (Features)
- **Supabase 인증 연동**: Google OAuth 로그인 지원
- **실시간 예측 마켓**: 단일 이벤트(YES/NO) 및 다중 후보 이벤트(이벤트 그룹핑)
- **차트 및 트렌드**: 과거 베팅 데이터를 바탕으로 한 시계열 확률 추이 시각화 (`Recharts`)
- **보상 및 상점**: 무료로 쌓은 포인트를 상점에서 상품권, 기프티콘으로 교환
- **리더보드 시스템**: 누적 XP 기반의 사용자 티어 시스템 (Bronze ~ Challenger)
- **커뮤니티 기능**: 트리 구조의 대댓글을 지원하는 실시간 의견 나눔 섹션
- **완전 관리형 어드민 패널**: 마켓 승인, 정산 처리, 상품 발송, 환불 등을 통합 관리

## 🛠️ 기술 스택 (Tech Stack)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Animation**: Framer Motion
- **Charting**: Recharts
- **Deployment**: Vercel

## 📦 배포 (Deployment)
이 프로젝트는 GitHub `main` 브랜치에 코드가 푸시되면 Vercel을 통해 자동으로 운영 환경에 배포됩니다.
