# wine-detail (`/wine/[lwin]`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen messages/inline `LocaleText` > design-system docs > 우리 design-tokens.
> 작성일: 2026-05-20 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/wine/[id]/page.tsx` (87 lines — `WineDetailPage` server component, 11 자식 + `BackHeader`/`BottomNav` 2 nav)
- 자식 컴포넌트 (재귀 read 13개):
  - `../winemine-keyscreen/src/components/nav/back-header.tsx`
  - `../winemine-keyscreen/src/components/nav/bottom-nav.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/wine-header.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/serving-temp-pill.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/favorite-toggle.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/my-tasting-note-card.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/write-note-cta.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/external-ratings-card.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/average-price-pill.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/price-chart.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/price-chart-inner.tsx` (Recharts)
  - `../winemine-keyscreen/src/components/community-drink-window/community-drink-window-card.tsx`
  - `../winemine-keyscreen/src/components/community-drink-window/peak-distribution.tsx` (Recharts BarChart)
  - `../winemine-keyscreen/src/components/wine-story/wine-story-card.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/review-list.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/review-card.tsx`
  - `../winemine-keyscreen/src/components/wine-detail/add-to-cellar-cta.tsx`
  - `../winemine-keyscreen/src/components/shared/wm-bottle.tsx`
- 도메인 lib:
  - `../winemine-keyscreen/src/lib/drink-window.ts` (vintage + grape/region 휴리스틱 → `{from, peak, to}`)
  - `../winemine-keyscreen/src/lib/community-peak-aggregator.ts` (L3/L4/L5 가중 평균·중앙값·연도별 분포)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- i18n: 본 화면은 keyscreen에서 `LocaleText value={{ ko, en }}` 인라인 패턴 (별도 messages/wineDetail 네임스페이스 없음). 우리 `src/lib/i18n/{ko,en}.json` `wineDetail.*` 네임스페이스로 흡수.
- 스크린샷 reference: `_workspace/keyscreen-shots/wine_lwin.png` (Château Margaux 2018, dark, ko — 헤더 + 좋아요 + 히어로(병+서빙온도 칩) + tabs(노트/가격/스토리/리뷰) + WriteNoteCta + 외부 평점 3분할 + 평균 구매가 + 가격 차트 + 커뮤니티 음용 적기 + 리뷰 일부 + 셀러에 추가 CTA 풀스크롤)
- 현재 RN 구현 (retroactive 대상): `app/wine/[lwin].tsx` (138 LOC) + `src/components/wine/{wine-hero,wine-meta,drinking-window-bar,community-peak-placeholder,add-to-cellar-sheet}.tsx` (~430 LOC 합)

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/wine/[lwin].tsx` (그대로 — 기존 라우트 유지) |
| 진입 경로 | `/wine/[lwin]` |
| 진입 트리거 | 홈 WineFeedRow, RecentNotesStrip, 셀러 상세, 노트 상세, 캡처 인식 결과, 검색 결과 |
| 헤더 | 화면 내부 `<BackHeader title={wineName}>{children=<FavoriteToggle/>}</BackHeader>` — `(tabs)` 라우트 그룹 밖이라 BottomNav 자동 없음 |
| BottomNav | **표시하지 않음** (keyscreen `<BottomNav/>`는 page에 명시했지만 detail은 detail 스택 — 우리 expo-router는 `/wine/[lwin]`이 (tabs) 밖이므로 자동 hide) — keyscreen verbatim 위반 아님 (RN 패턴) |
| 다크/라이트 | 둘 다 지원 |
| 가드 | `lwin` query missing → `notFound()` (keyscreen) → RN: empty state `wineDetail.notFound` (이미 RN 구현 line 39~62 동일 패턴) |

> **현재 RN 차이**: keyscreen `page.tsx`는 BottomNav를 직접 render. 우리는 `/wine/[lwin]` 가 `(tabs)` 그룹 밖이라 자동 hide — RN 표준. design-reviewer 시각 비교 시 BottomNav 부재 차이 무시 (의도).

---

## 2. Layout Tree (verbatim 변환)

keyscreen `page.tsx` 라인 44~85 그대로 RN 트리화. wineId → lwin.

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader (height 56, padding 0 16, flex row items-center justify-between)
│     ├── Left (flex row items-center gap=4, min-w-0, flex-1)
│     │     ├── BackButton (32×32, ChevronLeft 24px stroke 1.75, color cream/text-primary)
│     │     └── Title (Inter 16px 600, cream/text-primary, lh 1.2, 1줄 truncate)
│     └── Right slot (flex row items-center gap=8, flex-shrink 0)
│           └── FavoriteToggle (32×32 button, Star 22px stroke 1.75)
│                 - active: fill gold + color gold
│                 - idle: fill transparent + color text-secondary
│                 - press: toast "즐겨찾기에 추가했어요" / "Removed from favorites"
├── ScrollView (flex-1, contentContainerStyle: paddingBottom 32 (keyscreen pb-96 → BottomNav 자동 인셋 자리. 우리 (tabs) 외부라 32만), gap 16 between 모든 자식 section)
│     │
│     ├── WineHeader (m=0_16_20, padding 0_16 → 우리는 mx-4 + padding-bottom 20; 내부 radius 18)
│     │     ├── Hero LinearGradient outer (radius 18, border 1px border-default, overflow hidden, padding 32_0_24)
│     │     │     - background: radial-gradient(ellipse at center top, ${bottleColor}35 0%, bg-deep 70%)
│     │     │       → RN 등가: ExpoLinearGradient 단방향 fade는 일부 비등가. radial은 react-native-svg <RadialGradient/> 또는 단순화. **§8 deviation**
│     │     ├── ServingTempPill (absolute, right 12, bottom 12)
│     │     │     - flex inline-flex items-center gap=4, padding 4_10, radius full
│     │     │     - bg rgba(201,168,76,0.12), border 1px gold, color gold
│     │     │     - Inter 11px 500 lh 1.2
│     │     │     - Thermometer 12 stroke 1.75 + "{min}-{max}°C 권장" / "...recommended"
│     │     │     - GlossaryTooltip (RN deviation — 본 화면 v0.1.0에서는 미구현 또는 BottomSheet 모달로 대체)
│     │     └── WMBottle (center, width 88, height 290) — 와인 라벨 SVG (병 형태 + 라벨 + 빈티지 텍스트)
│     │           - bottleColor (wine.bottle_color || default by type)
│     │           - producer (wine.producer_name 첫 단어)
│     │           - label (wine.display_name 첫 단어)
│     │           - vintage
│     │     [텍스트 메타 영역, mt=16, padding 0_16]
│     │     ├── Type dot row (flex items-center gap=6, mb=6)
│     │     │     ├── Dot (8×8 radius full, bg type별 색 — red:#8B1A2A / white:#d6c46b / rose:#e89b9b / sparkling:#e8d690 / fortified:#5a2218 / dessert:#a07030)
│     │     │     └── Type text (Inter 11px, text-secondary, capitalize) — wine.type_canonical
│     │     ├── h1 (Playfair 24px 400 cream, ls -0.01em, lh 1.2) — wine.name (i18n: name_ko ?? display_name)
│     │     ├── Producer (Inter 13px text-secondary, mt=4) — wine.producer_name
│     │     └── Region·Country line + vintage·grapes line (Inter 11px text-muted, lh 1.5, mt=6)
│     │           ├── "{region} · {country}"
│     │           └── "{vintage} · {grapes.join(', ')}"  (newline로 분리)
│     │
│     ├── MyTastingNoteCard (m=0_16_16, conditional: 내 노트 존재 시) — Pressable role=button → /notes/{noteId}
│     │     ├── Outer (padding 16, bg surface, border 1px gold, radius 16, shadow goldGlow 0 0 24 rgba(201,168,76,0.10), gap 12 col)
│     │     ├── Header row (flex items-center justify-between)
│     │     │     ├── Left chip (BookOpen 16 gold + label "내 노트" Inter 12 600 gold UPPER ls 0.06em)
│     │     │     └── Edit btn (Pencil 11 + "수정" Inter 11 600 text-secondary) → /notes/new/write?from=newEntry&wine_lwin={lwin}&edit=1
│     │     ├── Meta row (flex items-center gap=14 flex-wrap)
│     │     │     ├── tastedAt (Calendar 11 + Inter 12 text-muted)
│     │     │     ├── rating (Star 11 fill gold + Inter 12 600 gold) — "92/100" or "4/5"
│     │     │     └── Mode badge (padding 2_8 radius lg ls 0.04em UPPER Inter 10 700)
│     │     │           - expert: bg wine-red, color cream
│     │     │           - beginner: bg rgba(201,168,76,0.18), color gold
│     │     ├── (expert only) WSET 4-grid mini (4-col, gap 6, padding 10, bg rgba(15,7,24,0.6), radius lg)
│     │     │     └── MiniDim × 4 (sweetness/acidity/body/tannin)
│     │     │           - label Inter 9 text-muted UPPER ls 0.04em
│     │     │           - value Playfair 13 cream lh 1.1 ("낮음"|"중−"|"중"|"중+"|"높음" / "Low"|"M−"|"Med"|"M+"|"High")
│     │     └── (expert + community>=10 only) Community compare box (padding 12, bg rgba(139,26,42,0.12), border 1px wine-red, radius lg)
│     │           ├── eyebrow Inter 11 600 wine-red-hover UPPER ls 0.06em — "커뮤니티 비교"
│     │           ├── stat row (baseline gap 10, Inter 13 cream)
│     │           │     - "내 점수 {strong Playfair 16}{N}{/strong}"
│     │           │     - "·"
│     │           │     - "평균 {strong Playfair 16}{avg.toFixed(1)}{/strong}"
│     │           │     - diff (700, color success/error/text-muted) — "+N" or "N" or "0"
│     │           └── basis (Inter 11 text-muted) — "{count}명 기준 / Based on {count}"
│     │
│     ├── WriteNoteCta (m=0_16, conditional: 내 노트 부재 시) — section role=section
│     │     ├── Outer (padding 16, bg surface, border 1px border-default, radius 16, flex row items-center gap=14)
│     │     ├── Icon circle (40×40 radius full, bg rgba(139,26,42,0.15), border 1px rgba(139,26,42,0.3), flex-shrink 0)
│     │     │     └── Wine glass SVG (20×20 stroke 1.6 wine-red — path "M8 3h8s0 6-4 8c-4-2-4-8-4-8z" + "M12 11v9M9 20h6")
│     │     ├── Text col (flex-1 min-w-0)
│     │     │     ├── Title "아직 노트가 없어요" / "No notes yet" (Inter 13 600 cream, mb=2)
│     │     │     └── Sub "이 와인의 시음 경험을 기록해보세요" / "Record your tasting experience" (Inter 11 text-muted lh 1.4)
│     │     └── CTA pill (padding 8_14 radius full bg wine-red, border 1px rgba(201,168,76,0.4), color cream, Inter 12 600, shadow 0 4 12 rgba(139,26,42,0.35), nowrap, flex-shrink 0)
│     │           - label "노트 작성" / "Write Note"
│     │           - onPress → /notes/new/write?from=newEntry&wine_lwin={lwin}
│     │
│     ├── ExternalRatingsCard (m=0_16, padding 16, bg surface, border 1px border-default, radius 16)
│     │     ├── Header row (flex items-center justify-between mb=12)
│     │     │     ├── h2 "외부 평점" / "External ratings" (Inter 14 600 cream)
│     │     │     └── Global avg block (right) — conditional
│     │     │           ├── label "글로벌 평균가" / "Global avg" (Inter 10 text-muted)
│     │     │           └── price (Playfair 18 600 gold) — "${rating.globalAvgPriceUsd.toLocaleString()}"
│     │     ├── 3-col grid (gridTemplateColumns repeat(3,1fr), gap 8)
│     │     │     └── RatingPill × 3 (Vivino / Wine Searcher / CellarTracker)
│     │     │           - padding 10_8, bg bg-map, radius 10, border 1px border-default, minHeight 70, col gap 2
│     │     │           - source label (Inter 10 text-muted UPPER ls 0.05em)
│     │     │           - score (Playfair 18 700 cream lh 1.1)
│     │     │                 - Vivino: Star 14 fill gold + "{score.toFixed(1)}" gold inline-flex gap 2
│     │     │                 - Wine Searcher / CellarTracker: "{score}<small text-muted>/100</small>" cream
│     │     │                 - 데이터 없으면 "—" text-muted
│     │     │           - sub (Inter 10 text-muted) — Vivino: "{reviewCount} reviews", CT: "{reviewCount} reviews", WS: priceRank LocaleText
│     │     └── Footer row (mt=12, flex items-center justify-between, Inter 10 text-muted)
│     │           ├── "마지막 동기화: {lastSyncedAt}" / "Last synced: {lastSyncedAt}"
│     │           └── Info button (12 stroke 1.75 gold) → toast "시안 mock 데이터입니다" / "Mock data only"
│     │     - empty 분기 (rating null): centered "외부 평점 없음" / "No external ratings" (Inter 13 text-muted)
│     │
│     ├── AveragePricePill (m=0_16, padding 14, bg surface, border 1px border-default, radius xl, flex items-center justify-between)
│     │     ├── Left col
│     │     │     ├── Label "평균 구매가" / "Average price" (Inter 12 text-muted)
│     │     │     └── Count "{n}건 등록" / "{n} entries" (Inter 11 text-muted, mt=4)
│     │     └── Right col (text-right)
│     │           ├── KRW value (Playfair 20 700 cream lh 1.1) — "₩{avgKrw.toLocaleString()}"
│     │           └── USD approx (Inter 11 text-muted) — "≈ ${approxUsd.toLocaleString()}" (conditional approxUsd>0)
│     │
│     ├── PriceChart variant=compact (m=0_16, padding 16, bg surface, border 1px border-default, radius 16)
│     │     ├── Header row (flex items-center justify-between mb=12)
│     │     │     ├── h2 "가격 추이" / "Price history" (Inter 14 600 cream)
│     │     │     └── Range toggle (3 buttons flex gap 4)
│     │     │           - 3M / 1Y / ALL (default 1Y)
│     │     │           - active: bg wine-red, color cream, border 1px border-default, padding 4_8, radius lg, Inter 11 600
│     │     │           - idle: bg bg-map, color text-muted
│     │     ├── Chart container (height 200)
│     │     │     - empty: centered "아직 등록된 가격이 없어요" / "No purchases yet" (Inter 12 text-muted)
│     │     │     - data: LineChart (Recharts) — RN deviation §8: victory-native v40 또는 react-native-svg-charts 대체
│     │     │           - X axis: month label "{yy.m}" (ko) | "{m}/{yy}" (en), tick fill text-muted size 10
│     │     │           - Y axis: price formatter "₩{k|M}", tick fill text-muted size 10
│     │     │           - Grid: strokeDasharray 3 3, stroke border-default opacity 0.4 (horizontal only)
│     │     │           - Line: type monotone, stroke wine-red, strokeWidth 2
│     │     │           - Dot: fill gold, stroke gold, r 4; activeDot r 6
│     │     │           - Reference line: y=avg, stroke gold dashed 4 4, label "평균"/"Avg" inside top right gold size 10
│     │     │           - Tooltip: bg surface, border 1px gold, radius 10, padding 8_10, shadow 0 8 22 rgba(0,0,0,0.6), maxWidth 240
│     │     │                 ├── "₩{priceKrw}" (Inter 12 700 gold)
│     │     │                 ├── "{store.name}{branch?` · ${branch}`:''}" (Inter 12 text-secondary mt=2)
│     │     │                 └── "{date} · {anonReviewer}" (Inter 12 text-muted mt=2)
│     │     └── Details link (mt=8, text-right, padding 6_10) — ArrowRight 14 + "상세보기" / "View details" Inter 12 600 gold → `/wine/{lwin}/prices`
│     │     **참고**: `/wine/{lwin}/prices` 화면 자체는 v0.2.0 deferred (§9). v0.1.0은 링크만 비활성 또는 toast로 안내.
│     │
│     ├── CommunityDrinkWindowCard (m=0_16, padding 16, bg surface, border 1px border-default, radius 16)
│     │     ├── Header row (flex items-center gap=6, mb=6)
│     │     │     ├── Users 16 stroke 1.75 gold
│     │     │     └── h2 "커뮤니티 음용 적기" / "Community drinking window" (Inter 14 600 cream)
│     │     ├── Sub "전문가 {n}명이 추정한 절정 시점" / "Estimated by {n} experts (L3+)" (Inter 12 text-muted mb=12)
│     │     ├── (empty count==0): "아직 추정 데이터가 부족해요. 전문가 노트에서 입력해주세요" / "Not enough data. Add an estimate in your expert note." centered Inter 13 text-muted padding 32_16
│     │     ├── (data) Big stat (Playfair 20 700 cream mb=8) — "평균 {mean} · 중앙값 {median}" / "Mean {mean} · Median {median}"
│     │     ├── (data) PeakDistribution histogram (BarChart, height 180, showLegend)
│     │     │     - x: 연도, y: 가중 응답 count
│     │     │     - bar fill: gold (system peak는 강조)
│     │     │     - reference lines: system peak (wine-red dashed), mean (cream dashed)
│     │     │     - **RN deviation §8: Recharts 미사용. victory-native BarChart 또는 react-native-svg 직접**
│     │     ├── (data) Distribution copy (Inter 12 text-secondary mt=10) — "{count}명 중 {pct}%가 {min}~{max} 사이 추천" / "{pct}% of {count} reviewers suggest {min}-{max}"
│     │     └── Details link (mt=12, text-right, padding 6_10) — ArrowRight 14 + "상세 보기" / "Details" Inter 12 600 gold → `/wine/{lwin}/community-peak`
│     │     **참고**: `/wine/{lwin}/community-peak` 화면 자체는 v0.2.0 deferred (§9).
│     │
│     ├── WineStoryCard (m=0_16, padding 16, minHeight 220, bg surface, border 1px border-default, radius 16, flex col)
│     │     ├── (empty story==null) "이 와인의 스토리는 준비 중" / "Story coming soon" centered Inter 13 text-muted
│     │     ├── (data) Header row (flex items-center justify-between)
│     │     │     ├── Label "와이너리 이야기" / "Winery story" (Inter 12 500 gold ls 0.04em)
│     │     │     └── FunFact button (Lightbulb 14 stroke 1.75 gold, padding 4, border 1px gold, radius full, color gold)
│     │     │           - press toggle → tooltip popover (absolute top 48 right 12 maxW 260)
│     │     │                 - padding 12, bg bg-map, border 1px gold, radius xl, color cream, Inter 12 lh 1.5, shadow 0 8 22 rgba(0,0,0,0.5)
│     │     │                 - header "재미있는 이야기" / "Fun fact" (Inter 11 600 gold mb=4)
│     │     │                 - body story.funFact (LocaleText)
│     │     ├── h2 (Playfair 22 700 cream lh 1.2, m=12_0_4) — "{wineryName} · {foundedYear}"
│     │     ├── Location (LocaleText story.location → div Inter 12 text-muted) — wm-story-loc 클래스
│     │     ├── Excerpt body (Inter 13 text-secondary lh 1.55 m=12_0_0 flex-1) — story.history 첫 paragraph 첫 2 sentences
│     │     └── More link (mt=12, text-right, padding 6_10) — ArrowRight 14 + "더 읽기" / "Read more" Inter 12 600 gold → `/wine/{lwin}/story`
│     │     **참고**: `/wine/{lwin}/story` 화면 자체는 v0.2.0 deferred (§9).
│     │
│     ├── ReviewList (m=0_16)
│     │     ├── Header row (flex items-center justify-between mb=12)
│     │     │     ├── h2 "리뷰" / "Reviews" + count span (Inter 14 600 cream, count는 400 text-muted ml=6)
│     │     │     └── SortBtn × 2 (flex gap 4)
│     │     │           - "최근"/"Recent" / "평점 높은 순"/"Top rated"
│     │     │           - active: bg wine-red, color cream
│     │     │           - idle: bg bg-map, color text-muted, border 1px border-default
│     │     │           - padding 4_10, radius lg, Inter 11 600
│     │     ├── (empty) "아직 리뷰가 없어요" / "No reviews yet" centered padding 24 Inter 13 text-muted
│     │     └── (data) ul (column gap 10)
│     │           └── ReviewCard × min(5, reviews.length) — Pressable → /profile/{userId}
│     │                 - padding 14, bg surface, border 1px border-default, radius xl
│     │                 - Top row (flex items-center gap=6 flex-wrap):
│     │                       - Author name (Inter 14 600 cream) - LocaleText user.displayName ('익명 사용자'/'Anonymous' fallback)
│     │                       - LevelPill (level별 색, label level.name.en)
│     │                       - ReviewBadge × max 2 (tier color, bronze/silver/gold/platinum)
│     │                       **CRITICAL**: LevelPill + ReviewBadge **동반 표시 (닉네임 단독 노출 금지)** — SPEC 정책
│     │                 - Body (LocaleText review.body, p .wm-review-body — Inter 13 text-secondary lh 1.55)
│     │                 - Bottom row (mt=10, flex items-center justify-between, Inter 11 text-muted)
│     │                       - left: createdAt
│     │                       - right rating:
│     │                             - expert: strong "{rating}/100" gold 13
│     │                             - beginner: Star 12 fill gold + strong "{rating}/5" cream 13
│     │
│     └── AddToCellarCta variant=inline (m=8_16_0)
│           - Pressable → /capture (keyscreen) 또는 우리는 AddToCellarSheet open (RN는 sheet 더 자연스러움, §8)
│           - width 100%, height 52, padding 0_20, radius 14, bg wine-red, color cream, Inter 15 600
│           - shadow 0 6 18 rgba(139,26,42,0.45)
│           - Plus icon 18 stroke 2 + "셀러에 추가" / "Add to cellar"
│
└── (BottomNav — Expo Router 자동 hide, keyscreen 명시했지만 RN tab 외 라우트라 무관)
```

> **순서 verbatim (keyscreen line 44~85)**:
> 1. WineHeader → 2. MyTastingNoteCard (조건) → 3. WriteNoteCta (조건) → 4. ExternalRatingsCard → 5. AveragePricePill → 6. PriceChart compact → 7. CommunityDrinkWindowCard → 8. WineStoryCard → 9. ReviewList → 10. AddToCellarCta inline
> ScrollView gap=16 (keyscreen line 57). AddToCellarCta는 keyscreen에서 별도 `padding: 8 16 0` wrapper로 감쌈.

---

## 3. NativeWind 매핑표

각 요소의 keyscreen 인라인 style → RN+NW v4 className/style. 토큰은 `src/lib/design-tokens.ts` + `tailwind.config.ts` 기준.

### 3-1. BackHeader + FavoriteToggle

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| header outer | `height 56; padding 0 16; flex; alignItems center; justifyContent space-between; flexShrink 0; gap 8` | `<View className="h-14 flex-row items-center justify-between px-4" style={{flexShrink:0, gap:8}}>` (이미 `src/components/nav/back-header.tsx` 존재 — 그대로 사용) |
| left wrap | `display flex; alignItems center; gap 4; minWidth 0; flex 1` | `<View className="flex-row items-center flex-1" style={{gap:4, minWidth:0}}>` |
| back button | `width 32 height 32; background transparent; color cream; cursor pointer; padding 0` | `<Pressable className="w-8 h-8 items-center justify-center" accessibilityLabel="Back" hitSlop={8}>` + `<ChevronLeft size={24} strokeWidth={1.75} color={tokens.text.primary}/>` |
| title | `.wm-back-title` = Inter 16 600 cream lh 1.2 | `<Text className="font-inter-semibold text-back-title text-text-primary dark:text-text-primary" numberOfLines={1}>{wineName}</Text>` |
| right slot | `display flex; alignItems center; gap 8; flexShrink 0` | `<View className="flex-row items-center" style={{gap:8, flexShrink:0}}>` |
| FavoriteToggle btn | `width 32 height 32; bg transparent; color active?gold:text-secondary` | `<Pressable className="w-8 h-8 items-center justify-center" accessibilityRole="button" accessibilityState={{selected:active}} accessibilityLabel={active?t('wineDetail.fav.remove'):t('wineDetail.fav.add')} onPress={toggle}>` + `<Star size={22} strokeWidth={1.75} fill={active?brand.gold:'transparent'} color={active?brand.gold:tokens.text.secondary}/>` |

### 3-2. ScrollView 외곽

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| `<main>` | `flex 1; overflowY auto; paddingBottom 96; display flex; flexDirection column; gap 16` | `<ScrollView className="flex-1" contentContainerStyle={{paddingBottom: 32, gap: 16}} showsVerticalScrollIndicator={false}>` |

> keyscreen pb=96은 BottomNav 자동 공간. 우리는 tabs 외부라 32만. **§8 deviation 명시**.

### 3-3. WineHeader

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| `<section>` | `position relative; padding 0 16px 20px` | `<View className="px-4 pb-5" style={{position:'relative'}}>` |
| Hero outer div | `background: radial-gradient(ellipse at center top, ${bottleColor}35 0%, var(--color-bg-deep) 70%); display flex; justifyContent center; padding 32 0 24; borderRadius 18; border 1px var(--color-border-default); position relative; overflow hidden` | radial-gradient은 RN에 없음 — react-native-svg `<Svg><Defs><RadialGradient/></Defs><Rect fill="url(...)"/></Svg>` 또는 단순화: `<LinearGradient colors={[withAlpha(bottleColor, 0.21), tokens.bg.deep]} start={{x:0.5,y:0}} end={{x:0.5,y:1}} locations={[0,0.7]} style={{borderRadius:18, borderWidth:1, borderColor:tokens.border.default, paddingVertical:24, alignItems:'center', overflow:'hidden', position:'relative'}}>` — alpha 0x35=21%. **§8 deviation (radial→linear)** |
| ServingTempPill abs wrapper | `position absolute; right 12; bottom 12` | `<View style={{position:'absolute', right:12, bottom:12, zIndex:5}}>` |
| ServingTempPill inner | `display inline-flex; alignItems center; gap 4; padding 4 10; borderRadius 999; background rgba(201,168,76,0.12); border 1px gold; color gold; Inter 11 500; lh 1.2; whiteSpace nowrap` | `<View className="flex-row items-center rounded-full" style={{gap:4, paddingHorizontal:10, paddingVertical:4, backgroundColor:withAlpha(brand.gold, 0.12), borderWidth:1, borderColor:brand.gold}}>` + `<Thermometer size={12} strokeWidth={1.75} color={brand.gold}/>` + `<Text className="font-inter-medium text-[11px]" style={{color:brand.gold, lineHeight:13.2}}>{t('wineDetail.servingTemp.label', {min, max})}</Text>` |
| GlossaryTooltip ('serving-temperature') | popover on hover/click | **v0.1.0 deferred** — 인라인 텍스트만. §9 |
| WMBottle | width 88 height 290 viewBox 48×160 (라벨+vintage 텍스트 inline SVG) | `<WMBottle width={88} height={290} bottleColor={bottleColor} producer={producer.split(' ')[0]} label={display_name.split(' ')[0]} vintage={vintage}/>` — 현재 RN WMBottle은 단순화됨 (label 텍스트 미렌더), keyscreen verbatim 위해 **포팅 확장 §9 P0 요청** |
| 텍스트 메타 outer | `marginTop 16` | `<View className="mt-4">` |
| Type dot row | `display flex; alignItems center; gap 6; marginBottom 6` | `<View className="flex-row items-center mb-1.5" style={{gap:6}}>` |
| dot span | `width 8 height 8; borderRadius 999; background ${dotColor}; display inline-block` | `<View style={{width:8, height:8, borderRadius:9999, backgroundColor:WINE_TYPE_DOT[type]}}/>` |
| type text | `Inter 11; color text-secondary; textTransform capitalize` | `<Text className="font-inter text-[11px] text-text-secondary dark:text-text-secondary capitalize">{type}</Text>` |
| h1 wine name | `Playfair 24 400 cream; ls -0.01em; lh 1.2; margin 0` | `<WineNameDisplay lwin={lwin} name_ko={name_ko} display_name={display_name} size="title"/>` (기존 컴포넌트 그대로 — 내부에서 Playfair 24 토큰 적용) |
| producer | `Inter 13 text-secondary; margin 4 0 0` | `<Text className="font-inter text-[13px] text-text-secondary dark:text-text-secondary mt-1" numberOfLines={1}>{producer_name}</Text>` |
| region·country·vintage·grapes | `Inter 11 text-muted; lh 1.5; margin 6 0 0` 줄바꿈 포함 | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted mt-1.5" style={{lineHeight:16.5}}>{region} · {country}{'\n'}{vintage} · {grapes.join(', ')}</Text>` (grapes는 wines_localized에 array 컬럼 없으면 null skip — §9 데이터 의존) |

WINE_TYPE_DOT 토큰 (keyscreen `wine-header.tsx` line 12-19 verbatim):

```ts
const WINE_TYPE_DOT: Record<TypeCanonical, string> = {
  red: brand.wineRed,          // '#8B1A2A'
  white: '#d6c46b',
  sparkling: '#e8d690',
  rose: '#e89b9b',
  fortified: '#5a2218',
  dessert: '#a07030',
};
```

> 위 4종 hex (`#d6c46b`, `#e8d690`, `#e89b9b`, `#5a2218`, `#a07030`)는 design-tokens.ts `bottleColorDefault`와 유사하지만 약간 다름 (dot은 더 채도 높음). **§9 토큰 확장 — `wineTypeDot.{type}` 그룹 추가 요청**.

### 3-4. MyTastingNoteCard

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| Outer | `margin 0 16 16; padding 16; bg surface; border 1px gold; radius 16; boxShadow 0 0 24 rgba(201,168,76,0.10); display flex flex-direction column; gap 12; cursor pointer` | `<Pressable className="rounded-2xl bg-surface dark:bg-surface mx-4 mb-4" style={{borderWidth:1, borderColor:brand.gold, padding:16, gap:12, ...shadows.goldGlow}} onPress={()=>router.push(`/notes/${noteId}`)} accessibilityRole="link">` |
| Header flex | `flex; alignItems center; justifyContent space-between` | `<View className="flex-row items-center justify-between">` |
| Label chip wrap | `inline-flex items-center gap 8` | `<View className="flex-row items-center" style={{gap:8}}>` |
| BookOpen 16 gold | `<BookOpen size={16} color="var(--color-gold)"/>` | `<BookOpen size={16} color={brand.gold}/>` |
| Label text "내 노트" | `Inter 12 600 gold UPPER ls 0.06em` | `<Text className="font-inter-semibold text-[12px] uppercase" style={{color:brand.gold, letterSpacing:0.72}}>{t('wineDetail.myNote.label')}</Text>` |
| Edit button | `all unset; inline-flex items-center gap 4; color text-secondary; Inter 11 600` | `<Pressable onPress={(e)=>{e.stopPropagation(); router.push(`/notes/new/write?wine_lwin=${lwin}&edit=1`)}} className="flex-row items-center" style={{gap:4}} accessibilityRole="button" accessibilityLabel={t('wineDetail.myNote.edit')}>` + `<Pencil size={11} color={tokens.text.secondary}/>` + `<Text className="font-inter-semibold text-[11px] text-text-secondary dark:text-text-secondary">{t('wineDetail.myNote.edit')}</Text>` |
| Meta row | `flex items-center gap 14 flex-wrap` | `<View className="flex-row items-center flex-wrap" style={{gap:14}}>` |
| date pill | `Calendar 11 stroke 1.75 + Inter 12 text-muted` | `<View className="flex-row items-center" style={{gap:4}}><Calendar size={11} strokeWidth={1.75} color={tokens.text.muted}/><Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">{tastedAt}</Text></View>` |
| rating pill | `Star 11 fill gold + Inter 12 600 gold` | `<View className="flex-row items-center" style={{gap:4}}><Star size={11} fill={brand.gold} strokeWidth={0}/><Text className="font-inter-semibold text-[12px]" style={{color:brand.gold}}>{ratingDisplay}</Text></View>` |
| mode badge | `padding 2 8; radius 8; ls 0.04em UPPER; Inter 10 700; expert bg=wineRed color=cream; beginner bg=rgba(201,168,76,0.18) color=gold` | `<View style={{paddingHorizontal:8, paddingVertical:2, borderRadius:8, backgroundColor:mode==='expert'?brand.wineRed:withAlpha(brand.gold,0.18)}}><Text className="text-[10px] uppercase" style={{fontWeight:'700', color:mode==='expert'?brand.cream:brand.gold, letterSpacing:0.4}}>{t(`wineDetail.myNote.mode.${mode}`)}</Text></View>` |
| WSET 4-grid (expert) | `display grid; gridTemplateColumns repeat(4,1fr); gap 6; padding 10; bg rgba(15,7,24,0.6); radius 10` | `<View className="flex-row" style={{gap:6, padding:10, backgroundColor:'rgba(15,7,24,0.6)', borderRadius:10}}>` 4 cards `flex-1` |
| MiniDim label | `Inter 9 text-muted UPPER ls 0.04em mb=2 center` | `<Text className="text-[9px] uppercase text-text-muted dark:text-text-muted text-center mb-0.5" style={{letterSpacing:0.36}}>{label}</Text>` |
| MiniDim value | `Playfair 13 cream lh 1.1 center` | `<Text className="font-playfair text-[13px] text-text-primary dark:text-text-primary text-center" style={{lineHeight:14.3}}>{value}</Text>` |
| Community compare outer | `padding 12; bg rgba(139,26,42,0.12); border 1px wine-red; radius 10; flex col gap 6` | `<View style={{padding:12, backgroundColor:withAlpha(brand.wineRed,0.12), borderWidth:1, borderColor:brand.wineRed, borderRadius:10, gap:6}}>` |
| compare eyebrow | `Inter 11 600 wine-red-hover UPPER ls 0.06em` | `<Text className="font-inter-semibold text-[11px] uppercase" style={{color:brand.wineRedHover, letterSpacing:0.66}}>{t('wineDetail.myNote.community.label')}</Text>` |
| compare stat row | `flex items-baseline gap 10; Inter 13 cream` | `<View className="flex-row items-baseline" style={{gap:10}}>` + 각 `<Text>` |
| compare strong (16) | `<strong style={{fontFamily:Playfair, fontSize:16}}>` | `<Text className="font-playfair text-[16px] text-text-primary dark:text-text-primary">{value}</Text>` |
| compare diff | `color +>success / -<error / 0=text-muted; fontWeight 700` | `<Text style={{color: diff>0?status.success:diff<0?status.errorDark:tokens.text.muted, fontWeight:'700'}}>{diff>0?'+'+diff:diff}</Text>` |
| compare basis | `Inter 11 text-muted` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{t('wineDetail.myNote.community.basis', {count})}</Text>` |

### 3-5. WriteNoteCta

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer section | `margin 0 16; padding 16; radius 16; bg surface; border 1px border-default; flex; alignItems center; gap 14` | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default flex-row items-center" style={{padding:16, gap:14}}>` |
| icon circle | `width 40 height 40; radius 999; bg rgba(139,26,42,0.15); border 1px rgba(139,26,42,0.3); flex center; flex-shrink 0` | `<View className="w-10 h-10 rounded-full items-center justify-center" style={{backgroundColor:withAlpha(brand.wineRed,0.15), borderWidth:1, borderColor:withAlpha(brand.wineRed,0.3), flexShrink:0}}>` |
| glass SVG inline | `<svg width 20 height 20 viewBox 0 0 24 24 stroke wine-red strokeWidth 1.6>` 2 path | react-native-svg `<Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M8 3h8s0 6-4 8c-4-2-4-8-4-8z" stroke={brand.wineRed} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"/><Path d="M12 11v9M9 20h6" stroke={brand.wineRed} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/></Svg>` |
| text col | `flex 1; minWidth 0` | `<View className="flex-1" style={{minWidth:0}}>` |
| title | `Inter 13 600 cream mb=2` | `<Text className="font-inter-semibold text-[13px] text-text-primary dark:text-text-primary mb-0.5">{t('wineDetail.writeNote.title')}</Text>` |
| sub | `Inter 11 text-muted lh 1.4` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted" style={{lineHeight:15.4}}>{t('wineDetail.writeNote.sub')}</Text>` |
| CTA pill | `padding 8 14; radius 999; bg wine-red; border 1px rgba(201,168,76,0.4); color cream; Inter 12 600; whiteSpace nowrap; flex-shrink 0; boxShadow 0 4 12 rgba(139,26,42,0.35)` | `<Pressable className="rounded-full bg-wine-red" style={{paddingHorizontal:14, paddingVertical:8, borderWidth:1, borderColor:withAlpha(brand.gold,0.4), flexShrink:0, ...wineRedShadow}} onPress={()=>router.push(`/notes/new/write?wine_lwin=${lwin}`)} accessibilityRole="button" accessibilityLabel={t('wineDetail.writeNote.cta')}>` + `<Text className="font-inter-semibold text-[12px]" style={{color:brand.cream}} numberOfLines={1}>{t('wineDetail.writeNote.cta')}</Text>` |

> `wineRedShadow = { shadowColor: brand.wineRed, shadowOpacity: 0.35, shadowOffset: {width:0, height:4}, shadowRadius:12, elevation:4 }` — **§9 신규 shadow 토큰 요청 `wineRedCardSm`**.

### 3-6. ExternalRatingsCard

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer section | `margin 0 16; padding 16; bg surface; border 1px border-default; radius 16` | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4">` |
| empty branch | centered text Inter 13 text-muted | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4 items-center"><Text className="font-inter text-[13px] text-text-muted dark:text-text-muted">{t('wineDetail.externalRatings.empty')}</Text></View>` |
| header row | `flex items-center justify-between mb=12` | `<View className="flex-row items-center justify-between mb-3">` |
| h2 | `Inter 14 600 cream` | `<Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary">{t('wineDetail.externalRatings.title')}</Text>` |
| global avg col | `text-right` | `<View className="items-end">` |
| label | `Inter 10 text-muted` | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted">{t('wineDetail.externalRatings.globalAvg')}</Text>` |
| price | `Playfair 18 600 gold` | `<Text className="font-playfair text-[18px]" style={{fontWeight:'600', color:brand.gold}}>${rating.globalAvgPriceUsd.toLocaleString()}</Text>` |
| 3-col grid | `display grid; gridTemplateColumns repeat(3,1fr); gap 8` | `<View className="flex-row" style={{gap:8}}>` 각 `flex-1` |
| RatingPill outer | `padding 10 8; bg bg-map; radius 10; border 1px border-default; minHeight 70; flex col gap 2` | `<View className="flex-1 bg-bg-map dark:bg-bg-map rounded-lg border border-border-default" style={{paddingHorizontal:8, paddingVertical:10, minHeight:70, gap:2}}>` |
| source label | `Inter 10 text-muted UPPER ls 0.05em` | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted uppercase" style={{letterSpacing:0.5}}>{source}</Text>` |
| score Playfair | `Playfair 18 700 cream lh 1.1` | `<Text className="font-playfair text-[18px] text-text-primary dark:text-text-primary" style={{fontWeight:'700', lineHeight:19.8}}>` + children |
| Vivino inline score | `inline-flex items-center gap 2 color gold + Star 14 fill gold + score.toFixed(1)` | `<View className="flex-row items-center" style={{gap:2}}><Star size={14} fill={brand.gold} strokeWidth={0}/><Text style={{color:brand.gold}}>{rating.vivino.score.toFixed(1)}</Text></View>` (wrapper Text 내부 nest) |
| WS/CT score | `{score}<span 11 text-muted>/100</span>` | `<Text>{rating.cellarTracker.score}<Text className="text-[11px] text-text-muted dark:text-text-muted">/100</Text></Text>` |
| dash | `<span color text-muted>—</span>` | `<Text style={{color:tokens.text.muted}}>—</Text>` |
| sub | `Inter 10 text-muted` | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted">{reviewCount.toLocaleString()} reviews</Text>` |
| footer row | `mt 12 flex items-center justify-between Inter 10 text-muted` | `<View className="flex-row items-center justify-between mt-3">` + 2 `<Text>` |
| info button | `bg transparent; border none; color gold; padding 2` | `<Pressable hitSlop={8} onPress={()=>showToast(t('wineDetail.externalRatings.mockNotice'))} accessibilityRole="button" accessibilityLabel={t('wineDetail.externalRatings.mockNotice')}>` + `<Info size={12} strokeWidth={1.75} color={brand.gold}/>` |

### 3-7. AveragePricePill

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `margin 0 16; padding 14; bg surface; border 1px border-default; radius 12; flex items-center justify-between` | `<View className="mx-4 rounded-xl bg-surface dark:bg-surface border border-border-default flex-row items-center justify-between" style={{padding:14}}>` |
| left col | (no class) | `<View>` |
| label | `Inter 12 text-muted` | `<Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">{t('wineDetail.avgPrice.label')}</Text>` |
| count | `Inter 11 text-muted mt=4` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted mt-1">{t('wineDetail.avgPrice.count', {count})}</Text>` |
| right col | `text-right` | `<View className="items-end">` |
| KRW | `Playfair 20 700 cream lh 1.1` | `<Text className="font-playfair text-[20px] text-text-primary dark:text-text-primary" style={{fontWeight:'700', lineHeight:22}}>₩{avgKrw.toLocaleString()}</Text>` |
| USD approx | `Inter 11 text-muted` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">≈ ${approxUsd.toLocaleString()}</Text>` |

### 3-8. PriceChart (compact)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `margin 0 16; padding 16; bg surface; border 1px border-default; radius 16` | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4">` |
| header row | `flex items-center justify-between mb=12` | `<View className="flex-row items-center justify-between mb-3">` |
| h2 | `Inter 14 600 cream` | `<Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary">{t('wineDetail.priceChart.title')}</Text>` |
| range toggle | `flex gap 4` | `<View className="flex-row" style={{gap:4}}>` |
| range btn active | `padding 4 8; bg wine-red; color cream; border 1px border-default; radius 8; Inter 11 600` | `<Pressable className="rounded-lg border border-border-default bg-wine-red" style={{paddingHorizontal:8, paddingVertical:4}} accessibilityRole="button" accessibilityState={{selected:true}}><Text className="font-inter-semibold text-[11px]" style={{color:brand.cream}}>{r}</Text></Pressable>` |
| range btn idle | `bg bg-map; color text-muted` | `<Pressable className="rounded-lg border border-border-default bg-bg-map dark:bg-bg-map" ...><Text style={{color:tokens.text.muted}}>{r}</Text></Pressable>` |
| chart empty | `height 200; flex center; Inter 12 text-muted` | `<View className="items-center justify-center" style={{height:200}}><Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">{t('wineDetail.priceChart.empty')}</Text></View>` |
| Recharts LineChart | (web only) | **§8 deviation**: victory-native v40 `<CartesianChart><Line/></CartesianChart>` 또는 react-native-svg `<Polyline/>` + 축 직접 그리기. v0.1.0은 deferred 권장 → **§9** |
| details link | `mt 8 text-right padding 6 10 color gold Inter 12 600` | `<Pressable className="self-end" style={{paddingHorizontal:10, paddingVertical:6}} onPress={()=>router.push(`/wine/${lwin}/prices`)} accessibilityRole="link">` + `<View className="flex-row items-center" style={{gap:4}}><Text className="font-inter-semibold text-[12px]" style={{color:brand.gold}}>{t('wineDetail.priceChart.details')}</Text><ArrowRight size={14} strokeWidth={2} color={brand.gold}/></View>` |

### 3-9. CommunityDrinkWindowCard

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `margin 0 16; padding 16; bg surface; border 1px border-default; radius 16` | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4">` |
| header | `flex items-center gap 6 mb=6 + Users 16 stroke 1.75 gold + h2 Inter 14 600 cream` | `<View className="flex-row items-center mb-1.5" style={{gap:6}}><Users size={16} strokeWidth={1.75} color={brand.gold}/><Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary">{t('wineDetail.communityPeak.title')}</Text></View>` |
| sub | `Inter 12 text-muted mb=12` | `<Text className="font-inter text-[12px] text-text-muted dark:text-text-muted mb-3">{t('wineDetail.communityPeak.sub', {count})}</Text>` |
| empty | `padding 32 16; text-center; Inter 13 text-muted` | `<View className="items-center" style={{paddingVertical:32, paddingHorizontal:16}}><Text className="font-inter text-[13px] text-text-muted dark:text-text-muted text-center">{t('wineDetail.communityPeak.empty')}</Text></View>` |
| big stat | `Playfair 20 700 cream mb=8` | `<Text className="font-playfair text-[20px] text-text-primary dark:text-text-primary mb-2" style={{fontWeight:'700'}}>{t('wineDetail.communityPeak.stat', {mean, median})}</Text>` |
| BarChart histogram | (web only) | **§8 deviation**: victory-native `<BarChart/>` 또는 react-native-svg `<Rect/>` 직접. v0.1.0 deferred → §9 |
| dist copy | `Inter 12 text-secondary mt=10` | `<Text className="font-inter text-[12px] text-text-secondary dark:text-text-secondary mt-2.5">{t('wineDetail.communityPeak.distCopy', {count, pct, min, max})}</Text>` |
| details link | (위와 동일 패턴) | (위와 동일) → `/wine/${lwin}/community-peak` |

### 3-10. WineStoryCard

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer | `position relative; margin 0 16; padding 16; minHeight 220; bg surface; border 1px border-default; radius 16; flex col` | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4" style={{minHeight:220, position:'relative'}}>` |
| empty | centered Inter 13 text-muted | `<Text className="font-inter text-[13px] text-text-muted dark:text-text-muted text-center">{t('wineDetail.story.empty')}</Text>` |
| header row | `flex items-center justify-between` | `<View className="flex-row items-center justify-between">` |
| label | `Inter 12 500 gold ls 0.04em` | `<Text className="font-inter-medium text-[12px]" style={{color:brand.gold, letterSpacing:0.48}}>{t('wineDetail.story.label')}</Text>` |
| funFact button | `inline-flex items-center gap 4; padding 4; bg transparent; border 1px gold; radius 999; color gold` | `<Pressable className="rounded-full" style={{padding:4, borderWidth:1, borderColor:brand.gold}} onPress={()=>setShow(p=>!p)} accessibilityRole="button" accessibilityLabel={t('wineDetail.story.funFact')}><Lightbulb size={14} strokeWidth={1.75} color={brand.gold}/></Pressable>` |
| popover | `position absolute; top 48; right 12; maxWidth 260; padding 12; bg bg-map; border 1px gold; radius 12; color cream; Inter 12; lh 1.5; zIndex 20; boxShadow 0 8 22 rgba(0,0,0,0.5)` | `<View style={{position:'absolute', top:48, right:12, maxWidth:260, padding:12, backgroundColor:tokens.bg.map, borderWidth:1, borderColor:brand.gold, borderRadius:12, zIndex:20, ...shadows.md}}>` + 헤더 + body |
| popover header | `Inter 11 600 gold mb=4` | `<Text className="font-inter-semibold text-[11px] mb-1" style={{color:brand.gold}}>{t('wineDetail.story.funFact')}</Text>` |
| popover body | LocaleText story.funFact | `<Text className="font-inter text-[12px] text-text-primary dark:text-text-primary" style={{lineHeight:18}}>{story.funFact[locale]}</Text>` |
| h2 | `Playfair 22 700 cream lh 1.2 m=12 0 4` | `<Text className="font-playfair text-[22px] text-text-primary dark:text-text-primary" style={{fontWeight:'700', lineHeight:26.4, marginTop:12, marginBottom:4}}>{story.wineryName[locale]} · {story.foundedYear}</Text>` |
| location | `.wm-story-loc` (no exact spec — Inter 12 text-muted 가정) | `<Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">{story.location[locale]}</Text>` |
| excerpt | `Inter 13 text-secondary lh 1.55 m=12 0 0 flex 1` | `<Text className="font-inter text-[13px] text-text-secondary dark:text-text-secondary mt-3 flex-1" style={{lineHeight:20.15}}>{excerpt(story.history[locale])}</Text>` |
| more link | (위 패턴) | (위) → `/wine/${lwin}/story` |

### 3-11. ReviewList + ReviewCard

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| outer section | `margin 0 16` | `<View className="mx-4">` |
| header | `flex items-center justify-between mb=12` | `<View className="flex-row items-center justify-between mb-3">` |
| h2 | `Inter 14 600 cream` + count span (400 text-muted ml=6) | `<Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary">{t('wineDetail.reviews.title')} <Text className="font-inter text-text-muted dark:text-text-muted">{reviews.length}</Text></Text>` |
| sort btns | `flex gap 4` | `<View className="flex-row" style={{gap:4}}>` |
| sortBtn active | `padding 4 10; bg wine-red; color cream; border 1px border-default; radius 8; Inter 11 600` | (PriceChart range 패턴과 동일) |
| empty | `padding 24; text-center; Inter 13 text-muted` | `<View className="items-center" style={{padding:24}}><Text>{t('wineDetail.reviews.empty')}</Text></View>` |
| ul | `flex col gap 10` | `<View style={{gap:10}}>` (FlatList 불필요 — slice(0,5) 최대 5) |
| ReviewCard outer | `display block; padding 14; bg surface; border 1px border-default; radius 12; text-decoration none` | `<Pressable className="rounded-xl bg-surface dark:bg-surface border border-border-default" style={{padding:14}} onPress={()=>router.push(`/profile/${userId}`)} accessibilityRole="link" accessibilityLabel={`${authorName} ${ratingDisplay}`}>` |
| top row | `flex items-center gap 6 flex-wrap` | `<View className="flex-row items-center flex-wrap" style={{gap:6}}>` |
| author | `Inter 14 600 cream` | `<Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary">{authorName}</Text>` |
| LevelPill | 별도 컴포넌트 — 기존 `src/components/shared/level-pill.tsx` 사용 | `<LevelPill level={levelId} label={level.name.en}/>` |
| ReviewBadge | 별도 컴포넌트 (포팅 필요 §9) | `<ReviewBadge badgeId={bid} tier={tier}/>` |
| body | `.wm-review-body` (Inter 13 text-secondary lh 1.5 가정) | `<Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-2" style={{lineHeight:19.5}}>{review.body[locale]}</Text>` |
| bottom | `mt=10 flex items-center justify-between Inter 11 text-muted` | `<View className="flex-row items-center justify-between mt-2.5">` |
| createdAt | `color text-muted` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{review.createdAt}</Text>` |
| rating expert | `strong color gold size 13 "{rating}/100"` | `<Text className="font-inter text-[13px]" style={{fontWeight:'700', color:brand.gold}}>{review.rating}/100</Text>` |
| rating beginner | `Star 12 fill gold + strong cream 13 "{rating}/5"` | `<View className="flex-row items-center" style={{gap:4}}><Star size={12} fill={brand.gold} strokeWidth={0}/><Text className="font-inter text-[13px] text-text-primary dark:text-text-primary" style={{fontWeight:'700'}}>{review.rating}/5</Text></View>` |

### 3-12. AddToCellarCta (inline)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| wrap | (page에서) `padding 8 16 0` | `<View className="px-4 pt-2">` |
| Link button | `inline-flex items-center justify-center gap 8; width 100%; height 52; padding 0 20; radius 14; bg wine-red; color cream; Inter 15 600; boxShadow 0 6 18 rgba(139,26,42,0.45)` | `<Pressable className="rounded-[14px] bg-wine-red flex-row items-center justify-center" style={{height:52, paddingHorizontal:20, gap:8, ...wineRedShadowLg}} onPress={()=>setShowCellarSheet(true)} accessibilityRole="button" accessibilityLabel={t('wineDetail.actions.addToCellar')}>` + `<Plus size={18} strokeWidth={2} color={brand.cream}/>` + `<Text className="font-inter-semibold text-[15px]" style={{color:brand.cream}}>{t('wineDetail.actions.addToCellar')}</Text>` |

> `wineRedShadowLg = {shadowColor:brand.wineRed, shadowOpacity:0.45, shadowOffset:{width:0, height:6}, shadowRadius:18, elevation:6}` — **§9 신규 shadow 토큰 `wineRedCardLg`**.

> **keyscreen**은 `Link href="/capture"` (셀러 추가를 캡처 흐름으로 위임 — mock 정책). 우리는 이미 AddToCellarSheet가 존재하므로 sheet open이 더 자연스러움 — **§8 deviation**.

---

## 4. 상태 Variants

### default (dark + ko)

- BackHeader: title=wine name (한글 우선) + FavoriteToggle idle
- WineHeader: 와인 hero (bottle gradient + WMBottle 88×290 + ServingTempPill abs)
- 노트 분기:
  - 내 노트 있음 → MyTastingNoteCard (rating, mode, WSET grid expert만, community compare ≥10 expert만)
  - 없음 → WriteNoteCta
- ExternalRatingsCard: 3 RatingPill (Vivino fill / WS fill / CT fill) + footer Info
- AveragePricePill: KRW + USD approx
- PriceChart compact: 1Y default range + LineChart + Avg line
- CommunityDrinkWindowCard: stat + BarChart + dist copy
- WineStoryCard: title + location + excerpt + Lightbulb funFact
- ReviewList: 최대 5개 ReviewCard, 정렬 default `recent`
- AddToCellarCta: inline button bottom

### default (light + en)

- 위와 동일 구조 — 색 토큰만 light로 분기 (모든 className `dark:` 분기 자동)
- bottleColor 35% 알파 위 light bg-deep (#F2EAD9) — 단순 fade
- ServingTempPill gold border는 light에서도 gold (brand 고정)
- ReviewBadge 색 (bronze/silver/gold/platinum)도 양 모드 고정

### loading

- BackHeader: title 빈 문자열, FavoriteToggle (즐겨찾기 상태 로딩 중 idle)
- ScrollView 자리에 ActivityIndicator (color=gold) center — 기존 RN 패턴 line 28-37 그대로
- **권장 강화**: 카드 placeholder skeleton (mt 16 gap 16 mx 4)
  - WineHero skeleton: SkeletonBlock radius 18, height 320, mx 4
  - 카드 skeleton × 5 (height 120, radius 16, mx 4)
  - AddToCellarCta skeleton: height 52, radius 14
- 풀-투-리프레시 동작: RefreshControl tintColor gold

### empty — 와인 자체는 존재하지만 메타 부족

- producer_name/region/country null인 경우 → 텍스트는 `t('wineDetail.meta.unknown')` 표시 (현재 RN line 39-62 fallback 패턴 유지)
- bottleColor null → `getDefaultBottleColor(type)` (이미 구현)
- grapes 미존재 → grapes line 미렌더 (현재 wines_localized에 grapes array 컬럼 없음 — §9 데이터 의존)

### empty — 외부 평점 / 커뮤니티 / 스토리 / 리뷰 부재

- ExternalRatingsCard rating null → centered "외부 평점 없음" / "No external ratings"
- AveragePricePill: count 0 시 fallbackKrw 사용 (wines.averagePriceKrw가 없으면 KRW=0, "0건 등록" 표기) — count 0이면 카드 자체를 hide 권장 (§9 결정)
- PriceChart purchases.length==0 → "아직 등록된 가격이 없어요"
- CommunityDrinkWindowCard count 0 → "아직 추정 데이터가 부족해요..."
- WineStoryCard story null → "이 와인의 스토리는 준비 중"
- ReviewList reviews.length==0 → "아직 리뷰가 없어요"

### error — 데이터 fetch 실패

- supabase wines_localized 호출 실패 시: Toast `t('errors.generic')` + WineHero skeleton 유지 + 재시도 버튼 (현재 RN 미구현 — §9 권장)
- 네트워크 끊김: `t('errors.network')` Toast
- 즐겨찾기 토글 실패: rollback 후 `t('errors.generic')` Toast

### LWIN 미존재 (notFound)

- 현재 RN 처리 (line 39-62 동일 verbatim 유지):
  - BackHeader title=""
  - center AlertCircle 48 stroke 1.5 gold
  - EmptyState title=`wineDetail.notFound.title` description=`wineDetail.notFound.description` action=PrimaryButton variant=secondary label=`wineDetail.notFound.back` → router.back()
- keyscreen은 `notFound()` Next.js 호출 — RN에는 등가물 없어 inline empty state로 처리. **§8 deviation 명시**.

### 비공개 / RLS 제외 wine

- wines_localized VIEW의 `security_invoker=true`로 인해 RLS 통과 못한 wine은 자동 `null` 반환 → notFound 분기 그대로 사용
- 명시 UI 분기 없음 — keyscreen verbatim (Phase 2도 비공개 wine 개념 X)

### dark mode (theme=dark)

- bg-deepest: `#251837`
- surface: `#3D2A4A`
- bg-map: `#3A2440`
- text-primary: `#F8F4ED` / text-secondary: `#EBE0CB` / text-muted: `#CABDA8`
- border-default: `#5A3D6A`
- gold/wineRed/cream 양 모드 동일
- WineHero radial bg-deep: `#2E1F3F`
- WSET grid bg: `rgba(15, 7, 24, 0.6)` (다크 의도 — light에서 부조화 — §9 검토 요청)

### light mode (theme=light)

- bg-deepest: `#FAF5EC`, bg-deep: `#F2EAD9`, bg-map: `#EDE2CC`
- surface: `#FFFFFF`
- text-primary: `#2A1A14` / text-secondary: `#5A463C` / text-muted: `#8B7766`
- border-default: `#E0D2BC`
- WineHero gradient end는 bg-deep (`#F2EAD9`)로 자연 분기
- ReviewBadge 색은 양 모드 고정 (bronze/silver/gold/platinum)
- WSET grid bg `rgba(15, 7, 24, 0.6)`는 light에서 너무 어두움 — **§9 alt 권장 `withAlpha(textInk, 0.06)`**

### ko / en

- 모든 텍스트는 `wineDetail.*` i18n key (§7 매핑)
- ServingTempPill: ko `{min}-{max}°C 권장` / en `{min}-{max}°C recommended`
- "외부 평점" / "External ratings" 등 페이지 내 모든 LocaleText 키화
- WS priceRank는 `LocalizedString` 인라인 — i18n 변환 시 동적 데이터 (RatingPill subLocalized) → 그대로 RN `<Text>` rendering
- 한글 word-break 미적용 RN 제약 — minor 가독성 차이 (§8)
- `ko`에서 `letter-spacing` 0.02em 초과는 금지 (typography.md §6) — ServingTempPill ls 0.04em UPPER는 영문 한정. ko 모드에서는 letterSpacing 0 강제. **§9 헬퍼 함수 요청** (home 사양과 동일)

---

## 5. 인터랙션

| 위치 | 트리거 | 결과 |
|---|---|---|
| BackHeader BackButton | onPress | `Haptics.selectionAsync()` → `router.back()` (canGoBack false면 `router.replace('/(tabs)')`) |
| FavoriteToggle | onPress | optimistic toggle → Supabase `wine_favorites` upsert/delete → Toast (success: 추가/제거 메시지). 실패 시 rollback. **테이블 신규 §9** |
| WineHeader bottle area | (no press) | — (keyscreen 정적) |
| ServingTempPill | (keyscreen has GlossaryTooltip — v0.1.0 deferred §9) | v0.1.0 onPress=no-op 또는 BottomSheet open `'serving-temperature'` glossary |
| MyTastingNoteCard outer | onPress | `Haptics.selectionAsync()` → `router.push(`/notes/${noteId}`)` |
| MyTastingNoteCard Edit btn | onPress (stopPropagation) | `Haptics.selectionAsync()` → `router.push(`/notes/new/write?wine_lwin=${lwin}&edit=1&noteId=${noteId}`)` |
| WriteNoteCta CTA pill | onPress | `Haptics.selectionAsync()` → `router.push(`/notes/new/write?wine_lwin=${lwin}`)` (현재 RN line 109와 동일 패턴 — query param 표준 `wine_lwin` 유지) |
| ExternalRatingsCard Info button | onPress | Toast `t('wineDetail.externalRatings.mockNotice')` 2.5s |
| PriceChart range button | onPress | `setRange(r)` (즉시 차트 재계산) — Haptics.selectionAsync |
| PriceChart Details link | onPress | `router.push(`/wine/${lwin}/prices`)` — v0.1.0 해당 화면 없음, **404 → Toast deferred 안내 또는 disabled** (§9) |
| CommunityDrinkWindowCard Details | onPress | `router.push(`/wine/${lwin}/community-peak`)` — v0.2.0 deferred |
| WineStoryCard funFact button | onPress | `setShowFunFact(p => !p)` — 토글 popover. press 외부 dismiss (`onPress` outside) |
| WineStoryCard More link | onPress | `router.push(`/wine/${lwin}/story`)` — v0.2.0 deferred |
| ReviewList SortBtn × 2 | onPress | `setSort(...)` (즉시 재정렬) |
| ReviewCard outer | onPress | `router.push(`/profile/${userId}`)` — 프로필 화면 v0.2.0 deferred, v0.1.0은 disabled or Toast |
| AddToCellarCta inline | onPress | `Haptics.selectionAsync()` → `setShowCellarSheet(true)` (AddToCellarSheet modal open) **keyscreen은 /capture로 redirect — RN sheet이 더 자연스러움, §8 deviation 명시** |
| ScrollView | pull-to-refresh | `RefreshControl` → wine refetch (useWine refresh()) |
| Pressable press feedback | 모든 Pressable | `{({pressed})=>({opacity:pressed?0.85:1})}` (scale 효과는 detail 화면에서는 과함, opacity만) |

### Haptics 정책

- selectionAsync: nav 액션 (BackHeader, Card press, CTA, range/sort toggle)
- impactAsync(Light): FavoriteToggle (+ 별 채우기 시각 변화 동반)
- notificationAsync(Success): 셀러 추가 성공 toast
- notificationAsync(Error): 실패 toast

---

## 6. 접근성

| 요소 | 속성 |
|---|---|
| ScrollView | `accessibilityLabel={t('wineDetail.a11y.scroll')}` (선택), RefreshControl `accessibilityLabel={t('common.refresh')}` |
| BackHeader BackButton | `accessibilityRole="button"`, `accessibilityLabel={t('common.back')}` |
| BackHeader title | `<Text accessibilityRole="header">{wineName}</Text>` (numberOfLines=1) |
| FavoriteToggle | `accessibilityRole="button"`, `accessibilityState={{selected:active}}`, `accessibilityLabel={active?t('wineDetail.fav.remove'):t('wineDetail.fav.add')}` |
| WineHeader bottle | non-interactive `accessibilityLabel={`${wineName} ${vintage} ${type}`}` (한 번에 읽음) |
| ServingTempPill | `accessibilityRole="text"`, `accessibilityLabel={t('wineDetail.servingTemp.a11y', {min, max})}` |
| MyTastingNoteCard | `accessibilityRole="link"`, `accessibilityLabel={`${t('wineDetail.myNote.label')} ${ratingDisplay} ${mode}`}`, `accessibilityHint={t('wineDetail.myNote.openHint')}` |
| MyTastingNoteCard Edit | `accessibilityRole="button"`, `accessibilityLabel={t('wineDetail.myNote.edit')}` |
| WriteNoteCta CTA | `accessibilityRole="button"`, `accessibilityLabel={t('wineDetail.writeNote.cta')}`, `accessibilityHint={t('wineDetail.writeNote.subA11y')}` |
| ExternalRatingsCard h2 | `accessibilityRole="header"` |
| RatingPill | `accessibilityRole="text"`, `accessibilityLabel={`${source} ${scoreStr} ${sub}`}` |
| ExternalRatingsCard Info | `accessibilityRole="button"`, `accessibilityLabel={t('wineDetail.externalRatings.mockNotice')}` |
| PriceChart range btn | `accessibilityRole="button"`, `accessibilityState={{selected:active}}`, `accessibilityLabel={r}` |
| PriceChart Details | `accessibilityRole="link"`, `accessibilityLabel={t('wineDetail.priceChart.details')}` |
| CommunityDrinkWindowCard h2 | `accessibilityRole="header"` |
| WineStoryCard h2 | `accessibilityRole="header"` |
| WineStoryCard funFact | `accessibilityRole="button"`, `accessibilityLabel={t('wineDetail.story.funFact')}`, `accessibilityState={{expanded:showFunFact}}` |
| WineStoryCard popover | `accessibilityRole="alert"` 또는 `accessibilityLiveRegion="polite"`, focusOnDisplay |
| ReviewList h2 | `accessibilityRole="header"` |
| ReviewList SortBtn | `accessibilityRole="button"`, `accessibilityState={{selected:active}}`, `accessibilityLabel={t('wineDetail.reviews.sort.recent')}` etc |
| ReviewCard | `accessibilityRole="link"`, `accessibilityLabel={`${author} ${level.name.en} ${ratingDisplay}`}`, `accessibilityHint={t('wineDetail.reviews.openProfile')}` |
| AddToCellarCta | `accessibilityRole="button"`, `accessibilityLabel={t('wineDetail.actions.addToCellar')}` |
| 텍스트 대비 (dark) | surface(#3D2A4A) 위 text-primary(#F8F4ED)=10.6:1 ✓ / text-muted(#CABDA8)=6.8:1 ✓ / gold(#C9A84C)=4.9:1 ✓ |
| 텍스트 대비 (light) | bg(#FFFFFF) 위 text-primary(#2A1A14)=15.7:1 ✓ / text-muted(#8B7766)=4.6:1 ✓ / gold(#B89438 alt)는 light에서 검토 |
| 9px / 10px micro text | RatingPill source, footer, MiniDim label — 권장 11px 미만. **§9 a11y 검토 요청 (home 사양 §6과 동일)** |
| dynamic type | `allowFontScaling={false}` 적용: WMBottle 내부 SVG 텍스트, MiniDim label/value (9px-13px). 본문(13px 이상)은 허용 |

---

## 7. i18n 키 매핑

기존 `wineDetail.*` 일부 키 (ko.json line 385~416, en.json line 466~):
- `wineDetail.notFound.{title,description,back}`
- `wineDetail.meta.{producer,region,country,vintage,classification,unknown}`
- `wineDetail.drinkWindow.{title,rangeLabel,peakLabel,empty,before,during,after}` (DrinkingWindowBar용 — keyscreen에는 없는 RN-only 컴포넌트)
- `wineDetail.community.{title,comingSoon}` (CommunityPeakPlaceholder용 RN-only)
- `wineDetail.actions.{writeNote,addToCellar}`

### 신규 i18n 키 (keyscreen LocaleText inline + 신규 섹션)

```jsonc
// src/lib/i18n/ko.json — wineDetail 네임스페이스 확장
"wineDetail": {
  // 기존 유지: notFound, meta, drinkWindow, community, actions
  "servingTemp": {
    "label": "{{min}}-{{max}}°C 권장",
    "a11y": "권장 시음 온도 {{min}}부터 {{max}}도"
  },
  "fav": {
    "add": "즐겨찾기에 추가",
    "remove": "즐겨찾기에서 제거",
    "addedToast": "즐겨찾기에 추가했어요",
    "removedToast": "즐겨찾기에서 제거했어요"
  },
  "myNote": {
    "label": "내 노트",
    "edit": "수정",
    "mode": {
      "expert": "전문가",
      "beginner": "입문"
    },
    "dim": {
      "sweetness": "당도",
      "acidity": "산도",
      "body": "바디",
      "tannin": "타닌"
    },
    "wsetShort": {
      "low": "낮음",
      "mediumMinus": "중−",
      "medium": "중",
      "mediumPlus": "중+",
      "high": "높음"
    },
    "community": {
      "label": "커뮤니티 비교",
      "you": "내 점수",
      "avg": "평균",
      "basis": "{{count}}명 기준"
    },
    "openHint": "탭하여 상세 보기"
  },
  "writeNote": {
    "title": "아직 노트가 없어요",
    "sub": "이 와인의 시음 경험을 기록해보세요",
    "subA11y": "이 와인의 시음 경험을 기록할 수 있어요",
    "cta": "노트 작성"
  },
  "externalRatings": {
    "title": "외부 평점",
    "globalAvg": "글로벌 평균가",
    "empty": "외부 평점 없음",
    "lastSynced": "마지막 동기화: {{date}}",
    "mockNotice": "시안 mock 데이터입니다. 실제 API 미연동.",
    "reviews": "{{count}}건 리뷰"
  },
  "avgPrice": {
    "label": "평균 구매가",
    "count": "{{count}}건 등록"
  },
  "priceChart": {
    "title": "가격 추이",
    "empty": "아직 등록된 가격이 없어요",
    "details": "상세보기",
    "avgLabel": "평균",
    "tooltip": {
      "store": "{{name}}",
      "storeWithBranch": "{{name}} · {{branch}}",
      "anonReviewer": "L{{level}} {{levelName}}",
      "myEntry": "내 등록"
    },
    "rangeLabel": {
      "3M": "3M",
      "1Y": "1Y",
      "ALL": "ALL"
    }
  },
  "communityPeak": {
    "title": "커뮤니티 음용 적기",
    "sub": "전문가 {{count}}명이 추정한 절정 시점",
    "empty": "아직 추정 데이터가 부족해요. 전문가 노트에서 입력해주세요",
    "stat": "평균 {{mean}} · 중앙값 {{median}}",
    "distCopy": "{{count}}명 중 {{pct}}%가 {{min}}~{{max}} 사이 추천",
    "details": "상세 보기"
  },
  "story": {
    "label": "와이너리 이야기",
    "empty": "이 와인의 스토리는 준비 중",
    "funFact": "재미있는 이야기",
    "more": "더 읽기"
  },
  "reviews": {
    "title": "리뷰",
    "empty": "아직 리뷰가 없어요",
    "sort": {
      "recent": "최근",
      "topRated": "평점 높은 순"
    },
    "openProfile": "프로필 보기",
    "anonymous": "익명 사용자"
  },
  "a11y": {
    "scroll": "와인 상세 정보 스크롤"
  }
}
```

```jsonc
// src/lib/i18n/en.json — wineDetail 네임스페이스 확장
"wineDetail": {
  "servingTemp": {
    "label": "{{min}}-{{max}}°C recommended",
    "a11y": "Recommended serving temperature {{min}} to {{max}} Celsius"
  },
  "fav": {
    "add": "Add favorite",
    "remove": "Remove favorite",
    "addedToast": "Added to favorites",
    "removedToast": "Removed from favorites"
  },
  "myNote": {
    "label": "My note",
    "edit": "Edit",
    "mode": {
      "expert": "Expert",
      "beginner": "Beginner"
    },
    "dim": {
      "sweetness": "Sweetness",
      "acidity": "Acidity",
      "body": "Body",
      "tannin": "Tannin"
    },
    "wsetShort": {
      "low": "Low",
      "mediumMinus": "M−",
      "medium": "Med",
      "mediumPlus": "M+",
      "high": "High"
    },
    "community": {
      "label": "Community compare",
      "you": "You",
      "avg": "Avg",
      "basis": "Based on {{count}} reviewers"
    },
    "openHint": "Tap to view note"
  },
  "writeNote": {
    "title": "No notes yet",
    "sub": "Record your tasting experience",
    "subA11y": "You can record your tasting experience for this wine",
    "cta": "Write Note"
  },
  "externalRatings": {
    "title": "External ratings",
    "globalAvg": "Global avg",
    "empty": "No external ratings",
    "lastSynced": "Last synced: {{date}}",
    "mockNotice": "Mock data only — actual API not connected.",
    "reviews": "{{count}} reviews"
  },
  "avgPrice": {
    "label": "Average price",
    "count_one": "{{count}} entry",
    "count_other": "{{count}} entries"
  },
  "priceChart": {
    "title": "Price history",
    "empty": "No purchases yet",
    "details": "View details",
    "avgLabel": "Avg",
    "tooltip": {
      "store": "{{name}}",
      "storeWithBranch": "{{name}} · {{branch}}",
      "anonReviewer": "L{{level}} {{levelName}}",
      "myEntry": "My entry"
    },
    "rangeLabel": {
      "3M": "3M",
      "1Y": "1Y",
      "ALL": "ALL"
    }
  },
  "communityPeak": {
    "title": "Community drinking window",
    "sub": "Estimated by {{count}} experts (L3+)",
    "empty": "Not enough data. Add an estimate in your expert note.",
    "stat": "Mean {{mean}} · Median {{median}}",
    "distCopy": "{{pct}}% of {{count}} reviewers suggest {{min}}-{{max}}",
    "details": "Details"
  },
  "story": {
    "label": "Winery story",
    "empty": "Story coming soon",
    "funFact": "Fun fact",
    "more": "Read more"
  },
  "reviews": {
    "title": "Reviews",
    "empty": "No reviews yet",
    "sort": {
      "recent": "Recent",
      "topRated": "Top rated"
    },
    "openProfile": "View profile",
    "anonymous": "Anonymous"
  },
  "a11y": {
    "scroll": "Wine detail scroll view"
  }
}
```

> **next-intl `LocaleText value={{ko, en}}` → i18next**: i18next 키화로 일괄 변환. 동적 데이터 (`store.name`, `branch`, `lastSyncedAt`, `count`)는 interpolation 사용. **EN 복수형은 `count_one`/`count_other` plural rule 활용**.
> `common.{back,close,refresh,save}` 키는 이미 존재 가정 (다른 사양에서 추가됨) — 없으면 §9 P0에 명시.

---

## 8. RN deviation 로그

| 항목 | keyscreen | RN 변경 | 사유 |
|---|---|---|---|
| Next `notFound()` | server `notFound()` → 404 | inline EmptyState 화면 (현재 RN line 39-62 그대로) | RN에 등가물 없음. UX 등가 |
| Next `Link href={...}` | declarative | `<Pressable onPress={()=>router.push(...)}>` | expo-router programmatic. 시각 동일 |
| Next `useRouter()` | client hook | expo-router `import { router } from 'expo-router'` | 동등 |
| `useTranslations('wineDetail.myNote')` | next-intl namespace | i18next `t('wineDetail.myNote.X')` flat key | i18next는 namespace prefix 불필요 |
| `LocaleText value={{ko, en}}` 인라인 | 직접 객체 | i18next 키화 (§7) | 모든 텍스트 i18n key 표준 (§4-4) |
| `radial-gradient(ellipse at center top, X 0%, Y 70%)` | CSS radial | `<LinearGradient/>` 단방향 fade (start={0.5,0} end={0.5,1} locations=[0,0.7]) **또는** react-native-svg `<RadialGradient/>` 정확 구현 | RN expo-linear-gradient는 radial 미지원. svg gradient는 가능하지만 비용/오버레이 복잡. **v0.1.0 LinearGradient fallback 권장, design-reviewer 시각 검증** |
| `boxShadow 0 0 24 rgba(201,168,76,0.10)` (MyTastingNoteCard) | CSS | RN `style={shadows.goldGlow}` (이미 design-tokens.ts 정의됨) | 매핑 |
| `boxShadow 0 4 12 rgba(139,26,42,0.35)` (WriteNoteCta CTA pill) | CSS | RN `wineRedShadowSm` — **§9 신규 토큰** | shadow scale 확장 |
| `boxShadow 0 6 18 rgba(139,26,42,0.45)` (AddToCellarCta) | CSS | RN `wineRedShadowLg` — **§9 신규 토큰** | 동일 |
| `boxShadow 0 8 22 rgba(0,0,0,0.5~0.6)` (Tooltip, ReviewCard hover) | CSS | RN `shadows.md` 또는 `lg` 매핑 | 동등 |
| Recharts LineChart (PriceChart) | web only | victory-native v40 `<CartesianChart><Line/></CartesianChart>` 또는 react-native-svg `<Polyline/>` + 축 직접 | RN Recharts 안 됨. **v0.1.0 차트 자체 deferred 권장 — placeholder "곧 만나보세요" + range toggle은 UI만 유지** (§9) |
| Recharts BarChart (PeakDistribution) | web only | victory-native BarChart 또는 svg `<Rect/>` 직접 | 동일. **v0.1.0 deferred 권장 — stat + dist copy 텍스트만 노출** |
| dynamic import `next/dynamic` (SSR skip) | Next-only | RN은 SSR 없음. import 직접 | — |
| `position sticky` (AddToCellarCta variant=fixed) | CSS | RN ScrollView에 sticky 없음. KeyboardAvoidingView + 화면 절대 위치 또는 stickyHeaderIndices | 본 화면은 `variant="inline"` 사용 — sticky 미적용. **§9** |
| `cursor pointer` | CSS | Pressable 자동 | — |
| `outline none` `all unset` (Edit button) | CSS reset | RN 기본 unstyled | — |
| `aria-pressed` | ARIA | `accessibilityState={{selected}}` | RN 등가 |
| `aria-live polite` (ExternalRatingsCard empty) | ARIA | `accessibilityLiveRegion="polite"` (Android) | iOS는 VoiceOver 자동 |
| `onMouseEnter/Leave` (WineStoryCard funFact hover) | desktop hover | RN onPress toggle (이미 keyscreen에서도 onClick toggle 패턴) | RN hover 없음 — press toggle |
| `<button onClick stopPropagation>` (MyTastingNoteCard Edit) | DOM event | RN Pressable 자체 event는 자동 bubble 되지 않음 — 부모 Pressable이 자식 Pressable 무시. **RN에서는 stopPropagation 불필요** | RN 표준 |
| `text-align center` | CSS | RN `textAlign:'center'` 또는 부모 `items-center` | — |
| `display inline-flex` | CSS | RN `flexDirection:'row'` (모든 View는 flex container) | — |
| `flex-wrap wrap` | CSS | RN `flexWrap:'wrap'` | 동등 |
| `whiteSpace nowrap` | CSS | RN `numberOfLines={1}` 또는 `flexWrap:'nowrap'` (기본) | 등가 |
| `min-width 0` (flex shrink in text) | CSS | RN `minWidth:0` 또는 부모 `style={{minWidth:0}}` — flex child shrink 보장 | 명시 필요 |
| LinearGradient 색 변환 | CSS hex | RN expo-linear-gradient `colors={['#hex1','#hex2']}` | hex 그대로, helper `withAlpha` 사용 |
| Recharts CustomTooltip (hover 시 표시) | web only | RN chart 라이브러리별 tooltip API 다름. **v0.1.0 chart 자체 deferred로 tooltip도 deferred** | — |
| keyscreen AddToCellarCta `<Link href="/capture">` | navigate to capture | RN AddToCellarSheet modal open (기존 RN line 115 동일) | RN UX 적합 — keyscreen은 mock 셀러 등록 흐름이 capture와 결합되어 있어 그렇게 작성. 우리는 separate sheet 보유 |
| `padding 8 16 0` wrapper (AddToCellarCta) | CSS box | `<View className="px-4 pt-2">` | 동등 |

---

## 9. 토큰/i18n/컴포넌트 확장 요청

### 신규 색 토큰

| 토큰 | 값 | 용도 | 추가 위치 |
|---|---|---|---|
| `wineTypeDot.red` | `#8B1A2A` (brand.wineRed 동일) | WineHeader type dot | design-tokens.ts (신규 group `wineTypeDot`) |
| `wineTypeDot.white` | `#d6c46b` | WineHeader type dot | 동일 |
| `wineTypeDot.sparkling` | `#e8d690` | 동일 | 동일 |
| `wineTypeDot.rose` | `#e89b9b` | 동일 | 동일 |
| `wineTypeDot.fortified` | `#5a2218` | 동일 | 동일 |
| `wineTypeDot.dessert` | `#a07030` | 동일 | 동일 |
| `wsetGridBg.dark` | `rgba(15,7,24,0.6)` | MyTastingNoteCard WSET 4-grid bg | design-tokens.ts |
| `wsetGridBg.light` | `withAlpha(brand.textInk, 0.06)` | 동일 라이트 모드 (대비 확보) | 동일 |
| `compareBoxBg` | `withAlpha(brand.wineRed, 0.12)` | MyTastingNoteCard community compare bg | helper 사용 — 별도 토큰 X |

### 신규 shadow 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `wineRedCardSm` | `{shadowColor: brand.wineRed, shadowOpacity: 0.35, shadowOffset: {width:0, height:4}, shadowRadius: 12, elevation: 4}` | WriteNoteCta CTA pill |
| `wineRedCardLg` | `{shadowColor: brand.wineRed, shadowOpacity: 0.45, shadowOffset: {width:0, height:6}, shadowRadius: 18, elevation: 6}` | AddToCellarCta inline button |

> **P0 토큰 확장 요청** — design-tokens.ts `shadows.{wineRedCardSm,wineRedCardLg}` 추가. 기존 `shadows.fabDark`와 구분 (FAB는 일반 wine-red+inset, card는 외곽 그림자 일반).

### 신규 radius / spacing

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius.18` | 18px | WineHeader hero outer (keyscreen line 38) |

> **P0 요청** — design-tokens.ts `radius['18']`, tailwind.config.ts `borderRadius['18']: '18px'`. 또는 인라인 `rounded-[18px]` 허용 결정.

### 신규 typography 토큰

| 항목 | 값 | 사용처 |
|---|---|---|
| `wineDetailH1` | Playfair 24 400, ls -0.24px, lh 28.8 (= 기존 `pageTitle` 동일) | WineHeader h1 wine name — 기존 `pageTitle` 재사용 |
| `cardSectionTitle` | Inter 14 600, cream | ExternalRatingsCard/PriceChart/Community/Story/Reviews h2 — 신규 토큰 또는 인라인 |
| `cardBig` | Playfair 20 700 cream lh 22 | AveragePricePill KRW, CommunityDrinkWindowCard big stat |
| `ratingPillScore` | Playfair 18 700 cream lh 19.8 | ExternalRatingsCard RatingPill score |
| `wineStoryHeadline` | Playfair 22 700 cream lh 26.4 | WineStoryCard h2 |
| `wsetMiniDim` | Playfair 13 cream lh 14.3 | MyTastingNoteCard MiniDim value |
| `microLabel` | Inter 9 text-muted UPPER ls 0.36 | MyTastingNoteCard MiniDim label, RatingPill source |

> **P0 typography 확장 요청** (home과 함께 일괄). a11y 9px 검토 동시 진행.

### 신규 컴포넌트 (포팅)

| 컴포넌트 | 원본 keyscreen | 목표 RN 위치 |
|---|---|---|
| `ServingTempPill` | `src/components/wine-detail/serving-temp-pill.tsx` | `src/components/wine/serving-temp-pill.tsx` (신규) |
| `FavoriteToggle` | `src/components/wine-detail/favorite-toggle.tsx` | `src/components/wine/favorite-toggle.tsx` (신규) — 데이터 hook 동반 (§ 데이터) |
| `MyTastingNoteCard` | `src/components/wine-detail/my-tasting-note-card.tsx` | `src/components/wine/my-tasting-note-card.tsx` (신규) |
| `WriteNoteCta` | `src/components/wine-detail/write-note-cta.tsx` | `src/components/wine/write-note-cta.tsx` (신규) |
| `ExternalRatingsCard` + `RatingPill` | `src/components/wine-detail/external-ratings-card.tsx` | `src/components/wine/external-ratings-card.tsx` (신규) — Toast hook 의존 |
| `AveragePricePill` | `src/components/wine-detail/average-price-pill.tsx` | `src/components/wine/average-price-pill.tsx` (신규) |
| `PriceChart` (compact, v0.1.0 stub) | `src/components/wine-detail/price-chart.tsx` | `src/components/wine/price-chart-stub.tsx` (신규, range toggle UI만, 차트는 placeholder) |
| `CommunityDrinkWindowCard` (v0.1.0 stub) | `src/components/community-drink-window/community-drink-window-card.tsx` | `src/components/wine/community-drink-window-card-stub.tsx` (신규, stat + dist copy 텍스트만) — 기존 `community-peak-placeholder.tsx`를 이걸로 확장 |
| `WineStoryCard` | `src/components/wine-story/wine-story-card.tsx` | `src/components/wine/wine-story-card.tsx` (신규) |
| `ReviewList` + `ReviewCard` (stub) | `src/components/wine-detail/{review-list,review-card}.tsx` | `src/components/wine/{review-list,review-card}.tsx` (신규) — v0.1.0 mock data 또는 EmptyState |
| `ReviewBadge` | `src/components/shared/review-badge.tsx` | `src/components/shared/review-badge.tsx` (신규 포팅 — bronze/silver/gold/platinum 4 tier) |
| `WMBottle` (텍스트 확장) | `src/components/shared/wm-bottle.tsx` | `src/components/shared/wm-bottle.tsx` (기존 — producer/label/vintage 텍스트 추가) — react-native-svg `<Text>` element 추가 |
| `WineHeader` | `src/components/wine-detail/wine-header.tsx` | `src/components/wine/wine-hero.tsx` 확장 (기존 단순 hero를 keyscreen verbatim으로 재작성) |
| `AddToCellarCta` | `src/components/wine-detail/add-to-cellar-cta.tsx` | `src/components/wine/add-to-cellar-cta.tsx` (신규, inline variant만; 기존 WineDetail screen에 인라인 처리된 부분 분리) |
| `GlossaryTooltip` (ServingTempPill) | `src/components/glossary/glossary-tooltip.tsx` | **v0.1.0 deferred** — 라벨 클릭 시 BottomSheet으로 glossary 표시, term lookup은 후속 |

> **포팅은 rn-screen-builder 책임**. design-spec-author는 매핑표만 제공.

### 신규 마이그레이션 / 데이터 의존

| 데이터 | 현재 상태 | 필요 작업 | v0.1.0 / v0.2.0 |
|---|---|---|---|
| `wines_localized.bottle_color`, `producer_name`, `region`, `country`, `vintage`, `classification`, `display_name`, `name_ko`, `type_canonical`, `drink_window_from_year`, `drink_window_peak_year`, `drink_window_to_year` | 이미 존재 (현재 RN 사용 중) | — | v0.1.0 ✓ |
| `wines_localized.grapes` (array localized) | **부재** | wines + wines_localized VIEW에 `grapes_ko text[]`, `grapes_en text[]` 추가 또는 별도 `wine_grapes` 테이블 join | v0.1.0 P1 (있으면 좋음) / v0.2.0 |
| `wines_localized.appellation`, `serving_temp_min`, `serving_temp_max` | **부재** | wines에 `appellation text`, `serving_temp_min int`, `serving_temp_max int` 추가 | v0.1.0 (ServingTempPill 표시 위해 필요 — 또는 기본값 fallback) |
| `wine_favorites` 테이블 | **부재** | `wine_favorites (user_id uuid, wine_lwin text, created_at timestamptz)` + RLS (user_id=auth.uid()) + unique constraint | v0.1.0 (FavoriteToggle 위해 필요) — **supabase-engineer 트리거** |
| `tasting_notes` (내 노트 조회) | 이미 존재 | useMyNoteForWine hook 신규 — `select * from tasting_notes where user_id=auth.uid() and wine_lwin=lwin limit 1` | v0.1.0 ✓ (MyTastingNoteCard 위해) |
| `external_ratings` 테이블 (Vivino/WS/CT mock) | **부재** | v0.1.0 mock data hardcode 또는 `external_ratings (wine_lwin text PK, vivino_score numeric, vivino_review_count int, ws_score int, ws_price_rank_ko text, ws_price_rank_en text, ct_score int, ct_review_count int, global_avg_usd numeric, last_synced_at date)` | **v0.1.0 mock 권장 (LOC 절감)**, v0.2.0 실제 API sync |
| `purchases` 테이블 (가격 추이) | **부재** | `purchases (id, wine_lwin, user_id, price_krw, purchased_at, store_id)` + RLS | **v0.1.0 deferred** — PriceChart stub로 전환 |
| `stores` 테이블 (PriceChart 툴팁) | **부재** | seed mock 또는 별도 테이블 | v0.2.0 (PriceChart와 함께) |
| `community_peak_estimates` 테이블 (전문가 절정 추정) | **부재** | `community_peak_estimates (id, wine_lwin, reviewer_user_id, reviewer_level int CHECK level>=3, estimated_peak_year int)` + RLS | **v0.1.0 deferred** — CommunityDrinkWindowCard stub |
| `wine_stories` 테이블 (와이너리 스토리) | **부재** | `wine_stories (wine_lwin PK, winery_name_ko/en text, location_ko/en text, founded_year int, history_ko/en text, fun_fact_ko/en text)` 또는 별도 winery 테이블 join | **v0.1.0 mock 또는 empty 분기 fallback**, v0.2.0 실제 콘텐츠 |
| `reviews` 테이블 (community reviews) | **부재** | `reviews (id, wine_lwin, user_id, mode text CHECK in ('beginner','expert'), rating numeric, body_ko/en text, created_at)` + RLS — **공개 모드 정책 필요** (다른 사용자 노트를 review로 노출할지) | **v0.1.0 deferred** — ReviewList stub (empty state 항상) |
| `community_drink_window` mean/median/distribution 집계 | mock | SQL 함수 또는 view (community_peak_estimates 가중 집계) | v0.2.0 |

> **v0.1.0 권장 범위**: WineHero + WineMeta + (DrinkingWindowBar 시스템 계산) + MyTastingNoteCard (있을 때) + WriteNoteCta (없을 때) + AddToCellarCta inline + ServingTempPill (wines.serving_temp 컬럼 추가 시) + FavoriteToggle (wine_favorites 테이블 추가 시).
> **v0.1.0 deferred 권장**: ExternalRatingsCard (mock 가능), AveragePricePill / PriceChart (purchases 없음), CommunityDrinkWindowCard (estimates 없음), WineStoryCard (콘텐츠 없음), ReviewList (정책 미정).
> deferred 컴포넌트는 자리 placeholder 또는 hide. **리더 결정 §12**.

### NW v4 colorScheme 헬퍼

이미 `src/lib/use-theme-tokens.ts` 존재 — 그대로 사용. LinearGradient colors, react-native-svg fill, alpha 인라인 모두 이 hook으로 분기.

---

## 10. 검증 체크리스트

- [ ] BackHeader title=wine name (한글 우선) + FavoriteToggle (active gold fill / idle text-secondary outline)
- [ ] WineHeader hero radius 18, border default, padding 32_0_24, bottle gradient (radial→LinearGradient fallback) verbatim 적용
- [ ] WMBottle width 88 height 290 + producer/label/vintage 텍스트 inline SVG
- [ ] ServingTempPill abs right 12 bottom 12, padding 4_10, radius full, bg gold 12%, border 1 gold, color gold, Inter 11 500
- [ ] WineHeader text 메타 mt 16, type dot 8×8 type별 색, name Playfair 24, producer Inter 13 text-secondary, location Inter 11 text-muted lh 1.5
- [ ] MyTastingNoteCard 분기 (내 노트 있을 때만) — 노트 없으면 WriteNoteCta
- [ ] MyTastingNoteCard border 1px gold + shadow goldGlow, padding 16, gap 12 col
- [ ] MyTastingNoteCard 헤더 BookOpen + "내 노트" UPPER + Edit btn
- [ ] MyTastingNoteCard meta row (date Calendar + rating Star + mode badge) flex-wrap
- [ ] (expert) WSET 4-grid bg rgba(15,7,24,0.6) (dark) / light alt (§9), gap 6, padding 10
- [ ] (expert + community>=10) Community compare box bg wineRed 12%, border wineRed, padding 12, gap 6
- [ ] WriteNoteCta padding 16, gap 14, icon circle 40 bg wineRed 15% border wineRed 30%, glass SVG wine-red 1.6
- [ ] WriteNoteCta CTA pill bg wine-red, color cream, padding 8_14, radius full, shadow wineRed sm
- [ ] ExternalRatingsCard 3-col grid gap 8 (Vivino fill / WS WS / CT CT), 각 RatingPill bg-map, minHeight 70
- [ ] ExternalRatingsCard footer Info button toast "Mock data only"
- [ ] AveragePricePill flex justify-between, left col label+count, right col KRW Playfair 20 + USD approx
- [ ] PriceChart range toggle (3M/1Y/ALL), active wine-red, idle bg-map
- [ ] PriceChart 차트 자체 — v0.1.0 placeholder + range UI 유지 (deferred)
- [ ] PriceChart details link gold + ArrowRight 14 → `/wine/${lwin}/prices` (v0.1.0 disabled or toast)
- [ ] CommunityDrinkWindowCard header Users 16 gold + title Inter 14 600 cream
- [ ] CommunityDrinkWindowCard 빈 데이터 fallback (v0.1.0 default)
- [ ] CommunityDrinkWindowCard details link → `/wine/${lwin}/community-peak` (v0.2.0 disabled or toast)
- [ ] WineStoryCard outer minHeight 220, padding 16, label gold UPPER, funFact Lightbulb btn
- [ ] WineStoryCard popover (funFact toggle) abs top 48 right 12 maxW 260
- [ ] WineStoryCard excerpt 2 sentences from first paragraph
- [ ] WineStoryCard more link → `/wine/${lwin}/story` (v0.2.0)
- [ ] ReviewList header "리뷰 {count}" + SortBtn × 2 (active wine-red, idle bg-map)
- [ ] ReviewList empty "아직 리뷰가 없어요"
- [ ] ReviewCard top row: 닉네임 + LevelPill + ReviewBadge × max 2 동반 표시 (CRITICAL — 닉네임 단독 금지)
- [ ] ReviewCard rating expert "{n}/100" gold / beginner Star + "{n}/5" cream
- [ ] AddToCellarCta inline width 100% height 52 radius 14 bg wine-red Plus 18 + "셀러에 추가", shadow wineRed lg
- [ ] AddToCellarCta press → AddToCellarSheet open (RN deviation)
- [ ] ScrollView gap 16 between 모든 카드 (keyscreen line 57)
- [ ] paddingBottom 32 (BottomNav 외부 라우트라 96 불필요)
- [ ] BackHeader title 1줄 truncate (numberOfLines={1})
- [ ] LinearGradient (radial 대체) bottle color 35% → bg-deep, locations [0, 0.7]
- [ ] dark mode 색 검증 (surface=#3D2A4A, gold/wineRed 고정)
- [ ] light mode 색 검증 (surface=#FFFFFF, text-primary=#2A1A14, WSET grid bg alt)
- [ ] ko/en 양쪽 모드 텍스트 검증 (모든 i18n 키 양쪽 채움, 영어 모드 한글 노출 0건)
- [ ] dark+ko / dark+en / light+ko / light+en 4 조합 시각 캡처 (design-reviewer)
- [ ] 풀-투-리프레시 동작 (RefreshControl tintColor gold, wine refetch)
- [ ] LWIN 미존재 시 EmptyState (current RN line 39-62 패턴 유지)
- [ ] 모든 Pressable accessibilityRole + accessibilityLabel
- [ ] FavoriteToggle accessibilityState selected
- [ ] WCAG AA 대비 (모든 텍스트 양쪽 모드)
- [ ] 9px / 10px micro text dynamic type a11y 검토 (RatingPill source, MiniDim label, footer)
- [ ] Press feedback (opacity 0.85) 모든 Pressable
- [ ] Haptics 정책 (selectionAsync nav, impactAsync favorite, notificationAsync success/error)

---

## 11. 현재 RN 구현 차이 (retroactive)

기존 코드: `app/wine/[lwin].tsx` (138 LOC), `src/components/wine/{wine-hero,wine-meta,drinking-window-bar,community-peak-placeholder,add-to-cellar-sheet}.tsx` (~430 LOC 합).

| 항목 | keyscreen 원본 (verbatim 기준) | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|
| **레이아웃 순서** | WineHeader → MyNote/WriteCta → ExternalRatings → AvgPrice → PriceChart → CommunityDrinkWindow → WineStory → ReviewList → AddToCellarCta | WineHero → WineMeta → DrinkingWindowBar → CommunityPeakPlaceholder → PrimaryButton×2 (WriteNote/AddToCellar) | 섹션 5개 신규 (MyNote, WriteCta, ExternalRatings, AvgPrice, PriceChart, WineStory, ReviewList) + 기존 WineMeta는 keyscreen에 없음 (별도 카드 형태) — 제거 또는 통합 |
| **BackHeader 우측** | `<FavoriteToggle/>` slot | 비어있음 (`<BackHeader title={...}/>`) | FavoriteToggle 컴포넌트 신규 + wine_favorites 테이블 신규 |
| **WineHeader (현재 WineHero)** | radial gradient + WMBottle + ServingTempPill abs + type dot + producer + location | LinearGradient + 단순 Wine icon 64 + WineNameDisplay + vintage 텍스트 | hero 완전 재작성 — WMBottle 사용 + ServingTempPill + 텍스트 메타 verbatim |
| **WineMeta (현재 컴포넌트)** | keyscreen에 없음 (WineHeader 안에 producer/region/country/vintage 모두 통합) | producer/vintage/region/country/classification 4셀 grid 카드 | **제거** 또는 WineHeader 안으로 통합 (verbatim 우선) |
| **DrinkingWindowBar** | keyscreen에 없음 (CommunityDrinkWindowCard가 비슷한 역할 — 단, 시스템 peak는 wines.drink_window_peak_year, community 추정은 별도) | 단순 progress bar | **시스템 peak bar는 keyscreen verbatim 위반은 아니지만 별도 카드** — 유지하되 keyscreen 등가물 없음을 명시. 또는 CommunityDrinkWindowCard 안의 system peak marker로 통합 (§12 결정) |
| **CommunityPeakPlaceholder** | keyscreen `CommunityDrinkWindowCard` (히스토그램 + 카피 + details link) | placeholder Users icon + "곧 출시" | stat + dist copy + details link 추가 (BarChart는 v0.1.0 deferred) |
| **WriteNote/AddToCellar 버튼** | 별도 컴포넌트 (WriteNoteCta 카드 + AddToCellarCta inline pill bottom) | 단순 PrimaryButton × 2 column | 분리 + keyscreen verbatim 스타일 적용 |
| **i18n 키** | LocaleText 인라인 | `wineDetail.*` 일부 키 (notFound, meta, drinkWindow, community, actions) | §7 키 일괄 추가 (servingTemp, fav, myNote, writeNote, externalRatings, avgPrice, priceChart, communityPeak, story, reviews, a11y) |
| **신규 데이터 의존** | mock | supabase에서 가져옴 | wine_favorites 테이블 + ServingTempPill용 wines.serving_temp_{min,max} 컬럼 + (optional) external_ratings/wine_stories mock seed |

### retroactive 작업 폭

- **신규 컴포넌트**: 10개 (FavoriteToggle, ServingTempPill, MyTastingNoteCard, WriteNoteCta, ExternalRatingsCard+RatingPill, AveragePricePill, PriceChart stub, CommunityDrinkWindowCard stub, WineStoryCard, ReviewList+ReviewCard, AddToCellarCta inline, ReviewBadge)
- **재작성**: WineHero (radial + WMBottle + 텍스트 메타 verbatim), wine-detail screen (섹션 순서 + 신규 컴포넌트 통합)
- **제거 검토**: WineMeta (keyscreen 등가물 없음 — WineHeader 안으로 통합)
- **i18n 확장**: ko/en 각 ~40개 키
- **design-tokens.ts 확장**: 6 wineTypeDot 색 + 2 wineRed shadow scale + 1 radius (18) + wsetGridBg dual + 7 typography
- **supabase 마이그레이션**: wine_favorites 테이블 + wines.serving_temp_{min,max} 컬럼 추가 (+ optional grapes, appellation)
- **WMBottle 확장**: producer/label/vintage 텍스트 SVG 추가 (현재 simplified 버전)

**총 LOC 추정**: 700~900 LOC 신규/재작성. **2~3일 작업 — Day 6/7 압박** (home과 동시 진행 시 더 큼).
- **P0 (alpha 필수, verbatim 시각)**: WineHero 재작성 + WMBottle 텍스트 확장 + ServingTempPill + FavoriteToggle + MyTastingNoteCard / WriteNoteCta 분기 + AddToCellarCta inline (+ wine_favorites 테이블)
- **P1 (alpha 시각만 stub OK)**: ExternalRatingsCard (mock data), AveragePricePill (purchases 없을 때 hide), PriceChart (UI만, 차트 placeholder), CommunityDrinkWindowCard (stat 없을 때 empty), WineStoryCard (empty fallback), ReviewList (empty fallback)
- **P2 (v0.2.0)**: PriceChart 실 차트 + purchases 테이블, CommunityDrinkWindow 실 데이터, ReviewList 실 데이터, /wine/{lwin}/{prices,community-peak,story} 후속 화면

---

## 12. 미해결 질문 (리더 판단 필요)

1. **현재 WineMeta 카드**: keyscreen verbatim과 충돌 — keyscreen은 WineHeader 안에 producer/region/country/vintage 통합. 우리 RN의 4셀 grid 카드는 보조 정보를 더 강조하는 형태. **verbatim 우선이면 WineMeta 제거 + WineHeader로 통합**. 또는 별도 "와인 정보" 카드로 유지하되 keyscreen에 없는 보강이라는 deviation으로 기록. (verbatim 원칙: 키스크린에 있는 요소를 누락 X, 없는 요소를 추가 X — 후자 위반 가능성). **권장: WineMeta 제거 후 WineHeader verbatim**
2. **현재 DrinkingWindowBar**: keyscreen에 직접 등가물 없음 (CommunityDrinkWindowCard가 community 기준). 시스템 peak (wines.drink_window_peak_year) 단독 시각화는 keyscreen 자체에 없음. **제거 후 CommunityDrinkWindowCard 안에 system peak marker로 통합** vs **유지 (RN-only enhancement, deviation 기록)** — 리더 결정.
3. **ExternalRatingsCard**: mock data 그대로 v0.1.0 alpha (Vivino/WS/CT mock) vs 부재 데이터로 empty state 항상 vs 전체 hide. **권장: mock seed로 표시, Info button toast로 "mock data" 안내** (keyscreen verbatim).
4. **AveragePricePill / PriceChart**: purchases 테이블 v0.1.0 부재. **권장 P1: 모두 hide (count 0 시 카드 자체 미렌더)** — keyscreen은 항상 노출하지만 RN은 데이터 없으면 hide가 자연스러움. 또는 keyscreen verbatim으로 empty state 노출.
5. **CommunityDrinkWindowCard**: community_peak_estimates 부재. **권장: empty fallback "아직 추정 데이터가 부족해요..." verbatim 노출** — keyscreen 등가물 그대로.
6. **WineStoryCard**: wine_stories 콘텐츠 부재. **권장: empty fallback "이 와인의 스토리는 준비 중" verbatim 노출** — 추후 콘텐츠 추가 시 같은 자리에 표시.
7. **ReviewList**: reviews 테이블 부재 + 공개 정책 미정. **권장: empty fallback "아직 리뷰가 없어요" 노출** — v0.2.0 다른 사용자 노트 일부 공개 정책 결정 후 실 데이터 연결.
8. **AddToCellarCta navigate target**: keyscreen은 `/capture`로 이동 (mock 셀러 등록은 capture 흐름에서 처리). 우리 RN은 이미 AddToCellarSheet 보유. **권장: sheet open 유지 (RN UX), deviation으로 기록**.
9. **/wine/{lwin}/{prices,community-peak,story} 후속 화면**: v0.1.0 alpha에 미포함. 링크는 표시하되 onPress 시 **disabled 또는 toast "v0.2.0에 출시"** 결정 필요.
10. **wine_favorites 테이블**: 신규 마이그레이션 필요 (FavoriteToggle). v0.1.0 P0 vs v0.2.0 defer. **권장: P0 (간단한 unique constraint + RLS)**.
11. **wines.serving_temp_{min,max} 컬럼**: 신규 컬럼. wine 카탈로그에 채워야 함 — winemine-specs 도메인에서 wine type별 기본값 산출 가능 (red 16-18, white 8-12 등). v0.1.0 P0 vs P1. **권장: P1 — 컬럼 추가 + type별 default 채움**.
12. **GlossaryTooltip (ServingTempPill 클릭)**: v0.1.0 deferred. 대신 단순 텍스트만. v0.2.0에서 BottomSheet glossary 시스템 구축.
13. **9px / 10px micro text a11y**: home 사양 §6/§9와 동일 이슈. design-reviewer가 dynamic type 검증 후 11px 상향 여부 결정. **권장: `allowFontScaling={false}` 적용 후 verbatim 유지**.
14. **MyTastingNoteCard 데이터 hook**: `useMyNoteForWine(userId, wineLwin)` 신규 — `tasting_notes where user_id=auth.uid() and wine_lwin=lwin limit 1`. expert/beginner 분기, expertFields/beginnerFields 구조 정의 필요 (현재 tasting_notes 마이그레이션 확인 후 추가). **supabase-engineer 트리거**.
15. **community_compare ≥10 조건**: getExpertReviewStats(wine.id) 가져오는 SQL 함수 또는 view 신규 (`count(distinct reviewer) where mode='expert' and wine_lwin=...`, `avg(rating)`). reviews 테이블 부재로 v0.2.0 deferred.

---

## 13. 진행 로그 메타

- author: design-spec-author
- 작성일: 2026-05-20 (Day 6)
- 키스크린 JSX read: 17개 파일 (page.tsx + 13 wine-detail 자식 + back-header + WMBottle + drink-window lib + community-peak-aggregator lib)
- 기존 RN read: 8개 파일 (wine/[lwin].tsx + 5 wine 컴포넌트 + 2 shared)
- 토큰 확장 P0 요청: 6 wineTypeDot 색, 2 wineRed shadow, 1 radius (18), 2 wsetGridBg (dark/light), 7 typography
- i18n 확장 요청: ko/en 각 ~40 키
- supabase 마이그레이션 요청: wine_favorites 테이블 (P0), wines.serving_temp_{min,max} 컬럼 (P1), 잠재적 external_ratings/wine_stories mock seed (P1)
- 신규 컴포넌트 포팅: 12개 (FavoriteToggle, ServingTempPill, MyTastingNoteCard, WriteNoteCta, ExternalRatingsCard, RatingPill, AveragePricePill, PriceChart stub, CommunityDrinkWindowCard stub, WineStoryCard, ReviewList, ReviewCard, ReviewBadge) + WMBottle 텍스트 확장 + WineHero 재작성
- 기존 컴포넌트 처리: WineMeta 제거 검토 (verbatim), DrinkingWindowBar 유지 vs CommunityDrinkWindow 통합 검토, CommunityPeakPlaceholder → CommunityDrinkWindowCard stub로 진화
- retroactive 폭: 10 신규 컴포넌트 + 2 재작성 + 1 제거 검토 + i18n 40 키 + 토큰 18종 + 마이그레이션 1~3개
- **rn-screen-builder 작업 추정**: 2~3일 (Day 6/7 — home과 병행 시 더 큼; P0 범위로 축소 권장)
- escalation 항목: §12 미해결 질문 15개 — 특히 (1) WineMeta 제거 여부, (2) DrinkingWindowBar 처리, (10) wine_favorites 마이그레이션 P0 결정, (11) wines.serving_temp 컬럼 P0 vs P1
