# cellar-list (`/(tabs)/cellar`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen messages (`messages/{ko,en}.json`) > design-system docs > 우리 design-tokens.
> 작성일: 2026-05-20 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/cellar/page.tsx` (893 lines — `CellarListPage` + 인라인 `TastedWinesList` / `TastedWineRow` / `TypeDot` / `NoResults` / `WineTypeDotSmall`)
- 자식 컴포넌트 (재귀 read 4개):
  - `../winemine-keyscreen/src/components/cellar/cellar-card.tsx` (115 LOC — `CellarCard` Link 카드)
  - `../winemine-keyscreen/src/components/cellar/cellar-empty-state.tsx` (24 LOC — `CellarEmptyState` (GlassWater 아이콘 + EmptyState))
  - `../winemine-keyscreen/src/components/cellar/drink-window-badge.tsx` (66 LOC — 5 status pill)
  - `../winemine-keyscreen/src/components/shared/{wm-bottle, wm-glass-rating, locale-text, empty-state, primary-button}.tsx`
- 도메인 lib:
  - `../winemine-keyscreen/src/lib/drink-window.ts` (202 LOC — `getDrinkWindow` + `getDrinkWindowStatus`)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- i18n: `../winemine-keyscreen/messages/{ko,en}.json` (네임스페이스 `cellar.*` line 129~200)
- 스크린샷 reference: `_workspace/keyscreen-shots/cellar.png` (heavy 모드, dark, ko — 헤더 + 탭(셀러/마신와인) 세그먼트 + 등록 CTA + 검색 + 타입 필터 칩 6종 + 정렬 칩 6종 + 결과 카운트 + 2-col 그리드 (병+드링킹윈도우 chip 다수))
- 현재 RN 구현 (retroactive 대상): `app/(tabs)/cellar/index.tsx` (160 LOC) + `src/components/cellar/{cellar-card, cellar-tabs, search-sort-bar, cellar-fields}.tsx` (~330 LOC 합계)

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/(tabs)/cellar/index.tsx` |
| 진입 경로 | `/(tabs)/cellar` (BottomNav 셀러 탭) |
| 헤더 | 화면 내부 `<AppHeader />` (logo + bell + LevelChip/Avatar) — keyscreen line 146~150 동일 패턴 (home과 공유) |
| BottomNav | **표시함** — Expo Router `(tabs)` 그룹, 셀러 탭 active |
| 가드 | 없음 — 익명 로그인 자동, anonymous user는 셀러 0개로 empty 분기 |
| 다크/라이트 | 둘 다 지원 |
| 탭 분기 | `cellar` (셀러 보관 중 와인) vs `tasted` (마신 와인 — tasting_notes 기반 dedup) — 같은 route, 컨텐츠만 분기 |

> **현재 RN 차이**: 우리는 `cellared` / `consumed` (cellar_items.status) — keyscreen은 `cellar` / `tasted` (tasted는 cellar_items가 아니라 tasting_notes wine dedup). **키스크린 verbatim 적용 시 데이터 모델 차이 발생** — §9 의제로 escalate.

---

## 2. Layout Tree (verbatim 변환)

keyscreen `page.tsx` 라인 144~449 그대로 RN 트리화. status `cellar`(보관 중) 분기 기준.

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── AppHeader                                              ← 고정, scroll 외부 (home 사양 §3-1 참조 — keyscreen 동일)
│     ├── Logo zone
│     ├── Spacer
│     ├── BellButton
│     └── LevelChip (heavy) OR Avatar (first-time)
├── ScrollView (flex-1, refreshControl, contentContainerStyle.paddingBottom 32)
│     │
│     ├── TitleBar (p=8_16_12, flex row items-center gap=10)             ← keyscreen line 153~242
│     │     ├── TabSegment (inline-flex, bg-surface, border-default, radius=10, p=3, gap=2, flexShrink=0)
│     │     │     ├── Tab[cellar]  (active: bg-wine-red + text-cream / idle: transparent + text-muted)
│     │     │     │     - padding 5_10, radius 7
│     │     │     │     - label "내 셀러" (Inter 12 600)
│     │     │     │     - count badge (Inter 10 700) — active: cream alpha 0.7 / idle: text-disabled
│     │     │     └── Tab[tasted]  (동일 패턴)
│     │     │           - label "마신 와인" (i18n: `cellar.tabs.tasted` — keyscreen은 inline ko/en)
│     │     ├── Spacer flex-1
│     │     └── AddCta (cellar 탭일 때만 노출)
│     │           - inline-flex items-center gap=4, padding 6_10
│     │           - radius 10, border 1px border-default, bg transparent
│     │           - Plus icon 14, gold color
│     │           - label "+ 등록" (Inter 12 600 gold)
│     │           - onPress → toast `cellar.addToast` ("셀러 등록은 추후") — keyscreen mock; RN은 신규 BottomSheet trigger 또는 toast 유지 (§5 결정)
│     │
│     ├── [cellar 탭: hasAnyItems=false]
│     │     └── CellarEmptyState (m=auto 또는 inline EmptyState)
│     │           - illustration: GlassWater icon size=56 strokeWidth=1.25
│     │           - title (i18n: `cellar.empty.title`)
│     │           - description (i18n: `cellar.empty.sub`)
│     │           - action: PrimaryButton variant=primary → router.push('/capture')
│     │                 label (i18n: `cellar.empty.cta`)
│     │
│     ├── [cellar 탭: hasAnyItems=true]
│     │     │
│     │     ├── SearchInput (p=0_16_10)                                  ← keyscreen line 255~309
│     │     │     └── Box (flex row items-center gap=8, p=10_12, bg-surface, border-default, radius=12)
│     │     │           ├── Search icon 16, color text-muted
│     │     │           ├── TextInput (flex-1, transparent, Inter 13 cream)
│     │     │           │     - placeholder `cellar.searchPlaceholder` ("와인·생산자·지역·품종·빈티지 검색")
│     │     │           └── ClearBtn (query.length>0 시) — 22×22 circle, bg cream/0.08, X icon 12
│     │     │
│     │     ├── TypeFilterChips (p=0_16_10, horizontal scroll, gap=6)    ← keyscreen line 312~351
│     │     │     └── Chip × 6 (all / red / white / sparkling / rosé / fortified)
│     │     │           - inline-flex items-center gap=6
│     │     │           - padding 5_10 (좌 8 우 10)
│     │     │           - radius 14
│     │     │           - active: border 1px gold + bg rgba(201,168,76,0.12) + text gold
│     │     │           - idle:   border 1px border-default + bg transparent + text text-muted
│     │     │           - TypeDot (8×8 radius 4, type별 색 / all은 gradient 135deg [wine-red→gold→cream]) — 비활성 opacity 0.55 / all idle opacity 0.5
│     │     │           - label (i18n: `cellar.filterType.{all|red|white|sparkling|rosé|fortified}`)
│     │     │           - Inter 11 600
│     │     │
│     │     ├── SortChips (p=0_16_10, horizontal scroll, gap=8)          ← keyscreen line 354~386
│     │     │     └── Chip × 6 (recent / drinkSoon / vintage / region / storage / price)
│     │     │           - padding 5_11
│     │     │           - radius 14
│     │     │           - active: bg wine-red + text cream
│     │     │           - idle: border 1px border-default + bg transparent + text text-secondary
│     │     │           - label (i18n: `cellar.sort.{key}`)
│     │     │           - Inter 11 600
│     │     │
│     │     ├── ResultCount (p=0_20_10, flex row items-center justify-between, Inter 11 text-muted) ← keyscreen line 389~424
│     │     │     ├── Left text — `cellar.resultCount.{total|filtered}` i18n
│     │     │     │     - total: "총 {total}병"
│     │     │     │     - filtered: "{total}병 중 {shown}개 결과"
│     │     │     └── ClearFiltersBtn (isFiltered && items.length !== rawItems.length 시)
│     │     │           - Inter 11 600 gold
│     │     │           - label `cellar.clearFilters` ("필터 지우기")
│     │     │
│     │     ├── [items.length === 0]
│     │     │     └── NoResults (m=8_16_24, p=32_20, border 1px DASHED border-default, radius=14, text-center) ← keyscreen line 846~892
│     │     │           ├── title (Playfair 16 cream) `cellar.noResults.title` ("일치하는 와인이 없어요")
│     │     │           ├── body (Inter 12 text-muted lh 1.5 mb=14) `cellar.noResults.body`
│     │     │           └── ClearFiltersBtn (p=8_16, radius=10, border 1px gold, transparent, Inter 12 600 gold)
│     │     │
│     │     └── [items.length > 0]
│     │           └── CellarGrid (2-col, gap=12, p=0_16_24)                ← keyscreen line 430~443
│     │                 └── CellarCard × N
│     │                       - 자세한 구조 §3-5 참조
│     │
│     └── [tasted 탭]
│           └── TastedWinesList (keyscreen line 454~552)
│                 ├── SearchInput (cellar 탭과 동일, placeholder만 다름)
│                 │     - placeholder "이름·생산자·지역·빈티지" (inline {ko,en})
│                 ├── ResultMeta (p=0_20_10, Inter 11 text-muted)
│                 │     - "{N}병 시음 기록" / "{N} tasting records"
│                 ├── [filtered.length === 0]
│                 │     └── NoResults inline (p=32_20, text-center, text-muted 13)
│                 │           - "검색 결과가 없어요" / "No results found"
│                 └── [filtered.length > 0]
│                       └── List (column, gap=8, p=0_16_24)
│                             └── TastedWineRow × N (§3-6 자세히)
└── BottomNav (5 tabs, 셀러 active) ← Expo Router 자동 렌더
```

---

## 3. NativeWind 매핑표

각 요소의 keyscreen 인라인 style → RN+NW v4 className/style. 토큰은 `src/lib/design-tokens.ts` + `tailwind.config.ts` 기준. home/wine-detail/capture 사양과 공통인 항목은 간략 표기.

### 3-1. AppHeader (공통 — home 사양 §3-1 동일)

home 사양 그대로. cellar 화면 진입 시 셀러 탭 active — 헤더 자체는 변동 없음.

### 3-2. TabSegment (셀러 탭 ↔ 마신 와인 탭)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Segment outer | `display flex; bg var(--color-surface); border 1px var(--color-border-default); borderRadius 10; padding 3; gap 2; flexShrink 0` | `<View className="flex-row rounded-[10px] bg-surface dark:bg-surface border border-border-default p-[3px]" style={{gap:2, flexShrink:0}}>` |
| Tab button (active) | `padding 5px 10px; borderRadius 7; border none; bg var(--color-wine-red); color var(--color-cream); Inter 12 600; inline-flex items-center gap 5; whiteSpace nowrap; transition bg/color 150ms ease` | `<Pressable accessibilityRole="tab" accessibilityState={{selected:true}} onPress={...} className="flex-row items-center rounded-[7px]" style={{paddingHorizontal:10, paddingVertical:5, backgroundColor:brand.wineRed, gap:5}}>` + `<Text className="font-inter-semibold text-[12px]" style={{color:brand.cream}}>{label}</Text>` |
| Tab button (idle) | `bg transparent; color var(--color-text-muted)` | 동일 Pressable; `style={{paddingHorizontal:10, paddingVertical:5, backgroundColor:'transparent', gap:5}}>` + `<Text className="font-inter-semibold text-[12px] text-text-muted dark:text-text-muted">{label}</Text>` |
| Count badge (active) | `Inter 10 700; color rgba(245,240,232,0.7)` | `<Text className="font-inter-bold text-[10px]" style={{color:withAlpha(brand.cream, 0.7)}}>{count}</Text>` |
| Count badge (idle) | `Inter 10 700; color var(--color-text-disabled)` | `<Text className="font-inter-bold text-[10px] text-text-disabled dark:text-text-disabled">{count}</Text>` |
| transition 150ms | CSS | Reanimated `useAnimatedStyle`로 backgroundColor/color withTiming 150 — 또는 단순 인스턴트 (§8 deviation) |

### 3-3. AddCta (등록 버튼)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Button outer | `inline-flex items-center gap 4; padding 6 10; borderRadius 10; border 1px var(--color-border-default); bg transparent; color var(--color-gold); Inter 12 600; cursor pointer` | `<Pressable accessibilityRole="button" onPress={onAdd} className="flex-row items-center rounded-[10px] border border-border-default" style={{paddingHorizontal:10, paddingVertical:6, gap:4}}>` |
| Plus icon | lucide `<Plus size=14 strokeWidth=2/>` | `<Plus size={14} strokeWidth={2} color={brand.gold}/>` |
| label | text inline | `<Text className="font-inter-semibold text-[12px]" style={{color:brand.gold}}>{t('cellar.addCta')}</Text>` |

### 3-4. SearchInput (셀러 탭, 마신 탭 공용)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Padding wrapper | `padding 0 16 10` | `<View className="px-4 pb-2.5">` |
| Search box | `flex items-center gap 8; padding 10 12; bg var(--color-surface); border 1px var(--color-border-default); borderRadius 12` | `<View className="flex-row items-center bg-surface dark:bg-surface border border-border-default rounded-xl" style={{paddingHorizontal:12, paddingVertical:10, gap:8}}>` |
| Search icon | lucide `<Search size=16 color="var(--color-text-muted)"/>` | `<Search size={16} strokeWidth={2} color={currentTextMuted}/>` (useThemeTokens) |
| TextInput | `flex 1; bg transparent; border none; outline none; color var(--color-cream); Inter 13; padding 0; minWidth 0` | `<TextInput value={query} onChangeText={setQuery} placeholder={t('cellar.searchPlaceholder')} placeholderTextColor={currentTextDisabled} className="flex-1 font-inter text-[13px] text-text-primary dark:text-text-primary" style={{padding:0, minWidth:0}} accessibilityLabel={t('cellar.searchPlaceholder')}/>` |
| ClearBtn | 22×22 circle, `bg rgba(245,240,232,0.08); border none; borderRadius 11; color var(--color-text-secondary); padding 0` | `<Pressable onPress={()=>setQuery('')} accessibilityRole="button" accessibilityLabel={t('cellar.clearSearch')} hitSlop={8} className="items-center justify-center rounded-full" style={{width:22, height:22, backgroundColor: withAlpha(brand.cream, 0.08)}}>` + `<X size={12} strokeWidth={2.25} color={currentTextSecondary}/>` |

### 3-5. TypeFilterChips (6종) + TypeDot

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Row | `flex; gap 6; padding 0 16 10; overflowX auto; WebkitOverflowScrolling touch` | `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16, paddingBottom:10, gap:6}}>` |
| Chip (active) | `flexShrink 0; inline-flex items-center gap 6; padding 5 10 5 8; borderRadius 14; border 1px var(--color-gold); bg rgba(201,168,76,0.12); color var(--color-gold); Inter 11 600; whiteSpace nowrap` | `<Pressable accessibilityRole="button" accessibilityState={{selected:true}} onPress={()=>setTypeFilter(tf)} className="flex-row items-center rounded-[14px] border" style={{flexShrink:0, paddingLeft:8, paddingRight:10, paddingVertical:5, gap:6, borderColor:brand.gold, backgroundColor:withAlpha(brand.gold, 0.12)}}>` |
| Chip (idle) | `border 1px var(--color-border-default); bg transparent; color var(--color-text-muted)` | 동일 Pressable; `style={{...borderColor:currentBorderDefault, backgroundColor:'transparent'}}>` |
| TypeDot (all, gradient) | 8×8 radius 4, `background linear-gradient(135deg, #8B1A2A 0%, #C9A84C 50%, #F5F0E8 100%)`, opacity active=1 idle=0.5 | `<LinearGradient colors={[brand.wineRed, brand.gold, brand.cream]} locations={[0, 0.5, 1]} start={{x:0,y:0}} end={{x:1,y:1}} style={{width:8, height:8, borderRadius:4, opacity: active?1:0.5}}/>` |
| TypeDot (단일 색) | 8×8 radius 4, `background color[type]`, opacity active=1 idle=0.55 | `<View style={{width:8, height:8, borderRadius:4, backgroundColor: typeDotColors[type], opacity: active?1:0.55}}/>` |
| label | text | `<Text className="font-inter-semibold text-[11px]" style={{color: active?brand.gold:currentTextMuted}}>{t(`cellar.filterType.${tf}`)}</Text>` |

**TypeDot color map (keyscreen line 824~831)** — design-tokens.ts 신규 토큰 `typeFilterDot` 권장 (§9):

```ts
// §9 신규 토큰
const typeFilterDot = {
  red:       '#8B1A2A',   // brand.wineRed (이미 존재)
  white:     '#E8D89B',   // wineTypeDot.white와 다름 (#d6c46b) — verbatim
  sparkling: '#F5F0E8',   // brand.cream (이미 존재)
  rose:      '#D4707A',
  fortified: '#6B1421',
  dessert:   '#C9A84C',   // brand.gold (이미 존재)
} as const;
```

> **주의**: keyscreen에는 TypeDot에 사용된 `#E8D89B`(white), `#F5F0E8`(sparkling=cream), `#D4707A`(rose), `#6B1421`(fortified)이 다른 곳의 `wineTypeDot`(small dot, line 779~786의 `#d6c46b/#e8d690/#e89b9b/#5a2218/#a07030`)과 **다르게 사용**됨. 의도적 차이로 추정 (filter 칩은 더 채도 높음, 작은 dot은 부드러움). **§9 deviation 메모** — verbatim 유지.

### 3-6. SortChips (6종)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Row | `flex; gap 8; padding 0 16 10; overflowX auto` | `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16, paddingBottom:10, gap:8}}>` |
| Chip (active) | `flexShrink 0; padding 5 11; borderRadius 14; border 1px var(--color-border-default); bg var(--color-wine-red); color var(--color-cream); Inter 11 600; whiteSpace nowrap` | `<Pressable accessibilityRole="button" accessibilityState={{selected:true}} onPress={()=>setSort(key)} className="rounded-[14px] border border-border-default" style={{flexShrink:0, paddingHorizontal:11, paddingVertical:5, backgroundColor:brand.wineRed}}>` + `<Text className="font-inter-semibold text-[11px]" style={{color:brand.cream}}>{t(`cellar.sort.${key}`)}</Text>` |
| Chip (idle) | `bg transparent; color var(--color-text-secondary)` | 동일 Pressable; `style={{...backgroundColor:'transparent'}}>` + `<Text className="font-inter-semibold text-[11px] text-text-secondary dark:text-text-secondary">...</Text>` |

### 3-7. ResultCount + ClearFiltersBtn

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Row | `padding 0 20 10; flex row items-center justify-between; Inter 11; color var(--color-text-muted)` | `<View className="flex-row items-center justify-between pb-2.5" style={{paddingHorizontal:20}}>` |
| Left text | inline span | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{isFiltered ? t('cellar.resultCount.filtered', {shown:items.length, total:rawItems.length}) : t('cellar.resultCount.total', {total:rawItems.length})}</Text>` |
| ClearFiltersBtn | `all unset; color var(--color-gold); fontWeight 600; cursor pointer; fontSize 11` | `<Pressable onPress={()=>{setQuery(''); setTypeFilter('all');}} accessibilityRole="button" accessibilityLabel={t('cellar.clearFilters')}>` + `<Text className="font-inter-semibold text-[11px]" style={{color:brand.gold}}>{t('cellar.clearFilters')}</Text>` |

### 3-8. CellarCard (2-col grid item)

keyscreen `src/components/cellar/cellar-card.tsx` 1:1 매핑. **현재 RN CellarCard와 완전히 다른 디자인** — 현재는 행(row) 카드 + swipe; keyscreen은 세로(grid) 카드. **§11 retroactive 대상**.

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| Outer Link | `display flex column; bg var(--color-surface); border 1px var(--color-border-default); borderRadius 14; overflow hidden; textDecoration none` | `<Pressable accessibilityRole="link" onPress={()=>router.push(`/cellar/${item.id}`)} className="overflow-hidden rounded-[14px] bg-surface dark:bg-surface border border-border-default" style={({pressed})=>({opacity:pressed?0.85:1, transform:[{scale:pressed?0.98:1}]})}>` |
| BottleZone | `padding 14 0 8; background linear-gradient(160deg, ${wine.bottleColor}28 0%, var(--color-bottle-shelf) 80%); flex items-center justify-center` | `<LinearGradient colors={[withAlpha(bottleColor, 0.157), currentBottleShelf]} locations={[0, 0.8]} start={{x:0,y:0}} end={{x:0.94, y:0.342}} style={{paddingTop:14, paddingBottom:8, alignItems:'center', justifyContent:'center'}}>` — 160deg = (x:0, y:0)→(x:0.94, y:0.342) (cos/sin) **검토필요 §8** |
| WMBottle | `width 40 height 130` (SVG) | `<WMBottle width={40} height={130} bottleColor={bottleColor} producer={producer.split(' ')[0]} label={name.split(' ')[0]} vintage={vintage}/>` |
| Meta block | `padding 10 12 12; flex column gap 4; minWidth 0` | `<View className="px-3 pt-2.5 pb-3" style={{gap:4, minWidth:0}}>` |
| WineTypeDot | inline-flex gap 4, dot 6×6 radius full, type별 색 | `<View className="flex-row items-center"><View style={{width:6, height:6, borderRadius:9999, backgroundColor:wineTypeDot[type]}}/></View>` — design-tokens.ts `wineTypeDot` 이미 존재 |
| Wine name | Playfair 12 cream lh 1.25, 2줄 clamp, minHeight 30 | `<Text className="font-playfair text-[12px] text-text-primary dark:text-text-primary" style={{lineHeight:15, minHeight:30}} numberOfLines={2}>{name_ko ?? display_name}</Text>` |
| Producer | Inter 10 text-muted | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted" numberOfLines={1}>{producer_name}</Text>` |
| Vintage | Inter 10 text-secondary (inline after `<br>`) | `<Text className="font-inter text-[10px] text-text-secondary dark:text-text-secondary">{vintage}</Text>` |
| DrinkWindowBadge | inline-flex gap 4, padding 3_8, radius 10, bg/color status별, Inter 10 600 lh 1.2 nowrap, mt=4 | §3-9 자세히 |

### 3-9. DrinkWindowBadge (5 status)

keyscreen `src/components/cellar/drink-window-badge.tsx`. status별 색 분기. **신규 컴포넌트 포팅 필요**.

| status | bg | color | label (i18n) |
|---|---|---|---|
| `peak` | `var(--color-wine-red)` | `var(--color-cream)` | `cellar.drinkWindow.peak` ("절정") |
| `opening` | `var(--color-gold)` | `#05020A` (brand.deepestDark) | `cellar.drinkWindow.now` ("지금 마시기 좋아요") |
| `mature` | `var(--color-gold)` | `#05020A` (brand.deepestDark) | `cellar.drinkWindow.mature` ("성숙기") |
| `too-young` | `rgba(155,139,122,0.18)` | `var(--color-text-muted)` | `cellar.drinkWindow.fromYear` ({year:from}) OR `tooYoung` fallback |
| `past-peak` | `rgba(45,21,64,0.6)` | `var(--color-text-muted)` | `cellar.drinkWindow.pastPeak` ("절정 지남") |

RN:
```tsx
<View style={{
  flexDirection:'row', alignItems:'center', gap:4,
  paddingHorizontal:8, paddingVertical:3,
  borderRadius:10,
  backgroundColor: bgByStatus[status],
}}>
  <Text className="font-inter-semibold text-[10px]" style={{color: colorByStatus[status], lineHeight:12}} numberOfLines={1}>
    {label}
  </Text>
</View>
```

**alpha 색 토큰화 §9**:
- `rgba(155,139,122,0.18)` — text-muted alpha (다크 dark.text.muted = `#CABDA8`, 라이트 light.text.muted = `#8B7766` — keyscreen `#9B8B7A`는 light 모드에 가까운 톤이지만 다크 모드에서 사용. **검토 필요 §8 deviation**)
- `rgba(45,21,64,0.6)` — dark bg surface 계열 (keyscreen --color-bg-deep = `#2D1540` alpha 0.6) — **`mapDark.continent` 0.6 동일** — 토큰 재사용

### 3-10. CellarGrid (2-col)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Container | `display grid; gridTemplateColumns 1fr 1fr; gap 12; padding 0 16 24` | `<View className="flex-row flex-wrap px-4" style={{paddingBottom:24, gap:12}}>` — 각 카드 `style={{width:'48%', ...}}` (gap 12 보정) OR FlatList `numColumns={2}` (권장) |
| Card | `<CellarCard>` | 위 §3-8 |

> **FlatList 권장**: keyscreen은 mock 데이터 (~12개) 직접 `.map` 렌더. 우리는 셀러 와인이 50+ 일 수도 있어 `<FlatList numColumns={2} columnWrapperStyle={{gap:12, paddingHorizontal:16}} contentContainerStyle={{gap:12, paddingBottom:24}} data={items} renderItem={({item})=><CellarCard .../>}/>` 사용. **단** keyscreen은 grid 위에 search/filter/sort UI가 있어 ScrollView 필요 — FlatList `ListHeaderComponent`로 검색/필터/정렬을 묶어야 함. Loading/Empty/NoResults도 `ListEmptyComponent`로.

### 3-11. NoResults (검색 결과 0)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Outer | `margin 8 16 24; padding 32 20; text-align center; border 1px DASHED var(--color-border-default); borderRadius 14` | `<View className="rounded-[14px] items-center" style={{marginTop:8, marginHorizontal:16, marginBottom:24, paddingHorizontal:20, paddingVertical:32, borderWidth:1, borderStyle:'dashed', borderColor:currentBorderDefault}}>` |
| Title | Playfair 16 cream mb=6 | `<Text className="font-playfair text-[16px] text-text-primary dark:text-text-primary" style={{marginBottom:6}}>{t('cellar.noResults.title')}</Text>` |
| Body | Inter 12 text-muted lh 1.5 mb=14 | `<Text className="font-inter text-[12px] text-text-muted dark:text-text-muted text-center" style={{lineHeight:18, marginBottom:14}}>{t('cellar.noResults.body')}</Text>` |
| ClearBtn | `all unset; display inline-block; padding 8 16; borderRadius 10; border 1px var(--color-gold); color var(--color-gold); Inter 12 600; bg transparent; cursor pointer` | `<Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel={t('cellar.clearFilters')} className="rounded-[10px] border" style={{paddingHorizontal:16, paddingVertical:8, borderColor:brand.gold}}><Text className="font-inter-semibold text-[12px]" style={{color:brand.gold}}>{t('cellar.clearFilters')}</Text></Pressable>` |

### 3-12. CellarEmptyState (cellar 탭, 셀러 0개)

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| Composition | `<EmptyState illustration=<GlassWater 56 1.25/> title sub action=<PrimaryButton primary onClick→/capture/>>` | `<EmptyState illustration={<GlassWater size={56} strokeWidth={1.25} color={brand.gold}/>} title={t('cellar.empty.title')} description={t('cellar.empty.sub')} action={<PrimaryButton variant="primary" size="md" label={t('cellar.empty.cta')} onPress={()=>router.push('/(tabs)/capture')}/>}/>` |

> `src/components/shared/empty-state.tsx`은 keyscreen 시안 기준 패턴 — illustration은 GlassWater 56 strokeWidth 1.25 gold color로 verbatim 적용. 현재 RN EmptyState는 illustration prop 없을 수 있음 — 확인 후 필요 시 보완. **§9 컴포넌트 보완 요청**.

### 3-13. TastedWineRow (마신 와인 탭 카드)

keyscreen `TastedWineRow` (line 554~768) — 본 화면 가장 무거운 컴포넌트. 와인 정보 + 자기 노트 미리보기 + 액션 3 버튼.

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| Outer Card | `bg var(--color-surface); border 1px var(--color-border-default); borderRadius 14; overflow hidden` | `<View className="overflow-hidden rounded-[14px] bg-surface dark:bg-surface border border-border-default">` |
| Top row (wine info) | `flex gap 12; padding 12; items-center` | `<View className="flex-row items-center p-3" style={{gap:12}}>` |
| WMBottle | `width 36 height 118` | `<WMBottle width={36} height={118} bottleColor={...} producer={producer.ko\|\|producer.en} label={name.split(' ')[0]} vintage={vintage}/>` |
| Meta col | flex 1 minWidth 0 | `<View className="flex-1" style={{minWidth:0}}>` |
| Type dot small + date row | flex items-center gap 6 mb 4 | `<View className="flex-row items-center mb-1" style={{gap:6}}>` |
| WineTypeDotSmall | inline-flex gap 4 — dot 7×7 radius full + label Inter 10 text-muted | `<View className="flex-row items-center" style={{gap:4}}><View style={{width:7, height:7, borderRadius:9999, backgroundColor:wineTypeDotSmall[type]}}/><Text className="font-inter text-[10px] text-text-muted dark:text-text-muted">{t(`wine.type.${type}`)}</Text></View>` — **별도 dot 색 (`#8B1A2A/#d6c46b/#e8d690/#e89b9b/#5a2218/#a07030`)** = `wineTypeDot` 기존 토큰 재사용 가능 |
| Date | inline span, Inter 9 text-disabled, marginLeft auto | `<Text className="font-inter text-[9px] text-text-disabled dark:text-text-disabled" style={{marginLeft:'auto'}}>{tastedAt.slice(0,10)}</Text>` |
| Wine name | Playfair 14 cream lh 1.25, 2줄 clamp | `<Text className="font-playfair text-[14px] text-text-primary dark:text-text-primary" style={{lineHeight:17.5}} numberOfLines={2}>{name_ko ?? display_name}</Text>` |
| Producer · vintage | Inter 11 text-muted mt 2 | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted mt-0.5">{producer_name} · {vintage}</Text>` |
| Region | Inter 10 text-muted mt 2 | `<Text className="font-inter text-[10px] text-text-muted dark:text-text-muted mt-0.5">{region}</Text>` |
| Divider | `height 0.5px; bg var(--color-border-default); margin 0 12` | `<View style={{height: StyleSheet.hairlineWidth, marginHorizontal:12, backgroundColor:currentBorderDefault}}/>` |
| Note preview block | `padding 10 12` | `<View style={{paddingHorizontal:12, paddingVertical:10}}>` |
| Note header row | `flex items-center gap 8 mb 8` | `<View className="flex-row items-center mb-2" style={{gap:8}}>` |
| Pen icon | SVG 11×11 stroke `#C9A84C` 1.6 | lucide `<Pen size={11} strokeWidth={1.6} color={brand.gold}/>` |
| "내 시음 노트" eyebrow | Inter 10 600 gold UPPER ls 0.12em | `<Text className="font-inter-semibold text-[10px] uppercase" style={{color:brand.gold, letterSpacing:1.2}}>{t('cellar.tasted.myNote')}</Text>` |
| Mode badge (expert) | `padding 1 7; radius 999; bg rgba(139,26,42,0.25); color cream; Inter 9 700 ls 0.04em UPPER` | `<View className="rounded-full" style={{paddingHorizontal:7, paddingVertical:1, backgroundColor:withAlpha(brand.wineRed, 0.25)}}>` + `<Text className="font-inter-bold text-[9px] uppercase" style={{color:brand.cream, letterSpacing:0.36}}>{t('cellar.tasted.expert')}</Text>` |
| Mode badge (beginner) | `bg rgba(201,168,76,0.15); color #C9A84C` | 동일 패턴, `backgroundColor:withAlpha(brand.gold, 0.15), color:brand.gold` |
| Rating display | flex-1 spacer + Playfair 13 gold 600 | `<View style={{flex:1}}/><Text className="font-playfair text-[13px]" style={{color:brand.gold, fontWeight:'600'}}>{ratingDisplay}</Text>` — "92/100" or "4/5" |
| WMGlassRating | size=8, `mb=6` (rating>0 시만) | `<View style={{marginBottom:6}}><WMGlassRating value={Math.round(rating)} size={8}/></View>` |
| Aroma hint | Inter 11 text-secondary lh 1.45 mb 8 (있을 때) | `<Text className="font-inter text-[11px] text-text-secondary dark:text-text-secondary" style={{lineHeight:16}} numberOfLines={2}>{aromaHint}</Text>` |
| Expert WSET 4-grid | `display grid gridTemplateColumns repeat(4,1fr) gap 4; padding 8 10; bg var(--color-bg-sunken); borderRadius 8; marginBottom 8` | `<View className="flex-row" style={{gap:4, paddingHorizontal:10, paddingVertical:8, backgroundColor:currentBgSunken, borderRadius:8, marginBottom:8}}>` — 각 dim `flex-1` |
| WSET dim cell | textAlign center, label Inter 8 text-muted UPPER ls 0.04em mb=2, value Playfair 11 cream | `<View className="flex-1 items-center"><Text className="font-inter text-[8px] uppercase text-text-muted dark:text-text-muted" style={{letterSpacing:0.32, marginBottom:2}}>{label}</Text><Text className="font-playfair text-[11px] text-text-primary dark:text-text-primary">{wsetShort(value, locale)}</Text></View>` |
| Action button row | `flex gap 8` (3 buttons) | `<View className="flex-row" style={{gap:8}}>` |
| "노트 보기" Link | `flex 1.4; padding 8 0; borderRadius 8; bg transparent; border 1px #C9A84C; color #C9A84C; Inter 12 600; text-align center` | `<Pressable onPress={()=>router.push(`/notes/${noteId}`)} accessibilityRole="link" className="rounded-lg border items-center" style={{flex:1.4, paddingVertical:8, borderColor:brand.gold}}><Text className="font-inter-semibold text-[12px]" style={{color:brand.gold}}>{t('cellar.tasted.viewNote')}</Text></Pressable>` |
| "편집" button | `flex 1; padding 8 0; borderRadius 8; bg var(--color-bg-deep); border 1px border-default; color text-secondary; Inter 12 600` | `<Pressable onPress={()=>router.push(`/notes/new/write?from=newEntry&wine_lwin=${lwin}&edit=1`)} accessibilityRole="button" className="rounded-lg border border-border-default bg-bg-deep dark:bg-bg-deep items-center" style={{flex:1, paddingVertical:8}}><Text className="font-inter-semibold text-[12px] text-text-secondary dark:text-text-secondary">{t('cellar.tasted.edit')}</Text></Pressable>` |
| "와인 상세" Link | flex 1, 동일 패턴 → `/wine/${lwin}` | `<Pressable onPress={()=>router.push(`/wine/${lwin}`)} accessibilityRole="link" className="rounded-lg border border-border-default bg-bg-deep dark:bg-bg-deep items-center" style={{flex:1, paddingVertical:8}}><Text className="font-inter-semibold text-[12px] text-text-secondary dark:text-text-secondary">{t('cellar.tasted.wineDetail')}</Text></Pressable>` |

### 3-14. TastedWinesList ResultMeta + NoResults inline

| 요소 | keyscreen | RN+NW v4 |
|---|---|---|
| ResultMeta | `padding 0 20 10; Inter 11; color var(--color-text-muted)` | `<View className="pb-2.5" style={{paddingHorizontal:20}}><Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{locale==='ko'?`${filtered.length}병 시음 기록`:`${filtered.length} tasting records`}</Text></View>` — i18n key `cellar.tasted.recordCount` 사용 |
| Inline NoResults | `padding 32 20; text-align center; color text-muted; Inter 13` | `<View className="items-center" style={{paddingHorizontal:20, paddingVertical:32}}><Text className="font-inter text-[13px] text-text-muted dark:text-text-muted">{t('cellar.tasted.noResults')}</Text></View>` |

### 3-15. BottomNav

home 사양 §3-13 동일. cellar 탭 active (gold + bold).

---

## 4. 상태 Variants

### default (cellar 탭, items≥1, dark + ko)
- AppHeader: logo + bell + LevelChip
- TabSegment: active=cellar (wine-red bg) + tasted idle
- AddCta 노출
- SearchInput (query='')
- TypeFilterChips: all active
- SortChips: recent active
- ResultCount: "총 N병"
- 2-col Grid: CellarCard × N

### default (tasted 탭, items≥1, dark + ko)
- TabSegment: active=tasted + cellar idle
- AddCta **숨김** (keyscreen line 219 `{tab === 'cellar' && (...)}`)
- SearchInput placeholder 다름 ("이름·생산자·지역·빈티지")
- ResultMeta: "N병 시음 기록"
- Column List: TastedWineRow × N

### loading
- AppHeader 그대로
- 셀러 데이터 fetch 중: 2-col Grid 슬롯 6개 SkeletonBlock (width matchparent, aspectRatio 0.65 또는 height 250 정도)
- 마신 와인 탭 슬롯 4개 SkeletonBlock (height ~180)
- RefreshControl tintColor `brand.gold`
- 인디케이터 표시 안 함 (skeleton 우선) — keyscreen은 mock 즉시 노출이지만 supabase 비동기 대응

### empty (cellar 탭, 셀러 0개)
- TabSegment 표시 (탭 전환 가능)
- TitleBar AddCta 표시
- 그 외 검색/필터/정렬/그리드 **모두 미렌더** (keyscreen line 250~252 `{!hasAnyItems ? <CellarEmptyState/> : <>...</>}` 분기)
- CellarEmptyState 카드 노출 (illustration + title + sub + PrimaryButton "첫 와인 등록" → /capture)

### empty (tasted 탭, 노트 0개)
- keyscreen line 539 `filtered.length === 0` 분기 — inline NoResults: "검색 결과가 없어요" / "No results found"
- **단** query 빈 상태에서 노트 자체 0이면 동일 NoResults? keyscreen은 모두 동일 NoResults inline. RN도 동일 — `<View className="items-center py-8 px-5"><Text className="font-inter text-[13px] text-text-muted">{t('cellar.tasted.noResults')}</Text></View>`
- AddCta는 cellar 탭에만 — tasted 탭 빈 상태에서는 CTA 없음 (keyscreen verbatim)

### empty + filter 적용 (cellar 탭, 필터 후 0)
- hasAnyItems=true → SearchInput + Filter + Sort + ResultCount 노출
- isFiltered=true & items.length=0 → NoResults 컴포넌트 (border DASHED, Playfair 16 title + Inter 12 body + ClearFilters btn)

### error
- supabase fetch 실패: Toast (variant=error, message=`cellar.swipe.updateFailed` 또는 `errors.generic`) + 화면은 last-good-state 유지
- 인덱스 fallback: 0개로 empty state 처리

### dark mode (theme=dark)
- bg-bg-deepest: `#251837`
- surface: `#3D2A4A`
- border-default: `#5A3D6A`
- text-primary: `#F8F4ED` / text-muted: `#CABDA8`
- wine-red `#8B1A2A` / gold `#C9A84C` / cream `#F5F0E8` (brand fixed)
- bottle-shelf gradient end: `#1a0a1e` (dark.bg.bottleShelf 기존 토큰)
- DrinkWindowBadge `past-peak` bg `rgba(45,21,64,0.6)` — dark 모드 우선 의도

### light mode (theme=light)
- bg-bg-deepest: `#FAF5EC`
- surface: `#FFFFFF`
- border-default: `#E0D2BC`
- text-primary: `#2A1A14` / text-muted: `#8B7766`
- bottle-shelf gradient end: `#FFFFFF` (light.bg.bottleShelf 기존)
- **DrinkWindowBadge `past-peak` bg `rgba(45,21,64,0.6)` light 모드에 대조 과함** — keyscreen은 dark 검증 화면. light에서도 verbatim 유지하되 §9 가독성 검토 요청
- **DrinkWindowBadge `too-young` bg `rgba(155,139,122,0.18)`** — light 모드의 text-muted (`#8B7766`)와 비슷 — verbatim 유지

### ko / en
- 모든 텍스트 i18n 키 사용 (§7 참조)
- TypeFilter chip 라벨: `cellar.filterType.{all|red|white|sparkling|rosé|fortified}` — keyscreen에는 `dessert` 미노출 (TYPE_FILTERS 배열에서 빠짐, line 38). cellar 그리드 카드의 type dot은 6 type 모두 처리, but 필터는 5 type + all.
- ko/en text는 length 차이 — TypeFilterChip "스파클링"(5자) vs "Sparkling"(9자), "주정강화"(4자) vs "Fortified"(9자) — horizontal scroll로 양쪽 안전
- Sort chip 라벨: "마시기 좋은 시점" 길이가 길어 chip가 다른 chip의 ~2배 — keyscreen verbatim 허용 (overflow scroll)
- en 모드: `letterSpacing` 0.04em UPPER (mode badge 등) 유지, ko 모드: ls=0 강제 (§8 deviation)

---

## 5. 인터랙션

| 위치 | 트리거 | 결과 |
|---|---|---|
| AppHeader logo | onPress | home 사양 §5 동일 — scroll-to-top or no-op |
| AppHeader Bell | onPress | `Haptics.selectionAsync()` → `router.push('/notifications')` |
| AppHeader LevelChip / Avatar | onPress | → `/profile` |
| TabSegment[cellar] | onPress | `setTab('cellar')`; query/filter 유지 (UX 결정 §9) |
| TabSegment[tasted] | onPress | `setTab('tasted')`; query/filter 유지 |
| AddCta | onPress | **현재 keyscreen mock**: Toast `cellar.addToast` ("셀러 등록은 추후"). RN v0.1.0: 동일 toast 유지 또는 BottomSheet `add-cellar-form` 띄움 — **§9 결정 필요**. Phase 3 spec에 cellar 추가 BottomSheet 명시되어 있으면 그쪽 사용 |
| SearchInput | onChangeText | `setQuery(text)`; debounce 없음 (즉시 filter — keyscreen 동일) |
| ClearBtn (search) | onPress | `setQuery('')` |
| TypeFilterChip | onPress | `Haptics.selectionAsync()` → `setTypeFilter(tf)` |
| SortChip | onPress | `Haptics.selectionAsync()` → `setSort(key)` |
| ClearFilters | onPress | `setQuery(''); setTypeFilter('all');` |
| CellarCard | onPress | `Haptics.selectionAsync()` → `router.push(`/cellar/${item.id}`)` — Phase 3 url path 또는 우리 표준 (lwin 기반) — **현재 RN은 `/cellar/${wine.lwin}?id=${item.id}` 패턴, retroactive 정합 §11**) |
| TastedWineRow "노트 보기" | onPress | → `/notes/${note.id}` |
| TastedWineRow "편집" | onPress | → `/notes/new/write?from=newEntry&wine_lwin={lwin}&edit=1` |
| TastedWineRow "와인 상세" | onPress | → `/wine/${lwin}` |
| ScrollView | 풀-투-리프레시 | RefreshControl → `useCellarList.refresh()` |
| pressed state | 모든 Pressable | `({pressed})=>({opacity: pressed?0.85:1, transform:[{scale: pressed?0.98:1}]})` |
| swipe action (현재 RN) | swipe right → mark consumed | **keyscreen에 없음 — RN 자체 확장 (§9 결정)**. 키스크린 verbatim 원칙 위반 — but 모바일 UX 표준. **유지 권장** (retroactive 후에도) |

### Swipe action 결정

- **현재 RN**: CellarCard는 row + Swipeable(right→consumed)
- **keyscreen verbatim**: 2-col grid card, swipe 없음, 셀러→상세 페이지에서 "이 와인 마시기" 액션
- **결정 추천**: 2-col grid card로 retroactive하되, **swipe 제거 + 상세 페이지의 "이 와인 마시기" 액션으로 일원화** (keyscreen verbatim). 별도 long-press 액션 시트는 v0.2.0
- **이유**: 2-col grid에서 horizontal swipe 안 자연스러움. 상세 페이지 액션이 키스크린 의도

---

## 6. 접근성

| 요소 | 속성 |
|---|---|
| TabSegment Tab | `accessibilityRole="tab"`, `accessibilityState={{selected:active}}`, `accessibilityLabel={`${label} ${count}`}` |
| AddCta | `accessibilityRole="button"`, `accessibilityLabel={t('cellar.addCta')}`, `accessibilityHint={ko?'셀러에 새 와인 추가':'add a wine to cellar'}` |
| SearchInput TextInput | `accessibilityLabel={t('cellar.searchPlaceholder')}` |
| ClearBtn (search) | `accessibilityRole="button"`, `accessibilityLabel={t('cellar.clearSearch')}` |
| TypeFilterChip | `accessibilityRole="button"`, `accessibilityState={{selected:active}}`, `accessibilityLabel={t(`cellar.filterType.${tf}`)}` |
| SortChip | 동일 패턴, `accessibilityLabel={t(`cellar.sort.${key}`)}` |
| CellarCard | `accessibilityRole="link"`, `accessibilityLabel={`${wine.name_ko ?? wine.display_name} ${wine.producer_name} ${vintage} ${drinkWindowStatusLabel}`}` |
| DrinkWindowBadge | non-interactive — `accessibilityRole="text"`, label은 부모 CellarCard에 포함됨 |
| TastedWineRow 3 액션 | 각 button/link, `accessibilityLabel` 명확히 (노트 보기 / 편집 / 와인 상세) |
| ClearFilters | `accessibilityRole="button"`, `accessibilityLabel={t('cellar.clearFilters')}` |
| ScrollView | RefreshControl `accessibilityLabel={t('common.refresh')}` |
| 9px·10px micro text (날짜, type 라벨) | `allowFontScaling={false}` 적용 — RN dynamic type 시 레이아웃 깨짐 방지. **a11y 검토 — §9** |
| WCAG AA 대비 (다크) | surface(#3D2A4A) 위 text-primary(#F8F4ED)=10.6:1 ✓ / text-muted(#CABDA8)=6.8:1 ✓ / gold(#C9A84C)=4.9:1 ✓ |
| WCAG AA 대비 (라이트) | bg-deepest(#FAF5EC) 위 text-primary(#2A1A14)=13.2:1 ✓ / gold(#C9A84C)=2.8:1 **FAIL** — gold on cream은 라이트 모드에서 대비 부족. 키스크린 verbatim이지만 §9 검토. (라이트 모드 gold는 `light.border.active = #B89438` 또는 더 어두운 골드 검토) |
| WineTypeDot 색만으로 정보 전달 금지 | 라벨과 함께 노출 — type chip에는 label 같이, TastedWineRow에도 label 같이. ✓ |
| Sort chip "마시기 좋은 시점" 길이 | scrollable horizontal — ko/en 양쪽 안전 |

---

## 7. i18n 키 매핑

기존 RN 키 (`src/lib/i18n/{ko,en}.json` cellar 네임스페이스, line 361~412) — 현재 구조는 **부분 구현**. keyscreen verbatim에 맞게 확장 필요.

### 기존 키 (유지)

```jsonc
"cellar": {
  "title": "셀러" / "Cellar",                            // 유지 — keyscreen "내 셀러" / "My cellar"보다 짧음; 탭 라벨로는 적합 (§11 검토)
  "tabs": { "cellared": "보관 중" / "In cellar", "consumed": "음용 완료" / "Consumed" },  // 현재 RN data model — keyscreen은 "내 셀러" / "마신 와인" 다름
  "search": { "placeholder": "..." },                    // 유지
  "sort": { "label", "recent", "vintage", "price" },     // 부분 — keyscreen은 6 sort
  "empty": { "cellared", "consumed", "noResults" },      // 유지
  "meta": { "acquiredAt", "consumedAt", "price" },       // 유지
  "swipe": { ... },                                       // 유지 (swipe 결정 §5)
  "detail": { ... }                                       // 별도 화면 (cellar/[id])
}
```

### 신규 키 (keyscreen messages line 129~200 verbatim 이식)

```jsonc
// src/lib/i18n/ko.json — cellar 네임스페이스 확장
"cellar": {
  "title": "내 셀러",                                    // 변경 — 키스크린 verbatim ("내 셀러"가 셀러 탭 라벨, AppHeader 별도)
  "addCta": "+ 등록",                                    // 신규
  "addToast": "셀러 등록은 추후",                         // 신규
  "tabs": {
    "cellar": "내 셀러",                                  // 신규 — keyscreen tab 라벨
    "tasted": "마신 와인",                                // 신규 — keyscreen inline ko
    "cellared": "보관 중",                                // 기존 유지 (다른 화면용; 본 화면 미사용 권장)
    "consumed": "음용 완료"                               // 기존 유지
  },
  "searchPlaceholder": "와인·생산자·지역·품종·빈티지 검색",  // 신규
  "clearSearch": "검색 지우기",                           // 신규
  "filterType": {
    "all": "전체",
    "red": "레드",
    "white": "화이트",
    "sparkling": "스파클링",
    "rosé": "로제",
    "fortified": "주정강화",
    "dessert": "디저트"
  },
  "sort": {
    "label": "정렬",                                      // 기존
    "recent": "최근",                                     // 기존 (값 변경 — keyscreen "최근")
    "drinkSoon": "마시기 좋은 시점",                       // 신규
    "vintage": "빈티지",                                  // 기존
    "region": "지역",                                     // 신규
    "storage": "보관 위치",                               // 신규
    "price": "가격대"                                     // 기존 (값 변경 — keyscreen "가격대")
  },
  "resultCount": {
    "total": "총 {{total}}병",
    "filtered": "{{total}}병 중 {{shown}}개 결과"
  },
  "clearFilters": "필터 지우기",
  "noResults": {
    "title": "일치하는 와인이 없어요",
    "body": "검색어를 바꾸거나 와인 타입 필터를 해제해 보세요."
  },
  "drinkWindow": {                                        // 신규 — DrinkWindowBadge
    "now": "지금 마시기 좋아요",
    "fromYear": "{{year}}년부터",
    "peak": "절정",
    "pastPeak": "절정 지남",
    "tooYoung": "아직 일러요",
    "mature": "성숙기"
  },
  "empty": {                                              // 기존 cellared/consumed 유지 + 신규 root level
    "title": "셀러가 비어있어요",                          // 신규 (CellarEmptyState용)
    "sub": "와인을 등록하면 보관·음용 시점 알림을 받을 수 있어요",
    "cta": "첫 와인 등록",
    "cellared": { ... },                                  // 기존 유지 (현재 사용처가 있을 수 있음)
    "consumed": { ... }
  },
  "tasted": {                                             // 신규 — TastedWineRow
    "myNote": "내 시음 노트",
    "expert": "전문가",
    "beginner": "입문자",
    "viewNote": "노트 보기",
    "edit": "편집",
    "wineDetail": "와인 상세",
    "recordCount": "{{count}}병 시음 기록",
    "noResults": "검색 결과가 없어요"
  }
}
```

```jsonc
// src/lib/i18n/en.json — 대응
"cellar": {
  "title": "My cellar",
  "addCta": "+ Add",
  "addToast": "Cellar registration coming soon",
  "tabs": {
    "cellar": "My cellar",
    "tasted": "Tasted",
    "cellared": "In cellar",
    "consumed": "Consumed"
  },
  "searchPlaceholder": "Wine, producer, region, grape, vintage",
  "clearSearch": "Clear search",
  "filterType": {
    "all": "All",
    "red": "Red",
    "white": "White",
    "sparkling": "Sparkling",
    "rosé": "Rosé",
    "fortified": "Fortified",
    "dessert": "Dessert"
  },
  "sort": {
    "label": "Sort",
    "recent": "Recent",
    "drinkSoon": "Drink soon",
    "vintage": "Vintage",
    "region": "Region",
    "storage": "Storage",
    "price": "Price"
  },
  "resultCount": {
    "total": "{{total}} bottles total",
    "filtered": "{{shown}} of {{total}}"
  },
  "clearFilters": "Clear filters",
  "noResults": {
    "title": "No matching wines",
    "body": "Try a different search or clear the wine type filter."
  },
  "drinkWindow": {
    "now": "Drink now",
    "fromYear": "From {{year}}",
    "peak": "Peak",
    "pastPeak": "Past peak",
    "tooYoung": "Too young",
    "mature": "Mature"
  },
  "empty": {
    "title": "Your cellar is empty",
    "sub": "Add wines to get notified when they reach their peak",
    "cta": "Add first wine",
    "cellared": { ... },
    "consumed": { ... }
  },
  "tasted": {
    "myNote": "My tasting note",
    "expert": "Expert",
    "beginner": "Beginner",
    "viewNote": "View note",
    "edit": "Edit",
    "wineDetail": "Wine details",
    "recordCount": "{{count}} tasting records",
    "noResults": "No results found"
  }
}
```

> **i18next vs next-intl key 형식 차이**: keyscreen `{var}` → RN `{{var}}` (i18next 표준). 이미 우리 i18n 적용됨.
> **`rosé` 키 이름**: JSON 키에 e-acute 사용은 가능. 단 일부 빌드 도구가 정상화 — 호환성을 위해 `rose` 키로 통일 검토 (`type_canonical` enum 표준이 'rose'). **§9 결정**: 키는 `rose`, label 표시만 `로제`/`Rosé`. cellar.tsx도 `type_canonical='rose'`. keyscreen `rosé` 표기 → 우리 `rose` 정규화.

---

## 8. RN deviation 로그

| 항목 | keyscreen | RN 변경 | 사유 |
|---|---|---|---|
| Next `<Link href>` | declarative anchor | `<Pressable onPress={()=>router.push(...)}>` | RN no anchor — expo-router programmatic navigation |
| `useTranslations('cellar')` | next-intl namespace | i18next `useTranslation()` + `t('cellar.X')` | 플랫폼 차이 — 동일 키 구조 |
| `<input type="text">` placeholder | HTML input | `<TextInput placeholder={...} placeholderTextColor={...}/>` | RN 표준 |
| `aria-label` | HTML | `accessibilityLabel` | RN 표준 |
| `overflowX auto` + custom scrollbar 숨김 | CSS | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` | 표준 변환 |
| `WebkitOverflowScrolling: 'touch'` | iOS Safari momentum | RN ScrollView 기본 momentum 적용 | 자동 |
| `display grid; gridTemplateColumns 1fr 1fr; gap 12` | CSS grid 2-col | `<FlatList numColumns={2} columnWrapperStyle={{gap:12}}/>` 또는 `<View flexDirection:row flexWrap:wrap>` | RN no CSS grid. FlatList numColumns + columnWrapperStyle은 keyscreen verbatim 가능 |
| `linear-gradient(160deg, ${bottleColor}28 0%, var(--color-bottle-shelf) 80%)` | CSS angle gradient (160deg = 위→아래 약간 좌측) | `<LinearGradient colors={[...]} locations={[0, 0.8]} start={{x:0,y:0}} end={{x:0.34, y:0.94}}/>` (160deg → start/end 변환: cos(160)=-0.94, sin(160)=0.34, CSS top→bottom direction에 맞춤) | 등가 변환. design-tokens.ts gradients에 cellar 카드 gradient 헬퍼 추가 권장 (`captureBottlePhotoGradient`와 유사). **§9 P0 토큰** |
| `${wine.bottleColor}28` (hex+alpha) | CSS hex8 (28 = 0.157 alpha) | `withAlpha(bottleColor, 0.157)` 또는 직접 hex8 (`#{bottleColor.slice(1)}28`) | hex8 RN 지원 — 직접 사용 가능. but design-tokens 표준은 withAlpha — 권장 |
| `border-style: dashed` | CSS | `style={{borderStyle:'dashed'}}` | RN 지원 — 단 Android는 일부 디바이스에서 dashed 렌더링 불완전. fallback dotted 또는 solid 검토 — **§8 deviation** |
| transition `bg 150ms ease` | CSS transition (Tab segment) | Reanimated `useAnimatedStyle` + `withTiming(150)` OR 즉시 변경 | 즉시 변경 허용 (UX 차이 미미) |
| `cursor: pointer` | CSS | RN 무시 — Pressable 자동 | — |
| `all: 'unset'` (button reset) | CSS reset | RN Pressable 기본 — reset 불필요 | — |
| `text-align center` | CSS | RN `<Text>` 다중 라인의 경우 `textAlign:'center'`, 단일 라인 정렬은 부모 `alignItems:'center'` | 표준 |
| `font-family var(--font-inter)` / `var(--font-playfair)` | CSS variable | NW v4 className `font-inter` / `font-playfair` (tailwind config) 또는 직접 fontFamily | tailwind config 표준 |
| 9px / 10px micro text | CSS | RN Text 최소 11px 권장 (Apple HIG / Android Material) — 의도적 9px/10px 키스크린 verbatim 유지 | `allowFontScaling={false}` 적용. design-reviewer 시각 확인 |
| 한글 word-break:keep-all | CSS 어절 wrap | RN `<Text>` 기본 — 어절 wrap 없음 | RN 제약. 가독성 minor 차이 |
| letter-spacing em 단위 | `letterSpacing: '0.04em'` 등 | px 변환 — em × font-size (0.04em × 10px = 0.4px) | RN px only |
| `whiteSpace: 'nowrap'` | CSS | RN `numberOfLines={1}` | 표준 |
| `WebkitLineClamp: 2` + `display: -webkit-box` | CSS multi-line truncate | `<Text numberOfLines={2}>` | 표준 |
| `flexShrink: 0` | CSS | RN `flexShrink:0` 명시 | RN 기본 `flexShrink:1` — 명시 필수 |
| `minWidth: 0` (flex child truncate) | CSS | RN 기본 동작 다름 — flex 자식의 numberOfLines + minWidth:0 패턴 | 그대로 작성 |
| `position: 'sticky'` | keyscreen 미사용 | — | 불필요 |
| `backdrop-filter: blur` | keyscreen 미사용 | — | 불필요 |
| `hover:` pseudo-class | keyscreen 미사용 (모바일 시안) | — | 불필요. press feedback 표준 추가 |
| `:focus-visible` | 키보드 a11y | RN focusable + focus outline 자동 | RN 표준 |
| swipe action (현재 RN 추가 기능) | keyscreen 없음 | **제거 권장** — 키스크린 verbatim 원칙 + 2-col grid 카드는 swipe 부적절 | §5 결정 |
| FlatList vs `<View>.map` | keyscreen 인라인 `.map` | `<FlatList numColumns={2}>` 권장 (셀러 50+ 아이템 대응) | 성능 — keyscreen verbatim 위반 아님 (시각 동일) |
| `ListHeaderComponent` | — | TitleBar + SearchInput + TypeFilterChips + SortChips + ResultCount 모두 묶어서 FlatList header로 | RN 표준 — 시각 동일 |
| `RefreshControl` | keyscreen 풀-투-리프레시 없음 | RN 표준 추가 (`useCellarList.refresh()`) | 모바일 UX 표준 — verbatim 위반 아님 |

---

## 9. 토큰/i18n/컴포넌트 확장 요청

### 신규 색 토큰

| 토큰 | 값 | 용도 | 추가 위치 |
|---|---|---|---|
| `typeFilterDot.red` | `#8B1A2A` | TypeFilter chip dot (red) | 이미 `brand.wineRed` 동일 — 별도 토큰 불필요 |
| `typeFilterDot.white` | `#E8D89B` | TypeFilter chip dot (white, 채도 더 높음) | design-tokens.ts 신규 그룹 `typeFilterDot.{red,white,sparkling,rose,fortified,dessert}` |
| `typeFilterDot.sparkling` | `#F5F0E8` | sparkling dot (cream) | `brand.cream` 동일 — 별도 토큰 불필요 |
| `typeFilterDot.rose` | `#D4707A` | rose dot | 신규 |
| `typeFilterDot.fortified` | `#6B1421` | fortified dot | 신규 |
| `typeFilterDot.dessert` | `#C9A84C` | dessert dot | `brand.gold` 동일 — 별도 토큰 불필요 |
| `goldAlpha.12` | `rgba(201,168,76,0.12)` | TypeFilter active bg, sort active hover 등 | `withAlpha(brand.gold, 0.12)` |
| `goldAlpha.15` | `rgba(201,168,76,0.15)` | TastedWineRow mode badge (beginner) bg | `withAlpha(brand.gold, 0.15)` |
| `wineRedAlpha.25` | `rgba(139,26,42,0.25)` | TastedWineRow mode badge (expert) bg | `withAlpha(brand.wineRed, 0.25)` |
| `creamAlpha.08` | `rgba(245,240,232,0.08)` | SearchInput ClearBtn bg | `withAlpha(brand.cream, 0.08)` |
| `creamAlpha.7` | `rgba(245,240,232,0.7)` | Tab count badge (active) text | `withAlpha(brand.cream, 0.7)` |
| `tooYoungBg` | `rgba(155,139,122,0.18)` | DrinkWindowBadge too-young bg | `tooYoungBg` 신규. light/dark 공통 (alpha 적용 — 양쪽에 자연스러움) |
| `pastPeakBg` | `rgba(45,21,64,0.6)` | DrinkWindowBadge past-peak bg | `pastPeakBg` 신규. light 모드 검토 §9 |

> **방침**: alpha 변형은 `withAlpha(...)` 헬퍼 우선. raw rgba 직접 사용은 deviation. typeFilterDot은 의도적으로 wineTypeDot과 다른 채도 — 별도 토큰 그룹.

### 신규 spacing/radius

| 값 | 픽셀 | 키스크린 사용처 | 현재 NW v4 |
|---|---|---|---|
| `radius: 10` | 10px | TabSegment outer, AddCta button | 이미 design-tokens.ts `radius['10']: 10` 존재 ✓ |
| `radius: 14` | 14px | CellarCard, TastedWineRow outer, NoResults | 이미 `radius['14']: 14` 존재 ✓ |
| `radius: 7` | 7px | TabSegment Tab inner button | NW v4 기본 `rounded-md=6` / `rounded-lg=8` — **7px 없음**. `style={{borderRadius:7}}` 인라인 또는 `radius['7']: 7` 추가 |
| `padding 0.5px hairline` | divider | TastedWineRow 내부 divider | `StyleSheet.hairlineWidth` 사용 — 별도 토큰 불필요 |

> 권장: `design-tokens.ts.radius['7']: 7` 추가. tailwind는 `rounded-[7px]` 인라인.

### 신규 typography

| 항목 | 값 | 키스크린 사용처 |
|---|---|---|
| `tabCount` | Inter 10 700 | TabSegment count badge — 신규 토큰 권장 |
| `cellarCardName` | Playfair 12 lh 15 cream | CellarCard wine name (home.recentNotes와 동일 — 재사용) |
| `cellarCardMeta` | Inter 10 text-muted | CellarCard producer/vintage |
| `drinkWindowBadge` | Inter 10 600 lh 12 | DrinkWindowBadge label |
| `chipLabel` | Inter 11 600 | TypeFilter/Sort chip label |
| `chipLabelSmall` | Inter 10 600 ls 0.12em UPPER | TastedWineRow eyebrow ("내 시음 노트") |
| `tastedCardName` | Playfair 14 lh 17.5 cream | TastedWineRow wine name |
| `wsetMicroLabel` | Inter 8 ls 0.32 UPPER | TastedWineRow WSET 4-grid label — `microLabel` 재사용 가능 (size 9) — 차이 미미 |
| `tabSegmentLabel` | Inter 12 600 | TabSegment label — 신규 또는 `primaryButtonSm`(Inter 13 600) 재사용 |
| `addCtaLabel` | Inter 12 600 gold | AddCta label — `tabSegmentLabel` 재사용 가능 |

> 대부분 home/wine-detail 토큰과 겹침. `chipLabel`(Inter 11 600), `chipLabelSmall`(Inter 10 600 UPPER) 두 가지만 신규 추가 권장.

### 신규 폰트 weight/variant

본 화면은 Playfair Regular + Italic + Inter Regular/Medium/SemiBold/Bold 모두 사용. **이미 home 사양 §9에서 Playfair Italic 추가 요청됨** — 본 화면도 동일 의존. 별도 추가 없음.

### 신규 shadow

본 화면 카드들은 keyscreen에 shadow 없음 (border만). **확장 불필요**.

### 신규 gradient

| 키 | 값 | 사용처 |
|---|---|---|
| `cellarCardBottle` | `{colors: [withAlpha(bottleColor, 0.157), bgBottleShelf], locations:[0, 0.8], 160deg}` | CellarCard 병 영역 배경 |
| `typeFilterAll` | `{colors: [brand.wineRed, brand.gold, brand.cream], locations:[0, 0.5, 1], 135deg}` | TypeFilterChip[all] dot |

> 두 gradient 모두 `design-tokens.ts.gradients` 추가. **P0 토큰 확장 요청**. cellarCardBottle은 bottleColor 매개로 받는 헬퍼 함수 형태 (`captureBottlePhotoGradient`와 유사):

```ts
// src/lib/design-tokens.ts §9 신규
export function cellarCardBottleGradient(
  bottleColor: string,
  scheme: 'dark' | 'light' = 'dark',
) {
  const end = scheme === 'dark' ? dark.bg.bottleShelf : light.bg.bottleShelf;
  return {
    colors: [withAlpha(bottleColor, 0.157), end] as readonly string[],
    locations: [0, 0.8] as readonly number[],
    // 160deg: 시작점이 위쪽-약간왼쪽, 종점이 아래쪽-약간오른쪽
    start: { x: 0, y: 0 },
    end:   { x: 0.34, y: 0.94 },
  };
}
```

### 신규 컴포넌트 (포팅)

| 컴포넌트 | 원본 | 목표 위치 |
|---|---|---|
| `WMBottle` | `keyscreen src/components/shared/wm-bottle.tsx` | `src/components/shared/wm-bottle.tsx` (react-native-svg port — home 사양에서 이미 요청됨, 재사용) |
| `WMGlassRating` | `keyscreen src/components/shared/wm-glass-rating.tsx` | `src/components/shared/wm-glass-rating.tsx` (이미 hardening 완료된 표준 — `wm-glass-rating.tsx` 존재 확인) |
| `DrinkWindowBadge` | `keyscreen src/components/cellar/drink-window-badge.tsx` | `src/components/cellar/drink-window-badge.tsx` (신규) |
| `LevelChip` | home 사양 §9 | (재사용 — 이미 `src/components/shared/level-chip.tsx` hardening 완료) |
| `EmptyState` w/ illustration prop | shared | 현재 `src/components/shared/empty-state.tsx` 확인 — illustration prop 없으면 보완 |
| `getDrinkWindow` / `getDrinkWindowStatus` lib | `keyscreen src/lib/drink-window.ts` (202 LOC) | `src/lib/drink-window.ts` (포팅 — `wine.bottle_color`, `wine.appellation` 등 컬럼 매핑 필요 — wines_localized VIEW에서 모든 필드 제공되는지 §11 확인) |

> **데이터 매핑 주의**: keyscreen `wine.appellation.en` 등 LocaleText 패턴 — 우리 `wines_localized` VIEW는 `display_name`, `name_ko` 형태. drink-window 휴리스틱이 의존하는 컬럼:
> - `wine.country.en` → `wines_localized.country` (단일 컬럼)
> - `wine.region.en` → `wines_localized.region` (있나 확인)
> - `wine.appellation.en` → ? (현재 schema에 없음 — supabase migration 또는 fallback)
> - `wine.averagePriceKrw` → ? (현재 없음)
> - `wine.wineType` → `wines_localized.type_canonical`
> - `wine.name` → `wines_localized.display_name`
>
> **§11에서 escalate**: drink-window 정확도 v0.1.0 alpha는 단순화 (vintage + type만으로 보수적 추정) — 자세한 휴리스틱은 v0.2.0.

### 신규 마이그레이션

본 화면에 추가 마이그레이션 **현 상황 불필요 (v0.1.0 alpha)** — 기존 `cellar_items` + `wines_localized` 사용. 단:

- **`status` enum 차이**: 현재 RN `cellar_items.status` = `'cellared' | 'consumed'`, keyscreen은 별도 status 없음 (cellar에 있는지 여부 + tasting_notes 존재 여부로 분기). **§11 결정**: 현재 RN 스키마 유지 + UI에서 keyscreen 패턴(셀러/마신) 매핑:
  - `cellar 탭` = `cellar_items.status='cellared'` 항목
  - `tasted 탭` = `tasting_notes` 기반 dedup (cellar_items와 무관)
- **purchase_price_krw / acquired_at / storage** — 기존 컬럼 있음 ✓
- **storage 정렬** — `cellar_items.storage` 컬럼 string 필요. 현재 schema 확인 — 없으면 v0.1.0은 storage 정렬 제거 (5 sort만)

### NW v4 colorScheme 헬퍼

`useThemeTokens()` (home 사양 §9 P0 요청) 재사용. cellar card gradient, type filter dot에 사용.

---

## 10. 검증 체크리스트

- [ ] TabSegment 2개 탭 (셀러/마신 와인), active(wine-red bg + cream text) / idle(transparent + text-muted) verbatim
- [ ] Tab count badge active 시 cream/0.7, idle 시 text-disabled
- [ ] AddCta 셀러 탭에만 노출, 마신 와인 탭에서 hidden
- [ ] AddCta onPress → toast `cellar.addToast` 또는 add 화면 (§5 결정)
- [ ] SearchInput query 즉시 filter (debounce 없음 — keyscreen verbatim)
- [ ] ClearBtn query.length>0 시만 노출
- [ ] TypeFilterChips 6개 (all/red/white/sparkling/rosé/fortified) — dessert 빠짐 keyscreen verbatim
- [ ] TypeFilterChip active border 1px gold + bg gold/0.12 / idle border default + transparent
- [ ] TypeDot all gradient 135deg [wineRed→gold→cream]
- [ ] TypeDot 단일 type 색 (red `#8B1A2A`, white `#E8D89B`, sparkling `#F5F0E8`, rose `#D4707A`, fortified `#6B1421`)
- [ ] TypeDot active opacity 1 / idle 0.55 (all idle 0.5)
- [ ] SortChips 6개 (recent/drinkSoon/vintage/region/storage/price) — keyscreen verbatim 6종
- [ ] SortChip active wine-red bg + cream text / idle transparent + text-secondary
- [ ] ResultCount text isFiltered 분기 ("총 N병" vs "N병 중 M개 결과")
- [ ] ResultCount ClearFilters 조건 (isFiltered && items.length !== rawItems.length)
- [ ] CellarGrid 2-col gap 12 padding 0_16_24 (FlatList numColumns 2 권장)
- [ ] CellarCard 병 영역 gradient 160deg [bottleColor/0.157 → bottleShelf]
- [ ] CellarCard WMBottle width 40 height 130
- [ ] CellarCard meta padding 10_12_12 gap 4 minWidth 0
- [ ] CellarCard WineTypeDot 6×6 radius full
- [ ] CellarCard wine name Playfair 12 lh 15 cream 2-line clamp minHeight 30
- [ ] CellarCard producer Inter 10 text-muted + vintage Inter 10 text-secondary
- [ ] DrinkWindowBadge 5 status 색/라벨 verbatim (peak/opening/mature/too-young/past-peak)
- [ ] DrinkWindowBadge padding 3_8 radius 10 Inter 10 600 lh 1.2 nowrap
- [ ] NoResults dashed border radius 14 padding 32_20 text-center
- [ ] NoResults title Playfair 16 cream + body Inter 12 text-muted lh 1.5 + ClearFilters btn gold border
- [ ] CellarEmptyState GlassWater icon 56 strokeWidth 1.25 + title + sub + PrimaryButton primary → /capture
- [ ] TastedWineRow Card outer radius 14 surface bg border-default overflow hidden
- [ ] TastedWineRow Top row WMBottle 36×118 + meta col (type dot + date 우측, wine name Playfair 14 2-line clamp, producer+vintage Inter 11, region Inter 10)
- [ ] TastedWineRow Divider hairline border-default margin 0_12
- [ ] TastedWineRow Note header (pen icon 11 gold + "내 시음 노트" Inter 10 600 gold UPPER ls 0.12em + Mode badge expert/beginner + rating display Playfair 13 gold 600)
- [ ] TastedWineRow Mode badge expert (wineRed/0.25 bg + cream text) / beginner (gold/0.15 bg + gold text)
- [ ] TastedWineRow WMGlassRating size 8 rating>0 시만
- [ ] TastedWineRow Aroma hint Inter 11 text-secondary lh 1.45 numberOfLines 2
- [ ] TastedWineRow Expert WSET 4-grid (4-col gap 4 padding 8_10 bg-sunken radius 8) — sweetness/acidity/body/tannin
- [ ] TastedWineRow 3 액션 버튼 row gap 8 — 노트보기 1.4 gold border / 편집 1 deep bg / 와인상세 1 deep bg
- [ ] dark mode 색 검증 (모든 카드 surface=#3D2A4A, border=#5A3D6A, cream/wineRed/gold 고정)
- [ ] light mode 색 검증 (surface=#FFFFFF, border=#E0D2BC, text-primary=#2A1A14)
- [ ] light 모드 DrinkWindowBadge past-peak bg rgba(45,21,64,0.6) 대비 검토 (§9 a11y)
- [ ] light 모드 gold text 대비 검토 (#C9A84C on #FAF5EC = 2.8:1 미달)
- [ ] ko/en 양쪽 모드 텍스트 검증 (영어 모드 한글 노출 0건)
- [ ] dark+ko / dark+en / light+ko / light+en 4 조합 시각 캡처 (design-reviewer)
- [ ] 풀-투-리프레시 동작 (RefreshControl tintColor brand.gold)
- [ ] TabSegment / TypeFilterChips / SortChips Haptics.selectionAsync 동작
- [ ] CellarCard / TastedWineRow press feedback (opacity 0.85 scale 0.98)
- [ ] 9px/10px micro text `allowFontScaling={false}` 적용
- [ ] WCAG AA 대비 (text-primary, text-muted, gold on surface 양쪽 모드, 라이트 gold 예외)

---

## 11. 현재 RN 구현 차이 (retroactive)

기존 코드: `app/(tabs)/cellar/index.tsx` (160 LOC), `src/components/cellar/{cellar-card, cellar-tabs, search-sort-bar, cellar-fields}.tsx` (~330 LOC 합계).

| 항목 | keyscreen 원본 (verbatim 기준) | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|
| **탭 라벨 / 분기** | `cellar` ("내 셀러") + `tasted` ("마신 와인"), 마신 와인은 `tasting_notes` 기반 dedup | `cellared` ("보관 중") + `consumed` ("음용 완료"), 모두 `cellar_items.status` | **데이터 모델 변경 필요**: tasted 탭은 tasting_notes 쿼리. 또는 v0.1.0 alpha는 cellared/consumed 유지하고 keyscreen "마신 와인" 컨셉은 v0.2.0. **§9 escalate** — 리더 결정 |
| **탭 segment UI** | inline-flex segment (bg-surface border-default radius 10 padding 3, 2 tab inside) | `<Tab>` 컴포넌트 (text underline indicator height 2 width 32 gold) | 완전 다른 디자인. retroactive로 keyscreen segment 적용 |
| **AddCta** | `+ 등록` btn (transparent border + gold text), toast `cellar.addToast` | 없음 — capture 화면으로 진입은 FAB | retroactive: TitleBar에 AddCta 추가. mock toast 또는 BottomSheet (별도 add-cellar 화면) |
| **SearchInput** | bg-surface border 1px radius 12 padding 10_12 + Search icon + ClearBtn | bg-surface px-3 height 44 + Search icon + ClearBtn — 디자인은 비슷, 단 keyscreen padding 10_12 radius 12 verbatim | minor 조정 — padding/radius/icon 위치 verbatim |
| **TypeFilterChips** | 6 chip (all/red/white/sparkling/rosé/fortified) horizontal scroll | 없음 | **신규 컴포넌트 필요** — 키스크린 6 chip + dot + i18n |
| **SortChips** | 6 chip horizontal scroll | `<SortPicker>` (Modal — 단일 chevron 버튼 + 모달 in radio list 3개) | **완전 다른 UX**. retroactive: 6 chip horizontal scroll로 변경 (storage/region 추가) |
| **ResultCount** | "총 N병" / "N병 중 M개" + ClearFilters | 없음 (헤더 카운트 표시 없음) | 신규 |
| **NoResults (filtered=0)** | dashed border 카드 + title/body/clearBtn | EmptyState 단순 (title만) | retroactive — keyscreen NoResults 카드 디자인 |
| **CellarCard** | **2-col grid card** (gradient 병 영역 + meta + DrinkWindowBadge) | **세로 row card** (병 64×96 + meta + status meta line) + swipe action | **디자인 완전 다름**. retroactive: 2-col grid + WMBottle + bottle-zone gradient + DrinkWindowBadge. swipe action 제거 (§5 결정) |
| **DrinkWindowBadge** | 5 status (peak/opening/mature/too-young/past-peak) 색 분기 pill | 없음 | **신규 컴포넌트 필요** — `src/components/cellar/drink-window-badge.tsx` |
| **drink-window lib** | 202 LOC heuristic (wine type + region + appellation + price → from/peak/to) | 없음 | **포팅 필요** — `src/lib/drink-window.ts`. 단 wines_localized 컬럼 매핑 (appellation/averagePriceKrw 없음) — v0.1.0 alpha는 단순화 (vintage + type만) |
| **CellarEmptyState** | `EmptyState` w/ GlassWater 56 strokeWidth 1.25 illustration | EmptyState (title + description + CTA) — illustration 없음 | retroactive: illustration prop 추가 (또는 inline icon) |
| **TastedWineRow** | 매우 복잡한 카드 (와인 정보 + 내 노트 미리보기 + WSET 4-grid + 3 액션) | 없음 | **신규 컴포넌트 필요** — `src/components/cellar/tasted-wine-row.tsx` (LOC 200+) |
| **TastedWinesList (tasted 탭)** | 별도 탭 — 노트 기반 dedup, 검색 + 카운트 + 카드 리스트 | 없음 | **신규** — useTastedWines hook + tasted 탭 분기 (cellar_items.status='consumed'와 다른 데이터 소스) |
| **`status` 컬럼 vs `tasting_notes`** | tasted = `tasting_notes` (note 존재하는 와인 unique) | tasted = `cellar_items.status='consumed'` | **데이터 모델 결정 §9** — keyscreen verbatim 따르려면 tasted 탭은 별도 hook (notes 기반). 현재 status enum은 유지 (cellar 내부 음용 완료 체크용) |
| **i18n 키** | `cellar.title="내 셀러"`, `cellar.tabs.{cellar,tasted}`, `cellar.filterType.*`, `cellar.sort.*` (6종), `cellar.drinkWindow.*`, `cellar.tasted.*` etc | `cellar.title="셀러"`, `cellar.tabs.{cellared,consumed}`, `cellar.sort.{recent,vintage,price}` (3종) | §7 키 일괄 추가 + 기존 키 일부 deprecate |
| **swipe action** | 없음 | 우측 swipe → mark consumed (Swipeable) | **제거 권장** — keyscreen verbatim + 2-col grid 카드에 horizontal swipe 부자연 |
| **CellarCard navigation 경로** | `/cellar/${item.id}` | `/cellar/${wine.lwin}?id=${item.id}` | 우리 표준 (lwin 기반) 유지. retroactive 시 cellar/[id] 페이지가 lwin path param 받도록 정합 (또는 keyscreen `/cellar/${item.id}`로 회귀 — 결정 §9) |

### retroactive 작업 폭

- **신규 컴포넌트**: 5개 (TabSegment, TypeFilterChips, SortChips, DrinkWindowBadge, TastedWineRow)
- **재작성**: 3개 (CellarCard - row→grid, SearchSortBar - chips로 분리, CellarTabs - underline→segment)
- **신규 lib**: 1개 (drink-window.ts 포팅 — 단순화 버전)
- **신규 hook**: 1개 (useTastedWines — tasting_notes 기반)
- **i18n 확장**: ko/en 각 ~30 키
- **design-tokens.ts 확장**: typeFilterDot 그룹 (4 신규 색) + cellarCardBottleGradient 헬퍼 + alpha 토큰 ~6개 + radius['7'] + chipLabel typography
- **tailwind.config.ts 확장**: borderRadius 7
- **데이터 모델 결정**: tasted 탭 데이터 소스 (cellar_items.status vs tasting_notes dedup) — §9 escalate

**총 LOC 추정**: 600~800 LOC 신규/재작성. **2일 작업 — Day 6/7 압박**. rn-screen-builder 검토 후 우선순위:
- **P0 (alpha 필수)**: TabSegment + 2-col CellarCard (grid + gradient + DrinkWindowBadge) + 6-chip TypeFilter + 6-chip Sort + ResultCount + NoResults — **셀러 탭 시각만 키스크린에 맞춤**
- **P1 (post-alpha)**: TastedWineRow + tasted 탭 — TastedWinesList는 v0.2.0 검토 (구현 비용 크고, 핵심 셀러 UX는 cellar 탭이 우선)
- **P2 (v0.2.0)**: drink-window 정확한 휴리스틱 (appellation/price 기반)

---

## 12. 미해결 질문 (리더 판단 필요)

1. **tasted 탭 데이터 모델**: keyscreen은 `tasting_notes` 기반 wine dedup. 우리는 `cellar_items.status='consumed'`. v0.1.0 alpha에서 어느 방식? — keyscreen verbatim이면 tasted는 별도 hook (`useTastedWines`); 비용 절감이면 P1로 미루고 cellar 탭만 retroactive.
2. **AddCta 동작**: keyscreen mock toast vs RN BottomSheet add-cellar form (cellar/add 화면 별도)? v0.1.0 spec 확인. mock toast는 LOC 0, BottomSheet는 +200 LOC.
3. **swipe action 제거 여부**: 현재 RN의 우측 swipe→consumed는 keyscreen에 없음. 2-col grid 카드는 swipe 부자연 — 제거 권장. 단 모바일 UX 표준이면 long-press 액션 시트 검토 (v0.2.0).
4. **drink-window 휴리스틱 단순화**: keyscreen drink-window.ts는 202 LOC heuristic (28개 region/appellation/price 매칭). v0.1.0 alpha 단순화 — vintage + type만으로 5 status 추정. 정확도는 v0.2.0 보강.
5. **`type_canonical='dessert'` 필터 chip 부재**: keyscreen TYPE_FILTERS 배열에 dessert 빠짐 (line 38). 의도적 (디저트 와인 보관 비율 낮음)? — verbatim 유지 권장. but 셀러에 dessert 와인 있으면 필터에서 안 보이는 UX 불편 — design-reviewer 확인.
6. **CellarCard navigation 경로**: `/cellar/${item.id}` (keyscreen) vs `/cellar/${wine.lwin}?id=${item.id}` (우리). 우리 표준 (lwin URL slug) 유지 권장 — semantic url. detail 화면 진입 동작은 동일.
7. **light 모드 gold(#C9A84C) on cream(#FAF5EC) 대비 2.8:1 FAIL**: ResultCount의 ClearFilters btn, DrinkWindowBadge opening/mature text on gold bg 등. WCAG AA 미달. keyscreen verbatim 위반 vs a11y 준수 — 별도 라이트 gold 토큰(`light.border.active = #B89438`) 또는 brand.goldDeep(`#A07F2E`) 사용 검토.
8. **light 모드 DrinkWindowBadge past-peak bg `rgba(45,21,64,0.6)`**: dark 모드용 색이 라이트 배경에 너무 대조. 라이트 모드에서는 다른 alpha 색 검토 (e.g. `withAlpha(light.text.muted, 0.18)`).
9. **rosé vs rose 키 정규화**: i18n 키 / type_canonical enum / TypeFilter 배열 — `rose`로 통일, label만 ko `로제`/en `Rosé` 권장.

---

## 13. 진행 로그 메타

- author: design-spec-author
- 작성일: 2026-05-20 (Day 6)
- 키스크린 JSX read: 6개 파일 (page.tsx + cellar-card + cellar-empty-state + drink-window-badge + drink-window.ts + components.md)
- 기존 RN read: 5개 파일 (index.tsx + cellar-card + cellar-tabs + search-sort-bar + design-tokens.ts)
- 토큰 확장 P0 요청: 4 색(typeFilterDot.{white,rose,fortified}), 2 alpha(tooYoungBg, pastPeakBg), 1 gradient helper(cellarCardBottleGradient), 1 radius(7), 2 typography(chipLabel, chipLabelSmall) — **총 10 토큰**
- i18n 확장 요청: ko/en 각 ~30 키 (cellar.{addCta,addToast,searchPlaceholder,clearSearch,filterType.*,sort.{drinkSoon,region,storage},resultCount.*,clearFilters,noResults.*,drinkWindow.*,tasted.*})
- 신규 컴포넌트 포팅: 5개 (TabSegment, TypeFilterChips, SortChips, DrinkWindowBadge, TastedWineRow)
- 재작성: 3개 (CellarCard row→grid, SearchSortBar, CellarTabs)
- 신규 lib: 1개 (drink-window.ts 단순화 포팅)
- 신규 hook: 1개 (useTastedWines — tasted 탭 채택 시)
- escalation: 9건 (§12) — 가장 중요: tasted 탭 데이터 모델, AddCta 동작, swipe 제거, drink-window 단순화 범위, light mode gold a11y
- **rn-screen-builder 작업 추정**: P0 셀러 탭만 2일 (Day 6/7 마감). tasted 탭은 P1.
