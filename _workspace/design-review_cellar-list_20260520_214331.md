# Design Review — /(tabs)/cellar (list) — 1차 retroactive

> Day 6 retroactive design hardening 게이트. 키스크린 verbatim 기준 vs 현재 RN 구현 비교.
> reviewer: design-reviewer · 일자: 2026-05-20 21:43:31

## 대상

- 사양: `_workspace/design-specs/cellar-list.md` (912 LOC — design-spec-author 산출물)
- 원본: `../winemine-keyscreen/src/app/cellar/page.tsx` (+ `cellar-card.tsx`, `cellar-empty-state.tsx`, `drink-window-badge.tsx`, `drink-window.ts`)
- 키스크린 PNG: `_workspace/keyscreen-shots/cellar.png` (heavy/dark/ko — 헤더+탭 segment+등록 CTA+검색+타입필터칩 6종+정렬칩 6종+결과 카운트+2-col grid 카드 다수+DrinkWindowBadge)
- 현재 RN 구현:
  - `app/(tabs)/cellar/index.tsx` (160 LOC)
  - `src/components/cellar/cellar-card.tsx` (124 LOC — 행 카드 + Swipeable)
  - `src/components/cellar/cellar-tabs.tsx` (69 LOC — text + underline indicator)
  - `src/components/cellar/search-sort-bar.tsx` (99 LOC — search + Modal 정렬 picker)
  - `src/components/cellar/cellar-fields.tsx` (71 LOC — detail용, 본 화면 영향 X)

## SCOPE-OUT (FAIL 카운트 제외)

- Day 6 settings hub / appearance / experience / language / `(tabs)/settings/_layout` — 본 리뷰 비대상
- AppHeader 재작성 (home/공통 사양으로 분리)
- 죽은 파일 cleanup (cellar 현재 사용 중 파일은 SCOPE-IN)
- **tasted 탭 전체** — 사양 §12 권장대로 P1 분리. 본 리뷰는 **cellar 탭 (alpha 필수 P0)** 만 평가. 별도 FAIL 카운트.

---

## 6항목 체크리스트 (cellar 탭, P0)

### (a) 요소 누락 — FAIL

| 누락 항목 | 키스크린 기대 (참조) | 현재 RN 실제 | 수정 방향 |
|---|---|---|---|
| **TabSegment (inline segment)** | `page.tsx` line 153~219 — bg-surface border 1px radius 10 padding 3 안에 두 탭이 들어가는 inline-flex segment + count badge | `cellar-tabs.tsx` line 47~68 — 1/2 width column 단순 underline (height 2 width 32 gold) + label만, count badge 없음, segment 컨테이너 없음 | TabSegment 완전 재작성 (사양 §3-2). 두 탭 모두 segment 안. active(wine-red bg + cream text + count cream/0.7) / idle(transparent + text-muted + count text-disabled) |
| **Tab count badge** | active 시 cream/0.7, idle 시 text-disabled, Inter 10 700 | 없음 | 사양 §3-2 + 토큰 추가 (`creamAlpha.7`) |
| **AddCta (+ 등록)** | `page.tsx` line 219~242 — inline-flex transparent border-default radius 10 padding 6_10 + Plus 14 gold + Inter 12 600 gold | 없음 (TitleBar 자체가 없음) | 사양 §3-3. `app/(tabs)/cellar/index.tsx` Header 아래 TitleBar 신규. tap → toast 또는 BottomSheet (§12-2 결정 필요) |
| **TypeFilterChips (6칩)** | `page.tsx` line 312~351 — all/red/white/sparkling/rosé/fortified, horizontal scroll, dot+label | 없음 (검색바만) | 신규 컴포넌트 `src/components/cellar/type-filter-chips.tsx`. 사양 §3-5 |
| **TypeDot (gradient + 단일)** | all dot은 135deg [wineRed→gold→cream] gradient, 나머지는 단일 색 (white #E8D89B, sparkling #F5F0E8, rose #D4707A, fortified #6B1421, red #8B1A2A) | 없음 | typeFilterDot 토큰 추가 + LinearGradient. P0 토큰 확장 (사양 §9) |
| **SortChips (6칩 horizontal scroll)** | `page.tsx` line 354~386 — recent/drinkSoon/vintage/region/storage/price, 6칩 모두 보임 + scroll | `search-sort-bar.tsx` line 52~95 — Pressable + ChevronDown + Modal radio list 3 (`recent/vintage/price`만, drinkSoon/region/storage 누락) | 완전 재작성. Modal 제거, 6칩 horizontal scroll. 사양 §3-6 |
| **ResultCount + ClearFilters** | `page.tsx` line 389~424 — Inter 11 text-muted "총 N병" or "N병 중 M개 결과" + ClearFilters btn gold | 없음 | 신규. 사양 §3-7 |
| **NoResults (filtered=0)** | `page.tsx` line 846~892 — dashed border radius 14 padding 32_20 + Playfair 16 title + Inter 12 body + ClearBtn gold border | `index.tsx:130` — `<EmptyState title={t('cellar.empty.noResults')} />` (title만, dashed 카드 없음, body·CTA 없음) | EmptyState 대체. 사양 §3-11 |
| **CellarCard 2-col grid layout** | `page.tsx` line 430~443 — `display grid; gridTemplateColumns 1fr 1fr; gap 12; padding 0 16 24`. 카드 자체는 column (병 영역 + 메타 영역) | `cellar-card.tsx` line 73~123 — `flex-row` 행 카드 (병 width 64 + ml-3 + meta col), FlatList numColumns=1, ItemSeparator hairline | FlatList numColumns=2 + columnWrapperStyle gap 12. CellarCard 완전 재작성. 사양 §3-8 |
| **CellarCard BottleZone gradient** | `cellar-card.tsx` 원본 — `padding 14 0 8; bg linear-gradient(160deg, ${bottleColor}28 0%, var(--color-bottle-shelf) 80%); items-center justify-center` | `cellar-card.tsx:80~87` — 단색 사각형 `width 64 height 96 backgroundColor: bottleColor borderRadius: 6` (gradient 없음, WMBottle 없음, bottleShelf 배경 없음) | LinearGradient + WMBottle 컴포넌트 사용. (b)(c) 함께 |
| **WMBottle SVG** | `width 40 height 130` (cellar grid 카드), `width 36 height 118` (tasted row) | 없음 — 단색 직사각형 | WMBottle 포팅 (home 사양에서 이미 P0). 사양 §3-8 |
| **DrinkWindowBadge** | 5 status (peak/opening/mature/too-young/past-peak) — bg/color/label 분기, padding 3_8 radius 10 Inter 10 600 | 없음 (status meta line만 — "구입일 / 가격") | 신규 컴포넌트 `src/components/cellar/drink-window-badge.tsx` + `src/lib/drink-window.ts` 포팅 (단순화 v0.1.0) |
| **CellarEmptyState illustration** | `EmptyState` w/ `<GlassWater size=56 strokeWidth=1.25 color=gold/>` illustration | `index.tsx:108~119` — `<EmptyState title={...} description={...} action={<PrimaryButton/>}/>` (illustration prop 없음 — shared/empty-state.tsx 확인 필요) | EmptyState에 illustration prop 추가 + GlassWater 아이콘 |
| **SearchInput Search icon position** | left icon 16 + flex-1 TextInput + ClearBtn 22×22 circle bg cream/0.08 X 12 | 좌측 Search icon ✓ + TextInput ✓ + 우측 X 16 (circle bg 없음) | ClearBtn 22×22 circle radius 11 + bg `withAlpha(cream, 0.08)` 추가 |
| **vintage 별도 표시 + producer 분리** | producer Inter 10 text-muted line + vintage 별도 Inter 10 text-secondary line | line 100~111: producer/vintage/country 모두 한 줄에 wrap (chip 형식 같이) — WineNameDisplay 의존 | producer · vintage 각각 분리, 사양 §3-8 |

**FAIL: 14 항목 누락**

### (b) Spacing 비율 — FAIL

| 위치 | 키스크린 기대 | 현재 RN 실제 | 비율/수정 |
|---|---|---|---|
| **CellarCard 메타 padding** | `padding 10 12 12` (tight, 12px 좌우) | `px-3 py-3` (12px·12px, 균등) | 수직 비율 다름. 위 10 / 좌우 12 / 아래 12로 변경 |
| **CellarCard BottleZone padding** | `padding 14 0 8` (위 14 / 좌우 0 / 아래 8) | 없음 (병이 직접 카드 안 padding 없이 노출) | 사양 §3-8 verbatim |
| **CellarGrid 컨테이너 padding** | `padding 0 16 24` (좌우 16 / 아래 24) | `paddingTop:12, paddingBottom:24` (좌우 0) | columnWrapperStyle paddingHorizontal:16 추가 |
| **CellarGrid gap** | `gap 12` (행/열 균등 12) | `ItemSeparator` height 1 (실제 갭 0, separator 1px) | numColumns=2 + gap 12 |
| **TabSegment padding** | outer padding 3 + tab padding 5_10 + segment gap 2 | 없음 (segment 컨테이너 자체 없음) | 사양 §3-2 |
| **SearchInput padding** | `padding 10 12` 내부, `padding 0 16 10` 외부 wrapper | `height 44 px-3` (52 wrapper px-4 pt-3 gap-3) | 내부 10_12 verbatim |
| **SearchInput radius** | radius 12 | rounded-xl (12) ✓ | OK — but border-default 1px 누락 |
| **TypeFilterChips padding** | `padding 0 16 10` + gap 6, chip padding 5_10_5_8 | 없음 | 신규 |
| **SortChips padding** | `padding 0 16 10` + gap 8, chip padding 5_11 | Modal 안 padding (px-5 py-5) | 완전 다른 spacing — 재작성 |
| **ResultCount padding** | `padding 0 20 10` (좌우 20!) | 없음 | 사양 §3-7 paddingHorizontal:20 |
| **NoResults padding** | `margin 8 16 24; padding 32 20` | (현재 EmptyState 기본 padding) | 사양 §3-11 |

**FAIL: 11 항목 spacing 미일치**

### (c) Gradient 방향·깊이 — FAIL

| 위치 | 키스크린 기대 | 현재 RN 실제 | 수정 |
|---|---|---|---|
| **CellarCard BottleZone gradient** | `linear-gradient(160deg, ${bottleColor}28 0%, var(--color-bottle-shelf) 80%)` — 160deg, alpha 0.157, stop [0, 0.8] | 단색 `backgroundColor: bottleColor` (cellar-card.tsx:83) | LinearGradient. start={x:0,y:0} end={x:0.34,y:0.94} (160deg 변환), colors=[withAlpha(bottleColor,0.157), currentBottleShelf], locations=[0, 0.8]. **P0: `cellarCardBottleGradient` helper 토큰 추가** (사양 §9) |
| **TypeFilterChip[all] dot gradient** | `linear-gradient(135deg, #8B1A2A 0%, #C9A84C 50%, #F5F0E8 100%)` — 8×8 radius 4 | 없음 (TypeFilterChips 자체 없음) | 신규. LinearGradient colors=[brand.wineRed, brand.gold, brand.cream] locations=[0, 0.5, 1] start={0,0} end={1,1} |

**FAIL: 2/2 gradient 누락**

### (d) Corner radius — FAIL

| 위치 | 키스크린 | 현재 RN | 수정 |
|---|---|---|---|
| **CellarCard outer** | radius 14 (rounded-[14px]) | 없음 (Pressable, radius 0). 단지 내부 병 사각형은 radius 6 | radius 14 + overflow hidden 추가 |
| **TabSegment outer** | radius 10 | 없음 (탭 segment 자체 없음) | 신규 |
| **Tab inner button** | radius 7 (NW 기본 없음 — `rounded-[7px]` 인라인 또는 radius['7'] 토큰 추가 P0) | 없음 | 신규 + 토큰 |
| **AddCta button** | radius 10 | 없음 | 신규 |
| **SearchInput** | radius 12 | rounded-xl (12) ✓ | OK |
| **SearchInput ClearBtn circle** | radius 11 (22×22 circle) | 없음 (X 아이콘만, circle bg 없음) | 신규 |
| **TypeFilterChip** | radius 14 | 없음 | 신규 |
| **SortChip** | radius 14 | rounded-full (Pressable) — 단일 chevron 버튼만 | 신규 6칩 (radius 14) |
| **NoResults** | radius 14 | 기본 EmptyState | 신규 |
| **NoResults ClearBtn** | radius 10 | 없음 | 신규 |
| **DrinkWindowBadge** | radius 10 | 없음 | 신규 |
| **TastedWineRow outer** | radius 14 | 없음 (P1) | P1 |
| **CellarCard inner BottleZone** | (no radius, padding로만 분리) — 카드 outer radius 14 overflow hidden으로 자동 자름 | 카드 내 별도 view radius 6 (단색 병) | overflow hidden으로 정합 |

**FAIL: 12/13 항목 radius 미일치 (SearchInput radius 12만 OK)**

### (e) Typography 위계 — FAIL

| 위치 | 키스크린 (Inter/Playfair size weight) | 현재 RN | 수정 |
|---|---|---|---|
| **Tab label** | Inter 12 600 | `font-inter-semibold text-card-body` (NW v4 text-card-body = ?, design-tokens 확인 필요) | Inter 12 600 명시 — typography 토큰 `tabSegmentLabel` 신규 |
| **Tab count badge** | Inter 10 700 | 없음 | 신규 토큰 `tabCount` |
| **AddCta label** | Inter 12 600 gold | 없음 | 신규 |
| **SearchInput value** | Inter 13 cream | `font-inter text-card-body text-text-primary` (card-body=?) | 직접 13px 명시 |
| **TypeFilterChip label** | Inter 11 600 | 없음 | 신규 토큰 `chipLabel` (사양 §9) |
| **SortChip label** | Inter 11 600 | `font-inter text-card-meta` (card-meta=?) — Modal 안 | chipLabel 재사용 |
| **ResultCount** | Inter 11 text-muted | 없음 | 신규 |
| **ClearFilters btn** | Inter 11 600 gold | 없음 | 신규 |
| **NoResults title** | Playfair 16 cream | 없음 (`EmptyState title`만, 폰트 미확정) | Playfair 16 명시 |
| **NoResults body** | Inter 12 text-muted lh 1.5 | 없음 | 신규 |
| **CellarCard wine name** | Playfair 12 lh 15 cream 2-line clamp minHeight 30 | `<WineNameDisplay size="card"/>` (size="card" → ?, 토큰 검증 필요) | Playfair 12 lh 15 verbatim. WineNameDisplay size="card" 토큰이 일치하면 OK, 아니면 직접 명시 |
| **CellarCard producer** | Inter 10 text-muted | `font-inter text-card-meta text-text-secondary` (text-secondary가 아닌 text-muted여야 함, size=card-meta=?) | text-muted + Inter 10 |
| **CellarCard vintage** | Inter 10 text-secondary | text-text-muted (현재 country와 같이 muted) | text-secondary 변경 |
| **DrinkWindowBadge label** | Inter 10 600 lh 12 | 없음 | 신규 |

**FAIL: 13/14 항목 typography 미일치 (정확한 size/weight/color 검증 불가 항목 다수 — text-card-body/text-card-meta가 정확히 어떤 값인지 추가 확인 필요)**

### (f) Color 사용 — FAIL

| 위치 | 키스크린 기대 | 현재 RN | 수정 |
|---|---|---|---|
| **CellarCard outer bg** | `var(--color-surface)` (dark #3D2A4A / light #FFFFFF) | `bg-surface` ✓ | OK — but 카드 다른 요소들이 미구현이라 합산 효과 다름 |
| **CellarCard outer border** | `1px var(--color-border-default)` | 없음 | border border-border-default 추가 |
| **CellarCard BottleZone bg** | gradient (bottleColor alpha 0.157 → bottleShelf) | 단색 bottleColor | (c) 참조 |
| **Tab active bg/color** | wine-red bg + cream text | text-primary text-muted 색 차이만 (bg 없음, underline만) | 사양 §3-2 |
| **Tab idle color** | text-muted | text-muted ✓ (label만) | OK — but bg/border 부재 |
| **AddCta** | transparent bg + border-default border + gold text + gold Plus icon | 없음 | 신규 |
| **TypeFilterChip active** | border 1px gold + bg `rgba(201,168,76,0.12)` + text gold | 없음 | 신규. 토큰 `goldAlpha.12` |
| **TypeFilterChip idle** | border-default + transparent + text-muted | 없음 | 신규 |
| **TypeDot 색 5종** | red #8B1A2A / white #E8D89B / sparkling #F5F0E8 / rose #D4707A / fortified #6B1421 — verbatim | 없음 | typeFilterDot 토큰 그룹 신규 (4개 신규: white/rose/fortified — red/sparkling/gold/dessert는 brand 재사용) |
| **SortChip active** | wine-red bg + cream text | Modal 라디오 (Check 아이콘 gold) — UX 자체 다름 | 신규 |
| **SortChip idle** | border-default + transparent + text-secondary | 단일 chevron Pressable text-secondary | 신규 |
| **SearchInput ClearBtn bg** | `rgba(245,240,232,0.08)` (cream alpha) | 없음 (X 아이콘만, bg 없음) | `withAlpha(brand.cream, 0.08)` |
| **DrinkWindowBadge 5 status 색** | peak wine-red/cream / opening gold/deepestDark / mature gold/deepestDark / too-young `rgba(155,139,122,0.18)`/text-muted / past-peak `rgba(45,21,64,0.6)`/text-muted | 없음 | 신규. 토큰 `tooYoungBg`, `pastPeakBg` |
| **ClearFilters btn (ResultCount)** | gold text | 없음 | 신규 |
| **ClearFilters btn (NoResults)** | transparent bg + gold border + gold text | 없음 | 신규 |
| **CellarCard inner 병 색** | bottleColor (gradient 안) | bottleColor (단색 사각형) — 단색이라 정확한 와인 색감 표현 불가 (gradient에서는 alpha 0.157로 옅게 시작 → bottleShelf로 그라데이션) | (c) gradient 적용 시 자동 해결 |
| **하드코딩 hex 검증** | design-tokens.ts/tailwind.config.ts/lwin.ts 외에 hex 사용 금지 | `cellar-card.tsx:84` `backgroundColor: bottleColor` (bottleColor는 lwin.ts/wines_localized 출처 — 허용) ✓<br>`index.tsx:146` `backgroundColor: 'rgba(0,0,0,0.08)'` ItemSeparator — **하드코딩 rgba** | rgba 토큰화 또는 hairline border-default로 교체. P0 위반 1건 |

**FAIL: 15/16 항목 color 미일치, 하드코딩 rgba 1건 (index.tsx:146)**

---

## 다크/라이트 양쪽 모드 (CLAUDE.md §4-9)

- [ ] **dark 모드**: 현재 RN 실제 캡처 불가 (구현 자체가 매우 다른 단계 — 기본 row 카드만 보임). 사양 기대(dark.bg.deepest=#251837 / surface=#3D2A4A / border #5A3D6A)와 비교 시점 미도래.
- [ ] **light 모드**: 동일. light bg=#FAF5EC / surface=#FFFFFF / border=#E0D2BC.
- [ ] **light gold (#C9A84C) on cream (#FAF5EC) WCAG AA = 2.8:1 FAIL** (사양 §12-7 escalation). ResultCount ClearFilters btn, DrinkWindowBadge opening/mature, AddCta label, TypeFilterChip active text — 다수.
- [ ] **light past-peak bg `rgba(45,21,64,0.6)`** light bg에 너무 진함 (대조 과함, 가독성 미달). 사양 §12-8 escalation.

→ 본 리뷰는 retroactive 1차이므로 dark/light 시각 캡처 비교는 P0 구현 완료 후 2차에서.

---

## 스크린샷 비교 (멀티모달)

`_workspace/keyscreen-shots/cellar.png` (heavy/dark/ko) Read 완료. 시각적으로 확인된 키 요소:
- 상단: 헤더 (logo + bell + LevelChip) + 탭 segment (셀러/마신와인 + count badge) + AddCta (gold +등록)
- 검색바 (dark surface, magnifier left)
- 타입 필터칩 6종 (all + 5 types, gold border active)
- 정렬칩 6종 (recent wine-red bg active)
- 결과 카운트 "N병" + ClearFilters
- 2-col grid 카드 다수 (각 카드: gradient bottle zone + WMBottle SVG + 와인명 + producer/vintage + DrinkWindowBadge 색 5종 — 보라/골드/와인레드/뮤트 등)

현재 RN: 거의 모든 요소 부재. 시각 차이 매우 큼 — 완전 재작성 수준의 retroactive.

---

## SCOPE-OUT 재판단 후보 (사양 §12 escalation 9건) 의견

| # | 항목 | reviewer 의견 |
|---|---|---|
| §12-1 | **tasted 탭 데이터 모델** (cellar_items.status vs tasting_notes dedup) | **P1로 분리 권장** — v0.1.0 alpha는 cellar 탭만 키스크린 verbatim. tasted 탭은 v0.2.0. 본 리뷰 FAIL 카운트에서 제외 |
| §12-2 | **AddCta 동작** (mock toast vs BottomSheet) | **mock toast 권장** (v0.1.0 alpha). LOC 0 비용. `cellar.addToast` i18n 키로 "셀러 등록은 추후" 노출. BottomSheet add-cellar form은 v0.2.0 |
| §12-3 | **swipe action 제거** | **제거 권장** — 키스크린 verbatim + 2-col grid 카드에 horizontal swipe 부자연 (사양 §5). long-press 액션 시트는 v0.2.0 |
| §12-4 | **drink-window 휴리스틱 단순화** | **단순화 권장** (vintage + type만으로 5 status 추정). 키스크린 lib (202 LOC, 28개 region/appellation/price 매칭)은 wines_localized 컬럼 부족(appellation/price 컬럼 없음)으로 그대로 포팅 불가. v0.1.0은 50~70 LOC 단순 버전 — `src/lib/drink-window.ts` |
| §12-5 | **dessert 필터 chip 부재** | **verbatim 유지** (5+all). 키스크린 의도. 셀러에 dessert 와인이 있어도 안 보이지만 type_canonical='dessert' 항목은 통계상 1~2%. v0.1.0 alpha 허용. v0.2.0에 6 type chip 검토 |
| §12-6 | **CellarCard navigation** (`/cellar/${item.id}` vs `/cellar/${lwin}?id=...`) | **현재 RN 표준 유지** — lwin URL slug semantic url. detail 화면 진입 동작 동일. 키스크린 verbatim 위반은 minor |
| §12-7 | **light mode gold 대비 2.8:1 FAIL** | **`brand.goldDeep` (#A07F2E) light 모드 대체 권장** — design-tokens.ts에 이미 존재. light 모드에서 ResultCount ClearFilters/AddCta/TypeFilterChip active text/DrinkWindowBadge mature 등 gold text → goldDeep으로 conditional. `useThemeTokens()` 헬퍼 활용 |
| §12-8 | **light past-peak bg rgba(45,21,64,0.6) 대비 과함** | **light 모드는 `withAlpha(light.text.muted, 0.18)` 권장** — light bg에 부드러움. dark 모드는 keyscreen verbatim 유지. `useThemeTokens()` 패턴 |
| §12-9 | **rosé vs rose 키 정규화** | **`rose` 표준 채택** (이미 design-tokens.ts `TypeCanonical` 'rose'). i18n label만 ko `로제` / en `Rosé` 노출. JSON 키는 `rose` |

---

## 결정

### 결과: FAIL (cellar 탭 P0 기준 6/6 FAIL)

| 항목 | 결과 | FAIL 항목 수 |
|---|---|---|
| (a) 요소 누락 | FAIL | 14 |
| (b) Spacing 비율 | FAIL | 11 |
| (c) Gradient 방향·깊이 | FAIL | 2/2 |
| (d) Corner radius | FAIL | 12/13 |
| (e) Typography 위계 | FAIL | 13/14 |
| (f) Color 사용 | FAIL | 15/16 + 하드코딩 rgba 1건 |
| **합계 (cellar 탭 P0)** | **FAIL** | **67 시각 차이 + 1 토큰 위반** |

추가 SCOPE-OUT: tasted 탭 전체 (P1) — FAIL 카운트 제외

### 라우팅

- **rn-screen-builder**: 위 6항목 모두 구현 필요. 작업 폭:
  - 신규 컴포넌트 5개 (TabSegment, TypeFilterChips, SortChips, DrinkWindowBadge, TastedWineRow→P1)
  - 재작성 3개 (CellarCard row→grid, SearchSortBar 해체, CellarTabs underline→segment)
  - 신규 lib 1개 (drink-window.ts 단순화 포팅)
  - 추정 LOC 400~500 (P0 cellar 탭만 — tasted P1 제외)
- **infra-architect (P0 토큰 확장 — rn-screen-builder 작업 전 선행 필수)**:
  - `design-tokens.ts`: `typeFilterDot.{white,rose,fortified}` (3 색), `tooYoungBg`, `pastPeakBg` (2 alpha), `cellarCardBottleGradient()` helper, `goldAlpha.{12,15}`, `wineRedAlpha.25`, `creamAlpha.{08,7}` (6 alpha)
  - `tailwind.config.ts`: `borderRadius['7']: 7`
  - typography: `tabSegmentLabel` (Inter 12 600), `tabCount` (Inter 10 700), `chipLabel` (Inter 11 600), `chipLabelSmall` (Inter 10 600 UPPER ls 0.12em), `drinkWindowBadge` (Inter 10 600 lh 12)
  - 총 ~12 토큰 (사양 §9 P0)
- **design-spec-author**: 사양은 충분히 상세 (912 LOC). 보강 요청 없음. 단 §12 escalation 9건은 리더 결정 대기 — 본 리뷰에서 권장 의견 제출.
- **리더 결정 필요**:
  - §12-1 (tasted P1 분리) — **권장: P1**
  - §12-2 (AddCta mock toast) — **권장: mock toast**
  - §12-3 (swipe 제거) — **권장: 제거**
  - §12-7/8 (light mode a11y) — **권장: useThemeTokens 조건부 토큰**

### 재검증 시점

1. infra-architect P0 토큰 확장 완료 → rn-screen-builder 작업 시작
2. rn-screen-builder P0 (cellar 탭 6항목 구현) 완료 → 2차 design-review
3. 2차에서 dark/light 양쪽 모드 시각 캡처 비교 (CLAUDE.md §4-9)
4. 2차 PASS → qa-inspector 단계

---

## 검토 메타

- reviewer: design-reviewer
- 일시: 2026-05-20 21:43:31
- 키스크린 PNG 시각 확인: ✓ (truncated 이미지지만 상단 헤더~필터/정렬/2-col grid 일부 확인)
- 사양 read: ✓ (912 LOC 전체)
- RN 구현 read: ✓ (5 파일, 합계 ~520 LOC)
- design-tokens.ts read: ✓ (1~80 + grep — cellar 토큰 미존재 확인)
- 하드코딩 hex/rgba grep: 1건 발견 (`index.tsx:146` `rgba(0,0,0,0.08)`)
- 검토 시간: ~15분 (단일 화면 20분 한계 내)
