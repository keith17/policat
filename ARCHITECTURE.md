# PoliCat Project Architecture

이 문서는 AI 에이전트(혹은 인간 개발자)가 본 프로젝트에 투입되었을 때, 시스템의 전체 구조와 작동 방식을 빠르게 파악하고 계속해서 작업을 이어나가기 위해 작성되었습니다.

## 1. Tech Stack (기술 스택)

*   **Framework**: Next.js 16 (App Router 방식 채택)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Vanilla CSS (`app/globals.css` 활용)
*   **Animation**: Framer Motion
*   **Database & Auth**: Supabase (PostgreSQL, Google OAuth 기반)
*   **Icons**: Lucide React
*   **Charts**: Recharts

## 2. Directory Structure (디렉토리 구조)

```text
/
├── app/                        # Next.js App Router (페이지 및 전역 레이아웃)
│   ├── globals.css             # 전역 스타일 및 테마 CSS 변수 (다크 모드 기준)
│   ├── layout.tsx              # 앱의 최상위 HTML 구조 및 전역 프로바이더
│   ├── page.tsx                # 메인 홈 화면 (마켓 목록, 베팅 모달)
│   ├── admin/page.tsx          # 관리자 대시보드 (유저/마켓/주문 관리, 정산 실행)
│   ├── auth/callback/          # Supabase OAuth 콜백 라우트
│   ├── create/page.tsx         # 마켓 생성 페이지
│   ├── earn/page.tsx           # 포인트 획득 페이지 (광고, 출석, 초대)
│   ├── guide/page.tsx          # 이용 가이드 페이지
│   ├── leaderboard/page.tsx    # XP 기반 랭킹 페이지 (Supabase 실데이터)
│   ├── league/page.tsx         # 예측 리그 페이지 (목 데이터)
│   ├── market/[id]/page.tsx    # 마켓 상세 페이지 (베팅, 차트, 댓글)
│   ├── profile/
│   │   ├── me/page.tsx         # 내 프로필 (잔액, 베팅 내역, 거래 이력)
│   │   └── [id]/page.tsx       # 타 유저 프로필 (목 데이터)
│   ├── seed/page.tsx           # DB 씨드 데이터 삽입 페이지 (개발용)
│   ├── shop/page.tsx           # 포인트 상점 (쿠폰 교환, shop_orders 연동)
│   └── tos/page.tsx            # 이용 약관 페이지
├── components/                 # 반복/재사용 가능한 React 컴포넌트
│   ├── Navbar.tsx              # 상단 네비게이션바 (포인트, 티어, 스트릭 표시)
│   ├── MarketCard.tsx          # 개별 예측 마켓 카드 (YES/NO 버튼 포함)
│   ├── AdBanner.tsx            # 광고 배너 컴포넌트 (더미 / AdVideoReward 포함)
│   └── AdRewardModal.tsx       # 광고 시청 모달 (5초 카운트다운 후 보상 지급)
├── lib/
│   └── data.ts                 # 유틸 함수 및 Mock 마켓 데이터
│                               # (markets[], leaderboard[], tierConfig, getTier, formatPoints, formatDate)
│                               # ⚠️ Mock 데이터는 추후 완전히 Supabase로 대체 예정
├── utils/
│   └── supabase/
│       ├── client.ts           # Supabase 브라우저 클라이언트 (use client 컴포넌트용)
│       └── server.ts           # Supabase 서버 클라이언트 (Server Components / Route Handler용)
├── public/                     # 정적 에셋 (mascot.png, logo 등)
├── supabase_init.sql           # DB 최초 스키마 마이그레이션 (테이블 + 기본 RLS)
├── rpc_settlement.sql          # resolve_market / refund_market RPC 함수
├── update_xp.sql               # XP 컬럼 추가 및 resolve_market 함수 업데이트
├── update_shop_orders.sql      # shop_orders 테이블 및 RLS 정책
├── update_events.sql           # events 테이블 및 featured 기능 추가
├── CHANGELOG.md                # 버전별 변경 이력
├── ISSUES.md                   # 런칭 전 잔여 이슈 목록 (GitHub Issues와 동기화)
├── AGENTS.md                   # AI 에이전트 작업 규칙 (매 Push 시 업데이트)
├── ARCHITECTURE.md             # 이 문서 (프로젝트 전체 구조 설명)
└── SETUP_GUIDE.md              # Vercel 배포 및 환경 변수 설정 가이드
```

## 3. Database Schema (DB 스키마)

### `profiles` (auth.users 확장)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users.id 참조 |
| email | text | 이메일 |
| full_name | text | 이름 |
| avatar_url | text | 프로필 이미지 URL |
| points | integer | 현재 사용 가능 포인트 (베팅/상점에서 차감) |
| xp | integer | 경험치 (배당금 획득 시만 증가, 상점 구매 시 차감 안 됨) |
| streak | integer | 연속 출석 일수 |
| is_admin | boolean | 관리자 여부 |
| is_verified | boolean | 휴대폰 본인인증 완료 여부 (PortOne) |
| phone_number | text | 인증된 휴대폰 번호 |
| real_name | text | 인증된 실명 |
| ci | text | 연계정보 (UNIQUE 제약, 다계정 어뷰징 차단용) |
| di | text | 중복가입확인정보 |

### `markets`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| title | text | 마켓 제목 |
| category | text | 카테고리 (economy, politics, society, sports) |
| description | text | 마켓 상세 설명 |
| yes_pool | integer | YES 쪽에 걸린 총 포인트 |
| no_pool | integer | NO 쪽에 걸린 총 포인트 |
| status | text | active / pending / resolved_yes / resolved_no / hidden / cancelled |
| event_id | uuid | events.id 참조 (다중 후보 마켓의 경우) |
| is_featured | boolean | 상단 캐로셀 노출 여부 |
| created_at | timestamptz | - |
| resolved_at | timestamptz | 판정 완료 시각 |
| resolved_by | uuid | 판정한 어드민 ID |

### `events`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| title | text | 이벤트 제목 |
| description | text | 이벤트 설명 |
| is_featured | boolean | 상단 캐로셀 노출 여부 |
| status | text | active / closed / hidden |
| created_at | timestamptz | - |

### `bets`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| user_id | uuid | profiles.id 참조 |
| market_id | uuid | markets.id 참조 |
| side | text | 'yes' 또는 'no' |
| amount | integer | 베팅 포인트 |

### `point_transactions`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| user_id | uuid | profiles.id 참조 |
| amount | integer | 양수(적립) 또는 음수(차감) |
| type | text | signup / bet / reward / ad_watch / refund / shop_purchase |
| description | text | 거래 상세 설명 |

### `shop_orders`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| user_id | uuid | profiles.id 참조 |
| item_id | text | 상품 코드 |
| item_name | text | 상품명 |
| price | integer | 차감된 포인트 |
| contact_info | text | 쿠폰 수신 연락처 |
| status | text | pending / completed / canceled |

### `comments`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| market_id | uuid | markets.id 참조 (null 가능) |
| event_id | uuid | events.id 참조 (null 가능) |
| user_id | uuid | profiles.id 참조 |
| parent_id | uuid | comments.id 참조 (null이면 최상위 댓글) |
| content | text | 댓글 내용 |
| created_at | timestamptz | - |

## 4. Core Logic & User Flow (핵심 로직)

1.  **비로그인 접속**: 마켓 목록 조회 가능, 베팅 불가
2.  **Google 로그인**: Supabase Auth → `handle_new_user` 트리거가 `profiles` 자동 생성 (초기 300P 지급)
3.  **베팅 흐름**:
    - `bets` INSERT → `profiles.points` 차감 → `point_transactions` 기록
    - 마켓 `yes_pool` / `no_pool` 업데이트는 DB Trigger 또는 어드민 수동 처리 (현재 미구현)
4.  **정산 흐름 (어드민)**:
    - 어드민이 `/admin`에서 결과 클릭 → `resolve_market(market_id, side)` RPC 호출
    - RPC가 원자적으로 승리자 포인트 + XP 분배 → `point_transactions` 기록 → 마켓 상태 `resolved_*` 변경
5.  **환불 흐름**: `refund_market(market_id)` RPC → 전액 환불 → 마켓 `hidden` 처리
6.  **상점 교환**: 포인트 차감 → `shop_orders` INSERT → 관리자가 수동으로 쿠폰 발송 → status `completed` 업데이트

## 5. RPC Functions (Supabase)

| 함수명 | 파일 | 설명 |
|--------|------|------|
| `resolve_market(p_market_id, p_winning_side)` | `update_xp.sql` | 마켓 판정 및 배당금+XP 지급 |
| `refund_market(p_market_id)` | `rpc_settlement.sql` | 마켓 취소 및 원금 환불 |
| `handle_new_user()` | `supabase_init.sql` | 신규 가입 시 profiles 자동 생성 트리거 |

## 6. Development Guidelines (개발 가이드라인)

1.  **모바일 퍼스트(Mobile-first) 유지**: 컴포넌트 작업 시 스마트폰 가독성 우선
2.  **다크 모드 디자인 시스템**: `app/globals.css`에 정의된 CSS 변수 사용
    - `--bg-primary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--purple-primary`, `--accent-yes`, `--accent-no`, `--border` 등
3.  **App Router 제약 준수**:
    - 상태/브라우저 API 사용 컴포넌트는 `"use client"` 명시
    - 서버/클라이언트 컴포넌트 분리
4.  **Supabase 클라이언트 선택**:
    - 클라이언트 컴포넌트: `@/utils/supabase/client`
    - 서버 컴포넌트 / Route Handler: `@/utils/supabase/server`

## 7. Push Protocol (매 Push 시 반드시 수행)

매번 GitHub에 Push할 때 아래 절차를 반드시 수행한다:

1. **CHANGELOG.md** 업데이트: 변경사항을 해당 버전 섹션에 기록
2. **ARCHITECTURE.md** 업데이트: 새로 추가/변경된 파일, DB 컬럼, 로직 반영
3. **ISSUES.md** 업데이트: 완료된 이슈 체크, 새로운 이슈 추가
4. **GitHub Issues** 동기화: 완료된 이슈 close, 새 이슈 등록
5. **AGENTS.md** 확인: 에이전트 작업 규칙에 변경사항 있으면 업데이트
6. `git add -A && git commit -m "..."` → `git push origin main`

## 8. Launch Checklist (런칭 전 필수 완료 항목)

- [x] Supabase 백엔드 ↔ 프론트엔드 실시간 연동 (Issue #1)
- [x] 결과 판정 및 포인트 정산 RPC 로직 (Issue #2)
- [ ] Vercel 프로덕션 배포 및 환경변수 세팅 (Issue #3)
- [ ] Google AdSense 실제 광고 연동 (Issue #4)
- [ ] Supabase RLS 정책 강화 (Issue #5)
- [ ] `markets.yes_pool` / `no_pool` 자동 업데이트 DB Trigger 구현 (신규)
- [ ] 마켓 생성(`/create`) 어드민 전용 접근 제한 (신규)
