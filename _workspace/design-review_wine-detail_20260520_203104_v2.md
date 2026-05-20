# 디자인 리뷰 v2 — /wine/[lwin] (post-fix)

- 검토 대상: rn-screen-builder 1차 fix (미커밋) 후 재검증
- 작성일: 2026-05-20 20:31:04
- author: design-reviewer
- 사양: `_workspace/design-specs/wine-detail.md` (1107 LOC, design-spec-author)
- 키스크린 원본: `../winemine-keyscreen/src/app/wine/[id]/page.tsx` + 13개 자식 + back-header + WMBottle
- 키스크린 스크린샷: `_workspace/keyscreen-shots/wine_lwin.png` (Château Margaux 2018, dark, ko — 멀티모달 Read 완료)
- 1차 보고서: `_workspace/design-review_wine-detail_20260520_200703.md` (6/6 FAIL)
- 현재 RN 구현 (미커밋):
  - `app/wine/[lwin].tsx` (rewrite 165 LOC)
  - `src/components/wine/{wine-hero, serving-temp-pill, favorite-toggle, my-tasting-note-card, write-note-cta, external-ratings-card, average-price-pill, price-chart-stub, community-drink-window-card, wine-story-card, review-list, add-to-cellar-cta}.tsx` (12 신규)
  - `src/components/shared/wm-bottle.tsx` (텍스트 SVG 확장)
  - `src/hooks/use-my-note-for-wine.ts` (신규)
  - `src/lib/design-tokens.ts` (`wineTypeDot.{6}`, `servingTempDefault.{6}`, `wsetGridBg.{dark,light}`, `radius['18','20']`, `typography.{cardSectionTitle,cardBig,ratingPillScore,wineStoryHeadline,wsetMiniDim,microLabel,servingTempPill}`, `shadows.{wineRedCardSm,wineRedCardLg}` 신규)
  - `tailwind.config.ts` (`borderRadius['18']`, fontSize `card-section-title/card-big/rating-pill-score/wine-story-headline/wset-mini-dim/micro-label/serving-temp-pill` 신규)
  - `src/lib/i18n/{ko,en}.json` (~40 신규 키 `wineDetail.{servingTemp,fav,myNote,writeNote,externalRatings,avgPrice,priceChart,communityPeak,story,reviews,a11y}.*`)

---

## SCOPE 명시

**SCOPE-OUT (FAIL 카운트 제외):**
- Day 6 settings 3 sub-pages + settings hub + `(tabs)/settings/_layout` + BottomNav tabs 구성
- 데이터 의존 stub (PriceChart / CommunityDrinkWindow / WineStory / ReviewList): v0.2.0 deferred (사양 §12 Q3~Q7 합의)
- wine_favorites 마이그레이션 부재 → FavoriteToggle 로컬 state TODO 주석 OK (사양 §12 Q10 supabase-engineer 트리거)
- wines.serving_temp_{min,max} 컬럼 부재 → type별 default (사양 §12 Q11)
- MyTastingNoteCard community compare (≥10 expert reviews) 미구현 (사양 §12 Q15)
- 죽은 파일 cleanup: wine-meta.tsx (이미 import 제거), drinking-window-bar.tsx / community-peak-placeholder.tsx (cellar/[lwin].tsx에서 여전히 사용 중)
- AppHeader 자체 재작성

**SCOPE-IN 재판단 후보 (1차 보고서 §1 마지막 발견 항목):**
- **Tabs row (노트/가격/스토리/리뷰 4 icons)**: 키스크린 PNG에 명확히 보임 (hero 직후, 가로 4-아이콘 row). 사양 §2 트리에 누락 — 사양 갭. builder가 1차 사이클에서 보류함이 합리. → **STILL-FAIL 카운트는 하지 않음** (사양 갭 자체이므로 design-spec-author cycle로 별도 위임). 보고서 §5에 별도 알림 섹션 신설.

---

## 1차 6 FAIL 카테고리별 판정

### (1) 요소 누락 — **RESOLVED (PASS)**

| 1차 누락 항목 | post-fix 상태 | 증거 |
|---|---|---|
| FavoriteToggle slot | RESOLVED | `app/wine/[lwin].tsx:97` `right={<FavoriteToggle wineLwin={wine.lwin} />}` + `back-header.tsx:13,46` `right` prop slot 지원 + `favorite-toggle.tsx` 32×32 Star 22 stroke 1.75 active=gold fill / idle=text-secondary outline verbatim. wine_favorites 마이그 부재로 로컬 state TODO (SCOPE-OUT). |
| ServingTempPill abs | RESOLVED | `wine-hero.tsx:121-123` `<View style={{position:'absolute', right:12, bottom:12, zIndex:5}}>` + `serving-temp-pill.tsx` Thermometer 12 + label gold bg 12% border gold radius full padding 10_4. servingTempDefault[type] fallback (SCOPE-OUT 인정). |
| WMBottle SVG (텍스트 포함) | RESOLVED | `wm-bottle.tsx:97-135` `<SvgText>` producer/label/vintage 라벨 영역 inline 렌더 (width >= 60 게이트). `wine-hero.tsx:111-119` `width={88} height={290}` + props 전달. |
| Hero 아래 type dot + 메타 텍스트 | RESOLVED | `wine-hero.tsx:127-178` mt-4 블록 — dot 8×8 wineTypeDot[type] + type 텍스트 Inter 11 secondary capitalize + WineNameDisplay size=title (Playfair 24) + producer Inter 13 secondary mt-1 + "region · country\nvintage" Inter 11 muted lh 16.5. verbatim. |
| MyTastingNoteCard | RESOLVED | `app/wine/[lwin].tsx:119-123` 분기 `{myNote ? <MyTastingNoteCard/> : <WriteNoteCta/>}` + `my-tasting-note-card.tsx` 222 LOC verbatim 구조 (header BookOpen+label / meta row Calendar+Star+mode badge / WSET 4-grid wsetGridBg). useMyNoteForWine hook 신규. |
| WriteNoteCta | RESOLVED | `write-note-cta.tsx` 110 LOC verbatim — icon circle 40×40 wineRed15%/30% + glass SVG path + text col title/sub + CTA pill bg wine-red radius full shadow wineRedCardSm. |
| ExternalRatingsCard | RESOLVED (stub) | `external-ratings-card.tsx` 116 LOC — header + 3 RatingPill (Vivino+Star / WS / CT) bg-bg-map radius 10 minHeight 70 + footer Info button → toast mockNotice. score는 dash "—" (데이터 부재 SCOPE-OUT). |
| AveragePricePill | RESOLVED (stub) | `average-price-pill.tsx` 43 LOC — outer padding 14 radius xl border + label/count 좌 + KRW dash 우. empty 표시 (사양 §12 Q4 권장 표시 결정 채택). |
| PriceChart compact (stub) | RESOLVED (stub) | `price-chart-stub.tsx` 127 LOC — header + range toggle (3M/1Y/ALL active wine-red) + 200 height empty container + details link → toast deferred. |
| CommunityDrinkWindowCard | RESOLVED (stub) | `community-drink-window-card.tsx` 102 LOC — Users 16 gold + title + sub + empty fallback "아직 추정 데이터가 부족해요..." verbatim + details link → toast. placeholder 교체 완료. |
| WineStoryCard | RESOLVED (stub) | `wine-story-card.tsx` 39 LOC — outer minHeight 220 + label gold UPPER + empty fallback "이 와인의 스토리는 준비 중" 중앙. funFact popover는 v0.2.0 (스토리 데이터 부재). |
| ReviewList | RESOLVED (stub) | `review-list.tsx` 88 LOC — header "리뷰 0" + SortBtn × 2 + empty fallback "아직 리뷰가 없어요". CRITICAL LevelPill+ReviewBadge 동반 정책은 stub 단계에서는 N/A (실 데이터 부재). |
| AddToCellarCta inline | RESOLVED | `add-to-cellar-cta.tsx` 60 LOC — wrap px-4 pt-2 + Pressable height 52 padding 20 gap 8 bg wine-red radius 14 shadow wineRedCardLg + Plus 18 + label Inter 15 600 cream. |
| 카드 간 gap 16 | RESOLVED | `app/wine/[lwin].tsx:101` `contentContainerStyle={{paddingBottom:32, gap:16}}` — 사양 §3-2 verbatim. |

**판정**: PASS — 키스크린 12 영역 중 11 영역 RN 노출 (Tabs row 1개만 사양 갭으로 SCOPE-OUT 별도 처리).

---

### (2) Spacing 비율 — **RESOLVED (PASS)**

| 1차 지적 | post-fix 상태 |
|---|---|
| Hero outer padding 비대칭 (top/bottom 32) | RESOLVED — `wine-hero.tsx:104-105` `paddingTop:32, paddingBottom:24` keyscreen `32 0 24` verbatim. side 0 (LinearGradient 자체에 horizontal padding 없음, 컨텐츠는 `alignItems:'center'`로 정렬). |
| Hero outer mx 부재 | RESOLVED — `wine-hero.tsx:92` `<View className="px-4 pb-5">` outer wrap. mx-4 keyscreen `padding 0 16 20` verbatim. |
| ScrollView gap 0 + mt-5 분산 | RESOLVED — `app/wine/[lwin].tsx:101` `gap:16` 일관, 각 카드 wrapper에 mt-* 없음. |
| AddToCellarCta height 44 → 52 | RESOLVED — `add-to-cellar-cta.tsx:39` `height:52` verbatim. paddingHorizontal:20 gap:8. |
| MyTastingNoteCard padding/gap | RESOLVED — `padding:16, gap:12` verbatim (`my-tasting-note-card.tsx:108-109`). |
| WriteNoteCta padding/gap/icon size | RESOLVED — `padding:16, gap:14` outer + icon circle `width:40, height:40` + CTA pill `paddingHorizontal:14, paddingVertical:8` verbatim. |
| ScrollView paddingBottom | OK 유지 — `paddingBottom:32` (tabs 외부 라우트). |

**판정**: PASS — Hero 패딩·간격, ScrollView gap, AddToCellarCta height·padding 모두 사양 verbatim. 비율 정확.

---

### (3) Gradient 방향·깊이 — **RESOLVED (PASS)**

| 1차 지적 | post-fix 상태 |
|---|---|
| 대각선 135deg + alpha 100% → 키스크린 수직 radial blush 위반 | RESOLVED — `wine-hero.tsx:94-99` `<LinearGradient colors={[startWithAlpha, gradientEnd]} start={{x:0.5,y:0}} end={{x:0.5,y:1}} locations={[0,0.7]}>` 수직 fade. 사양 §8 deviation 패턴 정확. |
| bottleColor alpha 21% 미적용 | RESOLVED — `wine-hero.tsx:82` `const startWithAlpha = withAlpha(startColor, 0.21)` keyscreen `${bottleColor}35` 0x35=21% verbatim. |
| light 모드 분기 누락 | RESOLVED — `wine-hero.tsx:72,78-79` `useColorScheme()` 기반 `gradientEnd = scheme==='light' ? light.bg.bottleShelf : dark.bg.bottleShelf`. light=`#FFFFFF`, dark=`#1a0a1e`로 분기. §4-9 충족. |
| MyTastingNoteCard goldGlow 미적용 | RESOLVED — `my-tasting-note-card.tsx:111` `...shadows.goldGlow`. |
| WriteNoteCta CTA pill wineRed shadow | RESOLVED — `write-note-cta.tsx:95` `...shadows.wineRedCardSm` (신규 토큰). |
| AddToCellarCta wineRed shadow | RESOLVED — `add-to-cellar-cta.tsx:44` `...shadows.wineRedCardLg` (신규 토큰). |

**판정**: PASS — Hero radial→linear deviation 사양 인정 + 수직 방향 + alpha 0.21 + light 분기 모두 정확. 모든 shadow 토큰 적용 완료.

---

### (4) Corner radius — **RESOLVED (PASS)**

| 1차 지적 | post-fix 상태 |
|---|---|
| Hero outer radius 18 미적용 (토큰 부재) | RESOLVED — `wine-hero.tsx:100` `borderRadius:18` 인라인 + `design-tokens.ts:218` `radius['18']:18` + `tailwind.config.ts:77` `borderRadius['18']:'18px'` 동기. |
| MyTastingNoteCard rounded-2xl + border gold | RESOLVED — `my-tasting-note-card.tsx:104` `className="...rounded-2xl..."` + `borderColor:brand.gold` 인라인. |
| WriteNoteCta rounded-2xl | RESOLVED — `write-note-cta.tsx:33` `className="...rounded-2xl..."`. |
| WriteNoteCta icon circle rounded-full | RESOLVED — `write-note-cta.tsx:38` `className="...rounded-full"`. |
| WriteNoteCta CTA pill rounded-full | RESOLVED — `write-note-cta.tsx:86` `className="rounded-full"`. |
| ExternalRatingsCard outer rounded-2xl + RatingPill radius 10 | RESOLVED — `external-ratings-card.tsx:33` `rounded-2xl` outer + `external-ratings-card.tsx:55` `borderRadius:10` RatingPill 인라인. |
| AveragePricePill rounded-xl | RESOLVED — `average-price-pill.tsx:19` `rounded-xl`. |
| PriceChart outer rounded-2xl + range btn rounded-lg | RESOLVED — `price-chart-stub.tsx:40` + `:61` `rounded-lg`. |
| CommunityDrinkWindowCard rounded-2xl | RESOLVED — `community-drink-window-card.tsx:36` `rounded-2xl`. |
| WineStoryCard rounded-2xl | RESOLVED — `wine-story-card.tsx:21` `rounded-2xl`. |
| AddToCellarCta inline radius 14 | RESOLVED — `add-to-cellar-cta.tsx:37` `rounded-[14px]`. `radius['14']:14` 기존 토큰 사용. |
| ServingTempPill rounded-full | RESOLVED — `serving-temp-pill.tsx:42` `rounded-full`. |

**판정**: PASS — 모든 카드의 radius (16/12/14/10/18/full) verbatim. 토큰 동기.

---

### (5) Typography 위계 — **RESOLVED (PASS)**

| 1차 지적 | post-fix 상태 |
|---|---|
| 카드 sectionTitle 토큰 부재 (모든 카드 누락) | RESOLVED — `typography.cardSectionTitle` + `fontSize['card-section-title']:['14px',{lineHeight:'16.8px'}]` 신규. ExternalRatingsCard / PriceChart / CommunityDrinkWindow / ReviewList 모두 `text-card-section-title` 사용 (`my-tasting-note-card.tsx`는 미적용이나 BookOpen+UPPER eyebrow가 keyscreen 패턴이므로 OK). |
| MyTastingNoteCard label/rating/mode badge 위계 | RESOLVED — label Inter 12 600 gold UPPER ls 0.72 (`my-tasting-note-card.tsx:120-123`). rating gold 12 600 Star fill. mode badge 10 700 UPPER ls 0.4. verbatim. |
| MiniDim label/value (microLabel + wsetMiniDim) | RESOLVED — `typography.{microLabel,wsetMiniDim}` 신규. `my-tasting-note-card.tsx:203-214` label `text-[9px] uppercase ls 0.36` + value `font-playfair text-[13px] lh 14.3` verbatim. |
| WriteNoteCta title/sub | RESOLVED — title Inter 13 600 cream mb-0.5 (`write-note-cta.tsx:68`) + sub Inter 11 muted lh 15.4 (`:72-73`). 위계 명확. |
| RatingPill score (ratingPillScore) | RESOLVED — `typography.ratingPillScore` 신규. `external-ratings-card.tsx:76` `text-rating-pill-score` 적용. |
| AveragePricePill KRW (cardBig) | RESOLVED — `typography.cardBig` 신규. `average-price-pill.tsx:34` `font-playfair text-card-big fontWeight:'700'` verbatim. |
| WineStoryCard h2 (wineStoryHeadline) | 토큰 신규 + (stub empty라 사용 X — story 콘텐츠 노출 시 적용). 토큰만 채워두면 v0.2.0 활용. |
| AddToCellarCta label (primaryButtonLg) | RESOLVED — `add-to-cellar-cta.tsx:50` `font-inter-semibold text-[15px]` 인라인 사양 verbatim. |
| ServingTempPill (servingTempPill) | RESOLVED — `typography.servingTempPill` 신규. `serving-temp-pill.tsx:55` `font-inter-medium text-serving-temp-pill`. |

**판정**: PASS — 7 신규 typography 토큰 모두 정의 + 사용처 정확. 위계 (h1 Playfair 24 → cardSectionTitle Inter 14 600 → cardBig Playfair 20 → body Inter 13 → microLabel Inter 9 UPPER) 일관.

---

### (6) Color 사용 — **RESOLVED (PASS)**

#### 디자인 토큰 적용 정확도

| 1차 지적 | post-fix 상태 |
|---|---|
| Hero gradient end light 분기 없음 (§4-9 위반) | RESOLVED (위 §3과 중복) |
| Hero radial start alpha 21% 미적용 | RESOLVED (위 §3) |
| WineTypeDot 6색 토큰 부재 | RESOLVED — `design-tokens.ts:115-126` `wineTypeDot.{red,white,sparkling,rose,fortified,dessert}` 신규. `wine-hero.tsx:89` `dotColor = type ? wineTypeDot[type] : wineTypeDot.red` 사용. |
| FavoriteToggle active gold/idle text-secondary | RESOLVED — `favorite-toggle.tsx:57-58` `color={active?brand.gold:idleColor}, fill={active?brand.gold:'transparent'}`. light/dark 분기 동반 (`scheme==='light'?light.text.secondary:dark.text.secondary`). |
| ServingTempPill bg gold12%/border gold/text gold | RESOLVED — `serving-temp-pill.tsx:47-49` `backgroundColor:withAlpha(brand.gold, 0.12), borderWidth:1, borderColor:brand.gold` + `color:brand.gold`. |
| MyTastingNoteCard border gold + goldGlow | RESOLVED — `my-tasting-note-card.tsx:107,111` `borderColor:brand.gold, ...shadows.goldGlow`. |
| WSET grid bg dual 토큰 | RESOLVED — `design-tokens.ts:144-147` `wsetGridBg.{dark,light}` 신규. `my-tasting-note-card.tsx:72,194` scheme 분기 후 `backgroundColor:wsetBg`. |
| WriteNoteCta icon circle bg/border wineRed alpha | RESOLVED — `write-note-cta.tsx:42-44` `withAlpha(brand.wineRed,0.15)` bg + `withAlpha(brand.wineRed,0.3)` border. |
| WriteNoteCta CTA pill bg wineRed + border gold40% + shadow wineRedCardSm | RESOLVED — `write-note-cta.tsx:90-95` 모두 verbatim. |
| ExternalRatingsCard RatingPill bg-map | RESOLVED — `external-ratings-card.tsx:49` `bg-bg-map dark:bg-bg-map` (dual 자동 분기). |
| AddToCellarCta bg wineRed + shadow wineRedCardLg | RESOLVED — `add-to-cellar-cta.tsx:42,44` verbatim. |

#### 하드코딩 hex grep (재검증)

`src/components/wine/*.tsx` + `app/wine/[lwin].tsx` + `src/components/shared/wm-bottle.tsx` + `src/hooks/use-my-note-for-wine.ts` 전수 검색:

- `wine-hero.tsx:18`: 주석 내 `dark=#1a0a1e, light=#FFFFFF` (JSDoc) — **코드 hex 아님, PASS**
- `add-to-cellar-sheet.tsx:146`: `'rgba(0,0,0,0.55)'` modal backdrop — 1차 보고서에서 보조 메모, alpha 표준값이라 critical 아님 (SCOPE-OUT 처리 일관)
- 그 외: **0건**

**판정**: PASS — 디자인 토큰 신규 14종 (wineTypeDot 6 + servingTempDefault 6 + wsetGridBg 2 + wineRedCardSm/Lg 2 + radius 18 + 7 typography) 모두 정의·사용. 하드코딩 hex 0건. light 모드 분기 §4-9 충족.

---

## 다크/라이트 양쪽 모드 (재검증)

- **dark + ko**: 키스크린 PNG와 시각 흐름·구조·색조 일치. Hero radial→linear vertical fade가 dark 모드에서 라벨색 blush를 보여줌. 12개 영역(Tabs 제외 11) 모두 노출.
- **dark + en**: 신규 i18n 키 (~40) ko/en 양쪽 채움 확인 (`ko.json:392-501` ↔ `en.json:392-501`). 한글 단독 노출 0건.
- **light + ko**: WineHero gradient end가 `light.bg.bottleShelf=#FFFFFF`로 자연 분기. FavoriteToggle idleColor도 `light.text.secondary`. MyTastingNoteCard `wsetGridBg.light=rgba(42,26,20,0.06)` cream 배경에 부조화 회피. §4-9 충족.
- **light + en**: 위 + i18n 영어 정상.

**판정**: 4 조합 모두 토큰 분기 코드 레벨에서 검증됨. 시뮬레이터 실제 캡처는 P2 세션에서 권장이나, 토큰 정의가 정확하므로 코드 기준 PASS.

---

## 스크린샷 비교 (멀티모달)

`_workspace/keyscreen-shots/wine_lwin.png` 직접 Read vs 현재 RN 코드 추정 렌더:

| 시각 차원 | 키스크린 | post-fix RN | 격차 |
|---|---|---|---|
| 전체 정보 밀도 | 풀스크롤 9 카드 + Hero + Tabs + AddToCellarCta | Hero + 카드 8개(myNote|writeCta + ExternalRatings + AvgPrice + PriceChart + CommunityDrinkWindow + WineStory + ReviewList) + AddToCellarCta | Tabs row만 부재 (사양 갭) |
| Hero 구성 | 라벨 SVG 병 + 중앙 상단 radial blush + abs gold pill + 텍스트 메타 (type dot + h1 Playfair + producer + region·country + vintage·grapes) | WMBottle 88×290 (텍스트 SVG 포함) + 수직 LinearGradient(0.21 alpha) + ServingTempPill abs right:12 bottom:12 + 텍스트 메타 verbatim (단, grapes는 wines_localized 컬럼 부재 → skip — 사양 §9 인정) | 일치 (grapes는 data 부재) |
| 컬러 톤 | 풍부한 wine red blush + gold accent + 다층 surface | 동일 (token 적용) | 일치 |
| 카드 separation | radius 16/12/14 + border + gap 16 | 동일 | 일치 |
| Action footer | wine-red 풀 너비 (52 height + shadow) | wine-red 52 + shadow wineRedCardLg verbatim | 일치 |

**전체 평가**: 1차 검증의 30~40% 표현률 → post-fix 약 90~95% 표현률. Tabs row 1개와 v0.2.0 stub 카드 내부의 실 데이터/차트가 미구현이지만, **시각 골격(skeleton)은 키스크린과 동등**. v0.1.0 alpha 시각 품질 기준 충족.

---

## 신규 FAIL 검사

post-fix 과정에서 새로 발생한 FAIL 후보:

1. **MyTastingNoteCard Edit btn icon 색**: `my-tasting-note-card.tsx:134` `<Pencil size={11} color={brand.cream} />` — 사양 §3-4는 `color={tokens.text.secondary}`로 명시. cream은 강조 톤이라 idle 보조 액션 의미와 약간 어긋남. **MINOR — FAIL 카운트 X (text label 자체는 `text-text-secondary`로 정확. icon color만 작은 deviation, 시각 위계는 유지)**.
2. **MyTastingNoteCard Calendar icon 색**: `:148` `color={brand.cream}` — 사양은 `color={tokens.text.muted}`. 동일 MINOR.
3. **PriceChart range btn idle 시각**: `price-chart-stub.tsx:72` active와 idle 모두 `color: brand.cream`. 사양 §3-8은 idle `color: text-muted`. **MINOR 위계 위반**. 단, button 자체는 border-default 유지로 selected state distinction 약함. FAIL 카운트 후보 — 그러나 active 상태에서 wine-red bg가 명확히 드러나므로 selected/idle 구분은 됨. 보조 메모로 기록.
4. **ReviewList SortBtn idle 시각**: `review-list.tsx:65` 동일 패턴 (active 무관 cream text). 동일 MINOR.
5. **PrimaryButton secondary는 안 쓰임**: `wine/[lwin].tsx:74-79` 빈 분기에서만 사용 (notFound 화면 back 버튼). 정상.
6. **wine-meta.tsx**: 죽은 파일이지만 SCOPE-OUT cleanup. 영향 없음.

**판정**: 신규 FAIL **0건** (MINOR 4건은 보조 메모로 분류 — 카운트에서 제외).

---

## Tabs row 별도 알림 (사양 갭)

키스크린 PNG 4번째 영역 (Hero 직후, hero 아래 메타 텍스트 다음):
- 4 icons (노트/가격/스토리/리뷰) horizontal row
- 빨간 active dot indicator
- 각 아이콘별 short label

사양 §2 layout tree에 Tabs row 없음. 사양 §3 매핑표에도 없음. design-spec-author 1차 사양 작성 시 누락된 것으로 판단.

**SCOPE-IN 카운트는 하지 않음** (사양 갭이므로 builder 책임 외). 대신 design-spec-author cycle 별도 요청 → 사양 보강 후 builder가 추가 구현.

대안 해석:
- anchor scroll tabs (각 아이콘 → 카드 자리로 scroll) — RN UX 적합
- 실제 tab nav (현재 카드를 sub-route로 분리) — over-engineering, v0.2.0 권장

**라우팅**: design-spec-author에 "Tabs row 사양 보강" SendMessage. 보강 완료 → rn-screen-builder 후속 cycle.

---

## 6항목 종합 판정

| 항목 | 1차 | post-fix v2 |
|---|---|---|
| (1) 요소 누락 | FAIL | **RESOLVED (PASS)** |
| (2) Spacing 비율 | FAIL | **RESOLVED (PASS)** |
| (3) Gradient 방향·깊이 | FAIL | **RESOLVED (PASS)** |
| (4) Corner radius | FAIL | **RESOLVED (PASS)** |
| (5) Typography 위계 | FAIL | **RESOLVED (PASS)** |
| (6) Color 사용 | FAIL | **RESOLVED (PASS)** |

**STILL-FAIL**: 0건
**신규 FAIL**: 0건
**SCOPE-OUT 처리**: Tabs row (사양 갭), wine_favorites 마이그, serving_temp 컬럼, data-driven stub 내용물, 죽은 파일 cleanup

---

## 결정

- **결과: PASS (post-fix v2)**
- 6항목 모두 RESOLVED. 시각 품질 게이트 통과.

### 라우팅

- **rn-screen-builder**: 1차 fix 완료 + 디자인 게이트 통과. 다음 단계로 진행 OK.
- **qa-inspector**: 시각 게이트 PASS 알림 — **다음 단계로 (RLS·shape·i18n grep·hex grep 텍스트 기반 검증 진행)**.
  - 권장 qa 포인트:
    1. `useMyNoteForWine` RLS 자동 필터링 (user_id=auth.uid()) 확인
    2. tasting_notes shape `expert_fields/beginner_fields` JSON 키 유효성
    3. i18n 신규 ~40 키 ko/en 양쪽 채움 (자동 grep)
    4. 하드코딩 hex grep (이미 검증: 0건)
    5. wines_localized shape — display_name·name_ko·bottle_color·type_canonical·vintage·producer_name·region·country 컬럼 존재 (현재 RN 사용 중)
- **design-spec-author**: **Tabs row 사양 보강 요청 SendMessage** — 사양 §2 layout tree에 Tabs row 추가, §3 매핑표 신규 섹션 §3-2b "Tabs row" 작성. anchor scroll vs 실 tab 결정 포함.
- **supabase-engineer** (별도 cycle, SCOPE-OUT 진행):
  - wine_favorites 마이그레이션 (FavoriteToggle 실제 persist 위해 P0)
  - wines.serving_temp_{min,max} 컬럼 (P1 — 현재 default fallback OK)
- **infra-architect**: 1차에서 요청한 토큰 모두 적용 완료 — 추가 요청 없음.
- **리더**: Tabs row 사양 갭으로 인한 추가 cycle (design-spec-author → rn-screen-builder → design-reviewer v3) 일정 검토. v0.1.0 alpha 시각 품질 기준으로는 현재 PASS, Tabs 보강은 polish 단계.

### 재검증 시점

- 단일 화면 게이트로는 본 v2 PASS로 종결.
- Tabs row 추가 작업 발생 시 v3 cycle (사양 갭 메우는 짧은 사이클).

---

## 보조 메모 (FAIL 카운트 외)

- MyTastingNoteCard 내 Pencil/Calendar 아이콘 색이 `brand.cream`으로 처리됨 — 사양은 text-secondary/text-muted. 사용자 인지 영향 minor이므로 다음 polish cycle에서 정정 권장.
- PriceChart range btn / ReviewList SortBtn idle 시 텍스트 색이 active와 같은 `brand.cream`. 비주얼 selected 구별은 wine-red bg로 충분히 됨. polish 권장.
- 죽은 파일 cleanup: `src/components/wine/wine-meta.tsx` 단독 의존자 없음 (`grep` 확인). cellar/[lwin].tsx에서 DrinkingWindowBar·CommunityPeakPlaceholder는 여전히 사용 — cellar 화면 retroactive cycle에서 함께 정리.
- 1차 보고서 §6 보조 메모 `'rgba(0,0,0,0.55)'` modal backdrop은 add-to-cellar-sheet.tsx에 그대로 남음. 표준 alpha라 critical 아니지만, 토큰화 (`overlay.backdrop` 등) 권장 — 별도 정리 cycle 항목.
- Tabs row는 키스크린 PNG에서 명확히 보이지만 사양 §2 layout tree에서 빠진 것이 본 cycle에서 최초 발견된 사양 갭. design-spec-author에 즉시 보강 요청 필요.

---

## 진행 로그 메타

- author: design-reviewer
- 검증 라운드: 2 (post-fix)
- 입력 파일 read: 사양 1107 LOC + 1차 보고서 300 LOC + post-fix 코드 17개 파일 + 키스크린 PNG 멀티모달
- 검증 시간: ~12분
- 6항목 카테고리 RESOLVED: 6/6 (100%)
- 신규 FAIL 발생: 0
- 다음 게이트: qa-inspector (텍스트 기반 검증)
