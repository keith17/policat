-- ============================================================
-- Policat 초기 런칭 마켓 시드 데이터
-- 실행 전: reset_data.sql 먼저 실행하여 기존 데이터 삭제
-- ============================================================

-- markets 테이블에 description 컬럼 추가 (없을 경우)
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS description text;

-- 관리자 ID 변수
DO $$
DECLARE
  admin_id uuid;
  -- 이벤트 IDs
  ev1 uuid := gen_random_uuid();
  ev2 uuid := gen_random_uuid();
  ev3 uuid := gen_random_uuid();
  ev4 uuid := gen_random_uuid();
  ev5 uuid := gen_random_uuid();
  ev6 uuid := gen_random_uuid();
  ev7 uuid := gen_random_uuid();
BEGIN
  -- 관리자 계정 ID 조회
  SELECT id INTO admin_id FROM profiles WHERE email = 'koesig@gmail.com' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION '관리자 계정(koesig@gmail.com)을 찾을 수 없습니다.';
  END IF;

  -- ============================================================
  -- 1. 이벤트 삽입
  -- ============================================================

  INSERT INTO events (id, title, description, is_featured, status) VALUES
  (ev1, '2026 북중미 월드컵 대한민국 조별리그 첫 경기 결과는?',
   '당장 다음 달 열리는 북중미 월드컵! 대한민국의 조별리그 1차전 경기 결과는 어떻게 될까요? (종료 휘슬 직후 공식 스코어 기준)', true, 'active'),

  (ev2, '25/26 UEFA 챔피언스리그 결승전 (5월 30일) 경기 양상',
   '5월의 마지막을 장식할 유럽 축구 최고의 무대, 챔피언스리그 결승전에서 어떤 일들이 벌어질까요?', true, 'active'),

  (ev3, '이번 주말 KBO 리그 3연전 (5월 15일~17일) 핫이슈',
   '이번 주 금, 토, 일에 펼쳐지는 프로야구 주말 3연전에서 일어날 주요 기록들을 예측합니다.', false, 'active'),

  (ev4, '애플 WWDC 2026 (6월 초) 주요 발표 내용',
   '한 달 앞으로 다가온 애플의 개발자 컨퍼런스(WWDC). iOS 20과 새로운 폼팩터에 대한 루머 중 어느 것이 사실일까요?', true, 'active'),

  (ev5, '5월 미국 소비자물가지수(CPI) 발표 (일주일 내)',
   '5월 중순에 발표되는 미국의 4월분 CPI 지표! 연준의 금리 인하 시그널을 결정할 이 지표는 어떻게 나올까요?', false, 'active'),

  (ev6, '2026 MSI (리그 오브 레전드) 최종 우승팀은?',
   '5월 하순 결승전을 앞둔 리그 오브 레전드 미드 시즌 인비테이셔널(MSI)! 올해 봄의 세계 최강팀은?', true, 'active'),

  (ev7, '한국은행 금융통화위원회 기준금리 결정 (5월 20일경)',
   '다음 주에 열리는 한은 금통위. 환율 방어와 내수 부양 사이에서 어떤 결정을 내릴까요?', false, 'active');

  -- ============================================================
  -- 2. 이벤트 소속 마켓 삽입
  -- ============================================================

  -- 이벤트 1: 월드컵 대한민국
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('대한민국이 첫 경기에서 승리할까?', 'sports',
   'FIFA 공식 스코어 기준, 대한민국 조별리그 1차전 경기 종료 후 판정.', admin_id, 'active', '2026-06-15 14:59:00+00', ev1, false),
  ('대한민국이 첫 경기에서 무승부를 기록할까?', 'sports',
   'FIFA 공식 스코어 기준, 무승부(동점) 시 YES.', admin_id, 'active', '2026-06-15 14:59:00+00', ev1, false),
  ('대한민국이 첫 경기에서 패배할까?', 'sports',
   'FIFA 공식 스코어 기준, 대한민국 패배 시 YES.', admin_id, 'active', '2026-06-15 14:59:00+00', ev1, false);

  -- 이벤트 2: UCL 결승
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('정규 시간 내에 승부가 결정되어 우승팀이 가려질까?', 'sports',
   '정규 시간(전후반 90분+추가시간) 내 승부 결정 시 YES. 연장/승부차기 진입 시 NO.', admin_id, 'active', '2026-05-30 14:59:00+00', ev2, false),
  ('결승전에서 양 팀 합산 총 3골(Over 2.5) 이상이 터질까?', 'sports',
   '결승전 경기 전체(연장 포함) 기준 양 팀 합산 3골 이상 시 YES.', admin_id, 'active', '2026-05-30 14:59:00+00', ev2, false),
  ('경기 중 레드카드(퇴장)를 받는 선수가 나올까?', 'sports',
   '결승전 경기 전체(연장 포함) 기준 레드카드 1장 이상 발생 시 YES.', admin_id, 'active', '2026-05-30 14:59:00+00', ev2, false);

  -- 이벤트 3: KBO 주말 3연전
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('이번 주말 3연전에서 스윕(3전 전승)을 거두는 팀이 나올까?', 'sports',
   '5월 15~17일 주말 3연전에서 상대를 3전 전승하는 팀이 1팀 이상 나오면 YES.', admin_id, 'active', '2026-05-17 14:59:00+00', ev3, false),
  ('비나 기상 악화로 우천 취소되는 경기가 발생할까?', 'sports',
   '5월 15~17일 주말 동안 KBO 공식 우천 취소 경기가 1경기 이상 발생 시 YES.', admin_id, 'active', '2026-05-17 09:00:00+00', ev3, false),
  ('주말 3연전 전국 구장 누적 관중 수가 30만 명을 돌파할까?', 'sports',
   'KBO 공식 관중 집계 기준, 5월 15~17일 전 구장 합산 누적 관중 30만 명 이상 시 YES.', admin_id, 'active', '2026-05-17 14:59:00+00', ev3, false);

  -- 이벤트 4: WWDC
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('온디바이스 AI 기능이 대폭 강화된 Siri 2.0이 공식 발표될까?', 'tech',
   'WWDC 키노트에서 "Siri" 브랜드 하에 대형 AI 기능 업그레이드가 공식 발표되면 YES.', admin_id, 'active', '2026-06-10 03:00:00+00', ev4, false),
  ('애플 비전 프로(Vision Pro)의 저가형 모델 라인업이 공개될까?', 'tech',
   'WWDC에서 기존 Vision Pro보다 저렴한 새 모델/라인업이 공식 발표되면 YES.', admin_id, 'active', '2026-06-10 03:00:00+00', ev4, false),
  ('자체 대형언어모델(LLM) 생태계가 발표될까?', 'tech',
   'OpenAI 파트너십 외에 Apple 자체 LLM 브랜드/플랫폼이 WWDC에서 공식 발표되면 YES.', admin_id, 'active', '2026-06-10 03:00:00+00', ev4, false);

  -- 이벤트 5: CPI
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('CPI 결과가 월가 예상치를 상회(물가 상승)할까?', 'economy',
   '미국 노동통계국(BLS) 발표 4월 CPI가 발표 직전 월가 컨센서스 대비 상회하면 YES.', admin_id, 'active', '2026-05-15 03:00:00+00', ev5, false),
  ('CPI 결과가 월가 예상치에 정확히 부합할까?', 'economy',
   'BLS 발표 CPI가 컨센서스와 소수점 1자리까지 동일하면 YES.', admin_id, 'active', '2026-05-15 03:00:00+00', ev5, false),
  ('CPI 결과가 월가 예상치를 하회(물가 둔화)할까?', 'economy',
   'BLS 발표 CPI가 컨센서스 대비 하회하면 YES.', admin_id, 'active', '2026-05-15 03:00:00+00', ev5, false);

  -- 이벤트 6: MSI
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('한국(LCK) 소속 팀이 MSI 최종 우승을 차지할까?', 'sports',
   '2026 MSI 결승전 공식 결과 기준, LCK 대표팀 우승 시 YES.', admin_id, 'active', '2026-05-25 14:59:00+00', ev6, false),
  ('중국(LPL) 소속 팀이 MSI 최종 우승을 차지할까?', 'sports',
   '2026 MSI 결승전 공식 결과 기준, LPL 대표팀 우승 시 YES.', admin_id, 'active', '2026-05-25 14:59:00+00', ev6, false),
  ('유럽(LEC) 또는 북미(LCS) 등 기타 지역 팀이 우승할까?', 'sports',
   '2026 MSI 결승전 공식 결과 기준, LCK/LPL 외 지역 팀 우승 시 YES.', admin_id, 'active', '2026-05-25 14:59:00+00', ev6, false);

  -- 이벤트 7: 한은 금통위
  INSERT INTO markets (title, category, description, created_by, status, end_date, event_id, is_featured) VALUES
  ('한국은행이 기준금리를 인상할까?', 'economy',
   '한국은행 금통위 결정 공식 발표 기준, 기존 대비 인상 시 YES.', admin_id, 'active', '2026-05-22 03:00:00+00', ev7, false),
  ('한국은행이 기준금리를 동결할까?', 'economy',
   '한국은행 금통위 결정 공식 발표 기준, 동결 시 YES.', admin_id, 'active', '2026-05-22 03:00:00+00', ev7, false),
  ('한국은행이 기준금리를 인하할까?', 'economy',
   '한국은행 금통위 결정 공식 발표 기준, 인하 시 YES.', admin_id, 'active', '2026-05-22 03:00:00+00', ev7, false);

  -- ============================================================
  -- 3. 독립 마켓 삽입
  -- ============================================================

  -- 초단기 (~5/20)
  INSERT INTO markets (title, category, description, created_by, status, end_date, is_featured) VALUES
  ('이번 주 개봉 1주차 헐리우드 블록버스터가 국내 100만 관객을 돌파할까?', 'entertainment',
   '영화진흥위원회 통합전산망 기준, 5월 17일 23:59까지 누적 관객 100만 돌파 시 YES.', admin_id, 'active', '2026-05-17 14:59:00+00', false),
  ('이번 주 금요일 나스닥(NASDAQ)이 전주 대비 상승 마감할까?', 'economy',
   '5월 15일(금) 뉴욕 증시 종가 기준, 전주 금요일 종가 대비 상승 시 YES.', admin_id, 'active', '2026-05-15 21:00:00+00', false),
  ('스페이스X가 이번 주 내로 스타십 테스트 비행을 실시할까?', 'tech',
   'SpaceX 공식 채널 기준, 5월 17일까지 Starship 테스트 비행(발사) 실시 시 YES.', admin_id, 'active', '2026-05-17 14:59:00+00', true),
  ('EPL 38라운드 최종전에서 리그 우승 승점 차이가 2점 이하로 끝날까?', 'sports',
   'EPL 공식 순위 기준, 최종 1위와 2위 간 승점 차이 2점 이하 시 YES.', admin_id, 'active', '2026-05-20 14:59:00+00', false),
  ('뉴진스 선공개 싱글이 발매 24시간 내 멜론 TOP 100 1위를 달성할까?', 'entertainment',
   '멜론 공식 차트 기준, 발매 후 24시간 내 TOP 100 1위 기록 시 YES.', admin_id, 'active', '2026-05-20 14:59:00+00', true),
  ('이번 주 일요일까지 비트코인이 $65,000 아래로 떨어질까?', 'economy',
   '바이낸스 BTC/USDT 기준, 5월 17일 23:59 UTC까지 한 번이라도 $65,000 미만 기록 시 YES.', admin_id, 'active', '2026-05-17 14:59:00+00', false),
  ('이번 주말(16~17일) 서울 지역에 비가 내릴까?', 'society',
   '기상청 공식 관측 기준, 5월 16~17일 서울 지역 강수 관측 시 YES.', admin_id, 'active', '2026-05-17 14:59:00+00', false);

  -- 단기 (~6/13)
  INSERT INTO markets (title, category, description, created_by, status, end_date, is_featured) VALUES
  ('엔비디아(NVDA) 1분기 실적에서 어닝 서프라이즈를 기록할까?', 'economy',
   '엔비디아 공식 실적 발표 기준, 매출이 월가 컨센서스를 상회하면 YES.', admin_id, 'active', '2026-05-31 14:59:00+00', true),
  ('프랑스 오픈 남자 단식에 나달이 출전 명단에 이름을 올릴까?', 'sports',
   'ATP/Roland Garros 공식 출전 명단 기준, 나달 이름 등재 시 YES.', admin_id, 'active', '2026-05-31 14:59:00+00', false),
  ('월드컵 개막전(멕시코 경기)에서 30분 이내에 첫 골이 터질까?', 'sports',
   'FIFA 공식 기록 기준, 개막전 킥오프 후 30분(전반 30분) 이내 첫 골 발생 시 YES.', admin_id, 'active', '2026-06-12 03:00:00+00', false),
  ('5월 31일 코스닥 지수가 900 포인트를 회복할까?', 'economy',
   '한국거래소 공식 종가 기준, 5월 31일 코스닥 종가 900.00 이상 시 YES.', admin_id, 'active', '2026-05-31 07:00:00+00', false),
  ('손흥민이 6월 초 이전에 사우디 리그 이적을 발표할까?', 'sports',
   '손흥민 또는 소속 구단 공식 채널 기준, 6월 10일까지 이적/가계약 공식 발표 시 YES.', admin_id, 'active', '2026-06-10 14:59:00+00', true),
  ('미국 연준(Fed)이 6월 FOMC에서 기준금리를 인하할까?', 'economy',
   'Fed 공식 FOMC 성명 기준, 기준금리 인하 결정 시 YES.', admin_id, 'active', '2026-06-12 03:00:00+00', false),
  ('월드컵 직전 마지막 친선 평가전에서 대한민국이 승리할까?', 'sports',
   'KFA 공식 기록 기준, 6월 초 친선경기 정규시간 내 대한민국 승리 시 YES.', admin_id, 'active', '2026-06-10 14:59:00+00', false),
  ('넷플릭스가 6월 내로 오징어 게임 시즌3 공식 티저를 발표할까?', 'entertainment',
   '넷플릭스 공식 채널에서 정확한 공개일자 포함 티저 영상 게시 시 YES.', admin_id, 'active', '2026-06-13 14:59:00+00', false);

  -- 중기 (~8/13)
  INSERT INTO markets (title, category, description, created_by, status, end_date, is_featured) VALUES
  ('월드컵 결승전에서 사상 최초 우승국(뉴 챔피언)이 탄생할까?', 'sports',
   'FIFA 공식 결과 기준, 역대 우승 경험 없는 국가가 우승 시 YES.', admin_id, 'active', '2026-07-20 03:00:00+00', false),
  ('오타니 쇼헤이가 올스타전 전까지 시즌 30홈런을 달성할까?', 'sports',
   'MLB 공식 기록 기준, 7월 15일까지 오타니 시즌 홈런 30개 이상 시 YES.', admin_id, 'active', '2026-07-15 14:59:00+00', false),
  ('삼성 갤럭시 언팩 2026에서 반지형 웨어러블을 공개할까?', 'tech',
   '삼성전자 공식 언팩 행사에서 반지(Ring) 폼팩터 신제품 공개 시 YES.', admin_id, 'active', '2026-08-10 14:59:00+00', false),
  ('2026 KBO 올스타전 MVP는 나눔 올스타에서 배출될까?', 'sports',
   'KBO 공식 발표 기준, 올스타전 MVP가 나눔 올스타(하위권 팀 연합) 소속이면 YES.', admin_id, 'active', '2026-07-25 14:59:00+00', false),
  ('8월 1일 기준 쿠팡이츠가 요기요를 꺾고 MAU 2위를 굳힐까?', 'tech',
   '앱 분석 기관(와이즈앱 등) 공식 발표 8월 MAU 기준, 쿠팡이츠 > 요기요 시 YES.', admin_id, 'active', '2026-08-05 14:59:00+00', false),
  ('7월 내에 비트코인이 1억 원(KRW) 아래로 하락하는 날이 있을까?', 'economy',
   '업비트 BTC/KRW 일봉 기준, 7월 중 종가 1억 원 미만 기록일이 1일 이상 시 YES.', admin_id, 'active', '2026-07-31 14:59:00+00', false),
  ('여름 개봉 한국 영화 중 누적 관객 500만 넘기는 작품이 나올까?', 'entertainment',
   '영진위 기준, 7~8월 초 개봉작 중 8월 13일까지 누적 500만 돌파 작품 발생 시 YES.', admin_id, 'active', '2026-08-13 14:59:00+00', false),
  ('일론 머스크가 8월 전에 X Payments를 미국 내 정식 런칭할까?', 'tech',
   'X(구 트위터) 공식 발표 기준, 미국 일부 주에서 결제 서비스 정식 출시 시 YES.', admin_id, 'active', '2026-08-10 14:59:00+00', false),
  ('8월 13일 카카오(KAKAO) 주가가 6만 원 선을 회복할까?', 'economy',
   '한국거래소 기준, 8월 13일 카카오 종가 60,000원 이상 시 YES.', admin_id, 'active', '2026-08-13 07:00:00+00', false),
  ('2026 윔블던 남자 단식에서 조코비치가 우승할까?', 'sports',
   'ATP/윔블던 공식 결과 기준, 조코비치 남자 단식 우승 시 YES.', admin_id, 'active', '2026-07-15 14:59:00+00', false),
  ('8월 초 미국 7월 비농업 고용지수(NFP)가 고용 쇼크를 기록할까?', 'economy',
   'BLS 발표 NFP가 월가 컨센서스 대비 대폭 하회(10만 이상 차이) 시 YES.', admin_id, 'active', '2026-08-10 03:00:00+00', false),
  ('락스타가 8월 말 전에 GTA 6 두 번째 공식 트레일러를 공개할까?', 'entertainment',
   'Rockstar Games 공식 유튜브에 GTA VI 2차 트레일러 게시 시 YES.', admin_id, 'active', '2026-08-13 14:59:00+00', false),
  ('이번 여름 예비 전력률이 관심 단계 미만으로 떨어질까?', 'society',
   '한국전력공사 공식 전력 통계 기준, 6~8월 중 예비전력률 관심 단계 미만 기록 시 YES.', admin_id, 'active', '2026-08-13 14:59:00+00', false),
  ('하이브(HYBE) 소속 그룹 간 유닛 콜라보 앨범이 기습 발표될까?', 'entertainment',
   'HYBE 또는 소속 레이블 공식 채널에서 8월 13일까지 크로스그룹 유닛 앨범 공식 발표 시 YES.', admin_id, 'active', '2026-08-13 14:59:00+00', false);

END $$;
