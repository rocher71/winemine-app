# Design Review — /capture (1차 retroactive)

- 작성: design-reviewer (자동)
- 일시: 2026-05-20 20:50:32
- 대상 사양: `_workspace/design-specs/capture.md` (893 lines, design-spec-author 산출물)
- 대상 구현: `app/(tabs)/capture.tsx` (408 LOC) + `src/components/capture/label-scan-result-modal.tsx` (123 LOC)
- 키스크린 원본: `../winemine-keyscreen/src/app/capture/page.tsx` (589 lines, choose / simulating / recognized 3-stage)
- 스크린샷 reference: `_workspace/keyscreen-shots/capture.png` (choose stage, dark, ko)

---

## SCOPE 선언 (제외 처리)

본 리뷰는 **시각 품질 게이트** 단독. 다음은 FAIL 카운트에서 명시적으로 제외:

- Day 6 settings 3 sub + settings hub + `(tabs)/settings/_layout` + BottomNav tabs 구성
- label-scan Edge Function 자체 로직 (supabase-engineer 영역)
- AppHeader 재작성

또한 사양 §14 미해결 9건 중 후보 5개는 본 리뷰에서 SCOPE-IN 재판단:
- live-camera stage 추가 vs 현재 정적 frame 유지
- ProcessingOverlay 통일 (BlurView vs SimulatingView)
- PrimaryButton variant=cellar 신규 추가
- light 모드 PhotoFrame gradient end
- BottomNav hide 처리 방법

---

## 비교 사전 정리 — 키스크린 vs 현재 RN의 첫인상 갭

| 축 | 키스크린 (스크린샷 + JSX) | 현재 RN | 결과 |
|---|---|---|---|
| 진입 first paint | 정적 4-card OptionCard 리스트 (choose stage) + header(X + "와인 추가") | **fullscreen CameraView**, 상단 X 1개, 하단 4 소형 원형 옵션 버튼 | **stage 전체 누락** — choose stage가 없음 |
| 3-stage 머신 | choose → simulating → recognized | live-camera → BlurView+ActivityIndicator → LabelScanResultModal(slim) | **simulating, recognized stage 누락** |
| 헤더 | height 56, 좌 X(36) / 중앙 title 17px 600 / 우 36 spacer (3-slot) | bg-overlay 원형 X 1개 (우상단 한 쪽) — title 부재 | **title + 좌측 X + 균형 spacer 모두 누락** |
| Recognized 후 UI | RecognizedCard (PhotoFrame 90×130 gradient + MetaRow×5 + AIBadgeBanner + ConfirmNote + ConfirmCellar + Retry + Edit) | Modal: bg-bg-deep, 작은 64×96 색 사각형 + wine name + producer + vintage + 2 버튼 | **AIBadgeBanner, 5 MetaRow, FallbackLabel, gradient PhotoFrame, ConfirmCellar, Retry, Edit 누락** |
| Title 카피 | "와인 추가" / "Add a wine" | "라벨 촬영" / "Scan label" (사양 §8-1에 ko/en 명시 변경 요구) | **카피 verbatim 불일치** |

요약: 현재 RN은 v0.1.0 카메라 통합을 일찍 우선해 키스크린의 **시각 위계 (3-stage state machine + verbatim 4-card picker + RecognizedCard)** 를 거의 보존하지 않음. 사양 §10-1·§10-2·§10-3·§14-1~9에서 이미 큰 deviation이라 명시하고 hybrid 적용을 권고한 항목들이 그대로 미적용 상태.

---

## 6항목 체크리스트

### (a) 요소 누락

**판정: FAIL (8개 핵심 컴포넌트 누락)**

| # | 키스크린 컴포넌트 (사양 §2) | 현재 RN | 위치 |
|---|---|---|---|
| 1 | `CaptureHeader` — height 56, 3-slot(X / "와인 추가" / spacer 36) | **없음**. fullscreen CameraView 위 우상단에 원형 X 1개만 | `app/(tabs)/capture.tsx:243-258` |
| 2 | `ChooseView` 4-card OptionCard 리스트 (scan/gallery/cellar/note) | **없음**. choose stage 자체가 없음 | `app/(tabs)/capture.tsx` 전반 |
| 3 | `SimulatingView` — PreviewFrame 240×320 + Camera guide rect + wm-pulse Loader2 + Sparkles + 메시지 | **없음**. `BlurView intensity=80 + ActivityIndicator + Text("분석 중")`만 | `app/(tabs)/capture.tsx:308-320` |
| 4 | `SimulatingView gallery` variant — 3×3 그리드 (9 cell, i==4 emphasis, gold border) | **없음** | — |
| 5 | `RecognizedView` 의 `AIBadgeBanner` (Sparkles + "이 와인이 맞나요?" + subtitle) | **없음** | `label-scan-result-modal.tsx` 전반 |
| 6 | `RecognizedCard` 의 `PhotoFrame` 90×130 + LinearGradient (bottleColor → `#1a0a0e`) + `<Image>` + FallbackLabel SVG | **단순 64×96 단색 사각형** (gradient 없음, Image 없음, FallbackLabel SVG 없음) | `label-scan-result-modal.tsx:78-84` |
| 7 | `RecognizedCard` 의 `MetaRow × 5` (vintage / region / appellation / grape / drinkWindow, 각 label minWidth 48) | **vintage 1개만** (region/appellation/grape/drinkWindow 4개 누락) | `label-scan-result-modal.tsx:97-101` |
| 8 | `PrimaryActions` — `ConfirmNote (wine-red bg)` + `ConfirmCellar (transparent + gold border, 신규 variant)` | **ConfirmNote만 존재** (variant primary lg). ConfirmCellar 누락 | `label-scan-result-modal.tsx:106-117` |
| 9 | `SecondaryActions` — `Retry (RotateCcw)` + `Edit (Pencil)` flex row 2 동등 폭 | **Retry 1개만** (PrimaryButton secondary md). Edit 누락. RotateCcw 아이콘 없음 | `label-scan-result-modal.tsx:112-117` |
| 10 | `FileNotFoundHint` (photoLoadFailed=true 시 사진 미가용 안내) | **없음** | — |

증거 스크린샷: `_workspace/keyscreen-shots/capture.png` — 4-card OptionCard 정렬을 시각으로 확인. 현재 RN 시뮬레이터 캡처를 받아도 동일 stage 자체가 부재이므로 시각 비교 불가.

수정 방향:
- 사양 §3-2 `ChooseView` 4-card 전체 구현 (P0)
- 사양 §3-3 `SimulatingView` 두 variant (scan/gallery) 구현 (P0)
- 사양 §3-4~3-8 `RecognizedView` 전체 (AIBadgeBanner + RecognizedCard + PhotoFrame gradient + MetaRow×5 + ConfirmNote + ConfirmCellar + Retry + Edit + FileNotFoundHint) 구현 (P0)
- live-camera는 §3-2 scan OptionCard 탭 시에만 진입하는 **추가 stage**로 유지 (사양 §10-1 hybrid)

---

### (b) Spacing 비율

**판정: FAIL (검증 가능한 6항목 중 5개 부재 / 1개 일부 일치)**

| # | 키스크린 사양 | 현재 RN | 위치 |
|---|---|---|---|
| 1 | CaptureHeader: `height 56 / padding 0 16 / 3-slot space-between` | **부재** — fullscreen 카메라 위 absolute X 1개만 | `capture.tsx:243-258` |
| 2 | ScrollView contentContainerStyle: `padding 24 20, gap 14 col` | **부재** — ScrollView 자체 없음 | — |
| 3 | OptionCard: `height 104 / padding 18 / gap 16 row` (4개) | **부재** | — |
| 4 | OptionCard column gap: `12` (4 카드 사이) | **부재** | — |
| 5 | SimulatingView: `marginTop 40 / gap 24 / padding 40 20 / items-center`, PreviewFrame `240×320` | **부재**. 현재 단순 absolute overlay center | `capture.tsx:308-320` |
| 6 | RecognizedCard: `padding 16 / gap 14 col`, Photo+meta row `gap 14`, PhotoFrame `90×130`, MetaRow `gap 8 / mb 3 / label minWidth 48` | **부분 불일치** — Modal 카드 `p-4` (16 ✓), 안의 row `gap-4` (16 ❌ — 키스크린은 14), 박스 `64×96` (❌ — 키스크린은 90×130) | `label-scan-result-modal.tsx:76-103` |
| 7 | PrimaryActions column gap 10 | **부분 일치** — `mt-5 gap-3` (12) — 키스크린은 10. 1단계 비율 어긋남 | `label-scan-result-modal.tsx:105` |
| 8 | AIBadgeBanner padding `10 14` | **부재** (배너 자체 없음) | — |
| 9 | FileNotFoundHint padding `10` | **부재** | — |

핵심 비율: PhotoFrame `90×130` (aspect 0.692) → 현재 `64×96` (aspect 0.667) — 폭은 71%, 면적은 51% 축소. 시각적으로 너무 작음.

수정 방향:
- 사양 §3-1~3-8의 모든 spacing 값을 NW v4 className 또는 inline style로 verbatim 적용
- 신규 spacing 토큰: `0.75=3` (MetaRow mb), `26=104` (OptionCard height) — infra-architect P0
- ScrollView 도입 (현재는 fullscreen camera로 인해 스크롤 컨테이너 자체 부재)

---

### (c) Gradient 방향·깊이

**판정: FAIL (3개 사용처 모두 누락 또는 단색 fallback)**

| # | 키스크린 사양 | 현재 RN | 위치 |
|---|---|---|---|
| 1 | PhotoFrame 90×130: `linear-gradient(180deg, ${bottleColor} 0%, #1a0a0e 100%)` (위→아래, 병의 색에서 어두운 종점) | **단색 `backgroundColor: bottleColor`** (gradient 없음) — 종점 `#1a0a0e` 부재 | `label-scan-result-modal.tsx:78-84` |
| 2 | SimulatingView PreviewFrame: `bg #000` 단색 + 내부 camera guide rect overlay `2px gold opacity 0.6` | **PreviewFrame 자체 없음** | — |
| 3 | wm-pulse Loader2 (Reanimated scale+opacity 1.5s cycle) | **`<ActivityIndicator>` 무한 회전** (디자인 시스템 토큰 미사용) | `capture.tsx:315` |

`expo-linear-gradient`는 이미 `app.json`·기존 화면(home/wine-detail)에서 사용 중 — 의존성은 이미 있음. 회피 사유 없음.

수정 방향:
- 사양 §9-1 `captureBottlePhotoGradient(bottleColor)` factory 추가 (infra-architect P0)
- `<LinearGradient colors={[bottleColor, capture.bottlePhotoEnd]} start={{x:0.5,y:0}} end={{x:0.5,y:1}} style={StyleSheet.absoluteFill}/>` 적용
- light 모드 종점 결정 필요 → 본 리뷰 §SCOPE-IN 재판단 참조

---

### (d) Corner radius

**판정: FAIL (검증 가능한 8개 중 5개 누락 / 2개 불일치 / 1개 일치)**

| # | 키스크린 사양 | 현재 RN | 위치 |
|---|---|---|---|
| 1 | OptionCard radius `16` (`rounded-2xl`) | **부재** | — |
| 2 | RecognizedCard radius `16` (`rounded-2xl`) | **부분 일치** — Modal 내부 카드 `rounded-xl` (12) — 키스크린은 16. 1단계 부족 | `label-scan-result-modal.tsx:76` |
| 3 | AIBadgeBanner radius `12` (`rounded-xl`) | **부재** | — |
| 4 | PhotoFrame radius `8` (`rounded-lg`) | **불일치** — `borderRadius: 6` (`rounded-md`) — 키스크린은 8 | `label-scan-result-modal.tsx:82` |
| 5 | PreviewFrame radius `20` (`rounded-[20px]`) | **부재** | — |
| 6 | Camera guide rect radius `12` | **부재** | — |
| 7 | SecondaryButton (Retry/Edit) radius `10` | **부재** — Retry는 PrimaryButton secondary로 처리됨 | `label-scan-result-modal.tsx:113` |
| 8 | ConfirmNote / ConfirmCellar radius `12` | **부분** — PrimaryButton 기본 radius 사용 (xl=12로 알려진 값) — 확인 필요. ConfirmCellar 부재 | — |
| 9 | Modal sheet `rounded-t-md` (bottom sheet) | **유지** — bg-bg-deep `rounded-t-md` (6) | `label-scan-result-modal.tsx:58` |

수정 방향:
- 신규 radius 토큰 `radius.10 = 10` 추가 (사양 §9-1 / infra-architect P0)
- RecognizedCard `rounded-2xl` (16) 보정
- PhotoFrame `rounded-lg` (8) 보정

---

### (e) Typography 위계

**판정: FAIL (검증 가능한 12 typography 사용처 중 11 누락 / 1 적용)**

키스크린 사양 §3 typography 매핑표 verbatim vs 현재 RN:

| # | 키스크린 | 현재 RN | 위치 |
|---|---|---|---|
| 1 | CaptureHeader title `Inter 17 / 600 / cream` (신규 토큰 `captureHeaderTitle`) | **부재** (헤더 title 자체가 없음) | — |
| 2 | OptionCard title `Playfair 18 / cream` (신규 `optionCardTitle`) | **부재** | — |
| 3 | OptionCard sub `Inter 12 / 16.8 lh / text-muted` (신규 `optionCardSub`) | **부재** | — |
| 4 | SimulatingMessage `Inter 14 / 19.6 lh / cream` (신규 `simulatingMessage`) | **`cardBody` (Inter 13/19.5)** — 1px 작음 | `capture.tsx:316-318` |
| 5 | AIBadgeBanner title `Inter 13 / 600 / cream` (신규 `aiBadgeTitle`) | **부재** | — |
| 6 | AIBadgeBanner subtitle `Inter 11 / 13.2 lh / text-muted` (신규 `aiBadgeSubtitle`) | **부재** | — |
| 7 | RecognizedCard wine name `Playfair 17 / 21.25 lh / cream` (신규 `recognizedName`) | **`WineNameDisplay size="title"`** — 정확한 사이즈 확인 필요. size=title은 `cardTitle (Playfair 16)`일 가능성 → 1px 부족 | `label-scan-result-modal.tsx:86-91` |
| 8 | RecognizedCard producer `Inter 12 / 14.4 / text-secondary` | **`cardMeta` ✓** (Inter 12/14.4) — 정확 일치 | `label-scan-result-modal.tsx:93` |
| 9 | MetaRow label `Inter 11 / 15.4 / text-muted, minWidth 48` (신규 `metaRowLabel`) | **부재** (vintage row만 있고 label 텍스트도 없음 — 그냥 "1990" 숫자만 표시) | `label-scan-result-modal.tsx:97-101` |
| 10 | MetaRow value `Inter 11 / 15.4 / cream` (신규 `metaRowValue`) | **`cardMeta` (Inter 12/14.4) + `text-muted`** — 1px 큼, 색도 muted로 잘못 (key는 cream/text-primary) | `label-scan-result-modal.tsx:98` |
| 11 | ConfirmNote / ConfirmCellar button text `Inter 14 / 600 / cream/gold` (사양 §3-7) | **PrimaryButton size=lg → typography.primaryButtonLg (Inter 15/600)** — 1px 큼 (사양 §10-3 known deviation 묵인) | `label-scan-result-modal.tsx:106-111` |
| 12 | SecondaryButton (Retry/Edit) text `Inter 12 / cardMeta` | **PrimaryButton secondary md → typography.primaryButtonMd (Inter 14/600)** — 2px 큼, weight도 다름 | `label-scan-result-modal.tsx:112-117` |
| 13 | LabelScanResultModal title "AI 라벨 인식" `cardMeta uppercase gold` (RN 자체 추가) | **유지** — 사양에 없으나 현재 RN에 존재. 키스크린의 AIBadgeBanner와 역할 중복 — 사양 §3-4 도입 시 deprecate | `label-scan-result-modal.tsx:60-62` |

또한 **i18n 카피 위반** (사양 §8-1):
- `capture.title` ko 현재 "라벨 촬영" / en "Scan label" → 사양은 ko "와인 추가" / en "Add a wine" 권장 verbatim → **카피 누락**

수정 방향:
- 사양 §9-1 typography 11개 신규 토큰 추가 (infra-architect P0): captureHeaderTitle / optionCardTitle / optionCardSub / simulatingMessage / aiBadgeTitle / aiBadgeSubtitle / recognizedName / metaRowLabel / metaRowValue / fileNotFoundTitle / fileNotFoundBody
- `src/lib/i18n/ko.json`·`en.json`에 신규 키 30+개 추가 (사양 §8-2 / rn-screen-builder)
- `capture.title` ko/en 변경 (사양 §14-4 권고 채택)

---

### (f) Color 사용 (다크/라이트 양쪽)

**판정: FAIL (하드코딩 검출 + 신규 토큰 부재 + light 분기 누락)**

#### f-1. 하드코딩 hex/rgba 검출

| # | 위치 | 값 | 사유 |
|---|---|---|---|
| 1 | `capture.tsx:254` | `backgroundColor: 'rgba(0,0,0,0.45)'` | header X 원형 bg — 디자인 토큰 부재. **CLAUDE.md §4-9 위반 — 토큰화 필요** |
| 2 | `capture.tsx:325` | `backgroundColor: 'rgba(0,0,0,0.55)'` | manual placeholder backdrop — `glass.bg` (rgba(10,5,15,0.72))와 비슷하나 다른 값. **토큰화 필요** |
| 3 | `capture.tsx:372` | `backgroundColor: 'rgba(0,0,0,0.45)'` | OptionButton 원형 bg — 동 1번 중복 |
| 4 | `label-scan-result-modal.tsx:56` | `backgroundColor: 'rgba(0,0,0,0.55)'` | Modal backdrop — capture.tsx:325와 동일 패턴. **공통 modal backdrop 토큰 누락** |

총 4건 — 모두 modal/overlay 배경 rgba. 사양 §3-11에 "modal backdrop 표준화 후보"로 명시되어 있으나 토큰 부재.

#### f-2. light 모드 분기 누락

| # | 위치 | 현재 | 결과 |
|---|---|---|---|
| 1 | `capture.tsx:200` | `color={brand.gold}` (permission X 아이콘) | **light 모드에서도 동일 `#C9A84C` 사용** — 사양 §5-5는 light gold는 `#B89438` (border.active) — 분기 누락 |
| 2 | `capture.tsx:256` | `color={brand.cream}` (header X) | **light에서도 cream `#F5F0E8` 사용** — light bg 위 contrast 부족 가능 (FAF5EC에 cream 텍스트는 4.5:1 아래) | 
| 3 | `capture.tsx:315` | `color={brand.gold}` (ActivityIndicator) | 동 1번 — light에서 gold 다름 |
| 4 | `capture.tsx:375` | `color={brand.cream}` (OptionButton icon) | 동 2번 |
| 5 | `capture.tsx:402-404` | `borderColor: brand.cream` + `color={brand.cream}` (CaptureButton ring) | 동 2번 |
| 6 | `label-scan-result-modal.tsx:60` | `text-gold` className (AI 라벨 인식 label) | **light에서 `gold` className은 tailwind.config.ts 어디 정의되어 있는지 확인 필요** — `brand.gold` 직접 사용이면 light 부적합 |
| 7 | `label-scan-result-modal.tsx:78-84` | `backgroundColor: bottleColor` (병 사각형) | **light 모드는 종점 처리 부재** — 사양 §5-5는 light는 `light.bg.deepest` 또는 `withAlpha(light.text.primary, 0.85)` 권고 |

#### f-3. 키스크린 의도 색 누락

| # | 키스크린 의도 | 현재 RN | 위치 |
|---|---|---|---|
| 1 | scan OptionCard icon `brand.wineRed` | **부재** (icon 자체 없음) | — |
| 2 | gallery OptionCard icon `brand.gold` | **부재** | — |
| 3 | cellar OptionCard icon `brand.cream` (dark) / `light.text.primary` (light) | **부재** | — |
| 4 | note OptionCard icon `dark.text.secondary` / `light.text.secondary` | **부재** | — |
| 5 | AIBadgeBanner bg `withAlpha(brand.gold, 0.08)` + border `brand.gold` | **부재** | — |
| 6 | FileNotFoundHint bg `rgba(74,61,86,0.2)` (dark) — 신규 `fileNotFoundBg` 토큰 | **부재** | — |
| 7 | Camera guide rect border `brand.gold opacity 0.6` | **부재** | — |
| 8 | Gallery grid cell bg `withAlpha(brand.cream, 0.04)` / emphasis 0.22 / border 0.06 | **부재** | — |

수정 방향:
- 신규 토큰 `capture.bottlePhotoEnd = '#1a0a0e'` (P0)
- 신규 토큰 `capture.fileNotFoundBg = { dark, light }` (P0)
- 신규 토큰 `overlay.bgScrim = { dark: 'rgba(0,0,0,0.55)', light: 'rgba(42,26,20,0.4)' }` — modal backdrop 표준화 (제안 — infra-architect 판단)
- `gold` className의 light 모드 dual definition 검증 + 필요 시 `useColorScheme` 분기로 수정
- OptionCard 4개 icon 색을 키스크린 verbatim 매핑 (4종 다른 색)

---

## 다크/라이트 양쪽 모드 검증

| 모드 | 키스크린 reference | 현재 RN 상태 | 결과 |
|---|---|---|---|
| dark | `_workspace/keyscreen-shots/capture.png` (제공됨) | choose stage 자체 부재 — 비교 불가 | **FAIL** |
| light | (스크린샷 미제공) | light 분기 7건 누락 (f-2 참조) — light 모드 실행 시 cream-on-light 대비 부족 우려 | **FAIL** |

CLAUDE.md §4-9 ("테마 변경 시 양쪽 모드 검증 필수") 위반 — light 모드 토큰 분기 다수 누락.

---

## 스크린샷 비교 (멀티모달)

- `_workspace/keyscreen-shots/capture.png` (Read 이미지 로드 완료, choose stage / dark / ko)
- 키스크린 시각 핵심:
  1. 4-card 정렬 (각 카드 height ~104, gap 12, 좌측 32px icon + 우측 텍스트 2줄)
  2. 카드 bg `#3D2A4A` (dark surface), border `#5A3D6A` (1px), radius 16
  3. icon 색이 4종 다름 — 라벨 스캔(붉음/wine-red), 갤러리(금/gold), 셀러(크림), 노트(text-secondary muted)
  4. 헤더: 좌 X (cream 22px stroke 1.75) / 중앙 "와인 추가" (Inter 17 600 cream) / 우 36px spacer
  5. 좌하단 동그란 N 표시 (Next.js dev affordance — 무시)

현재 RN은 이 스크린샷과 시각적으로 **완전히 다른 화면**을 렌더링 (fullscreen camera). 의미적 갭이 매우 크므로 동일 시점 스크린샷 비교가 무의미 — 사양에 따라 choose stage를 신규 구현해야 비교 가능.

---

## SCOPE-IN 5건 재판단

### S1. live-camera stage 추가 vs 현재 정적 frame 유지

**판단: 사양 §10-1 hybrid 권고 채택 — choose stage 우선 도입**

근거:
- 키스크린 시각 위계의 핵심은 4-card OptionCard picker — 이걸 보존해야 디자인 리뷰 통과
- 현재 RN은 카메라 즉시 진입으로 키스크린 시각을 0% 보존
- hybrid: choose stage 첫 진입 → scan OptionCard tap 시에만 live-camera stage 진입 → shutter → simulating → recognized
- live-camera 자체는 RN 전용 유지 가능 (사양 §2-1 명시)

요청: rn-screen-builder는 `stage` state machine 도입 (choose / live-camera / simulating / recognized / permissionFallback / manualPlaceholder 6 stage)

### S2. ProcessingOverlay 통일 (BlurView vs SimulatingView)

**판단: 사양 §10-2 통일 권고 채택 — SimulatingView로 전환 (BlurView 부분 유지)**

근거:
- 키스크린 SimulatingView는 PreviewFrame 240×320 + wm-pulse Loader2 + Sparkles + i18n 메시지 = 와인앱 브랜드 시각 위계
- 현재 RN BlurView+ActivityIndicator는 일반 iOS modal 패턴, winemine 브랜드 위계 없음
- hybrid: live-camera stage 위에서 분석 중에는 SimulatingView fullscreen overlay (`stage === 'simulating'`로 전환). BlurView는 live-camera 라이브뷰 위에 띄울 때만 가능하나, simulating stage 자체에서는 PreviewFrame이 더 적절 → BlurView 제거 가능

요청: rn-screen-builder는 simulating stage 도입 후 BlurView 코드 제거 또는 SimulatingView 컴포넌트로 대체

### S3. PrimaryButton variant=cellar 신규 추가

**판단: variant 추가 채택 — 디자인 시스템 확장 우선**

근거:
- ConfirmCellar (`transparent bg + gold border + gold text + radius 12 + Inter 14 600`) 는 capture 전용이 아닌 와인 전반에 재사용 가능한 visual pattern (cellar에 보관/저장하는 secondary CTA)
- 1회용 inline Pressable로 작성하면 다른 화면에서 동일 패턴 재발생 시 또 재작성 → 디자인 토큰 부족 → 하드코딩 재발 위험
- 사양 §9-3 권고 채택: `variant: 'cellar'` 추가 — `bg-transparent`, `border-gold` (dark) / `border-border-active` (light), text `text-gold` 분기

요청: infra-architect는 `src/components/shared/primary-button.tsx` variant union에 'cellar' 추가 (P0)

### S4. light 모드 PhotoFrame gradient end

**판단: light 종점은 `withAlpha(light.text.primary, 0.85)` 채택 — 사양 §5-5 추정값 검증 통과**

근거:
- dark 종점 `#1a0a0e`는 거의 검정에 가까운 매우 어두운 자주색 — light 모드에서 그대로 쓰면 흰 카드 위에 검은 종점이 부조화
- light 모드 등가는 light 본문 텍스트 색 (`#2A1A14` = brand.textInk와 거의 동일) 의 0.85 alpha = 흰 surface 위 자연스러운 그라데이션 종점
- 대안: `bottleColor` (병의 색)을 직접 종점으로도 두는 단색 (light 모드 한정) — 사양과 reviewer 합의 후 확정 가능. 본 리뷰는 §5-5 추정 채택

요청: infra-architect는 `capture.bottlePhotoEnd = { dark: '#1a0a0e', light: withAlpha(light.text.primary, 0.85) }` 형태로 dual definition (P0)

### S5. BottomNav hide 처리 방법

**판단: 대안 2 (tabBarStyle) 채택 — `(tabs)/_layout.tsx`에 capture 라우트에 `tabBarStyle: { display: 'none' }` 적용**

근거:
- 대안 1 (capture를 `(tabs)` 밖으로 이동)은 라우팅·딥링크·home QuickActions 등 기존 진입점 모두 변경 필요 → side effect 큼
- 대안 2 (tabBarStyle)은 expo-router 표준 옵션, 1줄 수정으로 끝 — 영향 범위 최소
- 다만 본 리뷰는 시각 게이트 — BottomNav 가시성 자체는 §SCOPE-OUT의 "BottomNav tabs 구성" 일부로도 볼 수 있어 우선순위는 P1 (P0 토큰·choose stage 다음)

요청: rn-screen-builder는 `app/(tabs)/_layout.tsx`의 capture screen 옵션에 `tabBarStyle: { display: 'none' }` 추가. design-reviewer 재검증 시 확인.

---

## 최종 결정

### 결과: **FAIL**

6항목 모두 FAIL. SCOPE-IN 5건 모두 사양 권고대로 적용 권장 (S1/S2/S3/S4/S5 모두 채택).

### FAIL 항목 수: **6 / 6**
(SCOPE-OUT 항목은 제외 처리 — Day 6 settings, label-scan Edge Function 로직, AppHeader 재작성은 본 리뷰 미적용)

### 라우팅 (Action items)

**P0 — infra-architect (토큰 확장, 단일 세션)**:
- `src/lib/design-tokens.ts`:
  - spacing 추가: `0.75=3`, `26=104`
  - radius 추가: `10`
  - color 추가: `capture.bottlePhotoEnd = { dark: '#1a0a0e', light: withAlpha(light.text.primary, 0.85) }`, `capture.fileNotFoundBg = { dark, light }`
  - gradient factory 추가: `captureBottlePhotoGradient(bottleColor)` (180deg)
  - typography 11개 추가: captureHeaderTitle / optionCardTitle / optionCardSub / simulatingMessage / aiBadgeTitle / aiBadgeSubtitle / recognizedName / metaRowLabel / metaRowValue / fileNotFoundTitle / fileNotFoundBody
- `tailwind.config.ts` 동기화 (spacing.0.75, spacing.26, borderRadius.10)
- `src/components/shared/primary-button.tsx` — variant 'cellar' 추가
- `src/lib/animations/wm-pulse.ts` 신규 — useWmPulse() hook (Reanimated scale 0.95↔1.05, opacity 0.4↔1, 750ms half-cycle, withRepeat reverse)
- (옵션) modal backdrop 표준화 토큰 `overlay.bgScrim` 제안 — reviewer 합의 시 추가

**P0 — rn-screen-builder (사양 §3 전체 재구현)**:
- 사양 §3-1~3-8 전체 컴포넌트 구현 — choose/simulating/recognized 3-stage 머신
- 사양 §3-9~3-11 RN 전용 stage (permissionFallback/processingOverlay/manualPlaceholderModal) 보존 + ProcessingOverlay는 SimulatingView로 통일
- 사양 §10-1 hybrid: choose first + scan OptionCard tap → live-camera stage 추가
- `(tabs)/_layout.tsx` capture 라우트 `tabBarStyle: { display: 'none' }` 적용 (P1)
- `src/components/capture/label-scan-result-modal.tsx` 는 RecognizedView 인라인 또는 컴포넌트로 대체 후 deprecate
- 다크/라이트 양쪽 모드 모두 빌드해 시뮬레이터에서 확인 후 design-reviewer 재요청

**P0 — design-spec-author (검증)**:
- 사양 §14 미해결 9건 중 S1~S5 5건은 본 리뷰에서 결정 — 사양에 결정사항 반영 권장 (선택)
- 사양 §14-6 light 모드 PhotoFrame gradient end는 본 리뷰 S4에서 추정값 채택 — 사양에 정식 명시 권장

**P1 — i18n keys**:
- `src/lib/i18n/{ko,en}.json` 에 사양 §8-2 신규 키 30+개 추가
- `capture.title` ko/en 변경 ("와인 추가" / "Add a wine")
- 사양 §8-3 a11y hint 키 4개 추가

**P1 — qa-inspector (시각 PASS 후)**:
- 본 리뷰 통과 후 qa-inspector가 §13-3 텍스트 기반 검증 (hex grep, emoji grep, ko/en key 누락 grep, LWIN 형식 검증, Storage uid prefix 검증)

### 재검증 시점

rn-screen-builder + infra-architect P0 완료 후 design-reviewer 재요청 → 동일 6항목 + SCOPE-IN 5건 PASS/FAIL 재판정.

3회 연속 FAIL 시 (현재 1차) 리더에게 escalate.

---

## Cross-references

- 사양: `_workspace/design-specs/capture.md` (특히 §2 Layout Tree / §3 NW 매핑표 / §9 P0 토큰 / §10 deviation / §13 체크리스트 / §14 미해결 9건)
- 키스크린 원본: `../winemine-keyscreen/src/app/capture/page.tsx` (line 113~123 헤더 / line 154~163 OptionCard / line 308~321 SimulatingView message / line 407 PhotoFrame gradient / line 426~437 wine name / line 441~445 MetaRow×5)
- 키스크린 design system: `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md` (§6-3 캡처 씬 종점 / §2-1 PrimaryButton variants / §8 BottomNav 라우트 정책)
- 현재 RN: `app/(tabs)/capture.tsx` + `src/components/capture/label-scan-result-modal.tsx`
- 토큰: `src/lib/design-tokens.ts` (현재 365 lines — capture 신규 추가 후 ~410 lines 예상)
- 이전 design-review 사례: `_workspace/design-review_home_20260520_*.md`, `_workspace/design-review_wine-detail_20260520_*.md` (동일 6항목 체크리스트 패턴)
