<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# PoliCat — AI Agent Working Rules

## 🔧 Push Protocol (매 Push 시 반드시 수행)

GitHub에 코드를 Push할 때마다 아래 절차를 **빠짐없이** 수행해야 한다.

1. **`CHANGELOG.md`** 업데이트: 변경사항을 해당 버전 섹션에 기록
2. **`ARCHITECTURE.md`** 업데이트: 새로 추가/변경된 파일, DB 컬럼, 로직 반영
3. **`ISSUES.md`** 업데이트: 완료된 이슈 `[x]` 체크, 새로운 이슈 추가
4. **GitHub Issues** 동기화:
   - 완료된 이슈: `gh issue close <NUMBER> --comment "완료: <설명>"`
   - 새 이슈 등록: `gh issue create --title "..." --body "..."`
5. **`AGENTS.md`** 확인: 에이전트 작업 규칙에 변경사항 있으면 업데이트
6. 커밋 및 Push:
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
docs: 문서 업데이트 (CHANGELOG, ARCHITECTURE 등)
chore: 빌드, 설정 파일 변경
```

## ⚠️ 주의사항

- `lib/data.ts`에는 Mock 마켓 데이터(`markets[]`)와 `leaderboard[]`가 있음. `app/page.tsx`가 초기값으로 사용하므로 **삭제 금지**. Supabase 연동 후 덮어쓰는 방식 사용.
- `components/` 폴더는 `src/components/`와 **별개**로 관리됨. `@/components/*` 경로는 프로젝트 루트의 `components/` 폴더를 참조.
- `lib/data.ts`도 마찬가지로 `src/lib/data.ts`와 **별개**. `@/lib/data`는 루트의 `lib/data.ts`를 참조.
- Claude Design 등 외부 도구에서 파일 복사 시 `components/Navbar.tsx`, `components/AdBanner.tsx`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`가 삭제되는 사고가 발생한 적 있음. 복사 후 반드시 `git status`로 확인할 것.
- Push 전 반드시 `npx next build`로 빌드 통과 여부 확인.

## 🗂 Key File Locations

| 경로 | 설명 |
|------|------|
| `app/admin/page.tsx` | 관리자 대시보드 (is_admin 체크 필요) |
| `utils/supabase/client.ts` | 브라우저 Supabase 클라이언트 |
| `utils/supabase/server.ts` | 서버 Supabase 클라이언트 |
| `lib/data.ts` | Mock 데이터 + 유틸 함수 (markets, tierConfig, getTier 등) |
| `supabase_init.sql` | DB 최초 스키마 (테이블 + RLS) |
| `rpc_settlement.sql` | resolve_market, refund_market RPC |
| `update_xp.sql` | XP 컬럼 추가 + resolve_market 업데이트 버전 |
| `update_shop_orders.sql` | shop_orders 테이블 + RLS |
