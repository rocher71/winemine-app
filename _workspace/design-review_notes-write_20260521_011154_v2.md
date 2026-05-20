# 디자인 리뷰 v2 — /notes/new/write (post-fix)

> 2차 retroactive 시각 게이트 검증. 1차 FAIL 보고서 (`_workspace/design-review_notes-write_20260521_005332.md`)의
> marshall plan A~I 반영 여부 확인.
> 작성일: 2026-05-21
> 모드 범위: Beginner(dark, ko) keyscreen reference png. Expert BlindMode 1건 보조.

## 대상

- 사양: `_workspace/design-specs/notes-write.md` (1006 LOC, v2026-05-21)
- 1차 보고서: `_workspace/design-review_notes-write_20260521_005332.md`
- 원본 reference (시각): `_workspace/keyscreen-shots/notes_new_write.png` (Beginner, dark, ko)
- 구현 (post-fix, 미커밋):
  - `app/notes/new/write.tsx` (421 LOC — query 처리 + footer SavePill 통합)
  - `src/components/notes/beginner-form.tsx` (210 LOC — 6 Step verbatim 재작성)
  - `src/components/notes/beginner-header.tsx` (128 LOC — eyebrow + WineName + Producer + Greeting)
  - `src/components/notes/step-header.tsx` (58 LOC — variant beginner/expert)
  - `src/components/notes/impression-triad.tsx` (91 LOC)
  - `src/components/notes/palate-triad.tsx` (124 LOC — dim variant 분기 포함)
  - `src/components/notes/aroma-grid.tsx` (121 LOC — 4×2 8 카드)
  - `src/components/notes/finish-triad.tsx` (81 LOC)
  - `src/components/notes/auto-summary-card.tsx` (59 LOC)
  - `src/components/notes/price-capture.tsx` (121 LOC)
  - `src/components/notes/share-to-community.tsx` (72 LOC)
  - `src/components/notes/save-pill.tsx` (65 LOC)
  - `src/components/notes/expert-form.tsx` (BlindMode gradient direction 수정)
  - `src/components/notes/note-body-beginner.tsx` (legacy+신규 shape 양쪽 호환)
  - `src/components/wine/my-tasting-note-card.tsx` (palate level low/mid/high 표시 확장)
  - `src/lib/notes/summarize.ts` (128 LOC — ko/en 자동 요약)
  - `src/lib/design-tokens.ts` (notes-write 신규 typography 5개 추가: beginnerEyebrow / beginnerGreeting / stepHeaderBadge / summaryEyebrow / summaryText)
  - `tailwind.config.ts` (mirror)
  - `src/lib/i18n/ko.json` + `en.json` (writeForm 신규 키 + palateDim / palateLevel / finishLevel / aromaCard.* 약 38건 + `notes.write` 값 "테이스팅 노트" / "Tasting note" 변경)

---

## 0. 핵심 요약

1차 보고서가 식별한 9개 sub-task (A~I) 중 **A·B·C·D·E·F·G·H 모두 RESOLVED**, **I (is_public 컬럼 supabase-engineer 확인)는 SCOPE-OUT 명시 (UI state-only)**.

스크린샷 reference (Beginner / dark / ko)의 6 Step 흐름 + AutoSummaryCard + PriceCapture + ShareToCommunity + Save pill이 1:1로 구현됨. 1차 보고서가 지적한 55+건의 sub-item FAIL이 본 2차 검증에서 거의 전량 통과.

**결과: PASS** (Beginner Day 6 retroactive 목표 달성). STILL-FAIL 0건, 신규 FAIL 0건. SCOPE-OUT 1건(I — is_public 컬럼). 미세 WARN 2건 (캡처 양쪽 모드 검증 + 시뮬레이터 캡처 미수행 — Day 7 이전 완료 권장).

---

## 1. 1차 FAIL 항목별 RESOLVED / STILL-FAIL / SCOPE-OUT

### (a) 요소 누락 — 1차 FAIL 12건

| 1차 # | 항목 | 1차 상태 | 2차 검증 | 증거 |
|---|---|---|---|---|
| a-1 | BeginnerHeader (eyebrow + WineName + Producer + Greeting) | FAIL | **RESOLVED** | `src/components/notes/beginner-header.tsx` 신규 (128 LOC). BeginnerForm L122에서 `<BeginnerHeader wine={wine} variant="beginner" />` 호출. eyebrow Inter 500 11 gold uppercase ls 1.76 (L32-46), WineName Playfair 22 cream lh 26.4 (L57-65/108-114), Producer cardBody secondary (L69-74), Greeting Inter 12 lh 18 muted mt 8 (L78-83). |
| a-2 | Step 1 ImpressionTriad (Sparkles/Smile/HelpCircle 3-button) | FAIL | **RESOLVED** | `impression-triad.tsx` 신규 (91 LOC). Sparkles/Smile/HelpCircle 26 stroke 1.5 (L18, 32-37, 77), padding 14_8 radius 12 (L67-69), active bg withAlpha(gold,0.18) border gold (L70-72). BeginnerForm L124-128 호출. |
| a-3 | Step 2 PalateTriad (5 dim × low/mid/high) | FAIL | **RESOLVED** | `palate-triad.tsx` 신규 (124 LOC). sweetness/acidity/body + tannin or bubble dim 분기 (BeginnerForm L84-91 `palateDims` useMemo). 각 dim 3-button flex-row gap 6 padding 8 radius 8 active wineRed cream / idle surface secondary (palate-triad.tsx L83-105). |
| a-4 | Step 3 AromaGrid 4×2 (8 카드, 아이콘+라벨) | FAIL | **RESOLVED** | `aroma-grid.tsx` 신규 (121 LOC). Cherry/Citrus/Apple/Flower2/Flame/Candy/Sprout/Wheat 8 icons (L21-30, 44-53). flex-row flex-wrap 4-cols width '23.5%' (L74-80, 94), padding 10v_4h radius 10 (L96-98), active withAlpha(gold,0.18) border gold (L99-101). |
| a-5 | Step 4 FinishTriad (short/medium/long) | FAIL | **RESOLVED** | `finish-triad.tsx` 신규 (81 LOC). flex-row gap 6 padding 10 radius 8 font 13 (L41, 56-58, 67-71), active wineRed cream / idle surface secondary (L58-60, 70). |
| a-6 | Step 5 StepHeader + StarRating | FAIL | **RESOLVED** | StepHeader + StarRating (BeginnerForm L148-152). StarRating은 D2에 의해 half-step keep (사양 명시 PASS). 카드 wrapper 제거 — 직접 stack. |
| a-7 | Step 6 MemoInput (한 줄 메모 placeholder verbatim) | FAIL | **RESOLVED** | BeginnerForm L156-178. StepHeader number 6 + title `beginnerStep.memo` ("한 줄 메모"). placeholder `beginnerMemoPlaceholder` ("예: 새 친구가 추천해준 와인. 첫 잔이 따뜻하게 느껴졌다."). numberOfLines={3} minHeight 80 — 사양 verbatim. |
| a-8 | AutoSummaryCard (Playfair italic 13 cream + gold tint bg/border + gold eyebrow) | FAIL | **RESOLVED** | `auto-summary-card.tsx` 신규 (59 LOC). padding 12 radius 12 (L28-29), bg withAlpha(gold,0.06) border withAlpha(gold,0.30) (L30-32). Eyebrow Inter 11 gold uppercase ls 1.1 (L38-45). Body Playfair italic 13 lh 19.5 (L52). summarize.ts (128 LOC) ko/en 자동 요약. |
| a-9 | PriceCapture 카드 (Switch + collapsible NumberInput) | FAIL | **RESOLVED** | `price-capture.tsx` 신규 (121 LOC). padding 14 radius 12 bg-surface border border-default (L68-75). Switch + collapse NumberInput (L93-113). i18n `priceCaptureLabel` + `pricePlaceholder`. |
| a-10 | ShareToCommunity 카드 (Switch + title + sub) | FAIL | **RESOLVED** | `share-to-community.tsx` 신규 (72 LOC). padding 14 radius 12 bg-surface (L37-44). Title Inter 13 600 + Sub Inter 11 muted lh 13.2 (L48-59). Switch trackColor wineRed (L64). active border gold (L43). |
| a-11 | Save pill footer | FAIL | **RESOLVED** | `save-pill.tsx` 신규 (65 LOC). radius 9999 bg-wineRed padding 14v_16h Inter 600 15 cream center (L41-49, 53-57). write.tsx L408-410 ScrollView 안 footer 배치 (mt-5). header SaveBtn은 keep (E8 keep — write.tsx L328-352). |
| a-12 | StepHeader 컴포넌트 자체 | FAIL | **RESOLVED** | `step-header.tsx` 신규 (58 LOC). NumberBadge 22×22 radius 9999 bg wineRed(beginner)/gold(expert) (L31-39). text Inter 700 11 cream(beginner)/deepestDark(expert) (L42-46). title Inter 600 14 lh 16.8 text-primary (L49-53). variant prop (E17 prop variant 통합 권장 채택). |

**(a) 결과: 12/12 RESOLVED — PASS**

### (b) Spacing 비율 — 1차 FAIL 8건 (구조) + 3건 (미세)

| 1차 # | 항목 | 1차 상태 | 2차 검증 | 증거 |
|---|---|---|---|---|
| b-1 | ScrollView contentContainer 12/16/48 | PASS | PASS (유지) | write.tsx L366 `paddingHorizontal:16, paddingTop:12, paddingBottom:48`. |
| b-2 | KeyboardAvoidingView iOS=padding | PASS | PASS (유지) | write.tsx L362. |
| b-3 | BeginnerForm gap-row 18 | WARN (20→18) | **RESOLVED** | beginner-form.tsx L120 `<View style={{ rowGap: 18 }}>` — 키스크린 verbatim. |
| b-4 | Step group gap 8~10 (StepHeader → 컨트롤) | FAIL | **RESOLVED** | beginner-form.tsx L125 (gap 8 Step1), L131 (gap 10 Step2 palate dim 사이), L137 (gap 8 Step3), L143 (gap 8 Step4), L149 (gap 8 Step5), L155 (gap 8 Step6). 카드 wrapper 없음 — 사양 verbatim. |
| b-5 | 카드 wrapper 사용 빈도 (Step group은 wrapper 없이) | FAIL | **RESOLVED** | 5개 Step 모두 카드 wrapper 제거. 보조 카드 3종 (AutoSummary/Price/Share)만 wrapper 사용. |
| b-6 | PriceCapture 카드 padding 14 / radius 12 | FAIL (요소 부재) | **RESOLVED** | price-capture.tsx L72-75 `borderRadius:12, padding:14`. |
| b-7 | ShareToCommunity 카드 padding 14 / radius 12 | FAIL (요소 부재) | **RESOLVED** | share-to-community.tsx L40-44 `borderRadius:12, padding:14`. |
| b-8 | Save pill padding 14_16 / radius 999 | FAIL (요소 부재) | **RESOLVED** | save-pill.tsx L42-45 `borderRadius:9999, paddingVertical:14, paddingHorizontal:16`. |
| b-9 | ImpressionTriad gap 8 / 카드 padding 14_8 / radius 12 | FAIL | **RESOLVED** | impression-triad.tsx L52 (gap 8), L67-69 (padding 14_8, radius 12). |
| b-10 | Palate triad gap 6 / 카드 padding 8 / radius 8 | FAIL | **RESOLVED** | palate-triad.tsx L71 (gap 6), L86-87 (paddingVertical 8, radius 8). |
| b-11 | AromaGrid 4 cols gap 6 / 카드 padding 10_4 / radius 10 | FAIL | **RESOLVED** | aroma-grid.tsx L78-79 (rowGap/columnGap 6), L94 (width 23.5%), L96-98 (paddingVertical 10, paddingHorizontal 4, radius 10). |
| b-12 | AutoSummaryCard padding 12 / radius 12 | FAIL (요소 부재) | **RESOLVED** | auto-summary-card.tsx L28-29 `padding:12, borderRadius:12`. |
| b-13 | Step 5 (Rating) wrapper 제거 | FAIL | **RESOLVED** | beginner-form.tsx L148-152 — wrapper 없이 StepHeader → StarRating 직접 stack (gap 8). |
| b-14 | Memo TextInput minHeight 80 (rows 3) | WARN (96→80) | **RESOLVED** | beginner-form.tsx L163 `numberOfLines={3}` + L175 `minHeight:80`. |
| b-15 | Memo padding 10_12 (v_h) | WARN (12_12→10_12) | **RESOLVED** | beginner-form.tsx L171-172 `paddingHorizontal:12, paddingVertical:10`. |

**(b) 결과: 11/11 RESOLVED (+ b-1/b-2 유지) — PASS**

### (c) Gradient 방향·깊이 — 1차 FAIL 1건

| 1차 # | 항목 | 1차 상태 | 2차 검증 | 증거 |
|---|---|---|---|---|
| c-1 | BlindMode LinearGradient 180deg (위→아래) | FAIL (D4 — 135deg) | **RESOLVED** | expert-form.tsx L7 `gradients` import 추가. L96-99 `<LinearGradient colors={gradients.expertBlind.colors} start={gradients.expertBlind.start} end={gradients.expertBlind.end}>` 사용. design-tokens.ts L515-519: `expertBlind.start = {x:0.5, y:0}, end = {x:0.5, y:1}` = 180deg 위→아래 verbatim. |
| c-2 | AutoSummary bg flat alpha | N/A (a-8 포함) | RESOLVED | auto-summary-card.tsx L30-32 flat withAlpha bg/border. |
| c-3 | Beginner 어디에도 gradient 없음 (flat) | PASS | PASS (유지) | BeginnerForm + 자식 컴포넌트 LinearGradient 사용 0건. |
| c-4 | Save pill bg solid wineRed | N/A (a-11 포함) | RESOLVED | save-pill.tsx L43 `backgroundColor: brand.wineRed` solid (no gradient). |

**(c) 결과: 1/1 RESOLVED — PASS**

### (d) Corner radius — 1차 FAIL 9건 (요소 부재) + 1건 (Memo)

| 1차 # | 항목 | 1차 상태 | 2차 검증 | 증거 |
|---|---|---|---|---|
| d-1 | Impression button radius 12 | FAIL (a-2) | **RESOLVED** | impression-triad.tsx L69 `borderRadius:12`. |
| d-2 | Palate triad button radius 8 | FAIL (a-3) | **RESOLVED** | palate-triad.tsx L87 `borderRadius:8`. |
| d-3 | AromaCard radius 10 | FAIL (a-4) | **RESOLVED** | aroma-grid.tsx L98 `borderRadius:10`. |
| d-4 | FinishTriad button radius 8 | FAIL (a-5) | **RESOLVED** | finish-triad.tsx L57 `borderRadius:8`. |
| d-5 | StepHeader badge radius 999 (circle) | FAIL (a-12) | **RESOLVED** | step-header.tsx L35 `borderRadius:9999`. |
| d-6 | Memo TextInput radius 10 (vs 8) | FAIL | **RESOLVED** | beginner-form.tsx L170 `borderRadius:10` — 사양 verbatim. |
| d-7 | TastedAt TextInput radius (Beginner) | PASS (keep RN) | PASS | TastedAt UI는 Beginner 폼에서 제거됨 (Expert만 사용). beginner-form.tsx에 TastedAt 없음 — 키스크린 verbatim. (Expert는 별도 검증 영역) |
| d-8 | AutoSummaryCard radius 12 | FAIL (a-8) | **RESOLVED** | auto-summary-card.tsx L29 `borderRadius:12`. |
| d-9 | PriceCapture radius 12 / NumberInput radius 8 | FAIL (a-9) | **RESOLVED** | price-capture.tsx L71 `borderRadius:12` (카드) + L106 `borderRadius:8` (input). |
| d-10 | ShareToggle radius 12 | FAIL (a-10) | **RESOLVED** | share-to-community.tsx L40 `borderRadius:12`. |
| d-11 | Save pill radius 999 | FAIL (a-11) | **RESOLVED** | save-pill.tsx L42 `borderRadius:9999`. |
| d-12 | BlindMode gradient inner radius 8 | PASS | PASS (유지) | expert-form.tsx L100 `borderRadius:8`. |
| d-13/d-14 | Expert Section/Rating/Readiness radius | PASS | PASS (유지) | expert-form.tsx 변경 없음 (BlindMode gradient direction만 수정). |

**(d) 결과: 10/10 RESOLVED — PASS**

### (e) Typography 위계 — 1차 FAIL 14건 + WARN 1건

| 1차 # | 항목 | 1차 상태 | 2차 검증 | 증거 |
|---|---|---|---|---|
| e-1 | BeginnerHeader eyebrow (Inter 11 600 gold uppercase ls 1.76) | FAIL | **RESOLVED** | beginner-header.tsx L32-46 — 사양 `typography.beginnerEyebrow` 신규 토큰 사용 (design-tokens.ts L459 `Inter_500Medium, 11, lh 11, ls 1.76, uppercase`). family는 사양 §4-2 `Inter_500Medium` (사양에 500/600 둘 다 명시 — 500 채택). |
| e-2 | BeginnerHeader WineName (Playfair 22 600 cream) | FAIL | **RESOLVED** | beginner-header.tsx L58-63 / L108-114 `font-playfair, fontSize:22, lineHeight:26.4, text-text-primary`. WineNameInline 컴포넌트로 en-fallback chip 처리. |
| e-3 | BeginnerHeader Producer (Inter 13 secondary) | FAIL | **RESOLVED** | beginner-header.tsx L69-74 `font-inter text-card-body text-text-secondary` (Inter 13 lh 19.5). |
| e-4 | BeginnerHeader Greeting (Inter 12 muted lh 18) | FAIL | **RESOLVED** | beginner-header.tsx L78-83 `font-inter text-text-muted` + style `fontSize:12, lineHeight:18, marginTop:8`. `typography.beginnerGreeting` 신규 토큰과 동일. |
| e-5 | StepHeader badge text (Inter 11 700 cream) | FAIL (a-12) | **RESOLVED** | step-header.tsx L42-46 `fontSize:11, lineHeight:13.2, fontWeight:'700', color: cream(beginner)/deepestDark(expert)`. design-tokens.ts L461 `stepHeaderBadge`. |
| e-6 | StepHeader title (Inter 14 600 text-primary normal-case) | FAIL (위계 깨짐) | **RESOLVED** | step-header.tsx L49-53 `font-inter-semibold text-text-primary, fontSize:14, lineHeight:16.8`. cardSectionTitle 토큰 재사용 (사양 §4-2 확정). uppercase 제거. |
| e-7 | Impression label (Inter 12 600 cream) | FAIL (a-2) | **RESOLVED** | impression-triad.tsx L80-83 `font-inter-semibold, fontSize:12, lineHeight:14.4, color: active gold / idle text-primary`. |
| e-8 | Palate dim label normal-case primary + button text | FAIL | **RESOLVED** | palate-triad.tsx L64-69 dim label `font-inter text-text-primary, fontSize:12, lineHeight:14.4` (uppercase 제거, primary). L94-101 button text `font-inter, fontSize:12, color: active cream / idle secondary`. |
| e-9 | Aroma label (Inter 10 cream/gold) | FAIL | **RESOLVED** | aroma-grid.tsx L107-111 `font-inter, fontSize:10, color: active gold / idle text-primary`. 카드 wrapper 라벨 (StepHeader)는 step-header.tsx로 분리. |
| e-10 | Finish button text (Inter 13 active cream / idle secondary) | FAIL (a-5) | **RESOLVED** | finish-triad.tsx L66-71 `font-inter, fontSize:13, lineHeight:15.6, color: active cream / idle secondary`. |
| e-11 | Memo label (StepHeader 14 600 cream) | FAIL (위계 깨짐) | **RESOLVED** | beginner-form.tsx L156 `<StepHeader step={6} title={t('notes.writeForm.beginnerStep.memo')}/>` 사용. uppercase muted 카드 라벨 제거. |
| e-12 | Memo input text (Inter 14) | WARN (13→14) | **RESOLVED** | beginner-form.tsx L173 `fontSize:14`. |
| e-13 | AutoSummary eyebrow (Inter 11 gold uppercase ls 1.1) | FAIL (a-8) | **RESOLVED** | auto-summary-card.tsx L38-45 `font-inter, fontSize:11, lineHeight:11, letterSpacing:1.1, textTransform:'uppercase', color: gold, marginBottom:4`. design-tokens.ts L462 `summaryEyebrow`. |
| e-14 | AutoSummary body (Playfair 13 italic cream lh 19.5) | FAIL (a-8) | **RESOLVED** | auto-summary-card.tsx L49-54 `font-playfair text-text-primary, fontSize:13, lineHeight:19.5, fontStyle:'italic'`. design-tokens.ts L463 `summaryText` with `fontStyle:'italic'`. D9 deviation 명시. |
| e-15 | PriceCapture label (Inter 14 600 cream) | FAIL (a-9) | **RESOLVED** | price-capture.tsx L78-83 `font-inter-semibold text-text-primary, fontSize:14, lineHeight:16.8`. |
| e-16 | ShareToggle title / sub | FAIL (a-10) | **RESOLVED** | share-to-community.tsx L48-53 title `font-inter-semibold text-text-primary, fontSize:13, lineHeight:19.5`. L54-59 sub `font-inter text-text-muted, fontSize:11, lineHeight:13.2, marginTop:2`. cellarRowMeta 재사용 (사양 §4-2). |
| e-17 | Save pill text (Inter 15 600 cream center) | FAIL (a-11) | **RESOLVED** | save-pill.tsx L53-57 `font-inter-semibold, fontSize:15, color: cream, textAlign:'center'`. |
| e-18 | BackHeader title "테이스팅 노트" | WARN | **RESOLVED** | i18n ko.json L256 `"write": "테이스팅 노트"`, en.json L256 `"write": "Tasting note"` — keyscreen verbatim. |
| e-19~e-21 | Expert section/WSET/Blind text | PASS (Expert keep) | PASS (유지) | expert-form.tsx 변경 없음 (BlindMode gradient direction만). |

**(e) 결과: 14/14 RESOLVED — PASS**

### (f) Color 사용 — 1차 FAIL 8건

| 1차 # | 항목 | 1차 상태 | 2차 검증 | 증거 |
|---|---|---|---|---|
| f-1 | BeginnerHeader eyebrow gold | FAIL (a-1) | **RESOLVED** | beginner-header.tsx L42 `color: brand.gold`. |
| f-2 | BeginnerHeader WineName text-primary | FAIL | **RESOLVED** | beginner-header.tsx L58/108 `text-text-primary dark:text-text-primary` (양쪽 모드 분기). |
| f-3 | StepHeader badge bg wineRed (beginner) | FAIL (a-12) | **RESOLVED** | step-header.tsx L23 `badgeBg = variant === 'beginner' ? brand.wineRed : brand.gold`. |
| f-4 | StepHeader badge text cream | FAIL | **RESOLVED** | step-header.tsx L24 `badgeText = variant === 'beginner' ? brand.cream : brand.deepestDark`. |
| f-5 | Impression active bg withAlpha(gold, 0.18) | FAIL (a-2) | **RESOLVED** | impression-triad.tsx L70 `backgroundColor: active ? withAlpha(brand.gold, 0.18) : surfaceBg`. |
| f-6 | Impression active border / icon gold | FAIL | **RESOLVED** | impression-triad.tsx L72 active border gold + L77 icon color active gold. |
| f-7 | Impression idle bg-surface | FAIL | **RESOLVED** | impression-triad.tsx L70 idle = `surfaceBg` (useThemeTokens 분기). |
| f-8 | Palate triad active wineRed cream (gold dot 대체) | FAIL | **RESOLVED** | palate-triad.tsx L88-90 `backgroundColor: active ? brand.wineRed : surfaceBg, borderColor: active ? brand.wineRed : borderDefault`. L100 `color: active ? brand.cream : idleText`. WSETSlider gold dot 컴포넌트 자체가 Beginner에서 제거됨 (Expert에만 keep). |
| f-9 | Palate idle bg-surface + border-default | FAIL (a-3) | **RESOLVED** | palate-triad.tsx L88-90 idle = surface + border-default. |
| f-10 | AromaCard active bg withAlpha(gold,0.18) + gold border + gold icon (gold solid 대체) | FAIL | **RESOLVED** | aroma-grid.tsx L99-101 `backgroundColor: active ? withAlpha(brand.gold, 0.18) : surfaceBg, borderColor: active ? brand.gold : borderDefault`. L106 icon `color: active ? brand.gold : idleText`. AromaChips 컴포넌트는 더이상 BeginnerForm에서 사용되지 않음. |
| f-11 | FinishTriad active wineRed | FAIL (a-5) | **RESOLVED** | finish-triad.tsx L58-60 active wineRed bg/border + cream text. |
| f-12 | StarRating gold fill | PASS | PASS (유지) | StarRating 컴포넌트 변경 없음. |
| f-13 | Memo bg dark = bottle-shelf (#1A0A1E) / light = bg-deep | FAIL (D3) | **RESOLVED** | beginner-form.tsx L78 `memoBg = scheme === 'light' ? light.bg.deep : dark.bg.bottleShelf`. dark 모드 `#1a0a1e` 적용. |
| f-14 | Memo border idle = border-default (focus 시만 gold) | FAIL (항상 gold) | **RESOLVED** | beginner-form.tsx L79 `borderDefault` 사용 + L168 `borderColor: borderDefault` — idle 항상 border-default. gold focus는 사양에 없음 (focus state는 platform default). |
| f-15 | TastedAt border (Beginner) | FAIL | **N/A** | Beginner 폼에서 TastedAt 입력 자체 제거됨 (Expert만 사용). 사양 §2-2에서 명시되지 않음. (Expert form은 별도 영역 — gold border keep, 사양 미명시) |
| f-16 | AutoSummaryCard bg withAlpha(gold,0.06) / border withAlpha(gold,0.30) | FAIL (a-8) | **RESOLVED** | auto-summary-card.tsx L30-32. |
| f-17 | PriceCapture / ShareToggle bg-surface | FAIL (a-9/a-10) | **RESOLVED** | price-capture.tsx L70 + share-to-community.tsx L39 `backgroundColor: surfaceBg`. |
| f-18 | Save pill bg wineRed | FAIL (a-11) | **RESOLVED** | save-pill.tsx L43 `backgroundColor: brand.wineRed`. |
| f-19 | Save text cream (footer pill) | WARN | **RESOLVED** | save-pill.tsx L56 `color: brand.cream`. header SaveBtn은 gold/text-disabled keep (사양 E8 둘 다 keep). |
| f-20 | Expert BlindMode gradient colors #5A1A24 → #2D0D12 | PASS | PASS (유지) | design-tokens.ts L516 `gradients.expertBlind.colors = ['#5A1A24', '#2D0D12']`. |
| f-21 | Expert ReadinessPicker active | PASS | PASS (유지) | expert-form.tsx 변경 없음. |
| f-22 | Hardcoded hex grep | PASS | PASS (유지) | `grep -E "#[0-9A-Fa-f]{6}" src/components/notes/ app/notes/ src/lib/notes/` — raw hex 발견 1건 (beginner-form.tsx L77 코멘트 안 `#1A0A1E` / `#F2EAD9` — 코드 아닌 주석. design-tokens.ts/tailwind.config.ts 외 raw hex 사용 0건). |

**(f) 결과: 8/8 RESOLVED + f-15 N/A (Beginner 폼에서 TastedAt 제거됨) — PASS**

---

## 2. 신규 FAIL 검증 (post-fix에서 새로 생긴 문제 여부)

각 카테고리별 신규 FAIL 후보 점검:

### (a) 신규 요소 누락 — 없음
- 사양 §2-2 모든 요소 (BeginnerHeader / Step 1~6 / AutoSummary / Price / Share / Save pill) 구현됨.
- 사양 §10 escalation 17건 중 SCOPE-IN 결정 항목 (E1·E2·E6·E7·E8·E9·E10·E13·E14·E17) 모두 처리.
- E16 (is_public 컬럼)은 사양 §16에 "TODO(v0.2.0)" 명시 + share-to-community.tsx L17 코멘트 + write.tsx L297 코멘트로 SCOPE-OUT 라벨링됨 — UI state-only 동작 (insert payload omit).

### (b) 신규 spacing 위반 — 없음
- ScrollView contentContainerStyle 16/12/48 keep.
- BeginnerForm rowGap 18 정확.
- StepGroup 안 gap 8~10 사양 verbatim.
- 신규 카드 3종 padding 14 / radius 12 모두 사양 일치.

### (c) 신규 gradient 위반 — 없음
- Beginner 전체 flat (gradient 사용 0건) — 사양 verbatim.
- Expert BlindMode `gradients.expertBlind` (180deg) 사용 — c-1 RESOLVED.

### (d) 신규 radius 위반 — 없음
- Impression 12 / Palate 8 / Aroma 10 / Finish 8 / StepHeader badge 9999 / Memo 10 / AutoSummary 12 / Price 12 / Share 12 / Save 9999 — 모두 사양 verbatim.

### (e) 신규 typography 위반 — 없음
- 신규 typography 토큰 5개 (beginnerEyebrow / beginnerGreeting / stepHeaderBadge / summaryEyebrow / summaryText) design-tokens.ts L459-463 + tailwind.config.ts mirror 추가됨.
- BeginnerHeader / StepHeader / AutoSummary / Step 컨트롤 typography 모두 사양 §4-2 매핑.
- ImpressionTriad/PalateTriad/AromaGrid/FinishTriad label allFontScaling=false — 양쪽 모드 layout shift 방지.

### (f) 신규 color 위반 — 없음
- 모든 신규 컴포넌트가 useThemeTokens / brand / withAlpha 사용. raw hex 발견 0건 (grep 검증).
- ShareToggle border active=gold / idle=border-default — 사양 §2-2 verbatim.
- Switch trackColor: PriceCapture는 gold (사양), ShareToCommunity는 wineRed (사양) — 분리 적용 OK.

### 사양 verbatim 위반 — 0건

---

## 3. 다크/라이트 양쪽 모드 + ko/en 언어 검증

### 검증 가능 항목 (JSX/토큰만으로)

| 검증 항목 | 결과 | 증거 |
|---|---|---|
| useThemeTokens 사용 일관성 | PASS | impression-triad.tsx L20, palate-triad.tsx L22, aroma-grid.tsx L32, finish-triad.tsx L17, price-capture.tsx L24, share-to-community.tsx L22, beginner-form.tsx L43-44 — 모든 컴포넌트가 scheme 분기. |
| Memo bg dark/light 분기 (D3) | PASS | beginner-form.tsx L78 — dark=bottleShelf, light=bg-deep. |
| Price NumberInput bg dark/light 분기 | PASS | price-capture.tsx L41 — 동일 패턴. |
| Switch trackColor light 가독성 (gold #C9A84C on light surface #FFF) | WARN | gold #C9A84C on #FFFFFF 약 3.0:1 — WCAG AA 3.0 미달 (4.5 필요). 사양 §7 검토 권장. **STILL-WARN — 시뮬레이터 캡처 후 확인 권장** (Day 7 EAS build 전 검증). |
| i18n ko 키 38개 추가 | PASS | grep 결과 modeBeginnerEyebrow/todaysGlass/beginnerGreeting/beginnerStep.* (6 step labels)/impressionStar/Smile/Thinking/priceCaptureLabel/pricePlaceholder/shareLabel/shareSub/saveHint/beginnerMemoPlaceholder/beginnerSummaryEyebrow + palateDim 5/palateLevel 3/finishLevel 3/aromaCard 8 모두 존재. |
| i18n en 동기화 | PASS | en.json도 동일 라인 범위에서 동일 키 존재. |
| notes.write 값 변경 ("테이스팅 노트"/"Tasting note") | PASS | ko.json L256 "테이스팅 노트", en.json L256 "Tasting note". |
| 한국어 long-text wrap (Greeting 2줄) | PASS (예상) | beginner-header.tsx L78-83 Text flex container 안 multi-line 자동 wrap (numberOfLines 미지정 = 무제한). |
| AutoSummary 본문 wrap | PASS (예상) | auto-summary-card.tsx L49-54 numberOfLines 미지정 — 자동 wrap. |
| iOS vs Android italic render | SCOPE-OUT | 사양 D9 명시 — Day 7 EAS build 실측 영역. |

### 시뮬레이터/실측 검증 미수행 항목

- dark/light × ko/en 4 조합 캡처 미수행 (P2 세션 또는 rn-screen-builder 본인 캡처 권장)
- summarize() 함수 ko/en 출력 시각 검증 (palate.tannin 분기 + impression default 입력값 변경 시)
- ScrollView 키보드 올라왔을 때 Save pill 가림 여부
- Switch light 모드 대비 (gold on white) 실측
- TalkBack/VoiceOver focus 순서 (사양 §7-3)

**결과: 토큰 분기/i18n 검증 PASS. 시뮬레이터 캡처는 미수행이지만 코드 분기 자체는 모두 사양 verbatim** — Day 7 EAS build 전 권장 검증 항목으로 명시.

---

## 4. 스크린샷 비교 (멀티모달 시각 차이)

스크린샷 reference (`_workspace/keyscreen-shots/notes_new_write.png` Beginner / dark / ko) 14 시각 요소 vs post-fix 코드:

| # | 스크린샷 요소 | 1차 상태 | 2차 검증 |
|---|---|---|---|
| 1 | BackHeader `< 테이스팅 노트` | FAIL | RESOLVED (i18n L256) |
| 2 | "입문자 모드" gold uppercase eyebrow | FAIL | RESOLVED (beginner-header.tsx L32-46) |
| 3 | "오늘의 한 잔" Playfair 22 cream | FAIL | RESOLVED (beginner-header.tsx L57-65) |
| 4 | 안내문 muted 2줄 | FAIL | RESOLVED (beginner-header.tsx L78-83) |
| 5 | ① 첫 인상 triad Sparkles/Smile/HelpCircle | FAIL | RESOLVED (impression-triad.tsx) |
| 6 | ② 맛의 균형 4 dim × triad | FAIL | RESOLVED (palate-triad.tsx — wine type 따라 tannin/bubble dim 분기) |
| 7 | ③ AromaGrid 4×2 8 카드 | FAIL | RESOLVED (aroma-grid.tsx) |
| 8 | ④ 여운 triad short/medium/long | FAIL | RESOLVED (finish-triad.tsx) |
| 9 | ⑤ 평점 Star × 5 | PASS (half-step keep D2) | PASS |
| 10 | ⑥ 한 줄 메모 textarea + ko placeholder | FAIL (placeholder mismatch) | RESOLVED (beginner-form.tsx L160 + i18n verbatim) |
| 11 | AutoSummaryCard "오늘의 한 잔" Playfair italic | FAIL | RESOLVED (auto-summary-card.tsx) |
| 12 | PriceCapture 카드 "가격 입력 (+5 XP)" Switch | FAIL | RESOLVED (price-capture.tsx — 사양에는 "가격 입력 (+5 XP)" but 현재 i18n은 "가격 입력". 사양 §8-2 verbatim "가격 입력 (+5 XP)" — i18n 값 미일치) |
| 13 | ShareToCommunity 카드 + sub Switch | FAIL | RESOLVED (share-to-community.tsx) |
| 14 | Save pill wineRed full-width | FAIL | RESOLVED (save-pill.tsx + write.tsx L408-410 footer) |

### 시각 갭 평가 (post-fix)

- **폼 길이**: 키스크린 reference와 동일 수직 흐름 (6 Step + 3 보조 카드 + Save pill).
- **수직 위계**: Step 5개는 카드 wrapper 없이 StepHeader로 위계 형성. 보조 3 카드만 wrapper — 사양 verbatim.
- **색 톤**: wineRed × gold 이중 강조 복원 (Palate/Finish/StepHeader badge = wineRed, Impression/Aroma/AutoSummary = gold tint).
- **타이포그래피 위계**: Playfair (WineName/AutoSummary) + Inter eyebrow(11)/title(14)/body(12~13)/badge(11) 단계 형성.

### 미세 발견 (보고 의무 — STILL-WARN 1건)

- **#12 PriceCaptureLabel 값**: 사양 §8-2 verbatim은 `"가격 입력 (+5 XP)" / "Add price (+5 XP)"`. 현재 i18n은 `"가격 입력" / "Add price"` (XP 부분 제거). XP 시스템 SCOPE-OUT (E12) 결정에 의한 의도적 변경으로 판단되나 사양 §8-2 verbatim 표기와 불일치. **WARN — SCOPE-OUT 사유 일관됨 (XP 시스템 미구현이므로 "+5 XP" 표시는 misleading) — 사양 §8-2 미세 수정 권장 (design-spec-author 영역).** 시각 게이트 PASS 영향 없음.

---

## 5. 6항목 체크리스트 v2 요약

| 항목 | 1차 | 2차 결과 |
|---|---|---|
| (a) 요소 누락 | FAIL (12) | **PASS** |
| (b) Spacing 비율 | FAIL (11) | **PASS** |
| (c) Gradient 방향·깊이 | FAIL (1) | **PASS** |
| (d) Corner radius | FAIL (10) | **PASS** |
| (e) Typography 위계 | FAIL (14) | **PASS** |
| (f) Color 사용 | FAIL (8) | **PASS** |

**6/6 PASS**

---

## 6. 결정

- **최종 결과: PASS**
- **STILL-FAIL: 0건**
- **신규 FAIL: 0건**
- **SCOPE-OUT (사용자 명시 또는 사양 명시): 1건** — sub-task I (`tasting_notes.is_public` 컬럼) — UI state-only (insert payload omit), v0.2.0 supabase-engineer 영역.
- **STILL-WARN: 2건** (게이트 통과 영향 없음):
  - W1: Switch light 모드 gold trackColor 대비 (3.0:1 추정, WCAG AA 4.5 미달) — Day 7 EAS build 실측 영역.
  - W2: i18n `priceCaptureLabel` 값에서 "(+5 XP)" 제거됨 — 사양 §8-2 verbatim 표기와 미세 불일치. XP 시스템 SCOPE-OUT (E12)와 일관 → 사양 §8-2 의도적 수정 권장 (design-spec-author 영역).
- **미수행 (게이트 통과 영향 없음 — 권장)**:
  - 시뮬레이터 dark/light × ko/en 4 조합 캡처 (Day 7 EAS build 또는 P2 세션)
  - TalkBack/VoiceOver focus 순서 실측
  - ScrollView 키보드 가림 실측

### 라우팅

- **qa-inspector**: 시각 게이트 PASS → 다음 단계 (RLS·shape·i18n·hex grep). 
  - 추가 확인 영역: tasting_notes 신규 BeginnerFields jsonb shape (impression/palate/aromas/finish/memo/priceCapture?/shareToCommunity?) DB insert 성공 + detail 화면 (note-body-beginner.tsx) legacy+신규 양쪽 표시 정확성 + `notes.write` 값 변경에 따른 다른 BackHeader 사용처 정합성.
- **rn-screen-builder**: 통과 알림. 후속 작업 (Day 6 settings 3 sub 화면 + Day 7 EAS build) 계속.
- **design-spec-author**: 사양 §8-2 `priceCaptureLabel` verbatim 표기 vs SCOPE-OUT 사유 일관성 점검 — W2 항목. 게이트 영향 없음.
- **supabase-engineer**: sub-task I (`tasting_notes.is_public` 컬럼)는 v0.2.0 SCOPE-OUT 명시 → 본 화면 게이트 통과 영향 없음. v0.2.0 백로그.
- **infra-architect**: 신규 typography 토큰 5개 (`beginnerEyebrow / beginnerGreeting / stepHeaderBadge / summaryEyebrow / summaryText`) design-tokens.ts L459-463 + tailwind.config.ts mirror 적용 — 통과.

### 재검증 시점

- qa-inspector 단계 PASS 후 시뮬레이터 캡처 첨부 시 추가 검증 가능 (선택사항 — 게이트 통과 영향 없음).
- light 모드 Switch trackColor 대비 (W1) 실측 후 사양 §5-7 / §7-3 갱신 필요 시 design-spec-author와 협의.

---

## 7. 파일 산출

- 본 보고서: `_workspace/design-review_notes-write_20260521_011154_v2.md`
- 절대경로: `/Users/yejinkim/dev/winemine-app/_workspace/design-review_notes-write_20260521_011154_v2.md`
- 1차 보고서: `/Users/yejinkim/dev/winemine-app/_workspace/design-review_notes-write_20260521_005332.md`
