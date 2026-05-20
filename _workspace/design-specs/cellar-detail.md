# cellar-detail (`/cellar/[lwin]`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen `messages/{ko,en}.json` `cellar.*` > design-system docs > 우리 design-tokens.
> 작성일: 2026-05-20 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/cellar/[id]/page.tsx` (447 lines — `CellarItemDetailPage` + 인라인 `MetaCard` + `DrinkWindowTimeline` + `capitalize`)
- 자식 컴포넌트 (재귀 read 8개):
  - `../winemine-keyscreen/src/components/nav/back-header.tsx` (82 LOC — 56px header, ChevronLeft 24 + title)
  - `../winemine-keyscreen/src/components/shared/locale-text.tsx` (40 LOC — ko/en 분기)
  - `../winemine-keyscreen/src/components/shared/wine-label-art.tsx` (77 LOC — 라벨 placeholder SVG-free; 그라데이션 + 이니셜)
  - `../winemine-keyscreen/src/components/shared/confirm-dialog.tsx` (109 LOC — Modal 변형)
  - `../winemine-keyscreen/src/components/cellar/drink-window-badge.tsx` (66 LOC — 5 status pill)
  - `../winemine-keyscreen/src/components/cellar/drink-this-button.tsx` (64 LOC — Wine-red CTA + ConfirmDialog → /notes/new/write)
  - `../winemine-keyscreen/src/components/wine-detail/review-card.tsx` (118 LOC — 닉네임 + LevelPill + ReviewBadge + body + rating + date)
  - `../winemine-keyscreen/src/components/shared/{level-pill, review-badge}.tsx` (ReviewCard 의존)
- 도메인 lib:
  - `../winemine-keyscreen/src/lib/drink-window.ts` (202 LOC — `getDrinkWindow` 휴리스틱 + `getDrinkWindowStatus` 5단계)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- 산문 명세: `../winemine-keyscreen/screen-specs/cellar-detail.md` (186 LOC — 키스크린 본인 정리본; JSX와 일치)
- i18n: `../winemine-keyscreen/messages/{ko,en}.json` 네임스페이스 `cellar.{drinkWindow|notify|meta}` line 129~178
- 스크린샷 reference: `_workspace/keyscreen-shots/cellar_lwin.png` (Château Margaux 2018, dark, ko — 헤더(< Château Margaux) / 240px 와인 히어로(그라데이션 + 라벨 아트 + 와인명/생산자/지역) / drink window 카드("지금 마시기 좋아요" 칩 + "2026–2050" + timeline + "2035년에 절정 도달 · 절정까지 +9년") / 알림 토글 ON / 메타 2×2 그리드(보관 위치=셀러, 구매일=2025-10-04, 구매가=₩1,180,000, 메모) / 다른 사람의 리뷰 3건 (L4 소믈리에 / L2 애호가 / L5 마스터) / "와인 상세 보기 →" / 풀폭 와인레드 CTA "이 와인 마시기")
- 현재 RN 구현 (retroactive 대상): `app/(tabs)/cellar/[lwin].tsx` (236 LOC) + `src/components/cellar/{drink-window-badge, cellar-fields}.tsx` (140 LOC) + `src/components/wine/{wine-hero, drinking-window-bar, add-to-cellar-sheet}.tsx`

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/(tabs)/cellar/[lwin].tsx` (그대로 유지 — `(tabs)` 그룹 내부) |
| 진입 경로 | `/cellar/[lwin]` (param: LWIN 7자리; optional `?id=<cellar_item_id>`) |
| 진입 트리거 | `/(tabs)/cellar` CellarCard 탭 / 알림 `drinkWindowReached + cellar_item_id` 클릭 (v0.2.0) / 노트 상세의 "셀러 항목 보기" |
| 헤더 | 화면 내부 `<BackHeader title={wineNameLocalized} />` — `(tabs)` 그룹 내부지만 detail 스택 |
| BottomNav | **표시함** (`(tabs)` 그룹 내부) — 키스크린 page.tsx에는 BottomNav 명시 없지만 우리 expo-router 구조상 표시. **§8 deviation** (의도 — 셀러 탭에서 detail로 들어와도 nav 유지) |
| 가드 | `lwin` query missing → not-found state · `item==null` → not-found state · `wine==null` 또는 `dw==null`/`status==null` → not-found state |
| 다크/라이트 | 둘 다 지원 |
| 도메인 분기 | item.status (`cellared` ↔ `consumed`) — 키스크린은 분기 없음 (cellared 전제). 우리 RN은 `consumed` 시 "셀러로 되돌리기" 표기 — §4 variants |

> **현재 RN 차이**: keyscreen은 `cellar_items.id` 기반 lookup (`getCellarItem(params.id)`). 우리 RN은 `wine_lwin` + optional `?id=...` 둘 다 지원 (`useCellarItem(lwin, cellarItemId)`). param 형태 차이는 라우팅만 — UX 동일. **§9 escalation**.

---

## 2. Layout Tree (verbatim 변환)

keyscreen `page.tsx` line 63~322 그대로 RN 트리화. status 기본 `cellared` 기준.

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader (height 56, padding 0 16, flex row items-center justify-between)            ← keyscreen back-header.tsx line 34~80
│     ├── Left (flex row items-center gap=4, min-w-0, flex-1)
│     │     ├── BackButton (32×32, ChevronLeft 24 stroke 1.75, color cream/text-primary)
│     │     └── Title (Inter 16 600, cream/text-primary, lh 1.2, 1줄 truncate)
│     │           - value: wineName localized (`getLocalizedWineName(currentLocale(), wine).primary`)
│     └── Right slot: 없음 (cellar/[lwin]에는 share 등 무첨가)
│
├── ScrollView (flex-1, refreshControl optional, contentContainerStyle={paddingBottom:112, gap:16}, showsVerticalScrollIndicator=false)
│   │
│   │ keyscreen `<main style={{paddingBottom:96, display:flex, flexDirection:column, gap:16}}>` 직매핑.
│   │ paddingBottom 112 = keyscreen 96 + RN BottomNav 자동 인셋 16 보정 (CTA absolute 안 가리도록).
│   │
│   ├── ┌─ Section 1: Wine Hero  ───────────────────────────────────  ← keyscreen line 71~128
│   │   │  data-feature-id="cellarDetail.wineHero"
│   │   │  padding 0 16 8 (= mx-4 + paddingBottom 8)
│   │   │
│   │   ├── HeroFrame (height 240, radius 18, border 1px border-default, overflow hidden,
│   │   │             flex items-center justify-center, position relative)
│   │   │     └── LinearGradient outer (160deg, ${wine.bottle_color} 0% → #1a0a1e 70%)
│   │   │           └── WineLabelArt (width 100, height 150, rounded 8)
│   │   │                 - inner gradient: 160deg, bottle_color 0% → shade(bottle_color,-20) 60% → shade(bottle_color,-40) 100%
│   │   │                 - border 1px rgba(201,168,76,0.18) (gold soft)
│   │   │                 - center: wine.display_name.charAt(0) (Playfair 400, lh 0, color cream)
│   │   │                 - fontSize: max(20, min(100,150)*0.42) = max(20, 42) = 42
│   │   │                 - 상단 highlight overlay: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%) top 40%
│   │   ├── h1 (mt 12 mb 4): Playfair 24, cream/text-primary
│   │   │     - value: wine.display_name (keyscreen wine.name) — `WineNameDisplay` size=title 또는 raw Text
│   │   ├── ProducerLine: Inter 13, text-secondary
│   │   │     - value: `${producer_name ?? ''} · ${vintage}` (vintage null이면 — 또는 LWIN parse fallback)
│   │   └── RegionLine (mt 2): Inter 12, text-muted
│   │         - value: `${region ?? ''} · ${country ?? ''}` (둘 다 없으면 행 생략)
│   │
│   ├── ┌─ Section 2: Drink Window Card  ────────────────────────────  ← keyscreen line 130~176
│   │   │  data-feature-id="cellarDetail.drinkWindowCard"
│   │   │  margin 0 16 (= mx-4), padding 16, radius 16, bg-surface, border 1px border-default
│   │   │
│   │   ├── HeaderRow (flex row items-center justify-between, mb=12)
│   │   │     ├── DrinkWindowBadge (status, fromYear={dw.from})  ← §3-6 자세히
│   │   │     │     - 5 status pill (peak / opening / mature / too-young / past-peak)
│   │   │     │     - 기존 RN `src/components/cellar/drink-window-badge.tsx` 재사용
│   │   │     └── RangeText: Inter 11, text-muted
│   │   │           - value: t('cellar.drinkWindow.fromTo', {from: dw.from, to: dw.to}) → "2026년 ~ 2050년" / "2026 – 2050"
│   │   ├── DrinkWindowTimeline (height 28, position relative)
│   │   │     - keyscreen line 372~447 인라인 컴포넌트. **신규 RN 컴포넌트 필요**.
│   │   │     - 자세히 §3-7
│   │   └── TipRow (mt=12, Inter 12, text-secondary)
│   │         - mainText: t('cellar.drinkWindow.tip', {year: dw.peak}) → "이 와인은 2035년에 절정에 도달합니다"
│   │         - if yearsToPeak > 0: 인라인 gold span (ml=6) `· t('cellar.drinkWindow.peakInYears', {n: yearsToPeak})` → "절정까지 +9년"
│   │
│   ├── ┌─ Section 3: Notify Toggle  ───────────────────────────────  ← keyscreen line 178~240
│   │   │  data-feature-id="cellarDetail.notifyToggle"
│   │   │  margin 0 16, padding 14 16, radius 14, bg-surface, border 1px border-default,
│   │   │  flex row items-center justify-between
│   │   │
│   │   ├── Label: Inter 13 500, cream/text-primary
│   │   │     - value: t('cellar.notify.label') → "절정 시점에 알림받기" / "Notify me at peak"
│   │   └── Switch (44×26 outer, role=switch)
│   │         - ON: bg brand.gold, knob left=21
│   │         - OFF: bg border-default, knob left=3
│   │         - knob: 20×20, top 3, bg cream, radius 10
│   │         - press → setNotify(!notify) + toast (`cellar.notify.toggledOn/Off`)
│   │
│   ├── ┌─ Section 4: Meta Grid 2×2  ──────────────────────────────  ← keyscreen line 242~263
│   │   │  data-feature-id="cellarDetail.metaGrid"
│   │   │  margin 0 16, grid-template-columns 1fr 1fr, gap 10
│   │   │  → RN: `<View className="mx-4 flex-row flex-wrap" style={{gap:10}}>` 4개 MetaCard `style={{width:'48%'}}` (gap 10 보정)
│   │   │
│   │   ├── MetaCard[storage]   - label `cellar.meta.storage` / value t(`cellar.meta.storage${Capitalize(storage)}`)
│   │   ├── MetaCard[acquiredAt] - label `cellar.meta.acquiredAt` / value `acquired_at.slice(0,10)` (YYYY-MM-DD)
│   │   ├── MetaCard[price]     - label `cellar.meta.price` / value `purchase_price_krw` 있으면 `₩{N.toLocaleString()}`, 없으면 `—`
│   │   └── MetaCard[memo]      - label `cellar.meta.memo` / value `notes` (LocalizedString) ? <LocaleText/> : `cellar.meta.memoEmpty` ("메모 없음")
│   │
│   │   MetaCard 구조 (keyscreen line 325~365 인라인):
│   │     - padding 12 14, bg-surface, border 1px border-default, radius 12, minHeight 64
│   │     - label: Inter 11, text-muted, mb=4
│   │     - value: Inter 13 500, cream/text-primary (LocaleText 지원)
│   │
│   └── ┌─ Section 5: Community Reviews  ─────────────────────────  ← keyscreen line 266~302
│       │  data-feature-id="cellarDetail.reviews"
│       │  margin 0 16, 조건부 (reviews.length > 0)
│       │
│       │  **v0.1.0 SCOPE-OUT**: 우리 RN은 community reviews 데이터 부재 (tasting_notes.is_public 필드는 있지만 다른 사용자 노트 집계 미구현).
│       │  → §4 variants에 "communityReviews: hidden (v0.1.0)" 명시. keyscreen verbatim은 v0.2.0 hardening 대상.
│       │  → v0.1.0은 **자기 노트 카운트 섹션** ("내 노트 {count}개")으로 대체 (이미 RN 구현됨 — keyscreen verbatim 위반 아닌 SCOPE-OUT).
│       │
│       ├── h2: Inter 14 600, cream/text-primary, mb=8
│       │     - value: t('cellar.communityReviews') → "다른 사람의 리뷰" / "Community reviews"
│       │     - v0.1.0: t('cellar.detail.section.notes') → "내 노트" (current RN)
│       ├── ReviewList (column, gap 10)
│       │     └── ReviewCard × min(3, reviews.length)
│       │           - 닉네임 + LevelPill (L1~L5) + ReviewBadge × ≤2  (keyscreen review-card.tsx CRITICAL 규칙)
│       │           - body (LocaleText)
│       │           - rating 우하단 + createdAt 좌하단
│       │           - 자세히 §3-9
│       └── ViewWineDetailsLink (mt 12, Inter 12 600 gold, inline-block)
│             - href: `/wine/${wine.lwin}`
│             - value: t('cellar.viewWineDetails') + ' →' → "와인 상세 보기 →"
│
└── ┌─ Section 6: DrinkThis Bottom Fixed CTA  ──────────────────────  ← keyscreen line 305~320
    │  data-feature-id="cellarDetail.drinkThis"
    │  position absolute, bottom 0, left/right 0, padding 12 16 18, zIndex 10
    │  background LinearGradient(180deg, rgba(5,2,10,0) 0% → rgba(5,2,10,0.95) 60%)
    │  → RN: `<View pointerEvents="box-none" style={StyleSheet.absoluteFill}>` 외곽 + 내부 LinearGradient + 버튼
    │
    └── DrinkThisButton (cellarItemId)
          - width 100%, height 52, radius 14, bg brand.wineRed
          - inline-flex items-center justify-center gap 8
          - label Inter 15 600 cream
          - icon GlassWater 18 strokeWidth 1.75 (lucide-react-native)
          - press → ConfirmDialog → 확정 시 router.push(`/notes/new/write?from=cellar&wine_lwin=${lwin}&itemId=${id}`)
```

---

## 3. NativeWind v4 매핑표 (verbatim)

각 요소의 keyscreen 인라인 style → RN+NW v4 className/style. 토큰은 `src/lib/design-tokens.ts` + `tailwind.config.ts` 기준.

### 3-1. BackHeader (공통)

wine-detail 사양 §3-2 동일. cellar/[lwin]은 right slot 없음 (Share/Favorite 토글 미사용).

### 3-2. Wine Hero (Section 1)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Section outer | `position relative; padding 0 16 8` | `<View className="px-4 pb-2">` |
| HeroFrame | `height 240; borderRadius 18; background linear-gradient(160deg, ${wine.bottleColor} 0%, #1a0a1e 70%); overflow hidden; border 1px var(--color-border-default); position relative; display flex; alignItems center; justifyContent center` | `<LinearGradient colors={[bottleColor, dark.bg.bottleShelf /* light: light.bg.bottleShelf */]} locations={[0, 0.7]} start={{x:0, y:0}} end={{x:0.342, y:0.94}} style={{height:240, borderRadius:18, borderWidth:1, borderColor:currentBorderDefault, overflow:'hidden', alignItems:'center', justifyContent:'center'}}>` |
| WineLabelArt outer | `width 100; height 150; borderRadius 8; background linear-gradient(160deg, ${bc} 0%, shade(bc,-20) 60%, shade(bc,-40) 100%); border 1px rgba(201,168,76,0.18); display flex items-center justify-center; color cream; Playfair 400; fontSize 42; flexShrink 0; position relative; overflow hidden` | `<LinearGradient colors={[bottleColor, shade(bottleColor,-20), shade(bottleColor,-40)]} locations={[0, 0.6, 1]} start={{x:0, y:0}} end={{x:0.342, y:0.94}} style={{width:100, height:150, borderRadius:8, borderWidth:1, borderColor:withAlpha(brand.gold, 0.18), alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0}}>` — `<Text style={{fontFamily:'PlayfairDisplay_400Regular', fontSize:42, color:brand.cream, letterSpacing:-0.84, textTransform:'uppercase', zIndex:1}}>{display_name.charAt(0)}</Text>` |
| WineLabelArt highlight overlay | `position absolute; top 0; left 0; right 0; height 40%; background linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%); pointerEvents none` | `<LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0.10)','rgba(255,255,255,0)']} start={{x:0.5, y:0}} end={{x:0.5, y:1}} style={{position:'absolute', top:0, left:0, right:0, height:'40%'}}/>` |
| h1 (wine name) | `fontFamily Playfair; fontSize 24; color var(--color-cream); margin 12 0 4` | `<Text className="font-playfair text-text-primary dark:text-text-primary" style={{fontSize:24, marginTop:12, marginBottom:4}} numberOfLines={2}>{wineName}</Text>` (또는 `<WineNameDisplay size="title">`) |
| ProducerLine | `fontFamily Inter; fontSize 13; color var(--color-text-secondary)` | `<Text className="font-inter text-[13px] text-text-secondary dark:text-text-secondary" numberOfLines={1}>{producer_name && vintage ? `${producer_name} · ${vintage}` : (producer_name || vintage?.toString() || '')}</Text>` |
| RegionLine | `fontFamily Inter; fontSize 12; color var(--color-text-muted); marginTop 2` | `<Text className="font-inter text-[12px] text-text-muted dark:text-text-muted" style={{marginTop:2}} numberOfLines={1}>{[region, country].filter(Boolean).join(' · ')}</Text>` (둘 다 없으면 render 생략) |

> **shade() 헬퍼**: keyscreen `wine-label-art.tsx` line 69~76의 `shade(hex, percent)`. RN에서도 동일 함수 필요 — `src/lib/color.ts` 신규 또는 `design-tokens.ts` 내 export. **§9 escalation**.

### 3-3. Drink Window Card (Section 2)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Section outer | `margin 0 16; padding 16; borderRadius 16; background var(--color-surface); border 1px var(--color-border-default)` | `<View className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4">` |
| HeaderRow | `display flex; alignItems center; justifyContent space-between; marginBottom 12` | `<View className="flex-row items-center justify-between mb-3">` |
| RangeText | `fontFamily Inter; fontSize 11; color var(--color-text-muted)` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{t('cellar.drinkWindow.fromTo', {from: dw.from, to: dw.to})}</Text>` |
| TipRow | `marginTop 12; fontFamily Inter; fontSize 12; color var(--color-text-secondary)` | `<Text className="font-inter text-[12px] text-text-secondary dark:text-text-secondary mt-3">{t('cellar.drinkWindow.tip', {year: dw.peak})}{yearsToPeak > 0 && <Text style={{color:brand.gold, marginLeft:6}}> · {t('cellar.drinkWindow.peakInYears', {n: yearsToPeak})}</Text>}</Text>` |

### 3-4. DrinkWindowTimeline (Section 2 — keyscreen 인라인 → 신규 컴포넌트)

keyscreen `page.tsx` line 372~447 인라인 `DrinkWindowTimeline` → `src/components/cellar/drink-window-timeline.tsx` **신규**. cellar-list의 DrinkWindowBadge와 별개.

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Container | `position relative; height 28` | `<View style={{position:'relative', height:28}}>` |
| Track bar | `position absolute; top 12; left 0; right 0; height 4; borderRadius 2; background linear-gradient(90deg, rgba(155,139,122,0.3) 0%, var(--color-gold) 45%, var(--color-wine-red) 50%, var(--color-gold) 55%, rgba(155,139,122,0.3) 100%)` | `<LinearGradient colors={[withAlpha('#9B8B7A', 0.3), brand.gold, brand.wineRed, brand.gold, withAlpha('#9B8B7A', 0.3)]} locations={[0, 0.45, 0.5, 0.55, 1]} start={{x:0, y:0.5}} end={{x:1, y:0.5}} style={{position:'absolute', top:12, left:0, right:0, height:4, borderRadius:2}}/>` |
| Peak marker | `position absolute; top 6; left ${peakPct}%; width 2; height 16; background var(--color-wine-red); transform translateX(-50%)` | `<View aria-hidden style={{position:'absolute', top:6, left:`${peakPct}%`, width:2, height:16, backgroundColor:brand.wineRed, marginLeft:-1}}/>` (transform translateX → marginLeft 대체) |
| Current dot | `position absolute; top 4; left ${nowPct}%; width 12; height 12; borderRadius 6; background var(--color-cream); border 2px solid var(--color-bg-deepest); transform translateX(-50%); marginTop 4` | `<View accessibilityLabel={`current ${now}`} style={{position:'absolute', top:8, left:`${nowPct}%`, width:12, height:12, borderRadius:6, backgroundColor:brand.cream, borderWidth:2, borderColor: scheme==='light' ? light.bg.deepest : dark.bg.deepest, marginLeft:-6}}/>` (top 4 + marginTop 4 = top 8) |
| End labels (from/to) | `position absolute; top 22; left 0; right 0; display flex; justifyContent space-between; Inter 10; color var(--color-text-muted)` | `<View style={{position:'absolute', top:22, left:0, right:0, flexDirection:'row', justifyContent:'space-between'}}><Text className="font-inter text-[10px] text-text-muted dark:text-text-muted">{from}</Text><Text className="font-inter text-[10px] text-text-muted dark:text-text-muted">{to}</Text></View>` |

ratio 계산 (verbatim):
```ts
const total = to - from;
const nowPct  = total > 0 ? Math.max(0, Math.min(100, ((now - from) / total) * 100)) : 50;
const peakPct = total > 0 ? ((peak - from) / total) * 100 : 50;
```

### 3-5. Notify Toggle (Section 3)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Section outer | `margin 0 16; padding 14 16; borderRadius 14; background surface; border 1px border-default; display flex; alignItems center; justifyContent space-between` | `<View className="mx-4 flex-row items-center justify-between bg-surface dark:bg-surface border border-border-default" style={{paddingHorizontal:16, paddingVertical:14, borderRadius:14}}>` |
| Label | `fontFamily Inter; fontSize 13; color cream; fontWeight 500` | `<Text className="font-inter text-[13px] text-text-primary dark:text-text-primary" style={{fontWeight:'500'}}>{t('cellar.notify.label')}</Text>` |
| Switch outer | `position relative; width 44; height 26; borderRadius 13; background notify ? gold : border-default; border none; cursor pointer; transition background 200ms; flexShrink 0` | `<Pressable accessibilityRole="switch" accessibilityState={{checked:notify}} accessibilityLabel={t('cellar.notify.label')} onPress={handleToggle} style={{position:'relative', width:44, height:26, borderRadius:13, backgroundColor: notify ? brand.gold : currentBorderDefault, flexShrink:0}}>` |
| Knob | `position absolute; top 3; left notify ? 21 : 3; width 20; height 20; borderRadius 10; background cream; transition left 200ms` | `<Animated.View style={{position:'absolute', top:3, left: knobLeft, width:20, height:20, borderRadius:10, backgroundColor:brand.cream}}/>` — `knobLeft` Reanimated `useDerivedValue(() => withTiming(notify ? 21 : 3, {duration: 200}))` |

> **간소화 옵션**: Reanimated 미사용 시 `LayoutAnimation.easeInEaseOut(200)` + 단순 `left` prop 즉시 변경. 시각 차이 미미.
> **대체 옵션**: RN `<Switch trackColor={...} thumbColor={brand.cream}/>` 사용 가능 — 단 시각 위계는 keyscreen 커스텀 토글 권장 (NativeSwitch는 플랫폼별 외관 차이).

### 3-6. DrinkWindowBadge (Section 2 헤더 — 기존 RN 재사용)

`src/components/cellar/drink-window-badge.tsx` (현재 92 LOC) **그대로 사용**. cellar-list 사양 §3-9에서 이미 hardening 완료. cellar-detail에선 `<DrinkWindowBadge status={status} dw={dw}/>` 호출만.

prop diff:
- keyscreen은 `fromYear?: number` (number 단일)
- 우리 RN은 `dw?: DrinkWindow | null` (객체 전체) — too-young 라벨에서 `dw.from` 사용
- API는 일관성 위해 후자 유지 (cellar-list와 동일).

### 3-7. MetaCard (Section 4 — keyscreen 인라인 → 신규 컴포넌트)

keyscreen `page.tsx` line 325~365 인라인 `MetaCard` → `src/components/cellar/meta-card.tsx` **신규**.

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Outer | `padding 12 14; background surface; border 1px border-default; borderRadius 12; minHeight 64` | `<View className="bg-surface dark:bg-surface border border-border-default rounded-xl" style={{paddingHorizontal:14, paddingVertical:12, minHeight:64}}>` |
| Label | `fontFamily Inter; fontSize 11; color text-muted; marginBottom 4` | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted" style={{marginBottom:4}}>{label}</Text>` |
| Value | `fontFamily Inter; fontSize 13; color cream; fontWeight 500` | `<Text className="font-inter text-[13px] text-text-primary dark:text-text-primary" style={{fontWeight:'500'}} numberOfLines={2}>{localizedValue ? <LocaleText value={localizedValue}/> : value}</Text>` |

### 3-8. MetaGrid (Section 4 wrapper)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Container | `margin 0 16; display grid; gridTemplateColumns 1fr 1fr; gap 10` | `<View className="mx-4 flex-row flex-wrap" style={{gap:10}}>` — 각 MetaCard `style={{width:'calc(50% - 5px)'}}` 또는 `flexBasis:'48%', flexGrow:1` (RN gap 지원 RN ≥ 0.71) |

> **RN flex-wrap + gap**: NW v4는 `gap-2.5` (10px) 지원. 단 2-col grid 동등은 `<View className="mx-4 flex-row flex-wrap gap-2.5">` + 각 child `style={{width:'48%'}}` (단순 계산). FlatList numColumns=2 사용 가능 (4개 fixed라 과한 추상화).

### 3-9. ReviewCard (Section 5 — keyscreen verbatim, v0.1.0 SCOPE-OUT)

**v0.1.0**: ReviewCard 미구현 — community reviews 데이터 부재. §4 variants에 명시.

**v0.2.0 keyscreen verbatim**:

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Outer Link | `display block; padding 14; background surface; border 1px border-default; borderRadius 12; textDecoration none; color inherit` | `<Pressable onPress={()=>router.push(`/profile/${userId}`)} accessibilityRole="link" className="rounded-xl bg-surface dark:bg-surface border border-border-default" style={{padding:14}}>` |
| Header row | `flex items-center gap 6 flex-wrap` | `<View className="flex-row items-center flex-wrap" style={{gap:6}}>` |
| Nickname | Inter 14 600 cream | `<Text className="font-inter-semibold text-[14px] text-text-primary dark:text-text-primary"><LocaleText value={user.displayName}/></Text>` |
| LevelPill | L1~L5 분기 (위 colors.md §3 참조) | `<LevelPill level={levelId} label={level.name.en}/>` — `src/components/shared/level-pill.tsx` 이미 존재 |
| ReviewBadge × ≤2 | Award icon, tier색 (bronze/silver/gold/platinum) | `<ReviewBadge badgeId={bid} tier={tier}/>` — **신규 컴포넌트 필요** §9 |
| Body | `<LocaleText/>` p — Inter 14 lh 1.5 secondary, mt 8 | `<Text className="font-inter text-[14px] text-text-secondary dark:text-text-secondary mt-2" style={{lineHeight:21}}>{body}</Text>` |
| Footer row | `marginTop 10; flex items-center justify-between; Inter 11 text-muted` | `<View className="flex-row items-center justify-between mt-2.5">` |
| Date | text-muted | `<Text className="font-inter text-[11px] text-text-muted dark:text-text-muted">{createdAt}</Text>` |
| Rating (beginner) | Star 12 fill gold + `{rating}/5` cream 13 | `<View className="flex-row items-center" style={{gap:4}}><Star size={12} fill={brand.gold} strokeWidth={0} color={brand.gold}/><Text className="font-inter-semibold text-[13px] text-text-primary dark:text-text-primary">{rating}/5</Text></View>` |
| Rating (expert) | `{rating}/100` gold 13 600 | `<Text className="font-inter-semibold text-[13px]" style={{color:brand.gold}}>{rating}/100</Text>` |

### 3-10. ViewWineDetailsLink (Section 5 하단)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Link | `display inline-block; marginTop 12; color gold; Inter 12 600; textDecoration none` | `<Pressable onPress={()=>router.push(`/wine/${wine.lwin}`)} accessibilityRole="link" className="self-start mt-3"><Text className="font-inter-semibold text-[12px]" style={{color:brand.gold}}>{t('cellar.viewWineDetails')} →</Text></Pressable>` |

### 3-11. DrinkThis Bottom Fixed CTA (Section 6)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Outer | `position absolute; bottom 0; left 0; right 0; padding 12 16 18; background linear-gradient(180deg, rgba(5,2,10,0) 0%, rgba(5,2,10,0.95) 60%); zIndex 10` | `<View pointerEvents="box-none" style={{position:'absolute', left:0, right:0, bottom:0, zIndex:10}}>` — 내부 `<LinearGradient colors={['rgba(5,2,10,0)', 'rgba(5,2,10,0.95)']} locations={[0, 0.6]} start={{x:0.5, y:0}} end={{x:0.5, y:1}} style={{paddingHorizontal:16, paddingTop:12, paddingBottom:18}}>` |
| DrinkThisButton | `width 100%; height 52; bg wine-red; color cream; border none; borderRadius 14; display inline-flex items-center justify-center gap 8; Inter 15 600` | `<Pressable onPress={()=>setConfirmOpen(true)} accessibilityRole="button" accessibilityLabel={t('cellar.drinkThis')} className="flex-row items-center justify-center rounded-[14px]" style={{width:'100%', height:52, backgroundColor:brand.wineRed, gap:8, ...shadows.wineRedCardLg}}>` |
| Label | text inline | `<Text className="font-inter-semibold text-[15px]" style={{color:brand.cream}}>{t('cellar.drinkThis')}</Text>` |
| GlassWater icon | lucide 18 strokeWidth 1.75 | `<GlassWater size={18} strokeWidth={1.75} color={brand.cream}/>` |

> **shadow**: keyscreen은 shadow 없음. RN에선 wine-red glow `shadows.wineRedCardLg` 추가 권장 (이미 토큰 존재) — design-reviewer 6항목 (3)gradient 깊이 채움. **§8 deviation** (의도적 enhancement).

### 3-12. ConfirmDialog (DrinkThis press 후)

| 요소 | keyscreen 인라인 | RN+NW v4 |
|---|---|---|
| Modal title | t('cellar.drinkThisConfirm') | `<Text className="font-playfair text-[22px] text-text-primary dark:text-text-primary">{t('cellar.drinkThisConfirm')}</Text>` |
| Cancel button | flex 1, height 44, radius 12, border 1px border-default, transparent, Inter 14 600 cream | `<PrimaryButton variant="secondary" size="md" label={t('common.no')} onPress={()=>setConfirmOpen(false)}/>` |
| Confirm button | flex 1, height 44, radius 12, bg wine-red, Inter 14 600 cream | `<PrimaryButton variant="primary" size="md" label={t('common.yes')} onPress={handleConfirm}/>` |

> **현재 RN**: `Alert.alert` 사용 중 (cellar/[lwin].tsx line 58~81 delete confirm). DrinkThis는 별도 ConfirmDialog (커스텀) 권장. 또는 `Alert.alert` 사용 (RN 표준; keyscreen verbatim 위반 아닌 platform standard). **§8 deviation**.

---

## 4. 상태 Variants

### 4-1. default — status `cellared` (보관 중) — keyscreen 기본

위 §2 트리 그대로. DrinkThis CTA 표시. Notify toggle 인터랙티브.

### 4-2. status `consumed` (음용 완료) — 우리 RN 도메인 분기

keyscreen에는 분기 없음 (cellared 전제). 우리 RN은 `cellar_items.status='consumed'` 지원.

| 변경점 | 내용 |
|---|---|
| Meta Grid `consumedAt` 표시 | label `cellar.meta.consumedAt` ("음용일") / value `consumed_at.slice(0,10)` — Meta Grid가 2×2 → 2×3 (또는 4번째 메모 카드 자리에) |
| DrinkThis CTA 라벨 변경 | "이 와인 마시기" → "셀러로 되돌리기" (`cellar.actions.undoConsumed`) + GlassWater 아이콘 제거 또는 변경. press → setCellarStatus(cellared). **§8 deviation** — keyscreen 미정의 |
| DrinkWindow Card | 그대로 표시 (마신 후에도 정보 가치) — 단 yearsToPeak 강조색은 텍스트만 |

### 4-3. loading

```
<View flex-1 bg-bg-deepest>
  <BackHeader title="" />
  <View flex-1 items-center justify-center>
    <ActivityIndicator color={brand.gold} />
  </View>
</View>
```

현재 RN 그대로 (line 84~93).

### 4-4. not-found (item null / wine null / dw null / status null)

keyscreen line 47~58 verbatim:
- BackHeader (title 없음)
- 24px padding, color text-muted, message: "셀러 항목을 찾을 수 없어요" / "Cellar item not found"

우리 RN line 95~118 enhanced — `EmptyState` + AlertCircle 아이콘 48 gold + PrimaryButton "뒤로 가기" → router.back(). **현재 enhanced 유지 (keyscreen verbatim 위반 아닌 UX 개선)**.

i18n 키: `cellar.detail.notFound.{title, description, back}` (이미 존재).

### 4-5. dark / light

| 토큰 | dark | light | 사용 |
|---|---|---|---|
| `bg-deepest` | `#251837` | `#FAF5EC` | Screen outer |
| `bg-surface` | `#3D2A4A` | `#FFFFFF` | Drink window card / Notify / MetaCard / ReviewCard |
| `border-default` | `#5A3D6A` | `#E0D2BC` | 모든 카드 border |
| `text-primary` (cream) | `#F8F4ED` | `#2A1A14` | wine name / MetaCard value / Label |
| `text-secondary` | `#EBE0CB` | `#5A463C` | Producer line / Tip mainText |
| `text-muted` | `#CABDA8` | `#8B7766` | Region line / RangeText / Date / MetaCard label |
| `bg-deepest` (Timeline dot border) | `#251837` | `#FAF5EC` | DrinkWindowTimeline current dot border |
| `wine-red` | `#8B1A2A` (fixed) | `#8B1A2A` (fixed) | Peak marker / DrinkThis CTA bg |
| `gold` | `#C9A84C` (fixed) | `#C9A84C` (fixed) | yearsToPeak text / Switch ON / Timeline gold stops / ViewWineDetails link |
| Switch OFF track | `border-default` `#5A3D6A` | `#E0D2BC` | OFF state |
| Hero gradient end (#1a0a1e) | `#1a0a1e` (fixed) | `#1a0a1e` (fixed) | Hero outer gradient end — **keyscreen verbatim, light 모드에서도 같은 dark 끝점 사용** (와인병의 어두운 분위기 유지) |
| WineLabelArt highlight overlay | rgba(255,255,255,0.10→0) | 동일 | 양쪽 모드 동일 (라벨 광택 effect) |
| Bottom fade rgba(5,2,10) | dark only | **§8 deviation**: light는 `rgba(250,245,236, 0.95)` (light bg-deepest) | DrinkThis 배경 fade — 양쪽 모드 대응 필요 |

> **light 모드 fade 결정 필요**: keyscreen의 `rgba(5,2,10,0.95)`는 dark만 가정. light에선 화면 색에 부조화. 우리 권장: scheme 분기 — `dark.bg.deepest` alpha 0.95 (dark) vs `light.bg.deepest` alpha 0.95 (light). **§9 escalation**.

### 4-6. 도메인 분기

| 케이스 | 처리 |
|---|---|
| vintage 미상 (wine.vintage == null) | ProducerLine: producer만 표시 (`${producer}`만), `· ` 구분자 생략 |
| vintage LWIN parse fallback | `parseLwinVintage(lwin)` 시도 (기존 RN 패턴) |
| producer 미상 | ProducerLine 전체 생략 또는 vintage만 표시 |
| region/country 둘 다 미상 | RegionLine 전체 생략 (render `null`) |
| bottle_color 미상 | `getDefaultBottleColor(type_canonical)` fallback (기존 RN `lib/lwin.ts`) |
| purchase_price_krw == null | MetaCard value `—` |
| notes == null | MetaCard memo value `cellar.meta.memoEmpty` ("메모 없음") |
| acquired_at == null | MetaCard value `—` 또는 카드 자체 hide (가드 필요) |
| drink_window_from_year == null | DrinkWindow Card 전체 generate fallback — `getDrinkWindow()` 휴리스틱 사용 (vintage + 와인 type/region) 또는 카드 숨김. v0.1.0 우선 휴리스틱 사용, fallback 시 cellar.drinkWindow.empty 토스트 (§5) |
| status `too-young` | Badge "지금부터" + Timeline current dot 좌측 (from 미달) |
| status `past-peak` | Badge "절정 지남" muted + yearsToPeak < 0 → 표시 안 함 |

---

## 5. 인터랙션

| 위치 | 액션 | 결과 |
|---|---|---|
| BackHeader < button | press | `router.back()` (또는 fallback `router.replace('/(tabs)/cellar')`) |
| Notify Toggle Switch | press | `setNotify(!notify)` + Toast `cellar.notify.{toggledOn,toggledOff}`. **v0.1.0**: localStorage 미저장 (keyscreen 동일). v0.2.0: `notification_preferences` 테이블 upsert |
| ReviewCard (v0.2.0) | press | `router.push(`/profile/${userId}`)` — v0.1.0 SCOPE-OUT |
| ViewWineDetailsLink | press | `router.push(`/wine/${wine.lwin}`)` |
| DrinkThis CTA | press | `setConfirmOpen(true)` → ConfirmDialog. 확정 → (1) `setCellarStatus(item.id, 'consumed')` (2) `router.push(`/notes/new/write?from=cellar&wine_lwin=${lwin}&itemId=${item.id}`)` (3) draft seed (keyscreen에는 localStorage; 우리는 노트 작성 화면 진입 시 prefill) |
| Edit CTA (cellar-fields.tsx → AddToCellarSheet) | press | BottomSheet open (현재 RN), 편집 후 refresh — keyscreen 미정의, **§8 deviation** (우리 enhancement 유지) |
| Delete (현재 RN line 56~82) | press | `Alert.alert` confirm → `deleteCellarItem(item.id)` → router.back(). **현재 RN 유지** — keyscreen 미정의 |
| Status toggle (cellared ↔ consumed) | press | `setCellarStatus(item.id, next)` + refresh. **현재 RN 유지** — keyscreen 미정의 |
| ScrollView | pull-to-refresh | `refresh()` (옵션) — keyscreen 미구현, RN 권장 |
| ScrollView | scroll | DrinkThis bottom fade는 absolute (스크롤과 무관) |

**Haptics**:
- BackHeader press: `Haptics.selectionAsync()`
- Notify Toggle: `Haptics.selectionAsync()`
- DrinkThis press: `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` (강조 액션)
- Delete confirm: `Haptics.notificationAsync(NotificationFeedbackType.Warning)`

**Toast tone** (현재 RN useToast 패턴):
- success: status 변경 / 삭제 성공 / Notify ON
- error: status 변경 실패 / 삭제 실패

---

## 6. 접근성

| 요소 | a11y |
|---|---|
| Screen root | `<View accessibilityRole="none">` (SafeAreaView) |
| BackHeader title | `<Text accessibilityRole="header" aria-level={1}>{wineName}</Text>` — RN: `accessibilityRole="header"` |
| BackButton | `accessibilityRole="button"` + `accessibilityLabel={t('common.back')}` ("뒤로 가기") + hitSlop 8 |
| HeroFrame WineLabelArt | `accessibilityElementsHidden={true}` (decorative) — keyscreen `aria-hidden` 동일 |
| h1 wine name | `accessibilityRole="header"` + `accessibilityLabel={wineNameLocalized + ", " + producer + ", " + vintage}` (조합 라벨) |
| DrinkWindowBadge | `accessibilityRole="text"` + `accessibilityLabel={t(`cellar.drinkWindow.a11y.${status}`, {from, peak, to, year: dw.peak})}` |
| DrinkWindowTimeline current dot | `accessibilityLabel={t('cellar.drinkWindow.a11y.currentYear', {year: now})}` ("현재 {year}년") |
| DrinkWindowTimeline peak marker | `accessibilityElementsHidden={true}` (decorative) |
| Notify Switch | `accessibilityRole="switch"` + `accessibilityState={{checked:notify}}` + `accessibilityLabel={t('cellar.notify.label')}` + `accessibilityHint={t('cellar.notify.a11yHint')}` ("절정 도달 시 푸시 알림을 받을지 결정합니다") |
| MetaCard | container `accessibilityRole="none"` — label+value 별도 Text 둘 다 읽힘 |
| MetaCard label | `accessibilityRole="text"` (caption) |
| MetaCard value | `accessibilityRole="text"` |
| ReviewCard (v0.2.0) | `accessibilityRole="link"` + `accessibilityLabel="{nickname}, level {n}, rating {r}, {body 30자}"` 조합 |
| ViewWineDetailsLink | `accessibilityRole="link"` + `accessibilityLabel={t('cellar.viewWineDetails')}` |
| DrinkThis CTA | `accessibilityRole="button"` + `accessibilityLabel={t('cellar.drinkThis')}` + `accessibilityHint={t('cellar.detail.a11y.drinkThisHint')}` ("셀러에서 제거하고 노트 작성으로 이동") |
| 모든 텍스트 | `allowFontScaling` 기본 (false 고정 X — 시스템 글꼴 크기 존중) — 단 Switch knob 같은 고정 사이즈 컴포넌트는 `allowFontScaling={false}` 가능 |
| Focus 순서 (Tab 키) | Back → wine name (heading) → DrinkWindow badge → Switch → 4×MetaCard → ReviewCard × N → ViewWineDetails → DrinkThis CTA |
| Color contrast (WCAG AA) | text-primary on bg-surface dark `#F8F4ED on #3D2A4A` = 9.9:1 PASS · light `#2A1A14 on #FFFFFF` = 15.9:1 PASS · DrinkThis cream on wine-red = 5.4:1 PASS · Gold on bg-surface dark 4.5:1 ≤ 경계 (검증 필요) — design-reviewer 검증 요청 |

---

## 7. i18n 키 (ko/en)

기존 우리 RN `src/lib/i18n/{ko,en}.json` `cellar.*` 네임스페이스에 다음 항목 **추가 필요**. 기존 키는 ✓ 표기.

### 7-1. cellar.drinkWindow.*

| key | ko | en | 상태 |
|---|---|---|---|
| `cellar.drinkWindow.now` | "지금 마시기 좋아요" | "Drink now" | ✓ |
| `cellar.drinkWindow.fromYear` | "{{year}}년부터" | "From {{year}}" | ✓ |
| `cellar.drinkWindow.peak` | "절정" | "Peak" | ✓ |
| `cellar.drinkWindow.pastPeak` | "절정 지남" | "Past peak" | ✓ |
| `cellar.drinkWindow.tooYoung` | "아직 일러요" | "Too young" | ✓ |
| `cellar.drinkWindow.mature` | "성숙기" | "Mature" | ✓ |
| `cellar.drinkWindow.tip` | "이 와인은 {{year}}년에 절정에 도달합니다" | "This wine peaks in {{year}}" | **추가** |
| `cellar.drinkWindow.peakInYears` | "절정까지 +{{n}}년" | "+{{n}} years to peak" | **추가** |
| `cellar.drinkWindow.fromTo` | "{{from}}년 ~ {{to}}년" | "{{from}} – {{to}}" | **추가** |
| `cellar.drinkWindow.empty` | "음용 적기 정보 없음" | "Drink window unavailable" | (wineDetail에 있음 — 재사용 또는 cellar로 alias) |
| `cellar.drinkWindow.a11y.currentYear` | "현재 {{year}}년" | "Current year {{year}}" | **추가** |
| `cellar.drinkWindow.a11y.peak` | "절정 — {{year}}년" | "Peak in {{year}}" | **추가** |
| `cellar.drinkWindow.a11y.opening` | "지금이 마실 적기, {{from}}년부터 {{to}}년까지" | "Drinking window open, {{from}} to {{to}}" | **추가** |
| `cellar.drinkWindow.a11y.mature` | "성숙기, {{to}}년까지" | "Mature, until {{to}}" | **추가** |
| `cellar.drinkWindow.a11y.tooYoung` | "아직 일러요, {{from}}년부터 마실 수 있어요" | "Too young, drinkable from {{from}}" | **추가** |
| `cellar.drinkWindow.a11y.pastPeak` | "절정 지남, {{to}}년 이후" | "Past peak, after {{to}}" | **추가** |

### 7-2. cellar.notify.*

| key | ko | en | 상태 |
|---|---|---|---|
| `cellar.notify.label` | "절정 시점에 알림받기" | "Notify me at peak" | **추가** |
| `cellar.notify.toggledOn` | "알림이 켜졌어요" | "Notifications enabled" | **추가** |
| `cellar.notify.toggledOff` | "알림이 꺼졌어요" | "Notifications disabled" | **추가** |
| `cellar.notify.a11yHint` | "절정 도달 시 푸시 알림을 받을지 결정합니다" | "Toggle to receive push when peak is reached" | **추가** |

### 7-3. cellar.meta.*

| key | ko | en | 상태 |
|---|---|---|---|
| `cellar.meta.storage` | "보관 위치" | "Storage" | (현재 RN은 `cellar.add.storage` 사용 — alias 필요) |
| `cellar.meta.acquiredAt` | "구매일" | "Acquired" | ✓ (현재 "획득" → "구매일"로 변경, keyscreen verbatim) |
| `cellar.meta.consumedAt` | "음용일" | "Consumed" | ✓ ("음용" → "음용일") |
| `cellar.meta.price` | "구매가" | "Price" | ✓ ("원" → "구매가" 키스크린 verbatim) |
| `cellar.meta.memo` | "메모" | "Memo" | **추가** |
| `cellar.meta.memoEmpty` | "메모 없음" | "No memo" | **추가** |
| `cellar.meta.storageCellar` | "셀러" | "Cellar" | **추가** |
| `cellar.meta.storageFridge` | "냉장고" | "Fridge" | **추가** |
| `cellar.meta.storageRoom` | "실온" | "Room" | **추가** |
| `cellar.meta.storageOffsite` | "외부" | "Offsite" | **추가** |

### 7-4. cellar 본체

| key | ko | en | 상태 |
|---|---|---|---|
| `cellar.drinkThis` | "이 와인 마시기" | "Drink this wine" | **추가** |
| `cellar.drinkThisConfirm` | "셀러에서 이 와인을 마셨다고 기록할까요?" | "Mark this cellar wine as consumed?" | **추가** |
| `cellar.communityReviews` | "다른 사람의 리뷰" | "Community reviews" | **추가** (v0.2.0) |
| `cellar.viewWineDetails` | "와인 상세 보기" | "See wine details" | **추가** |

### 7-5. cellar.detail.a11y.*

| key | ko | en | 상태 |
|---|---|---|---|
| `cellar.detail.a11y.drinkThisHint` | "셀러에서 제거하고 노트 작성으로 이동합니다" | "Removes from cellar and opens tasting note" | **추가** |
| `cellar.detail.a11y.heroLabel` | "{{wineName}}, {{producer}}, {{vintage}}" | "{{wineName}}, {{producer}}, {{vintage}}" | **추가** |

### 7-6. common.*

| key | ko | en | 상태 |
|---|---|---|---|
| `common.yes` | "예" | "Yes" | (확인 필요) |
| `common.no` | "아니오" | "No" | (확인 필요) |
| `common.back` | "뒤로 가기" | "Back" | (확인 필요) |

> **i18n 총 신규 추가**: 약 **27개** 키 (a11y 포함). qa-inspector ko/en 누락 grep 통과 기준.

---

## 8. RN Deviation 사유

| keyscreen | RN | 사유 |
|---|---|---|
| `position absolute` bottom fade (rgba 5,2,10 fixed) | light 모드 `rgba(250,245,236, 0.95)` 분기 | light 모드에서 dark fade는 부조화. scheme-aware. §4-5 |
| Hero gradient end `#1a0a1e` (light에서도 dark) | dark 그대로 유지 — verbatim | 와인 병의 어두운 분위기는 light 모드에서도 유지. design-system colors.md §6-3 verbatim. **deviation 아님 — keyscreen verbatim** |
| CSS `linear-gradient(160deg, ...)` Hero outer | `expo-linear-gradient` (160deg → start={0,0} end={0.342, 0.94}) | RN CSS gradient 미지원 표준 |
| CSS `linear-gradient(90deg, gray-gold-red-gold-gray)` Timeline track | `expo-linear-gradient` horizontal (start={0, 0.5} end={1, 0.5}) | 동일 |
| CSS `linear-gradient(180deg, ...)` Bottom fade | `expo-linear-gradient` vertical | 동일 |
| CSS `linear-gradient(180deg, rgba(255,255,255,0.10) → 0)` Highlight overlay | `expo-linear-gradient` 동일 + pointerEvents none | 동일 |
| CSS `transition background 200ms` Switch | Reanimated `withTiming(200)` 또는 LayoutAnimation | RN CSS transition 미지원 |
| CSS `transition left 200ms` Switch knob | Reanimated `useDerivedValue(withTiming)` | 동일 |
| `transform translateX(-50%)` Peak marker / Current dot | `marginLeft: -width/2` | RN transform: translateX 지원하지만 percent 미지원 (% 인자 X). margin offset이 단순 |
| `role="switch" aria-checked` | `accessibilityRole="switch" accessibilityState={{checked}}` | RN a11y prop 표준 |
| `<Link href=>` | `<Pressable onPress={()=>router.push()}>` | expo-router 표준 |
| `getCellarItem(params.id)` (id 단일) | `useCellarItem(lwin, cellarItemId)` (lwin + optional id) | 우리 라우팅 패턴 (`/cellar/[lwin]`). param 형태 차이만 — UX 동일 |
| ConfirmDialog (커스텀 modal) DrinkThis | RN: `Alert.alert` 또는 ConfirmDialog 커스텀 | platform standard. 둘 다 verbatim 수용 가능. **추천**: 커스텀 ConfirmDialog (시각 일관성) |
| Notify toggle 변경 시 localStorage X (시안 단계) | RN 동일 — useState만, persistence 부재 | v0.1.0 keyscreen verbatim |
| `<Link/>` ReviewCard → `/profile/[userId]` | v0.1.0 SCOPE-OUT (community reviews 없음) | data 미준비 |
| BottomNav 없음 (keyscreen page) | `(tabs)` 그룹 내부라 BottomNav 자동 렌더 | RN expo-router 구조 |
| Edit / Delete / Status toggle 액션 | 현재 RN 유지 (keyscreen 미정의 enhancement) | UX 완결성 — design-reviewer 양해 |
| DrinkThis CTA shadow 없음 | RN `shadows.wineRedCardLg` glow 추가 | design-review 6항목 (3)gradient 깊이 채움. 시각 위계 강화 |
| `var(--font-playfair)` 등 CSS var | tailwind `font-playfair` / inline `fontFamily: 'PlayfairDisplay_400Regular'` | RN font system 표준 |
| `var(--color-*)` 토큰 | NW v4 className + `useThemeTokens()` 분기 | 우리 토큰 시스템 |
| `LocaleText` 컴포넌트 | `useTranslation()` t-fn + `getLocalizedWineName` (wine name 한정) | i18next 표준 |

---

## 9. 디자인 토큰

### 9-1. 기존 토큰 재사용 (lib/design-tokens.ts)

- `brand.gold` (`#C9A84C`) — yearsToPeak text, Notify Switch ON, Timeline gold stops, ViewWineDetailsLink
- `brand.wineRed` (`#8B1A2A`) — Peak marker, DrinkThis CTA bg, DrinkWindowBadge peak
- `brand.cream` (`#F5F0E8`) — Switch knob, DrinkThis label, Timeline current dot
- `brand.deepestDark` (`#05020A`) — DrinkWindowBadge opening/mature text (keyscreen verbatim)
- `dark.bg.bottleShelf` (`#1a0a1e`) — Hero outer gradient end (keyscreen `#1a0a1e` 동일)
- `dark.bg.deepest` / `light.bg.deepest` — Timeline current dot border (scheme 분기)
- `dark.bg.surface` / `light.bg.surface` — DrinkWindow card / Notify / MetaCard / ReviewCard bg
- `dark.border.default` / `light.border.default` — 모든 카드 border
- `dark.text.primary` / `light.text.primary` — wine name / MetaCard value / Label
- `dark.text.secondary` / `light.text.secondary` — Producer line / Tip mainText
- `dark.text.muted` / `light.text.muted` — Region line / RangeText / Date / MetaCard label
- `cellar.tooYoungBg.{dark,light}` — DrinkWindowBadge too-young (이미 cellar-list에서 확장)
- `cellar.pastPeakBg.{dark,light}` — DrinkWindowBadge past-peak
- `withAlpha()` — Timeline gray stops `withAlpha('#9B8B7A', 0.3)`, WineLabelArt border `withAlpha(brand.gold, 0.18)`, Bottom fade alpha
- `wineTypeDot.*` — Hero type dot (cellar-list 이미 사용)
- `shadows.wineRedCardLg` — DrinkThis CTA glow (이미 wine-detail에서 확장)
- `radius.{14, 16, 18}` — Notify card 14, DrinkWindow card 16, Hero 18 (이미 cellar-list에서 확장)
- `typography.drinkWindowBadge` — Badge text (이미 존재)
- `typography.cellarCardName` — wine name (cellar-list 이미 정의)

### 9-2. 신규 필요 토큰 (P0 escalation)

| 토큰 이름 | 값 | 용도 | 사유 |
|---|---|---|---|
| `gradients.cellarDetailHero` | factory `(bottleColor, scheme)` → `{colors:[bottleColor, dark.bg.bottleShelf], locations:[0, 0.7], start:{0,0}, end:{0.342, 0.94}}` | Section 1 Hero outer LinearGradient | keyscreen line 82 verbatim. 160deg 환산 (cos(160°)=-0.94 → x:0.342; sin(160°)=0.342 → y:0.94 reversed). bottleColor가 동적 → factory pattern (`cellarCardBottleGradient` 와 동일 패턴) |
| `gradients.wineLabelArt` | factory `(bottleColor)` → `{colors:[bottleColor, shade(bottleColor,-20), shade(bottleColor,-40)], locations:[0, 0.6, 1], start:{0,0}, end:{0.342, 0.94}}` | WineLabelArt inner gradient (3-stop) | keyscreen line 36 verbatim. shade() 헬퍼 필요 |
| `gradients.wineLabelArtHighlight` | `{colors:['rgba(255,255,255,0.10)','rgba(255,255,255,0)'], start:{0.5, 0}, end:{0.5, 1}}` | WineLabelArt 상단 광택 overlay (180deg) | keyscreen line 60~63 verbatim. 양쪽 모드 동일 |
| `gradients.drinkWindowTimeline` | `{colors:[withAlpha('#9B8B7A',0.3), brand.gold, brand.wineRed, brand.gold, withAlpha('#9B8B7A',0.3)], locations:[0, 0.45, 0.5, 0.55, 1], start:{0, 0.5}, end:{1, 0.5}}` | Timeline track (5-stop horizontal) | keyscreen line 398~400 verbatim |
| `gradients.cellarBottomFade.{dark,light}` | dark: `{colors:['rgba(5,2,10,0)', 'rgba(5,2,10,0.95)'], locations:[0, 0.6], ...}` / light: `{colors:['rgba(250,245,236,0)', 'rgba(250,245,236,0.95)'], locations:[0, 0.6], ...}` | DrinkThis CTA bottom fade overlay | keyscreen line 314~315 dark verbatim + light 모드 분기 |
| `shade()` 헬퍼 | `function shade(hex, percent): string` (hex 변형 — `parseInt + amt + Math.max/min`) | WineLabelArt 내부 gradient stop 계산 | keyscreen line 69~76 verbatim. 별도 `src/lib/color.ts` 권장 또는 `design-tokens.ts` export |
| `typography.cellarHeroProducer` | Inter 13, lh 1.2 | Section 1 ProducerLine | 기존 `typography.cardBody` (13 / lh 19.5) 와 다름 — verbatim 필요 (lh 1.2 = 15.6) |
| `typography.cellarHeroRegion` | Inter 12, color text-muted | Section 1 RegionLine | 기존 `typography.cardMeta` (12 / lh 14.4) 와 거의 동일 — 재사용 가능 |
| `typography.metaCardLabel` | Inter 11, color text-muted | MetaCard label | 기존 `typography.metaRowLabel` (capture에서 확장) 재사용 가능 |
| `typography.metaCardValue` | Inter 13 500, color cream | MetaCard value | 기존 `typography.cardBody` (13) + 500 weight — 재사용 시 weight 명시 |
| `typography.notifyLabel` | Inter 13 500 (lh 1.2 = 15.6), color cream | Notify Switch label | 기존 `typography.cardBody` 와 fontWeight만 차이 — 재사용 |
| `typography.drinkWindowTip` | Inter 12, color text-secondary | Section 2 TipRow | 기존 `typography.cardMeta` 재사용 가능 |
| `typography.viewWineDetailsLink` | Inter 12 600, color gold | ViewWineDetailsLink | 기존 `typography.sectionLink` (12 / lh 12) 와 weight 차이 — 재사용 시 weight 600 추가 |
| `typography.drinkThisLabel` | Inter 15 600 | DrinkThis CTA label | 기존 `typography.primaryButtonLg` (15 / 600) 재사용 |
| `typography.cellarHeroTitle` | Playfair 24, color cream | Section 1 h1 wine name | 기존 `typography.pageTitle` (24 / lh 28.8 / -0.24) 재사용 — WineNameDisplay size=title과 동일 |
| `typography.timelineYearLabel` | Inter 10, color text-muted | Timeline from/to 양끝 라벨 | 기존 `typography.bottomNavActive` (10 / lh -) 와 다름 — 신규 권장 (lh 12) |

**신규 필요 토큰 합계**: 약 **8개** (gradient 5 + shade 헬퍼 1 + typography 2). 나머지는 기존 토큰 재사용 가능. P0 토큰 확장 세션 입력.

### 9-3. tailwind.config.ts 확장

이미 다른 spec에서 확장된 항목 재사용 (`gap-2.5`, `mt-3`, `rounded-2xl`, `rounded-[14px]`, `rounded-[18px]` 등). 본 화면 신규 spacing/radius **없음**.

---

## 10. 데이터 의존

### 10-1. cellar_items + wines_localized join (`useCellarItem`)

기존 `src/hooks/use-cellar.ts` line 164~213 `useCellarItem(lwin, cellarItemId)` 사용. select 컬럼:

```sql
cellar_items.*, wine:wines_localized!inner(
  lwin, display_name, name_ko, producer_name, country, region, classification,
  bottle_color, type_canonical, vintage,
  drink_window_from_year, drink_window_peak_year, drink_window_to_year
)
```

RLS: `cellar_items.user_id = auth.uid()` (이미 RLS enabled). `wines_localized` 는 invoker security → cellar_items의 RLS만 충족하면 join 가능.

### 10-2. drink-window 계산

| 필드 | 출처 | fallback |
|---|---|---|
| `dw.from` | `wine.drink_window_from_year` | 없으면 `vintage + getDrinkWindow(wineLike).fromYears` (휴리스틱) |
| `dw.peak` | `wine.drink_window_peak_year` | 동일 |
| `dw.to` | `wine.drink_window_to_year` | 동일 |
| `status` | `getDrinkWindowStatus(currentYear, dw)` | 5 단계 분기 (too-young/opening/peak/mature/past-peak) |
| `yearsToPeak` | `dw.peak - currentYear` | computed |

> **휴리스틱 함수**: `src/lib/drink-window.ts` 신규 또는 keyscreen `getDrinkWindow()` 변환 포팅. wine type/region/classification 기반 — 23개 hint rules. **§9 escalation** (이미 cellar-list 사양에서도 요청 — 중복 안 함).

### 10-3. tasting_notes (v0.1.0 자기 노트 카운트)

기존 `useNotesCountForWine(lwin)` 사용. `tasting_notes.user_id = auth.uid() AND wine_lwin = lwin` count → "내 노트 {count}개" 표시 (community reviews 대체).

### 10-4. ReviewCard (v0.2.0)

스키마 미정의 (community/reviews 테이블 없음). v0.2.0 hardening:
- `tasting_notes.is_public = true` 필터 + `user_id != auth.uid()` + wine_lwin = ${lwin}
- aggregate 3개 (limit 3 order by created_at desc)
- user profile join (display_name, level_id, badges)

### 10-5. setCellarStatus / deleteCellarItem

기존 hook 사용 (use-cellar.ts line 140~155). `status='consumed'` 시 `consumed_at = today.toISOString().slice(0,10)`.

### 10-6. DrinkThis flow

```
press CTA → ConfirmDialog → confirm
  ↓
1. setCellarStatus(item.id, 'consumed')
   ↓ Supabase update cellar_items
2. router.push(`/notes/new/write?from=cellar&wine_lwin=${lwin}&itemId=${item.id}`)
   ↓
   노트 작성 화면 진입 시 query param parse:
     - wine_lwin → wine prefill (WineHero)
     - from=cellar → 자동 source='cellar' (NoteSource picker skip)
     - itemId → linked cellar_item_id (tasting_notes.cellar_item_id FK; 마이그레이션 7 추가 권장 — 현재 미확인)
```

> **마이그레이션 의존**: `tasting_notes.cellar_item_id` 컬럼 부재 시 itemId 무시 가능. **§11 escalation**.

### 10-7. Notify Toggle (v0.1.0)

`useState(item.notify_at_peak ?? false)` — DB 컬럼 부재 (현재 RN). **localStorage 미저장** (keyscreen verbatim).

v0.2.0: `cellar_items.notify_at_peak BOOLEAN DEFAULT false` 마이그레이션 + `notification_preferences` 별도 테이블 + Expo Push setup.

---

## 11. 현재 구현 차이 (retroactive 대상)

기존 코드: `app/(tabs)/cellar/[lwin].tsx` (Day 4 구현, 236 LOC) + `src/components/cellar/{drink-window-badge, cellar-fields}.tsx` + `src/components/wine/{drinking-window-bar, wine-hero, add-to-cellar-sheet}.tsx`.

| 항목 | 키스크린 원본 | 현재 구현 | 수정 필요 |
|---|---|---|---|
| Section 1 Hero (240px gradient + WineLabelArt + 텍스트 메타) | keyscreen line 71~128 | `WineHero` (wine-detail용; gradient 다름 — `bottleColor35` alpha + 수직 fade, 위에서 시작) | **신규 컴포넌트** `CellarHero` 작성 또는 `WineHero` 재사용 + variant prop 추가. cellar-detail은 height 240 고정 + 160deg gradient + WineLabelArt centered (병이 아닌 라벨 placeholder) |
| Section 2 DrinkWindow Card (Badge + Timeline + Tip) | keyscreen line 130~176 | `DrinkingWindowBar` (line 19~85, wine-detail용) — Timeline 시각 다름 (단순 bar, 4px height, no peak marker, no gold/wineRed/gold 5-stop) | **DrinkingWindowBar → DrinkWindowCard 신규 컴포넌트로 교체** (또는 enhanced). Timeline 5-stop gradient + peak marker + current dot + from/to 라벨 추가 필요 |
| Section 3 Notify Toggle | keyscreen line 178~240 | **부재** | **신규 컴포넌트** `NotifyToggleCard` 작성 — 44×26 Switch + cream knob + gold/border-default track + 200ms transition |
| Section 4 MetaGrid 2×2 | keyscreen line 242~263 | `CellarFields` (line 31~70) — 단일 카드 행 리스트 (storage/acquiredAt/quantity/purchasePrice/edit), MetaCard 2×2 grid 아님 | **CellarFields → MetaGrid 신규 컴포넌트로 교체**. 4개 MetaCard 2×2 + edit 액션 분리 (Section 4 외부로) |
| Section 5 Community Reviews | keyscreen line 266~302 | "내 노트 {count}개" 단순 카드 (line 171~178) | v0.1.0 **SCOPE-OUT 유지** — 자기 노트 카운트 그대로. v0.2.0 hardening |
| Section 6 DrinkThis CTA (absolute bottom + fade) | keyscreen line 305~320 | **부재** (대신 inline PrimaryButton "WriteNote" + "MarkConsumed"/"Restore" + Delete pressable, line 180~207) | **신규** absolute fixed CTA `DrinkThisCta` — wine-red, gap 8, GlassWater icon, ConfirmDialog. 기존 액션 3개는 별도 영역 (예: Edit/Delete를 Header right slot 또는 Section 4 외부로 이동) |
| BackHeader title | keyscreen wine.name | `getLocalizedWineName(currentLocale(), wine).primary` | ✓ 동일 패턴 |
| not-found state | 24px padding muted text | `EmptyState + AlertCircle + PrimaryButton` (line 95~118) | enhanced — 유지 (verbatim 위반 아닌 UX 개선) |
| status `consumed` 분기 | 키스크린 미정의 | "Restore to cellar" 표기 (line 125~128) | 우리 RN 도메인 추가 — 유지 |
| ScrollView contentContainerStyle | keyscreen `paddingBottom 96` | `paddingBottom 32` | **112로 변경** (96 + BottomNav 인셋 16 — DrinkThis 추가 후 CTA 안 가리도록) |

**hardening LOC 예상**: +250 LOC (CellarHero / DrinkWindowCard / NotifyToggleCard / MetaGrid / DrinkThisCta / DrinkWindowTimeline / WineLabelArt / shade helper).

---

## 12. Scope-out 항목 (v0.1.0 미구현)

| 항목 | v0.1.0 | v0.2.0 hardening |
|---|---|---|
| Community Reviews (Section 5) | 자기 노트 카운트로 대체 | tasting_notes.is_public 집계 + ReviewCard + LevelPill + ReviewBadge |
| ReviewBadge 컴포넌트 | 미구현 | 신규 `src/components/shared/review-badge.tsx` (Award icon + tier color) |
| `cellar_items.notify_at_peak` DB persistence | useState only | 마이그레이션 + Expo Push + notification_preferences |
| `tasting_notes.cellar_item_id` FK | 미정의 | 마이그레이션 7 추가 |
| Peak push notification 실제 발송 | 토스트 mock | Edge Function (scheduled) + Expo Push token |
| WineLabelArt SVG-grade (현재 div + gradient) | div + Text 단순 변환 | react-native-svg `<Svg>` + `<LinearGradient>` + `<Text>` (실제 SVG output) |
| User Profile link from ReviewCard | n/a | `/profile/[userId]` route 신규 |

---

## 13. 미해결 질문 (escalation — 리더 판단 필요)

1. **DrinkThis flow 의 status update + navigate 순서**: 키스크린은 status 변경 없이 그냥 노트 작성 화면으로 push (localStorage draft seed만). 우리는 cellar_items.status='consumed'로 즉시 변경할지, 노트 저장 시점에 변경할지. **권장**: 노트 저장 시점에 atomic — keyscreen verbatim에 가깝고 사용자가 노트 작성 중 취소할 수 있음.

2. **light 모드 Bottom fade 색**: `rgba(5,2,10,0.95)`는 dark 가정. light에서 부조화 — `light.bg.deepest` alpha 0.95 권장. P0 토큰 확장 (`gradients.cellarBottomFade.light`).

3. **`tasting_notes.cellar_item_id` 컬럼 부재**: DrinkThis 후 노트 작성에서 link 정보 손실. 마이그레이션 7 (cellar_item_id FK) 필요. supabase-engineer 입력.

4. **WineLabelArt 시각 품질**: 키스크린은 단순 div + gradient + 이니셜. RN에서 동일하게 가능하지만 SVG로 격상하면 시각 위계 향상. v0.1.0 단순 RN View 유지, v0.2.0 SVG 격상 결정 필요.

5. **shade() 헬퍼 위치**: `design-tokens.ts` export vs `src/lib/color.ts` 신규. **권장**: `src/lib/color.ts` 신규 (design-tokens.ts는 토큰만 — pure data).

6. **ReviewCard 컴포넌트 위치**: `src/components/wine-detail/review-card.tsx` (키스크린) vs `src/components/community/review-card.tsx` 신규. **권장**: v0.2.0 시점 결정.

7. **DrinkWindowTimeline 컴포넌트 위치**: `src/components/cellar/drink-window-timeline.tsx` vs wine-detail 재사용 가능성. **권장**: cellar 전용 (wine-detail은 별도 패턴).

8. **`cellar.meta.storage` 라벨 key 중복**: 우리 RN은 `cellar.add.storage` 사용 중. 키스크린은 `cellar.meta.storage`. **결정 필요**: `cellar.meta.storage` 신규 추가하고 cellar/[lwin]은 그것 사용 (cellar-list의 add sheet는 기존 `cellar.add.storage` 유지).

9. **Edit / Delete / Status toggle 위치**: 현재 RN은 Section 4 외부 inline (line 180~207). 키스크린에는 없음. **권장**: 유지하되 위치 조정 — Edit는 MetaGrid 우상단 작은 버튼 / Delete는 Header right slot / Status toggle은 DrinkThis 위 작은 텍스트 링크. design-reviewer 검토.

---

## 14. 빌드 체크리스트 (rn-screen-builder용)

- [ ] `src/components/cellar/cellar-hero.tsx` 신규 (Section 1)
- [ ] `src/components/cellar/wine-label-art.tsx` 신규 (Hero placeholder)
- [ ] `src/components/cellar/drink-window-card.tsx` 신규 (Section 2 wrapper) — DrinkingWindowBar 대체
- [ ] `src/components/cellar/drink-window-timeline.tsx` 신규 (Section 2 inner)
- [ ] `src/components/cellar/notify-toggle-card.tsx` 신규 (Section 3)
- [ ] `src/components/cellar/meta-grid.tsx` 신규 (Section 4 wrapper)
- [ ] `src/components/cellar/meta-card.tsx` 신규 (Section 4 item)
- [ ] `src/components/cellar/drink-this-cta.tsx` 신규 (Section 6) — ConfirmDialog 포함
- [ ] `src/components/shared/confirm-dialog.tsx` 신규 — 또는 기존 Modal 재사용
- [ ] `src/lib/color.ts` shade() 헬퍼 신규
- [ ] `src/lib/design-tokens.ts` — `gradients.cellarDetailHero/wineLabelArt/wineLabelArtHighlight/drinkWindowTimeline/cellarBottomFade` 5개 신규
- [ ] `src/lib/i18n/{ko,en}.json` — 약 27개 키 추가
- [ ] `app/(tabs)/cellar/[lwin].tsx` — 위 컴포넌트 조립 (~150 LOC, 기존 236 LOC에서 단순화)
- [ ] `tailwind.config.ts` — 추가 확장 **없음** (기존 spec 확장으로 충분)
- [ ] DrinkingWindowBar (`src/components/wine/drinking-window-bar.tsx`) — cellar/[lwin]에서만 사용 중. cellar/[lwin] retroactive 후 dead → **삭제** (wine-detail은 이미 미사용 — `app/wine/[lwin].tsx` line 11 주석으로 keyscreen 등가물 없음 명시)
- [ ] design-reviewer 시각 게이트 통과 (6항목 체크리스트)
- [ ] qa-inspector ko/en 누락 grep / 하드코딩 hex grep / dark·light 양쪽 모드 캡처
