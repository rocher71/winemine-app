# /onboarding/1-welcome 디자인 사양

> **버전:** v1 (retroactive hardening — Day 5 기존 구현 36 LOC 갭 보강)
> **작성:** design-spec-author / Day 6
> **소비자:** rn-screen-builder (다음 게이트), design-reviewer (시각 검증)

---

## 0. 원본 소스

| 우선순위 | 자료 | 경로 |
|---|---|---|
| 1 | JSX `StepWelcome` (재귀) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 97–169 |
| 1 | JSX root `<main>` wrapper | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 47–93 |
| 2 | 산문 | (없음 — `pages/onboarding.md` 부재) |
| 3 | 디자인 시스템 | `../winemine-keyscreen/docs/design-system/{colors,typography}.md` |
| 3 | 키스크린 i18n | `../winemine-keyscreen/messages/{ko,en}.json` 의 `onboarding.{tagline,getStarted}` |
| 4 | 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` (1600×2560, welcome step 노출) |
| 5 | 현재 RN 구현 | `app/onboarding/1-welcome.tsx` (36 LOC) / `app/onboarding/_layout.tsx` (13 LOC) |
| 5 | 인접 화면 표준 | `_workspace/design-specs/{home,capture}.md`, `src/lib/design-tokens.ts` |

**범위 외:**
- AppHeader, BottomNav (StepWelcome 단계에서 미사용)
- 다른 step (2-language, 3-experience, 4-mode) — 각자 별도 사양

---

## 1. 레이아웃 트리 (verbatim, 시각 위계 1:1)

```
SafeAreaView (edges: ['top', 'bottom']) ─ flex:1, bg = dark.bg.deepest / light.bg.deepest
└─ View "PageRoot"     ─ flex:1, paddingTop:32, paddingBottom:40, paddingHorizontal:24, gap:24
   │                     (키스크린 `main` style — line 49~57 verbatim)
   │
   └─ View "StepRoot"  ─ flex:1, alignItems:center, justifyContent:center, gap:16, textAlign:center
      │                  (키스크린 StepWelcome line 99~109 verbatim)
      │                  ※ flex:1 + justifyContent:center → 수직 가운데 정렬
      │                  ※ 마지막 자식(CTA wrapper)이 marginTop:'auto'로 하단 push
      │
      ├─ Text "Logo"                ─ Playfair 56 / lineHeight 1 (=56) / letterSpacing -0.02em (=-1.12px) / cream
      │                               literal "winemine" (i18n 키 없음, 브랜드 워드마크 §typography.md §4)
      │
      ├─ Text "Tagline"             ─ Playfair italic 18 / gold / margin:0
      │                               i18n `onboarding.tagline`
      │
      ├─ View "GlassGlowFrame"      ─ size 90×90, borderRadius:45, marginTop:12
      │  │                            background = radial-gradient(circle at 50% 35%,
      │  │                              rgba(245,240,232,0.18) 0%,
      │  │                              rgba(139,26,42,0.18)   60%,
      │  │                              rgba(0,0,0,0)         100%)
      │  │                            (키스크린 line 145~149 verbatim)
      │  └─ Icon GlassWater          ─ lucide-react-native, size 56, strokeWidth 1.25, color = brand.gold
      │                               (alignItems:center, justifyContent:center로 frame 내부 중앙)
      │
      └─ View "CtaWrapper"          ─ marginTop:'auto', width:'100%'  (= 수직 push, 하단 정렬)
         │                            (키스크린 line 157~162 verbatim)
         └─ PrimaryButton            ─ variant=primary, size=lg, block=true (=full width)
                                       label = i18n `onboarding.getStarted`
                                       onPress → router.push('/onboarding/2-language')
```

**시각 비율 측정 (스크린샷 onboarding.png 기준 + 키스크린 CSS 검증):**
- 디바이스 viewport 가정: 390pt × 844pt (iPhone 13/14)
- `PageRoot` 안 컨텐츠 영역(`flex:1` 차감 후): 약 772pt
- `StepRoot` 안 컨텐츠 수직 그룹(Logo + Tagline + Glass) ≈ 56 + 16 + 18 + 16 + 90 = 196pt → 중앙 정렬
- CTA는 `marginTop:'auto'`로 하단에서 paddingBottom:40 + button 52pt만큼 떨어진 위치
- 즉 상단 Glass 그룹과 하단 CTA 사이가 viewport 절반 정도 빈 공간 — 키스크린 의도된 여백

---

## 2. NativeWind v4 className 매핑표

> 기존 토큰(`src/lib/design-tokens.ts` + `tailwind.config.ts`)을 최우선 사용. 신규 토큰은 §3 참조.

### 2-1. PageRoot wrapper

| 키스크린 (CSS) | NW v4 className | inline style | 사유 |
|---|---|---|---|
| `padding: '32px 24px 40px'` | `px-6` (=24) | `paddingTop: 32, paddingBottom: 40` | NW `px-6`만 매칭. 수직은 SafeArea insets 합산 필요 |
| `gap: 24` | `gap-6` | — | NW 표준 |
| `background: var(--color-bg-deepest)` | `bg-bg-deepest` | — | tailwind.config.ts에 등록됨 |
| `display:flex; flexDirection: column` | `flex-col` | — | RN View는 default `flex-col` |
| `flex:1` | `flex-1` | — | 표준 |

### 2-2. StepRoot

| 키스크린 | NW v4 className | 사유 |
|---|---|---|
| `flex:1` | `flex-1` | 표준 |
| `alignItems:center` | `items-center` | 표준 |
| `justifyContent:center` | `justify-center` | 표준 |
| `gap:16` | `gap-4` | 표준 |
| `textAlign:center` | `text-center` (Text 자식에 적용) | RN View엔 textAlign 없음 — Text 노드별 적용 |

### 2-3. Logo Text "winemine"

| 키스크린 (inline) | NW v4 className | inline style | 사유 |
|---|---|---|---|
| `fontFamily: var(--font-playfair)` | `font-playfair` | — | tailwind.config.ts fontFamily.playfair 등록됨 |
| `fontSize: 56` | — | `fontSize: 56` | NW에 56 unit 없음 → inline px (또는 typography 토큰 §3) |
| `lineHeight: 1` | — | `lineHeight: 56` | RN은 absolute px만 — size × 1.0 = 56 |
| `letterSpacing: '-0.02em'` | — | `letterSpacing: -1.12` | em → px: 56 × -0.02 = -1.12 |
| `color: var(--color-cream)` | `text-cream` | — | tailwind.config.ts 등록됨 |
| `margin: 0` | — | — | RN Text default 0 (불필요) |

### 2-4. Tagline Text

| 키스크린 | NW v4 className | inline style | 사유 |
|---|---|---|---|
| `fontFamily: var(--font-playfair)` | `font-playfair` | — | 등록됨 |
| `fontStyle: 'italic'` | `italic` | — | NW v4 표준 |
| `fontSize: 18` | `text-[18px]` | — | NW arbitrary px |
| `color: var(--color-gold)` | `text-gold` | — | tailwind.config.ts 등록됨 |
| `margin: 0` | — | — | default |

### 2-5. GlassGlowFrame View

| 키스크린 | NW v4 className | inline style | 사유 |
|---|---|---|---|
| `width: 90, height: 90` | `h-[90px] w-[90px]` | — | NW arbitrary |
| `borderRadius: 45` | `rounded-full` | — | 90/2 = 45 = full |
| `background: radial-gradient(...)` | — | — | RN deviation §6 — react-native-svg RadialGradient 사용 |
| `display:flex, alignItems:center, justifyContent:center` | `items-center justify-center` | — | 표준 |
| `marginTop: 12` | `mt-3` | — | 표준 (3 = 12) |

### 2-6. GlassWater Icon (lucide-react-native)

| 키스크린 prop | RN 대응 | 사유 |
|---|---|---|
| `<GlassWater size={56} strokeWidth={1.25} color="var(--color-gold)" />` | `import { GlassWater } from 'lucide-react-native';` <br/> `<GlassWater size={56} strokeWidth={1.25} color={brand.gold} />` | lucide-react-native 동일 API. color는 token에서 import |

### 2-7. CtaWrapper

| 키스크린 | NW v4 className | 사유 |
|---|---|---|
| `marginTop: 'auto'` | `mt-auto` | NW v4 지원 |
| `width: '100%'` | `w-full` | 표준 |

### 2-8. PrimaryButton (block, lg, primary)

기존 컴포넌트 `src/components/shared/primary-button.tsx` 그대로 사용. block 동작은 부모 wrapper의 `w-full`로 달성.
- `variant="primary"` → bg `wine-red`, text `cream`, active scale 0.97 + Haptics light
- `size="lg"` → h 52, text 15px Inter 600
- label = `t('onboarding.welcome.cta')`

---

## 3. 디자인 토큰 (lib/design-tokens.ts only)

### 3-1. 기존 토큰 재사용 (모두 OK — 변경 없음)

| 사용처 | 토큰 |
|---|---|
| 배경 | `dark.bg.deepest` `#251837` / `light.bg.deepest` `#FAF5EC` (NW: `bg-bg-deepest`) |
| Logo color | `brand.cream` `#F5F0E8` (NW: `text-cream`) |
| Tagline color | `brand.gold` `#C9A84C` (NW: `text-gold`) |
| GlassWater icon color | `brand.gold` (직접 import) |
| Primary button | 기존 `primary-button.tsx` 컴포넌트 (변경 없음) |

### 3-2. 신규 필요 토큰 — **0건**

키스크린 welcome 단계가 사용하는 모든 색·spacing·typography 값은 기존 토큰으로 모두 커버 가능.

단, **radial-gradient는 토큰화하지 않음** (사용처가 이 한 곳뿐 — 인라인 SVG로 처리). 향후 다른 화면에서 같은 radial이 발견되면 `gradients.welcomeGlow` 토큰 신설 검토.

### 3-3. typography 토큰 신규 후보 — **선택적 (P0 세션 결정)**

현재 `typography` 토큰 객체에 다음이 누락:

| 후보 토큰명 | 값 | 사용처 |
|---|---|---|
| `welcomeLogo` | family `PlayfairDisplay_400Regular`, size 56, lineHeight 56, letterSpacing -1.12 | StepWelcome Logo (이 한 곳) |
| `welcomeTagline` | family `PlayfairDisplay_400Regular`, size 18, fontStyle italic | StepWelcome Tagline (이 한 곳) |

**권장:** 사용처가 1곳이므로 inline style로 남겨두고 토큰화는 **보류**. design-reviewer가 retroactive에서 동일 패턴을 다른 step에서 발견하면 그때 typography 토큰으로 승격. (현재 cycle scope 외)

---

## 4. 상태 variants

### 4-1. default

위 §1 레이아웃 그대로. 별도 데이터 fetch 없음 — 정적 화면. loading state 불필요.

### 4-2. dark 모드 (기본)

| 요소 | 색 |
|---|---|
| Background | `dark.bg.deepest` `#251837` |
| Logo | `brand.cream` `#F5F0E8` |
| Tagline | `brand.gold` `#C9A84C` |
| GlassWater icon stroke | `brand.gold` `#C9A84C` |
| GlassGlowFrame radial inner | `rgba(245,240,232,0.18)` (cream alpha 0.18) |
| GlassGlowFrame radial middle | `rgba(139,26,42,0.18)` (wine-red alpha 0.18) |
| GlassGlowFrame radial outer | `rgba(0,0,0,0)` (transparent) |
| CTA bg | `brand.wineRed` `#8B1A2A` (PrimaryButton primary) |
| CTA text | `brand.cream` |

### 4-3. light 모드

키스크린은 다크 기본이고 light 모드도 같은 tokens.css의 light 분기를 따른다. 매핑:

| 요소 | 색 |
|---|---|
| Background | `light.bg.deepest` `#FAF5EC` |
| Logo | `light.text.primary` `#2A1A14` (`text-cream` className은 NW v4가 dark/light 자동 분기 — light 시 `#2A1A14`) |
| Tagline | `brand.gold` (라이트 모드 `--color-gold`는 `#B89438`로 재정의되지만, 키스크린 `var(--color-gold)` 직접 사용 — light tokens.css는 `B89438`. NW `text-gold`는 dual 정의 필요. **현재 tailwind.config.ts 확인 후 정합** — 인라인으로 `light: brand.goldDeep` fallback 처리) |
| GlassWater icon | 라이트 모드에서도 gold 톤 유지 (`#B89438`로 자동 분기) — `useColorScheme()`으로 색 선택 |
| GlassGlowFrame radial | dark와 동일 — alpha 색이라 light 위에서도 차분히 보임 (deviation 없음, design-reviewer 확인 요청) |
| CTA bg | wine-red 라이트 분기 — tokens.css에서 light는 `#B89438` (Gold). PrimaryButton 기존 className `bg-wine-red`가 NW dual 정의이면 자동 처리. 별도 분기 불필요 |

**light 모드 대비 점검 (WCAG AA 4.5:1):**
- Logo cream `#F5F0E8` → light 시 `#2A1A14` 텍스트 / `#FAF5EC` 배경 → 대비 16:1 (AAA 통과)
- Tagline gold `#B89438` 텍스트 / `#FAF5EC` 배경 → 대비 3.9:1 (**AA Large 3:1 통과, AA normal 4.5:1 미달**) — 18px Playfair는 Large 텍스트로 분류 (≥18pt 또는 14pt bold) → 통과 [design-reviewer 재확인 요청]

### 4-4. ko / en

| key | ko | en |
|---|---|---|
| `onboarding.welcome.title` | (사용 안 함 — 현재 RN은 별도 title; **keyscreen은 title 없음** — §10 갭 참조) | — |
| `onboarding.welcome.subtitle` | (사용 안 함 — keyscreen은 subtitle 없음) | — |
| `onboarding.welcome.cta` | "시작하기" | "Get started" |
| `onboarding.tagline` (**신규 i18n 키**) | "한 잔의 와인, 한 점의 지도" | "A glass of wine, a pin on the map" |

**i18n 변경 요청 (P0):**
- `src/lib/i18n/ko.json` `onboarding.welcome`에 `tagline` 추가: `"한 잔의 와인, 한 점의 지도"`
- `src/lib/i18n/en.json` 동일: `"A glass of wine, a pin on the map"`
- `onboarding.welcome.title`, `onboarding.welcome.subtitle`은 keyscreen에서 **사용하지 않으므로 제거 또는 보존** — 보존이 안전 (다른 곳에서 참조 가능성). 현재 cycle에서는 화면 코드에서 참조만 빼고 i18n 키는 유지.

### 4-5. error / empty / loading

해당 없음 (정적 화면).

---

## 5. 인터랙션

| 요소 | 트리거 | 동작 | 피드백 |
|---|---|---|---|
| PrimaryButton "시작하기" | onPress | `router.push('/onboarding/2-language')` | `expo-haptics impactAsync(Light)` (PrimaryButton 내장) + active scale 0.97 |
| swipe back gesture | (없음) | `_layout.tsx`에 `gestureEnabled: false` 명시 | 첫 step에서 뒤로 이동 차단 |
| skip 옵션 | (없음 — keyscreen 1단계는 skip 없음) | — | step 2/3에서만 skip 등장 (각 사양 참조) |

**애니메이션 deviation 결정 (§6 참조):**
- keyscreen은 framer-motion으로 Logo·Tagline·Glass·CTA 4개 요소를 staggered fade-in-up (delay 0.2/0.5/0.7/0.8, duration 0.4~0.6)
- RN에서는 **단순화 — 모든 요소 즉시 표시** (deviation 사유: Reanimated 도입 비용 vs welcome 1회성 가치). design-reviewer가 사용자 인상 손실 판단 시 P2에서 Reanimated FadeInUp 추가 검토.

---

## 6. RN deviation 사유

| 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|
| `background: radial-gradient(circle at 50% 35%, rgba(245,240,232,0.18) 0%, rgba(139,26,42,0.18) 60%, rgba(0,0,0,0) 100%)` | `react-native-svg` `<Svg width=90 height=90><Defs><RadialGradient id="glow" cx="50%" cy="35%" rx="50%" ry="50%"><Stop offset="0%" stopColor={withAlpha(brand.cream, 0.18)} /><Stop offset="60%" stopColor={withAlpha(brand.wineRed, 0.18)} /><Stop offset="100%" stopColor="rgba(0,0,0,0)" /></RadialGradient></Defs><Circle cx="45" cy="45" r="45" fill="url(#glow)" /></Svg>` 컨테이너로 감싸고 그 위에 absolute로 GlassWater 아이콘 overlay | RN view background는 radial-gradient 미지원. `expo-linear-gradient`도 linear만. `react-native-svg`의 `<RadialGradient>` + `<Circle>`이 정확한 대응 |
| `framer-motion` 4개 요소 staggered fade-in-up | (제거) | Reanimated 도입 비용 — welcome 1회성 vs 다른 신규 기능 우선. P2 후속 검토 |
| `cursor: pointer` on button | (없음) | RN은 cursor 개념 없음 — Pressable이 active state 처리 |
| `transition: ...` (PrimaryButton) | `Pressable` `pressed && scale 0.97` (기존 컴포넌트 처리) | RN 표준 |
| `var(--color-bg-deepest)` CSS var → light 모드 자동 분기 | NW v4 `bg-bg-deepest` (tailwind.config.ts에서 dual 토큰으로 등록되어 있음) 또는 `useThemeTokens().bg.deepest` | NW v4가 CSS var를 직접 지원하지 않음 — dark:/light: prefix 또는 hook |

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | 추가 |
|---|---|---|---|
| PageRoot | (default) | — | — |
| Logo Text | `header` | `winemine` (literal) | 워드마크라 i18n 불필요. screen reader 첫 노출 |
| Tagline Text | `text` | `{t('onboarding.tagline')}` | — |
| GlassGlowFrame + Icon | `image` (decorative) | `accessibilityElementsHidden={true}` `importantForAccessibility="no-hide-descendants"` | 장식 아이콘 — 스크린리더 무시 |
| PrimaryButton | `button` (PrimaryButton 내장) | `t('onboarding.welcome.cta')` | PrimaryButton 기본 동작 — 별도 override 없음 |

**focus 순서:** Logo → Tagline → (Glass 건너뜀) → PrimaryButton. RN 기본 DOM 순서로 만족.

**다이내믹 타입 (a11y font scaling):** Logo 56pt는 매우 큰 텍스트 — iOS XXXLarge 시 화면 넘침 위험. 현재 사양은 `allowFontScaling={true}` (default) 유지, design-reviewer가 시각 검증 시 큰 다이내믹 타입에서 줄바꿈 발생하면 `numberOfLines={1}` + `adjustsFontSizeToFit` 보강 요청.

---

## 8. i18n 키 목록 (ko/en 완성형)

```json
// src/lib/i18n/ko.json
{
  "onboarding": {
    "tagline": "한 잔의 와인, 한 점의 지도",   // [신규 추가]
    "welcome": {
      "cta": "시작하기"
    }
  }
}

// src/lib/i18n/en.json
{
  "onboarding": {
    "tagline": "A glass of wine, a pin on the map",  // [신규 추가]
    "welcome": {
      "cta": "Get started"
    }
  }
}
```

**기존 `onboarding.welcome.title`, `onboarding.welcome.subtitle`은 보존 (다른 참조 가능성).** rn-screen-builder가 1-welcome.tsx에서 더 이상 참조하지 않으면 됨.

---

## 9. 현재 구현 차이 (retroactive — `app/onboarding/1-welcome.tsx` 36 LOC 분석)

| # | 항목 | 키스크린 원본 | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|---|
| 1 | **GlassWater 아이콘 + radial glow 컨테이너** | ✓ size 56, gold, 90×90 frame, radial gradient | ✗ **완전 누락** | **신규 추가** — react-native-svg RadialGradient + lucide GlassWater |
| 2 | Logo "winemine" 텍스트 | size 56, Playfair, cream, letterSpacing -0.02em | size 56, font-playfair, text-cream, letterSpacing **0.5 (양수, 잘못됨)** | letterSpacing `-1.12` (= 56 × -0.02)로 수정 |
| 3 | Tagline (Playfair italic 18 gold) | "한 잔의 와인, 한 점의 지도" / "A glass of wine, a pin on the map" | ✗ **누락** — 대신 `welcome.title` (Playfair 24 text-primary "와인의 모든 순간을 기록합니다") + `welcome.subtitle` (Inter 13 text-secondary) 두 줄 사용 | **교체** — title/subtitle 제거하고 tagline 한 줄로 |
| 4 | 컨텐츠 수직 정렬 | StepRoot `justifyContent:center` + CtaWrapper `marginTop:auto` | 현재 RN: 외부 `<View className="flex-1 items-center justify-center">`로 컨텐츠 중앙, CTA wrapper `pb-2`로 하단 push | OK — 의미적으로 동일하나 키스크린의 `gap-4 + marginTop:auto` 패턴으로 정렬 |
| 5 | 페이지 패딩 | `32px 24px 40px` (top/horizontal/bottom) | `px-6` + SafeArea insets.top/bottom + `Math.max(insets.bottom, 16)` | top은 SafeArea + 32 추가, bottom은 SafeArea + 40 (현재 16 minimum은 약함) |
| 6 | gap | StepRoot 자식 간 16 | RN: Title→subtitle `mt-3` (12px), subtitle→? 없음 | **gap-4** (= 16) StepRoot에 적용 |
| 7 | 배경 | `var(--color-bg-deepest)` dual | `bg-bg-deepest dark:bg-bg-deepest` (중복 — 같은 이름 양쪽) | OK 동작은 맞으나 `bg-bg-deepest`만으로 충분 (NW v4 dual 토큰이면 자동 분기) — cleanup 권장 |
| 8 | Layout `_layout.tsx` `gestureEnabled: false` | (URL 가드 — heavy 모드는 / 리다이렉트) | ✓ `gestureEnabled: false` 적용됨 | OK |

**수정 폭 요약:**
- **신규 추가:** GlassGlowFrame (SVG RadialGradient + 90×90 컨테이너) + GlassWater 아이콘 56px (1 컴포넌트, ~25 LOC)
- **교체:** title/subtitle 두 줄 → tagline 한 줄 (i18n 키 신규 `onboarding.tagline`)
- **수정:** Logo letterSpacing 부호 (0.5 → -1.12), 페이지 padding 32/40, gap-4
- **예상 LOC 변화:** 36 → 약 65 LOC

---

## 10. 미해결 질문 (리더 판단 / escalation)

| # | 질문 | 영향 | 권장 |
|---|---|---|---|
| Q1 | 현재 `onboarding.welcome.title/subtitle` i18n 키 보존 vs 제거? | UI 사용 없으나 차후 기능 확장 시 빈 placeholder | **보존** — `tagline` 키만 신규 추가, title/subtitle은 dead key로 남김 (i18n linter 통과 가능성 점검) |
| Q2 | framer-motion staggered fade-in 애니메이션 RN에서 구현 여부 | welcome 첫인상 — 미미하지만 폴리시 손실 | **보류 (P2)** — 1주 alpha 빌드 우선. design-reviewer 결정 위임 |
| Q3 | light 모드에서 deep purple `#FAF5EC` 배경이 와인 브랜드 톤과 부조화? | 첫 화면 임팩트 약화 가능성 | design-reviewer 시각 검증 시 판단. 키스크린 light tokens.css verbatim 따름 (deviation 없음) |
| Q4 | radial gradient를 `react-native-svg`로 구현 시 성능? | SVG 1개 — 무시할만함 | OK — capture 화면이 이미 SVG 다수 사용 |
| Q5 | accessibilityRole="header"가 RN 0.79에서 Logo Text에 적용 가능? | screen reader UX | RN 표준 — 적용. iOS VoiceOver는 `accessibilityRole="header"` 지원 |

**리더 escalation:** Q1, Q2만 필요. Q3은 design-reviewer, Q4·Q5는 rn-screen-builder 구현 시 검증.

---

## 11. 변경 요청 집계 (rn-screen-builder 게이트로 전달)

**rn-screen-builder 작업 요청:**
1. `app/onboarding/1-welcome.tsx` 보강 (위 §9 8건 + §5 인터랙션 1건)
2. (선택) `src/components/onboarding/welcome-glass-glow.tsx` 신규 — GlassGlowFrame + GlassWater 묶음 컴포넌트 (재사용 가능성 낮음, 인라인도 OK)
3. `src/lib/i18n/{ko,en}.json` `onboarding.tagline` 키 신규 추가

**i18n 키 등록 후 commit 분리 권장:** 키 추가 commit → 화면 코드 commit (2단계).

**신규 design token 수:** **0건**
**신규 i18n 키 수:** 2건 (ko/en `onboarding.tagline`)
**escalation 항목:** Q1, Q2 (각각 리더 판단 / design-reviewer 위임)
