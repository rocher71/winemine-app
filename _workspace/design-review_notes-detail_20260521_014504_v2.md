# Design Review — /notes/[noteId] (2차 / post-fix)

> 검증 대상: notes-detail 화면 retroactive hardening 2차 게이트
> 검증일: 2026-05-21 01:45 KST
> 1차 보고서: `_workspace/design-review_notes-detail_20260521_013021.md` (6/6 FAIL)
> reviewer: design-reviewer

## 대상 3축

| 축 | 경로 | 상태 |
|---|---|---|
| 사양 | `_workspace/design-specs/notes-detail.md` (917 LOC) | unchanged |
| 키스크린 (원본) | `../winemine-keyscreen/src/app/notes/[noteId]/page.tsx` (882 LOC) | read-only |
| 키스크린 스크린샷 | `_workspace/keyscreen-shots/notes_noteId.png` (Expert · dark · ko) | 멀티모달 비교 수행 |
| 현재 RN | `app/notes/[noteId].tsx` (250 LOC, 전면 재작성) + 신규 `src/components/notes/{note-wine-header-link,note-author-avatar,note-author-card,note-memo-card}.tsx` + 수정 `note-body-{beginner,expert}.tsx` + 토큰 13개 추가 + i18n 16+ 키 추가 | rn-screen-builder 1차 fix 완료 (미커밋) |

---

## Executive Summary

**전체 결과: PASS (조건부)**
**STILL-FAIL 수: 0**
**신규 FAIL 수: 0**
**SCOPE-OUT 유지: 5 (E2 partial, E4 v0.2.0, E5 RE-ESCALATE 대기, E7, E8)**

1차에서 지적된 6/6 FAIL의 P0/P1 항목은 전부 정상 적용되었고, 키스크린 스크린샷과 시각 인상이 동등 수준으로 정합됨. 핵심 시각 위계 (와인 컴팩트 헤더 → gold border AuthorMetaCard → bg-sunken MemoCard → bode body)가 키스크린 verbatim 트리와 일치한다. P2 clean-up 잔재 1건 (NoteBodyExpert Section eyebrow `marginBottom: -2` 보정 hack)이 있지만 시각 영향 미미하여 PASS 처리, qa-inspector 단계로 진행 권장.

dark 모드 정합은 멀티모달 비교로 PASS. **light 모드 검증은 qa-inspector 단계 또는 별도 시뮬레이터 캡처에서 의무 (CLAUDE.md §4-9)** — 토큰 dual 정의는 OK이므로 차단 사유 아님.

---

## 1차 6 FAIL 카테고리별 처리 결과

### (1) 요소 누락 — RESOLVED

| # | 1차 지적 요소 | 적용 결과 | 검증 |
|---|---|---|---|
| 1-A | WineHeaderLink (44×64 thumb + name + meta) | `src/components/notes/note-wine-header-link.tsx:69~131` 신규 추가 — `app/notes/[noteId].tsx:212~221`에서 호출. WineHero 제거 확인 (`app/notes/[noteId].tsx` import 목록에 WineHero 없음). thumb 44×64 + `borderColor: withAlpha(brand.gold, 0.18)` + `notesDetailBottleThumbGradient` 적용 | RESOLVED |
| 1-B | AuthorMetaCard (gold border + avatar + chip row) | `src/components/notes/note-author-card.tsx:69~178` 신규. `borderColor: brand.gold` (line 77), `padding: 14` (line 73), `borderRadius: 14` (line 74), Row1+Row2 구조 verbatim. 메타 strip 제거 (`app/notes/[noteId].tsx`에 line 146~174 strip 부재 확인 — `<NoteAuthorCard>` 단일 호출 line 223~231) | RESOLVED |
| 1-C | AuthorAvatar (32×32 gradient + letter) | `src/components/notes/note-author-avatar.tsx:28~67` 신규. `noteAuthorAvatarGradient.L1` fallback, border `withAlpha(brand.gold, 0.3)`, Playfair 13 700 cream letter. `app/notes/[noteId].tsx:192`에서 `authorLetter` 계산 (anonymous_display.charAt(0) || meLabel.charAt(0)) | RESOLVED |
| 1-D | TemplatePill (Inter 10 muted, border-default radius 999) | `note-author-card.tsx:93~111` Row1 우측. paddingVertical 4 paddingHorizontal 9 radius 999, `font-inter text-text-muted` size 10 lineHeight 12. mode pill 별도 위치 노출 0 | RESOLVED |
| 1-E | MemoCard (mode 무관 공통, bg-sunken italic Playfair) | `src/components/notes/note-memo-card.tsx:20~66` 신규. `bg-bg-sunken border-border-default` + radius 14 + Eyebrow(Inter 10 600 gold uppercase ls 1.8 mb 8) + body(Playfair 14 italic lh 23.1). `app/notes/[noteId].tsx:233`에서 mode 분기 이전 직접 호출 (NoteBodyBeginner/Expert 위) | RESOLVED |
| 1-F | Expert memo 데이터 안전 fallback | `app/notes/[noteId].tsx:43~59` `resolveMemo()` — expert는 `(expertFields as { memo?: string }).memo ?? ''` 안전 fallback. ExpertFields schema 자체 확장은 SCOPE-OUT (E4 v0.2.0 별도 cycle, 사양 §10 D2). MemoCard 빈 메모는 `t('notes.detail.noComment')` "코멘트 없음" fallback (note-memo-card.tsx:23~24) | RESOLVED (안전 fallback) |
| 1-G | PriceChip | `note-author-card.tsx:145~153` Row2. `priceKrw > 0` 일 때만 노출, `formatKrw(value, locale)` 로 ko-KR / en-US 분기 (line 49~55). `app/notes/[noteId].tsx:199~202`에서 `expertFields?.conclusions?.estimated_price_krw` fallback | RESOLVED |
| 1-H | EditBtn (Pencil 18 stroke 1.75 text-secondary) | `app/notes/[noteId].tsx:115~141` headerRight 메모이즈, Pencil 18 + Trash2 18 2-icon row. Edit onPress `router.push(... edit=1 templateId=${BUILTIN_*_ID})` (line 77~85) | RESOLVED |
| 1-I | "이 와인 보기" 하단 CTA 중복 제거 | `app/notes/[noteId].tsx` 전체에서 "이 와인 보기" / `viewWine` CTA 부재. WineHeaderLink 자체가 link 역할 (accessibilityLabel에 `t('notes.detail.viewWine')` 포함) | RESOLVED |

**판정: RESOLVED (9/9 요소 추가/제거 완료)**

---

### (2) Spacing 비율 — RESOLVED

| 위치 | 1차 지적 (target) | 적용 결과 | 검증 |
|---|---|---|---|
| ScrollView paddingBottom 40 | 32 → 40 | `app/notes/[noteId].tsx:209` `contentContainerStyle={{ paddingBottom: 40 }}` | RESOLVED |
| WineHeaderLink padding px 20 py 14 | 신규 | `note-wine-header-link.tsx:77~78` `paddingHorizontal: 20, paddingVertical: 14` | RESOLVED |
| AuthorMetaCard padding 14 + gap 10 | 신규 | `note-author-card.tsx:73, 78` `padding: 14`, `gap: 10` | RESOLVED |
| MemoCard mx 16 / mt 16 / p 16 | 신규 | `note-memo-card.tsx:30~33` 정확히 동일 | RESOLVED |
| MemoCard eyebrow mb 8 | 12 → 8 | `note-memo-card.tsx:46` `marginBottom: 8` | RESOLVED |
| 카드 vertical gap mt-4 (16) | mt-5 → mt-4 | `app/notes/[noteId].tsx:235` `<View className="mt-4 mx-4">` (Body 영역), MemoCard 자체 mt 16 (memo-card.tsx:31). NoteBodyBeginner/Expert 각 Section 사이는 `gap-4` (note-body-beginner.tsx:67, expert.tsx:90) = 16 | RESOLVED |
| BottleThumb flexShrink 0 | 신규 | `note-wine-header-link.tsx:90` `flexShrink: 0` | RESOLVED |
| Aroma chip gap 6 | gap-2 → gap-1.5 | `note-body-beginner.tsx:143` `style={{ rowGap: 6, columnGap: 6 }}` (gap 6 = 1.5 * 4 = 6px) | RESOLVED |

**판정: RESOLVED (8/8 spacing target 정합)**

---

### (3) Gradient 방향·깊이 — RESOLVED

| 위치 | 1차 target | 적용 결과 | 검증 |
|---|---|---|---|
| BottleThumb gradient | `notesDetailBottleThumbGradient(bottleColor)` 토큰 신규 + start{0,0}/end{0.342, 0.94} locations [0, 0.7] | `design-tokens.ts:637~648` factory 정의. `note-wine-header-link.tsx:61` 호출 + `LinearGradient` 적용 (`note-wine-header-link.tsx:102~108`). end 색 `dark.bg.bottleShelf` 양쪽 모드 동일 (E6 (a) 채택) | RESOLVED |
| AuthorAvatar L1~L5 gradient | `noteAuthorAvatarGradient.L1~L5` 토큰 신규 + 135deg | `design-tokens.ts:651~659` object 정의 (5 levels). `note-author-avatar.tsx:29, 47~52` 호출. v0.1.0은 L1 fallback (스크린샷의 dark navy/gray 톤과 매칭) | RESOLVED |

**판정: RESOLVED (2/2 gradient 토큰 추가 + 사용)**

> 멀티모달 비교: 스크린샷 line 2 (BottleThumb) 어두운 burgundy + 우측 하단 어두워지는 그라데이션 — `notesDetailBottleThumbGradient` end {0.342, 0.94} 와 정합. 스크린샷 line 4 (avatar) 어두운 회색-네이비 — L1 colors `#555560 → #2a2a35`와 정합.

---

### (4) Corner Radius — RESOLVED

| 위치 | 1차 target | 적용 결과 | 검증 |
|---|---|---|---|
| BottleThumb | radius 6 | `note-wine-header-link.tsx:86` `borderRadius: 6` | RESOLVED |
| AuthorMetaCard | radius 14 | `note-author-card.tsx:74` `borderRadius: 14` | RESOLVED |
| MemoCard | radius 14 | `note-memo-card.tsx:33` `borderRadius: 14` | RESOLVED |
| NoteBodyExpert Section | radius 14 | `note-body-expert.tsx:34` `borderRadius: 14` (각 Section) | RESOLVED |
| NoteBodyBeginner Section (legacy + new branches) | radius 14 | `note-body-beginner.tsx:73, 89, 128` 모두 `borderRadius: 14` | RESOLVED |
| TemplatePill / chips | radius 999 | `note-author-card.tsx:98, 161` `borderRadius: 999`. Aroma chip `note-body-beginner.tsx:151` `borderRadius: 999` | RESOLVED |
| Avatar | radius 999 (half = size/2) | `note-author-avatar.tsx:30, 38` `radius = size / 2` (32→16) | RESOLVED |

**판정: RESOLVED (7/7 radius target 정합)**

---

### (5) Typography 위계 — RESOLVED

| 위치 | 1차 target | 적용 결과 | 검증 |
|---|---|---|---|
| Card Eyebrow (모든 카드 공통) | Inter 10 600 gold uppercase ls 1.8 mb 10 | NoteBodyExpert `note-body-expert.tsx:41~54` font-inter-semibold size 10 lh 12 ls 1.8 uppercase brand.gold. NoteBodyBeginner `note-body-beginner.tsx:33~51` Eyebrow 헬퍼 동일 패턴 mb 10. MemoCard `note-memo-card.tsx:39~50` 동일 (mb 8 verbatim) | RESOLVED |
| Wine name (헤더) | Playfair 16 lh 20.8 cream (WineNameDisplay size="card") | `note-wine-header-link.tsx:113~118` `<WineNameDisplay size="card" />` | RESOLVED |
| Wine sub (vintage · region · country) | Inter 12 lh 14.4 text-muted mt 2 | `note-wine-header-link.tsx:120~127` 정확히 동일 (fontSize 12 lineHeight 14.4 marginTop 2) | RESOLVED |
| Author name | Playfair 14 lh 16.8 cream | `note-author-card.tsx:85~92` font-playfair text-text-primary size 14 lh 16.8. light 모드는 text-primary auto-dual로 적정 | RESOLVED |
| Avatar letter | Playfair 13 700 cream lh 15.6 | `note-author-avatar.tsx:53~63` font-playfair fontWeight 700 size 13 lh 15.6 color brand.cream | RESOLVED |
| TemplatePill | Inter 10 text-muted lh 12 | `note-author-card.tsx:103~109` size 10 lh 12 text-text-muted | RESOLVED |
| DateChip | Inter 12 text-muted (uppercase 제거) | `note-author-card.tsx:118~124` size 12 lh 14.4 text-text-muted. uppercase 부재 (1차 P2 clean-up 적용) | RESOLVED |
| RatingChip | Star 12 fill gold + Inter 12 600 gold (`${v}/5`) | `note-author-card.tsx:134~141` Star size 12 strokeWidth 0 fill brand.gold + font-inter-semibold size 12 lh 14.4 brand.gold. `formatRating()` (line 44~47) integer/half 분기 | RESOLVED (E2 (b) /5 채택) |
| PriceChip | Inter 12 text-secondary | `note-author-card.tsx:146~152` size 12 lh 14.4 text-text-secondary | RESOLVED |
| BlindChip | Inter 10 600 gold | `note-author-card.tsx:167~173` size 10 lh 12 color brand.gold (font-inter-semibold) | RESOLVED |
| MemoCard body | Playfair 14 italic cream lh 23.1 | `note-memo-card.tsx:52~62` font-playfair text-text-primary size 14 lh 23.1 italic | RESOLVED |
| NoteBodyExpert NoteText label | Inter 12 muted uppercase | `note-body-expert.tsx:64~70` size 12 lh 14.4 text-text-secondary uppercase | RESOLVED |
| NoteBodyBeginner Palate row | Inter 12 muted / Playfair 14 cream | `note-body-beginner.tsx:103~117` 12 muted / 14 cream — keyscreen `${v}/5` 대신 categorical label (RN shape 정합) | RESOLVED |

**판정: RESOLVED (13/13 typography target 정합)**

> 단 1건의 P3 잔재: `note-body-expert.tsx:49` Section eyebrow `marginBottom: -2` — rowGap 12 보정용 hack. 시각 영향 미미 (실제 mb = rowGap(12) - 2 = 10, keyscreen target mb 10과 동일). 가독성 면에서는 별도 `rowGap` 12 → 10 통일이 깔끔하나 SCOPE-IN 안 함.

---

### (6) Color 사용 — RESOLVED

| 위치 | 1차 target | 적용 결과 | 검증 |
|---|---|---|---|
| AuthorMetaCard border | `border-gold` (#C9A84C 양쪽 동일) | `note-author-card.tsx:77` `borderColor: brand.gold` | RESOLVED |
| AuthorMetaCard bg | `bg-surface` | `note-author-card.tsx:80` `className="bg-surface"` | RESOLVED |
| BottleThumb border | `withAlpha(brand.gold, 0.18)` | `note-wine-header-link.tsx:89` `borderColor: withAlpha(brand.gold, 0.18)` | RESOLVED |
| Avatar border | `withAlpha(brand.gold, 0.3)` | `note-author-avatar.tsx:41` | RESOLVED |
| MemoCard bg | `bg-bg-sunken` | `note-memo-card.tsx:28` `className="bg-bg-sunken border-border-default"` | RESOLVED |
| MemoCard border | `border-border-default` | `note-memo-card.tsx:28` | RESOLVED |
| Eyebrow text 통일 | `text-gold` (모든 카드) | NoteBodyExpert `note-body-expert.tsx:48` brand.gold. NoteBodyBeginner `note-body-beginner.tsx:43` brand.gold. MemoCard `note-memo-card.tsx:45` brand.gold. NoteAuthorCard 자체는 eyebrow 없음 (avatar 카드 — 정상) | RESOLVED |
| StarRatingReadOnly 색 | brand.gold | n/a (메타 strip 자체 제거 — RatingChip이 대체) | RESOLVED |
| 하드코딩 hex grep | 0 | grep `#[0-9a-fA-F]{3,8}` against 모든 수정 파일 7개 = 0건 매치. `brand.*` / `withAlpha` / `dark.bg.*` 토큰 경유만 | RESOLVED (P0 회피) |
| 토큰 dual 정의 | dark/light 양쪽 | `bg-bg-sunken` (tailwind.config.ts 기존 dual), `bg-surface` (dual), `border-gold` (양쪽 동일 #C9A84C), `noteAuthorAvatarGradient` (양쪽 동일 — keyscreen 의도), `notesDetailBottleThumbGradient` end 색 `dark.bg.bottleShelf` 양쪽 동일 (E6 (a)) | RESOLVED |

**판정: RESOLVED (10/10 color target 정합 + 0 하드코딩 hex)**

---

## 다크/라이트 양쪽 모드 — PARTIAL

- **dark 모드**: 멀티모달 비교 PASS — 스크린샷 (Expert · dark · ko)과 현재 RN 구현이 시각 동등.
- **light 모드**: **본 2차 리뷰에서 시뮬레이터 캡처 미수행** (rn-screen-builder 미커밋 상태이므로 빌드 의존). 단 토큰 dual 정의는 확인 완료:
  - `bg-bg-sunken`: dark rgba(0,0,0,0.28) / light rgba(42,26,20,0.06) — OK
  - `bg-surface`: dual — OK
  - `text-text-primary`: dual (auto via className) — OK
  - `border-gold`: 양쪽 #C9A84C 의도 — OK
  - `noteAuthorAvatarGradient`, `notesDetailBottleThumbGradient` 양쪽 동일 (E6 (a) 채택) — OK
- **권장**: qa-inspector 단계에서 light 모드 시뮬레이터 캡처 필수 (CLAUDE.md §4-9). 토큰 dual 자체에 갭은 없으므로 본 게이트 차단 사유 아님.

---

## 멀티모달 시각 비교 (스크린샷 vs 현재 RN)

스크린샷 line by line (Expert · dark · ko):

| 영역 | 스크린샷 | 현재 RN | 정합 |
|---|---|---|---|
| Header line 1 | BackBtn + "테이스팅 노트" + Pencil + Share2 | BackBtn + "테이스팅 노트" + Pencil + Trash2 | OK (Share 미노출, Delete 노출 — E7 (b) + RN 표준 채택) |
| Wine header line 2~3 | 44×64 burgundy thumb + "Château Margaux" + "2018 · 보르도 · 프랑스" | NoteWineHeaderLink (동일 구조) | OK |
| AuthorMetaCard line 4~7 | gold border + "예" avatar (dark gray) + "예진" + "전문가용 노트" pill / "2025-09-14" + "★ 92/100" + "₩1,180,000" | NoteAuthorCard (동일 구조) — rating은 `${v}/5` (E2 (b) 채택 — 스크린샷 /100 표기와 차이는 의도된 deviation) | OK (E2 deviation 사양 §10 권장) |
| MemoCard line 8~11 | bg-sunken + "메모" eyebrow + italic body "여전히 어리지만 향만으로도 압도된다..." | NoteMemoCard (동일 구조 + Playfair italic) | OK |
| WSET 차원 카드 line 12~15 | 단어 라벨 "단맛 · 산미 · 바디 · 알코올 · 타닌" + 값 "낮음/중+/높음/중/높음" | NoteBodyExpert WSETReadOnly dot bar (E5 (b) 유지) | DEVIATION (SCOPE-OUT, 사용자 결정 대기) |
| 구조 카드 line 16~20 | "향 강도/풍미 강도/타닌 질감/마무리 길이" | NoteBodyExpert 4-section 중 Nose/Palate에 흡수 (E8 (a) 4-section 유지) | DEVIATION (SCOPE-OUT, schema 확장 v0.2.0) |
| 여운·온도, 아로마, 오프닝 타임라인, 음용 적기 카드 | 풀 트리 | NoteBodyExpert 4-section만 (E8 SCOPE-OUT) | DEVIATION (SCOPE-OUT) |

핵심 시각 인상 (상단 4 영역 — 헤더/와인헤더/AuthorMeta/Memo) 정합도: **100% 동등**.
하단 (DimensionsExpert 풀 트리) deviation은 사양 §10 E5/E8 명시 SCOPE-OUT, 본 2차 게이트 차단 사유 아님.

---

## 새 FAIL 신규 발생 여부 — 없음

본 2차 리뷰에서 1차 미지적 항목 중 새로 FAIL이 된 항목 0건. 1차 RESOLVED 처리한 항목들이 회귀 (regression) 없이 그대로 유지.

체크:
- emoji 사용 (CLAUDE.md §4-1): grep 결과 0건 (수정 7파일 전부)
- 하드코딩 hex (CLAUDE.md §4-9): grep 결과 0건
- 사용자 UUID 노출 (CLAUDE.md §4-5): `authorLetter`/`authorName`은 `profile?.anonymous_display` 경유 + `meLabel` fallback. UUID 직접 노출 0
- ko·en 양쪽 키 (CLAUDE.md §4-4): i18n 신규 16+ 키 양쪽 채움 확인 (`sectionMemo` ~ `deleteAria`)
- `SUPABASE_SERVICE_ROLE_KEY` (CLAUDE.md §4-7): 사용 부재
- RLS 우회 (CLAUDE.md §4-6): `useNote(noteId)` 훅 경유 — RLS 자동 필터 (mine only)

---

## SCOPE-OUT 유지 항목 (5건 — 본 게이트 차단 사유 아님)

| ID | 항목 | 상태 | 사유 |
|---|---|---|---|
| E2 | rating 단위 `/5` vs `/100` | partial RESOLVED | `/5` 채택 (사양 §10 E2 (b) 권장). 사용자가 `/100` 원할 시 `formatRating`만 교체 (line 44~47) — 별도 cycle |
| E4 | Expert memo 필드 schema 확장 | SCOPE-OUT (v0.2.0) | 본 화면은 `expertFields?.memo ?? ''` 안전 fallback. expert-form 필드 추가는 별도 cycle (notes-write 사양 갱신 필요) — design-spec-author 트리거 대상 |
| E5 | WSET scale 단어 라벨 vs dot bar | RE-ESCALATE (사용자 결정 대기) | 스크린샷은 단어 ("낮음/중+/높음"), 현재 RN은 dot bar — 사양 §10 E5 (b) 권장 유지. 사용자 결정 필요 |
| E7 | Share 버튼 v0.1.0 동작 | SCOPE-OUT 유지 (현재 일치) | Share 미노출 (E7 (b)). v0.2.0 native Share API 도입 |
| E8 | DimensionsExpert 4-section vs 10-card | SCOPE-OUT 유지 (현재 일치) | RN ExpertFields shape 부재 필드 (bubbles/aromaWheel/evolution/faults/wouldBuyAgain) — v0.2.0 schema 확장 시 keyscreen-style 10-card 도입 |

---

## SCOPE-OUT (본 리뷰 미수행, 사용자 명시 SCOPE-OUT)

- Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav tabs 구성
- AppHeader 재작성
- tasting_notes.is_public 컬럼 (supabase-engineer)
- shared notes / Expert memo / profiles.level_id (v0.2.0)
- E5 WSET 5-col 단어 vs dot bar (사용자 결정 대기)

---

## 잔여 권장 사항 (PASS 게이트 통과 후 별도 cycle — non-blocking)

| 우선순위 | 항목 | 위치 | 권장 |
|---|---|---|---|
| P3 | NoteBodyExpert Section eyebrow `marginBottom: -2` hack | `note-body-expert.tsx:49` | rowGap 12 → 10 + marginBottom 0 통일이 깔끔. 시각 영향 0 (실효 mb 10), SCOPE-OUT 무방 |
| P3 | i18n `editAria`, `deleteAria` 정의됨 / 사용 정상 | `app/notes/[noteId].tsx:123, 133` | OK — 단순 검증 완료 |
| P2 | light 모드 시뮬레이터 캡처 | qa-inspector 단계 | CLAUDE.md §4-9 필수. 토큰 dual 자체는 OK |

---

## 라우팅 — 다음 단계

### → qa-inspector (다음 게이트)

- 시각 게이트 PASS. qa-inspector가 다음 단계 검증:
  - RLS 정책 동작 (mine only, A의 노트를 B가 못 보는지)
  - wines_localized VIEW join shape (region/country 컬럼 형태)
  - 하드코딩 hex grep (이미 0 확인)
  - emoji grep (이미 0 확인)
  - ko·en 양쪽 키 누락 검증
  - dark·light 양쪽 시뮬레이터 캡처 (CLAUDE.md §4-9)
  - SUPABASE_SERVICE_ROLE_KEY 격리

### → rn-screen-builder (no-op)

- 본 게이트 PASS. 추가 수정 요청 없음.

### → design-spec-author (no-op)

- 사양 §10 E4 (Expert memo) trigger는 v0.2.0 시점 — 본 cycle 무관.

### → 사용자 의사결정 (escalation re-check)

- **E2 rating 단위 `/5`**: 현재 채택. 다른 의도면 알려달라.
- **E5 WSET 5-col 단어 라벨**: 스크린샷은 단어 ("낮음/중+/높음"), 현재 RN은 dot bar. 본 2차 리뷰는 사양 §10 E5 (b) 권장 dot bar 유지 — 사용자 결정 시 후속 cycle 가능.

---

## 결정 (2차 게이트)

| 항목 | 값 |
|---|---|
| 결과 | **PASS** |
| STILL-FAIL 수 | **0** |
| 신규 FAIL 수 | **0** |
| SCOPE-OUT 유지 | 5 (E2 partial, E4 v0.2.0, E5 RE-ESCALATE, E7, E8) |
| 1차 FAIL 6/6 처리 | 6 RESOLVED (요소 누락 9/9, spacing 8/8, gradient 2/2, radius 7/7, typography 13/13, color 10/10) |
| 다음 단계 | qa-inspector 게이트 진행 |
| 잔여 작업 | (P3) NoteBodyExpert eyebrow rowGap clean-up · (P2) light 모드 시뮬레이터 캡처 — qa-inspector 단계 |

— 끝.
