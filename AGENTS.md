<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# PoliCat — AI Agent Master Document
## (Act as CTO + CPO. Read this entire file before doing anything.)

이 파일은 AI 에이전트가 PoliCat 프로젝트에 새로 투입될 때 **컨텍스트 없이도 즉시 CTO/CPO처럼 판단하고 행동**하기 위한 마스터 문서입니다. 모든 제품 결정, 기술 결정, 잔여 과제가 이 파일에 집약되어 있습니다. 어떤 새 에이전트도 이 파일 하나만 읽으면 프로젝트 전체를 이어받을 수 있어야 합니다.

---

## 🧠 제품 비전 (Product Vision)

**PoliCat**은 한국 최초의 광고 기반 무료 예측 마켓 플랫폼입니다.

- **핵심 가치**: 돈을 쓰지 않고도 참여 가능한 예측 마켓 (광고 포인트 모델)
- **수익 모델**: 광고 배너/동영상 시청 → 포인트 지급 → 예측 참여 → 적중 시 기프티콘 교환
- **타겟 유저**: 뉴스/시사에 관심 많은 20~40대 한국인
- **운영 방식**: 관리자(koesig@gmail.com)가 마켓 승인/판정을 직접 수행. 완전 자동화 아님.
- **현재 단계**: MVP 배포 완료, 실운영 시작 단계

---

## 📍 현재 상태 (as of 2026-05-13)

### ✅ 완료된 것 (as of 2026-05-13)
| 항목 | 상태 | 비고 |
|------|------|------|
| **(New)** EventCard 디자인 경량화 및 카테고리 7종 확장 | ✅ 완료 | 보라 테두리 제거, 마켓 카드와 톤 통일, 스포츠/연예/IT/국제 추가 |
| **(New)** 이메일 알림 연동 (Resend) | ✅ 완료 | 마켓 생성/승인/정산, 상점 구매 시 이메일 발송 |
| **(New)** 마켓 상태 Lifecycle 고도화 | ✅ 완료 | 진행중/종료(결과대기)/확정 상태 분리, `end_date` 도입 |
| **(New)** 홈 화면 무한 스크롤 및 필터 | ✅ 완료 | 7일 경과 자동 숨김 및 종료됨(closed) 탭 신설 |
| Next.js 16 App Router 기반 UI | ✅ 완료 | 다크 모드 Polymarket 스타일 |
| Supabase Auth (Google OAuth) | ✅ 완료 | 신규 가입 시 profiles 자동 생성 |
| 마켓 목록 Supabase 실데이터 연동 | ✅ 완료 | active/pending 마켓만 노출 |
| 베팅 기능 (bets INSERT + points 차감) | ✅ 완료 | point_transactions 기록 포함 |
| 리더보드 (XP 기준 실시간 Top20) | ✅ 완료 | Supabase에서 직접 Pull |
| 마켓 상세 페이지 | ✅ 완료 | 차트, 베팅 패널, 공유 기능 |
| 어드민 대시보드 | ✅ 완료 | 유저/마켓/주문 관리, 정산 실행 |
| 정산 RPC (resolve_market) | ✅ 완료 | 원자적 배당금+XP 분배 |
| 환불 RPC (refund_market) | ✅ 완료 | 전액 환불 + hidden 처리 |
| XP/Points 분리 | ✅ 완료 | 상점 구매 시 XP 유지 |
| 포인트 상점 (shop_orders) | ✅ 완료 | 포인트 또는 PortOne 카드 결제, 관리자 수동 발송 |
| 프로필 페이지 (내 거래 내역) | ✅ 완료 | 광고 시청 시뮬레이션 포함 |
| 마켓 제안 페이지 (/create) | ✅ 완료 | pending 상태로 저장, 관리자 승인 필요 |
| yes_pool/no_pool DB Trigger | ✅ 완료 | bets INSERT 시 자동 업데이트 |
| Vercel 배포 + GitHub 자동 배포 | ✅ 완료 | main push → 자동 배포 |
| Google OAuth 프로덕션 도메인 설정 | ✅ 완료 | |
| Supabase Auth 프로덕션 URL 설정 | ✅ 완료 | |
| 다중 후보 이벤트(Event) & 주요 마켓(Featured) 캐로셀 | ✅ 완료 | `events` 테이블 추가, 홈 화면 캐로셀 적용 |
| 이벤트 통합 뷰 및 Trend Graph 시각화 | ✅ 완료 | 후보별 실시간 지지율 차트 및 범례 연동 |
| 중첩 댓글 시스템 (대댓글 지원) | ✅ 완료 | `comments` 테이블 기반 커뮤니티 기능 |
| 초기 마켓/이벤트 실데이터 시딩 | ✅ 완료 | 2026 월드컵 예제 (30일치 시계열 베팅 기록) |
| 신규 로고(브랜딩) 업데이트 | ✅ 완료 | 파란색/빨간색 원형 및 볼드 텍스트 SVG 적용 |
| SEO 최적화 및 공지사항 | ✅ 완료 | sitemap, robots 설정 및 공지사항 UI |
| 상점 상품 교환 본인인증 (PortOne) | ✅ 완료 | CI 기반 다계정 어뷰징 차단 구현 |
| **(New)** 푸터 사업자 정보 | ✅ 완료 | 트루러브웨이츠, 대표자 박기석, 강남구 |
| **(New)** 상점 카드 결제 (PortOne) | ✅ 완료 | `/api/shop-payment` 서버 검증, 중복 방지 |

### 🔴 남은 핵심 과제 (GitHub Issues)
| Issue | 제목 | 우선순위 | 비고 |
|-------|------|----------|------|
| #3 | Vercel 배포 | ✅ 완료 | |
| #4 | 광고 실연동 (AdSense) | 중간 | 현재 시뮬레이션, 실제 수익 없음 |
| #5 | RLS 강화 | 낮음 | 베타 단계에서는 현재 수준 허용 |
| #6 | yes_pool Trigger | ✅ 완료 | SQL 이미 실행됨 |
| #7 | /create 어드민 제한 | 낮음 | 누구나 제안 가능, 어드민이 승인하는 구조라 OK |

### 🟡 발견된 버그 / 기술 부채
| 항목 | 설명 | 해결 방법 |
|------|------|----------|
| ~~`point_transactions` type enum에 `ad_reward` 없음~~ | ✅ **수정 완료** - check constraint에 `ad_reward` 추가됨 | - |
| 리더보드 `profiles.email`이 null일 경우 `.split('@')` 에러 | email이 없는 계정에서 crash | `p.email?.split('@')[0] \|\| '익명'` 처리 필요 |
| `profile/[id]` 페이지 mock 데이터 | 타 유저 프로필이 하드코딩 | 추후 Supabase에서 실데이터 Pull 필요 |
| `league/page.tsx` mock 데이터 | 리그 기능이 목 데이터 | 추후 구현 |
| `streak` 값이 DB에 업데이트 안 됨 | Navbar에 streak 표시되지만 항상 0 또는 하드코딩 | 로그인 시 streak 자동 업데이트 로직 필요 |

---

## 🚀 다음으로 해야 할 것 (Next Actions, 우선순위 순)

### 즉시 (지금 당장)
1. **`point_transactions` type enum에 `ad_reward` 추가**
   - Supabase SQL Editor에서 실행:
   ```sql
   ALTER TABLE public.point_transactions 
   DROP CONSTRAINT IF EXISTS point_transactions_type_check;
   ALTER TABLE public.point_transactions 
   ADD CONSTRAINT point_transactions_type_check 
   CHECK (type IN ('signup', 'bet', 'reward', 'ad_watch', 'ad_reward', 'refund', 'shop_purchase'));
   ```

2. **리더보드 email null 버그 수정**
   - `app/leaderboard/page.tsx` line 38: `p.email.split('@')[0]` → `p.email?.split('@')[0] || '익명'`

### 단기 (이번 주)
3. **streak 자동 업데이트 구현**
   - 로그인 시 또는 출석 체크 시 `profiles.streak` +1, 날짜 기반 중복 방지

### 중기 (런칭 후)
5. **Google AdSense 실제 광고 연동** (Issue #4)
6. **커스텀 도메인 연결** (policat.kr 등)
7. **RLS 정책 강화** (Issue #5)

---

## 🏗 기술 스택 요약

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 + Vanilla CSS (`app/globals.css`) |
| 애니메이션 | Framer Motion |
| DB/Auth | Supabase (PostgreSQL + Google OAuth) |
| 아이콘 | Lucide React |
| 차트 | Recharts |
| 배포 | Vercel (GitHub main 브랜치 자동 배포) |
| 로컬 포트 | 3004 (`npm run dev`) |

---

## 🗄 DB 스키마 요약

| 테이블 | 주요 컬럼 | 비고 |
|--------|-----------|------|
| `profiles` | id, email, full_name, points, xp, streak, is_admin | auth.users 확장 |
| `markets` | id, title, category, description, yes_pool, no_pool, status, event_id, is_featured | status: active/pending/resolved_yes/resolved_no/hidden |
| `events` | id, title, description, is_featured, status | 다중 후보 마켓 그룹핑 테이블 |
| `bets` | id, user_id, market_id, side, amount | INSERT 시 Trigger로 yes_pool/no_pool 자동 업데이트 |
| `point_transactions` | id, user_id, amount, type, description | type: signup/bet/reward/ad_watch/ad_reward/refund/shop_purchase |
| `shop_orders` | id, user_id, item_id, item_name, price, contact_info, status | status: pending/completed/canceled |

---

## 🔑 관리자 정보

- **어드민 이메일**: koesig@gmail.com
- **어드민 접근**: `profiles.is_admin = true` 또는 JWT email 체크 (현재 혼용)
- **어드민 대시보드**: `/admin` 페이지

---

## ⚠️ 핵심 주의사항 (절대 위반 금지)

1. **`lib/data.ts` 삭제 금지**: `markets[]`, `leaderboard[]` Mock 데이터가 있음. `app/page.tsx`의 초기값으로 사용. Supabase 데이터로 덮어쓰는 방식 유지.
2. **`components/` 폴더 vs `src/components/` 별개**: `@/components/*`는 루트 `components/` 참조.
3. **Claude Design 등 외부 도구에서 파일 복사 시 `git status` 필수 확인**: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `components/Navbar.tsx`, `components/AdBanner.tsx` 삭제 사고 이력 있음.
4. **Push 전 반드시 `npx next build` 빌드 확인**.
5. **환경변수 `.env.local` 절대 커밋 금지** (`.gitignore`에 포함되어 있음).

---

## 🔧 Push Protocol (매 Push 시 반드시 수행)

1. **`CHANGELOG.md`** — 변경사항 버전 섹션에 기록
2. **`ARCHITECTURE.md`** — 새 파일/DB 컬럼/로직 변경 반영
3. **`ISSUES.md`** — 완료 이슈 체크, 새 이슈 추가
4. **`AGENTS.md`** — 이 파일의 "현재 상태" 섹션 업데이트
5. **GitHub Issues 동기화**:
   - 완료: `gh issue close <N> --comment "완료: <설명>"`
   - 신규: `gh issue create --title "..." --body "..."`
6. **커밋 & Push**:
   ```bash
   git add -A
   git commit -m "<type>: <설명>"
   git push origin main
   ```

## 📦 Commit Message Convention

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 구조 변경 (기능 변화 없음)
docs: 문서 업데이트
chore: 빌드/설정 변경
```

---

## 🗂 Key File Locations

| 경로 | 설명 |
|------|------|
| `app/page.tsx` | 메인 홈 (마켓 목록 + 베팅 모달) |
| `app/admin/page.tsx` | 관리자 대시보드 |
| `app/profile/me/page.tsx` | 내 프로필 + 포인트 내역 + 광고 시청 |
| `app/create/page.tsx` | 마켓 제안 (pending으로 저장, 어드민 승인 필요) |
| `app/shop/page.tsx` | 포인트 상점 |
| `app/leaderboard/page.tsx` | XP 기준 랭킹 |
| `components/Navbar.tsx` | 상단 바 (포인트/티어/스트릭) |
| `components/AdRewardModal.tsx` | 광고 시청 모달 (현재 5초 시뮬레이션) |
| `lib/data.ts` | Mock 데이터 + 유틸 함수 |
| `utils/supabase/client.ts` | 브라우저 Supabase 클라이언트 |
| `utils/supabase/server.ts` | 서버 Supabase 클라이언트 |
| `supabase_init.sql` | DB 초기 스키마 |
| `rpc_settlement.sql` | resolve_market / refund_market RPC |
| `update_xp.sql` | XP 컬럼 추가 + resolve_market 업데이트 |
| `update_shop_orders.sql` | shop_orders 테이블 + RLS |
