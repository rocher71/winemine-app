# 디자인 리뷰 — /cellar/[lwin] (2차 retroactive, post-fix)

- 작성일: 2026-05-20 22:51:31
- author: design-reviewer
- 1차 보고서: `_workspace/design-review_cellar-detail_20260520_223411.md` (6/6 FAIL)
- 게이트 결과: **PASS** (6/6 RESOLVED — 잔여 escalation은 SCOPE-OUT)
- 잔여 STILL-FAIL: **0**
- 신규 FAIL: **0**
- 다음 액션: qa-inspector 단계 진입

---

## 대상 (post-fix)

| 축 | 경로 | 비고 |
|---|---|---|
| 사양 | `_workspace/design-specs/cellar-detail.md` (734 LOC) | v1 동일 |
| 키스크린 (원본) | `../winemine-keyscreen/src/app/cellar/[id]/page.tsx` + 자식 8 | v1 동일 |
| RN 구현 (entry) | `app/(tabs)/cellar/[lwin].tsx` (376 LOC) | 신규 (full rewrite) |
| RN 신규 자식 | `src/components/cellar/{cellar-hero, wine-label-art, drink-window-card, drink-window-timeline, notify-toggle-card, meta-card, meta-grid, drink-this-cta}.tsx` (8개) + `src/components/shared/confirm-dialog.tsx` | 9개 신규 |
| 토큰 확장 | `src/lib/design-tokens.ts` — `shade()` + `cellarDetailHeroGradient`/`wineLabelArtGradient`/`wineLabelArtHighlightGradient`/`drinkWindowTimelineGradient`/`cellarBottomFade` + typography 2개 (`cellarHeroProducer`/`timelineYearLabel`) | 사양 §9-2 7개 신규 토큰 모두 추가 (shade + 5 gradient + 2 typography) |
| tailwind 확장 | `tailwind.config.ts` — `font-size.cellar-hero-producer`, `font-size.timeline-year-label` | 사양 §9-3 충족 |
| i18n 확장 | `src/lib/i18n/{ko,en}.json` — `cellar.drinkWindow.{tip,peakInYears,fromTo,a11y.*}`, `cellar.notify.*`, `cellar.meta.{memo,memoEmpty,storageCellar/Fridge/Room/Offsite}`, `cellar.{drinkThis,drinkThisConfirm,viewWineDetails}`, `cellar.detail.a11y.{drinkThisHint,heroLabel}` | 사양 §7 항목 27개 모두 추가 |
| 삭제 (dead) | `src/components/wine/drinking-window-bar.tsx`, `src/components/cellar/cellar-fields.tsx` | 사양 §14 명시. 잔여 참조 grep — `app/wine/[lwin].tsx:11`의 stale 주석 1건만 (실제 import/사용 없음) |
| 스크린샷 reference | `_workspace/keyscreen-shots/cellar_lwin.png` (Château Margaux 2018, dark, ko) | v1 동일 — 멀티모달 비교 가능 |

---

## SCOPE-OUT (지시 받은 항목 — FAIL 카운트 제외)

다음 항목은 사양·지시에 따라 본 리뷰에서 판정하지 않음:
- Day 6 settings 3 sub + settings hub + (tabs)/settings/_layout + BottomNav tabs 구성
- AppHeader 재작성
- `tasting_notes.cellar_item_id` FK 마이그레이션 부재 (supabase-engineer)
- Community Reviews 섹션 (v0.1.0 SCOPE-OUT, "my notes count" 카드로 대체)
- `cellar_items.memo` 컬럼 부재 (현재 `memo={null}` placeholder)
- `app/notes/[noteId].tsx` pre-existing TS 에러
- `DrinkWindowBadge` a11y prop refactor (cellar-list cycle)

---

## 1차 6 FAIL 카테고리별 판정

### (1) 요소 누락 — **RESOLVED**

| Section | 사양 (§2) | 1차 상태 | 2차 상태 | 증거 |
|---|---|---|---|---|
| 1. Wine Hero (240px gradient + WineLabelArt + h1 + producer · vintage + region · country) | line 71~128 | FAIL — wine-detail용 `WineHero` 사용 | RESOLVED — `CellarHero` 신규 사용 | `app/(tabs)/cellar/[lwin].tsx:253-261` + `src/components/cellar/cellar-hero.tsx:57-106` (240 height, radius 18, LinearGradient `cellarDetailHeroGradient(bottleColor)` + 중앙 `<WineLabelArt/>`, h1 mt 12 mb 4, ProducerLine `${producer} · ${vintage}` 단일 줄, RegionLine `${region} · ${country}` 단일 줄 mt 2). 사양 §2 line 64~83 verbatim 일치 |
| 2. Drink Window Card (Badge + RangeText + 5-stop Timeline + Tip) | line 130~176 | FAIL — wine-detail용 `DrinkingWindowBar` 사용, badge/peak/dot/tip 부재 | RESOLVED — `DrinkWindowCard` 신규 + `DrinkWindowTimeline` 신규 사용 | `app/(tabs)/cellar/[lwin].tsx:264-265` + `src/components/cellar/drink-window-card.tsx:35-67` (HeaderRow=Badge+RangeText mb 12, Timeline height 28 5-stop, TipRow mt 12 with inline gold span via nested `<Text style={color:gold}>`) + `drink-window-timeline.tsx:48-141` (track top 12 height 4, peak marker top 6 wineRed 2×16, current dot top 8 cream 12×12 + border 2px deepest, from/to 양끝 라벨 Inter 10 muted). 사양 §3-3·§3-4 verbatim |
| 3. Notify Toggle Card (Inter 13 500 label + 44×26 Switch) | line 178~240 | FAIL — 컴포넌트 자체 부재 | RESOLVED — `NotifyToggleCard` 신규 사용 | `app/(tabs)/cellar/[lwin].tsx:278` + `notify-toggle-card.tsx:61-104` (44×26 outer radius 13, knob 20×20 radius 10 cream, gold ON / border-default OFF, Animated 200ms easing). 사양 §3-5 verbatim |
| 4. MetaGrid 2×2 (storage / acquiredAt / price / memo) | line 242~263 | FAIL — `CellarFields` row list 형태 | RESOLVED — `MetaGrid` 신규 사용 | `app/(tabs)/cellar/[lwin].tsx:281-288` + `meta-grid.tsx:81-88` + `meta-card.tsx:22-49` (`flex-row flex-wrap gap 10`, width 48% 4 카드, MetaCard radius 12 minHeight 64 padding 12 14). 사양 §3-7·§3-8 verbatim. status==='consumed' 시 4번째 카드 consumedAt으로 swap (사양 §4-2) |
| 5. Community Reviews | line 266~302 | SCOPE-OUT (v0.1.0) | SCOPE-OUT 유지 — "내 노트 {count}개" 단순 카드 + ViewWineDetailsLink | `app/(tabs)/cellar/[lwin].tsx:291-322` (자기 노트 카운트 + ViewWineDetailsLink Inter 12 600 gold). 사양 §2 line 133~135 + §12 명시 |
| 6. DrinkThis Bottom Fixed CTA | line 305~320 | FAIL — 컴포넌트 자체 부재 | RESOLVED — `DrinkThisCta` 신규 사용 | `app/(tabs)/cellar/[lwin].tsx:343-345` + `drink-this-cta.tsx:55-118` (absolute bottom 0 left/right 0 zIndex 10, LinearGradient `cellarBottomFade[scheme]` padding 12 16 18 + safe-area inset, Pressable 100% width height 52 radius 14 bg wineRed + `shadows.wineRedCardLg`, GlassWater 18 + Inter 15 600 cream label, ConfirmDialog flow). 사양 §3-11 verbatim. `cellared` 상태에서만 렌더 (consumed 시 hide) |

추가 항목 (1차 추가 누락):
- DrinkWindowBadge 헤더: RESOLVED — `DrinkWindowCard:42` `<DrinkWindowBadge status dw />`
- Timeline peak marker + current dot: RESOLVED — `drink-window-timeline.tsx:82-112`
- TipRow inline gold span: RESOLVED — `drink-window-card.tsx:61-65` nested `<Text style={{color:brand.gold, marginLeft:6}}>`
- WineLabelArt / MetaCard / MetaGrid / DrinkWindowCard / DrinkWindowTimeline / NotifyToggleCard / DrinkThisCta / CellarHero 컴포넌트: RESOLVED — 8 신규 파일
- `shade()` helper: RESOLVED — `src/lib/design-tokens.ts:210-220` 내장 export (사양 §13-5 권장 위치는 `src/lib/color.ts`였으나 `design-tokens.ts` 내장도 키스크린 verbatim 위반 아님 — 사양 §9-2 line 570 OR 명시)
- ConfirmDialog 컴포넌트: RESOLVED — `src/components/shared/confirm-dialog.tsx` 신규 (Modal + scrim + dialog body + Cancel/Confirm PrimaryButton)

> **판정**: 사양 §14 빌드 체크리스트 13개 항목 (-1 component) 모두 완료. 키스크린 6개 Section 중 6개 verbatim 매핑. (5)는 v0.1.0 SCOPE-OUT (지시 항목).

---

### (2) Spacing 비율 — **RESOLVED**

| 위치 | 사양 | 1차 | 2차 | 증거 |
|---|---|---|---|---|
| ScrollView `paddingBottom` + `gap` | 112 + 16 | 32 (35%) | RESOLVED | `app/(tabs)/cellar/[lwin].tsx:249` `contentContainerStyle={{ paddingBottom: 112, gap: 16 }}` |
| Section 1 outer | `px-4 pb-2` | `pb-5` (wine-detail) | RESOLVED | `cellar-hero.tsx:58` `className="px-4 pb-2"` |
| Section 2 outer | mx-4 padding 16 radius 16 | mx-4 px-4 py-4 radius 12 | RESOLVED | `drink-window-card.tsx:36-39` `className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default" style={{padding:16}}` |
| Section 2 HeaderRow mb | 12 | (없음) | RESOLVED | `drink-window-card.tsx:41` `style={{marginBottom:12}}` |
| Section 2 TipRow mt | 12 | (없음) | RESOLVED | `drink-window-card.tsx:58` `marginTop:12` |
| Section 3 Notify padding | 14 16 | (없음) | RESOLVED | `notify-toggle-card.tsx:64` `paddingHorizontal:16, paddingVertical:14` |
| Section 4 MetaGrid gap | 10 | (없음) | RESOLVED | `meta-grid.tsx:82` `gap:10` |
| Section 4 MetaCard padding | 12 14, minHeight 64 | (없음) | RESOLVED | `meta-card.tsx:26-29` `paddingHorizontal:14, paddingVertical:12, minHeight:64` |
| Section 6 CTA outer padding | 12 16 18 | (없음) | RESOLVED | `drink-this-cta.tsx:73-77` `paddingHorizontal:16, paddingTop:12, paddingBottom: 18 + insets.bottom` (safe-area 보정 — 사양 §8 의도) |
| Hero h1 mt mb | 12 / 4 | (다른 컴포넌트) | RESOLVED | `cellar-hero.tsx:81` `marginTop:12, marginBottom:4` |
| ProducerLine | 단일 줄, vintage 포함 | producer만 + vintage 별도 줄 | RESOLVED | `cellar-hero.tsx:42-51, 87-95` (producer + vintage 단일 줄 join. 둘 다 없으면 row 생략) |
| RegionLine | mt 2, region+country 단일 줄 | mt 6, vintage 별도 줄 포함 | RESOLVED | `cellar-hero.tsx:53-55, 97-105` (region+country 단일 줄, mt 2) |
| ViewWineDetailsLink mt | 12 | (부재) | RESOLVED | `app/(tabs)/cellar/[lwin].tsx:313` `marginTop:12` |

> **판정**: 사양 §2/§3의 spacing 비율 12개 위치 모두 verbatim 일치. SCOPE-OUT(Section 5 Community Reviews는 자기 노트 카운트 카드로 대체되어 spacing 일치 무의미).

---

### (3) Gradient 방향·깊이 — **RESOLVED**

| 위치 | 사양 (§9-2) | 1차 | 2차 | 증거 |
|---|---|---|---|---|
| Hero outer (Section 1) | 160deg, 2-stop `[bottleColor, dark.bg.bottleShelf]` locations [0, 0.7] start{0,0} end{0.342,0.94} | 180deg + alpha 0.21 + scheme 분기 (사양 위반) | RESOLVED | `design-tokens.ts:518-525` `cellarDetailHeroGradient(bottleColor)` + `cellar-hero.tsx:41,59-63`. scheme 무관 — 양쪽 모드 모두 `#1a0a1e` 끝점 (사양 §4-5 line 356 verbatim). bottle_color full opacity |
| WineLabelArt inner | 160deg, 3-stop `[bc, shade(bc,-20), shade(bc,-40)]` locations [0, 0.6, 1] | (부재) | RESOLVED | `design-tokens.ts:528-535` `wineLabelArtGradient(bottleColor)` + `wine-label-art.tsx:53-67` |
| WineLabelArt highlight overlay | 180deg, white alpha 0.10→0, top 40% | (부재) | RESOLVED | `design-tokens.ts:539-543` `wineLabelArtHighlightGradient` + `wine-label-art.tsx:86-98` (`height: '40%'`) |
| DrinkWindowTimeline track | 90deg 5-stop `[gray α0.3, gold, wineRed, gold, gray α0.3]` locations [0, 0.45, 0.5, 0.55, 1] | 3-stop (`wineRedDeep, gold, wineRed`) — peak 중앙 강조 손실 | RESOLVED | `design-tokens.ts:547-558` `drinkWindowTimelineGradient` + `drink-window-timeline.tsx:50-79` |
| Notify Switch ON track | bg `brand.gold` solid | (부재) | RESOLVED | `notify-toggle-card.tsx:51-54` `bgProgress.interpolate([0,1], [border.default, brand.gold])` (200ms timing) |
| DrinkThis CTA bottom fade | 180deg dark `rgba(5,2,10,0)`→`(0.95)` / light `rgba(250,245,236,0)`→`(0.95)`, locations [0, 0.6] | (부재) | RESOLVED | `design-tokens.ts:563-577` `cellarBottomFade.{dark,light}` + `drink-this-cta.tsx:42, 67-77` `cellarBottomFade[scheme]`. 사양 §13-2 light 모드 분기 채택 |
| DrinkThis CTA shadow | `shadows.wineRedCardLg` (사양 §3-11 deviation 의도) | (부재) | RESOLVED | `drink-this-cta.tsx:96` spread `...shadows.wineRedCardLg` |

> **판정**: 사양 §9-2 P0 토큰 5개 + shade helper 모두 추가. Hero 160deg verbatim 환산값(end{0.342, 0.94}), Timeline 5-stop 중앙 강조, light 모드 fade 분기 모두 적용.

---

### (4) Corner radius — **RESOLVED**

| 위치 | 사양 | 1차 | 2차 | 증거 |
|---|---|---|---|---|
| Hero frame | 18 | 18 PASS | RESOLVED 유지 | `cellar-hero.tsx:66` `borderRadius:18` |
| WineLabelArt | 8 | (부재) | RESOLVED | `wine-label-art.tsx:44` `borderRadius:8` |
| DrinkWindow Card | 16 | 12 (rounded-xl) | RESOLVED | `drink-window-card.tsx:37` `rounded-2xl` (NW v4 2xl=16) |
| Notify Toggle Card | 14 | (부재) | RESOLVED | `notify-toggle-card.tsx:64` `borderRadius:14` |
| MetaCard | 12 | (cellar-fields 다른 카드) | RESOLVED | `meta-card.tsx:28` `borderRadius:12` |
| DrinkThis CTA | 14 | (부재) | RESOLVED | `drink-this-cta.tsx:88` `borderRadius:14` |
| Notify Switch outer | 13 (44×26 half) | (부재) | RESOLVED | `notify-toggle-card.tsx:86` `borderRadius:13` |
| Notify Switch knob | 10 (20×20 half) | (부재) | RESOLVED | `notify-toggle-card.tsx:96` `borderRadius:10` |
| Timeline track bar | 2 | (다른 모양) | RESOLVED | `drink-window-timeline.tsx:77` `borderRadius:2` |
| Timeline current dot | 6 (12×12 half) | (4×18 막대) | RESOLVED | `drink-window-timeline.tsx:106` `borderRadius:6` (원형 12×12 + border 2px deepest) |
| ConfirmDialog body | 16 | (없음) | RESOLVED | `confirm-dialog.tsx:74` `borderRadius:16` |
| ViewWineDetailsLink card | n/a (link, no card) | n/a | n/a | inline Text only |
| 노트 카운트 카드 | n/a (SCOPE-OUT) | rounded-xl | 유지 | `app/(tabs)/cellar/[lwin].tsx:300` `borderRadius:12` |

> **판정**: 사양 §3 매핑표 13개 radius 위치 모두 verbatim 일치. Timeline current dot이 막대(4×18)에서 원형(12×12)으로 교체 — 시각 의미 복원.

---

### (5) Typography 위계 — **RESOLVED**

| 위치 | 사양 | 1차 | 2차 | 증거 |
|---|---|---|---|---|
| Hero h1 | Playfair 24, cream, lh 28.8, ls -0.24 | PASS (WineNameDisplay) | RESOLVED (raw Text) | `cellar-hero.tsx:78-85` `font-playfair text-text-primary` + `fontSize:24, lineHeight:28.8, letterSpacing:-0.24, marginTop:12, marginBottom:4`. `typography.pageTitle`와 동일 |
| ProducerLine | Inter 13, secondary, `${producer} · ${vintage}` 단일 줄 | producer만 단독 | RESOLVED | `cellar-hero.tsx:87-95` `font-inter text-text-secondary` + `fontSize:13, lineHeight:15.6` (사양 §9-2 신규 토큰 `cellarHeroProducer` lh 15.6 = 1.2 ratio verbatim). join logic 단일 줄 |
| RegionLine | Inter 12, muted, `${region} · ${country}` 단일 줄, mt 2 | Inter 11 mt 6 (다른 위계) | RESOLVED | `cellar-hero.tsx:97-105` `font-inter text-text-muted` + `fontSize:12, lineHeight:14.4, marginTop:2`. (사양 §3-2 `typography.cardMeta` 재사용 OK) |
| Hero type dot row | (사양에 없음 — verbatim 위반 요소) | 있음 (위반) | RESOLVED (제거) | `cellar-hero.tsx` 자체에 type dot 없음 |
| ServingTempPill | (사양에 없음) | 있음 (위반) | RESOLVED (제거) | `cellar-hero.tsx` 자체에 ServingTempPill 없음 |
| DrinkWindowBadge | Inter 10 600 lh 12 (`typography.drinkWindowBadge`) | 컴포넌트는 토큰 사용 OK, but 미호출 | RESOLVED | `drink-window-card.tsx:42` `<DrinkWindowBadge status={status} dw={dw}/>` 호출. 토큰 동일 |
| RangeText | Inter 11 muted | (부재) | RESOLVED | `drink-window-card.tsx:43-49` `fontSize:11, lineHeight:13.2` + `font-inter text-text-muted` |
| TipRow main | Inter 12, secondary | text-muted (사양 위반) | RESOLVED | `drink-window-card.tsx:56-58` `font-inter text-text-secondary` + `fontSize:12, lineHeight:14.4` |
| TipRow inline gold span | Inter 12, gold, ml 6 — "절정까지 +Nyr" | 분리된 row (시각 위계 다름) | RESOLVED | `drink-window-card.tsx:61-65` 단일 `<Text>` 안에 nested `<Text style={{color:brand.gold, marginLeft:6}}>` (inline span 등가) |
| Notify label | Inter 13 500 cream | (부재) | RESOLVED | `notify-toggle-card.tsx:66-71` `font-inter-medium text-text-primary` + `fontSize:13, lineHeight:15.6` |
| MetaCard label | Inter 11, muted, mb 4 | Inter 12 uppercase (사양 위반) | RESOLVED | `meta-card.tsx:33-40` `font-inter text-text-muted` + `fontSize:11, lineHeight:13.2, marginBottom:4`. uppercase 제거 |
| MetaCard value | Inter 13 500, cream | Inter 13 400 (위계 약함) | RESOLVED | `meta-card.tsx:41-46` `font-inter-medium text-text-primary` + `fontSize:13, lineHeight:15.6` (Inter_500Medium = 500 weight) |
| ViewWineDetailsLink | Inter 12 600, gold, mt 12 | (부재) | RESOLVED | `app/(tabs)/cellar/[lwin].tsx:313-321` `font-inter-semibold` + `fontSize:12, lineHeight:14.4, color:brand.gold, alignSelf:'flex-start', marginTop:12` |
| DrinkThis label | Inter 15 600 cream | (부재) | RESOLVED | `drink-this-cta.tsx:100-105` `font-inter-semibold` + `fontSize:15, lineHeight:18, color:brand.cream` |
| Timeline from/to 양끝 라벨 | Inter 10 muted | (부재) | RESOLVED | `drink-window-timeline.tsx:125-138` `font-inter text-text-muted` + `fontSize:10, lineHeight:12` (사양 §9-2 신규 `timelineYearLabel`) |
| Delete CTA (escalation §13-9) | n/a (키스크린 미정의) | inline pressable (Section 5) | 위치 조정 (Header right slot) — 사양 §13-9 채택 | `app/(tabs)/cellar/[lwin].tsx:234-245` BackHeader `right` slot에 `<Trash2 size=20 strokeWidth=1.75 color={brand.wineRed}/>` — 사양 §13-9 채택 verbatim |

> **판정**: Hero 메타 텍스트 구조가 사양 layout과 일치 (ProducerLine 단일, RegionLine 단일). type dot / ServingTempPill 제거. TipRow inline gold nested Text 패턴으로 시각 위계 복원. MetaCard label uppercase 제거 + value weight 500 적용.

---

### (6) Color 사용 — **RESOLVED**

| 위치 | 사양 (§4-5) | 1차 | 2차 | 증거 |
|---|---|---|---|---|
| Screen bg | `bg-bg-deepest dark:bg-bg-deepest` | PASS | 유지 | `app/(tabs)/cellar/[lwin].tsx:231` |
| Hero gradient end | `#1a0a1e` (양쪽 모드 fixed — verbatim) | scheme 분기 (light에서 `#FFFFFF`) — 사양 위반 | RESOLVED | `design-tokens.ts:518-525` `cellarDetailHeroGradient` — `dark.bg.bottleShelf` (`#1a0a1e`) 양쪽 모드 모두. light scheme 무관. 사양 §4-5 line 356 verbatim |
| Hero bottle_color alpha | full (사양에 alpha 없음) | alpha 0.21 (위반) | RESOLVED | `design-tokens.ts:520` `[bottleColor, dark.bg.bottleShelf]` — full opacity |
| WineLabelArt border | `withAlpha(brand.gold, 0.18)` | (부재) | RESOLVED | `wine-label-art.tsx:47` `borderColor: withAlpha(brand.gold, 0.18)` |
| Timeline gold stops | `brand.gold` (5-stop 중 2 자리) | 부분 일치 | RESOLVED | `design-tokens.ts:547-558` 5-stop 모두 정확 위치 |
| Timeline gray stops | `withAlpha('#9B8B7A', 0.3)` | (부재) | RESOLVED | `design-tokens.ts:549, 553` `'rgba(155, 139, 122, 0.3)'` (verbatim) |
| Timeline current dot border | scheme-aware `bg-deepest` | (부재) | RESOLVED | `drink-window-timeline.tsx:109` `borderColor: bg.deepest` (useThemeTokens scheme 분기) |
| Notify Switch ON | `brand.gold` | (부재) | RESOLVED | `notify-toggle-card.tsx:53` `outputRange: [border.default, brand.gold]` |
| Notify Switch OFF | scheme-aware `border-default` | (부재) | RESOLVED | `notify-toggle-card.tsx:29, 53` `useThemeTokens().border.default` |
| Notify Switch knob | `brand.cream` | (부재) | RESOLVED | `notify-toggle-card.tsx:98` `backgroundColor: brand.cream` |
| MetaCard bg | `bg-surface dark:bg-surface` (scheme aware) | `bg-surface` only (light 분기 부재) | RESOLVED | `meta-card.tsx:24` `className="bg-surface dark:bg-surface border border-border-default"` |
| MetaCard border | `border border-border-default` | 부재 | RESOLVED | `meta-card.tsx:24` 동일 |
| MetaCard label | `text-text-muted dark:text-text-muted` | PASS | 유지 | `meta-card.tsx:35` |
| MetaCard value | `text-text-primary dark:text-text-primary` (cream) | PASS | 유지 | `meta-card.tsx:42` |
| DrinkThis CTA bg | `brand.wineRed` | (부재) | RESOLVED | `drink-this-cta.tsx:89` `backgroundColor: brand.wineRed` |
| DrinkThis CTA label | `brand.cream` | (부재) | RESOLVED | `drink-this-cta.tsx:99, 102` `color: brand.cream` (icon + label 둘 다) |
| Bottom fade | dark `rgba(5,2,10,0~0.95)` / light `rgba(250,245,236,0~0.95)` (사양 §4-5 권장) | (부재) | RESOLVED | `design-tokens.ts:563-577` `cellarBottomFade.{dark,light}` 분기 |
| Delete CTA (Header right) | `brand.wineRed` | inline (다른 위치) | 위치+색 모두 적용 | `app/(tabs)/cellar/[lwin].tsx:243` `color={brand.wineRed}` |
| 하드코딩 hex grep | 없어야 함 | 0건 | 0건 유지 | grep 결과 — 신규 9개 컴포넌트 + design-tokens.ts·tailwind.config.ts 외 hex 0건 (cellar-hero.tsx:9 주석 1건 제외 — 런타임 영향 없음) |
| ConfirmDialog scrim | `overlay.bgScrim[scheme]` | (없음) | RESOLVED | `confirm-dialog.tsx:44-45, 61` scheme 분기 |

> **판정**: 사양 §4-5 색 매핑 18개 위치 모두 verbatim 일치. Hero gradient end light 분기 제거 (verbatim 복원). MetaCard `bg-surface dark:bg-surface border border-border-default` 적용 — light 분기 + border 부재 모두 해결. 하드코딩 hex 0건 유지.

---

## 다크/라이트 양쪽 모드 검증

| 항목 | 검증 |
|---|---|
| 다크 모드 캡처 | 가능 — `_workspace/keyscreen-shots/cellar_lwin.png` (Château Margaux 2018 dark/ko) |
| 라이트 모드 캡처 | 미수집 (P2 보류) — 코드 정적 검증만 |
| `CellarHero` gradient end | 양쪽 모드 모두 `#1a0a1e` (verbatim, 의도) |
| `DrinkWindowCard` `bg-surface dark:bg-surface border border-border-default` | scheme-aware 분기 OK |
| `DrinkWindowTimeline` current dot border `bg.deepest` (useThemeTokens) | scheme 분기 OK |
| `NotifyToggleCard` Switch OFF track `border.default` (useThemeTokens) | scheme 분기 OK |
| `MetaCard` `bg-surface dark:bg-surface` | scheme 분기 OK |
| `DrinkThisCta` `cellarBottomFade[scheme]` | scheme 분기 OK |
| `ConfirmDialog` `overlay.bgScrim[scheme]` | scheme 분기 OK |
| `brand.wineRed`, `brand.gold`, `brand.cream` | 양쪽 모드 fixed (의도) |

> 라이트 모드 실측 보류는 (6) Color FAIL이 RESOLVED이므로 별도 카운트 없음. P2 캡처 세션에서 라이트 모드 확보 후 추가 검증 권장 (현재 카드 bg 대비 4.5:1 이상 PASS는 정적 검증으로 충족).

---

## 스크린샷 비교 (멀티모달 — dark 모드)

`_workspace/keyscreen-shots/cellar_lwin.png` PNG 요소 vs 2차 RN 구현:

| PNG 요소 (위→아래) | 2차 RN | 일치 |
|---|---|---|
| 헤더 `< Château Margaux` + 우측 (delete 아이콘 위치 escalation 채택) | BackHeader title + right slot Trash2 wineRed | 일치 + 사양 §13-9 채택 |
| 240px Hero frame + 중앙 라벨 placeholder (큰 "C") | CellarHero 240 + WineLabelArt 100×150 + initial Playfair 42 | 일치 |
| h1 "Château Margaux" + ProducerLine "Château Margaux · 2018" + RegionLine "보르도 · 프랑스" | CellarHero h1 + ProducerLine join + RegionLine join | 일치 |
| Drink Window Card (Badge "지금 마시기 좋아요" + "2026년~2050년" + 4px 5-stop + "2035년에 절정 도달 · 절정까지 +9년" (gold inline)) | DrinkWindowCard + DrinkWindowTimeline + TipRow nested Text gold | 일치 |
| Notify Card (label + gold ON Switch + cream knob) | NotifyToggleCard 44×26 + Animated knob 21/3 + bgProgress border.default↔gold | 일치 |
| MetaGrid 2×2 (보관 위치/셀러, 구매일/2025-10-04, 구매가/₩1,180,000, 메모/...) | MetaGrid 4 cards × 48% width gap 10 | 일치 (memo 컬럼 부재로 placeholder "메모 없음" — SCOPE-OUT) |
| Community Reviews 3건 (L4 / L2 / L5) + "와인 상세 보기 →" | 자기 노트 카운트 "노트 N개" 카드 + ViewWineDetailsLink (v0.1.0 SCOPE-OUT 합의) | SCOPE-OUT |
| 풀폭 wine-red CTA "이 와인 마시기 [잔 icon]" + bottom fade | DrinkThisCta absolute + LinearGradient fade + Pressable wineRed + GlassWater + label | 일치 |

> **전체 시각 차이**: 화면의 6개 Section 중 **5개 verbatim 일치** + 1개 (Community Reviews) v0.1.0 SCOPE-OUT 합의. (1) 요소 누락 RESOLVED와 일치.

---

## i18n 신규 키 검증 (사양 §7)

사양 §7-1~§7-5의 27개 신규 키 grep:

| key 그룹 | ko.json | en.json |
|---|---|---|
| `cellar.drinkWindow.{tip,peakInYears,fromTo,empty}` | 존재 (ko.json:400-403) | 존재 |
| `cellar.drinkWindow.a11y.{currentYear,peak,opening,mature,tooYoung,pastPeak}` | 존재 (ko.json:404-411) | 존재 |
| `cellar.notify.{label,toggledOn,toggledOff,a11yHint}` | 존재 (ko.json:413-418) | 존재 |
| `cellar.meta.{memo,memoEmpty,storage,storageCellar,storageFridge,storageRoom,storageOffsite}` | 존재 (ko.json:467-479) | 존재 |
| `cellar.drinkThis`, `cellar.drinkThisConfirm`, `cellar.viewWineDetails` | 존재 (ko.json:419-421) | 존재 |
| `cellar.detail.a11y.{drinkThisHint,heroLabel}` | 존재 (ko.json:512-515) | 존재 |
| `common.{yes,no,back}` | 존재 (ko.json:5,10,19,20) | 존재 (en.json:5,10,19,20) |

> **판정**: 27개 신규 키 양쪽 locale 누락 0건. qa-inspector i18n 단계 통과 예상.

---

## 잔여 escalation (사양 §13 — 본 리뷰 카운트 X)

1. **DrinkThis status update 시점**: 현재 RN은 즉시 `setCellarStatus('consumed')` (lwin.tsx:108). 사양 §13-1은 "노트 저장 시점 atomic" 권장. UI/시각 영향 없음 — 비즈니스 로직 후속 cycle. **유지**
2. **light 모드 bottom fade**: `cellarBottomFade.light` 추가됨. 실측 확인은 P2 라이트 캡처 후. **RESOLVED (코드)**
3. **`tasting_notes.cellar_item_id` FK**: SCOPE-OUT (supabase-engineer 마이그레이션 영역)
4. **WineLabelArt SVG 격상**: v0.1.0 단순 View 유지 (사양 §12). **유지**
5. **`shade()` 위치**: `design-tokens.ts` 내장 — 사양 §13-5 권장 위치는 `src/lib/color.ts`였으나 두 옵션 모두 사양 §9-2 line 570에 OR로 명시. 현재 위치 수용 — **유지**
6. **ReviewCard 위치**: v0.2.0 결정 보류. **유지**
7. **DrinkWindowTimeline 위치**: `src/components/cellar/drink-window-timeline.tsx` 권장 위치 채택. **RESOLVED**
8. **`cellar.meta.storage` 키**: 신규 `cellar.meta.storage` (ko.json:474) 추가됨. **RESOLVED**
9. **Edit/Delete/Status 위치**: Delete → Header right slot, Edit + Status toggle → DrinkThis 위 보조 영역 — 사양 §13-9 권장 채택. **RESOLVED**

---

## 결정

- 결과: **PASS**
- 1차 6 FAIL 카테고리: **6 RESOLVED / 0 STILL-FAIL / 0 SCOPE-OUT** (Section 5 Community Reviews는 v0.1.0 SCOPE-OUT 합의 — FAIL 항목 아님)
- 신규 FAIL: **0**
- 다음 단계: **qa-inspector** 진입

### 라우팅

- **qa-inspector** (다음 게이트):
  - i18n ko/en 누락 grep (cellar.* 27개 + common.*) — 통과 예상
  - 하드코딩 hex grep (design-tokens·tailwind·lwin·color util 외) — 통과 예상 (현재 0건)
  - RLS shape 검증 (useCellarItem + 자기 노트 카운트)
  - drink-window 휴리스틱 정합성 (vintage null fallback)
  - dark/light 양쪽 모드 캡처 (P2 라이트 캡처 보강 후 PASS 확정)

- **rn-screen-builder**: 본 화면 종결 — 추가 수정 없음

- **design-spec-author**: 사양 §13 escalation 1·6는 v0.2.0 보류 명시 — 추가 액션 없음 (사양 보강 필요시 cellar v0.2.0 cycle)

- **supabase-engineer** (SCOPE-OUT 알림):
  - `tasting_notes.cellar_item_id` FK 마이그레이션 부재 — DrinkThis flow에서 itemId 전달은 query param으로 송신하지만 노트 저장 시 link 손실 가능
  - `cellar_items.memo` 컬럼 부재 — MetaGrid memo placeholder만 표시 (v0.2.0)
  - `cellar_items.notify_at_peak` 컬럼 부재 — Notify Switch는 `useState`만 (v0.2.0)

- **infra-architect**: P0 토큰 확장 완료 (사양 §9-2 7개 신규). 추가 액션 없음

- **리더 알림**:
  - cellar-detail retroactive hardening 완료 — Day 6 settings 3 sub로 진행 가능
  - 본 사이클 LOC: 신규 +1500 / 삭제 -200 (DrinkingWindowBar + cellar-fields) — 사양 §11 예측 +250 LOC 초과 (사양 §3-4 DrinkWindowTimeline + §3-12 ConfirmDialog 등 inline 분량 포함)
  - 사양 §13 escalation 9건 중 (2)(7)(8)(9) RESOLVED, 나머지는 v0.2.0/scope-out 분류 종결

### 재검증 시점

- 본 게이트 통과. cellar-detail 화면에 대한 design-reviewer 작업 종결.
- qa-inspector 단계 완료 후 retroactive 결과 점검은 리더 판단.
- P2 라이트 캡처 확보 후 (1)(2)(3)(6) 일부 다크 verbatim 검증의 라이트 동치 확인 권장 — 현재는 정적 분석만으로 PASS.
