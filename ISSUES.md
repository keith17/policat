# Policat 런칭 전 잔여 할 일 (GitHub Issues)

현재까지 프론트엔드의 화면 레이아웃, 로그인 체계, 그리고 뼈대 역할을 할 백엔드 DB 구조가 완성되었습니다. 완전한 실 서비스 런칭을 위해 반드시 구현해야 하는 구체적인 테크니컬 이슈들입니다. 이 목록을 GitHub Issues에 그대로 등록해 주시면 좋습니다.

---

## 🚀 Issue 1: Supabase 백엔드 ↔ 프론트엔드 실시간 연동 (CRUD) 
- **설명**: 현재 UI(마켓 카드, 리더보드, 프로필 정보, 어드민 패널 등)가 프론트엔드 모의 데이터(`lib/data.ts` 및 컴포넌트 내부 State)로 구동되고 있습니다. 
- **할 일**:
  - [ ] `@/utils/supabase` 훅이나 Next.js Server Actions를 사용해 `markets`, `bets`, `profiles` 테이블의 데이터를 실제로 Pull.
  - [ ] 베팅(참여) 버튼 클릭 시 `bets` 테이블에 `INSERT` 치기 (Supabase).
  - [ ] 어드민 패널 상태가 Mock 배열이 아니라 실제 `profiles`와 `markets`를 불러오게 수정.

## 🚀 Issue 2: 결과 판정 및 포인트 자동 정산(Settlement) 로직 
- **설명**: 어드민이 마켓 결과(YES/NO/환불)를 선언했을 때 사용자들에게 포인트를 실제로 나눠주는 백엔드 트랜잭션 함수가 필요합니다.
- **할 일**:
  - [ ] 마감된 마켓의 경우, 총 YES 배당률과 총 NO 배당률을 계산하여 승리한 자들의 비율에 맞게 `profiles`의 밸런스 값을 업데이트.
  - [ ] 해당 내역을 `point_transactions` 테이블에 `INSERT` 하여, 유저가 마이페이지에서 내역을 열람할 수 있도록 지원.

## 🚀 Issue 3: 환경 변수 세팅 및 Vercel 최종 배포
- **설명**: 지금까지 로컬환경(`localhost:3004`)용으로만 세팅된 환경을 프로덕션 도메인으로 이관해야 합니다.
- **할 일**:
  - [ ] Vercel 플랫폼에 해당 Git Repository 연결 후 배포 (Deploy).
  - [ ] Vercel Server Settings에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등 입력.
  - [ ] 구글 클라우드 콘솔(OAuth) 사이트에서 **승인된 리디렉션 URI**를 Vercel 앱 도메인(`https://your-domain.vercel.app/auth/callback`)으로 추가.

## 🚀 Issue 4: 포인트 획득(배너/동영상 리워드) 광고 연동
- **설명**: 유저가 베팅을 하려면 포인트가 필요한데, 초기 포인트 소진 후엔 광고를 봐야 합니다. (`app/earn/page.tsx` 연동)
- **할 일**:
  - [ ] 구글 애드센스(또는 다른 광고 벤더의 리워드 동영상 모듈) 스크립트 사이트에 삽입.
  - [ ] 동영상 시청 완료 시 프론트엔드로 `callback`을 받아, 백엔드 `profiles` 포인트 총량을 500P 가량 `ADD` 해주는 서버 유틸 작성.

## 🚀 Issue 5: Supabase 보안(RLS) 룰 고도화
- **설명**: 현재 `supabase_init.sql`에 작성된 보안 룰은 베타테스트/개발 속도를 위해 매우 느슨하게(Public Read) 열려있습니다.
- **할 일**:
  - [ ] Supabase 콘솔에서 `bets`나 `point_transactions` 테이블 열람/생성을 엄격하게 본인의 세션(id)에만 허용되도록 SQL Policy 강화. 
  - [ ] 어드민 전용 Policy를 더 명확하게 작성하여 악의적인 접근 원천 차단.
