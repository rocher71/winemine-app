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
- [x] /notes/new/write — `app/notes/new/write.tsx`
  - started: 2026-05-20T15:42:30Z
  - spec: _workspace/design-specs/notes-write.md
  - review reports: _workspace/design-review_notes-write_20260521_005332.md (1차 FAIL 5/6 + c gradient 1건), _workspace/design-review_notes-write_20260521_011154_v2.md (PASS)
  - qa report: _workspace/qa_day6_notes_write_retroactive_20260521_011913.md (PASS)
  - fix loops: 1
  - changed files (~19): app/notes/new/write.tsx (rewrite), src/components/notes/{step-header,beginner-header,impression-triad,palate-triad,aroma-grid,finish-triad,auto-summary-card,price-capture,share-to-community,save-pill}.tsx (new), src/components/notes/{beginner-form,expert-form,note-body-beginner}.tsx (modified), src/components/wine/my-tasting-note-card.tsx, src/lib/notes/summarize.ts (new), src/lib/design-tokens.ts (5 typography), tailwind.config.ts, src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T16:20:32Z
  - deferred (separate cycles): tasting_notes.is_public 컬럼 → supabase-engineer, XP 시스템 / Expert 7-step / VariantTabs / DynamicTemplateForm → v0.2.0, iOS vs Android italic render → Day 7 EAS, light Switch trackColor 대비 / priceCaptureLabel "(+5 XP)" 미세 → 후속
- [x] /notes/[noteId] — `app/notes/[noteId].tsx`
  - started: 2026-05-20T16:20:54Z
  - spec: _workspace/design-specs/notes-detail.md
  - review reports: _workspace/design-review_notes-detail_20260521_013021.md (1차 FAIL 6/6), _workspace/design-review_notes-detail_20260521_014504_v2.md (PASS)
  - qa report: _workspace/qa_day6_notes_detail_retroactive_20260521_014807.md (PASS 14/14)
  - fix loops: 1
  - changed files (~10): app/notes/[noteId].tsx (rewrite), src/components/notes/{note-wine-header-link,note-author-avatar,note-author-card,note-memo-card}.tsx (new), src/components/notes/{note-body-beginner,note-body-expert}.tsx (modified), src/lib/design-tokens.ts (13 tokens), tailwind.config.ts, src/lib/i18n/{ko,en}.json (17 keys)
  - completed: 2026-05-20T16:52:28Z
  - deferred (separate cycles): tasting_notes.is_public → supabase-engineer, Expert memo 필드 / shared notes / profiles.level_id → v0.2.0, E5 WSET 5-col 단어 vs dot bar → 사용자 결정

### P2 (시각 차이 작음 예상)
- [x] /onboarding/1-welcome — `app/onboarding/1-welcome.tsx`
  - started: 2026-05-20T16:52:50Z
  - spec: _workspace/design-specs/onboarding-1-welcome.md
  - review reports: _workspace/design-review_onboarding-1-welcome_20260521_015749.md (FAIL 5/6), _workspace/design-review_onboarding-1-welcome_20260521_020354_v2.md (PASS)
  - qa report: _workspace/qa_day6_onboarding_1_welcome_retroactive_20260521_020711.md (PASS)
  - fix loops: 1
  - changed files: app/onboarding/1-welcome.tsx (rewrite), src/components/onboarding/welcome-glass-glow.tsx (new), src/lib/i18n/{ko,en}.json (tagline)
  - completed: 2026-05-20T17:07:45Z
- [x] /onboarding/2-language — `app/onboarding/2-language.tsx`
  - started: 2026-05-20T17:07:55Z
  - spec: _workspace/design-specs/onboarding-2-language.md
  - review reports: _workspace/design-review_onboarding-2-language_20260521_021458.md (FAIL 5/6), _workspace/design-review_onboarding-2-language_20260521_022133_v2.md (PASS 6/6)
  - qa report: _workspace/qa_day6_onboarding_2_language_retroactive_20260521_022437.md (PASS)
  - fix loops: 1
  - changed files: app/onboarding/2-language.tsx (rewrite), src/components/onboarding/{onboarding-step-layout,language-choice-card}.tsx (new), src/lib/design-tokens.ts (typography 3), tailwind.config.ts, src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T17:25:28Z
- [x] /onboarding/3-experience — `app/onboarding/3-experience.tsx`
  - started: 2026-05-20T17:25:42Z
  - spec: _workspace/design-specs/onboarding-3-experience.md
  - review reports: _workspace/design-review_onboarding-3-experience_20260521_023233.md (FAIL 4/6), _workspace/design-review_onboarding-3-experience_20260521_024130_v2.md (PASS 6/6)
  - qa report: _workspace/qa_day6_onboarding_3_experience_retroactive_20260521_024554.md (PASS)
  - fix loops: 1
  - changed files: app/onboarding/3-experience.tsx (rewrite), src/components/onboarding/experience-choice-card.tsx (new), src/lib/i18n/{ko,en}.json
  - completed: 2026-05-20T17:47:03Z
  - deferred: Q1 5-step vs 4-step 정책 → /onboarding/4-mode cycle에서 결정
- [x] /onboarding/4-mode — `app/onboarding/4-mode.tsx`
  - started: 2026-05-20T17:47:20Z
  - spec: _workspace/design-specs/onboarding-4-mode.md
  - review reports: _workspace/design-review_onboarding-4-mode_20260521_025433.md (FAIL 5/6), _workspace/design-review_onboarding-4-mode_20260521_030031_v2.md (PASS 6/6)
  - qa report: _workspace/qa_day6_onboarding_4_mode_retroactive_20260521_030347.md (PASS)
  - fix loops: 1
  - changed files: app/onboarding/4-mode.tsx (rewrite), src/components/onboarding/mode-choice-card.tsx (new)
  - completed: 2026-05-20T18:05:04Z
  - decisions: Q1 5-step 채택 확정 (사양 §10), Q3 light gold icon 대비 → 후속 cycle

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
- 완료: 11개
- escalate: 0개
- 평균 fix loops: 1.09 (/home 2 + 다른 10개 각 1 = 12 / 11)
- 전체 push된 commit (start + feat 22 + ALL DONE 1): 23개 (현재 cycle 한정)

ALL DONE: 2026-05-20T18:05:30Z

---

# Follow-up Cycle 1 — 시뮬레이터 실측 P0 4건

사용자가 iPhone Sim 실측 후 4 가지 시각 갭 보고 (이전 [세션 범위 외] BottomNav + settings _layout 분리 포함 — 명시적 해제).

진실 소스 강조: ../winemine-keyscreen/ 코드 정밀 Read.

우선순위 (시각 갭 + 버그 임팩트 큰 순):

### F1 (가장 broken — UX 완전 망가짐)
- [x] BottomNav 5 tabs verbatim — `app/(tabs)/_layout.tsx` + settings stack 분리
  - started: 2026-05-21T02:29:14Z
  - spec: _workspace/design-specs/bottom-nav.md
  - review reports: builder summary _workspace/design-review_bottom-nav_v1_builder_summary.md (1차 inline FAIL 11), _workspace/design-review_bottom-nav_20260521_114749_v2.md (PASS)
  - qa report: _workspace/qa_followup_bottom-nav_20260521_115559.md (PASS)
  - fix loops: 1
  - changed files: app/(tabs)/_layout.tsx (rewrite), app/(tabs)/{map,community}.tsx (new), app/notes/index.tsx (mv), app/cellar/[lwin].tsx (mv), app/settings/{index,language,experience,appearance}.tsx (mv 4), app/_layout.tsx (root Stack 확장), src/components/nav/bottom-nav.tsx (rewrite), src/lib/i18n/{ko,en}.json (4 keys), src/components/{cellar/cellar-card,home/home-header,home/suggested-actions,shared/level-chip}.tsx (router paths)
  - completed: 2026-05-21T02:57:57Z
  - deferred: §14 Q1 stack route BottomNav 표시 정합성 (b 임시), §14 Q2 indicator bar 제거 변별성, light gold contrast 2.15 → 별도 cycle
  - 증상: 홈/라벨 촬영/노트/cellar/index/cellar/[lwin]/settings/index/settings/language/settings/experience/settings/appearance — 8 tabs로 overflow
  - 목표: 홈/지도/카메라(floating large red circle)/셀러/커뮤니티 5 tabs (키스크린 image #4 verbatim). settings hub + sub 3개는 stack 분리.

### F2 (큰 시각 갭)
- [x] /home wine-feed 카드 horizontal layout — `src/components/home/wine-feed.tsx`
  - started: 2026-05-21T02:58:34Z
  - spec: _workspace/design-specs/home.md §3-8 + §3-8-PATCH (line 980~1108)
  - review reports: _workspace/design-review_wine-feed_20260521_120512.md (FAIL 4/6), _workspace/design-review_wine-feed_20260521_121128_v2.md (PASS)
  - qa report: _workspace/qa_followup_wine-feed_20260521_121609.md (PASS)
  - fix loops: 1
  - changed files: src/components/home/wine-feed.tsx (rewrite — horizontal bottle 좌 + info 우 inline), src/lib/i18n/{ko,en}.json (home.wineFeed.openDetail)
  - completed: 2026-05-21T03:17:26Z
  - deferred: light 모드 gold score 대비 2.9 (사양 escalation) → 별도 cycle, wm-bottle.tsx docstring drift (chore)
  - 증상: bottle SVG가 카드 왼쪽 위에 isolated, 정보(이름/가격/평점)는 카드 아래쪽 vertical
  - 목표: bottle 좌 + 이름/와이너리/지역/품종/평점/가격 inline horizontal (키스크린 image #7 verbatim)
- [~] /home followers note row — `src/components/home/home-community-peek.tsx` 또는 `recent-notes-strip.tsx`
  - started: 2026-05-21T03:17:55Z
  - 증상: 큰 avatar (벨/실 글자 chip) + badge (노트/셀러) 위에 stacked + 본문 아래
  - 목표: 작은 round avatar + badge inline + 본문 + 메타 (키스크린 image #4 verbatim)

### F3 (작은 시각 갭이나 4 화면 공통 영향)
- [ ] /onboarding/* 다음 버튼 일관성
  - 증상: wineRed full-width disabled가 placeholder처럼 보임
  - 목표: primary-button verbatim 폭/색/대비/safe-area (키스크린 image #5 verbatim)

## Follow-up 진행 메모

각 항목 처리 시 본 cycle 같은 형식 (started/spec/review/qa/loops/changed files/completed/deferred).
