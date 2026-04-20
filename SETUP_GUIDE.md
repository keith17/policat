# 실제 서비스 운영을 위한 DB 및 구글 로그인 연동 가이드

현재 `policat` 서비스에 회원정보와 배팅 내역을 안전하게 영구 저장하고 구글 로그인을 도입하기 위해 가장 추천되는 백엔드 방식인 **Supabase (수파베이스)** 의 초기 세팅 방법입니다. 천천히 따라해 보시고 획득한 코드를 저(.env.local 파일 등)에게 알려주시거나 프로젝트 루트에 넣어주시면, 코드를 구동시킬 수 있습니다.

## 1. Supabase 프로젝트 생성

1. [Supabase 홈페이지](https://supabase.com/) 에 접속하여 회원가입 및 로그인을 합니다.
2. 대시보드(Dashboard)에서 **[New Project]** 버튼을 클릭합니다.
3. 소속될 조직(Organization)을 선택하고, 프로젝트 이름(`policat`)과 강력한 DB 비밀번호를 설정합니다. 서버 지역(Region)은 한국(Seoul)이 가장 좋습니다.
4. 생성이 완료될 때까지 잠시 대기합니다. (DB 초기화에 1~2분 소요)

### ✅ Supabase 환경 변수 복사하기
프로젝트가 생성되면 왼쪽 메뉴 톱니바퀴(**Project Settings** 하단 아이콘) > **API** 로 이동합니다.
아래 두 가지 값을 복사해서 잠시 메모장에 저장해 둡니다.
- **Project URL**
- **Project API Keys (anon / public)**

---

## 2. Google Cloud - OAuth 클라이언트 발급

이 과정은 앱에서 "Google로 계속하기" 창을 띄우기 위한 자격을 얻는 단계입니다.

1. [Google Cloud Console](https://console.cloud.google.com/) 에 로그인하여 상단의 빈 프로젝트 선택 창을 눌러 **[새 프로젝트]** 를 생성합니다. 이름은 임의로 입력합니다 (예: `policat-auth`).
2. 좌측 햄버거 메뉴를 열고 **[API 및 서비스]** -> **[OAuth 동의 화면]** 으로 이동합니다.
3. **[외부(External)]** 를 선택하고 만들기 클릭. 앱 이름, 사용자 지원 이메일(본인 이메일), 개발자 연락처 정보(임의) 등 필수 사항만 입력 후 [저장 후 계속]을 누르고 설정 창을 완료합니다.
4. 좌측 메뉴에서 **[사용자 인증 정보]** 클릭 -> 상단 **[+ 사용자 인증 정보 만들기]** 클릭 -> **[OAuth 클라이언트 ID]** 선택.
5. **애플리케이션 유형**을 **웹 애플리케이션** 으로 선택합니다.
6. **승인된 자바스크립트 원본**: 
   - 테스트용: `http://localhost:3004` (로컬 포트에 맞게, 보통 3000이나 3004 등)
   - 실서비스용 시 도메인 주소 등록
7. **승인된 리디렉션 URI (★중요)**:
   - Supabase를 사용할 것이므로, Supabase로 돌아오게 설정해야 합니다.
   - `[아까메모한_Supabase_Project_URL]/auth/v1/callback` 을 넣어줍니다. 
   - (예시: `https://abcd123456.supabase.co/auth/v1/callback`)
8. 생성을 누르면 **클라이언트 ID**와 **클라이언트 보안 비밀(Secret)** 이 뜹니다. 이를 메모장에 복사합니다.

---

## 3. Supabase에 구글 정보 연결하기

1. 다시 Supabase 대시보드로 돌아옵니다.
2. 왼쪽 메뉴 열쇠 아이콘(**Authentication**) -> 상단 **[Providers]** 클릭.
3. "Google"을 찾아 토글 버튼을 켜서 **활성화** 합니다.
4. 방금 구글에서 발급받았던 **Client ID** 와 **Client Secret** 을 빈칸에 붙여넣습니다.
5. 하단의 **Save** 클릭.

---

## 4. 로컬 환경 변수 세팅하기

사용자의 컴퓨터(로컬)의 프로젝트 폴더 최상단(`./policat`)에 `.env.local` 이라는 파일을 만들고, 아까 메모한 정보를 아래와 같이 적어넣습니다.

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=당신의_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=당신의_SUPABASE_ANON_KEY
```

**이제 세팅은 모두 끝났습니다!** 제가 작업해 둘 로그인 연동 코드와 함께 완벽히 구동될 것입니다.

---

## 5. Vercel(실서비스) 배포 및 연동 방법

로컬에서 확인이 완료된 사이트를 전 세계에 공개(Deploy)하는 단계입니다.

1. [Vercel](https://vercel.com/) 에 가입 및 로그인 후 [Add New Project]를 클릭합니다.
2. 깃허브(GitHub) 계정을 연동하고 푸시된 저장소를 **Import** 합니다.
3. 배포(Deploy) 세팅 화면에서 `Environment Variables` 항목을 열고, 로컬의 `.env.local` 에 기입했던 환경 변수 4개를 모두 복사해 한 번에 넣습니다.
4. **Deploy** 버튼을 누르면 배포가 완료되고 라이브 도메인(예: `https://policat-theta.vercel.app`)이 발급됩니다.
5. 발급된 도메인을 구글과 Supabase에 각각 추가 허용해주어야 로그인 에러가 발생하지 않습니다:
   - **Google Cloud Console**: "승인된 자바스크립트 원본"에 해당 주소를, "승인된 리디렉션 URI"에 해당 주소 뒤에 `/auth/callback` 을 붙여서 각각 등록.
   - **Supabase Dashboard**: Authentication > URL Configuration 메뉴의 "Site URL"을 해당 주소로 변경하고, "Redirect URLs"에는 해당 주소 뒤에 `/**` 를 붙여서 등록.
