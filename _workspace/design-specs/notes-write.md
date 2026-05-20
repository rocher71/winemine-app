# notes-write (`/notes/new/write`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX (page.tsx + 자식들) > keyscreen `messages/{ko,en}.json` > design-system docs > 우리 design-tokens.
> 작성일: 2026-05-21 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/notes/new/write/page.tsx` (118 LOC — `NoteWriteInner` 분기 컨테이너)
- 자식 컴포넌트 (재귀 read):
  - `../winemine-keyscreen/src/components/nav/back-header.tsx` (56px header, ChevronLeft 24 + title)
  - `../winemine-keyscreen/src/components/tasting-note/note-write-beginner.tsx` (237 LOC — BeginnerNote + PriceCapture + ShareToCommunityToggle + Save 버튼)
  - `../winemine-keyscreen/src/components/tasting-note/beginner-note.tsx` (456 LOC — 6 Step 흐름 + 자동 요약 카드)
  - `../winemine-keyscreen/src/components/tasting-note/note-write-expert.tsx` (875 LOC — VariantTabs + 7 Step 흐름 + Save 버튼)
  - `../winemine-keyscreen/src/components/tasting-note/dynamic-template-form.tsx` (v0.2.0 — SCOPE-OUT)
  - `../winemine-keyscreen/src/components/tasting-note/{wset-slider,aroma-wheel,caudalie-meter,fault-checklist,opening-timeline,blind-mode,tannin-panel,bubble-panel,serving-temp-input,peak-eta-input,regional-aroma-hints,auto-description}.tsx` (Expert 자식들 — 대부분 v0.2.0)
- 도메인 lib:
  - `../winemine-keyscreen/src/lib/tasting-note-lexicon.ts` (FormVariant + WSETScale + Fault + AROMA_LEXICON)
  - `../winemine-keyscreen/src/lib/mock/tasting-templates.ts` (BUILTIN_BEGINNER_ID, BUILTIN_EXPERT_ID)
  - `../winemine-keyscreen/src/lib/mock/cellar.ts` (`getCellarItem`)
  - `../winemine-keyscreen/src/lib/mock/wines.ts` (`getWine`)
  - `../winemine-keyscreen/src/lib/xp.ts` (`XP_ACTIONS`, `calcNoteXp`)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- 산문 명세: `../winemine-keyscreen/screen-specs/notes-new-write.md` (275 LOC — 키스크린 본인 정리본)
- i18n (keyscreen): `notes.write.title`, `tastingNote.*`(wset/aroma/fault/bubble), `xp.*`, `common.save`
- 스크린샷 reference: `_workspace/keyscreen-shots/notes_new_write.png` (Beginner — dark, ko — BackHeader "< 테이스팅 노트" / "입문자 모드" Inter 11 gold uppercase / Playfair 22 "오늘의 한 잔" / 안내문 muted / Step 1~6 / 자동 요약 카드 / 가격·공유 토글 / wineRed Save pill)
- 현재 RN 구현 (retroactive 대상): `app/notes/new/write.tsx` (341 LOC) + `src/components/notes/{beginner-form, expert-form, wset-slider, aroma-chips, star-rating, mode-toggle, wine-link-card}.tsx` (각각 65~345 LOC)

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/notes/new/write.tsx` (그대로 유지 — `(tabs)` 그룹 외부) |
| 진입 경로 | `/notes/new/write` |
| 진입 쿼리 (v0.1.0 — 현재 RN scheme 우선) | `wine_lwin` / `source` (cellar/restaurant/shop/gift/tasting_event/other) / `photo_url` |
| 진입 쿼리 (keyscreen scheme — §10 escalation) | `from` (cellar/newEntry/draft) / `itemId` / `wineId` / `templateId` (`builtin-beginner` / `builtin-expert`) / `fromCellar` |
| 헤더 | `<BackHeader title={t('notes.write')} right={SaveBtn} />` — 56px, ChevronLeft 24 + Inter 600 16 cream + 우측 텍스트 Save |
| BottomNav | **숨김** — keyscreen `HIDDEN_PREFIXES` `/notes/new` 포함. expo-router `(tabs)` 외부라 자동 숨김 |
| 가드 | Suspense fallback null (keyscreen) → RN은 그냥 `wineLoading ? ActivityIndicator : Form` |
| 다크/라이트 | 둘 다 지원 |
| 화면 분기 | 1) `templateId === 'builtin-expert' || (!templateId && experience==='expert')` → ExpertForm / 2) else → BeginnerForm. `customTemplate` 분기는 v0.2.0 SCOPE-OUT |

> **현재 RN 차이**: write.tsx에 `mode` state (BeginnerForm/ExpertForm 토글) + `ModeToggle` UI. keyscreen은 화면 진입 시 templateId/experience로 결정되고 화면 내 토글 없음. v0.1.0은 keep ModeToggle UI (정합성 + writeForm 유연성). §10 escalation E1.

---

## 2. Layout Tree (verbatim 변환)

keyscreen `page.tsx` line 87~109 + `note-write-beginner.tsx` line 89~123 + `beginner-note.tsx` line 96~370 + `note-write-expert.tsx` line 390~613 그대로 RN 트리화.

### 2-1. 공통 컨테이너 (page.tsx)

```
SafeAreaView (edges=['top'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
├── BackHeader                                              ← keyscreen line 89
│     ├── BackButton (32×32, ChevronLeft 24 stroke 1.75 cream)
│     │     onPress → confirmDiscard (Alert) → router.back()
│     ├── Title (Inter 600 16 cream)
│     │     label: t('notes.write') ("테이스팅 노트 작성" — 현재 RN값 / keyscreen은 "테이스팅 노트")
│     │     ← §10 E2: keyscreen verbatim "테이스팅 노트" / "Tasting note" 로 변경 검토
│     └── Right slot (Pressable Save, 우측 px-3 py-2)
│           label: t('notes.writeForm.save') ("저장" / "Save")
│           color: gold (active) / text-disabled (wine_lwin null)
│           saving 시 → <ActivityIndicator color={brand.gold}/>
│
├── KeyboardAvoidingView (behavior iOS=padding android=undefined, flex:1)
│     │
│     └── ScrollView (flex-1, contentContainerStyle: paddingTop 12 paddingHorizontal 16 paddingBottom 48)
│           — keyboardShouldPersistTaps="handled", showsVerticalScrollIndicator=false
│           — 키스크린: padding '12px 16px 24px' (Beginner 부모는 16/16/96 inner)
│           — 우리 RN: paddingBottom 48 (keep — 키보드 + Save Btn 여유)
│           │
│           ├── WineLinkCard                                ← 현재 RN enhancement (keyscreen은 메타가 폼 내부 헤더)
│           │     — wine === null 시: CTA 카드 (capture 경로)
│           │     — wine !== null 시: 와인 카드 (이름·생산자·빈티지)
│           │
│           ├── ModeToggle (mt-4)                          ← 현재 RN enhancement
│           │     — beginner / expert 토글
│           │
│           └── Form (mt-4)
│                 — mode === 'beginner' ? BeginnerForm : ExpertForm
│
└── Toast overlay (absolute bottom-6 left-4 right-4)
      — saveFailed / validationFailed / wineLinkEmpty
```

### 2-2. BeginnerForm 트리 (beginner-note.tsx + note-write-beginner.tsx)

> 키스크린은 `<section gap 18>` 안에 6 Step + 자동 요약 카드 + PriceCapture + ShareToCommunityToggle + Save pill. RN은 keyscreen에 가깝게 6 Step + 자동 요약 카드를 합치는 retroactive 권장.

```
View (flex column, gap 18)
│
├── BeginnerHeader (View)                                    ← keyscreen line 98~136 NEW
│     ├── Eyebrow (Inter 11 600 gold, uppercase, letter-spacing 1.76)
│     │     label: t('notes.writeForm.modeBeginnerEyebrow') ("입문자 모드" / "Beginner mode") — 신규 키
│     ├── WineName (Playfair 22 600 cream, mt 4 mb 4)
│     │     value: wine.name_ko ?? wine.display_name (WineNameDisplay size="page")
│     │     fallback (wine null): t('notes.writeForm.todaysGlass') ("오늘의 한 잔" / "Today's glass") — 신규
│     ├── Producer (Inter 13 secondary)
│     │     value: wine.producer_name
│     └── Greeting (Inter 12 muted lineHeight 1.5 mt 8)
│           label: t('notes.writeForm.beginnerGreeting') 신규
│             ko: "와인 한 잔, 5분이면 끝나는 짧은 기록. 어려운 용어는 잠시 잊고 느낀대로 적어보세요."
│             en: "A 5-minute record of your wine. Forget the jargon — just write what you feel."
│
├── Step 1 — 첫 인상 (StepGroup)
│     ├── StepHeader (number=1)                            ← circular badge 22×22 wineRed bg cream text, Inter 11 700 + Inter 14 600 cream title
│     │     title: t('notes.writeForm.beginnerStep.impression') ("첫 모금, 어땠어요?" / "First sip — how was it?") 신규
│     └── ImpressionTriad (flex-row gap 8)
│           Pressable × 3 (flex 1, padding 14_8, radius 12, bg-surface, border 1px border-default,
│                          active: bg gold/0.18, border gold)
│             ├── Sparkles icon 26 (active gold, idle cream)
│             ├── 와! 최고! / Wow!
│             ├── Smile 26 → 괜찮아요 / Nice
│             └── HelpCircle 26 → 음... 글쎄 / Hmm...
│           value state: impression ∈ {star, smile, thinking}
│
├── Step 2 — 맛의 균형 (StepGroup gap 10)
│     ├── StepHeader (number=2)
│     │     title: t('notes.writeForm.beginnerStep.palate') ("맛의 균형" / "Balance") 신규
│     └── PalateDimensions (gap 10)
│           PalateRow × N (dim: sweetness, acidity, body, tannin?red, bubble?sparkling)
│             ├── DimLabel (Inter 12 cream, gap 4 + GlossaryTooltip if tipId)
│             └── Triad (flex-row gap 6) Pressable × 3 (flex 1, padding 8, radius 8, font 12,
│                  idle: bg-surface border border-default text-secondary,
│                  active: bg wineRed border wineRed text cream)
│                  - 낮음 / Low → 중간 / Mid → 높음 / High
│
├── Step 3 — 어떤 향이 떠올라요? (StepGroup gap 8)
│     ├── StepHeader (number=3)
│     │     title: t('notes.writeForm.beginnerStep.aroma') ("어떤 향이 떠올라요?" / "What aromas come to mind?") 신규
│     └── AromaGrid (display grid 4 cols, gap 6)
│           AromaCard × 8 (Pressable, padding 10_4, radius 10, bg-surface border default,
│                          active: bg gold/0.18 border gold, flex column gap 2 items-center)
│             - Cherry → 베리 / Berry
│             - Citrus → 시트러스 / Citrus
│             - Apple → 복숭아·살구 / Stone fruit
│             - Flower2 → 꽃 / Floral
│             - Flame → 향신료 / Spice
│             - Candy → 꿀·캐러멜 / Honey/Caramel
│             - Sprout → 흙·허브 / Earth/Herb
│             - Wheat → 빵·이스트 / Bread/Yeast
│           icon size 20 stroke 1.5 (active gold, idle cream) + Inter 10 label
│
├── Step 4 — 여운은 얼마나? (StepGroup)
│     ├── StepHeader (number=4)
│     │     title: t('notes.writeForm.beginnerStep.finish') ("여운은 얼마나?" / "How long does it linger?") 신규
│     └── FinishTriad (flex-row gap 6)
│           Pressable × 3 (flex 1, padding 10, radius 8, font 13,
│                          idle: bg-surface border border-default text-secondary,
│                          active: bg wineRed border wineRed text cream)
│             - 짧음 / Short → 중간 / Medium → 긴 / Long
│
├── Step 5 — 평점 (StepGroup)
│     ├── StepHeader (number=5)
│     │     title: t('notes.rating') ("별점" / "Rating") — 기존 키
│     └── StarRating (flex-row gap 6)
│           Star × 5 (lucide Star size 28 strokeWidth 1.5,
│                     fill gold when n <= rating, stroke gold-or-border-default)
│           ← 현재 RN은 half-star 지원 (1~5 / 0.5 단위) — keep
│
├── Step 6 — 한 줄 메모 (StepGroup)
│     ├── StepHeader (number=6)
│     │     title: t('notes.writeForm.beginnerStep.memo') ("한 줄 메모" / "A line about this wine") 신규
│     └── MemoInput (TextInput multiline rows 3, w-full,
│            bg bg-deep (#1a0a1e/light bg-deep), border 1px border-default, radius 10,
│            padding 10_12, font Inter 14 cream, resize vertical)
│           placeholder ko: "예: 새 친구가 추천해준 와인. 첫 잔이 따뜻하게 느껴졌다."
│           placeholder en: "e.g. A friend recommended it. First sip felt warm."
│           — t('notes.writeForm.beginnerMemoPlaceholder') 신규
│
├── AutoSummaryCard (View, padding 12, radius 12,
│       bg withAlpha(gold, 0.06), border 1px withAlpha(gold, 0.30))
│     ├── Eyebrow (Inter 11 gold, uppercase, letter-spacing 0.10em, mb 4)
│     │     label: t('notes.writeForm.beginnerSummaryEyebrow') ("오늘의 한 잔" / "Today's glass") 신규
│     └── SummaryText (Playfair 13 italic cream lineHeight 1.5)
│           value: summarize(impression, palate, aromas, finish, rating, locale) — 클라이언트 계산
│
├── PriceCapture (View, padding 14, radius 12, bg-surface border border-default)
│     ├── Label (flex-row justify-between items-center, Inter 14 600 cream)
│     │     ├── "가격 입력 (+5 XP)" / "Add price (+5 XP)" — t('notes.writeForm.priceCaptureLabel') 신규
│     │     └── Switch (track gold/border-default, thumb cream)
│     └── if priceCapture
│           NumberInput (TextInput keyboardType=number-pad, bg bg-deep border border-default,
│                          radius 8, padding 10_12, Inter 14 cream)
│             placeholder: "가격 (KRW)" / "Price (KRW)" — t('notes.writeForm.pricePlaceholder') 신규
│
├── ShareToCommunityToggle (View, padding 14, radius 12, bg-surface,
│       border 1px (active: gold, idle: border-default))
│     └── Label (flex-row justify-between items-center gap 12)
│           ├── Stack (flex 1)
│           │     ├── Title (Inter 13 600 cream)
│           │     │     label: "커뮤니티에 공유" / "Share to community" — t('notes.writeForm.shareLabel') 신규
│           │     └── Sub (Inter 11 text-muted mt 2)
│           │           label: "커뮤니티의 시음 노트 탭에서 이 노트가 보여요." /
│           │                  "Others can see this note on the community Notes tab." 신규
│           └── Switch (track wineRed/border-default, thumb cream)
│
└── SavePill (Pressable, padding 14_16, radius 999, bg wineRed,
       Inter 15 600 cream center)
      label: t('notes.writeForm.save') ("저장" / "Save")
      onPress → submit() (zod parse → supabase insert → router.replace(`/notes/${id}`))
      disabled: !wineLwin (opacity 0.5 + 무효)
      saving: <ActivityIndicator color={brand.cream}/>

(BeginnerForm 전체 패딩: keyscreen 16_16_96 / 우리 RN: ScrollView contentContainerStyle 16_12_48 사용 — keep)
```

### 2-3. ExpertForm 트리 (note-write-expert.tsx)

> 키스크린은 7 Step (Capture / Aroma / Palate / Finish / Faults / Evolution / Peak ETA & Rating). v0.1.0 RN은 5 Section (Blind toggle + Rating + Appearance + Nose + Palate + Conclusions) — 키스크린과 시작 구조 차이. **§10 escalation E3**: 키스크린 7-step verbatim 채택 vs 현재 RN 5-section 보존. v0.1.0은 **keep 현재 RN 구조** (Plan D §4-8 TS code 작게).

```
View (flex column, gap 18)
│
├── VariantTabs (현재 RN 미구현 — §10 escalation E4)         ← keyscreen line 393
│     keyscreen: white / red / sparkling / blind 4-tab
│     v0.1.0 RN: BlindToggle Switch만 — keep (variant은 wine.type_canonical로 자동)
│
├── BlindToggleCard (View, padding 16, radius 12, bg-surface)
│     ├── Row (flex-row justify-between items-center)
│     │     ├── Label (Inter 12 muted uppercase)
│     │     │     label: t('notes.writeForm.blindMode') ("블라인드 모드" / "Blind mode") — 기존
│     │     └── Switch (track gold/border-default, thumb cream)
│     └── if blind enabled
│           LinearGradient (expertBlindBg start→end, mt 12, radius 8, padding 16_12)
│           — Inter 13 cream center "블라인드 모드"
│
├── RatingCard (View, padding 16, radius 12, bg-surface)
│     ├── Label (Inter 12 muted uppercase) — t('notes.rating')
│     └── StarRating (mt 8) — 1~5 / half-step
│
├── Section "외관" — t('notes.expert.sectionAppearance')      ← 키스크린 step 1 "Capture" 와 다름
│     ├── SectionTitle (Inter 14 600 gold uppercase) — typography.sectionTitle
│     ├── WSETSlider (intensity 1~5)
│     ├── WSETSlider (clarity 1~3)
│     └── NoteField (multiline) — "관찰 메모"
│
├── Section "향" — t('notes.expert.sectionNose')              ← keyscreen step 2 Aroma 와 유사
│     ├── WSETSlider (intensity 1~5)
│     ├── WSETSlider (development 1~3)
│     └── NoteField (multiline) — "감지된 아로마"
│
├── Section "맛" — t('notes.expert.sectionPalate')            ← keyscreen step 3 Palate
│     ├── WSETSlider × 7 (sweetness, acidity, tannin, alcohol, body, flavor, finish)
│     ← keyscreen은 caudalies (CaudalieMeter 1~30) 별도, finishLength enum 변환 — v0.1.0은 WSET 1~5 통일
│
├── Section "결론" — t('notes.expert.sectionConclusions')     ← keyscreen step 7 Rating
│     ├── WSETSlider (quality 1~5)
│     ├── ReadinessPicker (tooYoung / drink / pastPeak)
│     │     Pressable × 3 (flex 1, padding 8, radius 8, border 1 gold,
│     │     active: bg gold text bg-deepest / idle: bg bg-deep text-secondary)
│     └── PriceField (TextInput number-pad, keyscreen은 priceCapture 옵션 — v0.1.0은 단순 PriceField)
│
└── DateField — t('notes.tastedAt') (TextInput YYYY-MM-DD)
      (keyscreen은 openedAt timestamp ISO — v0.1.0은 단순 date)
```

> **WSETSlider 변환**: 키스크린은 5-stage low/mediumMinus/medium/mediumPlus/high (`WSETScale` enum). 우리 RN은 1~5 dot 컨트롤 (`number`). 의미 동등 — **§10 deviation E5** (라벨 mapping은 i18n `notes.beginner.wsetShort.*` 기존 사용).

### 2-4. StepHeader 컴포넌트 명세 (BeginnerForm 신규 필요)

```
View (flex-row items-center gap 8)
├── NumberBadge (View 22×22, radius 999,
│     bg wineRed (beginner) / gold (expert keyscreen step header),
│     items-center justify-content)
│     └── Text (Inter 11 700 cream (beginner) / deepestDark (expert))
│           value: step number (1, 2, 3, ...)
└── Title (Inter 14 600 cream)
```

> 우리 RN BeginnerForm은 현재 StepHeader 없음 — 카드 안에 그냥 라벨 + 컨트롤. **§10 escalation E6**: keyscreen verbatim Step 흐름 채택 권장 (시각 게이트 통과 위해).

---

## 3. NativeWind v4 className 매핑표

> NW v4 기본 토큰 + `tailwind.config.ts` extended 토큰 (design-tokens.ts mirror) 우선. raw hex 금지.
> 사용 가능: `bg-{deepest|deep|map|surface|sunken|bottle-shelf}` · `text-{primary|secondary|muted|disabled}` · `border-{default|active}` · `text-gold text-wine-red` · font scale `text-modal-title text-card-body text-card-meta text-card-title text-back-title text-button-md` 등

| 키스크린 표기 | RN+NW v4 | 비고 |
|---|---|---|
| 외부 컨테이너 (`page.tsx` line 91 `<main className="wm-scroll-area" style={padding 12_16_24}>`) | `<SafeAreaView edges=['top'] className="flex-1 bg-bg-deepest dark:bg-bg-deepest">` + `<ScrollView className="flex-1" contentContainerStyle={{paddingTop:12,paddingHorizontal:16,paddingBottom:48}}>` | wm-scroll-area는 globals.css scrollbar styling — RN default |
| `<header>` BackHeader | 기존 RN `<BackHeader title={t('notes.write')} onBack={confirmDiscard} right={SaveBtn} />` | 사양 키 변경: `notes.write` → "테이스팅 노트" (keyscreen verbatim) §10 E2 |
| `<BeginnerNote section style={gap 18}>` | `<View className="gap-4">` style={{rowGap:18}} | gap 18 raw — RN gap 단위. spacing[4]=16과 약간 다름 (가독성 위해 raw 18 권장) |
| `<header><p eyebrow Inter 11 letter-spacing 0.16em uppercase gold>` (BeginnerHeader eyebrow) | `<Text className="font-inter-medium" style={{fontSize:11,color:brand.gold,letterSpacing:1.76,textTransform:'uppercase'}}>` | letterSpacing 0.16em → 11×0.16=1.76. 신규 typography `beginnerEyebrow: Inter 500 11 ls 1.76 uppercase` (§4 P0) |
| `<h3 font-playfair size 22 weight 600 cream m 4_0_4>` (WineName) | `<Text className="font-playfair text-modal-title text-text-primary mt-1 mb-1">` | `typography.modalTitle` = Playfair 22 lh 26.4 — 기존 토큰 |
| `<p Inter 13 secondary>` (Producer) | `<Text className="font-inter text-card-body text-text-secondary">` | `typography.cardBody` |
| `<p Inter 12 muted lineHeight 1.5 mt 8>` (Greeting) | `<Text className="font-inter text-text-muted mt-2" style={{fontSize:12,lineHeight:18}}>` | 12×1.5=18. 신규 typography `beginnerGreeting: Inter 400 12 lh 18` (§4 P0) |
| `<section gap 8>` Step group | `<View>` style={{rowGap:8}} | gap 8 |
| StepHeader `<h4 Inter 14 600 cream gap 8>` + `<span 22×22 wineRed circle>` | `<View className="flex-row items-center gap-2"><View className="rounded-full" style={{width:22,height:22,backgroundColor:brand.wineRed,alignItems:'center',justifyContent:'center'}}><Text className="font-inter-bold" style={{fontSize:11,color:brand.cream}}>{n}</Text></View><Text className="font-inter-semibold text-card-meta text-text-primary" style={{fontSize:14,lineHeight:16.8}}>{title}</Text></View>` | 신규 typography `stepHeaderTitle: Inter 600 14 lh 16.8` + `stepHeaderBadge: Inter 700 11 lh 13.2` (§4 P0) |
| ImpressionTriad `flex gap 8` | `<View className="flex-row gap-2">` | gap-2=8 |
| Impression button (flex 1, padding 14_8, bg-surface/gold-tint, border 1 gold/border-default, radius 12, gap 4 column items-center) | `<Pressable className="flex-1 items-center rounded-xl" style={({pressed})=>({paddingVertical:14, paddingHorizontal:8, backgroundColor: active ? withAlpha(brand.gold,0.18) : surface, borderWidth:1, borderColor: active ? brand.gold : borderDefault, transform:[{scale: pressed?0.98:1}], rowGap:4})}>` | radius `xl`=12. transform scale: keyscreen은 cursor pointer만, RN feedback 추가 |
| Impression icon `<opt.Icon size 26 stroke 1.5 gold/cream>` | `<Sparkles size={26} strokeWidth={1.5} color={active ? brand.gold : (scheme==='dark'?dark.text.primary:light.text.primary)} />` | lucide-react-native |
| Impression label `Inter 12 600` | `<Text className="font-inter-semibold" style={{fontSize:12,color: scheme==='dark'?dark.text.primary:light.text.primary}}>` | 기존 `typography.cardMeta`(12 lh 14.4) 재사용 가능 |
| Palate dim label `Inter 12 cream mb 4 gap 4` | `<View className="flex-row items-center gap-1 mb-1"><Text className="font-inter text-text-primary" style={{fontSize:12}}>...</Text>(+ GlossaryTooltip)</View>` | mb-1=4 / gap-1=4 |
| Palate triad button (flex 1, padding 8, radius 8, font 12, active wineRed cream / idle surface secondary) | `<Pressable className="flex-1 items-center rounded-lg py-2" style={({pressed})=>({backgroundColor: active ? brand.wineRed : surface, borderWidth:1, borderColor: active ? brand.wineRed : borderDefault, transform:[{scale: pressed?0.98:1}]})}><Text className="font-inter" style={{fontSize:12, color: active ? brand.cream : textSecondary}}>{label}</Text></Pressable>` | radius `lg`=8 |
| AromaGrid `grid 4 cols gap 6` | `<View className="flex-row flex-wrap" style={{rowGap:6,columnGap:6}}>` (각 카드 width `${(100-3*6/3)/4}%` ≈ 23.5%) | RN grid 미지원 — flex-wrap + 4-cards-per-row 수동 width. **§9 deviation D1** |
| AromaCard (padding 10_4, radius 10, bg-surface/gold-tint, gap 2 column items-center) | `<Pressable className="items-center rounded-lg" style={({pressed})=>({width:'23.5%',paddingHorizontal:4,paddingVertical:10,backgroundColor: active ? withAlpha(brand.gold,0.18):surface, borderWidth:1, borderColor: active ? brand.gold:borderDefault, transform:[{scale: pressed?0.98:1}],rowGap:2})}>` | radius `lg`=10 (정확히는 keyscreen 10 — radius[10] 기존 토큰 재사용) |
| AromaCard icon 20 stroke 1.5 + label Inter 10 | `<Cherry size={20} strokeWidth={1.5} color={active?brand.gold:textPrimary}/><Text className="font-inter" style={{fontSize:10,color: active?brand.gold:textPrimary}}>{label}</Text>` | 8 icons: Cherry/Citrus/Apple/Flower2/Flame/Candy/Sprout/Wheat |
| FinishTriad (동일 Palate triad 패턴) | (Palate triad 매핑 재사용) | font 13 (Palate는 12) — fontSize: 13 |
| StarRating row `flex gap 6` | `<View className="flex-row gap-1.5">` (5×Pressable) | 기존 RN `<StarRating>` 컴포넌트 재사용 — half-step keep. keyscreen은 full-star only — **§9 deviation D2** |
| Memo TextInput `bg map-dark(#1A0A1E) border border-default radius 10 padding 10_12 Inter 14 cream resize vertical` | `<TextInput multiline numberOfLines={3} className="rounded-lg font-inter text-card-body text-text-primary" style={{backgroundColor: scheme==='dark'?dark.bg.bottleShelf:light.bg.deep, borderWidth:1, borderColor:borderDefault, paddingHorizontal:12, paddingVertical:10, minHeight: 80, textAlignVertical:'top'}}>` | `dark.bg.bottleShelf`=#1a0a1e 양쪽 사용 (keyscreen verbatim) — **§9 D3**: light는 light.bg.deep로 분기 권장 (#F2EAD9 — 대비 가독성) |
| Memo placeholder | `placeholder={t('notes.writeForm.beginnerMemoPlaceholder')} placeholderTextColor={textDisabled}` | textDisabled token 사용 |
| AutoSummaryCard (padding 12, radius 12, bg gold/0.06, border 1 gold/0.30, font Inter 13 cream lh 1.5) | `<View className="rounded-xl p-3" style={{backgroundColor: withAlpha(brand.gold,0.06), borderWidth:1, borderColor: withAlpha(brand.gold,0.30)}}>` | radius `xl`=12 / padding `p-3`=12 |
| AutoSummary eyebrow (gold Inter 11 uppercase ls 0.10em mb 4) | `<Text className="font-inter" style={{fontSize:11,color:brand.gold,textTransform:'uppercase',letterSpacing:1.1,marginBottom:4}}>` | ls 0.10em → 11×0.10=1.1. 신규 typography `summaryEyebrow: Inter 400 11 ls 1.1 uppercase` (§4 P0) — 또는 기존 `homeEyebrow`(ls 1.8) 재사용 X (값 다름) |
| AutoSummary text (Playfair italic 13 cream lh 1.5) | `<Text className="font-playfair italic" style={{fontSize:13,lineHeight:19.5,color:textPrimary}}>` | `typography.cardBody`와 size/lh 동일 but italic + Playfair. 신규 typography `summaryText: Playfair 13 lh 19.5 italic` (§4 P0) — RN은 fontStyle:'italic' style 적용 |
| PriceCapture section (padding 14, radius 12, bg-surface border border-default) | `<View className="rounded-xl bg-surface" style={{padding:14, borderWidth:1, borderColor:borderDefault}}>` | radius xl=12 |
| PriceCapture label (flex justify-between items-center, Inter 14 600 cream) | `<View className="flex-row items-center justify-between"><Text className="font-inter-semibold text-card-meta text-text-primary" style={{fontSize:14}}>{label}</Text><Switch ... /></View>` | NW v4 native Switch는 RN core — accentColor 대신 trackColor/thumbColor |
| Price NumberInput (bg #1A0A1E border border-default radius 8 padding 10_12 Inter 14 cream) | `<TextInput keyboardType="number-pad" className="rounded-lg font-inter text-card-body text-text-primary" style={{backgroundColor: dark.bg.bottleShelf (or light.bg.deep), borderWidth:1, borderColor:borderDefault, paddingHorizontal:12, paddingVertical:10, marginTop:10}}>` | radius lg=8 |
| ShareToggle section (padding 14 radius 12 bg-surface border 1 gold-or-default) | `<View className="rounded-xl bg-surface" style={{padding:14, borderWidth:1, borderColor: on ? brand.gold : borderDefault}}>` | active border gold ↔ idle border-default |
| ShareToggle stack (gap 12 flex-row items-center) | `<View className="flex-row items-center" style={{columnGap:12}}>` | |
| ShareToggle title (Inter 13 600 cream) + sub (Inter 11 muted mt 2) | `<View className="flex-1"><Text className="font-inter-semibold text-card-body text-text-primary">{title}</Text><Text className="font-inter text-text-muted" style={{fontSize:11,marginTop:2}}>{sub}</Text></View>` | 신규 typography `shareToggleSub: Inter 400 11 lh 13.2` (§4 P0) — 또는 기존 `cellarRowMeta`(Inter 11 lh 13.2) 재사용 |
| Save pill `bg wine-red border 0 cream padding 14_16 radius 999 Inter 15 600` | `<Pressable className="rounded-full bg-wine-red" style={({pressed})=>({paddingVertical:14, paddingHorizontal:16, opacity: disabled?0.5:1, transform:[{scale:pressed?0.98:1}]})}><Text className="font-inter-semibold text-button-lg text-cream text-center">{t('notes.writeForm.save')}</Text></Pressable>` | `typography.primaryButtonLg` = Inter 600 15 (기존). bg-wine-red NW 토큰. radius full=9999 |
| `<TextInput>` (BlindMode gradient) `LinearGradient(180deg, expertBlindBg)` | `<LinearGradient colors={[expertBlindBg.start, expertBlindBg.end]} start={{x:0,y:0}} end={{x:1,y:1}} style={{borderRadius:8,padding:16_12,marginTop:12}}>` | **§9 deviation D4**: keyscreen은 180deg (위→아래) but 현재 RN x:0 y:0 → x:1 y:1 (135deg 대각). keyscreen verbatim 권장 — `gradients.expertBlind` 사용 (start {0.5,0} end {0.5,1}) |

---

## 4. 디자인 토큰 (lib/design-tokens.ts 기준)

### 4-1. 기존 토큰 (재사용)

| 토큰 | 값 | 사용처 |
|---|---|---|
| `dark.bg.deepest` `light.bg.deepest` | `#251837` / `#FAF5EC` | Screen outer |
| `dark.bg.surface` `light.bg.surface` | `#3D2A4A` / `#FFFFFF` | 모든 카드 / PriceCapture / ShareToggle / Step cards (현재 RN) |
| `dark.bg.bottleShelf` | `#1A0A1E` (양쪽 동일 — keyscreen verbatim) | Memo TextInput bg (dark) / Price NumberInput bg (dark). light 모드는 §9 D3로 분기 권장 |
| `light.bg.deep` | `#F2EAD9` | Memo TextInput bg (light — D3 분기) / Price NumberInput bg (light) |
| `dark.border.default` `light.border.default` | `#5A3D6A` / `#E0D2BC` | 모든 카드 border idle, Memo/Price TextInput border |
| `dark.text.primary` `light.text.primary` | `#F8F4ED` / `#2A1A14` | WineName, Producer, Step titles, Impression labels, Palate active, Memo text |
| `dark.text.secondary` `light.text.secondary` | `#EBE0CB` / `#5A463C` | Producer, Palate idle label, Aroma idle label |
| `dark.text.muted` `light.text.muted` | `#CABDA8` / `#8B7766` | Greeting, ShareToggle sub, Memo placeholder (text-disabled 대안) |
| `dark.text.disabled` `light.text.disabled` | `#7E6E8E` / `#C0B0A0` | TextInput placeholder, Save (no wine) |
| `brand.gold` | `#C9A84C` | Eyebrow, AromaCard active border/icon, StepHeader (expert), CustomBadge, ShareToggle active border, AutoSummary border/eyebrow |
| `brand.wineRed` | `#8B1A2A` | StepHeader badge (beginner), Palate/Finish active bg/border, Save pill bg, BlindMode gradient start (#5A1A24 actual) |
| `brand.wineRedDeep` | `#5b1424` | (이미 cellar에서 사용 — 여기 미사용) |
| `brand.cream` | `#F5F0E8` | StepHeader badge text, Save text, Palate active text, Impression label |
| `withAlpha(brand.gold, 0.18)` | `rgba(201,168,76,0.18)` | Impression active bg, AromaCard active bg |
| `withAlpha(brand.gold, 0.06)` | `rgba(201,168,76,0.06)` | AutoSummaryCard bg |
| `withAlpha(brand.gold, 0.30)` | `rgba(201,168,76,0.30)` | AutoSummaryCard border |
| `radius.xl` | 12 | Impression, PriceCapture, ShareToggle, AutoSummary, StepCard |
| `radius.lg` | 8 | Palate/Finish triad, Aroma TextInput, Price NumberInput |
| `radius[10]` | 10 | Memo TextInput, AromaCard (keyscreen verbatim 10 — 기존 cellar-list 신규 추가됨) |
| `radius.full` | 9999 | StepHeader badge circle, Save pill |
| `spacing[1]` 4 / `[1.5]` 6 / `[2]` 8 / `[2.5]` 10 / `[3]` 12 / `[3.5]` 14 / `[4]` 16 | | 모든 gap·padding·margin |
| `typography.modalTitle` | Playfair 22 lh 26.4 | BeginnerHeader WineName |
| `typography.cardBody` | Inter 13 lh 19.5 | Producer, ShareToggle title, Memo text |
| `typography.cardMeta` | Inter 12 lh 14.4 | Impression/Palate/Aroma 라벨 |
| `typography.cellarRowMeta` | Inter 11 lh 13.2 | ShareToggle sub (재사용 가능) |
| `typography.primaryButtonLg` | Inter 600 15 | Save pill |
| `gradients.expertBlind` | colors `[#5A1A24, #2D0D12]` start 0.5,0 end 0.5,1 (180deg) | BlindMode gradient — **keyscreen verbatim direction** |
| `expertBlindBg` | start `#5A1A24` end `#2D0D12` | LinearGradient 직접 사용 (현재 RN 이미 사용중) |

### 4-2. 신규 토큰 (§9 P0 — design-tokens.ts 확장 요청)

| 토큰 | 값 | 사용처 | 사유 |
|---|---|---|---|
| `typography.beginnerEyebrow` | Inter_500Medium 11 lh 11 letterSpacing 1.76 textTransform uppercase | BeginnerHeader eyebrow ("입문자 모드") | letter-spacing 0.16em → 1.76px. 기존 `homeEyebrow`는 ls 1.8 (값 다름) |
| `typography.beginnerGreeting` | Inter_400Regular 12 lh 18 | BeginnerHeader greeting (5-min message) | 1.5 ratio. 기존 `cardMeta`는 lh 14.4 (다름) |
| `typography.stepHeaderTitle` | Inter_600SemiBold 14 lh 16.8 | StepHeader title 텍스트 | 1.2 ratio. 기존 `cardSectionTitle`(Inter 600 14 lh 16.8) **재사용 가능** — 추가 불필요. **확정: 기존 재사용** |
| `typography.stepHeaderBadge` | Inter_700Bold 11 lh 13.2 | StepHeader number badge 안 텍스트 | 1.2 ratio. 기존 `tabCount`(Inter 700 10 lh 12) 와 fontSize 다름. 신규 |
| `typography.summaryEyebrow` | Inter_400Regular 11 lh 11 letterSpacing 1.1 textTransform uppercase | AutoSummaryCard eyebrow | ls 0.10em → 1.1px. 기존 `microLabel`(Inter 400 9 ls 0.36)과 fontSize 다름 |
| `typography.summaryText` | PlayfairDisplay_400Regular 13 lh 19.5 fontStyle italic | AutoSummaryCard 본문 (italic) | 1.5 ratio. 기존 `cardBody`는 Inter — fontFamily 다름 |
| `typography.shareToggleSub` | Inter_400Regular 11 lh 13.2 | ShareToCommunity sub 텍스트 | 1.2 ratio. 기존 `cellarRowMeta`(Inter 400 11 lh 13.2) **재사용 가능** — 추가 불필요. **확정: 기존 재사용** |
| `radius[12]` | 12 | (이미 `radius.xl`=12 동일) — 추가 불필요 |
| `radius[10]` | 10 | (이미 추가됨 — cellar-list에서) |

> **신규 typography 토큰 합계: 4개** (stepHeaderTitle / shareToggleSub은 기존 재사용, summaryEyebrow / beginnerEyebrow / beginnerGreeting / stepHeaderBadge / summaryText 5개 중 stepHeaderTitle 제외 = 4개). 추가로 `gradients.expertBlind` 사용처 표기 (이미 정의됨).

### 4-3. 사용 helper

- `withAlpha(hex, alpha)` — Eyebrow/AutoSummary/AromaCard active bg 계산
- `useThemeTokens()` — `scheme === 'light' ? light.* : dark.*` 분기

---

## 5. 상태 Variants

### 5-1. default — Beginner (wine 매칭, mode=beginner)

위 §2-2 트리. wine.name_ko or display_name 표시. WSET/Aroma/Finish/Rating/Memo 모두 default state (impression=smile, palate.* = mid, aromas=[], finish=medium, rating=3, memo='').

### 5-2. Expert (mode=expert)

위 §2-3 트리. BlindToggle off → BlindMode gradient 숨김. WSET 슬라이더 7개. Readiness drink default.

### 5-3. Blind enabled (Expert + blind=true)

BlindToggle on → LinearGradient(expertBlind) 노출 — Inter 13 cream center "블라인드 모드". 그 외 폼 동일 (wine 정보는 keyscreen에서 숨김 처리하지만 v0.1.0 RN은 keep display).

### 5-4. loading (wine fetch 중)

```
SafeAreaView
├── BackHeader (title only)
├── ScrollView
│     └── View flex-1 items-center justify-center py-8
│           └── ActivityIndicator color={brand.gold}
└── (no toast)
```

`wineLoading === true` 인 경우. useWine() hook이 처리.

### 5-5. submitting (save in progress)

- Save pill: `saving={true}` → `<ActivityIndicator color={brand.cream}/>` (텍스트 대체)
- 모든 input disabled (focus blur 시각 + opacity 0.7) — **§10 escalation E7**: 현재 RN은 disabled 미적용. 권장 추가.

### 5-6. validation error

- zod parse fail 시: Toast (tone=error) 노출 `t('notes.writeForm.validationFailed')` ("입력값을 확인해주세요" / "Please check the inputs")
- saveFailed: Toast (tone=error) `t('notes.writeForm.saveFailed')` ("노트 저장에 실패했어요" / "Failed to save note")
- wineLinkEmpty (wine_lwin null): Toast (tone=error) `t('notes.writeForm.wineLinkEmpty')` ("와인을 선택해주세요" / "Pick a wine first")
- 2.5초 자동 dismiss

### 5-7. dark / light

| 토큰 | dark | light | 사용 |
|---|---|---|---|
| `bg-deepest` | `#251837` | `#FAF5EC` | Screen outer |
| `bg-surface` | `#3D2A4A` | `#FFFFFF` | 모든 카드 |
| `bg-bottle-shelf` / `bg-deep` | `#1A0A1E` (dark) / `#F2EAD9` (light §9 D3) | | Memo + Price input bg |
| `border-default` | `#5A3D6A` | `#E0D2BC` | 카드/Input border idle |
| `text-primary` | `#F8F4ED` | `#2A1A14` | 모든 title |
| `text-secondary` | `#EBE0CB` | `#5A463C` | Producer / Palate idle |
| `text-muted` | `#CABDA8` | `#8B7766` | Greeting / ShareToggle sub |
| `text-disabled` | `#7E6E8E` | `#C0B0A0` | TextInput placeholder |
| `gold` | `#C9A84C` (fixed) | `#C9A84C` (fixed) | Eyebrow, active borders, SummaryCard, Save text disabled |
| `wine-red` | `#8B1A2A` (fixed) | `#8B1A2A` (fixed) | StepHeader badge bg (beginner), Palate active, Save pill bg |
| `cream` | `#F5F0E8` (fixed) | `#F5F0E8` (fixed) | Save text, Palate active text, badge text |
| expertBlind start/end | `#5A1A24 → #2D0D12` (fixed 양쪽 동일) | | BlindMode gradient — wine 분위기 일관성 |

### 5-8. wine === null (직접 입력)

- WineLinkCard fallback: capture CTA (이미 구현됨 — keep)
- BeginnerHeader WineName fallback: t('notes.writeForm.todaysGlass') ("오늘의 한 잔" / "Today's glass")
- Producer 라인: 빈 string (render skip)
- Save 버튼 disabled (`!wineLwin` opacity 0.5)

### 5-9. existing photo_url (capture → notes/new/write)

- WineLinkCard에 photo_url 사용 (기존 RN 로직 keep — render bottle img if present)
- submit payload에 `photo_url` 포함 → tasting_notes.photo_url 저장

---

## 6. 인터랙션

| 위치 | 액션 | 결과 |
|---|---|---|
| BackHeader < button | press | confirmDiscard 분기 (touched ? Alert : router.back()) + `Haptics.selectionAsync()` |
| SaveBtn (header right) | press | submit() — zod parse → supabase insert → `router.replace('/notes/{id}')` + `Haptics.notificationAsync(Success)` |
| Save pill (footer — keyscreen) | press | 동일 submit() — 현재 RN은 header만, footer pill 추가 권장 (keyscreen verbatim) §10 E8 |
| ModeToggle (beginner/expert) | press | onModeChange + `Haptics.selectionAsync()` + touched=true |
| Impression button | press | setImpression + `Haptics.selectionAsync()` + touched=true |
| Palate button (low/mid/high) | press | setPalate + `Haptics.selectionAsync()` + touched=true |
| AromaCard | press | aromas toggle (push/filter) + `Haptics.selectionAsync()` + touched=true |
| Finish button | press | setFinish + `Haptics.selectionAsync()` + touched=true |
| Star × 5 | press | setRating (half-step: i-0.5 left half, i right half) + `Haptics.selectionAsync()` + touched=true |
| Memo TextInput | change | setMemo + touched=true (no haptics) |
| WSETSlider dot 1~5 | press | onChange(n) + `Haptics.selectionAsync()` + touched=true |
| PriceCapture Switch | toggle | setPriceCapture (collapses input if off) + `Haptics.selectionAsync()` |
| Price NumberInput | change | setPrice + touched=true |
| ShareToggle Switch | toggle | setShareToCommunity + `Haptics.selectionAsync()` + touched=true |
| ReadinessPicker (expert) | press | setReadiness + `Haptics.selectionAsync()` |
| BlindToggle Switch (expert) | toggle | setBlind + `Haptics.selectionAsync()` (gradient 등장 transition 무시) |

**Press 시각 feedback** (모든 Pressable):
- `transform: [{ scale: pressed ? 0.98 : 1 }]` 인라인 style
- accessibilityRole="button" / "checkbox" / "radio" / "switch" / "adjustable"

**Haptics**:
- 모든 토글/체크 press: `Haptics.selectionAsync()` (가벼움)
- Save success: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`
- Save error: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`

**Keyboard**:
- `KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined}` (이미 구현)
- ScrollView `keyboardShouldPersistTaps="handled"` (이미 구현)
- 모든 TextInput `returnKeyType="done"` (Memo는 multiline 예외)

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | accessibilityHint | accessibilityState |
|---|---|---|---|---|
| BackHeader button | "button" | t('common.back') | t('notes.writeForm.discardHint') ("작성 중인 내용 폐기" — touched 시) | — |
| SaveBtn (header right) | "button" | t('notes.writeForm.save') | t('notes.writeForm.saveHint') ("노트 저장" / "Save note") 신규 | `{disabled: !wineLwin, busy: saving}` |
| Save pill (footer) | "button" | t('notes.writeForm.save') | (동일) | (동일) |
| ModeToggle Beginner | "tab" | t('notes.writeForm.modeBeginner') | — | `{selected: mode==='beginner'}` |
| ModeToggle Expert | "tab" | t('notes.writeForm.modeExpert') | — | `{selected: mode==='expert'}` |
| Impression button × 3 | "radio" | `${optLabel}` (i.e. "와! 최고!") | t('notes.writeForm.beginnerStep.impressionHint') 신규 | `{selected: active}` |
| Palate triad button × N×3 | "radio" | `${dim} ${level}` (e.g. "단맛 낮음" / "Sweetness Low") | — | `{selected: active}` |
| AromaCard × 8 | "checkbox" | `${aromaLabel}` (e.g. "베리" / "Berry") | — | `{checked: active}` |
| Finish triad × 3 | "radio" | `${finish}` (e.g. "짧음" / "Short") | — | `{selected: active}` |
| StarRating Stars (10 Pressable: half + full × 5) | "button" | `${rating} ${t('notes.rating')}` (e.g. "3.5 별점") | — | — |
| Memo TextInput | "none" (TextInput default) | t('notes.writeForm.commentLabel') ("코멘트") | t('notes.writeForm.commentPlaceholder') | — |
| WSETSlider dot 1~5 | "adjustable" | `${dimLabel} ${value}` | — | `accessibilityValue={{min, max, now: value}}` |
| PriceCapture Switch | "switch" | t('notes.writeForm.priceCaptureLabel') | — | `{checked: on}` |
| Price NumberInput | "none" | t('notes.writeForm.pricePlaceholder') | — | — |
| ShareToggle Switch | "switch" | t('notes.writeForm.shareLabel') | t('notes.writeForm.shareSub') | `{checked: on}` |
| BlindToggle Switch (expert) | "switch" | t('notes.writeForm.blindMode') | t('notes.writeForm.blindHint') 신규 | `{checked: on}` |
| ReadinessPicker × 3 (expert) | "radio" | optionLabel | — | `{selected: active}` |

**Focus 순서** (TalkBack/VoiceOver):
- BackButton → SaveBtn → WineLinkCard → ModeToggle Beginner → ModeToggle Expert
- (Beginner) → BeginnerHeader (eyebrow/name/producer/greeting) → Step1 header → Imp1/2/3 → Step2 → Palate dims (sweetness sub L/M/H, ...) → Step3 → Aroma 1~8 → Step4 → Finish 1/2/3 → Step5 → Star 1~5 → Step6 → Memo → AutoSummary (auto) → PriceCapture Switch → ShareToggle → Save pill
- (Expert) → BlindToggle → RatingCard → Appearance Section → Nose → Palate → Conclusions → Date

**Touch target**: 모든 Pressable 최소 44×44pt (iOS HIG).
- Impression: 100×100pt (flex 1 of 3 cols, padding 14_8) — OK
- Palate triad: ~40×60pt (flex 1 of 3, padding 8) — hitSlop 6 추가 권장 (keyscreen은 무) **§10 deviation D5**
- AromaCard: ~80×60pt (4 cols, padding 10_4) — OK
- Stars: 28pt + hitSlop 6 → OK
- WSET dots: 26×26 + hitSlop 8 (현재 RN) — OK

**대비**: 모든 텍스트 WCAG AA 4.5:1 (text-primary on bg-surface 양쪽 모드). gold on surface 양쪽 모드도 검증 (light에서 gold #C9A84C on white 약 4.5:1 경계 — design-reviewer 확인).

---

## 8. i18n 키 (ko/en)

### 8-1. 기존 키 (재사용)

```json
"notes.write": { "ko": "노트 작성", "en": "Write note" }
"notes.rating": { "ko": "별점", "en": "Rating" }
"notes.tastedAt": { "ko": "시음 일자", "en": "Tasted on" }
"notes.writeForm.save": { "ko": "저장", "en": "Save" }
"notes.writeForm.wineLinkEmpty": { "ko": "와인을 선택해주세요", "en": "Pick a wine first" }
"notes.writeForm.wineLinkCaptureCta": { "ko": "라벨 촬영으로 시작하기", "en": "Start with a label photo" }
"notes.writeForm.modeBeginner": { "ko": "입문자", "en": "Beginner" }
"notes.writeForm.modeExpert": { "ko": "전문가", "en": "Expert" }
"notes.writeForm.commentLabel": { "ko": "코멘트", "en": "Comment" }
"notes.writeForm.commentPlaceholder": { "ko": "느낀 점을 자유롭게 적어보세요", "en": "Write freely what you felt" }
"notes.writeForm.saveSuccess": { "ko": "노트를 저장했어요", "en": "Note saved" }
"notes.writeForm.saveFailed": { "ko": "노트 저장에 실패했어요. 다시 시도해주세요.", "en": "Failed to save note. Try again." }
"notes.writeForm.validationFailed": { "ko": "입력값을 확인해주세요", "en": "Please check the inputs" }
"notes.writeForm.unsavedTitle": { "ko": "저장하지 않은 변경사항이 있어요", "en": "Unsaved changes" }
"notes.writeForm.unsavedDesc": { "ko": "지금 나가면 작성 중인 내용이 사라집니다.", "en": "If you leave now, your draft will be lost." }
"notes.writeForm.unsavedDiscard": { "ko": "폐기하고 나가기", "en": "Discard and leave" }
"notes.writeForm.unsavedCancel": { "ko": "계속 작성", "en": "Keep writing" }
"notes.writeForm.blindMode": { "ko": "블라인드 모드", "en": "Blind mode" }
"notes.beginner.wsetSweetness/wsetAcidity/wsetTannin/wsetBody": ko/en
"notes.beginner.wsetShort.{low|mediumMinus|medium|mediumPlus|high}": ko/en
"notes.beginner.aromaTitle": { "ko": "느낀 향", "en": "Aroma" }
"notes.beginner.aromaTags.{fruit|floral|spice|wood|earth|citrus|berry|vanilla|tobacco|chocolate|leather|mineral}": ko/en
"notes.expert.section{Appearance|Nose|Palate|Conclusions}": ko/en
"notes.expert.{appearance|nose|palate|conclusions}*": ko/en (이미 존재)
"common.back": { "ko": "뒤로", "en": "Back" }
```

### 8-2. 신규 키 (keyscreen verbatim 추가)

```json
"notes.writeForm.modeBeginnerEyebrow": {
  "ko": "입문자 모드",
  "en": "Beginner mode"
}
"notes.writeForm.todaysGlass": {
  "ko": "오늘의 한 잔",
  "en": "Today's glass"
}
"notes.writeForm.beginnerGreeting": {
  "ko": "와인 한 잔, 5분이면 끝나는 짧은 기록. 어려운 용어는 잠시 잊고 느낀대로 적어보세요.",
  "en": "A 5-minute record of your wine. Forget the jargon — just write what you feel."
}
"notes.writeForm.beginnerStep.impression": {
  "ko": "첫 모금, 어땠어요?",
  "en": "First sip — how was it?"
}
"notes.writeForm.beginnerStep.impressionStar": {
  "ko": "와! 최고!",
  "en": "Wow!"
}
"notes.writeForm.beginnerStep.impressionSmile": {
  "ko": "괜찮아요",
  "en": "Nice"
}
"notes.writeForm.beginnerStep.impressionThinking": {
  "ko": "음... 글쎄",
  "en": "Hmm..."
}
"notes.writeForm.beginnerStep.impressionHint": {
  "ko": "첫 인상 선택",
  "en": "Pick first impression"
}
"notes.writeForm.beginnerStep.palate": {
  "ko": "맛의 균형",
  "en": "Balance"
}
"notes.writeForm.beginnerStep.aroma": {
  "ko": "어떤 향이 떠올라요?",
  "en": "What aromas come to mind?"
}
"notes.writeForm.beginnerStep.finish": {
  "ko": "여운은 얼마나?",
  "en": "How long does it linger?"
}
"notes.writeForm.beginnerStep.memo": {
  "ko": "한 줄 메모",
  "en": "A line about this wine"
}
"notes.writeForm.beginnerMemoPlaceholder": {
  "ko": "예: 새 친구가 추천해준 와인. 첫 잔이 따뜻하게 느껴졌다.",
  "en": "e.g. A friend recommended it. First sip felt warm."
}
"notes.writeForm.beginnerSummaryEyebrow": {
  "ko": "오늘의 한 잔",
  "en": "Today's glass"
}
"notes.writeForm.priceCaptureLabel": {
  "ko": "가격 입력 (+5 XP)",
  "en": "Add price (+5 XP)"
}
"notes.writeForm.pricePlaceholder": {
  "ko": "가격 (KRW)",
  "en": "Price (KRW)"
}
"notes.writeForm.shareLabel": {
  "ko": "커뮤니티에 공유",
  "en": "Share to community"
}
"notes.writeForm.shareSub": {
  "ko": "커뮤니티의 시음 노트 탭에서 이 노트가 보여요.",
  "en": "Others can see this note on the community Notes tab."
}
"notes.writeForm.saveHint": {
  "ko": "노트 저장",
  "en": "Save note"
}
"notes.writeForm.blindHint": {
  "ko": "와인 정보를 가리고 블라인드 시음",
  "en": "Hide wine info for blind tasting"
}
"notes.writeForm.discardHint": {
  "ko": "작성 중인 내용 폐기",
  "en": "Discard draft"
}

"notes.beginner.palateDim.sweetness": { "ko": "단맛", "en": "Sweetness" }
"notes.beginner.palateDim.acidity": { "ko": "신맛", "en": "Acidity" }
"notes.beginner.palateDim.body": { "ko": "무게감 (바디)", "en": "Body" }
"notes.beginner.palateDim.tannin": { "ko": "떫은맛 (타닌)", "en": "Tannin" }
"notes.beginner.palateDim.bubble": { "ko": "기포", "en": "Bubbles" }
"notes.beginner.palateLevel.low": { "ko": "낮음", "en": "Low" }
"notes.beginner.palateLevel.mid": { "ko": "중간", "en": "Mid" }
"notes.beginner.palateLevel.high": { "ko": "높음", "en": "High" }
"notes.beginner.finishLevel.short": { "ko": "짧음", "en": "Short" }
"notes.beginner.finishLevel.medium": { "ko": "중간", "en": "Medium" }
"notes.beginner.finishLevel.long": { "ko": "긴", "en": "Long" }

"notes.beginner.aromaCard.berry": { "ko": "베리", "en": "Berry" }
"notes.beginner.aromaCard.citrus": { "ko": "시트러스", "en": "Citrus" }
"notes.beginner.aromaCard.stoneFruit": { "ko": "복숭아·살구", "en": "Stone fruit" }
"notes.beginner.aromaCard.floral": { "ko": "꽃", "en": "Floral" }
"notes.beginner.aromaCard.spice": { "ko": "향신료", "en": "Spice" }
"notes.beginner.aromaCard.sweet": { "ko": "꿀·캐러멜", "en": "Honey/Caramel" }
"notes.beginner.aromaCard.earth": { "ko": "흙·허브", "en": "Earth/Herb" }
"notes.beginner.aromaCard.yeast": { "ko": "빵·이스트", "en": "Bread/Yeast" }
```

> **합계: 신규 키 약 38개** (writeForm.* 20개 + beginner.palateDim/palateLevel/finishLevel/aromaCard.* 18개). 기존 aroma tags (fruit/floral/spice/wood/earth/citrus/berry/vanilla/tobacco/chocolate/leather/mineral 12개)는 BeginnerForm에서 사용 중인 `AromaChips` 컴포넌트의 8 ↔ 12 매핑 차이 — keyscreen은 8 카드. §10 escalation E9.

### 8-3. 수정 후보 (사양 변경에 의한)

- `notes.write` 값: 현재 "노트 작성" / "Write note" → keyscreen "테이스팅 노트" / "Tasting note" 권장 (§10 E2)
- 현재 RN AromaChips 12 태그 ↔ keyscreen 8 카드: §10 escalation E9 결정 후 i18n 매핑 정리

---

## 9. RN deviation (사유 명시)

| # | 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|---|
| D1 | `display: grid grid-template-columns repeat(4, 1fr) gap 6` (AromaGrid) | `<View className="flex-row flex-wrap" style={{rowGap:6,columnGap:6}}>` + 카드 `width:'23.5%'` | RN grid 미지원. flex-wrap으로 대체. design-reviewer 시각 검증 (4 카드/row × 2 row = 8) |
| D2 | StarRating: full-star only (1~5) | RN: half-step (1~5, 0.5 단위) — 현재 RN 이미 구현 | DB schema `tasting_notes.rating CHECK multipleOf 0.5` 적용됨 (Day 5 마이그레이션). keyscreen보다 정밀도 향상. **keep** |
| D3 | Memo TextInput bg `#1A0A1E` (양쪽 모드 동일 — `--color-map-dark`) | dark: `dark.bg.bottleShelf` (#1A0A1E), light: `light.bg.deep` (#F2EAD9) | light 모드에서 #1A0A1E는 너무 어두워 cream text와 대비 과함 (긴 텍스트 가독성 저하). light는 light.bg.deep로 분기 권장 |
| D4 | BlindMode gradient 180deg (위→아래) — `expertBlindBg.{start,end}` | 현재 RN: `LinearGradient start={{x:0,y:0}} end={{x:1,y:1}}` (135deg 대각) | 키스크린은 180deg verbatim. `gradients.expertBlind` (start 0.5,0 end 0.5,1) 사용 권장. **rn-screen-builder 수정** |
| D5 | Palate triad 버튼: 작은 hit area (~40×60pt) | RN: hitSlop 6 추가 권장 | 키스크린은 cursor pointer만, RN은 모바일 touch — hitSlop 표준 |
| D6 | `cursor: pointer` / `cursor: not-allowed` | RN cursor 없음 — Pressable disabled state로 대체 | RN 표준 |
| D7 | `accentColor: gold` (Switch HTML input) | RN Switch: `trackColor={{true:gold, false:textDisabled}} thumbColor={cream}` | RN Switch API 차이 |
| D8 | `<textarea resize: vertical>` (Memo) | RN TextInput multiline numberOfLines={3} + `style={{minHeight:80, textAlignVertical:'top'}}` | RN resize 없음 — minHeight + multiline |
| D9 | `var(--font-playfair)` (italic style) | RN: `fontFamily: 'PlayfairDisplay_400Regular_Italic'` (별도 font load 필요) **또는** `fontFamily: 'PlayfairDisplay_400Regular' + fontStyle: 'italic'` | iOS는 italic style 자동, Android는 별도 italic font load 권장 — `summaryText` 토큰에 fontStyle:'italic' 명시 |
| D10 | `setTimeout(() => router.back(), 1000)` (Save 후 1초 delay) | 현재 RN: 즉시 `router.replace('/notes/{id}')` (delay 없음) | UX 차이 — 현재 RN은 detail로 곧장 이동 (keyscreen은 toast 보여주고 back). **keep 현재 RN** (toast 노출 짧음 + 상세 화면이 더 자연스러움) |
| D11 | `<button style cursor:pointer>` HTML 기본 (border 0 bg transparent) | RN Pressable + `<Text>` 조합 | RN 표준 |
| D12 | `border-collapse` / `box-sizing border-box` | RN default | RN 표준 |
| D13 | keyscreen `XP_ACTIONS` toast 시스템 | 현재 RN: XP 시스템 없음 (v0.2.0 SCOPE-OUT) | Plan D §4-8 (TS code 작게). v0.1.0은 Toast `saveSuccess` 만 |
| D14 | DynamicTemplateForm (custom template) | v0.1.0 SCOPE-OUT | Plan D §4-8 |
| D15 | keyscreen ServingTempInput / PeakEtaInput / CaudalieMeter / FaultChecklist / OpeningTimeline / AromaWheel / BubblePanel / TanninPanel / RegionalAromaHints | v0.1.0 모두 SCOPE-OUT (Expert form 5 section만) | Plan D §4-8 |
| D16 | localStorage 영속화 (`addTastingNote` context) | RN: 직접 `supabase.from('tasting_notes').insert(payload)` | Full Supabase Plan D — DB 진실 소스 |

---

## 10. 미해결 질문 / Escalation (리더 판단 필요)

| # | 질문 | 권장안 |
|---|---|---|
| E1 | `templateId` query 처리 — keyscreen은 `?templateId=builtin-expert` 진입 시 ExpertForm 강제. 현재 RN write.tsx는 query 무시 (mode state로 자체 결정). | **추가**: write.tsx `useLocalSearchParams` 확장. `templateId` query 받으면 `setMode('expert' if BUILTIN_EXPERT_ID else 'beginner')` 초기화. 이후 ModeToggle로 사용자 변경 가능 (현재 RN flexibility 유지). `from=cellar&itemId=` query → `source=cellar` mapping. `wineId` → `wine_lwin` mapping (현재 RN은 wine_lwin 사용 중 유지) |
| E2 | `notes.write` 값 ("노트 작성" → "테이스팅 노트") | **변경**: keyscreen verbatim. BackHeader title 한국어 자연스러움 향상 |
| E3 | Expert form 구조 — 키스크린 7-step verbatim (Capture/Aroma/Palate/Finish/Faults/Evolution/Peak ETA & Rating) vs 현재 RN 5-section (Blind/Rating/Appearance/Nose/Palate/Conclusions) | **keep 현재 RN 5-section** (Plan D §4-8 TS code 작게). 7-step의 Faults/Evolution/Peak ETA/Caudalie/Aroma Wheel은 v0.2.0 SCOPE-OUT. expertField zod schema는 현재 RN 그대로 유지 |
| E4 | VariantTabs (white/red/sparkling/blind) 추가 여부 | **SCOPE-OUT v0.1.0**. wine.type_canonical로 자동 결정 + Blind는 Switch로 (현재 RN). v0.2.0 검토 |
| E5 | WSETSlider 5-stage `WSETScale` enum (low/mediumMinus/medium/mediumPlus/high) vs 1~5 number | **keep 1~5 number** (현재 RN). DB tasting_notes.beginner_fields/expert_fields jsonb 가 number 사용 — schema 변경 비용 큼. label은 `notes.beginner.wsetShort.*` i18n 매핑 (이미 존재) |
| E6 | BeginnerForm 6-step verbatim 채택 (현재 RN은 WSET 4 dim 슬라이더 + AromaChips 12 + comments) vs 키스크린 (Impression/Palate(triad)/Aroma(card 8)/Finish/Star/Memo) | **재작성 권장 (verbatim)**. 시각 게이트 통과 + UX 차이 큼. BeginnerForm 컴포넌트 보존하되 내부 구조 교체. zod schema는 keyscreen 구조에 맞춰 변경 (BeginnerFields.impression / palate.{sweetness,acidity,body,tannin,bubble} / aromas[] / finish / rating / memo). DB beginner_fields jsonb는 자유 schema라 변경 가능. **Day 6 핵심 retroactive 작업** |
| E7 | submitting 중 input disabled 여부 | **추가**: saving=true 시 모든 input pointerEvents='none' + opacity 0.7. 더블 submit 방지 |
| E8 | Save 버튼 위치 — keyscreen은 폼 footer pill. 현재 RN은 header right. | **둘 다 유지**: header SaveBtn은 keep + 폼 footer pill 추가. 긴 폼에서는 footer pill이 발견 쉬움 (UX). 둘 다 동일 submit() 호출 |
| E9 | AromaChips 12 태그 (fruit/floral/spice/wood/earth/citrus/berry/vanilla/tobacco/chocolate/leather/mineral) vs keyscreen 8 카드 (berry/citrus/stoneFruit/floral/spice/sweet/earth/yeast) | **keyscreen 8 카드로 변경** (verbatim). i18n `notes.beginner.aromaCard.*` 신규 (위 §8-2). 기존 `aromaTags.*` 12개는 detail 화면이 사용 중 → both keep (write는 8, detail 표시는 12 superset). DB beginner_fields.aromas jsonb 자유 schema |
| E10 | tasting_notes 저장 schema — beginner_fields/expert_fields 구조 변경 (E6 채택 시) | **변경**: BeginnerFields = `{ impression: 'star' | 'smile' | 'thinking', palate: {sweetness,acidity,body,tannin?,bubble?: 'low'|'mid'|'high'}, aromas: string[], finish: 'short'|'medium'|'long', memo: string }`. ExpertFields는 현재 RN keep. RLS 정책 변경 불필요 (jsonb shape는 client). zod schema는 write.tsx에서 변경. detail 화면 표시 로직(`note-body-beginner.tsx`)도 동시 수정 필요. **supabase-engineer 영역 아님 (jsonb 자유)** |
| E11 | photo_url 처리 — keyscreen photoAttached toggle + 5XP / 현재 RN photo_url query forward | **keep 현재 RN**. capture → notes/new/write `?photo_url=` query forward (이미 구현). PhotoToggle 카드는 SCOPE-OUT (v0.2.0) |
| E12 | XP 시스템 (calcNoteXp +10 beginner, +20 expert, +25 expertBlind, +5 priceAdd) | **SCOPE-OUT v0.1.0** (Plan D §4-8). Save 후 단순 Toast `saveSuccess` 만 |
| E13 | PriceCapture + ShareToCommunity 토글 — keyscreen has both. 현재 RN none. | **추가**: 두 토글 카드 추가. PriceCapture는 폼 내부 state만 (DB schema 변경 없이 expertFields.conclusions.estimated_price_krw 활용 또는 beginnerFields jsonb 확장). ShareToCommunity는 tasting_notes.is_public 컬럼 (Day 1 마이그레이션에 포함 검증 필요). **§14 supabase-engineer 영역 — schema 확인** |
| E14 | AutoSummaryCard (summarize 함수 결과 표시) | **추가**: 클라이언트 계산 함수 `summarizeBeginner({impression, palate, aromas, finish, rating, locale})` → ko/en string. Playfair italic 카드. 입력값 변경 시 useMemo로 재계산 |
| E15 | confirmDiscard Alert (touched 시) | **keep 현재 RN**. Alert.alert(...). keyscreen은 미구현 (시안 한계). 우리 RN enhancement |
| E16 | tasting_notes `is_public` 컬럼 | **확인 필요**: 현재 RN 마이그레이션에 `is_public boolean default false` 포함 여부 (supabase-engineer 영역). 없으면 추가 마이그레이션 + RLS 정책 확장 (`select` 시 `auth.uid() = user_id OR is_public = true`) |
| E17 | StepHeader number badge 디자인 — beginner는 wineRed bg cream text, expert는 gold bg deepestDark text | **두 컴포넌트 분리** (`<StepHeaderBeginner>` `<StepHeaderExpert>`) 또는 prop `variant: 'beginner' | 'expert'`로 통합. **권장: prop variant 통합** |

---

## 11. 데이터 의존 항목 — tasting_notes 저장 schema + BUILTIN mapping

### 11-1. v0.1.0 tasting_notes Insert payload (현재 RN schema)

```ts
const payload: Database['public']['Tables']['tasting_notes']['Insert'] = {
  user_id: uid,                           // from supabase.auth.getUser()
  wine_lwin: parsed.data.wine_lwin,       // LWIN 7|11|13
  mode: parsed.data.mode,                 // 'beginner' | 'expert'
  tasted_at: parsed.data.tasted_at,       // YYYY-MM-DD
  rating: parsed.data.rating ?? null,     // 0~5, 0.5 step (CHECK constraint)
  source: parsed.data.source ?? null,     // enum: cellar/restaurant/shop/gift/tasting_event/other
  beginner_fields: parsed.data.beginner_fields ?? null,  // jsonb
  expert_fields: parsed.data.expert_fields ?? null,      // jsonb
  photo_url: parsed.data.photo_url ?? null,              // text (Storage path)
  // 신규 (§10 E13):
  is_public: shareToCommunity,                            // boolean default false — 마이그레이션 확인
};
```

### 11-2. beginner_fields jsonb shape (E6 verbatim 채택 시)

```ts
type BeginnerFields = {
  impression: 'star' | 'smile' | 'thinking';
  palate: {
    sweetness: 'low' | 'mid' | 'high';
    acidity: 'low' | 'mid' | 'high';
    body: 'low' | 'mid' | 'high';
    tannin?: 'low' | 'mid' | 'high';  // variant === 'red'
    bubble?: 'low' | 'mid' | 'high';  // variant === 'sparkling'
  };
  aromas: ('berry' | 'citrus' | 'stoneFruit' | 'floral' | 'spice' | 'sweet' | 'earth' | 'yeast')[];
  finish: 'short' | 'medium' | 'long';
  memo: string;
  priceCapture?: { enabled: boolean; krw: number | null };  // §10 E13
};
```

### 11-3. expert_fields jsonb shape (현재 RN keep)

```ts
type ExpertFields = {
  appearance: { intensity: 1|2|3|4|5; clarity: 1|2|3; notes: string };
  nose:       { intensity: 1|2|3|4|5; development: 1|2|3; aromas: string };
  palate:     { sweetness, acidity, tannin, alcohol, body, flavor, finish: 1|2|3|4|5 };
  conclusions:{ quality: 1|2|3|4|5; readiness: 'tooYoung'|'drink'|'pastPeak'; estimated_price_krw: number | null };
  blind: boolean;
};
```

### 11-4. BUILTIN template → form mode mapping

| URL query `templateId` | mode 초기값 | form 선택 |
|---|---|---|
| `BUILTIN_BEGINNER_ID` ('builtin-beginner') | `'beginner'` | BeginnerForm |
| `BUILTIN_EXPERT_ID` ('builtin-expert') | `'expert'` | ExpertForm |
| undefined | profile.experience ?? 'beginner' | (그에 따른 form) |
| custom ID (v0.2.0) | — | DynamicTemplateForm (SCOPE-OUT) |

> `templateId`는 v0.1.0 client-side UI state 전용. `tasting_notes` 테이블에 `template_id` 컬럼 없음 (v0.2.0에 추가 예정 — `src/lib/notes/builtin-templates.ts` 주석 참조).

### 11-5. source mapping

UI `source` query (cellar/restaurant/shop/gift/tasting_event/other) → DB `tasting_notes.source` (enum 동일) — 1:1. keyscreen `from=cellar/newEntry/draft`는 v0.2.0 schema 변경 필요 (§10 E1).

### 11-6. Source 진입 query (현재 RN)

```ts
const params = useLocalSearchParams<{
  wine_lwin?: string;            // LWIN 7|11|13
  source?: 'cellar' | 'restaurant' | 'shop' | 'gift' | 'tasting_event' | 'other';
  photo_url?: string;            // Storage path
  // §10 E1 추가 권장:
  templateId?: 'builtin-beginner' | 'builtin-expert';
}>();
```

---

## 12. 사양 §escalation — write.tsx 연동(templateId/from query) 처리 방안

### 12-1. 현재 RN 구조 (Day 5 구현)

- `write.tsx`는 `useLocalSearchParams`로 `wine_lwin / source / photo_url` 3개 받음
- `mode` state는 ModeToggle UI로 변경 가능 (초기값: profile.experience)
- 진입 source 표시: 단순 `source` query → DB `tasting_notes.source` 저장

### 12-2. 키스크린 query 처리 (verbatim)

- `from` (cellar/newEntry/draft) — Stage 분기 + cellarItemId 결정
- `itemId` — cellar_items.id (cellar 모드 시)
- `wineId` — keyscreen mock wineId (우리 LWIN과 다름)
- `templateId` — builtin-beginner / builtin-expert / custom-id → form 선택

### 12-3. 권장 통합 방안 (v0.1.0)

```ts
// write.tsx — 진입 query 확장
const params = useLocalSearchParams<{
  // keep 현재 RN
  wine_lwin?: string;
  source?: Source;
  photo_url?: string;
  // 신규 (keyscreen 호환 v0.1.0)
  templateId?: 'builtin-beginner' | 'builtin-expert';
  // 신규 (keyscreen 진입 query — DB는 source로 mapping)
  from?: 'cellar' | 'newEntry' | 'draft';
  itemId?: string;  // cellar_items.id (from=cellar 시)
}>();

// 초기 mode 결정 (mount 시점만)
useEffect(() => {
  if (profileLoading) return;
  if (params.templateId === 'builtin-expert') setMode('expert');
  else if (params.templateId === 'builtin-beginner') setMode('beginner');
  else if (profile?.experience === 'expert') setMode('expert');
  else setMode('beginner');
}, [params.templateId, profile?.experience, profileLoading]);

// from → source mapping
const effectiveSource: Source | null = useMemo(() => {
  if (params.source) return params.source;
  if (params.from === 'cellar') return 'cellar';
  if (params.from === 'newEntry') return 'other';
  return null;
}, [params.source, params.from]);

// cellar_item id (from=cellar 시) — supabase fetch
const { data: cellarItem } = useCellarItem(params.itemId);
const effectiveWineLwin = wineLwin ?? cellarItem?.wine_lwin ?? null;
```

### 12-4. notes/new (Stage 2 SourcePicker) 의 query forward

- CellarRow press → `router.push('/notes/new/write?from=cellar&itemId={cellar_item.id}&templateId={tid}&wine_lwin={wine.lwin}')`
  - `itemId`와 `wine_lwin` 둘 다 forward (write.tsx에서 둘 중 하나 사용 가능)
- NewWineCard press → `router.push('/notes/new/write?from=newEntry&templateId={tid}')` (wine_lwin 없음)
  - capture flow로 들어온 경우: `+ &wine_lwin={params.wine_lwin}&photo_url={params.photo_url}`

### 12-5. 결정 사항

- **Day 6 변경 범위**: write.tsx `useLocalSearchParams` 확장 + 초기 mode useEffect 분기 추가
- **Day 6 미변경**: tasting_notes schema (source enum 6값 keep), DB `template_id` 컬럼 없음 (UI state only)
- **v0.2.0 마이그레이션**: `tasting_notes.template_id text` 컬럼 추가, source enum 축소 (cellar/new_entry)

---

## 13. 라우팅 (다음 화면)

| 진입 → 현재 화면 | 라우팅 (write.tsx) |
|---|---|
| `/notes/new` Stage 2 NewWineCard press | `/notes/new/write?from=newEntry&templateId={tid}` |
| `/notes/new` Stage 3 CellarRow press | `/notes/new/write?from=cellar&itemId={id}&templateId={tid}&wine_lwin={lwin}` |
| `/capture` 라벨 결과 "노트 작성" | `/notes/new/write?from=newEntry&wine_lwin={lwin}&photo_url={path}` (현재 RN — keep) |
| `/cellar/[lwin]` "Drink this" | `/notes/new/write?from=cellar&wine_lwin={lwin}&itemId={item.id}` |
| `/wine/[lwin]` WriteNoteCta | `/notes/new/write?wine_lwin={lwin}&from=newEntry` |
| 홈 DraftNoteResume | `/notes/new/write?from=draft&wine_lwin={lwin}&templateId={tid}` (v0.2.0 SCOPE-OUT) |

| 현재 화면 → 다음 | 라우팅 |
|---|---|
| Save 성공 | `router.replace('/notes/{id}')` (Toast saveSuccess 잠깐 + 즉시 이동 — 현재 RN keep) |
| Back press (touched 없음) | `router.back()` |
| Back press (touched) | Alert → "폐기하고 나가기" → `router.back()` / "계속 작성" → 닫기 |
| 진입 가드 fail (auth lost) | `router.replace('/onboarding/welcome')` (qa-inspector 영역) |

---

## 14. 현재 구현 차이 (retroactive)

기존 코드: `app/notes/new/write.tsx` (341 LOC) + `src/components/notes/{beginner-form, expert-form, wset-slider, aroma-chips, star-rating, mode-toggle, wine-link-card}.tsx`

| 항목 | 키스크린 원본 | 현재 구현 | 수정 필요 |
|---|---|---|---|
| **BeginnerForm 구조** | 6 Step (Impression/Palate triad/Aroma card 8/Finish triad/Star/Memo) + AutoSummary + PriceCapture + Share + Save pill | WSET dot 슬라이더 4 dim + AromaChips 12 + Memo | **재작성** — keyscreen verbatim Step 흐름 (큰 폭). zod schema 변경 (BeginnerFields shape) |
| **BeginnerHeader (eyebrow + WineName + Producer + Greeting)** | 폼 상단 항상 있음 | 없음 (WineLinkCard로 대체) | **추가** — eyebrow `notes.writeForm.modeBeginnerEyebrow` + WineNameDisplay + Greeting |
| **StepHeader 컴포넌트** | NumberBadge (22×22 wineRed/gold) + Title (Inter 14 600) | 카드 안 단순 라벨 (Inter 12 muted uppercase) | **신규 컴포넌트** `src/components/notes/step-header.tsx` |
| **ImpressionTriad** | Sparkles/Smile/HelpCircle 3-button | 없음 | **신규** |
| **Palate triad (low/mid/high)** | 단/산/바디/타닌/기포 5 dim × 3 button | WSETSlider 1~5 dot 4 dim | **재작성** — triad 컴포넌트 신규 |
| **AromaGrid 4×2 카드** | 8 카드 (berry/citrus/stoneFruit/floral/spice/sweet/earth/yeast) | AromaChips 12 chip (fruit/floral/spice/wood/earth/citrus/berry/vanilla/tobacco/chocolate/leather/mineral) | **재작성** — 8 카드 그리드 + i18n `aromaCard.*` 신규 |
| **FinishTriad** | short/medium/long 3-button | 없음 (Expert에만 있음 — palate.finish) | **신규** |
| **StarRating** | Star 5 full only | Star + StarHalf 10 Pressable (half-step 정밀) | **keep RN** (DB 0.5 step 지원) — D2 |
| **Memo textarea** | bg map-dark 양쪽 모드 | bg-deep | **유지**, light 모드 분기 권장 (D3) |
| **AutoSummaryCard** | Playfair italic 13 cream lh 1.5, gold tint bg/border, summarize() 함수 결과 | 없음 | **신규** |
| **PriceCapture 카드** | Switch + NumberInput (collapsed if off) | 없음 (Expert form에 estimated_price_krw 있지만 UI 다름) | **신규** (BeginnerForm + ExpertForm 공통) |
| **ShareToCommunity 카드** | Switch + label + sub | 없음 | **신규** — DB `tasting_notes.is_public` 컬럼 확인 (§10 E16) |
| **Save pill (footer)** | wineRed pill (padding 14_16 radius 999 Inter 15 600) | header right SaveBtn만 | **추가 footer pill** (§10 E8) — header SaveBtn은 keep |
| **ExpertForm 7-step** | Capture/Aroma/Palate/Finish/Faults/Evolution/Peak ETA & Rating | 5 section (Blind/Rating/Appearance/Nose/Palate/Conclusions) | **keep 5 section** (§10 E3 SCOPE-OUT v0.2.0) |
| **BlindMode gradient direction** | 180deg (위→아래) — expertBlindBg start→end | 135deg (대각) — start{0,0} end{1,1} | **수정** — `gradients.expertBlind` 사용 (D4) |
| **VariantTabs (white/red/sparkling/blind)** | Expert 상단 4-tab | 없음 (BlindToggle Switch만) | **유지** SCOPE-OUT (§10 E4) |
| **WSETSlider 5-stage WSETScale enum** | low/mediumMinus/medium/mediumPlus/high | 1~5 number | **keep number** (§10 E5) |
| **templateId / from / itemId query** | 진입 query에서 form 결정 | wine_lwin / source / photo_url만 | **확장** — templateId/from/itemId 추가 (§12 통합 방안) |
| **confirmDiscard Alert** | 미구현 | Alert.alert (touched 시) | **keep** (RN enhancement) |
| **submitting 시 input disabled** | (해당 없음 — 키스크린은 mock) | 미구현 | **추가** (§10 E7) |
| **XP toast (+10/+20/+25/+5)** | calcNoteXp + toast | 없음 | **유지 SCOPE-OUT v0.2.0** (§10 E12) |
| **localStorage 영속화** | useUserData.addTastingNote | 없음 (Supabase 직접 insert) | **keep RN** (Plan D) — D16 |

> **수정 폭 큼**: BeginnerForm 재작성 + AutoSummaryCard 신규 + PriceCapture/ShareToggle 신규 + StepHeader 신규 + ImpressionTriad/PalateTriad/AromaGrid/FinishTriad 신규 + Save pill footer. zod schema 변경 (BeginnerFields jsonb shape).

**Day 6 retroactive 권장 marshall plan**:
1. **Sub-task A**: BeginnerForm 재작성 — keyscreen 6 Step verbatim (가장 큰 변경)
2. **Sub-task B**: AutoSummaryCard + summarize() 함수 신규 (`src/lib/notes/summarize.ts`)
3. **Sub-task C**: PriceCapture + ShareToCommunity 카드 신규 (공통 컴포넌트 `src/components/notes/{price-capture,share-toggle}.tsx`)
4. **Sub-task D**: StepHeader 컴포넌트 신규 (variant: beginner/expert)
5. **Sub-task E**: write.tsx query 처리 확장 (templateId / from / itemId)
6. **Sub-task F**: zod schema 변경 (BeginnerInputSchema) + detail 화면 표시 로직 동시 수정 (note-body-beginner.tsx)
7. **Sub-task G**: BlindMode gradient direction 수정 (135deg → 180deg)
8. **Sub-task H**: design-tokens.ts 신규 토큰 5개 + i18n 키 38개 추가
9. **Sub-task I**: supabase-engineer에 is_public 컬럼 확인 요청 (§10 E16)

---

## 15. 빈/오류 상태

| 상태 | 처리 |
|---|---|
| wine === null (wine_lwin 없음 또는 매칭 실패) | WineLinkCard fallback CTA + BeginnerHeader WineName fallback ("오늘의 한 잔") + Save 버튼 disabled |
| wine fetch 중 (wineLoading=true) | ScrollView 상단 `<ActivityIndicator color={brand.gold}/>` 8py center |
| profile fetch 중 (profileLoading=true) | mode 초기화 보류 — 기본 'beginner' |
| zod parse fail | Toast tone=error `validationFailed` |
| supabase insert fail (network error) | Toast tone=error `saveFailed` + 재시도 가능 (Save 버튼 saving=false 복원) |
| auth lost (uid 없음) | `throw new Error('no session')` → catch → Toast `saveFailed`. (qa-inspector: onboarding redirect 권장) |
| photo_url 잘못된 path | Storage 401 → Save는 성공하되 photo_url=null fallback (qa 시각 검증) |
| is_public column 부재 (마이그레이션 미적용) | payload 분기: 컬럼 있으면 포함, 없으면 omit (try/catch) — **§10 E16 마이그레이션 확정 시 단순화** |

---

## 16. 참조 파일 (rn-screen-builder가 코드 작성 시 read)

- `app/notes/new/write.tsx` — 현재 RN (341 LOC, 재작성 대상)
- `src/components/notes/beginner-form.tsx` — 현재 RN (130 LOC, 재작성 대상)
- `src/components/notes/expert-form.tsx` — 현재 RN (345 LOC, BlindMode gradient만 수정)
- `src/components/notes/wset-slider.tsx` — 현재 RN (65 LOC, keep — Expert에서 사용)
- `src/components/notes/star-rating.tsx` — 현재 RN (59 LOC, keep)
- `src/components/notes/aroma-chips.tsx` — 현재 RN (75 LOC, ko/en 매핑 확장 가능)
- `src/components/notes/mode-toggle.tsx` — 현재 RN (64 LOC, keep)
- `src/components/notes/wine-link-card.tsx` — 현재 RN (87 LOC, keep)
- `src/components/notes/note-body-beginner.tsx` — detail 화면 표시 (BeginnerFields shape 변경 시 동시 수정)
- `src/components/nav/back-header.tsx` — BackHeader 패턴
- `src/components/shared/toast.tsx` — Toast 컴포넌트 (이미 사용 중)
- `src/components/shared/wine-name-display.tsx` — BeginnerHeader WineName 패턴
- `src/lib/design-tokens.ts` — 토큰 진실 소스 (§4-2 신규 추가)
- `src/lib/use-theme-tokens.ts` — useColorScheme 분기 hook
- `src/lib/notes/builtin-templates.ts` — BUILTIN_BEGINNER_ID / BUILTIN_EXPERT_ID + mapSourceUiToDb
- `_workspace/design-specs/notes-new.md` §10-2, §13 — Option A SCOPE-OUT 결정
- `_workspace/keyscreen-shots/notes_new_write.png` — 시각 reference (Beginner, dark, ko)

---

## 17. 변환 체크리스트 (rn-screen-builder용)

- [ ] `app/notes/new/write.tsx` 진입 query 확장 (templateId / from / itemId) + 초기 mode useEffect 분기 (§12-3)
- [ ] `src/components/notes/beginner-form.tsx` 재작성 — keyscreen 6 Step verbatim (큰 변경)
- [ ] `src/components/notes/beginner-header.tsx` 신규 — eyebrow / WineName / Producer / Greeting
- [ ] `src/components/notes/step-header.tsx` 신규 — variant: 'beginner' | 'expert' (badge color + 번호 + title)
- [ ] `src/components/notes/impression-triad.tsx` 신규 — Sparkles/Smile/HelpCircle 3-button
- [ ] `src/components/notes/palate-triad.tsx` 신규 — sweetness/acidity/body/tannin?/bubble? × low/mid/high
- [ ] `src/components/notes/aroma-grid.tsx` 신규 — 8 카드 4×2 그리드 (berry/citrus/stoneFruit/floral/spice/sweet/earth/yeast)
- [ ] `src/components/notes/finish-triad.tsx` 신규 — short/medium/long 3-button
- [ ] `src/components/notes/auto-summary-card.tsx` 신규 — Playfair italic + summarize()
- [ ] `src/lib/notes/summarize.ts` 신규 — `summarizeBeginner({impression, palate, aromas, finish, rating, locale})` ko/en
- [ ] `src/components/notes/price-capture.tsx` 신규 — Switch + NumberInput
- [ ] `src/components/notes/share-to-community.tsx` 신규 — Switch + label + sub
- [ ] `src/components/notes/save-pill.tsx` 신규 — wineRed footer pill (header SaveBtn 동일 onPress)
- [ ] `src/components/notes/expert-form.tsx` BlindMode gradient direction 수정 (D4) — `gradients.expertBlind` 사용
- [ ] `src/components/notes/note-body-beginner.tsx` 동시 수정 — BeginnerFields shape 변경 반영 (detail 화면 표시)
- [ ] zod schema 변경 — BeginnerInputSchema = `{impression, palate, aromas, finish, memo, priceCapture?}` (§11-2)
- [ ] `src/lib/design-tokens.ts` 토큰 추가 — typography 5개 (beginnerEyebrow / beginnerGreeting / stepHeaderBadge / summaryEyebrow / summaryText) (§4-2)
- [ ] `tailwind.config.ts` mirror 추가
- [ ] `src/lib/i18n/ko.json` + `en.json` 신규 키 38개 추가 (§8-2)
- [ ] `src/lib/i18n/ko.json` + `en.json` `notes.write` 값 수정 → "테이스팅 노트" / "Tasting note" (§8-3)
- [ ] supabase-engineer에 `tasting_notes.is_public` 컬럼 확인 요청 (§10 E16)
- [ ] 양쪽 모드 (dark/light) + 양쪽 언어 (ko/en) 캡처 → design-reviewer
- [ ] Beginner 6 Step + AutoSummary + Price/Share 캡처 (4 조합)
- [ ] Expert BlindMode gradient 캡처 (전 vs 후)
- [ ] accessibilityLabel/Role/Hint 모두 부여 (§7)
- [ ] Haptics.selectionAsync 모든 press hook (§6)
- [ ] confirmDiscard Alert touched 분기 검증 (§14)

---

> **다음 단계**: design-reviewer 본 사양 검토 후 rn-screen-builder 진입. design-tokens.ts + tailwind.config.ts + i18n 확장은 별도 P0 세션 또는 rn-screen-builder 본인이 처리 가능. E1·E6·E10·E13·E16 (schema 변경 또는 새 컬럼 확인)는 리더 + supabase-engineer 판단 — 미결정 시 v0.1.0은 (a) is_public 컬럼 부재 시 ShareToggle UI state만 (insert payload omit), (b) BeginnerFields shape 변경은 jsonb 자유 schema라 단독 진행 가능.
