# /onboarding/4-mode 디자인 사양

> **버전:** v1 (retroactive hardening — Day 5 기존 구현 79 LOC 갭 보강 + RN-only step)
> **작성:** design-spec-author
> **소비자:** rn-screen-builder (다음 게이트), design-reviewer (시각 검증)

---

## 0. 원본 소스

| 우선순위 | 자료 | 경로 |
|---|---|---|
| 1 | **(부재)** keyscreen은 mode 선택 UI 없음 — `useAppMode()` context의 `demoMode`는 DemoControls(`max-width ≥ 1024px` 데스크톱 전용 사이드 패널)에서만 토글, 모바일(<768px)에서는 강제 `heavy` (`app-mode-context.tsx` line 27~36). onboarding page는 `demoMode !== 'first-time'` 시 `/` 리다이렉트만 — step UI 없음. | `../winemine-keyscreen/src/context/app-mode-context.tsx`, `../winemine-keyscreen/src/app/onboarding/page.tsx` line 27~38 |
| 1 | **차선** keyscreen `StepExperience` (verbatim) — RN mode step의 시각 패턴 baseline (2-option card stack + Title/Subtitle + footer 없음). 단, icon 매핑은 RN 자체 결정. | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 220~279 |
| 1 | JSX `ExperienceCard` (verbatim, 카드 구조 재사용) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 396~452 |
| 1 | JSX root `<main>` PageRoot wrapper | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 47~93 |
| 2 | 산문 | (없음 — `pages/onboarding.md` 부재) |
| 2 | keyscreen i18n ko | `../winemine-keyscreen/messages/ko.json` (line 437~438 mode.firstTime/heavy 라벨만 존재 — 짧은 데모 컨트롤용. onboarding mode step 텍스트 부재) |
| 2 | keyscreen i18n en | `../winemine-keyscreen/messages/en.json` (line 437~438 동일) |
| 3 | 디자인 시스템 | `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md` |
| 4 | 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` (welcome step만 캡쳐 — mode step 자체가 keyscreen에 없으므로 별도 캡쳐 불가) |
| 5 | 현재 RN 구현 | `app/onboarding/4-mode.tsx` (79 LOC) |
| 5 | 현재 RN i18n | `src/lib/i18n/{ko,en}.json` `mode.{firstTime,heavy}` (line 36~39) + `onboarding.mode.{title,subtitle,firstTimeDescription,heavyDescription,finish}` (line 86~92) |
| 5 | 인접 화면 표준 (이미 hardening 완료) | `_workspace/design-specs/{onboarding-1-welcome, onboarding-2-language, onboarding-3-experience}.md`, `src/lib/design-tokens.ts`, `src/components/onboarding/{onboarding-step-layout, language-choice-card, experience-choice-card, welcome-glass-glow}.tsx` |

**범위 외:**
- AppHeader, BottomNav (onboarding 4 step 모두 미사용)
- step 1 (welcome) / step 2 (language) / step 3 (experience) — 각자 별도 사양 완료
- settings 3 sub 화면 (별도 cycle — Day 6 후속)
- DemoControls 컴포넌트 — keyscreen 데스크톱 전용, RN 변환 없음

---

## 1. 레이아웃 트리 (verbatim, ExperienceCard 패턴 차용)

> **선언:** keyscreen에 mode step이 없으므로 §0 차선 baseline(StepExperience)을 1:1 따른다. 즉, 사양 §1 트리는 onboarding-3-experience §1과 **구조 동일, 텍스트·icon·navigation 만 mode 의미로 치환**. 이 결정은 §9 escalation Q1에서 정식 확인.

```
OnboardingStepLayout (이미 구현됨 — onboarding-2-language Q2 (c) 채택)
└─ PageRoot              ─ flex:1, paddingTop = SafeArea.top + 32, paddingBottom = SafeArea.bottom + 40,
   │                        paddingHorizontal: 24, gap: 24, bg-bg-deepest (dual)
   │                        (키스크린 main wrapper line 49~57 verbatim — step 공통)
   │
   ├─ StepRoot           ─ flex:1, flexDirection:column, gap:16
   │  │                    (키스크린 StepExperience line 232 verbatim)
   │  │
   │  ├─ Text "Title"    ─ Playfair 26 / lineHeight 31.2 (=1.2) / text-primary dual / margin:0
   │  │                    i18n `onboarding.mode.title` = "어떻게 사용하시겠어요?" / "How will you use winemine?"
   │  │                    (experience step과 동일 size 26 — §9 escalation Q4 동일 정책)
   │  │
   │  ├─ Text "Subtitle" ─ Inter 14 / regular / text-muted dual / margin:0
   │  │                    i18n `onboarding.mode.subtitle` = "언제든 설정에서 바꿀 수 있습니다" / "You can change this any time in Settings"
   │  │                    (experience step과 동일 typography)
   │  │
   │  └─ View "ChoiceList" ─ flexDirection:column, gap:12, marginTop:8
   │     │                  (experience step verbatim — gap=12, marginTop=8)
   │     │
   │     ├─ ModeChoiceCard "first-time"
   │     │   active = (picked === 'first-time')
   │     │   title  = i18n `mode.firstTime` = "처음 마셔봐요" / "Just starting out"
   │     │   sub    = i18n `onboarding.mode.firstTimeDescription` = "이제 막 와인을 시작했어요" / "I'm just getting into wine"
   │     │   icon   = <Sparkles size=24 strokeWidth=1.5 color=brand.gold/>   ← §6 deviation 11 (RN 자체 결정)
   │     │   onPress → setPicked('first-time')
   │     │
   │     └─ ModeChoiceCard "heavy"
   │         active = (picked === 'heavy')
   │         title  = i18n `mode.heavy` = "기록이 많아요" / "I keep many notes"
   │         sub    = i18n `onboarding.mode.heavyDescription` = "꾸준히 기록하고 있어요" / "I keep regular notes"
   │         icon   = <BookOpen size=24 strokeWidth=1.5 color=brand.gold/>   ← §6 deviation 11
   │         onPress → setPicked('heavy')
   │
   │   (experience step과 달리 footer Text **없음** — keyscreen ExperienceStep만 footer 보유; mode step은
   │    "언제든 설정에서 바꿀 수 있습니다"가 subtitle에 이미 포함되어 중복 회피)
   │
   └─ CtaWrapper          ─ marginTop:'auto' (OnboardingStepLayout cta prop)
      │                    (키스크린 line 272 verbatim 동일 패턴)
      ├─ Toast (error만)   ─ tone="error", message = `t('errors.onboardingSaveFailed')`
      │                     CtaWrapper 내부 PrimaryButton 위 (현재 RN 패턴 유지)
      │
      └─ PrimaryButton    ─ variant=primary, size=lg, block (w-full)
                           disabled = !picked || saving, loading = saving
                           label = i18n `onboarding.mode.finish` = "시작하기" / "Get started"
                                  (≠ experience/language step의 `common.next` — finish CTA)
                           onPress → (1) supabase.from('profiles').update({ mode: picked }).eq('id', uid)
                                     (2) setOnboarded()
                                     (3) router.replace('/(tabs)')
                                     실패 시 Toast(tone="error")
```

### 1-1. ModeChoiceCard (ExperienceChoiceCard 패턴 verbatim 변형)

**핵심:** keyscreen `ExperienceCard` (line 396~452)와 100% 동일 시각 구조. 차이는 props variant만 (`'first-time' | 'heavy'`) — icon 매핑 내부 변경. 신규 컴포넌트가 아니라 **`ExperienceChoiceCard` 일반화** 또는 **별도 `ModeChoiceCard` 분리** 둘 다 합리. §10 Q5 권장.

```
Pressable                                              ─ accessibilityRole="radio"
  ├ accessibilityState={ selected: active }              accessibilityLabel = title
  ├ padding: 18 (사방)                                    accessibilityHint = sub
  ├ borderRadius: 16 (rounded-2xl)
  ├ flexDirection: row, alignItems: 'flex-start'         (2-tier 텍스트 보호)
  ├ gap: 14
  ├ background: surface (token, dual)
  ├ border: 1px solid (active ? brand.gold : border.default)
  ├ boxShadow: active ? '0 0 0 1px rgba(139,26,42,0.4)' : 'none'   ← RN deviation §6 (border 1→2px)
  └ opacity: active ? 1 : 0.85                            ← 키스크린 verbatim
│
├─ View "IconWrap"   ─ paddingTop: 2 (텍스트 첫 줄 baseline 정렬)
│  │                   (ExperienceCard line 427 verbatim)
│  │
│  └─ Lucide Icon    ─ Sparkles (first-time) | BookOpen (heavy)
│                      size=24, strokeWidth=1.5, color=brand.gold
│                      (§6 deviation 11 — keyscreen mode UI 부재로 RN 자체 결정)
│
└─ View "TextStack"  ─ flexDirection: column, gap: 4 (flex-1 권장 — 폭 양보)
   │
   ├─ Text "title"   ─ Inter 16 / weight 600 / text-primary dual
   │                   (ExperienceCard line 429~437 verbatim — text-source-card-title)
   │
   └─ Text "sub"     ─ Inter 13 / regular / text-muted dual
                       lineHeight 1.4 → cardBody 1.5 재사용 (1.3pt 차이 수용 — §6 deviation 10)
```

### 1-2. 시각 비율 측정 (스크린샷 부재 → experience step 측정 1:1)

- 디바이스 viewport 가정: 390pt × 844pt (iPhone 13/14)
- ModeChoiceCard 내부 수직 누적: padding-top 18 + title(19.2 = 16 × 1.2 default) + gap 4 + sub 1줄(19.5) + padding-bottom 18 ≈ **78pt**
- sub 2줄 시(긴 description): 78 + 19.5 = **97pt** (현재 ko/en 모두 짧음 — 1줄 추정)
- StepRoot 누적: Title(31.2) + 16 + Subtitle(~20) + 16(gap) + 8(marginTop) + ChoiceList(78+12+78=168) ≈ **277pt**
  - (experience step의 ~312pt보다 35pt 적음 — footer Text 없기 때문)
- 잔여 영역(~495pt)이 ChoiceList ↔ CtaWrapper 사이 빈 공간 — keyscreen `marginTop:auto`가 CTA를 paddingBottom 위로 push
- CTA wrapper는 하단에서 paddingBottom:40 + button 52pt 위로 떨어진 위치

---

## 2. NativeWind v4 className 매핑표

> 기존 토큰(`src/lib/design-tokens.ts` + `tailwind.config.ts`) 최우선 사용. 신규 토큰은 §3 참조.

### 2-1. PageRoot / StepRoot / CtaWrapper

→ `OnboardingStepLayout` 컴포넌트가 이미 처리 (onboarding-2-language §1 verbatim). 변경 없음.

### 2-2. Title Text (size 26, experience step과 동일)

| 키스크린 (≈experience inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-playfair)` | `font-playfair` | — | A | 등록됨 |
| `fontSize: 26 / lineHeight 31.2` | — | `fontSize: 26, lineHeight: 31.2` | C | onboarding-3-experience §2-2와 일관 — inline arbitrary. 토큰화는 §3-2 후속 cycle 검토. |
| `color: var(--color-cream)` | `text-text-primary dark:text-text-primary` | — | B | dual 토큰 |
| `margin: 0` | — | — | — | RN Text default |

### 2-3. Subtitle Text (experience step 동일)

| 키스크린 | NW v4 className | 분류 |
|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter` | A |
| `fontSize: 14 / lineHeight 20` | `text-onboarding-step-subtitle` | A (토큰화됨 — onboarding-2-language §3-2 P0) |
| `color: var(--color-text-muted)` | `text-text-muted dark:text-text-muted` | B |
| `margin: 0` | — | — |

### 2-4. ChoiceList wrapper

| 키스크린 | NW v4 | 분류 |
|---|---|---|
| `display:flex; flexDirection:column` | (default) | A |
| `gap:12` | `gap-3` | A |
| `marginTop:8` | `mt-2` | A |

### 2-5. ModeChoiceCard root Pressable

→ ExperienceChoiceCard 매핑표(onboarding-3-experience §2-5) 100% 동일 — 동일 컴포넌트 일반화 시 자동 상속. 별도 매핑 생략.

### 2-6. IconWrap / Lucide Icon

| 키스크린 (≈experience) | NW v4 / inline | 분류 | 비고 |
|---|---|---|---|
| `paddingTop: 2` | `pt-0.5` | A | NW v4 0.5=2 |
| Lucide `Sparkles` (first-time) | `import { Sparkles, BookOpen } from 'lucide-react-native'` | — | RN 자체 결정 (§6 deviation 11) |
| Lucide `BookOpen` (heavy) | 위와 동일 | — | 위와 동일 |
| `size={24}` `strokeWidth={1.5}` `color={brand.gold}` | inline props | B | gold 단일 (brand 고정) |

### 2-7. TextStack / title / sub

→ ExperienceChoiceCard §2-8~2-10과 동일. 변경 없음.

### 2-8. CtaWrapper Toast + PrimaryButton

| 요소 | NW v4 / 사양 | 비고 |
|---|---|---|
| Toast wrapper | `className="gap-3"` (현재 RN 그대로) | error 시만 노출 |
| PrimaryButton | `variant="primary"`, `size="lg"`, `block` (`w-full`) | label `t('onboarding.mode.finish')` (≠ next) |
| disabled | `!picked \|\| saving` | 현재 RN 그대로 |
| loading | `saving` | 현재 RN 그대로 |

---

## 3. 디자인 토큰 (lib/design-tokens.ts + tailwind.config.ts)

### 3-1. 기존 토큰 재사용 (확장 불필요)

| 사용처 | 토큰 |
|---|---|
| 페이지 배경 | `bg.deepest` dual — OnboardingStepLayout 처리 |
| 카드 배경 | `bg.surface` dual (`bg-surface`) |
| 카드 보더 unselected | `dark.border.default` / `light.border.default` (inline + useColorScheme 분기) |
| 카드 보더 selected | `brand.gold` (inline) |
| Title 색 | `text.primary` dual |
| Subtitle/sub 색 | `text.muted` dual |
| Subtitle typography | `text-onboarding-step-subtitle` (Inter 14/20) |
| 카드 title typography | `text-source-card-title` (Inter 600 16/19.2) |
| sub typography | `text-card-body` (Inter 13/19.5) |
| Icon color | `brand.gold` (inline — color prop) |
| spacing 3.5 (14) | 등록됨 |
| rounded-2xl (16) | NW v4 기본 |
| PrimaryButton | 기존 컴포넌트 |

### 3-2. 신규 typography 토큰 — **0건 필수**

- Title 26은 experience step과 동일 — 두 step 모두 같은 사이즈 사용 확정. **`onboardingStepTitleSm` (Playfair 26/31.2)** 토큰화가 두 사용처(3-experience, 4-mode)를 커버. **권장: P0 토큰 1건 추가** (현재 cycle 또는 후속). 본 cycle은 inline arbitrary 유지 — design-spec-author 재량으로 작성, P0 토큰화는 별도 합의.

### 3-3. 신규 색/shadow 토큰 — **0건**

모두 기존 토큰 또는 brand.gold 직접 사용.

### 3-4. Lucide icon import 추가 (별도 토큰 아님)

- `Sparkles`, `BookOpen` — 현재 RN에서 미사용. `lucide-react-native`는 이미 의존 (다른 화면에서 사용중).

---

## 4. 상태 variants

### 4-1. default (picked === null)

- ModeChoiceCard 둘 다 unselected:
  - border 1px solid `border.default` (dark `#5A3D6A` / light `#E0D2BC`)
  - opacity 0.85
  - icon brand.gold (active 무관 — experience step verbatim 일관)
- Toast: 미노출
- PrimaryButton: `disabled` (opacity 0.5)

### 4-2. selected — picked === 'first-time'

- first-time row:
  - border 1px → **2px** solid `brand.gold` (RN deviation §6)
  - opacity 1
- heavy row: unselected 그대로
- PrimaryButton: 활성, label "시작하기" / "Get started"

### 4-3. selected — picked === 'heavy'

- heavy row: 위와 동일 패턴 (border 2px gold, opacity 1)
- first-time row: unselected
- PrimaryButton: 활성

### 4-4. pressed (Pressable)

- 카드: scale 0.99, opacity (active ? 0.95 : 0.80) — language-choice-card / experience-choice-card / settings-radio-row 일관

### 4-5. saving (CTA loading)

- PrimaryButton `loading={saving}` → ActivityIndicator 표시. 카드 disabled 안 함(키스크린 verbatim, 사용자가 재선택 가능). 단 onPress가 saving중이면 사양상 PrimaryButton.onPress가 막혀있으므로 영향 없음.

### 4-6. error (profile update 실패)

- `<Toast tone="error" message={t('errors.onboardingSaveFailed')} />` — CTA 위에 표시 (CtaWrapper 안 PrimaryButton 위). 현재 RN 패턴 유지.

### 4-7. dark 모드 (기본)

| 요소 | 색 |
|---|---|
| Background | `dark.bg.deepest` `#251837` |
| 카드 bg | `dark.bg.surface` `#3D2A4A` |
| 카드 border (unselected) | `dark.border.default` `#5A3D6A` |
| 카드 border (selected) | `brand.gold` `#C9A84C` |
| Title / card title | `dark.text.primary` `#F8F4ED` |
| Subtitle / sub | `dark.text.muted` `#CABDA8` |
| Icon (Sparkles / BookOpen) | `brand.gold` `#C9A84C` |
| CTA bg | `brand.wineRed` `#8B1A2A` |
| CTA text | `brand.cream` `#F5F0E8` |

### 4-8. light 모드

| 요소 | 색 |
|---|---|
| Background | `light.bg.deepest` `#FAF5EC` |
| 카드 bg | `light.bg.surface` `#FFFFFF` |
| 카드 border (unselected) | `light.border.default` `#E0D2BC` |
| 카드 border (selected) | `brand.gold` `#C9A84C` |
| Title / card title | `light.text.primary` `#2A1A14` |
| Subtitle / sub | `light.text.muted` `#8B7766` |
| Icon | `brand.gold` `#C9A84C` (단일) |
| CTA bg | `brand.wineRed` `#8B1A2A` |
| CTA text | `brand.cream` `#F5F0E8` |

**light 모드 대비 점검 (WCAG AA 4.5:1):**
- Title `#2A1A14` on `#FAF5EC` → 16:1 (AAA)
- Subtitle `#8B7766` on `#FAF5EC` → 4.7:1 (AA)
- Card title `#2A1A14` on `#FFFFFF` → 18.7:1 (AAA)
- Sub `#8B7766` on `#FFFFFF` → 5.0:1 (AA)
- Icon gold `#C9A84C` on white card → 2.0:1 (**AA 미달**) — 보조 식별자(title이 본 라벨). language step IconBadge / experience step Icon과 동일 패턴. design-reviewer 시각 게이트에서 일괄 판정 (3-experience Q3과 합쳐 처리).

### 4-9. ko / en locale (이미 i18n에 존재 — 변경 폭 §8)

| key | ko (현재 RN i18n) | en (현재 RN i18n) | keyscreen verbatim 매칭 |
|---|---|---|---|
| `onboarding.mode.title` | "어떻게 사용하시겠어요?" | "How will you use winemine?" | (keyscreen UI 없음 — RN 신규 유지) |
| `onboarding.mode.subtitle` | "언제든 설정에서 바꿀 수 있습니다" | "You can change this any time in Settings" | (keyscreen UI 없음 — RN 신규 유지) |
| `mode.firstTime` | "처음 마셔봐요" | "Just starting out" | keyscreen `demoControls.firstTime` 동등 |
| `onboarding.mode.firstTimeDescription` | "이제 막 와인을 시작했어요" | "I'm just getting into wine" | (keyscreen UI 없음 — RN 신규 유지) |
| `mode.heavy` | "기록이 많아요" | "I keep many notes" | keyscreen `demoControls.heavy` 동등 |
| `onboarding.mode.heavyDescription` | "꾸준히 기록하고 있어요" | "I keep regular notes" | (keyscreen UI 없음 — RN 신규 유지) |
| `onboarding.mode.finish` | "시작하기" | "Get started" | keyscreen `done.scanCta` 인접 — finish CTA 일관 |

**i18n 변경 폭:** **0건 추가/교체 필요** — 현재 RN i18n이 이미 완전. 단, 키 구조 정리 권장 (§10 Q6).

---

## 5. 인터랙션

| 요소 | 트리거 | 동작 | 피드백 |
|---|---|---|---|
| ModeChoiceCard "first-time" | onPress | `Haptics.selectionAsync()` → `setPicked('first-time')` + errorMsg clear | scale 0.99, opacity dim |
| ModeChoiceCard "heavy" | onPress | `Haptics.selectionAsync()` → `setPicked('heavy')` + errorMsg clear | 동일 |
| 같은 옵션 재선택 | onPress | no-op (state 동일) | 햅틱만 |
| PrimaryButton "시작하기" | onPress (picked !== null) | `Haptics.impactAsync(Light)` → setSaving(true) → `supabase.from('profiles').update({ mode: picked }).eq('id', uid)` → 성공 시 `setOnboarded()` + `router.replace('/(tabs)')` / 실패 시 `setErrorMsg(t('errors.onboardingSaveFailed'))` | loading spinner, disabled 동안 인터랙션 차단 |
| swipe back gesture | (없음) | `_layout.tsx` `gestureEnabled: false` 적용됨 (확인 필요) | step 간 뒤로 이동 차단 |
| 키보드 | (해당 없음) | TextInput 없음 | — |

### 5-1. mode 선택 결과 분기 (5-step 정책 — §9 Q1)

- mode 자체는 home 화면 분기 트리거 (first-time → `home.firstTime.*` UI / heavy → `home.heavy.*` UI). onboarding step 자체는 분기 없음 — 모든 사용자는 mode 선택 → `router.replace('/(tabs)')` 동일 경로.
- 즉, `picked` 값에 따라 다음 화면 자체가 달라지지 않음. 분기는 home 컴포넌트의 `useUserProfile().mode` 조건문 위임.

### 5-2. PrimaryButton 활성 조건

`disabled={!picked || saving}` — 현재 RN 그대로.

### 5-3. 애니메이션

- keyscreen StepExperience verbatim — framer-motion 없음.
- RN도 추가 애니메이션 불필요. expo-router `slide_from_right` 기본 전환.

### 5-4. setOnboarded() 호출 시점

- 현재 RN: `await supabase.from('profiles').update(...)` 성공 후 `await setOnboarded()` 호출 → `router.replace('/(tabs)')`.
- 순서 유지: profile 갱신 실패 시 onboarding 미완료로 남도록 (재시도 가능). **현재 RN 패턴 유지 — 변경 불필요.**

---

## 6. RN deviation 사유

| # | 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|---|
| 1 | `boxShadow: '0 0 0 1px rgba(139,26,42,0.4)'` (selected ring) | **borderWidth 1 → 2px (active)**, borderColor = `brand.gold` | RN ShadowProps는 outset only. language/experience-choice-card 일관. |
| 2 | `cursor: pointer` | (제거) | RN cursor 없음 |
| 3 | `all: unset` on `<button>` | (제거) | RN Pressable 기본 무 스타일 |
| 4 | hover 상태 | `pressed && opacity dim + scale 0.99` | RN hover 없음 |
| 5 | `var(--color-bg-deepest)` CSS var | NW v4 `bg-bg-deepest` (dual 토큰) | OnboardingStepLayout 처리됨 |
| 6 | `var(--color-gold)` CSS var (Icon color) | `brand.gold` 직접 전달 | gold는 brand 고정 — dual 분기 안 함 |
| 7 | `<button>` `<div>` semantic HTML | `<Pressable>` `<View>` `<Text>` | RN 표준 |
| 8 | framer-motion (StepExperience baseline 미사용) | — | deviation 없음 |
| 9 | `lineHeight: 1.4` (≈experience sub) | `text-card-body` lineHeight 1.5 (19.5px) 재사용 | 1.3pt 차이 수용 — experience step §6 deviation 10 일관 |
| 10 | (없음 — keyscreen mode UI 부재) — step 4 자체가 RN 추가 | StepExperience verbatim 패턴 차용 | **mode step 자체가 RN-only**. keyscreen는 demoControls(데스크톱 패널)에서만 mode 토글. 모바일 사용자는 onboarding 단계에서 mode 결정해야 → 5-step. §9 Q1 escalation. |
| 11 | (없음 — icon 자체 미존재) | Lucide `Sparkles` (first-time) / `BookOpen` (heavy) | mode UI가 keyscreen에 없음 → icon 선택 자유. Sparkles는 "처음" 느낌 (반짝/새로움), BookOpen은 "기록 많음" 느낌 (책 / 누적 노트). design-reviewer 의견 수용 가능 — §10 Q2. |
| 12 | (없음) Footer Text | (제거) | keyscreen ExperienceStep는 footer 보유 ("설정에서 언제든 변경할 수 있어요") — mode step에서는 동일 문구가 이미 subtitle("언제든 설정에서 바꿀 수 있습니다")로 노출됨 → 중복 회피. 현재 RN 그대로. |

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | accessibilityState | 추가 |
|---|---|---|---|---|
| PageRoot View | (default) | — | — | — |
| Title Text | `header` | (자동) | — | screen reader 첫 노출 |
| Subtitle Text | `text` | — | — | — |
| ModeChoiceCard "first-time" | `radio` | `t('mode.firstTime')` | `{ selected: picked === 'first-time' }` | hitSlop 6, `accessibilityHint = t('onboarding.mode.firstTimeDescription')` |
| ModeChoiceCard "heavy" | `radio` | `t('mode.heavy')` | `{ selected: picked === 'heavy' }` | hitSlop 6, `accessibilityHint = t('onboarding.mode.heavyDescription')` |
| Icon (Sparkles / BookOpen) | — | `accessibilityElementsHidden + importantForAccessibility="no-hide-descendants"` | — | 보조 식별자, screen reader 중복 차단 |
| Toast (error만) | (Toast 내장 `alert` role) | error 문구 | — | 노출 시 즉시 announce |
| PrimaryButton | `button` (내장) | `t('onboarding.mode.finish')` | `{ disabled, busy: loading }` | PrimaryButton 기본 |

**focus 순서:** Title → Subtitle → first-time → heavy → (error 시 Toast →) PrimaryButton.

**최소 타겟 크기:** ModeChoiceCard ≈ 78pt (sub 1줄) → AA 통과. PrimaryButton 52pt → AA.

**다이내믹 타입:** Title 26pt (ko "어떻게 사용하시겠어요?" 11자) — XXXL에서도 1~2줄 wrap OK. sub 13pt 자연 줄바꿈.

---

## 8. i18n 키 목록 (현재 RN i18n 그대로 — 변경 폭 0)

```json
// src/lib/i18n/ko.json (현재 RN — 이미 존재, 변경 불필요)
{
  "mode": {
    "firstTime": "처음 마셔봐요",
    "heavy": "기록이 많아요"
  },
  "onboarding": {
    "mode": {
      "title": "어떻게 사용하시겠어요?",
      "subtitle": "언제든 설정에서 바꿀 수 있습니다",
      "firstTimeDescription": "이제 막 와인을 시작했어요",
      "heavyDescription": "꾸준히 기록하고 있어요",
      "finish": "시작하기"
    }
  }
}

// src/lib/i18n/en.json (현재 RN — 이미 존재, 변경 불필요)
{
  "mode": {
    "firstTime": "Just starting out",
    "heavy": "I keep many notes"
  },
  "onboarding": {
    "mode": {
      "title": "How will you use winemine?",
      "subtitle": "You can change this any time in Settings",
      "firstTimeDescription": "I'm just getting into wine",
      "heavyDescription": "I keep regular notes",
      "finish": "Get started"
    }
  }
}
```

**i18n 변경 폭:** **0건 추가/교체** — 현재 RN i18n이 이미 완전.

**구조 정리 권장 (선택, §10 Q6):** `onboarding.mode` 안에 `firstTimeTitle`/`heavyTitle`을 두어 top-level `mode.{firstTime,heavy}` 의존을 onboarding 화면에서 제거하면 키 응집도 ↑. 단, 다른 화면(settings, home heavy badge 등)이 `mode.firstTime` 등을 재사용 중이면 유지가 옳음. grep 확인 → 사용처 다수 → **현재 구조 유지**.

---

## 9. 현재 구현 차이 (retroactive — `app/onboarding/4-mode.tsx` 79 LOC 분석)

| # | 항목 | 키스크린 baseline (=experience verbatim) | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|---|
| 1 | **레이아웃 wrapper** | `<main>` PageRoot + StepRoot (flex-1 gap-16, padding 32/24/40) | `OnboardingStep` 컴포넌트 (progress eyebrow "4 / 4" + insets.top + `px-6 pt-6` + ScrollView + footer block) | **wrapper 교체** → `OnboardingStepLayout` (이미 존재, language/experience step 사용 중) |
| 2 | **progress eyebrow** ("4 / 4") | ✗ (baseline 없음) | `OnboardingStep` 내장 progress | **제거** — wrapper 교체로 자동 해결 |
| 3 | Title font size | Playfair 26 / lineHeight 31.2 / margin 0 | `OnboardingStep` 내부 `text-page-title` (Playfair 24/28.8) + `mt-3` | **size 26 / lineHeight 31.2** inline 또는 arbitrary (§3-2) |
| 4 | Subtitle font | Inter 14 / muted / margin 0 | `OnboardingStep` 내부 (확인 필요 — language step과 동일 부조화 가능성) | **`text-onboarding-step-subtitle` + text-muted** (이미 토큰화) |
| 5 | **ChoiceCard 모양** | padding 18 사방, rounded-2xl(16), items-start, gap 14, Lucide icon 24 gold + paddingTop 2 + title Inter 600 16 + sub Inter 13 1.5 muted | `OptionCard` 컴포넌트 (`rounded-xl`, `px-4 py-4`, `flex-row justify-between`, items-center, Check icon right side, title `text-card-title`=Playfair 16, description `text-card-meta`=Inter 12) | **컴포넌트 교체** — `OptionCard` 부적합. **`ExperienceChoiceCard` 일반화 → 새 prop `iconLeft` 받기** 또는 신규 `ModeChoiceCard` 분리 (§10 Q5) |
| 6 | Icon | Sparkles (first-time) / BookOpen (heavy), Lucide, size 24, strokeWidth 1.5, color gold, **왼쪽** + paddingTop 2 | Check icon 20 stroke 2.5 (OptionCard 기본), **오른쪽**, selected일 때만 표시 | **위치/아이콘/모양 전면 교체** — 왼쪽 icon 항상 표시 (selected 무관), Sparkles/BookOpen 적용, 우측 Check 제거 |
| 7 | Title typography (카드 내부) | Inter 600 16 / text-primary dual | `font-inter-semibold text-card-title` (Playfair 16 — `OptionCard` 기본) | **font family 교체** Playfair → Inter (`font-inter-semibold` + 16/19.2 — `text-source-card-title` 재사용) |
| 8 | Sub (description) | Inter 13 / muted / cardBody 19.5 | Inter 12 (cardMeta) / muted / mt-1 | **size 13으로 증가, lineHeight 19.5 (cardBody)** |
| 9 | Sub mt-1 (label-sub 간격) | `gap: 4` (TextStack column gap) | `mt-1` (=4) | 동등 (TextStack gap-1로 표현) |
| 10 | **Footer 안내 문구** | ✗ (mode step에 없음 — subtitle에 이미 포함) | ✗ 누락 | OK — keyscreen mode UI 부재 / RN 의도적 제거. §6 deviation 12 |
| 11 | StepRoot gap | 16 | `OnboardingStep` 내부 spacing 다름 | OnboardingStepLayout 처리 (gap-4 = 16) |
| 12 | ChoiceList gap | 12 + marginTop 8 | `gap-3` ✓ (=12) but marginTop 누락 | `mt-2` 추가 |
| 13 | Selected state border | active 시 1px gold + boxShadow ring | active 시 `border-2 border-gold` / inactive `border border-text-disabled` | **inactive border**: `border-text-disabled` → `border.default` (useColorScheme 분기 — language/experience-choice-card 패턴) |
| 14 | Unselected opacity 0.85 | ✓ active ? 1 : 0.85 | ✗ 누락 | 추가 |
| 15 | Pressable press feedback | (`all:unset`, hover 없음) | scale 0.98 (OptionCard) | scale 0.99로 통일 (language/experience-choice-card 일관) |
| 16 | onPress 시 Haptics | (web — 없음) | `OptionCard`에 `Haptics.selectionAsync()` 있음 | 신규 카드 컴포넌트로 옮길 때 보존 |
| 17 | profile update on next | (없음) | `supabase.from('profiles').update({mode:picked}).eq('id',uid)` ✓ | OK |
| 18 | setOnboarded + router.replace | (없음) | ✓ `setOnboarded()` + `router.replace('/(tabs)')` | OK |
| 19 | Toast on error | (없음) | `<Toast tone="error" />` ✓ | OK |
| 20 | router 대상 | (5-step 마지막) | `router.replace('/(tabs)')` | OK — finish step |
| 21 | `_layout.tsx` gestureEnabled | (URL guard) | ✓ `gestureEnabled: false` (확인) | OK |
| 22 | label CTA | (baseline `next`) | `t('onboarding.mode.finish')` "시작하기" | OK — finish 일관 |

**수정 폭 요약:**
- **wrapper 교체:** `OnboardingStep` → `OnboardingStepLayout` (이미 존재)
- **카드 교체:** `OptionCard` → `ExperienceChoiceCard` 일반화 또는 신규 `ModeChoiceCard` 분리 (§10 Q5). ExperienceCard verbatim — items-start + padding 18 사방 + 왼쪽 Lucide icon + 2-tier 텍스트
- **typography:** title 24→26, subtitle text-card-body→onboarding-step-subtitle, card title Playfair 16→Inter 600 16, sub Inter 12→Inter 13
- **i18n:** 변경 없음 (현재 RN 완전)
- **삭제:** progress eyebrow "4 / 4"
- **추가:** 왼쪽 icon (Sparkles/BookOpen), opacity 0.85 unselected, marginTop:8 ChoiceList
- **예상 LOC 변화:** 79 → 약 80~90 LOC (i18n 변경 0 + wrapper 교체만 + 카드 컴포넌트 외부화 시)

### 9-1. ExperienceChoiceCard 일반화 vs ModeChoiceCard 분리

| 옵션 | 장점 | 단점 |
|---|---|---|
| (a) `ExperienceChoiceCard`에 generic `icon: ReactNode` prop 추가 + 이름 변경 (`OnboardingChoiceCard`) | DRY — 한 컴포넌트로 두 step 커버 | 호출부 거추장, props 인터페이스 모호 (variant union 없어짐) |
| (b) `src/components/onboarding/mode-choice-card.tsx` 신규 분리 (ExperienceChoiceCard verbatim 복사 + icon variant만 교체) | 명확한 의미 분리 — variant 타입 강제, props 짧음 | 코드 중복 (~50 LOC 유사) |
| (c) `ExperienceChoiceCard`의 variant union을 확장 (`'beginner' \| 'expert' \| 'first-time' \| 'heavy'`) — 한 카드, icon switch 내부 | 컴포넌트 1개 유지, switch 자연스러움 | onboarding 외 사용처 의미 혼란 (experience와 mode가 다른 도메인) |

**권장: (b)** — language/experience step과 짝 맞춤 (`{component}-choice-card.tsx` 명명 일관). 의미 분리 명확. 50 LOC 중복은 사양상 verbatim 일치이므로 유지보수 부담 적음. 단, (c)도 합리 — design-reviewer/rn-screen-builder가 선호하면 채택 가능.

---

## 10. 미해결 질문 (리더 판단 / escalation)

| # | 질문 | 영향 | 권장 |
|---|---|---|---|
| Q1 | **escalation (deferred from onboarding-3-experience)** RN 5-step (welcome/language/experience/mode/...) vs keyscreen 4-step (welcome/language/experience/done) — mode step 추가 정당성 | step 4 자체의 존재 정당성 + step 4 → home 진입 흐름 | **현재 RN 5-step 유지 결정.** 근거: ① keyscreen은 모바일에서 mode 토글 UI 부재 (demoControls 데스크톱 전용 / 모바일 강제 heavy) → 모바일 RN에서 mode 결정 UI 필요. ② v0.1.0 spec이 first-time/heavy 분기 home UI를 명시 → 초기 mode 선택 필수. ③ 사용자 UX: language → experience → mode → home 순서가 자연스러움 (locale → 깊이 → 사용 빈도). **결론: 5-step 채택, step 4 사양 본 문서로 확정**. |
| Q2 | first-time icon = Sparkles, heavy icon = BookOpen — RN 자체 결정 | 시각 검증 | design-reviewer가 대안 제시 가능. 대안: first-time = `WineOff`(?), heavy = `Library`/`Notebook`. **권장: Sparkles + BookOpen 유지** (Lucide 표준, 의미 명확). |
| Q3 | 라이트 모드 Icon gold (#C9A84C on white = 2.0:1) AA 미달 | 시각 검증 | language/experience step 동일 — design-reviewer 일괄 판정. |
| Q4 | **escalation (deferred from onboarding-3-experience)** Title size 26 (experience) vs 28 (language) 차이 — keyscreen verbatim 유지 vs 통일? | step 위계 일관성 | **mode step도 size 26 채택** (experience step과 동일 — 2-tier 카드 본문 밀도 일관). language step의 28은 카드가 1-tier(title만, sub 없음)이므로 더 큼. **결론: language 28 / experience+mode 26 — keyscreen verbatim 유지**. |
| Q5 | `ExperienceChoiceCard` 일반화 vs `ModeChoiceCard` 분리 vs variant union 확장 (§9-1) | 컴포넌트 구조 | **권장 (b) 분리** — language-choice-card / experience-choice-card 짝 일관. rn-screen-builder 재량. |
| Q6 | i18n 키 구조 정리 — `mode.{firstTime,heavy}` top-level vs `onboarding.mode.*` 통합 | 키 응집도 | **현재 구조 유지** — `mode.{firstTime,heavy}`는 settings/home 등 여러 화면 재사용 (grep 결과). 변경 시 영향 확산 큼. |
| Q7 | onboarding-3-experience §10 Q1 (5-step 정책)의 정식 답변 | step 3/4 사양 commit 영향 | **본 문서 §10 Q1로 해소 — RN 5-step 정식 채택**. onboarding-3-experience.md §10 Q1 status: **RESOLVED — see onboarding-4-mode §10 Q1**. |

**리더 escalation 항목 (요약 1줄 보고):**
- **Q1 (5-step 정책)** — 본 사양으로 정식 결정. onboarding-3-experience Q1 해소. step 4 자체 정당성 확보.

---

## 11. 변경 요청 집계 (rn-screen-builder 게이트로 전달)

**rn-screen-builder 작업 요청:**
1. `app/onboarding/4-mode.tsx` 보강 (위 §9 1~16 + §5 인터랙션 정리)
2. **신규 또는 일반화** `src/components/onboarding/mode-choice-card.tsx` (권장 (b)) — ExperienceCard verbatim 패턴 + icon 매핑 (Sparkles / BookOpen)
   - props: `{ variant: 'first-time' | 'heavy'; title: string; sub: string; selected: boolean; onPress: () => void; }`
   - 또는 `ExperienceChoiceCard` variant union 확장 (대안 (c))
3. `src/lib/i18n/{ko,en}.json` — **변경 없음** (현재 키 그대로 사용)
4. (선택, P0 토큰) Title 26 inline — 또는 `onboardingStepTitleSm`(Playfair 26/31.2) 토큰화 (3-experience + 4-mode 두 사용처 커버). 본 cycle은 inline arbitrary 유지.

**신규 design token 수:** **0건** (모두 기존 토큰 재사용 — `text-onboarding-step-subtitle`, `text-source-card-title`, `text-card-body`, `brand.gold`, `bg-surface`, `border.default` dual)
**신규 i18n 키 수:** **0건** (현재 RN i18n 완전)
**escalation 항목:** **Q1 (5-step 정책 — 본 사양으로 정식 결정, onboarding-3-experience Q1 해소)**

---

## 12. 검증 체크리스트 (rn-screen-builder PR 전 셀프 점검)

- [ ] `OnboardingStepLayout` 사용 (PageRoot padding `32+SafeArea / 24 / 40+SafeArea`, gap 24, StepRoot flex-1 gap-4)
- [ ] Title Playfair 26 / lineHeight 31.2 / text-primary dual (NW arbitrary 또는 inline)
- [ ] Subtitle Inter 14 / text-muted dual (`text-onboarding-step-subtitle`)
- [ ] ChoiceList `gap-3 mt-2` (=12/8)
- [ ] ModeChoiceCard padding 18 사방, rounded-2xl, flex-row items-start gap-3.5
- [ ] ModeChoiceCard bg surface dual, border 1px(unselected, useColorScheme 분기) / 2px brand.gold(selected)
- [ ] ModeChoiceCard opacity active ? 1 : 0.85
- [ ] IconWrap paddingTop 2, Lucide Sparkles(first-time)/BookOpen(heavy) size 24 strokeWidth 1.5 color brand.gold
- [ ] TextStack column gap 4 (flex-1)
- [ ] Card title Inter 600 16 / text-primary dual (`text-source-card-title`)
- [ ] Sub Inter 13 (cardBody) / text-muted dual / 자연 줄바꿈
- [ ] Footer Text **없음** (subtitle에 흡수 — §6 deviation 12)
- [ ] CtaWrapper `mt-auto`, Toast(error만), PrimaryButton w-full, lg, primary, disabled `!picked || saving`, loading saving
- [ ] PrimaryButton label `t('onboarding.mode.finish')` (≠ next)
- [ ] progress eyebrow ("4 / 4") **제거**
- [ ] Haptics.selectionAsync on ModeChoiceCard, Haptics impact Light on CTA (PrimaryButton 내장)
- [ ] profile update + `setOnboarded()` + `router.replace('/(tabs)')` — 현재 RN 5-step finish
- [ ] errorMsg Toast on update 실패 (CtaWrapper 안 PrimaryButton 위)
- [ ] accessibilityRole="radio" + accessibilityState.selected, accessibilityHint=sub
- [ ] Icon accessibilityElementsHidden
- [ ] 다크/라이트 양쪽 토큰 자동 분기 — 하드코딩 hex 0건 (brand.* / dark.* / light.* / withAlpha만)
- [ ] ko/en 양쪽 i18n 키 누락 0건 (변경 없음 — 기존 키 그대로)
- [ ] gestureEnabled: false (_layout.tsx 기존 유지)
- [ ] LOC 100 이하 (또는 신규 카드 컴포넌트 분리 시 합산 140 이하)
