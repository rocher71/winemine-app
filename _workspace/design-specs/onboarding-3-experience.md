# /onboarding/3-experience 디자인 사양

> **버전:** v1 (retroactive hardening — Day 5 기존 구현 77 LOC 갭 보강)
> **작성:** design-spec-author
> **소비자:** rn-screen-builder (다음 게이트), design-reviewer (시각 검증)

---

## 0. 원본 소스

| 우선순위 | 자료 | 경로 |
|---|---|---|
| 1 | JSX `StepExperience` (재귀) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 220–279 |
| 1 | JSX `ExperienceCard` (재귀, experience 전용 카드) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 396–452 |
| 1 | JSX root `<main>` PageRoot (verbatim) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 47–93 |
| 2 | 산문 | (없음 — `pages/onboarding.md` 부재) |
| 2 | keyscreen i18n ko | `../winemine-keyscreen/messages/ko.json` line 38–46 (`onboarding.experience.*`) |
| 2 | keyscreen i18n en | `../winemine-keyscreen/messages/en.json` line 38–46 (`onboarding.experience.*`) |
| 3 | 디자인 시스템 | `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md` |
| 4 | 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` (welcome 화면만 캡쳐 — experience step 별도 캡쳐 없음. 구조는 language step과 같은 wrapper로 추정 가능) |
| 5 | 현재 RN 구현 | `app/onboarding/3-experience.tsx` (77 LOC) |
| 5 | 인접 화면 표준 (이미 hardening 완료) | `_workspace/design-specs/onboarding-2-language.md`, `_workspace/design-specs/settings-experience.md`, `src/lib/design-tokens.ts` (typography 3종 신규 포함), `src/components/onboarding/{onboarding-step-layout, language-choice-card}.tsx` |

**범위 외:**
- AppHeader / BottomNav (onboarding 4 step 모두 미사용)
- step 1 (welcome) / step 2 (language) / step 4 (mode) — 각자 별도 사양
- settings 3 sub 화면 (별도 cycle)

---

## 1. 레이아웃 트리 (verbatim, 시각 위계 1:1)

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
   │  │                    i18n `onboarding.experience.title`
   │  │                    (키스크린 line 233~240 verbatim — fontSize **26** ≠ language step 28)
   │  │
   │  ├─ Text "Subtitle" ─ Inter 14 / regular / text-muted dual / margin:0
   │  │                    i18n `onboarding.experience.subtitle`
   │  │                    (키스크린 line 243~245 verbatim)
   │  │
   │  ├─ View "ChoiceList" ─ flexDirection:column, gap:12, marginTop:8
   │  │  │                  (키스크린 line 246 verbatim — gap=12, marginTop=8)
   │  │  │
   │  │  ├─ ExperienceCard "beginner"
   │  │  │   active = (picked === 'beginner')
   │  │  │   title  = i18n `onboarding.experience.beginnerLabel`
   │  │  │   sub    = i18n `onboarding.experience.beginnerSub`
   │  │  │   icon   = <GlassWater size=24 strokeWidth=1.5 color=brand.gold/>
   │  │  │   onPress → onPick('beginner')
   │  │  │
   │  │  └─ ExperienceCard "expert"
   │  │      active = (picked === 'expert')
   │  │      title  = i18n `onboarding.experience.expertLabel`
   │  │      sub    = i18n `onboarding.experience.expertSub`
   │  │      icon   = <Award size=24 strokeWidth=1.5 color=brand.gold/>
   │  │      onPress → onPick('expert')
   │  │
   │  └─ Text "Footer"   ─ Inter 12 / regular / text-muted dual / margin:0
   │                       i18n `onboarding.experience.footer`
   │                       (키스크린 line 262~271 verbatim — choice list 아래 안내 문구)
   │
   └─ CtaWrapper          ─ marginTop:'auto' (OnboardingStepLayout cta prop)
      │                    (키스크린 line 272 verbatim)
      └─ PrimaryButton    ─ variant=primary, size=lg, block (w-full)
                           disabled = !picked || saving, label = i18n `common.next`
                           onPress → (1) supabase.from('profiles').update({ experience: picked })
                                     (2) router.push('/onboarding/4-mode')
                                     실패 시 Toast(tone="error")
```

### 1-1. ExperienceCard (keyscreen line 396~452 verbatim)

**핵심**: `ChoiceCard`(language)와 **다른 카드**. align flex-start + padding 사방 18 + 2-tier 텍스트(title/sub).

```
Pressable                                              ─ accessibilityRole="radio"
  ├ accessibilityState={ selected: active }              accessibilityLabel = title (+ sub via accessibilityHint 분리 권장)
  ├ padding: 18 (사방 — language의 horizontal-only와 다름)
  ├ borderRadius: 16 (rounded-2xl)
  ├ flexDirection: row, alignItems: **'flex-start'** (≠ language의 center — 텍스트 2줄 보호)
  ├ gap: 14
  ├ background: surface (token, dual)
  ├ border: 1px solid (active ? brand.gold : border.default)
  ├ boxShadow: active ? '0 0 0 1px rgba(139,26,42,0.4)' : 'none'   ← RN deviation §6 (border 1→2px)
  └ opacity: active ? 1 : 0.85                            ← 키스크린 verbatim
│
├─ View "IconWrap"   ─ paddingTop: 2 (텍스트 첫 줄 baseline 정렬용)
│  │                   (키스크린 line 427 verbatim)
│  │
│  └─ Lucide Icon    ─ GlassWater (beginner) | Award (expert)
│                      size=24, strokeWidth=1.5, color=brand.gold
│                      (NW: `lucide-react-native` 패키지)
│
└─ View "TextStack"  ─ flexDirection: column, gap: 4
   │                   (키스크린 line 428 verbatim)
   │
   ├─ Text "title"   ─ Inter 16 / weight 600 / text-primary dual
   │                   (키스크린 line 429~437 verbatim — fontSize **16** ≠ language card 18)
   │
   └─ Text "sub"     ─ Inter 13 / regular / text-muted dual
                       lineHeight: 1.4 = 13 × 1.4 = 18.2 (키스크린 line 444)
                       (키스크린 line 439~447 verbatim — fontSize 13, lineHeight 1.4)
```

### 1-2. 시각 비율 측정 (스크린샷 onboarding.png + 키스크린 CSS 검증)

- 디바이스 viewport 가정: 390pt × 844pt (iPhone 13/14)
- ExperienceCard 내부 수직 누적: padding-top 18 + title(19.2 = 16 × 1.2 default) + gap 4 + sub 1줄(18.2) + padding-bottom 18 ≈ **77pt** (sub 1줄 시)
- sub 2줄 시: 77 + 18.2 = **95pt** (한국어 expert sub "WSET SAT · 카우달리 · 결함 점검"은 1줄로 추정 — 24자, Inter 13에서 폭 충분)
- StepRoot 누적: Title(31.2) + 16 + Subtitle(~20) + 16(gap) + 8(marginTop) + ChoiceList(77+12+77=166) + 16(gap) + Footer(~17) ≈ **312pt**
- 잔여 영역(~460pt)이 Footer ↔ CtaWrapper 사이 빈 공간 — keyscreen `marginTop:auto`가 CTA를 paddingBottom 위로 push
- CTA wrapper는 하단에서 paddingBottom:40 + button 52pt 위로 떨어진 위치

---

## 2. NativeWind v4 className 매핑표

> 기존 토큰(`src/lib/design-tokens.ts` + `tailwind.config.ts`) 최우선 사용. 신규 토큰은 §3 참조.

### 2-1. PageRoot / StepRoot / CtaWrapper

→ `OnboardingStepLayout` 컴포넌트가 이미 처리 (onboarding-2-language §1 verbatim). 변경 없음.

### 2-2. Title Text (size 26, language step 28과 다름)

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-playfair)` | `font-playfair` | — | A | 등록됨 |
| `fontSize: 26` | — | `fontSize: 26, lineHeight: 31.2` | C | **신규 토큰 권장** `onboardingStepTitleSm` (Playfair 26/31.2) — language의 28과 다른 위계. 또는 NW arbitrary `text-[26px] leading-[31px]`. **본 cycle 권장: arbitrary inline** (단발 사용처 — 향후 step 4도 별도 size일 가능성, 토큰 비대 회피) |
| `color: var(--color-cream)` | `text-text-primary dark:text-text-primary` | — | B | dual 토큰 (cream dual로 자동 분기) |
| `margin: 0` | — | — | — | RN Text default |

### 2-3. Subtitle Text (동일 — language 일치)

| 키스크린 | NW v4 className | 분류 |
|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter` | A |
| `fontSize: 14` | `text-onboarding-step-subtitle` | A (이미 토큰화 — onboarding-2-language §3-2 P0 결과로 추가됨) |
| `color: var(--color-text-muted)` | `text-text-muted dark:text-text-muted` | B |
| `margin: 0` | — | — |

### 2-4. ChoiceList wrapper

| 키스크린 | NW v4 | 분류 |
|---|---|---|
| `display:flex; flexDirection:column` | (default) | A |
| `gap:12` | `gap-3` | A |
| `marginTop:8` | `mt-2` | A |

### 2-5. ExperienceCard root Pressable

| 키스크린 (inline) | NW v4 className | inline style | 분류 | 사유 |
|---|---|---|---|---|
| `all: unset` | (제거) | — | D | RN Pressable 기본 무의미 |
| `cursor: pointer` | (제거) | — | D | RN cursor 없음 |
| `display:flex; alignItems:flex-start; gap:14` | `flex-row items-start gap-3.5` | — | A | spacing[3.5]=14 등록됨 |
| `padding: 18` | — | `padding: 18` | C | NW spacing 18 없음(4/5=16/20). inline 권장 (단발) |
| `borderRadius: 16` | `rounded-2xl` | — | A | NW v4 2xl=16 |
| `background: var(--color-surface)` | `bg-surface dark:bg-surface` | — | B | dual 토큰 |
| `border: 1px solid (active ? gold : border-default)` | — | `borderWidth: active ? 2 : 1, borderColor: active ? brand.gold : borderUnselected` | B+D | useColorScheme 분기 (language-choice-card 동일 패턴) — `borderUnselected = scheme === 'light' ? light.border.default : dark.border.default` |
| `boxShadow: active ? '0 0 0 1px rgba(139,26,42,0.4)' : 'none'` | — | (deviation §6) | D | RN 불가. **채택: border 1→2px** (language-choice-card 동일) |
| `opacity: active ? 1 : 0.85` | — | `opacity: active ? 1 : 0.85` (pressed 시 dim 추가) | A | 표준 |

### 2-6. IconWrap (paddingTop: 2)

| 키스크린 (inline) | NW v4 | inline | 분류 |
|---|---|---|---|
| `paddingTop: 2` | `pt-0.5` | — | A | NW v4 0.5=2 |

### 2-7. Lucide Icon (GlassWater / Award)

- import: `import { GlassWater, Award } from 'lucide-react-native'`
- props: `size={24}` `strokeWidth={1.5}` `color={brand.gold}`
- RN deviation: 키스크린은 `color="var(--color-gold)"` CSS var. RN은 brand.gold 직접 전달 (dual 분기 안 함 — gold는 brand 고정값).

### 2-8. TextStack (column gap 4)

| 키스크린 | NW v4 | 분류 |
|---|---|---|
| `display:flex; flexDirection:column` | (default) | A |
| `gap: 4` | `gap-1` | A |

### 2-9. title Text (size 16, language card 18과 다름)

| 키스크린 (inline) | NW v4 className | inline | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter-semibold` | — | A | weight 600 포함 |
| `fontSize: 16` | `text-card-title`?? | — | A | `cardTitle`(Playfair 16/20.8) — family 불일치(Inter 필요). **권장: `text-source-card-title`** (Inter 600 16/19.2 — notes-new에서 이미 토큰화). 의미 정합 OK. 또는 NW arbitrary `text-[16px] leading-[19px]` |
| `fontWeight: 600` | (위 font-inter-semibold 포함) | — | A | 표준 |
| `color: var(--color-cream)` | `text-text-primary dark:text-text-primary` | — | B | dual |

### 2-10. sub Text (size 13, lineHeight 1.4)

| 키스크린 (inline) | NW v4 className | inline | 분류 | 사유 |
|---|---|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter` | — | A | regular |
| `fontSize: 13` | `text-card-body` | — | A | cardBody(Inter 13/19.5) — lineHeight 1.5 (키스크린 1.4=18.2). 미세 차이(1.3pt). **수용 가능** (cardBody 재사용). 엄밀 verbatim 원하면 NW arbitrary `text-[13px] leading-[18px]` |
| `color: var(--color-text-muted)` | `text-text-muted dark:text-text-muted` | — | B | dual |
| `lineHeight: 1.4` | (위 cardBody 19.5 또는 arbitrary 18) | — | — | 본 사양: cardBody 채택 (1.5 ratio, +1.3pt). 시각 차이 미미. |

### 2-11. Footer Text (size 12, choice list 아래)

| 키스크린 (inline) | NW v4 | inline | 분류 |
|---|---|---|---|
| `fontFamily: var(--font-inter)` | `font-inter` | — | A |
| `fontSize: 12` | `text-card-meta` | — | A | cardMeta(Inter 12/14.4) — lineHeight 1.2. 키스크린 line 262~271은 lineHeight 미지정 → default. cardMeta 재사용 OK |
| `color: var(--color-text-muted)` | `text-text-muted dark:text-text-muted` | — | B | dual |
| `margin: 0` | — | — | — | default |

### 2-12. PrimaryButton (block, lg, primary)

기존 `src/components/shared/primary-button.tsx` 그대로. wrapper `w-full`. variant primary, size lg, disabled `!picked || saving`, loading `saving`.

---

## 3. 디자인 토큰 (lib/design-tokens.ts + tailwind.config.ts)

### 3-1. 기존 토큰 재사용 (확장 불필요)

| 사용처 | 토큰 |
|---|---|
| 페이지 배경 | `bg.deepest` dual (`bg-bg-deepest`) — OnboardingStepLayout 처리 |
| 카드 배경 | `bg.surface` dual (`bg-surface`) |
| 카드 보더 unselected | `dark.border.default` / `light.border.default` (inline + useColorScheme 분기) |
| 카드 보더 selected | `brand.gold` (inline) |
| Title 색 | `text.primary` dual |
| Subtitle/sub/footer 색 | `text.muted` dual |
| Subtitle typography | `onboarding-step-subtitle` (Inter 14/20) — 이미 등록 |
| 카드 title typography | `text-source-card-title` (Inter 600 16/19.2) — notes-new에서 토큰화됨 |
| sub typography | `text-card-body` (Inter 13/19.5) — lineHeight 1.3pt 차이 수용 |
| Footer typography | `text-card-meta` (Inter 12/14.4) |
| Icon color | `brand.gold` (inline — color prop) |
| spacing 3.5 (14) | 등록됨 |
| rounded-2xl (16) | NW v4 기본 |
| PrimaryButton | 기존 컴포넌트 |

### 3-2. 신규 typography 토큰 — **0건 필수, 1건 선택**

- **Title 26**: language step(28)과 다름. 단발 사용(experience step에만) — NW arbitrary `text-[26px] leading-[31px]` 또는 inline 권장. 토큰화 가치 낮음.
  - 단, step 4 (mode) 사양 작성 시 같은 26 size 사용 확인되면 `onboardingStepTitleSm`(Playfair 26/31.2)로 토큰화 권장 — **본 cycle은 inline arbitrary 채택, 토큰 추가 보류**

### 3-3. 신규 색/shadow 토큰 — **0건**

모두 기존 토큰 또는 brand.gold 직접 사용.

---

## 4. 상태 variants

### 4-1. default (picked === null)

- ExperienceCard 둘 다 unselected:
  - border 1px solid `border.default` (dark `#5A3D6A` / light `#E0D2BC`)
  - opacity 0.85
  - icon brand.gold (active 무관 — 키스크린 verbatim)
- PrimaryButton: `disabled` (opacity 0.5)

### 4-2. selected — picked === 'beginner'

- beginner row:
  - border 1px → **2px** solid `brand.gold` (RN deviation §6)
  - opacity 1
- expert row: unselected 그대로
- PrimaryButton: 활성

### 4-3. selected — picked === 'expert'

- expert row: 위와 동일 패턴 (border 2px gold, opacity 1)
- beginner row: unselected
- PrimaryButton: 활성

### 4-4. pressed (Pressable)

- 카드: scale 0.99, opacity (active ? 0.95 : 0.80) — language-choice-card / settings-radio-row 일관

### 4-5. saving (CTA loading)

- PrimaryButton `loading={saving}` → ActivityIndicator 표시. 카드는 disabled되지 않음(키스크린 verbatim, 사용자가 재선택 가능). 단 onPress가 saving중이면 사양상 PrimaryButton.onPress가 막혀있으므로 영향 없음.

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
| Subtitle / sub / footer | `dark.text.muted` `#CABDA8` |
| Icon (GlassWater / Award) | `brand.gold` `#C9A84C` |
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
| Subtitle / sub / footer | `light.text.muted` `#8B7766` |
| Icon | `brand.gold` `#C9A84C` (단일) |
| CTA bg | `brand.wineRed` `#8B1A2A` (단일) |
| CTA text | `brand.cream` `#F5F0E8` |

**light 모드 대비 점검 (WCAG AA 4.5:1):**
- Title `#2A1A14` on `#FAF5EC` → 16:1 (AAA)
- Subtitle `#8B7766` on `#FAF5EC` → 4.7:1 (AA)
- Card title `#2A1A14` on `#FFFFFF` → 18.7:1 (AAA)
- Sub `#8B7766` on `#FFFFFF` → 5.0:1 (AA)
- Footer `#8B7766` on `#FAF5EC` → 4.7:1 (AA)
- Icon gold `#C9A84C` on white card → 2.0:1 (**AA 미달**) — 그러나 icon은 보조 식별자 (title이 본 라벨). language step IconBadge와 동일 패턴. design-reviewer 시각 검증 시 라이트 모드 onboarding 캡쳐 확인 필요 — §10 Q3.

### 4-9. ko / en locale

| key | ko (keyscreen) | en (keyscreen) |
|---|---|---|
| `onboarding.experience.title` | "와인 경험을 알려주세요" | "Tell us about your wine experience" |
| `onboarding.experience.subtitle` | "이에 따라 테이스팅 노트가 다르게 표시돼요" | "We'll tailor the tasting note experience" |
| `onboarding.experience.beginnerLabel` | "와인을 가볍게 즐기시나요?" | "Just getting started with wine?" |
| `onboarding.experience.beginnerSub` | "단맛·신맛·향을 풀어쓴 5분짜리 기록" | "5-minute notes in everyday words" |
| `onboarding.experience.expertLabel` | "와인을 깊게 파고드시나요?" | "Diving deep into wine?" |
| `onboarding.experience.expertSub` | "WSET SAT · 카우달리 · 결함 점검" | "WSET SAT, caudalies, fault checks" |
| `onboarding.experience.footer` | "설정에서 언제든 변경할 수 있어요" | "Change anytime in settings" |
| `common.next` | "다음" | "Next" |

**i18n 변경 폭 (§8 detail):**
- 현재 RN: `onboarding.experience.{title, subtitle, beginnerDescription, expertDescription}` 4 키. **불일치** — keyscreen은 6 키 (beginnerLabel/Sub + expertLabel/Sub + footer + subtitle). RN의 `beginnerDescription` 1줄을 keyscreen verbatim 2-tier (Label + Sub) 분리로 교체 필요.
- ko subtitle 현재 RN "노트 작성 방식을 맞춰드립니다" vs keyscreen "이에 따라 테이스팅 노트가 다르게 표시돼요" — **keyscreen verbatim 채택**.
- en subtitle 현재 RN "We'll tune note-taking accordingly" vs keyscreen "We'll tailor the tasting note experience" — **keyscreen verbatim 채택**.

---

## 5. 인터랙션

| 요소 | 트리거 | 동작 | 피드백 |
|---|---|---|---|
| ExperienceCard "beginner" | onPress | `Haptics.selectionAsync()` → `setPicked('beginner')` | scale 0.99, opacity dim |
| ExperienceCard "expert" | onPress | `Haptics.selectionAsync()` → `setPicked('expert')` | 동일 |
| 같은 옵션 재선택 | onPress | no-op (state 동일) | 햅틱만 |
| PrimaryButton "다음" | onPress (picked !== null) | `Haptics.impactAsync(Light)` → setSaving(true) → `supabase.from('profiles').update({ experience: picked }).eq('id', uid)` → 성공 시 `router.push('/onboarding/4-mode')` / 실패 시 `setErrorMsg(t('errors.onboardingSaveFailed'))` | loading spinner, disabled 동안 인터랙션 차단 |
| swipe back gesture | (없음) | `_layout.tsx` `gestureEnabled: false` 적용됨 | step 간 뒤로 이동 차단 |
| 키보드 | (해당 없음) | TextInput 없음 | — |

### 5-1. language step과의 차이

- language step `onPick`은 즉시 `changeLanguage(locale)` 호출하여 UI 텍스트 전환. experience step은 i18n 영향 없음 — `setPicked(value)`만 호출.
- 현재 RN 구현(line 20~23) 그대로 유지 (단순한 `setPicked + errorMsg clear`).

### 5-2. PrimaryButton 활성 조건

`disabled={!picked || saving}` — 현재 RN 그대로.

### 5-3. 애니메이션

- 키스크린 StepExperience에는 framer-motion 없음 (StepWelcome / StepDone만 사용).
- RN도 추가 애니메이션 불필요. expo-router `slide_from_right` 기본 전환만.

---

## 6. RN deviation 사유

| # | 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|---|
| 1 | `boxShadow: '0 0 0 1px rgba(139,26,42,0.4)'` (selected ring) | **borderWidth 1 → 2px (active)**, borderColor = `brand.gold` | RN ShadowProps는 outset only. CSS 1px ring 직접 매핑 불가. language-choice-card 동일 채택 — 정합성 우선. |
| 2 | `cursor: pointer` | (제거) | RN cursor 없음 |
| 3 | `all: unset` on `<button>` | (제거) | RN Pressable 기본 무 스타일 |
| 4 | hover 상태 | `pressed && opacity dim + scale 0.99` | RN hover 없음 — settings-radio-row / language-choice-card 일관 |
| 5 | `var(--color-bg-deepest)` CSS var | NW v4 `bg-bg-deepest` (dual 토큰) | OnboardingStepLayout 처리됨 |
| 6 | `var(--color-gold)` CSS var (Icon color) | `brand.gold` 직접 전달 | gold는 brand 고정 — dual 분기 안 함 |
| 7 | `useTranslations('common')` sub-render 안 호출 (line 274) | 컴포넌트 최상위 1회 `const { t } = useTranslation()` 후 `t('common.next')` | RN hooks rule 안전 |
| 8 | framer-motion (StepExperience 미사용) | — | deviation 없음 |
| 9 | `<button>` `<div>` semantic HTML | `<Pressable>` `<View>` `<Text>` | RN 표준 |
| 10 | `lineHeight: 1.4` (키스크린 sub) | `text-card-body` lineHeight 1.5 (19.5px) 재사용 | 1.3pt 차이 수용. 엄격 verbatim 시 NW arbitrary `text-[13px] leading-[18px]` — §10 Q2 |

---

## 7. 접근성

| 요소 | accessibilityRole | accessibilityLabel | accessibilityState | 추가 |
|---|---|---|---|---|
| PageRoot View | (default) | — | — | — |
| Title Text | `header` | (자동) | — | screen reader 첫 노출 |
| Subtitle Text | `text` | — | — | — |
| ExperienceCard "beginner" | `radio` | `t('onboarding.experience.beginnerLabel')` | `{ selected: picked === 'beginner' }` | hitSlop 6, `accessibilityHint = t('onboarding.experience.beginnerSub')` (sub를 hint로 분리 — settings-experience §6 동일 패턴) |
| ExperienceCard "expert" | `radio` | `t('onboarding.experience.expertLabel')` | `{ selected: picked === 'expert' }` | hitSlop 6, `accessibilityHint = t('onboarding.experience.expertSub')` |
| Icon (GlassWater / Award) | — | `accessibilityElementsHidden + importantForAccessibility="no-hide-descendants"` | — | 보조 식별자, screen reader 중복 차단 |
| Footer Text | `text` | — | — | — |
| PrimaryButton | `button` (내장) | `t('common.next')` | `{ disabled, busy: loading }` | PrimaryButton 기본 |

**focus 순서:** Title → Subtitle → beginner → expert → Footer → PrimaryButton.

**최소 타겟 크기:** ExperienceCard ≈ 77pt (sub 1줄) → AA 통과. PrimaryButton 52pt → AA.

**다이내믹 타입:** Title 26pt (ko "와인 경험을 알려주세요" 9자) — XXXL에서도 1~2줄 wrap OK. sub 13pt 자연 줄바꿈 (numberOfLines 미지정 — keyscreen verbatim).

---

## 8. i18n 키 목록 (ko/en 완성형)

```json
// src/lib/i18n/ko.json — onboarding.experience.* 교체
{
  "onboarding": {
    "experience": {
      "title": "와인 경험을 알려주세요",
      "subtitle": "이에 따라 테이스팅 노트가 다르게 표시돼요",
      "beginnerLabel": "와인을 가볍게 즐기시나요?",
      "beginnerSub": "단맛·신맛·향을 풀어쓴 5분짜리 기록",
      "expertLabel": "와인을 깊게 파고드시나요?",
      "expertSub": "WSET SAT · 카우달리 · 결함 점검",
      "footer": "설정에서 언제든 변경할 수 있어요"
    }
  }
}

// src/lib/i18n/en.json — onboarding.experience.* 교체
{
  "onboarding": {
    "experience": {
      "title": "Tell us about your wine experience",
      "subtitle": "We'll tailor the tasting note experience",
      "beginnerLabel": "Just getting started with wine?",
      "beginnerSub": "5-minute notes in everyday words",
      "expertLabel": "Diving deep into wine?",
      "expertSub": "WSET SAT, caudalies, fault checks",
      "footer": "Change anytime in settings"
    }
  }
}
```

**i18n 변경 폭:**
- **제거 (deprecate)**: `onboarding.experience.beginnerDescription` / `expertDescription` (현재 RN — 2 키 ko + 2 키 en = 4 키)
- **신규 추가**: `beginnerLabel`, `beginnerSub`, `expertLabel`, `expertSub`, `footer` (5 키 × ko/en = 10 키)
- **교체**: `subtitle` ko + en (2 키 — 문구 변경)
- **기존 보존**: `title` (양쪽 일치)
- 다른 화면에서 `beginnerDescription` / `expertDescription` 참조 여부 grep 확인 — 없을 가능성 높음(onboarding 전용 키). rn-screen-builder가 grep 후 안전하게 제거.

**기존 settings.experiencePage.{beginnerDesc, expertDesc}와의 관계:** 별개 — settings 화면 description 문구는 더 상세 ("WSET SAT · 카우달리 · 결함 점검 등 정밀 도구가 모두 노출됩니다."). onboarding은 짧은 권유형 ("WSET SAT · 카우달리 · 결함 점검"). **유지 (intentional 차이)** — keyscreen은 onboarding 6 키 / settings 4 키 분리.

---

## 9. 현재 구현 차이 (retroactive — `app/onboarding/3-experience.tsx` 77 LOC 분석)

| # | 항목 | 키스크린 원본 | 현재 RN 구현 | 수정 필요 |
|---|---|---|---|---|
| 1 | **레이아웃 wrapper** | `<main>` PageRoot + StepRoot (flex-1 gap-16, padding 32/24/40) | `OnboardingStep` 컴포넌트 (progress eyebrow "3 / 4" + insets.top + `px-6 pt-6` + ScrollView + footer block) | **wrapper 교체** → `OnboardingStepLayout` (language step과 동일 — 이미 구현됨) |
| 2 | **progress eyebrow** ("3 / 4") | ✗ (키스크린 없음) | `<Text>{t('onboarding.progress', {current:3, total:4})}</Text>` 노출 (`OnboardingStep` 내장) | **제거** — wrapper 교체로 자동 해결 |
| 3 | Title font size | Playfair 26 / lineHeight 31.2 / margin 0 | `text-page-title` (Playfair 24/28.8) + `mt-3` | **size 26 / lineHeight 31.2** inline 또는 arbitrary (§3-2) |
| 4 | Subtitle font | Inter 14 / muted / margin 0 | `text-card-body` (Inter 13/19.5) text-secondary `mt-2` | **`text-onboarding-step-subtitle` + text-muted** (이미 토큰화) |
| 5 | **ExperienceCard 모양** | padding 18 사방, rounded-2xl(16), items-start, gap 14, Lucide icon 24 gold + paddingTop 2 + title Inter 600 16 + sub Inter 13 1.4 muted | `OptionCard` 컴포넌트 (`rounded-xl`, `px-4 py-4`, `flex-row justify-between`, items-center, Check icon right side, title `text-card-title`=Playfair 16, description `text-card-meta`=Inter 12) | **컴포넌트 교체** — `OptionCard` 부적합. 신규 `OnboardingExperienceCard` 또는 3-experience.tsx inline. ExperienceCard verbatim 패턴 |
| 6 | Icon | GlassWater (beginner) / Award (expert), Lucide, size 24, strokeWidth 1.5, color gold, **왼쪽** + paddingTop 2 | Check icon 20 stroke 2.5, **오른쪽**, selected일 때만 표시 | **위치/아이콘/모양 전면 교체** — 왼쪽 icon 항상 표시 (selected 무관), GlassWater/Award 적용, 우측 Check 제거 |
| 7 | Title typography | Inter 600 16 / text-primary dual | `font-inter-semibold text-card-title` (Playfair 16) | **font family 교체** Playfair → Inter (`font-inter-semibold` + 16/19.2 — `source-card-title` 토큰 재사용) |
| 8 | Sub (description) | Inter 13 / muted / lineHeight 1.4 (18.2) | Inter 12 (cardMeta) / muted / mt-1 | **size 13으로 증가, lineHeight 19.5 (cardBody)** 또는 arbitrary 18 |
| 9 | Sub mt-1 (label-sub 간격) | `gap: 4` (TextStack column gap) | `mt-1` (=4) | 동등 (TextStack gap-1로 표현) |
| 10 | **Footer 안내 문구** | Inter 12 muted "설정에서 언제든 변경할 수 있어요" (choice list 아래) | ✗ 누락 | **추가** — 신규 i18n 키 `onboarding.experience.footer` |
| 11 | StepRoot gap | 16 | `OnboardingStep` 내부 spacing 다름 | OnboardingStepLayout 처리 (gap-4 = 16) |
| 12 | ChoiceList gap | 12 + marginTop 8 | `gap-3` ✓ (=12) but marginTop 누락 | `mt-2` 추가 |
| 13 | Selected state border | active 시 1px gold + boxShadow ring | active 시 `border-2 border-gold` / inactive `border border-text-disabled` | **inactive border**: `border-text-disabled` → `border.default` (useColorScheme 분기 — language-choice-card 패턴) |
| 14 | Unselected opacity 0.85 | ✓ active ? 1 : 0.85 | ✗ 누락 | 추가 |
| 15 | Pressable press feedback | (`all:unset`, hover 없음) | scale 0.98 (OptionCard) | scale 0.99로 통일 (language-choice-card 일관) |
| 16 | onPress 시 Haptics | (web — 없음) | `OptionCard`에 `Haptics.selectionAsync()` 있음 | 신규 카드 컴포넌트로 옮길 때 보존 |
| 17 | profile update on next | (키스크린 mock) | `supabase.from('profiles').update({experience:picked}).eq('id',uid)` ✓ | OK |
| 18 | Toast on error | (없음) | `<Toast tone="error" />` ✓ | OK |
| 19 | router.push 대상 | `/onboarding/done` (keyscreen 4-step: welcome→language→experience→done) | `router.push('/onboarding/4-mode')` | **유지** — RN은 5-step (welcome/language/experience/mode/...). keyscreen 4-step 구조와 다름. v0.1.0 spec 결정 — §10 Q1 |
| 20 | `_layout.tsx` gestureEnabled | (URL guard) | ✓ `gestureEnabled: false` | OK |

**수정 폭 요약:**
- **wrapper 교체:** `OnboardingStep` → `OnboardingStepLayout` (이미 존재, language step 사용 중)
- **카드 교체:** `OptionCard` → 신규 `OnboardingExperienceCard` (또는 3-experience.tsx inline). ExperienceCard verbatim — items-start + padding 18 사방 + 왼쪽 Lucide icon + 2-tier 텍스트
- **typography:** title 24→26, subtitle text-card-body→onboarding-step-subtitle, card title Playfair 16→Inter 600 16, sub Inter 12→Inter 13
- **i18n:** beginnerDescription/expertDescription → beginnerLabel/Sub + expertLabel/Sub + footer (단어 자체 교체)
- **삭제:** progress eyebrow "3 / 4"
- **추가:** Footer 안내 문구, 왼쪽 icon (GlassWater/Award), opacity 0.85 unselected, marginTop:8 ChoiceList
- **예상 LOC 변화:** 77 → 약 95~110 LOC (또는 신규 `OnboardingExperienceCard` 분리 시 3-experience.tsx 약 80 + card 컴포넌트 약 60)

### 9-1. OnboardingExperienceCard 분리 권장

| 옵션 | 장점 | 단점 |
|---|---|---|
| (a) `src/components/onboarding/experience-choice-card.tsx` 분리 | 재사용 X (단일 사용처), 그러나 language-choice-card와 패턴 짝 맞춤 + 가독성 | 파일 1개 증가 |
| (b) `app/onboarding/3-experience.tsx` inline 구현 | 파일 단일 | LOC 증가, 코드 분산 |

**권장: (a)** — language step과 동일 디렉토리 구조로 짝 맞춤. props 인터페이스:
```tsx
{ variant: 'beginner' | 'expert'; title: string; sub: string; selected: boolean; onPress: () => void; }
```
Lucide icon 매핑(`variant === 'beginner' ? GlassWater : Award`)을 컴포넌트 내부에서 처리.

---

## 10. 미해결 질문 (리더 판단 / escalation)

| # | 질문 | 영향 | 권장 |
|---|---|---|---|
| Q1 | RN 5-step (welcome/language/experience/mode/...) vs keyscreen 4-step (welcome/language/experience/done) — mode step 추가 정당성 | step 4 (mode) 사양 작성 시 영향 — keyscreen에 없는 step | **현재 RN 5-step 유지** (v0.1.0 spec 결정 — first-time/heavy 분기 필요). step 4 사양은 별도 cycle. |
| Q2 | sub lineHeight 1.4 (18.2) vs cardBody 1.5 (19.5) 토큰 재사용 | 1.3pt 시각 차이 | **cardBody 재사용** (시각 차이 미미). 엄격 verbatim 시 NW arbitrary `leading-[18px]`. design-reviewer 판단 위임. |
| Q3 | 라이트 모드 Icon gold (#C9A84C on white = 2.0:1) AA 미달 | 시각 검증 | language step IconBadge와 동일 패턴 — design-reviewer 시각 게이트에서 일괄 판정. 미달 시 stroke 2.0 증가 또는 gold-deep(`#A07F2E`) 검토. |
| Q4 | Title size 26 (experience) vs 28 (language) 차이 — keyscreen verbatim 유지 vs 통일 (28로 일관)? | onboarding 4 step 위계 일관성 | **keyscreen verbatim 26 유지** — 의도적 차이 추정 (experience는 sub 텍스트 + footer로 본문 밀도 높음 → title 살짝 축소). step 4 사양에서 재확인. |
| Q5 | `OnboardingExperienceCard` 분리 vs inline | 재사용성 | **분리 권장 (§9-1 (a))** — language-choice-card와 짝 맞춤. |
| Q6 | i18n 키 교체 폭이 큼 (`beginnerDescription` 등 4 키 deprecate + 10 키 신규) — 별도 commit 권장? | git history 가독성 | **2-commit 분리 권장** — (1) i18n 키 추가/교체, (2) 화면 코드. rn-screen-builder 재량. |

**리더 escalation:** Q1 (5-step 정책 재확인 — step 4 cycle 영향), Q4 (title size 정책 — 후속 step 사양 영향). Q2/Q3은 design-reviewer 게이트, Q5/Q6은 rn-screen-builder 재량.

---

## 11. 변경 요청 집계 (rn-screen-builder 게이트로 전달)

**rn-screen-builder 작업 요청:**
1. `app/onboarding/3-experience.tsx` 보강 (위 §9 1~16 + §5 인터랙션 정리)
2. **신규** `src/components/onboarding/experience-choice-card.tsx` — ExperienceCard verbatim
   - props: `{ variant: 'beginner' | 'expert'; title: string; sub: string; selected: boolean; onPress: () => void; }`
   - 또는 3-experience.tsx inline (§10 Q5)
3. `src/lib/i18n/ko.json` + `en.json` `onboarding.experience.*` 키 교체:
   - **제거**: `beginnerDescription`, `expertDescription`
   - **신규**: `beginnerLabel`, `beginnerSub`, `expertLabel`, `expertSub`, `footer`
   - **교체**: `subtitle` (양쪽 모드 keyscreen verbatim)
4. (선택, P0 토큰) Title 26 inline — 토큰 추가 보류 (§3-2). 또는 step 4 사양과 함께 `onboardingStepTitleSm`(Playfair 26/31.2) 토큰화 — **본 cycle은 inline arbitrary 채택**

**i18n 키 교체 commit 분리 권장:** 키 교체 commit → 화면 코드 commit (2단계, §10 Q6).

**신규 design token 수:** **0건** (모두 기존 토큰 재사용 — `text-onboarding-step-subtitle`, `text-source-card-title`, `text-card-body`, `text-card-meta`, `brand.gold`, `bg-surface`, `border.default` dual)
**신규 i18n 키 수:** **5건** (×2 locale = 10) + 교체 1건 (×2 = 2). 제거 2건 (×2 = 4)
**escalation 항목:** Q1 (5-step 정책), Q4 (title size 정책 — step 4 사양 영향)

---

## 12. 검증 체크리스트 (rn-screen-builder PR 전 셀프 점검)

- [ ] `OnboardingStepLayout` 사용 (PageRoot padding `32+SafeArea / 24 / 40+SafeArea`, gap 24, StepRoot flex-1 gap-4)
- [ ] Title Playfair 26 / lineHeight 31.2 / text-primary dual (NW arbitrary 또는 inline)
- [ ] Subtitle Inter 14 / text-muted dual (`text-onboarding-step-subtitle`)
- [ ] ChoiceList `gap-3 mt-2` (=12/8)
- [ ] ExperienceCard padding 18 사방, rounded-2xl, flex-row items-start gap-3.5
- [ ] ExperienceCard bg surface dual, border 1px(unselected, useColorScheme 분기) / 2px brand.gold(selected)
- [ ] ExperienceCard opacity active ? 1 : 0.85
- [ ] IconWrap paddingTop 2, Lucide GlassWater/Award size 24 strokeWidth 1.5 color brand.gold
- [ ] TextStack column gap 4
- [ ] Card title Inter 600 16 / text-primary dual (`text-source-card-title`)
- [ ] Sub Inter 13 (cardBody) / text-muted dual / 자연 줄바꿈
- [ ] Footer Inter 12 (cardMeta) text-muted dual, `t('onboarding.experience.footer')`
- [ ] CtaWrapper `mt-auto`, PrimaryButton w-full, lg, primary, disabled `!picked || saving`, loading saving
- [ ] progress eyebrow ("3 / 4") **제거**
- [ ] Haptics.selectionAsync on ExperienceCard, Haptics impact Light on CTA (PrimaryButton 내장)
- [ ] profile update + router.push('/onboarding/4-mode') — 현재 RN 5-step 유지
- [ ] errorMsg Toast on update 실패 (CtaWrapper 안 PrimaryButton 위)
- [ ] accessibilityRole="radio" + accessibilityState.selected, accessibilityHint=sub
- [ ] Icon accessibilityElementsHidden
- [ ] 다크/라이트 양쪽 토큰 자동 분기 — 하드코딩 hex 0건 (brand.* / dark.* / light.* / withAlpha만)
- [ ] ko/en 양쪽 i18n 키 누락 0건
- [ ] gestureEnabled: false (_layout.tsx 기존 유지)
- [ ] LOC 110 이하 (또는 신규 카드 컴포넌트 분리 시 합산 140 이하)
