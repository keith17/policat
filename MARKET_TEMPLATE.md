# 📋 마켓 & 이벤트 데이터 입력 템플릿

> 아래 양식을 채워서 전달해 주시면, SQL INSERT 문을 자동 생성하여 Supabase에 투입해 드립니다.

---

## 1. 이벤트 (Events) — 다중 후보 마켓을 묶는 그룹

이벤트는 **여러 마켓을 하나의 주제로 묶는 그룹**입니다.  
예: "2026 대선 후보 지지율" 이벤트 아래에 "이재명 당선", "한동훈 당선" 등의 마켓이 하위로 들어갑니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| **title** | 텍스트 | ✅ | 이벤트 제목 (예: "2026 대선 후보 지지율") |
| **description** | 텍스트 | 선택 | 이벤트 설명 |
| **is_featured** | true/false | 선택 | 홈 화면 캐로셀에 노출할지 (기본: false) |

### 이벤트 예시

```
이벤트 1:
  title: 2026 FIFA 월드컵 우승국 예측
  description: 2026 미국·캐나다·멕시코 월드컵 우승국을 예측하세요!
  is_featured: true
```

### ✏️ 이벤트 입력란

```
이벤트 A:
  title: 
  description: 
  is_featured: true/false

이벤트 B:
  title: 
  description: 
  is_featured: true/false
```

---

## 2. 마켓 (Markets) — 개별 예측 질문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| **title** | 텍스트 | ✅ | 마켓 질문 (예: "브라질이 2026 월드컵에서 우승할까?") |
| **category** | 텍스트 | ✅ | `economy` / `politics` / `society` / `sports` / `entertainment` / `tech` 중 택1 |
| **description** | 텍스트 | ✅ | 판정 기준을 명확히 작성 (예: "FIFA 공식 결과 기준, 2026년 7월 결승전 이후 판정") |
| **end_date** | 날짜시간 | ✅ | 마감일시 (형식: `YYYY-MM-DD HH:mm`, 한국시간) 예: `2026-07-20 00:00` |
| **is_featured** | true/false | 선택 | 캐로셀 노출 (기본: false). 이벤트 소속이면 이벤트에서 featured 설정하는 것을 권장 |
| **event** | 텍스트 | 선택 | 소속 이벤트 이름. 위 이벤트의 title과 동일하게 작성 (없으면 독립 마켓) |

### 마켓 예시

```
마켓 1 (이벤트 소속):
  title: 브라질이 2026 FIFA 월드컵에서 우승할까?
  category: sports
  description: FIFA 공식 결과 기준. 2026년 7월 결승 이후 판정. 브라질 우승 시 YES.
  end_date: 2026-07-20 00:00
  is_featured: false
  event: 2026 FIFA 월드컵 우승국 예측

마켓 2 (독립 마켓):
  title: 2026년 하반기 코스피 3000 돌파?
  category: economy
  description: 2026년 12월 31일까지 코스피 종가가 한 번이라도 3000을 넘으면 YES.
  end_date: 2026-12-31 18:00
  is_featured: true
  event: (없음)
```

### ✏️ 마켓 입력란

```
마켓 1:
  title: 
  category: 
  description: 
  end_date: 
  is_featured: 
  event: 

마켓 2:
  title: 
  category: 
  description: 
  end_date: 
  is_featured: 
  event: 

마켓 3:
  title: 
  category: 
  description: 
  end_date: 
  is_featured: 
  event: 
```

(필요한 만큼 마켓을 추가해 주세요)

---

## 📌 카테고리 가이드

| category 값 | 의미 | 아이콘 |
|-------------|------|--------|
| `economy` | 경제/금융/주식/환율 | 📈 |
| `politics` | 정치/선거/외교/법안 | 🏛️ |
| `society` | 사회/문화/교육/환경 | 🤝 |
| `sports` | 스포츠/e스포츠 | ⚽ |
| `entertainment` | 연예/영화/음악 | 🎬 |
| `tech` | 기술/IT/AI/과학 | 💻 |

---

## 📌 참고: 좋은 마켓을 만드는 팁

1. **판정 기준을 명확히**: "~할까?" 보다는 "A 조건이 달성되면 YES, 아니면 NO"
2. **마감 기한 설정**: 결과를 알 수 있는 시점보다 약간 앞으로 설정
3. **이벤트 활용**: 같은 주제의 마켓 3개 이상이면 이벤트로 묶으면 Featured 캐로셀에 후보 순위/그래프가 표시됨
4. **Featured 활용**: 관심도가 높은 마켓/이벤트 1~3개만 Featured 설정 권장
