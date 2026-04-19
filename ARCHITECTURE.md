# PoliCat Project Architecture

이 문서는 AI 에이전트(혹은 인간 개발자)가 본 프로젝트에 투입되었을 때, 시스템의 전체 구조와 작동 방식을 빠르게 파악하고 계속해서 작업을 이어나가기 위해 작성되었습니다.

## 1. Tech Stack (기술 스택)

*   **Framework**: Next.js 15 (App Router 방식 채택)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Vanilla CSS (`app/globals.css` 활용)
*   **Animation**: Framer Motion
*   **Database & Auth**: Supabase (PostgreSQL, Google OAuth 기반)
*   **Icons**: Lucide React

## 2. Directory Structure (디렉토리 구조)

프로젝트 루트 디렉토리 `/` 를 기준으로 주요 폴더와 파일의 역할입니다.

```text
/
├── app/                  # Next.js App Router (페이지 및 전역 레이아웃)
│   ├── globals.css       # 전역 스타일 및 테마 CSS 변수 선언 (Light Mode 적용됨)
│   ├── layout.tsx        # 앱의 최상위 HTML 구조 및 전역 프로바이더
│   └── page.tsx          # 메인 홈 화면 (히어로, 마켓 목록 등 노출)
├── components/           # 반복/재사용 가능한 React 컴포넌트 목록
│   ├── Navbar.tsx        # 상단 네비게이션바 및 모바일 햄버거 메뉴
│   ├── MarketCard.tsx    # 개별 예측 마켓 카드
│   ├── AdBanner.tsx      # 광고 배너 컴포넌트
│   └── ...               
├── lib/                  # 순수 로직, 데이터 포맷팅 등 유틸리티 (추후 supabase utils 추가 예정)
├── public/               # 이미지(logo, mascot 등) 정적 에셋
└── tailwind.config.ts    # Tailwind 컬러 및 폰트 확장 설정
```

## 3. Core Logic & User Flow (핵심 로직)

1.  **로그인 없음**: 사용자는 플랫폼에 들어와 현재 진행 중인 마켓(투표)을 둘러볼 수 있습니다. 
2.  **구글 로그인**: 마켓에 투표하기 위해서는 Google 로그인이 필요합니다. (Supabase Auth 활용)
3.  **초기 포인트 지급**: 신규 가입(처음 로그인) 시 유저에게 기본 포인트가 지급되며 초기 몇 번의 투표가 가능합니다.
4.  **포인트 소모 및 획득(광고)**: 투표 포인트를 모두 소진할 경우, 배너나 영상 광고 시청 모델을 통해 포인트를 재충전할 수 있습니다.
5.  **예측 결과**: 정답(YES/NO 등) 이 맞춰지면 배당률에 따라 포인트를 얻고, 랭킹(Leaderboard) 시스템에 의해 상위권 유저에게 리워드(기프티콘 등)가 지급되는 구조입니다.

## 4. Development Guidelines (개발 가이드라인)

1.  **모바일 퍼스트(Mobile-first) 유지**: 컴포넌트 작업 시 스마트폰에서의 가독성을 우선적으로 고려하고, 모바일 화면에서 숨기거나 대체되어야 하는 UI(예: 햄버거 메뉴)를 항상 체크해야 합니다.
2.  **화이트 톤 디자인 에셋 관리**: 앱의 기본 색상이 다크에서 라이트로 전환되었습니다. 컬러 하드코딩을 피하고 `globals.css` 에 정의된 CSS 변수(`--bg-primary`, `--purple-primary` 등) 또는 해당 변수와 매핑된 Tailwind 클래스를 사용하세요.
3.  **App Router 제약 준수**: 
    - 상태(State)가 필요하거나 브라우저 API(window) 관련 훅을 사용하는 컴포넌트는 항상 최상단에 `"use client";` 를 명시하세요.
    - SEO나 메타데이터 처리가 필요한 페이지의 경우가 아니라면 클라이언트 컴포넌트와 서버 컴포넌트를 적절히 분리하여 렌더링 성능을 확보해야 합니다.
