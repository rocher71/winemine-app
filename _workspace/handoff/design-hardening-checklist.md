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
- [x] /wine/[lwin] — `app/wine/[lwin].tsx`
  - started: 2026-05-20T10:51:53Z
  - spec: _workspace/design-specs/wine-detail.md
  - review reports: _workspace/design-review_wine-detail_20260520_200703.md (1차 FAIL 6/6), _workspace/design-review_wine-detail_20260520_203104_v2.md (PASS)
  - qa report: _workspace/qa_day6_wine_detail_retroactive_20260520_203501.md (PASS)
  - fix loops: 1
  - changed files (19): app/wine/[lwin].tsx, src/components/wine/{wine-hero,serving-temp-pill,favorite-toggle,my-tasting-note-card,write-note-cta,external-ratings-card,average-price-pill,price-chart-stub,community-drink-window-card,wine-story-card,review-list,add-to-cellar-cta}.tsx, src/components/shared/wm-bottle.tsx, src/hooks/use-my-note-for-wine.ts, src/lib/design-tokens.ts, tailwind.config.ts, src/lib/i18n/{ko,en}.json, _workspace/09_rn_screens_day6_wine_detail_retroactive.md
  - completed: 2026-05-20T11:40:15Z
  - deferred (separate cycles): Tabs row spec gap → design-spec-author, wine_favorites + serving_temp_{min,max} → supabase-engineer, MyTastingNoteCard expert rating 0-5 vs /100 표시 → notes 비즈니스 로직 cleanup
- [x] /capture — `app/(tabs)/capture.tsx`
  - started: 2026-05-20T11:40:49Z
  - spec: _workspace/design-specs/capture.md
  - review reports: _workspace/design-review_capture_20260520_205032.md (1차 FAIL 6/6), _workspace/design-review_capture_20260520_211318_v2.md (PASS)
  - qa report: _workspace/qa_day6_capture_retroactive_20260520_212450.md (PASS)
  - fix loops: 1
  - changed files (~18): app/(tabs)/capture.tsx, src/components/capture/{capture-header,choose-option-card,simulating-view,processing-overlay,ai-badge-banner,photo-frame,meta-row,file-not-found-hint,secondary-icon-button,recognized-view,label-scan-result-modal}.tsx, src/components/shared/primary-button.tsx, src/components/nav/bottom-nav.tsx, src/lib/animations/wm-pulse.ts, src/lib/design-tokens.ts, tailwind.config.ts, src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T12:26:42Z
  - deferred (separate cycles): wines_localized appellation/grapes 컬럼 추가 → supabase-engineer, FallbackLabel word-wrap → v0.2.0

### P1 (중간)
- [x] /cellar (list) — `app/(tabs)/cellar/index.tsx`
  - started: 2026-05-20T12:27:13Z
  - spec: _workspace/design-specs/cellar-list.md
  - review reports: _workspace/design-review_cellar-list_20260520_214331.md (1차 FAIL 68), _workspace/design-review_cellar-list_20260520_220425_v2.md (PASS)
  - qa report: _workspace/qa_day6_cellar_list_retroactive_20260520_220804.md (PASS)
  - fix loops: 1
  - changed files (~16): app/(tabs)/cellar/index.tsx, src/components/cellar/{cellar-card,cellar-tabs,drink-window-badge,cellar-search-input,type-filter-chips,sort-chips,add-cta,no-results,result-count}.tsx, src/components/cellar/search-sort-bar.tsx(deleted), src/components/shared/empty-state.tsx, src/lib/drink-window.ts(new), src/hooks/use-cellar.ts, src/lib/design-tokens.ts, tailwind.config.ts, src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T13:13:13Z
  - deferred (separate cycles): tasted 탭 → P1 분리(placeholder), AddCta BottomSheet form → 별도 cycle, swipe action → 영구 제거(2-col grid 부적합)
- [x] /cellar/[lwin] — `app/(tabs)/cellar/[lwin].tsx`
  - started: 2026-05-20T13:13:42Z
  - spec: _workspace/design-specs/cellar-detail.md
  - review reports: _workspace/design-review_cellar-detail_20260520_223411.md (1차 FAIL 6/6), _workspace/design-review_cellar-detail_20260520_225131_v2.md (PASS)
  - qa report: _workspace/qa_day6_cellar_detail_retroactive_20260520_225518.md (PASS)
  - fix loops: 1
  - changed files (~17): app/(tabs)/cellar/[lwin].tsx (rewrite), src/components/cellar/{cellar-hero,wine-label-art,drink-window-card,drink-window-timeline,notify-toggle-card,meta-card,meta-grid,drink-this-cta}.tsx (new), src/components/shared/confirm-dialog.tsx (new), src/lib/design-tokens.ts (8 tokens + shade helper), tailwind.config.ts, src/lib/i18n/{ko,en}.json (~27 keys), src/components/notes/note-body-expert.tsx (price key rename); deleted: src/components/wine/drinking-window-bar.tsx, src/components/cellar/cellar-fields.tsx
  - completed: 2026-05-20T14:00:01Z
  - deferred (separate cycles): Community Reviews section v0.1.0 SCOPE-OUT (my notes count card 대체), tasting_notes.cellar_item_id FK 마이그레이션 → supabase-engineer, cellar_items.memo 컬럼 → supabase-engineer, DrinkWindowBadge a11y refactor → cellar-list cycle
- [x] /notes/new (source picker) — `app/notes/new.tsx`
  - started: 2026-05-20T14:00:27Z
  - spec: _workspace/design-specs/notes-new.md
  - review reports: _workspace/design-review_notes-new_20260520_231022.md (1차 FAIL 6/6), _workspace/design-review_notes-new_20260521_003547_v2.md (PASS)
  - qa report: _workspace/qa_day6_notes_new_retroactive_20260521_004024.md (PASS)
  - fix loops: 1
  - changed files (~9): app/notes/new.tsx (rewrite), src/components/notes/{template-card,source-picker,cellar-bottom-sheet}.tsx (new), src/lib/notes/builtin-templates.ts (new), src/lib/design-tokens.ts, tailwind.config.ts, src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T15:41:57Z
  - deferred (separate cycles): tasting_notes.source_type schema 변경 + template_id 컬럼 신설 → supabase-engineer, write.tsx 연동(templateId/from query) → 별도 cycle
- [~] /notes/new/write — `app/notes/new/write.tsx`
  - started: 2026-05-20T15:42:30Z
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
