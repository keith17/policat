# Policat 런칭 전 잔여 할 일 (GitHub Issues)

현재까지 프론트엔드의 화면 레이아웃, 로그인 체계, Supabase 실데이터 연동, 정산 RPC 로직이 완성되었습니다.
완전한 실 서비스 런칭을 위해 반드시 구현해야 하는 남은 이슈들입니다.

---

## ✅ Issue 10: 마켓 라이프사이클 및 무한 스크롤 구현 — **완료**
- [x] `markets` 테이블 `end_date` 컬럼 추가 및 진행중/결과대기중/확정 상태 분리
- [x] '종료됨' 전용 필터 신설 및 7일 경과 데이터 자동 숨김 처리
- [x] 홈 메인 피드 `react-intersection-observer` 기반 무한 스크롤 적용

---

## ✅ Issue 11: Resend 이메일 알림 연동 — **완료**
- [x] 마켓 생성 접수/승인, 결과 판정 시 메일 발송 로직 추가
- [x] 상점 상품 교환 시 사용자 및 관리자 알림 메일 발송

---

## ✅ Issue 1: Supabase 백엔드 ↔ 프론트엔드 실시간 연동 (CRUD) — **완료**
- [x] `markets`, `bets`, `profiles` 테이블의 데이터를 실제로 Pull
- [x] 베팅 버튼 클릭 시 `bets` 테이블에 INSERT
- [x] 어드민 패널이 실제 `profiles`, `markets`, `shop_orders` 데이터를 불러오게 수정
- [x] 리더보드가 `profiles.xp` 기준으로 실시간 랭킹 표시

---

## ✅ Issue 2: 결과 판정 및 포인트 자동 정산(Settlement) 로직 — **완료**
- [x] `resolve_market` RPC: 승리자 비율에 따라 `profiles.points` + `xp` 원자적 분배
- [x] `refund_market` RPC: 전액 환불 처리
- [x] `point_transactions` 테이블에 내역 INSERT
- [x] 어드민 패널에서 버튼 클릭으로 RPC 호출 가능

---

## 🚀 Issue 3: 환경 변수 세팅 및 Vercel 최종 배포
- **설명**: 로컬환경(`localhost:3004`)용으로만 세팅된 환경을 프로덕션 도메인으로 이관해야 합니다.
- **할 일**:
  - [ ] Vercel 플랫폼에 GitHub Repository 연결 후 배포
  - [ ] Vercel 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력
  - [ ] 구글 클라우드 콘솔에서 **승인된 리디렉션 URI**를 Vercel 도메인으로 추가

---

## 🚀 Issue 4: 포인트 획득(배너/동영상 리워드) 광고 연동
- **설명**: 현재 광고 시청은 5초 카운트다운 시뮬레이션만 구현되어 있습니다.
- **할 일**:
  - [ ] 구글 애드센스 또는 AdMob 리워드 비디오 스크립트 삽입
  - [ ] 광고 시청 완료 시 서버에서 `profiles.points` 차감 없이 +포인트 처리하는 보안 API Route 구현
  - [ ] `point_transactions`에 `ad_watch` 타입으로 기록

---

## 🚀 Issue 5: Supabase 보안(RLS) 룰 고도화
- **설명**: 현재 RLS가 개발 속도를 위해 느슨하게 열려있습니다.
- **할 일**:
  - [ ] `bets` 테이블: INSERT 시 본인 user_id만 허용 (현재 완료), SELECT는 본인 것만 허용으로 강화
  - [ ] `point_transactions`: SELECT/INSERT 모두 본인 세션에만 허용
  - [ ] 어드민 전용 Policy를 JWT email 기반이 아닌 `profiles.is_admin = true` 기반으로 통일

---

## 🚀 Issue 6: `markets.yes_pool` / `no_pool` 자동 업데이트 (신규)
- **설명**: 현재 베팅 시 `bets` 테이블에만 INSERT되고, `markets`의 `yes_pool`/`no_pool`은 자동 업데이트가 안 됩니다. 확률 계산이 부정확합니다.
- **할 일**:
  - [ ] Supabase DB Trigger: `bets` INSERT 시 `markets.yes_pool` 또는 `no_pool` 자동 `+amount` 처리
  - [ ] 또는 베팅 시 Server Action에서 `markets` UPDATE 호출

---

## 🚀 Issue 7: 마켓 생성 페이지 어드민 전용 접근 제한 (신규)
- **설명**: `/create` 페이지가 현재 모든 로그인 유저에게 열려있습니다.
- **할 일**:
  - [ ] `/create` 페이지에서 `profiles.is_admin` 체크 후 비어드민 접근 차단
  - [ ] `markets` 테이블 INSERT RLS Policy를 어드민 전용으로 수정

---

## ✅ Issue 8: SEO 최적화 및 공지사항 기능 구현 — **완료**
- [x] 메타데이터 '정치' 배제 및 경제/스포츠/연예 키워드 설정
- [x] `sitemap.xml` 및 `robots.txt` 동적 생성 추가
- [x] 공지사항 테이블(`announcements`) 및 사용자/관리자 UI 추가

---

## ✅ Issue 9: 상점 본인인증(PortOne) 및 어뷰징 방지 — **완료**
- [x] PortOne V2 모듈 연동 (상점 교환 시 인증 모달)
- [x] `/api/verify` 백엔드 라우트 생성 (서버단 검증)
- [x] `profiles` 테이블에 `ci` 컬럼 UNIQUE 제약 조건 추가로 다계정 원천 차단
