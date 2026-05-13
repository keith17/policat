# CHANGELOG

이 파일은 PoliCat 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.

---

## [0.9.3] - 2026-05-13
### 추가
- 약관 동의 플로우 개선: 최초 로그인 시 `/agree` 페이지로 리다이렉트, 이후 재요청 없음
- `/agree` 페이지 신설: OAuth 콜백에서 `terms_agreed=false`인 경우 약관 동의 후 원래 경로로 이동
- 상점 상품 상세 페이지 `/shop/[id]` 신설: 이미지·설명·복합결제 UI 포함
- Giftishow Biz URL 자동 스크래핑 `/api/giftishow-scrape`: 내부 `/fo_api/ggoods/detail` POST API 직접 호출
- 어드민 상품 등록 폼에 Giftishow URL 입력 → 상품명·가격·이미지·설명 자동 입력 기능
- `shop_items` 테이블에 `image_url`, `giftishow_url` 컬럼 추가 (`update_shop_items_columns.sql`)
- 상점 구매 완료 시 관리자 이메일 알림 (`sendAdminOrderNotification`) — koesig@gmail.com + tlw.seoul@gmail.com 동시 수신
- `tlw.seoul@gmail.com` 관리자 계정 추가 (어드민 대시보드 접근 및 이메일 알림)
- PG 심사용 임시 로그인 `/demo-login?key=...`: 서비스 롤 키로 데모 계정 매직링크 자동 생성
- 푸터에 통신판매신고번호 `2024-서울강남-00378호` 표기 추가

### 수정
- `app/page.tsx` 베팅 플로우에서 약관 게이트 로직 완전 제거
- `app/auth/callback/route.ts`: 세션 교환 후 `profiles.terms_agreed` 확인 → 미동의 시 `/agree`로 리다이렉트
- Giftishow 스크래핑: HTML 파싱(실패) → 내부 JSON API 직접 호출로 교체

---

## [0.9.2] - 2026-05-13
### 추가
- 푸터에 사업자 정보 추가: 트루러브웨이츠, 대표자 박기석, 서울시 강남구 테헤란로63길 12, 235호
- 포인트 상점 이중 결제 구현: 포인트 부족 시 PortOne 신용카드 결제 자동 선택
- `/api/shop-payment` 서버사이드 결제 검증 API 추가 (PortOne 결제 상태·금액 검증 + 중복 방지)
- 상점 상품 카드에 포인트 결제 / 카드 결제 버튼 동시 노출, 잔액 기준 자동 탭 선택

### 수정
- PortOne SDK `requestPayment` TypeScript 타입 오류 우회 (`alipayPlus` 필수 타입 버그)

---

## [0.9.1] - 2026-05-13
### 변경
- `EventCard` 디자인 경량화: 보라 테두리·상단 액센트 바 제거, `glass-card` 기반으로 마켓 카드와 톤 통일. 왼쪽 3px 파란 줄로 이벤트 구분 유지
- 이벤트 카드 후보 목록 레이아웃: 회색 박스 제거 → 구분선 + 플레인 텍스트 구조로 가독성 개선
- 이벤트 카드 CTA 버튼: 보라 글로우 → `btn-primary` (다크, 심플) 로 변경
### 추가
- 카테고리 7종으로 확대: 스포츠 ⚽, 연예 🎬, IT/기술 💻, 국제 🌍 신규 추가 (기존 경제·정치·사회 유지)
- 홈 필터 탭 이모지 적용 및 신규 카테고리 탭 노출
- `design-system/components.css`에 `tag-entertainment`, `tag-tech`, `tag-international` 색상 토큰 추가
- `app/page.tsx` 카테고리 매핑 `CATEGORY_MAP` 상수로 통합 (중복 ternary 제거)

---

## [0.9.0] - 2026-05-12
### 추가
- `resend` 연동 이메일 알림 시스템 구축 (마켓 생성, 승인, 판정 및 상점 교환 시 자동 알림)
- 마켓 라이프사이클 세분화 (진행 중 / 결과 판정 대기 중 / 결과 확정) 및 DB `end_date` 컬럼 추가
- `/create` 마켓 제안 시 마감 시간(`datetime-local`) 지정 기능 추가
- 홈 화면 피드 무한 스크롤(Pagination) 도입 및 트래픽 부하 최적화
- 결과 확정 후 7일 경과 마켓 기본 피드에서 자동 숨김 및 '종료됨(Closed)' 전용 필터 탭 신설
- 내가 참여한 마켓의 결과 (예측 적중/실패 여부 및 배당금 예상) 직관적 UI로 분리 노출

---

## [0.8.0] - 2026-05-10
### 추가
- 공지사항 기능 신설 (`announcements` 테이블, `app/notices`, 관리자 패널 연동)
- 구글 검색 노출을 위한 SEO 최적화 (`sitemap.xml`, `robots.txt` 동적 생성)
- 메타데이터 및 OG Tag 동적 적용 (정치 키워드 배제, 경제/스포츠/연예 특화)
- 상점 상품 교환 시 포트원(PortOne) 기반 휴대폰 본인인증 도입
- 본인인증 CI(연계정보) 값을 이용한 다계정 어뷰징 차단 로직 (DB 수준 UNIQUE 제약)

---

## [0.7.0] - 2026-05-06
### 추가
- 이벤트 통합 뷰 및 후보별 확률 실시간 시각화 (`EventCard`, `FeaturedCarousel`)
- `components/TrendGraph.tsx`: 시계열 트렌드 차트 추가 및 홈페이지, 상세 페이지 연동
- 중첩 댓글 시스템 (`comments` 테이블 및 `CommentSection.tsx` 트리 구조 대댓글)
- 실제 데이터를 반영한 마켓 초기 시드 (`/seed`, 2026 북중미 월드컵 A조)
### 변경
- 브랜딩 로고 업데이트 (파란색/빨간색 원형 및 볼드 텍스트 SVG 적용)

---

## [0.6.0] - 2026-04-30
### 추가
- 홈 화면 상단에 Featured Market & Event 캐로셀(Carousel) 추가
- `events` 테이블 추가를 통한 다중 후보(Market) 그룹핑 기능
- `EventCard` 컴포넌트 추가 및 `/event/[id]` 상세 페이지 구현
- 관리자 페이지(`app/admin/page.tsx`) 내 이벤트 생성 및 Featured 토글 기능 추가
- `update_events.sql` 마이그레이션 스크립트 작성

---

## [0.5.1] - 2026-04-26
### 수정됨 (DB)
- `point_transactions.type` check constraint에 `ad_reward` 추가
  - Supabase SQL Editor에서 직접 실행
  - 이제 `/profile/me` 광고 시청 보상이 정상 기록됨

---

## [0.5.0] - 2026-04-26
### 완료
- Vercel 프로덕션 배포 완료 (Issue #3 close)
- Google OAuth 프로덕션 도메인 리디렉션 URI 등록
- Supabase Auth 프로덕션 URL 설정
- `bets` INSERT 시 `markets.yes_pool`/`no_pool` 자동 업데이트 DB Trigger 실행 (Issue #6 close)

### 문서
- `AGENTS.md` CTO/CPO 마스터 문서로 전면 재작성 (에이전트 컨텍스트 없이도 즉시 투입 가능)
- `ARCHITECTURE.md` DB 스키마 전체, RPC 함수, 런칭 체크리스트 추가
- `CHANGELOG.md` 전체 버전 이력 신규 작성
- `ISSUES.md` Issue #1, #2 완료 표시 / Issue #6, #7 신규 등록

### 발견된 버그 (수정 필요)
- `point_transactions.type` check constraint에 `ad_reward` 미포함 → INSERT 오류 가능
- `leaderboard` 페이지 `p.email.split('@')` null 참조 에러 가능

### 수정됨
- `lib/data.ts`: `markets[]`, `leaderboard[]` Mock 데이터 복구 (Claude Design 복사 사고로 삭제됨)
- `components/Navbar.tsx`: `xp` optional prop 추가
- `app/page.tsx`: `markets as initialMarkets` import 제거, `useState<any[]>([])` 초기화

---

## [0.4.0] - 2026-04-21
### 추가
- `app/shop/page.tsx`: 포인트 상점 페이지 신규 생성
  - 스타벅스, 네이버페이, GS25, 배달의민족 등 실물 쿠폰 교환 기능
  - `shop_orders` 테이블에 주문 INSERT 및 `point_transactions` 내역 기록
  - 포인트 차감 시 XP(경험치)는 유지되도록 분리 처리
- `update_shop_orders.sql`: `shop_orders` 테이블 및 RLS 정책 추가
  - 유저는 자신의 주문만 조회/생성 가능
  - 관리자(koesig@gmail.com)는 전체 조회/수정 가능
- `update_xp.sql`: `profiles` 테이블에 `xp` 컬럼 분리
  - XP는 배당금 획득 시만 증가, 상점 구매 시 감소하지 않음
  - 기존 유저 XP 백필(Backfill) 쿼리 포함
  - `resolve_market` RPC 함수 업데이트: 배당금 지급 시 `points + xp` 동시 증가

### 변경
- `components/Navbar.tsx`: XP 기반 티어 표시 지원, `xp` prop 추가
- `app/page.tsx`: 신규 가입자 프로필 로딩 시 `xp` fallback 처리

---

## [0.3.0] - 2026-04-21
### 추가 (Polymarket 디자인 리팩토링 + Supabase 실데이터 연동)
- `app/page.tsx` (홈): Supabase `markets` 테이블에서 실시간 데이터 Pull
  - `active`, `pending` 상태 마켓만 필터링
  - 유저별 베팅 내역 조회 후 `myBet` 필드 반영
  - 베팅 시 `bets` INSERT + `profiles` 포인트 차감 + `point_transactions` 기록
- `app/leaderboard/page.tsx`: Supabase `profiles`에서 XP 기준 Top 20 실시간 랭킹
- `app/market/[id]/page.tsx`: 마켓 상세 페이지 Supabase 실데이터 연동
  - 개별 마켓 베팅, 확률 계산, 차트 표시
- `app/admin/page.tsx`: 어드민 패널 Supabase 실데이터 연동
  - `profiles`, `markets`, `shop_orders` 테이블 관리
  - `resolve_market`, `refund_market` RPC 호출 버튼
- `app/profile/me/page.tsx`: 내 프로필 Supabase 실데이터 연동
  - 내 베팅 내역, `point_transactions` 이력 표시
- `lib/data.ts`: Mock 마켓 데이터 제거, 유틸 함수(`tierConfig`, `getTier`, `formatPoints`, `formatDate`)만 유지

### 변경
- 전체 UI: 다크 모드(Polymarket 스타일 금융 터미널) 디자인으로 통일
- `components/Navbar.tsx`: 라이트 → 다크 테마로 변경

---

## [0.2.0] - 2026-04-20
### 추가
- `app/earn/page.tsx`: 포인트 획득 페이지
  - 광고 시청(시뮬레이션), 일일 출석 체크, 친구 초대 링크 복사
- `components/AdBanner.tsx`: 광고 배너 컴포넌트 (더미 배너, AdVideoReward 포함)
- `components/AdRewardModal.tsx`: 광고 시청 모달 (5초 카운트다운 후 보상 지급)
- `app/admin/page.tsx`: 관리자 대시보드
  - 마켓 결과 판정(YES/NO), 환불 기능
  - `rpc_settlement.sql` RPC 함수 연동
- `rpc_settlement.sql`: Supabase `resolve_market`, `refund_market` RPC 함수
  - 원자적(Atomic) 트랜잭션으로 배당금 분배
  - 패배자 포인트 미차감, 승리자에게 풀 배당

---

## [0.1.0] - 2026-04-16
### 최초 생성
- Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion 기반 프로젝트 초기화
- Supabase 연동 (`profiles`, `markets`, `bets`, `point_transactions` 테이블)
- Google OAuth 로그인 (Supabase Auth)
- `supabase_init.sql`: DB 스키마 및 기본 RLS 정책
- `app/page.tsx`: 메인 홈 화면 (마켓 목록, 베팅 모달)
- `app/leaderboard/page.tsx`: 랭킹 페이지
- `app/league/page.tsx`: 예측 리그 페이지 (목 데이터)
- `app/guide/page.tsx`: 이용 가이드 페이지
- `app/tos/page.tsx`: 이용 약관 페이지
- `app/profile/me/page.tsx`: 내 프로필 페이지
- `components/Navbar.tsx`: 상단 네비게이션바
- `components/MarketCard.tsx`: 마켓 카드 컴포넌트
- `SETUP_GUIDE.md`: Vercel 배포 가이드 문서
