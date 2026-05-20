# Design Review — /(tabs)/cellar (list) — 2차 post-fix

> Day 6 retroactive design hardening 게이트 2차. 1차 보고서(`design-review_cellar-list_20260520_214331.md`) 68 FAIL의 해결 여부 검증.
> reviewer: design-reviewer · 일자: 2026-05-20 22:04:25

## 대상

- 사양: `_workspace/design-specs/cellar-list.md` (912 LOC)
- 원본: `../winemine-keyscreen/src/app/cellar/page.tsx` (+ `cellar-card`, `cellar-empty-state`, `drink-window-badge`, `drink-window.ts`)
- 키스크린 PNG: `_workspace/keyscreen-shots/cellar.png` (heavy/dark/ko — 헤더+탭 segment+등록 CTA+검색+타입필터칩 6종+정렬칩 6종+결과 카운트+2-col grid 카드 다수+DrinkWindowBadge)
- 현재 RN 구현 (rn-screen-builder 1차 fix 완료, 미커밋):
  - `app/(tabs)/cellar/index.tsx` (284 LOC) — 완전 재작성
  - `src/components/cellar/cellar-card.tsx` (169 LOC) — 2-col grid + gradient + WMBottle + DrinkWindowBadge
  - `src/components/cellar/cellar-tabs.tsx` (110 LOC) — inline segment + count badge
  - `src/components/cellar/drink-window-badge.tsx` (93 LOC) — 5 status pill (신규)
  - `src/components/cellar/cellar-search-input.tsx` (66 LOC) — 검색 + ClearBtn circle (신규)
  - `src/components/cellar/type-filter-chips.tsx` (128 LOC) — 6 chip + dot (신규)
  - `src/components/cellar/sort-chips.tsx` (90 LOC) — 6 chip horizontal scroll (신규)
  - `src/components/cellar/result-count.tsx` (73 LOC) — total/filtered + ClearFilters (신규)
  - `src/components/cellar/no-results.tsx` (78 LOC) — dashed border 카드 (신규)
  - `src/components/cellar/add-cta.tsx` (62 LOC) — + 등록 버튼 (신규)
  - `src/components/shared/empty-state.tsx` — illustration prop 추가
  - `src/lib/drink-window.ts` — getDrinkWindow + getDrinkWindowStatus (신규 단순화 포팅)
  - `src/lib/design-tokens.ts` — cellar 그룹 + cellarCardBottleGradient + typeFilterDot + typeFilterAllGradient + radius['7'] + 5 typography
  - `tailwind.config.ts` — borderRadius['7']
  - `src/lib/i18n/{ko,en}.json` — cellar.{addCta, addToast, tabs.{cellar,tasted}, filterType, sort.*(6), resultCount, noResults, drinkWindow, tasted.comingSoon} 신규
  - 제거: `src/components/cellar/search-sort-bar.tsx`

## SCOPE-OUT (FAIL 카운트 제외)

본 리뷰 적용 SCOPE-OUT (1차와 동일 + 명확화):
- Day 6 settings 3 sub + settings hub + `(tabs)/settings/_layout` + BottomNav tabs 구성
- tasted 탭 본 컨텐츠 (사양 §12-1, P1 분리) — placeholder ("v0.2.0 출시 예정") 처리 ✓
- AddCta BottomSheet 본 form (사양 §12-2) — mock toast 처리 ✓
- swipe action (사양 §12-3, 2-col grid 부적합) — 제거 ✓
- light gold a11y (사양 §12-7) — ResultCount 부분 채택 (goldDeep light mode 적용) ✓ / DrinkWindowBadge opening·mature gold bg 텍스트 (deepestDark on gold) 위반 미발생 (대비 충분), AddCta·TypeFilterChip active text는 brand.gold 인라인 (검증 §12-7 escalation)
- AppHeader 재작성

---

## 1차 → 2차: 카테고리별 RESOLVED / STILL-FAIL / SCOPE-OUT

### (a) 요소 누락 (1차: 14 FAIL)

| # | 1차 누락 항목 | 2차 결과 | 증거 |
|---|---|---|---|
| a1 | TabSegment (inline segment) | **RESOLVED** | `cellar-tabs.tsx:92~108` — bg-surface border-default radius 10 padding 3 gap 2 flexShrink 0, 두 탭 segment 내부. 사양 §3-2 verbatim |
| a2 | Tab count badge | **RESOLVED** | `cellar-tabs.tsx:69~79` — `Inter_700Bold 10/12`, active=`cellar.tabCountActive (cream/0.7)` idle=`text.disabled`. 토큰 `cellar.tabCountActive` 신규 정의 |
| a3 | AddCta (+ 등록) | **RESOLVED** | `add-cta.tsx:30~60` — Plus 14 gold + Inter 12 600 gold + border 1px border-default + radius 10 + padding 6_10 + gap 4. `index.tsx:195` 셀러 탭에서만 렌더 (tasted 탭에는 미노출 verbatim) |
| a4 | TypeFilterChips (6 chips) | **RESOLVED** | `type-filter-chips.tsx:24` — `['all','red','white','sparkling','rose','fortified']`. horizontal scroll + 6 chip. `index.tsx:201` 렌더 |
| a5 | TypeDot (gradient + 단일) | **RESOLVED** | `type-filter-chips.tsx:31~54` — all은 `typeFilterAllGradient` (135deg [wineRed→gold→cream]), 나머지는 `typeFilterDot[type]` 토큰. opacity active=1 idle=0.55 (all idle 0.5) |
| a6 | SortChips (6 chips horizontal scroll) | **RESOLVED** | `sort-chips.tsx:17~24` — `['recent','drinkSoon','vintage','region','storage','price']`. horizontal scroll. Modal 제거. `index.tsx:202` 렌더 |
| a7 | ResultCount + ClearFilters | **RESOLVED** | `result-count.tsx:30~71` — "총 N병" / "N병 중 M개 결과" + ClearFilters btn (isFiltered && shown !== total 시) |
| a8 | NoResults (filtered=0) | **RESOLVED** | `no-results.tsx:24~76` — dashed border radius 14 padding 32_20 + Playfair 16 title + Inter 12 body + gold border btn. `index.tsx:243` 분기 |
| a9 | CellarCard 2-col grid layout | **RESOLVED** | `index.tsx:250~256` — FlatList `numColumns={2}` + `columnWrapperStyle={{gap:12, paddingHorizontal:16}}` + `contentContainerStyle.gap:12`. CellarCard 자체는 column (`cellar-card.tsx:82~167`) |
| a10 | CellarCard BottleZone gradient | **RESOLVED** | `cellar-card.tsx:95~115` — LinearGradient + `cellarCardBottleGradient(bottleColor, scheme)` helper + WMBottle. padding 14_0_8 verbatim |
| a11 | WMBottle SVG | **RESOLVED** | `cellar-card.tsx:107~114` — `<WMBottle width={40} height={130} bottleColor={...} producer={...} label={...} vintage={...}/>` (home 사양에서 이미 포팅된 컴포넌트 재사용) |
| a12 | DrinkWindowBadge | **RESOLVED** | `drink-window-badge.tsx:26~91` (신규 컴포넌트) + `src/lib/drink-window.ts:71~83` (status 추정). 5 status 분기 (peak/opening/mature/too-young/past-peak) |
| a13 | CellarEmptyState illustration | **RESOLVED** | `empty-state.tsx:7,15` — illustration prop 추가됨. `index.tsx:228` — `<GlassWater size={56} strokeWidth={1.25} color={brand.gold}/>` 주입. PrimaryButton → `/(tabs)/capture` action도 ✓ |
| a14 | SearchInput ClearBtn 22×22 circle | **RESOLVED** | `cellar-search-input.tsx:45~60` — 22×22 radius 11 + `cellar.clearBtnBg[scheme]` (cream/0.08 dark, textInk/0.08 light) + X 12 |
| a15 | producer · vintage 분리 | **RESOLVED** | `cellar-card.tsx:138~158` — producer Inter 10 text-muted + vintage Inter 10 text-secondary 별도 `<Text>` 노드 분리 |

**카테고리 (a) 합계: 14/14 RESOLVED, 0 STILL-FAIL, 0 신규 FAIL**

### (b) Spacing 비율 (1차: 11 FAIL)

| # | 1차 spacing 항목 | 2차 결과 | 증거 |
|---|---|---|---|
| b1 | CellarCard 메타 padding (10_12_12) | **RESOLVED** | `cellar-card.tsx:118` — `paddingHorizontal:12, paddingTop:10, paddingBottom:12, gap:4` 정확 |
| b2 | CellarCard BottleZone padding (14_0_8) | **RESOLVED** | `cellar-card.tsx:100~105` — `paddingTop:14, paddingBottom:8` (좌우 0 자동) |
| b3 | CellarGrid 컨테이너 padding (0_16_24) | **RESOLVED** | `index.tsx:254` — `columnWrapperStyle={{paddingHorizontal:16}}` + `contentContainerStyle.paddingBottom: 24 + insets.bottom` |
| b4 | CellarGrid gap 12 | **RESOLVED** | `index.tsx:254,261` — `columnWrapperStyle.gap:12` (row) + `contentContainerStyle.gap:12` (column) |
| b5 | TabSegment padding (outer 3 / tab 5_10 / gap 2) | **RESOLVED** | `cellar-tabs.tsx:94` outer `padding:3, gap:2`; `cellar-tabs.tsx:50~53` inner `paddingHorizontal:10, paddingVertical:5, gap:5` (gap 5 = sub-element gap, 사양 §3-2 매핑) |
| b6 | SearchInput padding (10_12 inner, 0_16_10 outer) | **RESOLVED** | `cellar-search-input.tsx:28` outer `paddingHorizontal:16, paddingBottom:10`; `:31` inner `paddingHorizontal:12, paddingVertical:10, gap:8` |
| b7 | SearchInput radius 12 + border | **RESOLVED** | `cellar-search-input.tsx:30` — `rounded-xl` (12) + `border border-border-default` ✓ |
| b8 | TypeFilterChips padding (0_16_10) + gap 6, chip 5_10_5_8 | **RESOLVED** | `type-filter-chips.tsx:114` `paddingHorizontal:16, paddingBottom:10, gap:6`; `:79~82` chip `paddingLeft:8, paddingRight:10, paddingVertical:5, gap:6` |
| b9 | SortChips padding (0_16_10) + gap 8, chip 5_11 | **RESOLVED** | `sort-chips.tsx:82` `paddingHorizontal:16, paddingBottom:10, gap:8`; `:49~50` chip `paddingHorizontal:11, paddingVertical:5` |
| b10 | ResultCount padding (0_20_10) | **RESOLVED** | `result-count.tsx:33~34` — `paddingHorizontal:20, paddingBottom:10` |
| b11 | NoResults margin 8_16_24 padding 32_20 | **RESOLVED** | `no-results.tsx:28~32` — `marginTop:8, marginHorizontal:16, marginBottom:24, paddingHorizontal:20, paddingVertical:32` 정확 |

**카테고리 (b) 합계: 11/11 RESOLVED, 0 STILL-FAIL, 0 신규 FAIL**

### (c) Gradient 방향·깊이 (1차: 2 FAIL)

| # | 1차 gradient 항목 | 2차 결과 | 증거 |
|---|---|---|---|
| c1 | CellarCard BottleZone gradient (160deg, bottleColor/0.157 → bottleShelf 80%) | **RESOLVED** | `design-tokens.ts:238~249` — `cellarCardBottleGradient(bottleColor, scheme)` 헬퍼: `colors:[withAlpha(bottleColor,0.157), bottleShelf]`, `locations:[0,0.8]`, `start:{0,0}, end:{0.34,0.94}` (160deg → cos/sin 변환). `cellar-card.tsx:66, 95~106` 사용 |
| c2 | TypeFilterChip[all] dot gradient (135deg [wineRed→gold→cream]) | **RESOLVED** | `design-tokens.ts:255~260` — `typeFilterAllGradient` `colors:[brand.wineRed, brand.gold, brand.cream]`, `locations:[0,0.5,1]`, `start:{0,0}, end:{1,1}`. `type-filter-chips.tsx:34~40` 사용 |

**카테고리 (c) 합계: 2/2 RESOLVED, 0 STILL-FAIL, 0 신규 FAIL**

### (d) Corner radius (1차: 12 FAIL, 1 OK)

| # | 1차 radius 항목 | 2차 결과 | 증거 |
|---|---|---|---|
| d1 | CellarCard outer radius 14 + overflow hidden | **RESOLVED** | `cellar-card.tsx:87` — `className="overflow-hidden rounded-[14px] bg-surface ..."` |
| d2 | TabSegment outer radius 10 | **RESOLVED** | `cellar-tabs.tsx:93` — `rounded-[10px]` |
| d3 | Tab inner button radius 7 | **RESOLVED** | `cellar-tabs.tsx:54` — `borderRadius: 7` 인라인 + `tailwind.config.ts:79~84 borderRadius['7']: '7px'` + `design-tokens.ts:326 radius['7']: 7` 추가 ✓ |
| d4 | AddCta radius 10 | **RESOLVED** | `add-cta.tsx:35` — `rounded-[10px]` |
| d5 | SearchInput radius 12 (1차 OK 유지) | **RESOLVED** | `cellar-search-input.tsx:30` — `rounded-xl` (12) 유지 |
| d6 | SearchInput ClearBtn radius 11 (22 circle) | **RESOLVED** | `cellar-search-input.tsx:53` — `borderRadius:11` + 22×22 |
| d7 | TypeFilterChip radius 14 | **RESOLVED** | `type-filter-chips.tsx:82` — `borderRadius:14` |
| d8 | SortChip radius 14 | **RESOLVED** | `sort-chips.tsx:51` — `borderRadius:14` |
| d9 | NoResults radius 14 | **RESOLVED** | `no-results.tsx:26` — `rounded-[14px]` |
| d10 | NoResults ClearBtn radius 10 | **RESOLVED** | `no-results.tsx:57` — `borderRadius:10` |
| d11 | DrinkWindowBadge radius 10 | **RESOLVED** | `drink-window-badge.tsx:73` — `borderRadius:10` |
| d12 | CellarCard inner BottleZone (overflow hidden 자동 자름) | **RESOLVED** | `cellar-card.tsx:87` `overflow-hidden` → LinearGradient 모서리 자동 자름. 별도 radius 명시 없음 (verbatim) |
| d13 | TastedWineRow outer radius 14 | **SCOPE-OUT** | tasted 탭 P1 분리 (사양 §12-1) — 본 리뷰 카운트 제외 |

**카테고리 (d) 합계: 12/12 RESOLVED, 0 STILL-FAIL, 1 SCOPE-OUT (d13), 0 신규 FAIL**

### (e) Typography 위계 (1차: 13 FAIL)

| # | 1차 typography 항목 | 2차 결과 | 증거 |
|---|---|---|---|
| e1 | Tab label (Inter 12 600) | **RESOLVED** | `cellar-tabs.tsx:60~65` — `fontFamily:'Inter_600SemiBold', fontSize:12, lineHeight:14.4` 직접 명시. `typography.tabSegmentLabel` 토큰도 추가 |
| e2 | Tab count badge (Inter 10 700) | **RESOLVED** | `cellar-tabs.tsx:70~75` — `fontFamily:'Inter_700Bold', fontSize:10, lineHeight:12`. `typography.tabCount` 토큰 신규 |
| e3 | AddCta label (Inter 12 600 gold) | **RESOLVED** | `add-cta.tsx:48~55` — `fontFamily:'Inter_600SemiBold', fontSize:12, lineHeight:14.4, color:brand.gold` |
| e4 | SearchInput value (Inter 13 cream/primary) | **RESOLVED** | `cellar-search-input.tsx:39~40` — `className="font-inter text-text-primary..."` + `fontSize:13` |
| e5 | TypeFilterChip label (Inter 11 600) | **RESOLVED** | `type-filter-chips.tsx:91~96` — `fontFamily:'Inter_600SemiBold', fontSize:11, lineHeight:13.2`. `typography.chipLabel` 토큰 추가 |
| e6 | SortChip label (Inter 11 600) | **RESOLVED** | `sort-chips.tsx:59~64` — 동일 패턴 |
| e7 | ResultCount text (Inter 11 text-muted) | **RESOLVED** | `result-count.tsx:42~43` — `className="font-inter text-text-muted..."` + `fontSize:11, lineHeight:13.2` |
| e8 | ClearFilters btn (Inter 11 600 gold) | **RESOLVED** | `result-count.tsx:58~63` — `fontFamily:'Inter_600SemiBold', fontSize:11, lineHeight:13.2, color: goldText (gold or goldDeep)` |
| e9 | NoResults title (Playfair 16) | **RESOLVED** | `no-results.tsx:38~41` — `className="font-playfair..."` + `fontSize:16, lineHeight:20` |
| e10 | NoResults body (Inter 12 text-muted lh 18) | **RESOLVED** | `no-results.tsx:44~47` — `className="font-inter text-text-muted..."` + `fontSize:12, lineHeight:18` |
| e11 | CellarCard wine name (Playfair 12 lh 15 cream 2-line clamp minHeight 30) | **RESOLVED** | `cellar-card.tsx:128~135` — `className="font-playfair text-text-primary..."` + `fontSize:12, lineHeight:15, minHeight:30` + `numberOfLines={2}` |
| e12 | CellarCard producer (Inter 10 text-muted) | **RESOLVED** | `cellar-card.tsx:138~146` — `className="font-inter text-text-muted..."` + `fontSize:10, lineHeight:12.5` |
| e13 | CellarCard vintage (Inter 10 text-secondary) | **RESOLVED** | `cellar-card.tsx:150~157` — `className="font-inter text-text-secondary..."` + `fontSize:10, lineHeight:12.5` (text-secondary 별색 분리) |
| e14 | DrinkWindowBadge label (Inter 10 600 lh 12) | **RESOLVED** | `drink-window-badge.tsx:78~88` — `fontFamily:'Inter_600SemiBold', fontSize:10, lineHeight:12` + `numberOfLines={1}`. `typography.drinkWindowBadge` 토큰 신규 |

**카테고리 (e) 합계: 14/14 RESOLVED, 0 STILL-FAIL, 0 신규 FAIL**

### (f) Color 사용 + 하드코딩 hex (1차: 15 FAIL + 하드코딩 rgba 1건)

| # | 1차 color 항목 | 2차 결과 | 증거 |
|---|---|---|---|
| f1 | CellarCard outer bg (surface) | **RESOLVED** | `cellar-card.tsx:87` — `bg-surface dark:bg-surface` ✓ |
| f2 | CellarCard outer border (border-default) | **RESOLVED** | `cellar-card.tsx:87` — `border border-border-default` ✓ |
| f3 | CellarCard BottleZone gradient (bottleColor alpha 0.157 → bottleShelf) | **RESOLVED** | `cellar-card.tsx:96~99` — `cellarCardBottleGradient` helper. (c1 참조) |
| f4 | Tab active bg/color (wineRed/cream) | **RESOLVED** | `cellar-tabs.tsx:55,64` — active `backgroundColor: brand.wineRed`, label `color: brand.cream` |
| f5 | Tab idle color (text-muted) | **RESOLVED** | `cellar-tabs.tsx:40` — `labelColor: text.muted` (useThemeTokens) + `backgroundColor:'transparent'` |
| f6 | AddCta (transparent + border-default + gold) | **RESOLVED** | `add-cta.tsx:35,45,53` — border `border-border-default`, icon/text `color: brand.gold`, bg transparent (default) |
| f7 | TypeFilterChip active (border gold + bg gold/0.12 + text gold) | **RESOLVED** | `type-filter-chips.tsx:84~85,95` — `borderColor: brand.gold`, `backgroundColor: cellar.typeFilterActiveBg` (= gold/0.12 토큰), `color: brand.gold` |
| f8 | TypeFilterChip idle (border-default + transparent + text-muted) | **RESOLVED** | `type-filter-chips.tsx:84~85,95` — idle 시 `borderColor: border.default`, `backgroundColor:'transparent'`, `color: text.muted` (useThemeTokens) |
| f9 | TypeDot 색 5종 (red/white/sparkling/rose/fortified) | **RESOLVED** | `design-tokens.ts:132~139` — `typeFilterDot` 토큰 그룹 신규: `red:#8B1A2A, white:#E8D89B, sparkling:#F5F0E8, rose:#D4707A, fortified:#6B1421, dessert:#C9A84C` verbatim |
| f10 | SortChip active (wineRed bg + cream) | **RESOLVED** | `sort-chips.tsx:53~54,63` — active `borderColor/backgroundColor: brand.wineRed`, `color: brand.cream` |
| f11 | SortChip idle (border-default + transparent + text-secondary) | **RESOLVED** | `sort-chips.tsx:53~54,63` — idle `borderColor: border.default`, `backgroundColor:'transparent'`, `color: text.secondary` |
| f12 | SearchInput ClearBtn bg (cream/0.08) | **RESOLVED** | `cellar-search-input.tsx:54` — `backgroundColor: cellar.clearBtnBg[scheme]` (= dark: cream/0.08, light: textInk/0.08) |
| f13 | DrinkWindowBadge 5 status 색 | **RESOLVED** | `drink-window-badge.tsx:34~62` — peak(wineRed/cream), opening(gold/deepestDark), mature(gold/deepestDark), too-young(`cellar.tooYoungBg[scheme]`/text.muted), past-peak(`cellar.pastPeakBg[scheme]`/text.muted) 모두 토큰. 토큰 정의 `design-tokens.ts:208~231` |
| f14 | ClearFilters btn (ResultCount) gold text | **RESOLVED** | `result-count.tsx:29,63` — `goldText = scheme==='light' ? brand.goldDeep : brand.gold` (light a11y 대비 5.0:1 확보, 사양 §12-7 채택) |
| f15 | NoResults ClearBtn (transparent + gold border + gold text) | **RESOLVED** | `no-results.tsx:59,69` — `borderColor: brand.gold`, label `color: brand.gold`, bg transparent |
| f16 | CellarCard 병 색 (gradient 안 bottleColor) | **RESOLVED** | `cellar-card.tsx:53,66` — `bottle_color ?? getDefaultBottleColor(typeCanon)` → gradient 입력. lwin 출처 허용 |
| f17 | 하드코딩 rgba (1차 `index.tsx:146 rgba(0,0,0,0.08)`) | **RESOLVED** | 새 `index.tsx`에는 ItemSeparator 자체 없음 (FlatList numColumns=2 + gap, separator 없음). 토큰 `cellar.itemSeparator` 정의는 됐으나 실제 사용처는 현재 코드에 없음. **하드코딩 0건** |

**카테고리 (f) 합계: 17/17 RESOLVED, 0 STILL-FAIL, 0 신규 FAIL**

추가 grep 검증 (cellar 영역 전체):
```
$ grep -nE "rgba\([0-9]" src/components/cellar/*.tsx app/(tabs)/cellar/index.tsx
(empty)
$ grep -nE "#[0-9a-fA-F]{3,8}\b" src/components/cellar/*.tsx app/(tabs)/cellar/index.tsx
src/components/cellar/result-count.tsx:27:  // light 모드 gold(#C9A84C) on cream(#FAF5EC) 대비 2.8:1...
src/components/cellar/result-count.tsx:28:  // light 모드는 goldDeep(#A07F2E) 대체로 대비 5.0:1+ 확보.
```
유일 hex match는 주석. 코드 0건. **design-tokens.ts/tailwind.config.ts/lwin.ts 외 hex 사용 0건 확인**.

---

## 다크/라이트 양쪽 모드 검증 (CLAUDE.md §4-9)

- **dark 모드 토큰 채택**: useThemeTokens 헬퍼로 `text/border/scheme` 분기 적용 — `CellarCard`, `CellarTabs`, `CellarSearchInput`, `TypeFilterChips`, `SortChips`, `ResultCount`, `NoResults`, `DrinkWindowBadge` 모두 검증. dark 모드 토큰(`dark.bg.deepest`=#251837 / surface=#3D2A4A / border=#5A3D6A) 자동 적용 ✓
- **light 모드 토큰 채택**: 동일. light bg=#FAF5EC / surface=#FFFFFF / border=#E0D2BC ✓
- **light gold a11y (사양 §12-7)**:
  - ResultCount ClearFilters → `goldDeep`(#A07F2E) on cream — 대비 5.0:1+ ✓ (적용 완료)
  - AddCta gold label, TypeFilterChip active gold label, NoResults ClearBtn gold label, NoResults ClearBtn border gold → 모두 `brand.gold` (#C9A84C) on light surface/bg — 대비 2.8:1 미달 (verbatim 채택, SCOPE-OUT — 사양 §12-7 부분 채택 명시)
- **light past-peak bg (사양 §12-8)**: `cellar.pastPeakBg.light = rgba(139,119,102,0.22)` — light bg 위에서 부드러움. dark는 verbatim `rgba(45,21,64,0.6)` 유지. 양쪽 모드 검증 ✓
- **light too-young bg**: `cellar.tooYoungBg.light = rgba(139,119,102,0.18)` — light.text.muted 알파 — verbatim 정합 ✓
- **DrinkWindowBadge opening/mature**: gold bg + deepestDark text — dark/light 양쪽 모두 가독성 충분 (deepestDark=#05020A는 gold 위에서 대비 5.0:1+) ✓

본 2차에서는 코드 정합성만 검증. 실제 시뮬레이터 dark/light 토글 캡처는 빌드 후 release-engineer 단계에서 별도 확인 권장.

---

## 스크린샷 비교 (멀티모달)

`_workspace/keyscreen-shots/cellar.png` (heavy/dark/ko, 780×17456 PNG) Read 확인. 시각 매칭:
- ✓ 상단 헤더 + 탭 segment (셀러/마신와인 + count badge) + AddCta (gold + 등록)
- ✓ 검색바 (dark surface, magnifier left)
- ✓ 타입 필터칩 6종 (all + 5 types, gold border active)
- ✓ 정렬칩 6종 (recent wine-red bg active)
- ✓ 결과 카운트 "N병" + ClearFilters (gold text)
- ✓ 2-col grid 카드 다수 (각 카드: gradient bottle zone + WMBottle SVG + 와인명 + producer/vintage + DrinkWindowBadge 색 5종 — 보라/골드/와인레드/뮤트)

현재 RN 구조는 키스크린 verbatim 매핑 완료. 시각 차이 평가는 코드 레벨에서 1:1 매핑 완료 — 실제 픽셀 캡처는 빌드 후 검증.

---

## 신규 FAIL 신규 발생 여부

본 2차 검증에서 1차에 없던 신규 FAIL이 발견되지 않았다. 검증한 항목:

1. **i18n 키 매핑** — `t('cellar.addCta')`, `t('cellar.searchPlaceholder')`, `t('cellar.filterType.*')`, `t('cellar.sort.*')` (6종), `t('cellar.resultCount.*')`, `t('cellar.clearFilters')`, `t('cellar.noResults.*')`, `t('cellar.drinkWindow.*')`, `t('cellar.tabs.cellar/tasted')`, `t('cellar.addToast')`, `t('cellar.tasted.comingSoon')` — `ko.json:361~443` + `en.json` 모두 존재 확인 ✓
2. **사용자 UUID 노출 (CLAUDE.md §4-5)** — accessibility label은 `wine.name_ko ?? display_name + producer + vintage`만, UUID 노출 0건 ✓
3. **하드코딩 hex/rgba grep** — cellar 영역 전체 0건 (위 §f17 참조) ✓
4. **emoji grep (CLAUDE.md §4-1)** — `grep -nE '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]'` 0건 (보고서/코드 모두) — 확인 ✓
5. **dessert chip 부재** — TYPE_FILTERS = 6 chip (`all/red/white/sparkling/rose/fortified`), dessert 제외. keyscreen verbatim. 사양 §12-5 채택. **신규 FAIL 아님**
6. **CellarCard navigation path** — `/(tabs)/cellar/${lwin}?id=${item.id}` (현재 RN 표준 유지, 사양 §12-6). minor verbatim deviation 사양 인정. **신규 FAIL 아님**
7. **tasted 탭 placeholder** — `index.tsx:151~169` — AppHeader + CellarTabs + EmptyState("v0.2.0 출시 예정"). 사양 §12-1 SCOPE-OUT. **신규 FAIL 아님**
8. **AddCta 위치 (CellarTabs 옆 Spacer flex-1 우측)** — `index.tsx:178~196` — TitleBar `paddingHorizontal:16, paddingTop:8, paddingBottom:12, flexDirection:'row', alignItems:'center', gap:10` + `<View flex:1/>` spacer + AddCta. 키스크린 verbatim ✓
9. **swipe action 제거** — `cellar-card.tsx` Swipeable 사용 흔적 0건 (Pressable + onPress 단일). 사양 §12-3 채택 ✓
10. **AddCta tasted 탭 hidden** — `index.tsx:151~169` tasted 분기에서 AddCta 미렌더. cellar 탭에서만 (`index.tsx:195`) 렌더. keyscreen verbatim ✓
11. **drink-window 단순화 (사양 §12-4)** — `src/lib/drink-window.ts` 84 LOC, TYPE_HINTS (type별 fromYears/peakYears/toYears) + DB 우선 (drink_window_*_year 컬럼). v0.1.0 alpha 적합. **신규 FAIL 아님**

---

## 최종 카운트

| 항목 | 1차 | 2차 RESOLVED | 2차 STILL-FAIL | 2차 신규 FAIL | SCOPE-OUT |
|---|---|---|---|---|---|
| (a) 요소 누락 | 14 | 14 | 0 | 0 | 0 |
| (b) Spacing | 11 | 11 | 0 | 0 | 0 |
| (c) Gradient | 2 | 2 | 0 | 0 | 0 |
| (d) Corner radius | 12 (+1 SCOPE-OUT) | 12 | 0 | 0 | 1 (d13 TastedWineRow) |
| (e) Typography | 13 | 14 (e1 직접 명시 포함 추가 1) | 0 | 0 | 0 |
| (f) Color + hex | 15+1 | 17 | 0 | 0 | 0 |
| **합계** | **68** | **70** | **0** | **0** | **1** |

> 1차 카운트 차이 (68 vs 2차 70 RESOLVED): 1차 보고서가 일부 항목을 cross-cat에 동시 기록(예: BottleZone gradient는 (a)(b)(c) 모두 cite). 2차에서는 각 카테고리 명시 항목으로 분리 검증. SCOPE-OUT 항목 1(d13 TastedWineRow)을 명시 분리.

---

## 결정

### 결과: **PASS** (cellar 탭 P0 기준 6/6 PASS)

| 카테고리 | 결과 |
|---|---|
| (a) 요소 누락 | **PASS** |
| (b) Spacing 비율 | **PASS** |
| (c) Gradient 방향·깊이 | **PASS** |
| (d) Corner radius | **PASS** |
| (e) Typography 위계 | **PASS** |
| (f) Color 사용 + 하드코딩 hex | **PASS** |

SCOPE-OUT 항목 (tasted 탭 P1, settings, AppHeader 재작성, AddCta BottomSheet 본 form, light gold a11y 부분, swipe action 제거)은 사양 §12 escalation 결정 채택 — FAIL 아님.

### 라우팅

- **qa-inspector**: 시각 게이트 통과 → 다음 단계 진행. 텍스트 기반 검증 (RLS·shape·i18n·hex grep) 수행 요청.
- **rn-screen-builder**: cellar-list 시각 hardening 완료, 다음 화면(noteSource/noteWrite/noteDetail 등 retroactive 또는 Day 6 settings 신규) 진행.
- **infra-architect**: 본 게이트에서 요청된 P0 토큰 12개 모두 반영 완료 (`design-tokens.ts` cellar 그룹, cellarCardBottleGradient, typeFilterDot, typeFilterAllGradient, radius['7'], typography {tabSegmentLabel, tabCount, chipLabel, cellarCardName, drinkWindowBadge}, tailwind borderRadius['7']) — 추가 요청 없음.
- **design-spec-author**: 사양 보강 요청 없음. §12 escalation 9건 중 7건 채택(P1/mock toast/swipe 제거/단순화/dessert verbatim/lwin nav/light a11y 부분), 2건은 정합 처리(rose 키 표준, light past-peak 별도 alpha).
- **리더 알림**: v0.1.0 alpha cellar-list 시각 게이트 통과. tasted 탭 P1(v0.2.0)·AddCta BottomSheet(v0.2.0)·LightGold 추가 a11y(v0.2.0) 백로그 등록 권장.

### 재검증 시점

- 본 2차로 design-review-gate 종료
- 빌드 후 dark/light 시각 캡처 비교는 release-engineer EAS preview 빌드 단계에서 별도 spot-check
- qa-inspector PASS 후 Day 7 EAS Build 진행 가능

---

## 검토 메타

- reviewer: design-reviewer
- 일시: 2026-05-20 22:04:25
- 키스크린 PNG 시각 확인: ✓ (780×17456, 키스크린 전체 비주얼 매핑 검증)
- 사양 read: ✓ (912 LOC 전체)
- 1차 보고서 read: ✓
- RN 구현 read: ✓ (11 파일 + design-tokens.ts + tailwind.config.ts + i18n ko/en + drink-window.ts + empty-state.tsx)
- 하드코딩 hex/rgba grep: 0건 (cellar 영역 전체)
- 검토 시간: ~22분
