# capture (`/capture`) Design Spec

> RN+Expo+NativeWind v4 변환 사양. rn-screen-builder 단독 입력. `../winemine-keyscreen/` 직접 참조 금지.
> 진실 순서: keyscreen JSX > keyscreen messages (`messages/{ko,en}.json` `capture.*`) > design-system docs > 우리 design-tokens.
> 작성일: 2026-05-20 (Day 6 retroactive hardening) · author: design-spec-author

## 원본 소스

- JSX (entry): `../winemine-keyscreen/src/app/capture/page.tsx` (589 lines — `CapturePage` + 인라인 `SimulatingView` / `RecognizedView` / `MetaRow` / `SecondaryButton` / `FallbackLabel`)
- 자식 컴포넌트: 인라인 (별도 컴포넌트 파일 없음 — 모두 page.tsx 내부)
- 참조 lib:
  - `../winemine-keyscreen/src/lib/mock/wines.ts` (recognized wine 메타 source)
  - `../winemine-keyscreen/src/context/locale-context.tsx` (LocalizedString)
  - `../winemine-keyscreen/src/context/user-data-context.tsx` (addCellarItem)
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- i18n (keyscreen `messages/{ko,en}.json` `capture.*` 네임스페이스 — `title / scan / gallery / cellar / note / simulating / recognized / fileNotFound`)
- 스크린샷 reference: `_workspace/keyscreen-shots/capture.png` (choose stage, dark, ko — 4-option card list + 상단 close X + 중앙 title "와인 추가" + 좌하단 dev affordance)
- 현재 RN 구현 (retroactive 대상):
  - `app/(tabs)/capture.tsx` (408 LOC — 라이브 카메라 + 하단 셔터/옵션 + BlurView 분석 오버레이 + 권한 fallback + manualPlaceholder modal)
  - `src/components/capture/label-scan-result-modal.tsx` (123 LOC — BottomSheet-style modal: 와인 카드 + writeNote/retry CTA)

---

## 1. Route

| 항목 | 값 |
|---|---|
| 파일 | `app/(tabs)/capture.tsx` (그대로 유지 — `(tabs)` 그룹 안의 중앙 FAB 탭 진입) |
| 진입 경로 | `/capture` (BottomNav 중앙 FAB 또는 home QuickActions, RecognizedFail 'edit', NoteWrite 'wineLinkCaptureCta', WineDetail 'AddNote') |
| 헤더 | 화면 내부 `<CaptureHeader/>` — keyscreen은 height 56 / `padding 0 16` / 좌 X 닫기·중앙 title·우 36px spacer 패턴. **AppHeader 미사용** |
| BottomNav | **숨김** (keyscreen `BottomNav` 라우트 정책: `/capture` 는 noBottomNav — `components/nav/bottom-nav.tsx shouldShowBottomNav()` 라우트 prefix 검사 verbatim). RN: 현재 `(tabs)` 안에 있어 자동 표시됨 → §8 deviation 항목으로 명시 (BottomNav hide 필요) |
| 다크/라이트 | 둘 다 지원 (keyscreen 검증됨) |
| 가드 | 카메라 권한 거부 → permission fallback view (현재 RN 동일). 키스크린은 권한 개념 없음 (mock) |
| 닫기 | header X 또는 backHandler → `router.back()` (stage가 `choose`일 때) / `setStage('choose')` (stage가 `simulating` / `recognized`일 때) — keyscreen line 98 verbatim |

> **현재 RN 차이 (큰 deviation)**: 우리 구현은 카메라 라이브뷰가 첫 화면. 키스크린은 정적 4-option picker 카드 + 후속 mock 분석. v0.1.0은 실제 카메라/갤러리 호출(label-scan Edge Function) 통합이 목적이므로 **사양은 키스크린 시각 위계를 적용한 hybrid**로 정의 — choose 단계를 두되 카메라 옵션 탭 시 즉시 라이브뷰 fullscreen 전환. §10 RN deviation 사유 참조.

---

## 2. Layout Tree (verbatim 변환 + RN hybrid)

keyscreen은 3-stage state machine. RN도 동일 3-stage + 권한 fallback + manualPlaceholder 4번째 modal stage.

```
SafeAreaView (edges=['top','bottom'], flex-1, bg-bg-deepest dark:bg-bg-deepest)
│
├── CaptureHeader (height 56, padding 0 16, flex row items-center justify-between, flex-shrink 0)
│     ├── CloseButton (36×36, Pressable hitSlop=12, items-center justify-center, color text-primary/cream)
│     │     └── X icon (lucide 22px, strokeWidth 1.75)
│     │     [onPress: stage==='choose' ? router.back() : setStage('choose')]
│     ├── Title (Inter 17px 600, text-primary/cream, margin 0)
│     │     [text: t('capture.title') → "와인 추가" / "Add a wine"]
│     └── Spacer (width 36, aria-hidden) — 우측 균형용
│
└── Main ScrollView (flex-1, contentContainerStyle: padding 24 20, gap 14 col)
      [keyscreen `.wm-scroll-area` — paddingBottom 96 자동, 우리는 (tabs) 안이므로 paddingBottom: insets.bottom + 24]
      │
      ├── [stage === 'choose']  ChooseView
      │     └── Column (gap 12)
      │           └── OptionCard × 4 (각 height 104, padding 18, gap 16 row, bg surface, border 1px border-default, radius 16)
      │                 ├── IconWell (32×32, flex-shrink 0)
      │                 │     - scan:    Camera (lucide 32, strokeWidth 1.5, color wine-red)
      │                 │     - gallery: ImageIcon (32, 1.5, color gold)
      │                 │     - cellar:  Library (32, 1.5, color cream/text-primary)
      │                 │     - note:    BookOpen (32, 1.5, color text-secondary)
      │                 └── Text column (flex 1, min-w-0)
      │                       ├── Title (Playfair 18px, cream/text-primary, mb=4)
      │                       │     [t('capture.scan.title') 등 verbatim]
      │                       └── Sub (Inter 12px, text-muted, lineHeight 1.4)
      │                             [t('capture.scan.sub') 등 verbatim]
      │
      ├── [stage === 'simulating']  SimulatingView
      │     └── Centered column (marginTop 40, gap 24, padding 40 20, items-center)
      │           ├── PreviewFrame (240×320, bg #000 / brand.black, radius 20, overflow hidden, border 1px border-default, relative)
      │           │     │ [source === 'scan']
      │           │     ├── Camera guide rect (absolute inset 32, border 2px gold, radius 12, opacity 0.6)
      │           │     ├── Spinner (Loader2 lucide 32, color gold, absolute center)
      │           │     │     - wm-pulse anim: opacity 0.4↔1, scale 0.95↔1.05, 1.5s ease-in-out infinite
      │           │     │ [source === 'gallery']
      │           │     ├── Grid 3×3 (gap 2, padding 8)
      │           │     │     └── 9 cells (aspectRatio 1:1, bg rgba(245,240,232,0.04) — i==4 시 +0.18 emphasis; border 1px rgba(245,240,232,0.06), i==4 시 2px gold; radius 4)
      │           │     └── Spinner (Loader2 28, color gold, absolute bottom 24, center-x)
      │           │           - wm-pulse 동일
      │           └── Message row (centered, inline-flex items-center gap 8)
      │                 ├── Sparkles (lucide 14, color gold)
      │                 └── Text (Inter 14px, cream/text-primary, mb=4)
      │                       [t('capture.simulating.scan') 또는 t('capture.simulating.gallery')]
      │
      ├── [stage === 'recognized']  RecognizedView (column, gap 16)
      │     │
      │     ├── AIBadgeBanner (flex row items-center gap 8, padding 10 14, bg rgba(201,168,76,0.08), border 1px gold, radius 12)
      │     │     ├── Sparkles (lucide 16, color gold)
      │     │     └── Text column (flex 1)
      │     │           ├── Title (Inter 13px 600, cream/text-primary)
      │     │           │     [t('capture.recognized.title') — "이 와인이 맞나요?" / "Is this the right wine?"]
      │     │           └── Subtitle (Inter 11px, text-muted)
      │     │                 [t('capture.recognized.subtitle')]
      │     │
      │     ├── RecognizedCard (bg surface, border 1px border-default, radius 16, padding 16, col gap 14)
      │     │     │
      │     │     ├── PhotoMeta row (flex row gap 14, items-start)
      │     │     │     │
      │     │     │     ├── PhotoFrame (90×130, flex-shrink 0, radius 8, overflow hidden,
      │     │     │     │             background `linear-gradient(180deg, ${bottleColor} 0%, #1a0a0e 100%)`,
      │     │     │     │             border 1px border-default, relative)
      │     │     │     │     │ [photoLoadFailed === false]
      │     │     │     │     ├── Image (uri=photo_url 또는 SAMPLE_PHOTO_PATH, width/height 100%, objectFit cover)
      │     │     │     │     │     [onError → setPhotoLoadFailed(true)]
      │     │     │     │     │ [photoLoadFailed === true]
      │     │     │     │     └── FallbackLabel (react-native-svg, viewBox 90×130 verbatim — §3-3 상세)
      │     │     │     │
      │     │     │     └── MetaColumn (flex 1, min-w-0)
      │     │     │           ├── WineName (Playfair 17px, cream/text-primary, lineHeight 1.25, mb=4)
      │     │     │           │     [name_ko ?? display_name — WineNameDisplay 컴포넌트 사용]
      │     │     │           ├── Producer (Inter 12px, text-secondary, mb=8)
      │     │     │           ├── MetaRow × 5 (각 row: flex row gap 8, fontSize 11, mb=3)
      │     │     │           │     - label (Inter 11px, text-muted, minWidth 48, flex-shrink 0)
      │     │     │           │     - value (Inter 11px, cream/text-primary, lineHeight 1.4)
      │     │     │           │     │ 5개 row 순서 verbatim (keyscreen line 441~445):
      │     │     │           │     │   1. vintage  · t('capture.recognized.vintage')
      │     │     │           │     │   2. region   · `${region}, ${country}`
      │     │     │           │     │   3. appellation
      │     │     │           │     │   4. grape    · grapes.map → join(', ')
      │     │     │           │     │   5. drinkWindow · `${from}–${to}`
      │     │     │
      │     │     └── [photoLoadFailed === true]  FileNotFoundHint (padding 10, bg rgba(74,61,86,0.2), radius 8)
      │     │           ├── Title (Inter 11px **700**, text-secondary, line 1)
      │     │           │     [t('capture.fileNotFound.title')]
      │     │           ├── Body (Inter 11px, text-muted, lineHeight 1.5)
      │     │           │     [t('capture.fileNotFound.body')]
      │     │           └── Hint (Inter 11px, text-muted opacity 0.7)
      │     │                 [t('capture.fileNotFound.hint')]
      │     │
      │     ├── PrimaryActions column (gap 10)
      │     │     ├── ConfirmNoteButton (Pressable, padding 14 20, bg wine-red, color cream, radius 12, Inter 14px 600, textAlign center)
      │     │     │     [t('capture.recognized.confirmNote') → "맞아요 — 노트 작성" / "Yes — write a note"]
      │     │     │     [onPress: router.push(`/notes/new/write?from=newEntry&wine_lwin=${lwin}`)]
      │     │     └── ConfirmCellarButton (Pressable, padding 14 20, bg transparent, color gold, border 1px gold, radius 12, Inter 14px 600, center)
      │     │           [t('capture.recognized.confirmCellar') — "셀러에 보관" / "Store in cellar"]
      │     │           [onPress: addCellarItem → toast → router.push('/cellar')]
      │     │
      │     └── SecondaryActions row (flex row gap 10)
      │           ├── RetryButton (flex 1, padding 10 14, bg transparent, color text-secondary, border 1px border-default, radius 10, Inter 12px, inline-flex items-center justify-center gap 6)
      │           │     ├── RotateCcw (lucide 14)
      │           │     └── Text [t('capture.recognized.retry') — "다시" / "Retry"]
      │           │     [onPress: setStage('choose')]
      │           └── EditButton (동일 구조)
      │                 ├── Pencil (lucide 14)
      │                 └── Text [t('capture.recognized.edit') — "직접 수정" / "Edit manually"]
      │                 [onPress: router.push(`/notes/new/write?from=newEntry&wine_lwin=${lwin}&edit=1`)]
      │
      └── [permission/scanning/manualPlaceholder]  추가 stage (RN 전용 — §6 / §10)
```

### 2-1. RN 추가 stage (키스크린에 없음, deviation §10 명시)

- **CameraLiveStage** (`stage === 'live-camera'`) — choose에서 scan 옵션 탭 시 진입. `<CameraView/>` fullscreen. 상단 좌 X (`stage='choose'` 복귀) / 하단 셔터 + 좌 갤러리 + 우 manual + cancel. **현재 RN 구현의 fullscreen layout 유지** — choose stage가 keyscreen 시각 위계의 핵심 (4-card grid). live-camera는 시안 외 RN 전용 인터랙션.
- **PermissionFallback** — 권한 거부 시 표시. 현재 RN 그대로 보존: title + description + grant + openSettings 버튼.
- **ProcessingOverlay** — Storage 업로드 + label-scan 호출 중. 현재 RN BlurView intensity 80 + ActivityIndicator. **키스크린의 SimulatingView를 우선** — `<PreviewFrame/>` + Sparkles 메시지로 통일 권장. §10 명시.
- **ManualPlaceholderModal** — label-scan 실패 시 진입. 현재 RN 그대로 보존 (rgba(0,0,0,0.55) backdrop + bg-bg-deep 카드 + title/desc/close).

---

## 3. NativeWind v4 className 매핑표

### 3-1. CaptureHeader

| 키스크린 (inline style verbatim) | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| `height: 56` | `style={{ height: 56 }}` | A | 동등 |
| `padding: '0 16px'` | `className="px-4"` | A | NW v4 동등 |
| `display: flex; alignItems: center; justifyContent: space-between` | `className="flex-row items-center justify-between"` | A | RN default flex column → flex-row 명시 |
| `flexShrink: 0` | `className="shrink-0"` | A | |
| close button `all: unset; cursor: pointer; width/height 36` | `<Pressable hitSlop={12} className="h-9 w-9 items-center justify-center">` | D | RN `all: unset` 없음 — Pressable 기본 |
| `color: var(--color-cream)` (X icon) | `<X size={22} strokeWidth={1.75} color={brand.cream}/>` (다크) / `color={light.text.primary}` (라이트) | B | useColorScheme 분기 |
| h1 `fontSize: 17; fontWeight: 600` | `<Text style={typography.backTitle}>` (그러나 backTitle은 16px) → **신규 typography 토큰 `captureHeaderTitle` 필요** (17px 600 Inter cream) — §9 P0 | C | 키스크린 line 113~123 verbatim — backTitle(16px)과 1px 차이 |
| spacer `width: 36` | `<View className="w-9"/>` | A | |

### 3-2. ChooseView OptionCard (4개)

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| `all: unset; cursor: pointer` (button) | `<Pressable accessibilityRole="button">` | D | |
| `display: flex; alignItems: center; gap: 16; padding: 18; height: 104` | `className="flex-row items-center gap-4 p-[18px] h-26"` | C/A | `p-[18px]` (NW arbitrary) 또는 `style={{padding:18}}`. height 104 = `h-26` (spacing 26=104). **`spacing.26 = 104` 추가 필요** — §9 P0 |
| `background: var(--color-surface)` | `className="bg-surface"` | B | 기존 토큰 |
| `border: 1px solid var(--color-border-default)` | `className="border border-border-default"` | B | |
| `borderRadius: 16` | `className="rounded-2xl"` | A | |
| `boxSizing: border-box` | (RN 기본 동작) | — | |
| icon wrapper `flexShrink: 0` | `<View className="shrink-0">` | A | |
| text wrapper `minWidth: 0; flex: 1` | `<View className="flex-1 min-w-0">` | A | NW v4 `min-w-0` 지원 |
| title `fontFamily: var(--font-playfair); fontSize: 18; color: var(--color-cream); marginBottom: 4` | `<Text style={typography.optionCardTitle}>` — **신규 typography `optionCardTitle`** (Playfair 18px, lineHeight 1.2, cream/text-primary) — §9 P0 | C | 키스크린 line 154~163 verbatim |
| sub `fontFamily: var(--font-inter); fontSize: 12; color: var(--color-text-muted); lineHeight: 1.4` | `<Text style={typography.optionCardSub}>` — **신규 typography `optionCardSub`** (Inter 12px, lh 16.8, text-muted) — §9 P0 | C | |
| icon color hardcoded `var(--color-wine-red)` (scan) / `var(--color-gold)` (gallery) / `var(--color-cream)` (cellar) / `var(--color-text-secondary)` (note) | `color={brand.wineRed}` / `brand.gold` / `useScheme=='dark'?brand.cream:light.text.primary` / `useScheme=='dark'?dark.text.secondary:light.text.secondary` | B | useColorScheme 분기 — 다크는 brand 직접 사용, 라이트는 light/dark scope. Cream/text-secondary가 light에서 다른 값으로 재정의됨에 주의 |
| icon `strokeWidth: 1.5; size: 32` | `<Camera size={32} strokeWidth={1.5}/>` 등 | A | verbatim |

### 3-3. SimulatingView

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| `marginTop: 40; gap: 24; padding: '40px 20px'; flex column items-center` | `className="mt-10 gap-6 px-5 py-10 items-center"` | A | spacing 10=40 (✓), 6=24 (✓) |
| PreviewFrame `width: 240; height: 320; background: #000; borderRadius: 20; overflow hidden; border 1px border-default; relative` | `style={{ width: 240, height: 320, backgroundColor: brand.black, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.border.default }}` | B | radius 20 = `rounded-20` (이미 design-tokens.ts에 radius.20=20 존재) → `className="rounded-[20px]"` 또는 design-tokens radius.20 적용 |
| Camera guide `position absolute; inset: 32; border: 2px solid var(--color-gold); borderRadius: 12; opacity: 0.6` | `<View className="absolute inset-8 border-2 border-gold opacity-60 rounded-xl"/>` | A/B | NW v4 `inset-8`=32 (✓) |
| Spinner `position absolute; top 50% left 50%; transform translate(-50%, -50%)` + wm-pulse animation | `<Animated.View style={{position:'absolute', top:'50%', left:'50%', transform:[{translateX:-16},{translateY:-16}]}}/>` (32px icon offset = size/2) + Reanimated useSharedValue scale+opacity, 1500ms infinite | D | RN `translate(-50%, -50%)` 부분 지원 (transform 문자열). 명시 px offset 권장. Animation은 Reanimated 또는 Animated API |
| `@keyframes wm-pulse` (opacity 0.4↔1, scale 0.95↔1.05) | Reanimated `withRepeat(withTiming(...))` 적용 — easing `Easing.inOut(Easing.ease)`, duration 750 (half cycle), reverse | D | CSS keyframes 부재 — Reanimated 등가로 변환 |
| Gallery grid `display: grid; gridTemplateColumns: 1fr 1fr 1fr; gap: 2; padding: 8` | `<View className="flex-row flex-wrap p-2">` + 9 children each `style={{width:'33.33%', aspectRatio:1, padding:1}}` | D | RN grid 미지원 — flexbox row+wrap+33.33% width. aspect-ratio NW v4 `aspect-square` 사용 (✓) |
| 셀 `aspectRatio: '1/1'; background: rgba(245,240,232, alpha); border ...; borderRadius: 4` | `<View className="aspect-square rounded" style={{ backgroundColor: 'rgba(245,240,232,0.04)' }}/>` (i==4 시 0.22 + border 2px gold) | A/D | alpha 색은 inline style — `withAlpha(brand.cream, 0.04)` 사용 권장 |
| 메시지 row `inline-flex items-center gap: 8` | `<View className="flex-row items-center gap-2">` | A | |
| message text `font-inter; fontSize: 14; color: cream; marginBottom: 4` | `<Text style={typography.cardBody} className="text-text-primary dark:text-text-primary">` (cardBody=13px → **신규 `simulatingMessage` 필요** 14px Inter cream) — §9 P0 | C | 키스크린 line 308~321 — 14px specific |

### 3-4. RecognizedView — AIBadgeBanner

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| `flex row items-center gap 8; padding 10 14` | `className="flex-row items-center gap-2 px-3.5 py-2.5"` | A | NW spacing 3.5=14 (✓ design-tokens.ts), 2.5=10 (✓) |
| `background: rgba(201, 168, 76, 0.08)` | `style={{ backgroundColor: withAlpha(brand.gold, 0.08) }}` | B | gold 0.08 — 기존 color tokens.md §9-1에 정의됨 |
| `border 1px solid var(--color-gold)` | `className="border border-gold"` | B | |
| `borderRadius: 12` | `className="rounded-xl"` | A | |
| Sparkles `size 16; color gold` | `<Sparkles size={16} color={brand.gold}/>` | A | |
| Title `font-inter 13px 600 cream` | `<Text style={typography.aiBadgeTitle}>` — **신규 `aiBadgeTitle`** (Inter 13px 600 cream/text-primary, lh 15.6) — §9 P0 | C | |
| Subtitle `font-inter 11px text-muted` | `<Text style={typography.aiBadgeSubtitle}>` — **신규 `aiBadgeSubtitle`** (Inter 11px 400 text-muted, lh 13.2) — §9 P0 | C | |

### 3-5. RecognizedCard

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| 카드 `bg surface; border 1px border-default; radius 16; padding 16; col gap 14` | `className="bg-surface dark:bg-surface border border-border-default rounded-2xl p-4 gap-3.5"` | A/B | gap 3.5=14 (✓) |
| Photo+meta row `flex row gap 14; items-start` | `className="flex-row gap-3.5 items-start"` | A | |
| PhotoFrame `width 90; height 130; radius 8; overflow hidden; border 1px border-default; relative` | `style={{ width: 90, height: 130, borderRadius: 8, overflow: 'hidden', borderWidth: 1 }} className="border-border-default relative shrink-0"` | A | |
| PhotoFrame background `linear-gradient(180deg, ${bottleColor} 0%, #1a0a0e 100%)` | `<LinearGradient colors={[bottleColor, '#1a0a0e']} start={{x:0.5,y:0}} end={{x:0.5,y:1}} style={StyleSheet.absoluteFill}/>` — **신규 gradient 토큰 `bottlePhotoFrame`** (180deg, bottleColor→#1a0a0e) — §9 P0 | D | expo-linear-gradient. 끝점 `#1a0a0e` (`bottleGradientEnd` 기존이 `#1a0a1e` — capture 전용은 다른 값! line 407 verbatim, colors.md §6-3 "캡처 씬 하단 #1a0a0e") → 신규 토큰 `captureBottleEnd = '#1a0a0e'` |
| `<img>` width/height 100% objectFit cover | `<Image source={{uri}} style={{ width: '100%', height: '100%' }} resizeMode="cover"/>` | D | RN `<img>` 부재 |
| Meta column `flex 1; min-w-0` | `<View className="flex-1 min-w-0">` | A | |
| WineName `font-playfair 17px cream; lineHeight 1.25; mb 4` | `<WineNameDisplay size="title" .../>` 또는 새 typography `recognizedName` 17px Playfair lh 21.25 cream — §9 P0 (cardTitle은 16px) | C | 키스크린 line 426~437 verbatim |
| Producer `font-inter 12px text-secondary; mb 8` | `<Text style={typography.cardMeta} className="text-text-secondary dark:text-text-secondary mb-2">` | B | cardMeta(12 lh 14.4) 동등 — text-secondary 색만 분기 |
| MetaRow `flex row gap 8; fontSize 11; mb 3` | `<View className="flex-row gap-2 mb-[3px]">` (mb 3=12 ❌ 키스크린은 3px) → `style={{marginBottom: 3}}` | C | spacing 0.75=3 부재 — **`spacing.0.75 = 3` 추가 필요** 또는 inline |
| MetaRow label `font-inter; color text-muted; minWidth 48; flex-shrink 0` | `<Text style={{...typography.cardMeta, fontSize: 11}} className="text-text-muted shrink-0" style={{minWidth: 48}}>` — **신규 typography `metaRowLabel`** (Inter 11px text-muted lh 1.4) — §9 P0 | C | cardMeta(12px) 1px 차이 |
| MetaRow value `font-inter; color cream; lineHeight 1.4` | 동일 신규 `metaRowValue` (Inter 11px cream/text-primary lh 15.4) — §9 P0 | C | |

### 3-6. FileNotFoundHint

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| `padding 10; background rgba(74,61,86,0.2); radius 8; font-inter 11; color text-muted; lh 1.5` | `<View className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(74,61,86,0.2)' }}>` | B/C | **신규 color 토큰 `fileNotFoundBg`** (rgba(74,61,86,0.2)) — dark only. light 등가 — `withAlpha(light.text.muted, 0.12)` 추정 — §9 P0 |
| `<strong>` color text-secondary | `<Text style={{...typography.fileNotFoundTitle, fontWeight:'700'}} className="text-text-secondary dark:text-text-secondary">` | B | |
| body Inter 11px text-muted | typography `fileNotFoundBody` (Inter 11 lh 16.5) — §9 P0 | C | |
| hint opacity 0.7 | `style={{ opacity: 0.7 }}` | A | |

### 3-7. PrimaryActions

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| ConfirmNote button: `padding 14 20; bg wine-red; color cream; radius 12; Inter 14px 600; textAlign center` | `<PrimaryButton variant="primary" size="lg" label={t(...)} onPress={...}/>` | B | 기존 PrimaryButton lg size 48px height + Inter 15px 600 → **차이**: 키스크린 14px 14_20 → PrimaryButton lg는 15px 14_20. 1px 차이 묵인 vs 신규 size `xl` 추가. **사양은 PrimaryButton lg 사용 권장** (1px deviation 명시) |
| ConfirmCellar: `padding 14 20; bg transparent; color gold; border 1px gold; radius 12; Inter 14px 600` | `<PrimaryButton variant="cellar" .../>` — **신규 variant `cellar`** 추가 (border+color gold transparent bg) — components.md §2-1 4 variant에 추가 후보 | C | 또는 inline Pressable. PrimaryButton API 확장 권장 — §9 P0 |
| 액션 column gap 10 | `className="gap-2.5"` (spacing 2.5=10 ✓) | A | |

### 3-8. SecondaryActions

| 키스크린 | RN+NW v4 | 분류 | 비고 |
|---|---|---|---|
| row `flex gap 10` | `className="flex-row gap-2.5"` | A | |
| SecondaryButton `flex 1; padding 10 14; bg transparent; color text-secondary; border 1px border-default; radius 10; Inter 12px; inline-flex items-center justify-center gap 6` | `<Pressable className="flex-1 flex-row items-center justify-center gap-1.5 px-3.5 py-2.5 border border-border-default rounded-[10px]">` | A/C | radius 10 = NW arbitrary `rounded-[10px]` 또는 design-tokens `radius['10'] = 10` 추가 |
| 텍스트 색 text-secondary | `className="text-text-secondary dark:text-text-secondary"` | B | |
| icon RotateCcw / Pencil size 14 | `<RotateCcw size={14} color={dark.text.secondary}/>` (또는 useColorScheme 분기) | A | |
| 텍스트 typography `font-inter 12px` | `<Text style={typography.cardMeta}>` (12 lh 14.4 ✓) | B | |

### 3-9. PermissionFallback (RN 전용 — keyscreen 미존재, 현재 RN 보존)

| 현재 RN | 보존 | 비고 |
|---|---|---|
| close X (우상단) | 그대로 | |
| title `empty-title` (Playfair 22) | 그대로 | typography.emptyTitle |
| description `card-body` (Inter 13) | 그대로 | typography.cardBody |
| Grant + OpenSettings PrimaryButton lg/md | 그대로 | i18n 키 `capture.permission.{title,description,grant,openSettings}` |

### 3-10. ProcessingOverlay (RN 전용 — keyscreen SimulatingView 우선 권장)

**현재 RN**: `<BlurView intensity={80}/>` + `<ActivityIndicator/>` + "분석 중" 텍스트.

**사양**: SimulatingView (§3-3)로 통일 권장. BlurView 자체는 유지 가능하지만 PreviewFrame + Sparkles + i18n 메시지 통일이 키스크린 시각 흐름과 일치.

대안:
1. (권장) `runScanPipeline` 진입 시 `stage='simulating'` 으로 전환 → `SimulatingView` 렌더 (BlurView 제거)
2. (현행 유지) BlurView + ActivityIndicator + i18n key `capture.analyzing` 보존 — 단 디자인 reviewer가 키스크린 SimulatingView 보존도와 단순 BlurView 정합성 판단

→ §10 deviation 항목 + design-reviewer 판단 의뢰.

### 3-11. ManualPlaceholderModal (RN 전용 — keyscreen 미존재)

| 현재 RN | 보존 | 비고 |
|---|---|---|
| overlay `rgba(0,0,0,0.55)` backdrop | 그대로 | tokens 부재 — `glass.bg` (rgba(10,5,15,0.72))와 다름. modal backdrop 표준화 후보 |
| 카드 `bg-bg-deep; rounded-xl; px-5 py-6; max-w-md` | 그대로 | |
| title emptyTitle / desc cardBody | 그대로 | i18n `capture.manualPlaceholder.{title,description}` |

---

## 4. 디자인 토큰 사용 (`src/lib/design-tokens.ts`)

### 4-1. 기존 토큰 — 사용 OK

- `brand.gold` (`#C9A84C`) — Camera guide rect border, Sparkles, Loader2, AIBadgeBanner border, ConfirmCellar text/border, FallbackLabel label stroke
- `brand.wineRed` (`#8B1A2A`) — scan OptionCard icon, ConfirmNote bg
- `brand.cream` (`#F5F0E8`) — OptionCard title, SimulatingMessage text (dark), FallbackLabel label fill
- `brand.black` (`#000000`) — PreviewFrame bg
- `brand.textInk` (`#2a1a14`) — FallbackLabel producer/wineName text (라이트 라벨 위 어두운 텍스트)
- `dark.bg.deepest` / `light.bg.deepest` — SafeAreaView 배경 (`bg-bg-deepest`)
- `dark.bg.surface` / `light.bg.surface` — OptionCard, RecognizedCard 배경 (`bg-surface`)
- `dark.bg.deep` / `light.bg.deep` — ManualPlaceholderModal 카드 배경
- `dark.text.primary` / `light.text.primary` — title, wine name, primary 텍스트
- `dark.text.secondary` / `light.text.secondary` — producer, SecondaryButton 텍스트
- `dark.text.muted` / `light.text.muted` — OptionCard sub, MetaRow label, AIBadgeSubtitle, FileNotFound body/hint
- `dark.border.default` / `light.border.default` — OptionCard, RecognizedCard, PhotoFrame, PreviewFrame, SecondaryButton border
- `typography.cardBody` (13/19.5) — PermissionFallback description
- `typography.cardMeta` (12/14.4) — SecondaryButton text, Producer
- `typography.emptyTitle` (22/28.6) — PermissionFallback / ManualPlaceholder title
- `typography.backTitle` (16/19.2) — header title 가까운 값 (정확히는 17px이라 분리 토큰 필요)
- `spacing.0/0.5/1/1.5/2/2.5/3/3.5/4/5/6/7/8/10` — 모두 사용
- `radius.lg` (8) — PhotoFrame
- `radius.xl` (12) — AIBadgeBanner, Camera guide rect
- `radius.2xl` (16) — OptionCard, RecognizedCard
- `radius.20` (20) — PreviewFrame
- `withAlpha(brand.gold, 0.08)` — AIBadgeBanner bg (colors.md §9-1)
- `withAlpha(brand.cream, 0.04)` — Gallery grid cell bg
- `withAlpha(brand.cream, 0.22)` — Gallery grid emphasized cell bg (i==4) — colors.md §9-1 0.18~0.22 범위
- `withAlpha(brand.cream, 0.06)` — Gallery grid cell border

### 4-2. 신규 필요 토큰 (P0 — design-tokens.ts + tailwind.config.ts 확장)

#### Spacing (tailwind.config.ts spacing)
- `spacing.0.75 = 3` (MetaRow mb=3, 신규)
- `spacing.26 = 104` (OptionCard height, 신규) 또는 inline style `{height: 104}`로 우회 가능

#### Radius
- `radius.10 = 10` (SecondaryButton radius)

#### Color
- `captureBottleEnd = '#1a0a0e'` — PhotoFrame gradient end (colors.md §6-3 verbatim, 기존 `bottleGradientEnd` `#1a0a1e`와 1bit 다름)
- `fileNotFoundBg = { dark: 'rgba(74,61,86,0.2)', light: 'rgba(160,140,110,0.12)' }` — FileNotFoundHint bg (light는 추정 — design-reviewer 검증)

#### Gradient
- `gradients.bottlePhotoFrame = (bottleColor) => ({ colors: [bottleColor, '#1a0a0e'], start: {x:0.5,y:0}, end: {x:0.5,y:1} })` — PhotoFrame factory (180deg verbatim line 407)

#### Typography
- `typography.captureHeaderTitle = { family: 'Inter_600SemiBold', size: 17, lineHeight: 20.4 }` — header title (17px specific)
- `typography.optionCardTitle = { family: 'PlayfairDisplay_400Regular', size: 18, lineHeight: 21.6 }` — OptionCard title
- `typography.optionCardSub = { family: 'Inter_400Regular', size: 12, lineHeight: 16.8 }` — OptionCard sub
- `typography.simulatingMessage = { family: 'Inter_400Regular', size: 14, lineHeight: 19.6 }` — SimulatingView message
- `typography.aiBadgeTitle = { family: 'Inter_600SemiBold', size: 13, lineHeight: 15.6 }` — AI banner title
- `typography.aiBadgeSubtitle = { family: 'Inter_400Regular', size: 11, lineHeight: 13.2 }` — AI banner subtitle
- `typography.recognizedName = { family: 'PlayfairDisplay_400Regular', size: 17, lineHeight: 21.25 }` — wine name in card
- `typography.metaRowLabel = { family: 'Inter_400Regular', size: 11, lineHeight: 15.4 }` — meta label (text-muted)
- `typography.metaRowValue = { family: 'Inter_400Regular', size: 11, lineHeight: 15.4 }` — meta value (text-primary)
- `typography.fileNotFoundTitle = { family: 'Inter_700Bold', size: 11, lineHeight: 16.5 }` — file-not-found `<strong>`
- `typography.fileNotFoundBody = { family: 'Inter_400Regular', size: 11, lineHeight: 16.5 }` — file-not-found body/hint

#### PrimaryButton variant 확장 (`src/components/shared/primary-button.tsx`)
- variant `cellar`: bg transparent, color gold, border 1px gold (라이트는 border-active = `#B89438`) — ConfirmCellar 사용

#### Animation 헬퍼
- `src/lib/animations/wm-pulse.ts` — Reanimated useSharedValue (scale 0.95→1.05, opacity 0.4→1, duration 750ms, withRepeat infinite reverse) → SimulatingView spinner 적용. 키스크린 `@keyframes wm-pulse` verbatim.

---

## 5. 상태 variants

### 5-1. default (stage='choose')

- 4개 OptionCard 정상 렌더
- ScrollView idle
- header 닫기 X 누르면 router.back()

### 5-2. loading (stage='simulating' 또는 RN 'uploading'/'scanning')

- SimulatingView 렌더 (§3-3)
- 키스크린: 1.5초 후 자동 recognized 전환
- RN: Storage upload → label-scan invoke → wines_localized lookup 완료 시 recognized 전환 (또는 error)
- 카메라/갤러리 옵션 비활성 (busy !== null)

### 5-3. empty

- 본 화면에 empty 상태 없음 (capture는 입력 진입점)
- recognized 후 wine이 wines_localized에 없으면 → §5-5 error로

### 5-4. dark (기본)

- bg: `dark.bg.deepest` (`#251837`)
- surface: `dark.bg.surface` (`#3D2A4A`)
- text primary: `dark.text.primary` (`#F8F4ED`)
- text secondary: `dark.text.secondary` (`#EBE0CB`)
- text muted: `dark.text.muted` (`#CABDA8`)
- border: `dark.border.default` (`#5A3D6A`)
- gold/wineRed/cream/gold tints/wineRed tints — 모두 brand 고정

### 5-5. light

- bg: `light.bg.deepest` (`#FAF5EC`)
- surface: `light.bg.surface` (`#FFFFFF`)
- text primary: `light.text.primary` (`#2A1A14`)
- text secondary: `light.text.secondary` (`#5A463C`)
- text muted: `light.text.muted` (`#8B7766`)
- border: `light.border.default` (`#E0D2BC`)
- gold remap: 라이트에서 `--color-gold = #B89438` (colors.md §2-1) — `brand.gold` 직접 사용은 dark 한정. light에서 SimulatingView Sparkles/Loader2 색은 `light.border.active` (`#B89438`) 또는 `brand.goldDeep` (`#A07F2E`) 분기 필요
- scan icon wine-red: 라이트에서 `--color-wine-red = #B89438` → 라이트는 gold tone으로 자동 fallback
- PhotoFrame gradient end `#1a0a0e`: dark 한정. **light는 `light.bg.deepest` 또는 `withAlpha(light.text.primary, 0.85)` 적용** — design-reviewer 검증
- WCAG AA 4.5:1 검증 항목: AIBadgeBanner title cream on rgba(gold,0.08) / OptionCard title cream on surface / SimulatingMessage cream on bg-deepest

### 5-6. error (label-scan 실패)

- **errors.scanFailed**: `<Toast tone="error">` + 하단 PrimaryButton(`switchToManual`, variant=secondary, size=sm) → `setShowManualPlaceholder(true)`
- **errors.uploadFailed**: Toast only, retry는 사용자가 옵션 재선택
- **errors.wineNotFound**: Toast only — wine 메타 없음 → 다시 시도 안내
- **errors.noPhoto**: Toast only — 사진 가져오지 못함

Toast 위치: `absolute left-4 right-4 bottom: insets.bottom + 152` (현재 RN line 261~277 보존)

### 5-7. permission denied (RN 전용)

- §3-9 PermissionFallback 렌더
- 키스크린 미존재 — RN 전용 stage

### 5-8. live-camera (RN 전용, choose scan 옵션 탭 후)

- `<CameraView/>` fullscreen + 상단 X (`stage='choose'` 복귀) + 하단 셔터/갤러리/manual/cancel
- §3-10 ProcessingOverlay 동시 표시 가능
- 키스크린에는 없음 — RN 전용 stage. UX 흐름: choose → [scan 탭] → live-camera → [shutter] → simulating → recognized

---

## 6. 인터랙션

| 트리거 | 액션 | Haptic | 결과 |
|---|---|---|---|
| header X tap | `stage==='choose' ? router.back() : setStage('choose')` | `Haptics.selectionAsync()` | 이전 화면 또는 choose stage |
| OptionCard `scan` tap | `setStage('live-camera')` (RN) → CameraView 진입 | `Haptics.impactAsync(Medium)` | 키스크린은 즉시 `startSimulation('scan')` |
| OptionCard `gallery` tap | `ImagePicker.launchImageLibraryAsync` → `runScanPipeline(uri)` | `Haptics.selectionAsync()` | 키스크린은 `startSimulation('gallery')` |
| OptionCard `cellar` tap | `router.push('/cellar')` | `Haptics.selectionAsync()` | 셀러 화면 |
| OptionCard `note` tap | `router.push('/notes/new')` | `Haptics.selectionAsync()` | 노트 source picker |
| live-camera shutter tap | `takePhoto()` → `runScanPipeline(photo.uri)` | `Haptics.impactAsync(Medium)` | 키스크린 미존재 (RN 전용) |
| ConfirmNote tap | `router.push('/notes/new/write?from=newEntry&wine_lwin={lwin}')` | `Haptics.notificationAsync(Success)` | 노트 작성 화면 |
| ConfirmCellar tap | `addCellarItem({...})` → Toast → `router.push('/cellar')` | `Haptics.notificationAsync(Success)` | 셀러 추가 + 이동 |
| Retry tap | `setStage('choose')`, photoLoadFailed 리셋 | `Haptics.selectionAsync()` | choose로 복귀 |
| Edit tap | `router.push('/notes/new/write?from=newEntry&wine_lwin={lwin}&edit=1')` | `Haptics.selectionAsync()` | 노트 작성 (manual edit 모드) |
| 사진 `<Image>` onError | `setPhotoLoadFailed(true)` | — | FallbackLabel SVG 렌더 + FileNotFoundHint 표시 |
| Pressable press (모든 카드) | scale 0.98 visual feedback | — | RN `Pressable {pressed}` |
| useFocusEffect cleanup | `setBusy(null); setErrorMsg(null); setRecognized(null); setShowManualPlaceholder(false); setStage('choose'); setPhotoLoadFailed(false)` | — | 화면 떠날 때 stage 리셋 (현재 RN line 54~63 보존 + stage/photoLoadFailed 추가) |

### 6-1. Animations

| 요소 | 타입 | 시간 | 사양 |
|---|---|---|---|
| Stage 전환 (choose ↔ simulating ↔ recognized) | fade + slide | 200ms | Reanimated `withTiming(opacity, 200)`. 키스크린은 명시 없음 — RN UX 표준 |
| SimulatingView spinner | wm-pulse infinite | 1500ms cycle | scale 0.95↔1.05, opacity 0.4↔1, easeInOut (§3-3) |
| Pressable press | scale | 100ms ease-out | components.md §4 "transform 100ms" |
| FileNotFoundHint 등장 | fade in | 200ms | photoLoadFailed true 직후 |
| Toast 등장 (errorMsg 변경 시) | slide up + fade | 250ms | Toast 컴포넌트 표준 |
| BlurView 등장 (deviation 유지 시) | opacity | 200ms | RN BlurView 기본 |

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | hint |
|---|---|---|---|
| Header CloseButton | `button` | `t('common.close')` | hint: stage===choose → t('capture.a11y.exit') (신규 키), 그 외 → t('capture.a11y.backToChoose') |
| OptionCard (각 4개) | `button` | `${title} — ${sub}` (예: "라벨 스캔 — AI가 자동 인식해요") | hint: scan → "카메라 활성화", gallery → "갤러리 열기", cellar → "셀러로 이동", note → "노트 작성으로 이동" |
| PreviewFrame (SimulatingView) | `none` (aria-hidden) | — | 키스크린 `aria-hidden` verbatim |
| SimulatingMessage | (자동) | (자동) — 본문 텍스트 | `accessibilityLiveRegion="polite"` 권장 (RN Android) — 진행 알림 |
| AIBadgeBanner | `header` (Sparkles 장식 + 안내 텍스트) | `${title}. ${subtitle}` | — |
| WineNameDisplay (RecognizedCard) | (자동) | wine 이름 | — |
| MetaRow (5개) | (자동) | `${label}: ${value}` | — |
| ConfirmNote | `button` | `t('capture.recognized.confirmNote')` | hint: t('capture.a11y.confirmNoteHint') — "노트 작성 화면으로 이동" |
| ConfirmCellar | `button` | `t('capture.recognized.confirmCellar')` | hint: t('capture.a11y.confirmCellarHint') — "셀러에 보관" |
| RetryButton | `button` | `t('capture.recognized.retry')` | hint: "옵션 선택 화면으로 돌아가기" |
| EditButton | `button` | `t('capture.recognized.edit')` | hint: "수동으로 정보 수정" |
| PermissionFallback grant | `button` | `t('capture.permission.grant')` | — |
| PermissionFallback openSettings | `button` | `t('capture.permission.openSettings')` | — |
| live-camera shutter | `button` | `t('capture.options.camera')` | hint: "라벨 촬영" |
| live-camera 옵션 (gallery/manual/cancel) | `button` | `t('capture.options.{gallery|manual|cancel}')` | |

**Focus order** (TalkBack/VoiceOver):
1. Header close X
2. Header title (정보)
3. OptionCard 1 (scan)
4. OptionCard 2 (gallery)
5. OptionCard 3 (cellar)
6. OptionCard 4 (note)

stage 'recognized' 시:
1. Header close X (back to choose)
2. AIBadgeBanner (정보 — 자동 알림 권장)
3. RecognizedCard photo (aria-hidden 또는 wine name)
4. RecognizedCard wine name
5. MetaRow 1~5 (순차)
6. (조건부) FileNotFoundHint
7. ConfirmNote
8. ConfirmCellar
9. Retry
10. Edit

**Reduced motion**: `useReducedMotion` (Reanimated) true 시 wm-pulse 애니메이션 정지 (icon 정적 표시).

---

## 8. i18n 키 매핑 (ko/en)

키스크린 `capture.*` 네임스페이스 verbatim 흡수 + RN 추가 키.

### 8-1. 기존 RN 키 (보존 — `src/lib/i18n/{ko,en}.json`)

| key | ko | en | 사용처 |
|---|---|---|---|
| `capture.title` | 라벨 촬영 | Scan label | header title. **키스크린은 "와인 추가" / "Add a wine"** — 표현 차이! 사양은 키스크린 verbatim 우선 → **수정 필요**: ko="와인 추가", en="Add a wine" |
| `capture.options.camera` | 카메라 | Camera | live-camera 셔터 a11y |
| `capture.options.gallery` | 갤러리 | Gallery | live-camera 갤러리 옵션 a11y |
| `capture.options.manual` | 직접 입력 | Manual | live-camera manual 옵션 a11y |
| `capture.options.cancel` | 닫기 | Close | live-camera cancel 옵션 a11y |
| `capture.permission.*` | (동일) | (동일) | PermissionFallback |
| `capture.analyzing` | 라벨 분석 중... | Analyzing label... | ProcessingOverlay (deviation 유지 시) — SimulatingView 도입 시 `simulating.{scan,gallery}` 사용 권장 |
| `capture.manualPlaceholder.*` | (동일) | (동일) | ManualPlaceholderModal |
| `capture.result.*` | (동일) | (동일) | 현재 LabelScanResultModal — **사양은 RecognizedView 도입으로 deprecate 또는 modal에서 RecognizedView 적용** |
| `capture.errors.*` | (동일) | (동일) | 에러 Toast |

### 8-2. 신규 추가 키 (키스크린 verbatim 흡수)

| key | ko | en |
|---|---|---|
| `capture.title` | **와인 추가** (변경) | **Add a wine** (변경) |
| `capture.scan.title` | 라벨 스캔 | Scan a label |
| `capture.scan.sub` | AI가 자동 인식해요 | AI auto-recognition |
| `capture.gallery.title` | 갤러리에서 선택 | Pick from gallery |
| `capture.gallery.sub` | 기존 사진으로 인식해요 | Recognize from existing photo |
| `capture.cellar.title` | 셀러에 보관 | Store in cellar |
| `capture.cellar.sub` | 오늘 마실 게 아니면 보관 | Save for later |
| `capture.note.title` | 테이스팅 노트 작성 | Write a tasting note |
| `capture.note.sub` | 지금 마시는 와인 기록 | Record what you're drinking now |
| `capture.simulating.scan` | 라벨을 분석 중… | Analyzing label… |
| `capture.simulating.gallery` | 사진을 분석 중… | Analyzing photo… |
| `capture.recognized.title` | 이 와인이 맞나요? | Is this the right wine? |
| `capture.recognized.subtitle` | AI가 라벨에서 추출한 정보입니다 | Extracted from label by AI |
| `capture.recognized.producer` | 생산자 | Producer |
| `capture.recognized.vintage` | 빈티지 | Vintage |
| `capture.recognized.region` | 지역 | Region |
| `capture.recognized.appellation` | 아펠라시옹 | Appellation |
| `capture.recognized.grape` | 품종 | Grape |
| `capture.recognized.drinkWindow` | 음용 적기 | Drinking window |
| `capture.recognized.confirmNote` | 맞아요 — 노트 작성 | Yes — write a note |
| `capture.recognized.confirmCellar` | 셀러에 보관 | Store in cellar |
| `capture.recognized.retry` | 다시 | Retry |
| `capture.recognized.edit` | 직접 수정 | Edit manually |
| `capture.fileNotFound.title` | 사진을 가져오지 못했어요 | Could not load the photo |
| `capture.fileNotFound.body` | 다시 촬영하거나 갤러리에서 선택해주세요 | Please retake or pick from gallery |
| `capture.fileNotFound.hint` | (시안 모드에서는 인식만 진행됩니다) | (Recognition proceeds even without a photo) |

> 키스크린 `fileNotFound`는 시안 demo용 ("샘플 사진이 없어요 / public/sample-labels/...") 문구. **RN은 실제 user 사진 path를 다루므로 위 ko/en으로 일반화** — design-reviewer 승인 후 채택.

### 8-3. 접근성 hint 키 (신규)

| key | ko | en |
|---|---|---|
| `capture.a11y.exit` | 캡처 화면 닫기 | Close capture screen |
| `capture.a11y.backToChoose` | 옵션 선택으로 돌아가기 | Back to options |
| `capture.a11y.confirmNoteHint` | 노트 작성 화면으로 이동 | Open note writing screen |
| `capture.a11y.confirmCellarHint` | 와인을 셀러에 추가 | Add wine to cellar |

### 8-4. Toast 메시지 (기존 + 신규)

| key | ko | en |
|---|---|---|
| `capture.toast.cellarAdded` (신규) | 셀러에 추가됨 | Added to cellar |
| `capture.toast.favoriteAdded` (기존, common) | (참조) | (참조) |

---

## 9. P0 토큰 확장 요청 (infra-architect 처리)

`src/lib/design-tokens.ts` + `tailwind.config.ts` + `src/components/shared/primary-button.tsx` 동시 수정.

### 9-1. design-tokens.ts 추가

```ts
// ---- Spacing 추가 ----
// (기존 spacing object에 추가)
'0.75': 3,   // capture MetaRow mb
'26': 104,   // capture OptionCard height

// ---- Radius 추가 ----
'10': 10,    // capture SecondaryButton radius

// ---- Color 추가 ----
export const capture = {
  bottlePhotoEnd: '#1a0a0e',  // colors.md §6-3 verbatim — wine-detail bottleGradientEnd '#1a0a1e' 와 다른 값
  fileNotFoundBg: {
    dark:  'rgba(74, 61, 86, 0.2)',
    light: 'rgba(160, 140, 110, 0.12)',  // 추정 — design-reviewer 검증
  },
} as const;

// ---- Gradient factory 추가 ----
export function captureBottlePhotoGradient(bottleColor: string) {
  return {
    colors: [bottleColor, capture.bottlePhotoEnd] as readonly string[],
    start: { x: 0.5, y: 0 },
    end:   { x: 0.5, y: 1 },
  };
}

// ---- Typography 추가 ----
captureHeaderTitle:  { family: 'Inter_600SemiBold',          size: 17, lineHeight: 20.4 },
optionCardTitle:     { family: 'PlayfairDisplay_400Regular', size: 18, lineHeight: 21.6 },
optionCardSub:       { family: 'Inter_400Regular',           size: 12, lineHeight: 16.8 },
simulatingMessage:   { family: 'Inter_400Regular',           size: 14, lineHeight: 19.6 },
aiBadgeTitle:        { family: 'Inter_600SemiBold',          size: 13, lineHeight: 15.6 },
aiBadgeSubtitle:     { family: 'Inter_400Regular',           size: 11, lineHeight: 13.2 },
recognizedName:      { family: 'PlayfairDisplay_400Regular', size: 17, lineHeight: 21.25 },
metaRowLabel:        { family: 'Inter_400Regular',           size: 11, lineHeight: 15.4 },
metaRowValue:        { family: 'Inter_400Regular',           size: 11, lineHeight: 15.4 },
fileNotFoundTitle:   { family: 'Inter_700Bold',              size: 11, lineHeight: 16.5 },
fileNotFoundBody:    { family: 'Inter_400Regular',           size: 11, lineHeight: 16.5 },
```

### 9-2. tailwind.config.ts 동기화

```ts
spacing: {
  ...defaultSpacing,
  '0.75': '3px',
  '26':   '104px',
},
borderRadius: {
  ...,
  '10': '10px',
},
colors: {
  ...,
  // (기존 color 토큰 외 capture 전용은 design-tokens.ts에 두고 NW className 직접 표현은 inline style 또는 withAlpha 헬퍼)
},
```

### 9-3. PrimaryButton variant 확장

```tsx
// variant 추가: 'cellar' (transparent + gold border + gold text)
// components.md §2-1 4 variant 외 5번째.
// 대안: 기존 'secondary' variant + custom prop으로 색 override. 호환성은 design-reviewer 판단.
```

### 9-4. Reanimated wm-pulse 헬퍼

`src/lib/animations/wm-pulse.ts` — keyscreen `@keyframes wm-pulse` verbatim.

```ts
import { useEffect } from 'react';
import { useReducedMotion, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

export function useWmPulse() {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduce) return;
    scale.value = withRepeat(withTiming(1.05, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true);
    opacity.value = withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduce]);
  return { scale, opacity };
}
```

---

## 10. RN deviation 사유

### 10-1. 큰 deviation — 카메라 라이브뷰 추가 stage

**키스크린**: choose → simulating → recognized (3 stage, 모두 정적 mock).
**RN v0.1.0**: choose → live-camera → simulating → recognized (4 stage, 실제 카메라 통합).

**사유**: v0.1.0 목표는 실제 카메라/갤러리 호출 + label-scan Edge Function 통합. 키스크린은 mock이라 실제 카메라 UX 없음. choose stage는 키스크린 시각 위계 보존, live-camera는 RN 전용 추가.

**구체 영향**:
- choose stage에서 scan OptionCard tap → 즉시 `setStage('live-camera')` (단순화 옵션: choose 생략하고 즉시 live-camera 진입 — 현재 RN 구현. 키스크린 시각 흐름 보존 위해 choose stage 도입 권장)
- live-camera는 `<CameraView/>` fullscreen + 상단 X + 하단 옵션 row (현재 RN 보존)
- shutter tap → simulating (SimulatingView §3-3) → recognized

### 10-2. ProcessingOverlay 통일 권장

**키스크린 SimulatingView** (240×320 PreviewFrame + Sparkles + i18n message) vs **현재 RN BlurView + ActivityIndicator**.

**사유**: 키스크린 시각 위계 우선. BlurView는 카메라 라이브뷰 위에 띄울 때만 유용 — choose/recognized stage에서는 SimulatingView 도입.

**대안**: 양쪽 모두 유지 (live-camera 위에는 BlurView, choose/recognized 사이에는 SimulatingView).

→ design-reviewer 판단.

### 10-3. PrimaryButton size lg와 키스크린 14px button

**키스크린 ConfirmNote/ConfirmCellar**: padding 14_20 / Inter 14px 600.
**우리 PrimaryButton lg**: padding 14_20 / Inter 15px 600 (typography.primaryButtonLg).

**deviation**: 1px font-size. PrimaryButton lg 그대로 사용 권장 (디자인 일관성 우선) 또는 신규 size `xl` 추가.

### 10-4. PhotoFrame gradient `#1a0a0e` (캡처 전용)

colors.md §6-3에 "캡처 씬 하단 `#1a0a0e`" 명시. wine-detail의 `#1a0a1e`와 다름. 신규 토큰 `capture.bottlePhotoEnd` 필요 (§9-1).

### 10-5. BottomNav 가시성

키스크린: `/capture`는 BottomNav 숨김 (components.md §8 verbatim).
현재 RN: `(tabs)/capture.tsx`는 `(tabs)` 그룹 안 → 자동 표시.

**사유**: 키스크린 시각 위계 + UX 흐름(전체화면 카메라) 우선. RN expo-router `(tabs)/_layout.tsx`에서 `tabBarStyle: { display: 'none' }` 옵션을 capture 라우트에 적용 권장.

대안 1: capture를 `(tabs)` 밖으로 이동 (`app/capture.tsx`) → BottomNav 자동 hide.
대안 2: `tabBarStyle` 옵션 적용 — 현재 위치 유지.

→ rn-screen-builder + infra 합의.

### 10-6. wm-pulse animation

CSS `@keyframes` → Reanimated `useSharedValue + withRepeat + withTiming` (§9-4).

### 10-7. linear-gradient (PhotoFrame)

CSS `linear-gradient(180deg, A 0%, B 100%)` → `expo-linear-gradient <LinearGradient colors={[A,B]} start={{x:0.5,y:0}} end={{x:0.5,y:1}}/>`.

### 10-8. backdrop-blur 부재

키스크린 ProcessingOverlay 시각엔 BlurView 같은 효과 없음 (단순 검은 PreviewFrame). 현재 RN BlurView intensity=80은 §10-2 통일 권장에 의해 SimulatingView 도입 시 제거 가능.

### 10-9. CSS `inset: 32`

NW v4 `inset-8` (spacing 8=32 ✓) 지원. RN style `{ position: 'absolute', top: 32, right: 32, bottom: 32, left: 32 }` 동등.

### 10-10. `display: grid`

RN 미지원 → flexbox row+wrap + 33.33% width + aspectRatio. SimulatingView gallery 9-cell 그리드.

### 10-11. `<img onError>`

RN `<Image onError>` 동등. resizeMode='cover' = objectFit cover.

### 10-12. `cursor: pointer; all: unset`

RN Pressable 기본. 모든 키스크린 button 변환.

---

## 11. Edge Function (label-scan) 호출 흐름 — 시각 상태 분기

```
[choose stage]
  scan tap
    ↓ stage='live-camera'
[live-camera stage]
  shutter tap
    ↓ Haptics.impactAsync(Medium)
    ↓ setBusy('capturing'); cameraRef.takePictureAsync()
    ↓ photo.uri 획득
    ↓ stage='simulating' OR busy='uploading' (deviation §10-2 선택)
[uploading]
    ↓ Storage.upload(label-photos/{uid}/{shortId}.jpg)
    ↓ getPublicUrl
    ↓ busy='scanning'
[scanning]
    ↓ scanLabel({ photo_url }) → Edge Function 호출
    ↓ 성공: { lwin, confidence }
    ↓ wines_localized.select(...).eq('lwin', scan.lwin).maybeSingle()
    ↓ 성공: setRecognized({ ...wine }); stage='recognized'
[recognized stage]
  → RecognizedView 렌더 (§3-4~3-8)
  → ConfirmNote / ConfirmCellar / Retry / Edit 분기

[error 분기]
  - upload 실패 → Toast(errors.uploadFailed) → stage='live-camera' (또는 'choose')
  - scan 실패  → Toast(errors.scanFailed) + switchToManual CTA → setShowManualPlaceholder(true)
  - wine 없음  → Toast(errors.wineNotFound) → stage='choose' (재시도 유도)
```

### 11-1. 사양에 미포함 (supabase-engineer 영역)

- label-scan adapter swap (mock vs Gemini vs on-device)
- Storage RLS 정책
- wines_localized VIEW security_invoker

본 사양은 호출 시점의 **시각 상태 매핑만** 정의. Edge Function 로직 자체는 supabase-engineer 영역.

---

## 12. 데이터 의존 항목

### 12-1. v0.1.0 가능

| 데이터 | 출처 | 사용처 |
|---|---|---|
| `wine.lwin` | `wines_localized` (Edge Function 응답) | RecognizedView routing |
| `wine.display_name` | `wines_localized` | WineNameDisplay |
| `wine.name_ko` | `wines_localized` (LEFT JOIN wine_korean_names) | WineNameDisplay 한글 우선 |
| `wine.producer_name` | `wines_localized` | Producer 텍스트 |
| `wine.bottle_color` | `wines_localized` | PhotoFrame gradient start |
| `wine.type_canonical` | `wines_localized` | bottle_color fallback |
| `wine.vintage` | `wines_localized` (또는 LWIN suffix parse) | MetaRow vintage |
| Storage label-photos URL | `supabase.storage.from('label-photos').getPublicUrl()` | PhotoFrame Image source |
| 카메라 권한 | `useCameraPermissions()` | PermissionFallback 분기 |
| 갤러리 권한 | `ImagePicker.requestMediaLibraryPermissionsAsync()` | OptionCard gallery tap |
| Haptics | `expo-haptics` | 모든 tap 피드백 |
| useColorScheme | `react-native` | dark/light 분기 |

### 12-2. v0.2.0 deferred

| 데이터 | 사유 |
|---|---|
| `wine.region.localized` (ko/en) | wines_localized VIEW에 region/country/appellation 한글 컬럼 부재. MetaRow region/appellation row 표시 위해 추후 wine_localizations 확장 필요 |
| `wine.grapes[]` (array, localized) | wines 테이블 grapes 컬럼 부재. 추후 wine_grapes join 테이블 또는 jsonb 컬럼 추가 |
| `wine.drinkWindow.{from, to}` | drink-window.ts 휴리스틱은 wine-detail 사양에서 client-side 계산. capture 시점에는 RecognizedView MetaRow에 표시 — v0.1.0은 fallback "N/A" 또는 row 숨김 |
| `addCellarItem({...})` 시 acquiredAt / storage / purchasePriceKrw | 키스크린은 mock context. RN은 cellar_items insert (RLS uid 자동) — 셀러 source picker 또는 default 'cellar' + acquiredAt=today |
| `fileNotFound` hint 키스크린 demo 문구 | RN은 실제 user 사진이라 일반화 — §8-2 수정 채택 |
| Edit 액션 (`?edit=1`) — 노트 작성에서 wine 메타 수정 UI | NoteWrite v0.1.0 sources picker → write form. wine 메타 직접 편집 UI는 v0.2.0 |
| `BottomNav` hide via tabBarStyle | rn-screen-builder + infra 합의 (§10-5) |

### 12-3. v0.1.0 fallback

- region 한글명 없으면 → display_name fallback 또는 row 숨김
- grapes 없으면 → row 숨김
- drinkWindow 없으면 → row 숨김 또는 "—" 표시
- bottle_color 없으면 → `bottleColorDefault[type_canonical]` (design-tokens.ts 기존) 또는 `bottleColorDefault.red`

---

## 13. 검증 체크리스트 (design-reviewer 6항목 + capture 특화)

### 13-1. design-review-gate 6항목

1. **요소 누락**: keyscreen JSX 5개 컴포넌트(ChooseView 4-card + SimulatingView + RecognizedView + MetaRow + SecondaryButton + FallbackLabel) 모두 RN에 매핑되었는가
2. **spacing 비율**: OptionCard padding 18 / height 104 / gap 16, AIBadgeBanner padding 10_14, RecognizedCard padding 16, PreviewFrame 240×320, PhotoFrame 90×130 verbatim
3. **gradient 방향·깊이**: PhotoFrame 180deg (위→아래), bottleColor → `#1a0a0e`. captureBottlePhotoGradient factory 사용
4. **corner radius**: OptionCard 16, RecognizedCard 16, AIBadgeBanner 12, PhotoFrame 8, PreviewFrame 20, SecondaryButton 10, ConfirmNote/ConfirmCellar 12, Camera guide rect 12
5. **typography 위계**: header 17 / OptionCard title 18 Playfair / OptionCard sub 12 / SimulatingMessage 14 / AIBadgeTitle 13 / AIBadgeSubtitle 11 / RecognizedName 17 Playfair / Producer 12 / MetaRow label·value 11 / Buttons 14 — verbatim
6. **color 사용**: gold/wineRed/cream/black brand 고정, dark/light surface·text·border 분기, withAlpha gold 0.08 / cream 0.04 / cream 0.22 / cream 0.06 / wine_purple_dark 0.2 등 alpha 정확

### 13-2. capture 특화

- [ ] live-camera fullscreen에서 X 닫기 → choose stage 복귀 (router.back() X)
- [ ] choose stage에서 X 닫기 → router.back() (이전 화면)
- [ ] OptionCard 4개 verbatim icon 색 + 위치 + 텍스트 (scan/gallery/cellar/note 순서)
- [ ] SimulatingView 두 variant (scan: 카메라 가이드 박스 + 중앙 spinner / gallery: 3×3 그리드 + 하단 spinner)
- [ ] wm-pulse animation 1500ms cycle, scale 0.95↔1.05, opacity 0.4↔1
- [ ] RecognizedView MetaRow 5개 순서 (vintage / region / appellation / grape / drinkWindow) verbatim
- [ ] FallbackLabel SVG 5 text element (producer / wineName line 1 / wineName line 2 / vintage / 라벨 stroke gold 0.5)
- [ ] FileNotFoundHint photoLoadFailed=true 시에만 표시
- [ ] PhotoFrame gradient `#1a0a0e` end (캡처 전용, wine-detail `#1a0a1e`와 다름)
- [ ] ConfirmCellar variant=cellar (transparent + gold border + gold text)
- [ ] SecondaryButton 2개 (Retry RotateCcw / Edit Pencil) flex 1 동일 크기
- [ ] dark/light 모두 검증 (특히 light에서 wine-red→gold remap, cream→text-ink remap)
- [ ] ko/en 모두 검증 (한쪽 누락 시 §4-4 위반)
- [ ] BottomNav hide (§10-5)
- [ ] 카메라/갤러리 권한 거부 fallback 동작
- [ ] label-scan 실패 시 switchToManual CTA + ManualPlaceholderModal 동작
- [ ] useFocusEffect cleanup: 떠날 때 stage 리셋

### 13-3. qa-inspector 검증

- [ ] grep: capture 화면 코드에 hardcoded hex 0건 (모두 design-tokens 또는 withAlpha)
- [ ] grep: capture 화면에 emoji 0건
- [ ] grep: capture 화면에 한국어 문자 0건 (i18n 키만)
- [ ] ko/en 키 양쪽 존재 검증 (§8 표 33 키 모두)
- [ ] LWIN 형식 검증 (recognized.lwin 7자리 + 4자리 vintage suffix)
- [ ] Storage path uid prefix 검증 (`label-photos/{uid}/...`)
- [ ] anonymous_display 사용 검증 (capture 화면은 사용자 UUID 노출 0건 — 본 화면은 user-facing UUID 없음 ✓)

---

## 14. 미해결 질문 / 리더 판단 필요

1. **stage='live-camera' 도입 여부** — 키스크린 시각 흐름(choose first) vs 현재 RN UX(즉시 카메라) 선택. 사양은 hybrid (choose stage 도입 + scan 옵션 탭 시 live-camera 전환) 권장. rn-screen-builder + design-reviewer 합의 필요.
2. **ProcessingOverlay 통일** — SimulatingView (키스크린 보존) vs BlurView (현재 RN) 또는 hybrid. §10-2.
3. **PrimaryButton variant `cellar` 추가 vs inline 작성** — 디자인 시스템 확장 vs 1회용. §9-3.
4. **`capture.title` ko 표현** — "라벨 촬영" (현재) vs "와인 추가" (키스크린 verbatim). 사양은 verbatim 우선 → "와인 추가" 권장.
5. **FileNotFoundHint 문구 일반화** — 키스크린 demo 문구 ("샘플 사진이 없어요") vs RN 일반화 ("사진을 가져오지 못했어요"). 사양은 RN 일반화 채택 권장 (§8-2).
6. **light 모드 PhotoFrame gradient end** — dark는 `#1a0a0e` verbatim. light는 `withAlpha(light.text.primary, 0.85)` 추정 — design-reviewer 검증.
7. **BottomNav hide 구현 방법** — tabBarStyle 옵션 vs 라우트 (tabs) 밖 이동. §10-5.
8. **wm-pulse Reanimated vs Animated API** — 둘 다 가능. Reanimated 권장 (현재 RN 의존성 이미 포함된 경우; 미포함 시 Animated 사용).
9. **OptionCard order verbatim 적용 여부** — 키스크린 verbatim은 scan/gallery/cellar/note. 현재 RN live-camera 옵션 row는 gallery/camera/manual/cancel — 다름. choose stage 도입 시 키스크린 4-card verbatim 적용 권장.

---

## 15. Cross-references

- Reference 사양: `_workspace/design-specs/home.md`, `_workspace/design-specs/wine-detail.md`
- 기존 design-tokens.ts: `src/lib/design-tokens.ts` (line 119~140 wineTypeDot/servingTempDefault, line 270~296 shadows, line 298~343 gradients 참조 패턴)
- 키스크린 design-system: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md`
- 키스크린 globals.css `@keyframes wm-pulse`: line 323~328 (page.tsx 인라인 `<style>`)
- RN 현재 구현: `app/(tabs)/capture.tsx` + `src/components/capture/label-scan-result-modal.tsx`
- label-scan Edge Function (호출만, 로직은 별도): `supabase/functions/label-scan/`
- BottomNav 라우트 가시성 정책: `../winemine-keyscreen/docs/design-system/components.md` §8
