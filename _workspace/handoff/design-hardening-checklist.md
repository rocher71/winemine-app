# v0.1.0 디자인 hardening 진행 체크리스트

이 파일은 디자인 hardening 작업의 단일 진실 소스다. 세션 간 영속 상태이며,
모든 변경은 commit + push로 즉시 영속화한다.

상태 마커:
- `[ ]` 미시작
- `[~]` 진행 중 (started 메모 필수)
- `[x]` 완료 (completed 메모 필수)

세션 진입 시 가장 먼저 이 파일을 읽고 in-flight `[~]` 위치에서 재개한다.
운영 규칙은 사용자 프롬프트(별도 보관)에 포함되어 있으며, 동일 규칙을 매 세션 적용한다.

## 우선순위 — 시각 갭 큰 순

정렬 근거 (2026-05-20 진입 시점, 코드 LOC + 키스크린 PNG 시각 복잡도 직관):
- P0: 시각 요소 풍부도 ↑ 또는 현재 RN 코드가 sparse하여 갭 큼.
  /home (65 LOC, 키스크린은 sections 다층), /wine/[lwin] (138 LOC, bottle gradient + meta + 통계), /capture (408 LOC, 카메라 view + frame + 가이드).
- P1: 중간. 리스트/폼/카드 위주.
- P2: 작음. 풀스크린 단일 메시지 + CTA.

### P0 (가장 큰 시각 차이 예상)
- [x] /home — `app/(tabs)/index.tsx`
  - started: 2026-05-20T07:33:18Z
  - spec: _workspace/design-specs/home.md
  - review reports: _workspace/design-review_home_20260520_164609.md (1차 FAIL 31), _workspace/design-review_home_20260520_193216_v2.md (CONDITIONAL PASS, 신규 1 FAIL), _workspace/design-review_home_20260520_194044_v3.md (PASS)
  - qa report: _workspace/qa_day6_home_retroactive_20260520_194819.md (PASS)
  - fix loops: 2
  - changed files (24): app/(tabs)/index.tsx, app/_layout.tsx, src/components/home/{heavy-home,first-time-home,peak-greeting,draft-note-resume,stat-hero,map-cameo,mini-map-preview,home-community-peek,recent-notes-strip,wine-feed,quick-actions,first-time-greeting,empty-stat-hero,suggested-actions,home-header}.tsx, src/components/shared/{wm-bottle,wm-glass-rating,level-chip}.tsx, src/components/community/{comm-user-avatar,post-type-badge}.tsx, src/lib/{design-tokens.ts,use-theme-tokens.ts}, tailwind.config.ts, src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T10:50:46Z
- [ ] /wine/[lwin] — `app/wine/[lwin].tsx`
- [ ] /capture — `app/(tabs)/capture.tsx`

### P1 (중간)
- [ ] /cellar (list) — `app/(tabs)/cellar/index.tsx`
- [ ] /cellar/[lwin] — `app/(tabs)/cellar/[lwin].tsx`
- [ ] /notes/new (source picker) — `app/notes/new.tsx`
- [ ] /notes/new/write — `app/notes/new/write.tsx`
- [ ] /notes/[noteId] — `app/notes/[noteId].tsx`

### P2 (시각 차이 작음 예상)
- [ ] /onboarding/1-welcome — `app/onboarding/1-welcome.tsx`
- [ ] /onboarding/2-language — `app/onboarding/2-language.tsx`
- [ ] /onboarding/3-experience — `app/onboarding/3-experience.tsx`
- [ ] /onboarding/4-mode — `app/onboarding/4-mode.tsx`

## 진행 메모

각 항목 처리 시 항목 아래에 다음 형식:

    - started: 2026-05-20T16:00:00+09:00
    - spec: _workspace/design-specs/home.md
    - review reports: _workspace/design-review_home_20260520_161200.md
    - fix loops: 2
    - changed files: app/(tabs)/index.tsx, src/components/home/recent-notes-section.tsx
    - completed: 2026-05-20T16:30:00+09:00

escalate 시:

    - started: ...
    - blocked: 3회 FAIL — gradient 매핑 사양 갭. design-spec-author 보강 필요.
    - next action: 사용자에 escalate

## 진행 통계 (완료 시 채움)

- 총 항목: 11개
- 완료: __개
- escalate: __개
- 평균 fix loops: __
- 전체 push된 commit: __개
