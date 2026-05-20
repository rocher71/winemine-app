# 디자인 리뷰 — /wine/[lwin]

- 검토 대상: 1차 retroactive 검증 (Day 6 hardening 시작 전 baseline)
- 작성일: 2026-05-20 20:07:03
- author: design-reviewer
- 사양: `_workspace/design-specs/wine-detail.md` (1107 LOC, author=design-spec-author)
- 키스크린 원본: `../winemine-keyscreen/src/app/wine/[id]/page.tsx` + 13개 자식 + back-header + WMBottle (총 17 파일)
- 현재 RN 구현: `app/wine/[lwin].tsx` (138 LOC) + `src/components/wine/{wine-hero, wine-meta, drinking-window-bar, community-peak-placeholder, add-to-cellar-sheet}.tsx`
- 스크린샷: `_workspace/keyscreen-shots/wine_lwin.png` (Château Margaux 2018, dark, ko — 멀티모달 Read 완료)

---

## SCOPE 명시

**SCOPE-OUT (FAIL 카운트 제외):**
- AppHeader 자체 재작성
- PriceChart / CommunityDrinkWindow / ReviewList / WineStoryCard 실 차트·실데이터 (사양 §12 stub 결정 → v0.1.0/v0.2.0 deferred)
- wine_favorites 마이그레이션 (supabase-engineer)
- wines.serving_temp_{min,max} 컬럼 (supabase-engineer)
- Day 6 settings 3 sub / BottomNav tabs

**SCOPE-IN (FAIL 카운트 포함):**
- WineHero 시각 verbatim (radial gradient, WMBottle, ServingTempPill, 텍스트 메타)
- WineMeta 제거/존치 판단 (§12 Q1)
- DrinkingWindowBar 처리 (§12 Q2)
- FavoriteToggle slot 부재 (UI 자체)
- MyTastingNoteCard / WriteNoteCta 분기 부재
- ExternalRatingsCard / AveragePricePill / PriceChart / CommunityDrinkWindowCard / WineStoryCard / ReviewList **자리(skeleton)** 부재 — stub UI 자체는 §12에서 표시 권장이며 현재 RN에서는 카드 자체가 0개.
- AddToCellarCta verbatim 스타일
- 디자인 토큰 누락 (wineTypeDot, wineRedCardSm/Lg shadow, radius 18)
- ScrollView gap·padding
- 다크/라이트, ko/en 양쪽 시각 손실
- 하드코딩 hex 검출

---

## 키스크린 스크린샷 관찰 (Château Margaux 2018, dark+ko)

상단부터 순서:
1. **BackHeader**: `<` + "Château Margaux" + 우측 별(Favorite) — 우측 슬롯에 별 1개 명확
2. **WineHero**: radial 그라데이션(중앙 상단 wine red blush → 하단 deep purple/black) + 좌측 정렬 와인 병 SVG(라벨/빈티지 텍스트 포함) + 우하단 `15-18°C 권장` ServingTempPill (gold border/text)
3. **타이틀 영역(hero 아래)**: 빨간 dot + "red" / "Château Margaux" Playfair / "Château Margaux" producer / "Margaux · 프랑스" / "2018 · Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot"
4. **Tabs row** (4개 아이콘 — 노트/가격/스토리/리뷰): keyscreen에는 tab nav가 보임 (사양 §2 트리에는 명시 안 됨 → 사양 갭 의심)
5. **MyTastingNoteCard / WriteNoteCta** 자리 (gold border 카드)
6. **ExternalRatingsCard**: "외부 평점" + globalAvg + 3 RatingPill (Vivino fill / Wine Searcher / CellarTracker)
7. **AveragePricePill**: "평균 구매가" "8건 등록" + "₩1,200,000" + "≈ $866"
8. **PriceChart compact** (Recharts LineChart, 1Y default, Avg dashed gold line)
9. **CommunityDrinkWindowCard** ("커뮤니티 음용 적기" + Users icon + "평균 2032 · 중앙값 2032" + BarChart 히스토그램)
10. **WineStoryCard** ("샤토 마고 · 1572" + 위치 + excerpt) — Lightbulb funFact 토글
11. **ReviewList** 2-3 리뷰 카드 (LevelPill + ReviewBadge 동반)
12. **AddToCellarCta inline**: "+" + "셀러에 추가" (wine-red 풀 너비, 둥근 radius 14)

키스크린 전체 분위기: dark wine bar (deep purple/wine red), 카드별 surface, gold accent, **모든 정보가 풀스크롤로 한 화면에 빽빽**.

## 현재 RN 구현 관찰 (코드 기반)

`app/wine/[lwin].tsx` 트리 (line 70~117):
1. `<BackHeader title={headerTitle} />` — **우측 슬롯 사용 X, FavoriteToggle 부재**
2. `<WineHero ...>` — LinearGradient 320 height + `<Wine size={64}/>` lucide icon + WineNameDisplay + vintage (라벨 SVG/병 형태 없음)
3. mt-5 `<WineMeta>` — keyscreen에 없는 4셀 grid 카드 (producer/vintage/region/country/classification)
4. mt-5 `<DrinkingWindowBar>` — system peak 단일 progress bar (keyscreen 등가물 없음)
5. mt-5 `<CommunityPeakPlaceholder>` — "곧 출시" 텍스트만
6. mt-6 px-4 gap-3 `<PrimaryButton writeNote />` + `<PrimaryButton secondary addToCellar />`

**카드 누락 수 (P0 verbatim 기준)**: MyTastingNoteCard, WriteNoteCta, ExternalRatingsCard, AveragePricePill, PriceChart(stub), WineStoryCard, ReviewList, AddToCellarCta inline = **7개**.
**컴포넌트 누락**: FavoriteToggle, ServingTempPill, WMBottle (텍스트 SVG), 타이틀 영역 type dot + 메타 텍스트 = **4개**.

---

## 6항목 체크리스트

### (1) 요소 누락 — **FAIL**

키스크린 12개 영역(BackHeader 좌우 + Hero + Tabs + 본문 9 카드 + AddToCellarCta inline) 중 현재 RN에 **시각적으로 존재하는 영역 = 4개** (BackHeader 좌, Hero outer, DrinkingWindowBar(다른 의미), 액션 버튼 2개). 누락 8개.

| 누락 요소 | 키스크린 위치 | 현재 RN 상태 | 수정 방향 |
|---|---|---|---|
| FavoriteToggle slot | `page.tsx:48` BackHeader children, 우측 32×32 Star | `app/wine/[lwin].tsx:71` `<BackHeader title={headerTitle} />` — children prop 미사용 | BackHeader children에 FavoriteToggle (사양 §3-1, §9 신규 컴포넌트). wine_favorites 마이그레이션 P0 결정 후. |
| ServingTempPill | `wine-header.tsx` Hero abs right 12 bottom 12, `15-18°C 권장` gold pill | `wine-hero.tsx` 전체에 부재 — 자리 없음 | 사양 §3-3 verbatim. wines.serving_temp_{min,max} 컬럼 부재면 type별 default(red 16-18, white 8-12) fallback. |
| WMBottle SVG (텍스트 포함) | `wine-header.tsx`+`wm-bottle.tsx` 88×290, producer/label/vintage 텍스트 inline SVG | `wine-hero.tsx:51` `<Wine size={64} strokeWidth={1.5} color={brand.cream} />` (lucide 단순 icon, 라벨 텍스트 0) | 사양 §9 P0 — WMBottle 신규 또는 src/components/shared/wm-bottle.tsx 확장. lucide Wine icon 교체. |
| Hero 아래 type dot + 메타 텍스트 | `wine-header.tsx` mt 16 영역, dot(8×8) + type(red) + h1(Playfair 24, name) + producer(Inter 13) + region·country + vintage·grapes | `wine-hero.tsx:53-63` Gradient **내부**에 WineNameDisplay + vintage만 있고 producer/region/country/grapes/type-dot 0 | 사양 §3-3 verbatim. WineMeta 제거(§12 Q1 권장)와 함께 hero 외부에 텍스트 메타 블록 신규. |
| Tabs row (노트/가격/스토리/리뷰) | 스크린샷에서 4 아이콘 tab nav 명확 — 사양 §2 트리에는 미언급 | RN 부재 | **사양 갭** — design-spec-author에 추가 명세 요청 (anchor links 또는 actual tabs). 사양 보강 후 구현. |
| MyTastingNoteCard | `page.tsx:65` 조건 — `myNoteForWine` 있을 때 | RN 부재 | 사양 §3-4 verbatim. useMyNoteForWine hook 신규(supabase-engineer). |
| WriteNoteCta | `page.tsx:67` 조건 — 노트 없을 때 카드 | RN line 105-110 `<PrimaryButton writeNote/>` 단순 버튼 (icon circle + 글래스 SVG + sub copy 0) | 사양 §3-5 verbatim. icon 40×40 circle + glass SVG + title/sub + CTA pill 분리. |
| ExternalRatingsCard | `page.tsx:74` 3 RatingPill 카드 | RN 부재 | 사양 §3-6 verbatim. mock data로 v0.1.0 표시(§12 Q3 권장). |
| AveragePricePill | `page.tsx:75` KRW/USD pill | RN 부재 | 사양 §3-7 verbatim. data 없으면 hide (§12 Q4 권장). |
| PriceChart compact (stub) | `page.tsx:76` header + range toggle + 차트 + details link | RN 부재 | 사양 §3-8 verbatim — 차트는 v0.1.0 placeholder, UI 골격은 표시. |
| CommunityDrinkWindowCard | `page.tsx:77` header + sub + 히스토그램 또는 empty | RN line 102-104 `<CommunityPeakPlaceholder/>` opacity-60 "곧 출시" — empty fallback **메시지 다름** ("아직 추정 데이터가 부족해요. 전문가 노트에서 입력해주세요"가 keyscreen verbatim) | 사양 §3-9 verbatim. placeholder를 stub card로 교체. i18n key wineDetail.communityPeak.empty 사용. |
| WineStoryCard | `page.tsx:79` 와이너리 이야기 카드 + funFact | RN 부재 | 사양 §3-10 verbatim. empty fallback "이 와인의 스토리는 준비 중" (§12 Q6 권장). |
| ReviewList | `page.tsx:80` 리뷰 + sort | RN 부재 | 사양 §3-11 verbatim. empty fallback "아직 리뷰가 없어요" (§12 Q7 권장). LevelPill+ReviewBadge 동반(닉네임 단독 금지 CRITICAL). |
| AddToCellarCta inline (verbatim 스타일) | `page.tsx:82` width 100% height 52 radius 14 bg wine-red Plus 18 + 텍스트, shadow 0 6 18 wineRed 45% | RN line 111-116 `<PrimaryButton secondary addToCellar/>` — secondary variant라 wine-red 풀 너비 풀 임팩트 아님 | 사양 §3-12 verbatim. wineRedCardLg shadow 토큰 신규(§9). |
| 카드 간 gap 16 | ScrollView contentContainerStyle gap 16 (사양 §3-2) | RN line 74 `contentContainerStyle={{ paddingBottom: 32 }}` gap 0 + 각 카드 wrapper `mt-5` (20px) 수동 적용 | gap:16으로 통일 + mt-5 제거 |

**판정**: FAIL — 누락 14건(SCOPE-IN 기준 핵심 영역).

---

### (2) Spacing 비율 — **FAIL**

| 위치 | 키스크린 기대 | 현재 RN 실제 | 차이 |
|---|---|---|---|
| Hero outer padding | `wine-header.tsx` `padding 32 0 24` (top 32, sides 0(margin 16으로 처리), bottom 24) | `wine-hero.tsx:48` `paddingHorizontal: 24, paddingVertical: 32` (sides 24, top·bottom 32 둘 다) | top/bottom 균등, side는 더 큼. verbatim 위반. |
| Hero outer mx | `page.tsx`에서 `margin 0 16 20` (mx 16, mb 20) | RN은 mx 부재 (LinearGradient 풀 너비) | px-4(mx-4) 누락 → 풀 너비로 키스크린의 inset 카드 느낌 X |
| Hero height | WMBottle 88×290 + 텍스트 메타 → hero 자체는 ~340+ | `wine-hero.tsx:48` `height: 320` 고정 | bottle SVG 부재로 hero 사이즈가 의미 다름 — 재작성 시 자연스럽게 맞춰짐 |
| ScrollView gap | `page.tsx:57` `gap 16` 일관 | RN contentContainerStyle gap 0 + 각 wrapper `mt-5` (20px) | 비율 20:16 ≠ — 사양은 gap 16 일관. |
| ScrollView paddingBottom | keyscreen `pb 96` (BottomNav 인셋), 우리 사양은 `32` (tabs 외 라우트) | RN line 74 `paddingBottom: 32` | OK |
| MyTastingNoteCard padding | 16 + gap 12 col | 부재 | — |
| WriteNoteCta padding | 16 + gap 14 row + icon 40×40 + CTA pill padding 8_14 | RN PrimaryButton 단순 — 내부 비율 0 | — |
| WineMeta gap | keyscreen에 등가물 없음, RN은 px-4 + gap-3 (12) + 셀별 px-3 py-3 (12) | (keyscreen verbatim 위반 — §12 Q1 제거 권장 시 본 항목 무관) |
| 카드 간 mx-4 vs px-4 outer | 사양: 각 카드 `m=0_16` (mx 16, NW v4 `mx-4`) | RN WineMeta는 `gap-3 px-4` 통일 wrapper, DrinkingWindowBar/CommunityPeakPlaceholder는 각각 `mx-4` 적용 — 일관성은 있으나 사양 패턴(각 카드가 자기 mx 책임)과 일치 | OK 정도 |
| AddToCellarCta inline 패딩 | wrapper `padding 8 16 0` + 버튼 height 52 padding 0_20 | RN PrimaryButton size="md" (44 height) + screen 외부 `px-4 gap-3` wrapper → 비율 다름 (height 44 vs 52) | size="lg" 신규 verbatim 컴포넌트로 교체 |

**판정**: FAIL — Hero 패딩 비대칭, ScrollView gap 사양 미반영, AddToCellarCta height 44↔52.

---

### (3) Gradient 방향·깊이 — **FAIL**

| 위치 | 키스크린 기대 | 현재 RN 실제 | 차이 |
|---|---|---|---|
| WineHero gradient | `wine-header.tsx` `radial-gradient(ellipse at center top, ${bottleColor}35 0%, var(--color-bg-deep) 70%)` — **방사형, 중앙 상단에서 퍼지는 wine red blush** | `wine-hero.tsx:43-49` `<LinearGradient colors={[startColor, bottleGradientEnd]} start={{x:0,y:0}} end={{x:1,y:1}} locations={[0,0.8]}/>` — **대각선(135deg) 단방향 linear, deep purple으로 fade** | (a) radial → linear deviation은 사양 §8 인정 (P0 fallback). (b) **그러나 사양 권장은 `start={x:0.5,y:0} end={x:0.5,y:1} locations=[0,0.7]` (수직 방향 단방향 fade)이며 alpha는 21% (`#hex` + `0x35`)**. 현재 RN은 대각선 + alpha 100% (bottle_color full opacity → bottleGradientEnd #1a0a1e) → 키스크린 스크린샷보다 훨씬 진하고 무겁고 방향 다름. visual 깊이 정반대. |
| bottleColor alpha | keyscreen 0x35 = 21% alpha | RN 100% full | bottle_color는 라벨 색이라 강하면 의도와 다름 — 키스크린은 은은한 blush, 현재 RN은 raw color 칠 |
| bottleGradientEnd 토큰 | dark `#1a0a1e` (bottleShelf 검정 보라) | RN `bottleGradientEnd` import 동일 | OK |
| light 모드 분기 | light에서 bg-deep(#F2EAD9) cream 분기 | RN 분기 없음 — light에서도 deep purple #1a0a1e로 끝남 (스킴 무관) — **§4-9 위반** | LinearGradient colors가 useColorScheme에 따라 분기 필요 (light면 light.bg.bottleShelf=#FFFFFF) |
| AddToCellarCta gradient | 없음(solid wine-red) + shadow 0 6 18 wineRed 0.45 | RN PrimaryButton secondary variant — wine-red gradient 부재 | size="lg" + wine-red solid + wineRedCardLg shadow |
| MyTastingNoteCard | shadow goldGlow 적용 (gradient 아님) | 부재 | shadows.goldGlow (이미 design-tokens.ts:245 정의됨) |

**판정**: FAIL — Hero radial→linear deviation은 사양 인정이나 (a)alpha 21% 미적용, (b)방향 수직 미적용, (c)테마 분기 미적용. light 모드 §4-9 검증 누락.

---

### (4) Corner radius — **FAIL**

| 위치 | 키스크린 기대 | 현재 RN 실제 | 차이 |
|---|---|---|---|
| Hero outer | `wine-header.tsx` `borderRadius 18` | `wine-hero.tsx` borderRadius 0 (LinearGradient에 미지정) | radius 18 미적용 + 토큰 부재 — 사양 §9 P0 `radius['18']` 추가 필요 |
| WineMeta cell | RN 자체 (`rounded-xl` = 12) | 12 적용 | (verbatim 등가물 없음 — §12 Q1 제거 권장) |
| DrinkingWindowBar outer | RN 자체 `rounded-xl` (12) | 12 | (등가물 없음 — §12 Q2) |
| CommunityPeakPlaceholder outer | RN 자체 `rounded-xl` (12) | 12 | 키스크린 CommunityDrinkWindowCard verbatim은 `radius 16` (`rounded-2xl`) — stub로 교체 시 16 사용 |
| MyTastingNoteCard | `radius 16` | 부재 | rounded-2xl + border gold |
| WriteNoteCta | `radius 16` | 부재 | rounded-2xl |
| WriteNoteCta icon circle | `radius 999` | 부재 | rounded-full |
| WriteNoteCta CTA pill | `radius 999` | 부재 | rounded-full |
| ExternalRatingsCard outer | `radius 16` | 부재 | rounded-2xl |
| ExternalRatingsCard RatingPill | `radius 10` | 부재 | radius 10 (NW `rounded-lg`는 8 → 인라인 또는 `rounded-[10px]`) |
| AveragePricePill outer | `radius xl` (12) | 부재 | rounded-xl |
| PriceChart outer | `radius 16` | 부재 | rounded-2xl |
| Range btn | `radius lg` (8) | 부재 | rounded-lg |
| CommunityDrinkWindowCard outer | `radius 16` | 부재 (current placeholder는 12) | rounded-2xl |
| WineStoryCard outer | `radius 16` | 부재 | rounded-2xl |
| WineStoryCard funFact circle | `radius 999` | 부재 | rounded-full |
| WineStoryCard popover | `radius 12` (xl) | 부재 | rounded-xl |
| ReviewCard | `radius xl` (12) | 부재 | rounded-xl |
| AddToCellarCta inline btn | `radius 14` | RN PrimaryButton 내부 기본(미확인, lg variant 추정 8) | radius 14 (이미 design-tokens.ts:182 `radius['14']: 14` 존재) — NW `rounded-[14px]` |
| ServingTempPill | `radius full` | 부재 | rounded-full |

**판정**: FAIL — Hero radius 18 미적용(토큰 부재), 사양상 9 카드의 16/12/14 verbatim 적용 전무.

---

### (5) Typography 위계 — **FAIL**

| 위치 | 키스크린 기대 | 현재 RN 실제 | 차이 |
|---|---|---|---|
| BackHeader title | Inter 16 600 cream lh 1.2 (backTitle 토큰 존재) | `back-header.tsx`는 별도 검토 필요 — 본 화면 사용은 동일 | 미확인이나 토큰 존재 OK |
| Hero h1 wine name | Playfair 24 400 cream ls -0.01em lh 1.2 (pageTitle 토큰) | `WineNameDisplay size="title"` 사용 (사이즈는 컴포넌트 내부 결정) — 위치는 Gradient 내부 (사양은 외부) | 위치 위반 + 사이즈는 OK일 가능성 |
| Hero producer | Inter 13 text-secondary mt 4 | RN 부재 | 신규 |
| Hero region·country / vintage·grapes | Inter 11 text-muted lh 1.5 mt 6 | RN 부재 (WineMeta cell이 대체하나 verbatim 위반) | 신규 |
| Hero type dot label | Inter 11 text-secondary capitalize | RN 부재 | 신규 |
| Hero vintage | Playfair 또는 Inter 텍스트 (WMBottle 내 inline + 메타 영역) | RN `wine-hero.tsx:61` `className="font-inter text-card-meta text-cream mt-2"` 위치 Gradient 내부 + 단독 표시 (cream 색만, 위계 X) | 메타 영역 통합 |
| 카드 section title (h2) | Inter 14 600 cream (`cardSectionTitle` 사양 §9 신규) | 부재 (모든 카드 누락) | 토큰 신규 또는 인라인 |
| MyTastingNoteCard label "내 노트" | Inter 12 600 gold UPPER ls 0.06em | 부재 | 신규 |
| MyTastingNoteCard rating | Inter 12 600 gold + Star 11 | 부재 | 신규 |
| MyTastingNoteCard mode badge | Inter 10 700 UPPER ls 0.04em | 부재 | 신규 |
| MiniDim label/value | Inter 9 UPPER ls 0.04em / Playfair 13 lh 1.1 (`microLabel`, `wsetMiniDim` 사양 §9 신규) | 부재 | 신규 |
| WriteNoteCta title/sub | Inter 13 600 cream / Inter 11 text-muted lh 1.4 | RN PrimaryButton label 단일 텍스트만 | 위계 0 |
| RatingPill score | Playfair 18 700 cream lh 1.1 (`ratingPillScore` 사양 §9 신규) | 부재 | 신규 |
| AveragePricePill KRW | Playfair 20 700 cream lh 1.1 (`cardBig` 사양 §9 신규) | 부재 | 신규 |
| WineStoryCard h2 | Playfair 22 700 cream lh 1.2 (`wineStoryHeadline` 사양 §9 신규) | 부재 | 신규 |
| AddToCellarCta label | Inter 15 600 cream | PrimaryButton lg는 typography.primaryButtonLg=Inter 15 600 (이미 토큰 있음) | OK 토큰 — variant 교체만 |
| DrinkingWindowBar 타이틀 | RN 자체 `sectionTitle` (Inter 14 500 UPPER ls 0.56) | 적용 | (verbatim 등가물 없음 — §12 Q2 결정) |
| CommunityPeakPlaceholder | RN 자체 sectionTitle 사용 | 적용 | (replaced by stub card) |

**판정**: FAIL — pageTitle 토큰 1개 외에 카드 섹션 타이틀/카드 빅스탯/RatingPill score/마이크로 라벨 토큰 7종 모두 부재 + 위계 적용 카드 자체가 0개.

---

### (6) Color 사용 — **FAIL**

#### 디자인 토큰 적용 정확도

| 위치 | 키스크린 의도 | 현재 RN |
|---|---|---|
| Hero gradient end | dark `#1a0a1e` (bottleShelf), light `#FFFFFF` 분기 | `bottleGradientEnd = '#1a0a1e'` 상수 단일 — light 분기 없음 (§4-9 위반) |
| Hero radial start | `${bottle_color}35` (21% alpha) | full opacity start_color (alpha 미적용) |
| Wine type dot 색 | `#8B1A2A`(red) / `#d6c46b`(white) / `#e8d690`(sparkling) / `#e89b9b`(rose) / `#5a2218`(fortified) / `#a07030`(dessert) — wineTypeDot 토큰군 신규 (사양 §9) | 부재 — design-tokens.ts에 `wineTypeDot` 그룹 없음. `bottleColorDefault`(line 106-113)는 유사하지만 다름. |
| FavoriteToggle | gold fill active / text-secondary outline idle | 부재 |
| ServingTempPill | bg `withAlpha(brand.gold, 0.12)` + border gold + text gold | 부재 |
| MyTastingNoteCard border | brand.gold | 부재 |
| MyTastingNoteCard shadow | goldGlow (design-tokens.ts:245 이미 존재) | 부재 적용 |
| WSET grid bg | dark `rgba(15,7,24,0.6)` / light `withAlpha(brand.textInk, 0.06)` — `wsetGridBg.{dark,light}` 토큰 신규 사양 §9 | 부재 |
| compare box bg | `withAlpha(brand.wineRed, 0.12)` + border wine-red | 부재 |
| WriteNoteCta icon circle | bg `withAlpha(brand.wineRed,0.15)` border `withAlpha(brand.wineRed,0.3)` | 부재 |
| WriteNoteCta CTA pill | bg wine-red, border `withAlpha(brand.gold, 0.4)`, color cream, shadow wineRed sm — `wineRedCardSm` 토큰 신규 사양 §9 | 부재 |
| ExternalRatingsCard RatingPill bg | bg-map (dark `#3A2440` / light `#EDE2CC`) | 부재 |
| AddToCellarCta inline | bg wine-red + shadow wineRed lg — `wineRedCardLg` 토큰 신규 사양 §9 | RN secondary variant → wine-red bg 아님 |

#### 하드코딩 hex grep (코드 직접 검색)

`src/components/wine/wine-hero.tsx`, `wine-meta.tsx`, `drinking-window-bar.tsx`, `community-peak-placeholder.tsx`, `add-to-cellar-sheet.tsx`, `app/wine/[lwin].tsx` 6 파일에서 hex 검색:

- `wine-hero.tsx`: `bottleGradientEnd` 토큰만 import — hex 없음 OK
- `wine-meta.tsx`: NW className만 — hex 없음 OK
- `drinking-window-bar.tsx`: `brand`, `dark`, `light` 토큰 import — hex 없음 OK
- `community-peak-placeholder.tsx`: `brand` 토큰 — hex 없음 OK
- `add-to-cellar-sheet.tsx`: `brand`, `dark`, `light` 토큰 + `'rgba(0,0,0,0.55)'` 인라인 modal backdrop alpha (line 146) — backdrop은 spec에 없으나 modal 표준값(다른 sheet과 일치 가능성). **§4-9에 따른 토큰화 권장이나 critical 아님**.
- `app/wine/[lwin].tsx`: `brand.gold` 토큰만 — hex 없음 OK

**하드코딩 hex 결정**: 0건 직접 위반. `'rgba(0,0,0,0.55)'`는 alpha만으로 black 표준 — pass.

#### 다크/라이트 양쪽

- WineHero gradient end는 `bottleGradientEnd` 상수 (`#1a0a1e`)로 dark/light 무관 → **light 모드에서 cream 배경에 deep purple 어두운 fade → 의도 위반 (§4-9 명백)**.
- WineMeta는 `bg-surface` (NW dual definition OK).
- DrinkingWindowBar는 `trackColor`에 useColorScheme 분기 (line 22) 적용. LinearGradient `[wineRedDeep, gold, wineRed]`는 brand 고정 색이라 양 모드 동일 — OK.
- CommunityPeakPlaceholder도 `bg-surface` (OK).
- AddToCellarSheet modal은 `bg-bg-deep dark:bg-bg-deep` 사용 (이중 정의 — light에서는 light.bg.deep으로 분기되어야 하나 둘 다 dark 토큰 참조 → 잠재 light 분기 깨짐) — 단, sheet은 modal 위 layer라 영향 약하나 회귀 확인 필요.

**판정**: FAIL — (a) `wineTypeDot.*` 6색 / `wsetGridBg.{dark,light}` / `wineRedCardSm,Lg` shadow / `radius[18]` 토큰군 부재(사양 §9 P0), (b) light 모드 WineHero gradient 분기 누락(§4-9), (c) 그 외 verbatim 색 적용 대상이 모두 누락된 카드 안에 있어 N/A.

---

## 다크/라이트 양쪽 모드

- **dark + ko**: 키스크린 스크린샷 vs 현재 RN — 시각 차이 매우 큼 (위 6항목 종합). 현재 RN은 카드 4개만 표시되는 평면적 화면, 키스크린은 12 영역 풀스크롤 풍부 화면.
- **dark + en**: i18n 검증 — 현재 RN i18n key는 ko/en 양쪽 채워졌으나 사양 §7 신규 키 ~40개 (wineDetail.fav/myNote/writeNote/externalRatings/avgPrice/priceChart/communityPeak/story/reviews/a11y/servingTemp) 모두 부재. `t('wineDetail.actions.writeNote')` 등 기존 키만 사용. **사양 §7 i18n 추가는 rn-screen-builder 작업 시 동시 추가 필요**.
- **light + ko**: WineHero gradient end(`#1a0a1e`)가 cream 배경에 강한 dark fade로 충돌 — light 모드 검증 누락. CLAUDE.md §4-9 명백 위반.
- **light + en**: 위와 동일 + i18n.

---

## 스크린샷 비교 (멀티모달)

`_workspace/keyscreen-shots/wine_lwin.png` (스크린샷 직접 Read) vs 현재 RN 코드 추정 렌더:

| 시각 차원 | 키스크린 | 현재 RN (추정) |
|---|---|---|
| 전체 정보 밀도 | 풀스크롤 9 카드 + Hero + Tabs + CTA | Hero + 4셀 grid + progress bar + placeholder + 2버튼 |
| Hero 구성 | 라벨 SVG 병 + 중앙 상단 radial blush + abs gold pill | 단순 와인 잔 아이콘 + 대각선 단방향 deep purple gradient |
| 컬러 톤 | 풍부한 wine red blush + gold accent + 다층 surface | 단조로운 deep purple full opacity + cream icon |
| 카드 separation | 카드별 surface + border + radius 16/12 + gap 16 | 4개 카드 mt-5 + rounded-xl(12) |
| Action footer | wine-red 풀 너비 (52 height + shadow) | 2 PrimaryButton(44 height) column gap-3 |

전체적으로 **현재 RN 디자인은 키스크린의 풍부함·정보 밀도·시각 위계의 30~40%만 표현**. retroactive 작업 폭은 사양 §11 추정대로 700~900 LOC + 12 신규 컴포넌트.

---

## 결정

- **결과: FAIL**
- **6항목 중 6 FAIL** (1: FAIL, 2: FAIL, 3: FAIL, 4: FAIL, 5: FAIL, 6: FAIL)

### 라우팅

- **rn-screen-builder**: 위 (1)~(6) 모두 구현 수정. 우선순위는 사양 §11 retroactive P0 범위로 시작:
  1. WineHero 재작성 (radial→LinearGradient 수직 fade + alpha 21% + 테마 분기 + WMBottle 텍스트 SVG + 메타 영역 verbatim)
  2. FavoriteToggle slot (BackHeader children)
  3. ServingTempPill abs
  4. MyTastingNoteCard / WriteNoteCta 분기
  5. AddToCellarCta inline (PrimaryButton secondary 교체)
  6. WineMeta 제거 (§12 Q1 권장)
  7. DrinkingWindowBar 처리 결정 후 적용 (§12 Q2)
  8. CommunityPeakPlaceholder → CommunityDrinkWindowCard stub
  9. ExternalRatingsCard / AveragePricePill / PriceChart / WineStoryCard / ReviewList stub 추가
  10. i18n key ~40개 추가 (사양 §7)
- **infra-architect** (P0 토큰 확장 — 본 세션 SCOPE-OUT이나 rn-screen-builder 작업 차단 요인):
  - `wineTypeDot.{red,white,rose,sparkling,fortified,dessert}` 6색
  - `shadows.wineRedCardSm` / `shadows.wineRedCardLg` 2 shadow
  - `radius[18]` + tailwind `borderRadius['18']: '18px'`
  - `wsetGridBg.{dark,light}` 2색
  - `typography.{cardSectionTitle,cardBig,ratingPillScore,wineStoryHeadline,wsetMiniDim,microLabel}` 6 토큰
- **design-spec-author** (사양 갭):
  - **Tabs row (노트/가격/스토리/리뷰)** — 스크린샷에 명확히 보이나 사양 §2 트리 누락. 사양 §3에 Tabs 컴포넌트 매핑 추가 요청. (anchor scroll 또는 실제 tab nav 둘 중 사용자 의도 확인)
- **supabase-engineer** (본 세션 SCOPE-OUT이나 차단 요인):
  - `wine_favorites` 마이그레이션 (P0 권장)
  - `wines.serving_temp_{min,max}` 컬럼 (P1)

### 재검증 시점

- rn-screen-builder retroactive 작업 완료 + P0 토큰 확장 + 사양 §2 Tabs 보강 후 재검증 요청 받음 → 동일 6항목 체크리스트 재실행 + 다크/라이트/ko/en 4 조합 시각 캡처 비교.

---

## 보조 메모 (FAIL 카운트 외)

- AddToCellarSheet(line 146)의 `'rgba(0,0,0,0.55)'` modal backdrop은 토큰화 권장이나 표준 alpha라 critical 아님 — 다른 sheet과 일치 여부 확인 후 일괄 토큰화하면 정리됨.
- 현재 RN `WineHero` 내부의 `<Wine size={64}/>` lucide icon은 placeholder 수준이며, 키스크린의 라벨 텍스트 SVG 병(WMBottle) 부재가 시각 격차의 가장 큰 단일 원인.
- DrinkingWindowBar는 RN 단독 enhancement (system peak progress bar) — 유지 시 §12 Q2 결정 후 keyscreen에 없는 deviation으로 명시 필요. 제거 시 community peak card 안의 system marker로 통합.
- §12 Q9 후속 화면(/wine/{lwin}/{prices,community-peak,story}) 링크는 v0.1.0 disabled 또는 toast 처리 결정 필요 — 본 세션 SCOPE-OUT이나 PriceChart/CommunityDrinkWindow/WineStory stub에 들어가는 항목이라 작업 직전 확정 필요.
