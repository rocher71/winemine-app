# TODO — winemine-app 할 일 단일 소스

> 이 파일이 "지금 열린 할 일"의 **유일한 소스**다. 상세 맥락은 각 항목 링크(resume-context) 참조.
> 완료 항목은 여기서 지우고, 필요 시 아래 "최근 완료"에 한 줄만 남긴다.
> 최종 갱신: 2026-07-02.

---

## 지금 열린 할 일 (우선순위순)

### 1. [BE·최우선] 신고/차단 end-to-end 동작 — 커뮤니티 피드 실데이터 연동
- 현재: `reports` 테이블·RLS·트리거 원격 배포됨, `use-report`가 실 INSERT 한다. **그러나 커뮤니티 피드가 mock 데이터**(원격 `community_posts` 0행)라 신고 `target_id`가 mock id → `reports.target_id`(uuid) INSERT 미성립 → **신고가 실제로 저장되지 않음**(UI·시트만 완성).
- 필요: 커뮤니티 피드를 실 `community_posts` 로 연동(실 글 생성/조회)해야 실 UUID 대상으로 신고 저장됨. block 등 다른 target_type(comment/note/list/profile)도 동일하게 실데이터 연동 필요.
- 상세: [moderation-resume-context.md](./moderation-resume-context.md) §0

### 2. [QA] 실 디바이스/시뮬 육안 확인 (라이트 픽셀)
- 홈 재설계 등 화면의 실제 라이트 모드 픽셀 육안 확인이 시뮬레이터 부재로 보류됐던 항목. 시뮬/실기기로 확인.
- 상세: [home-redesign-resume-context.md](./home-redesign-resume-context.md)

### 3. [카피] moderation 출시 문구 다듬기 (ko/en)
- 신고 사유·차단 안내 등. i18n 키 구조·제안값은 확정, 문구만 다듬기.
- 상세: [moderation-resume-context.md](./moderation-resume-context.md) §5

### 4. [빌드] EAS 빌드 / TestFlight 실행 확인
- `eas.json` 은 존재. 실제 preview 빌드·TestFlight 업로드를 돌렸는지 확인 필요(빌드 사이즈 50MB 이하 검증 포함).

### 5. [정리·소소]
- design-spec doc 토큰 오기 1건: report/block 매핑표가 `light.border.active`를 `#B89438`로 기재(실제 `#C9A84C`, 구현은 올바름) → doc 정정.
- moderation BottomSheet snapPoints 높이 적합성 1회 확인.

---

## v0.2.0+ defer (지금 안 함)

- 지도(react-native-maps / MapLibre 선택), 차트(Victory Native 등 — 현재 placeholder), E2E 테스트(Detox / Maestro).
- 상세: [../docs/TBD.md](../docs/TBD.md)

---

## 최근 완료 (참고 — 다음 정리 때 삭제)

- 원격 Supabase 마이그레이션 push(moderation 7종, wines 손상 0) + `database.types` 재생성 (2026-07-02).
- dev→main 머지 + **main-only 워크플로우 전환**(CLAUDE.md §4-13 개정, dev/feat 브랜치 삭제).
- 커뮤니티 피드 `...` 신고 UI/시트 — 배선 → mount 레이스 → 루트 오버레이(`ModerationSheetProvider`). 실기기 시트 표시 확인. (BE 저장은 위 열린 항목 1 참조)
- 홈 재설계(Editorial Stack) 구현·머지·push, 설정 화면(언어/경험/외관/차단목록) 빌드.

---

## 다른 할 일 문서 위치 (참고 — 상세 맥락용)

- `tbd/moderation-resume-context.md` — 신고/차단 상세 재개 컨텍스트.
- `tbd/home-redesign-resume-context.md` — 홈 재설계 상세 재개 컨텍스트.
- `docs/TBD.md` — 라이브러리/도구 결정(대부분 확정, 일부 v0.2.0 defer).
- `docs/spec/v0.1.0.md` — v0.1.0 원 스펙.
- `_workspace/handoff/*` — 과거 빌드 핸드오프(gitignore, 완료 기록 아카이브).
- 메모리 `~/.claude/projects/-Users-yejinkim-dev-winemine-app/memory/` — 세션 간 컨텍스트(MEMORY.md 인덱스).
