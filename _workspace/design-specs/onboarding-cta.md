# /onboarding/* CTA 버튼 사양 (cross-cutting PATCH)

> **버전:** v1 (PATCH — 4 step 공통 CTA 정합)
> **작성:** design-spec-author / Day 6 follow-up
> **소비자:** rn-screen-builder (PrimaryButton 변경 + 4 step className 정합), design-reviewer
> **scope:** 4 step (welcome/language/experience/mode)의 primary CTA 시각·동작·접근성만. 4 step 화면 자체 layout 변경 X. BottomNav 변경 X. settings 등 다른 화면의 PrimaryButton 사용 X (별도 cycle).

---

## 0. 원본 소스

| 우선순위 | 자료 | 경로 |
|---|---|---|
| 1 | JSX `PrimaryButton` 컴포넌트 (verbatim) | `../winemine-keyscreen/src/components/shared/primary-button.tsx` line 1–107 |
| 1 | JSX 4 step 사용처 (variant·size·prop 패턴) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 163, 212, 273, 323, 326 |
| 1 | JSX root `<main>` wrapper (CtaWrapper 위치) | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 47–93, 161 (`marginTop: 'auto'`) |
| 2 | 산문 사양 | (없음 — `pages/onboarding*.md` 부재) |
| 3 | 디자인 시스템 컴포넌트 사양 | `../winemine-keyscreen/docs/design-system/components.md` §2-1 PrimaryButton table (line 56–73) |
| 3 | 디자인 시스템 토큰 (색) | `../winemine-keyscreen/styles/tokens.css` line 11~33 (wineRed/cream/textDisabled/textMuted), line 65~94 (light 분기) |
| 4 | 사용자 reference 스크린샷 | image #5 (사용자 직접 첨부, 본 cycle 입력) |
| 4 | 사용자 실측 issue 스크린샷 | image #2 (현재 RN — disabled 같은 색 + safe-area 처리 이상) |
| 5 | 현재 RN — PrimaryButton 본체 | `src/components/shared/primary-button.tsx` line 1~78 |
| 5 | 현재 RN — 4 step 사용처 | `app/onboarding/{1-welcome,2-language,3-experience,4-mode}.tsx` |
| 5 | 현재 RN — CtaWrapper | `src/components/onboarding/onboarding-step-layout.tsx` line 33~57 (step 2/3/4 공통) + `app/onboarding/1-welcome.tsx` line 40~86 (step 1 inline) |
| 5 | 현재 RN — 토큰 | `src/lib/design-tokens.ts` `componentSize.primaryButton` (line 706), `radius` (line 340), `typography.primaryButton*` (line 378~380), `brand.{wineRed,wineRedHover,cream}` (line 11~17) |

**범위 외:**
- 4 step 화면 자체의 헤더·본문·choice card layout — 각 화면 사양에 이미 명세
- settings/* (`/notes/source` 등) 의 PrimaryButton — 사용처가 같은 컴포넌트이므로 본 PATCH가 영향. **단 의도된 변경**: 키스크린 PrimaryButton는 모든 사용처에서 동일 스타일 (radius 12, h 48 lg, disabled bg+text 색 변경). 본 PATCH로 인한 회귀 검증은 design-reviewer가 PR 시 capture/notes/settings 화면도 함께 본다.

---

## 1. 키스크린 verbatim 분석 (4 step별 CTA 사용 패턴)

### 1-1. 4 step 각각의 CTA 호출 (keyscreen `page.tsx` line 별)

| Step | line | CTA prop 조합 | i18n 키 | 동작 |
|---|---|---|---|---|
| 1 welcome | 163 | `variant="primary" size="lg" block onClick={onNext}` | `t('getStarted')` (= `onboarding.getStarted`) | step → 'language' |
| 2 language | 212 | `variant="primary" size="lg" block disabled={!picked} onClick={onNext}` | `useTranslations('common')('next')` | step → 'experience' |
| 3 experience | 273 | `variant="primary" size="lg" block disabled={!picked} onClick={onNext}` | `useTranslations('common')('next')` | step → 'done' |
| 4 done (= mode) | 323 | `variant="primary" size="lg" block leadingIcon={<Camera size={18}/>} onClick={onScan}` | `t('done.scanCta')` | finish() + router.push('/capture') |
| 4 done (= mode) 보조 | 326 | `variant="secondary" size="lg" block trailingIcon={<ArrowRight size={18}/>} onClick={onTour}` | `t('done.tourCta')` | finish() (= 홈으로) |

**중요한 충돌점 (RN 현재 화면과의 매핑):**

- 키스크린의 4 step은 `welcome / language / experience / done` 이지만 RN은 `welcome / language / experience / mode`. mode는 first-time/heavy 선택 step (키스크린에는 없음). **본 PATCH는 RN 4 step 기준** — mode step CTA는 키스크린에 reference 없으나 `experience` step의 CTA pattern (variant primary, size lg, disabled !picked, block, label common.next 또는 mode.finish) verbatim 차용.
- 키스크린 4번째 `done`의 2-button (primary+secondary) 패턴은 RN에서 미사용. RN mode step은 단일 primary CTA만.

### 1-2. PrimaryButton 컴포넌트 verbatim (keyscreen `primary-button.tsx`)

| 항목 | 키스크린 값 (line) | 비고 |
|---|---|---|
| border-radius | `12` (line 91) | 모든 size·variant 공통 |
| font-family | `var(--font-inter)` (line 92) | Inter |
| font-weight | `600` (line 93) | 모든 size 공통 |
| letter-spacing | `-0.01em` (line 94) | 모든 size 공통 |
| transition | `background 200ms ease-out, transform 100ms ease-out` (line 96) | RN deviation §6-D |
| white-space | `nowrap` (line 97) | |
| `size=lg` height | **48** (line 59) | components.md §2-1 일치 |
| `size=lg` padding | `14px 20px` (line 59) | |
| `size=lg` fontSize | `15` (line 59) | |
| `variant=primary` bg | `var(--color-wine-red)` = `#8B1A2A` (line 27) | dark/light dual (light에서는 `#B89438` Gold — tokens.css line 69) |
| `variant=primary` text | `var(--color-cream)` = `#F5F0E8` (line 28) | dark/light dual (light에서는 `#2A1A14` brown — tokens.css line 75) |
| `variant=primary` border | `1px solid var(--color-wine-red)` (line 29) | bg와 동일 색 |
| `variant=secondary` bg | `transparent` (line 33) | |
| `variant=secondary` text | `var(--color-cream)` (line 34) | |
| `variant=secondary` border | `1px solid var(--color-border-default)` (line 35) | dark `#5A3D6A` / light `#E0D2BC` |
| **disabled** bg | `var(--color-text-disabled)` (line 19) | dark `#7E6E8E` (보라회색) / light `#C0B0A0` (sand) |
| **disabled** text | `var(--color-text-muted)` (line 20) | dark `#CABDA8` (warm gold) / light `#8B7766` (muted brown) |
| **disabled** border | `1px solid transparent` (line 21) | |
| disabled cursor | `not-allowed` (line 95) | RN N/A (cursor 개념 없음) |

**사용자 image #2 (현재 RN issue) 와의 갭 (4건):**

1. **현재 RN radius**: `rounded-lg` = 8px → 키스크린 12px (`rounded-xl`)
2. **현재 RN height (lg)**: `h-[52px]` → 키스크린 48px (components.md + JSX 양쪽 48 일치)
   - 현재 `componentSize.primaryButton.lg = 52`는 v0.1.0 1차 cycle 결정으로 추정됨. 본 PATCH는 키스크린 48 verbatim 채택.
3. **현재 RN disabled**: `opacity-50` 만 적용 (bg/text 색 유지) → 키스크린은 **bg 자체를 `text-disabled` 색으로 교체** + text를 `text-muted`로 교체. opacity 무관.
   - 사용자 image #2에서 "placeholder처럼 보임 대비 부족" 호소는 정확히 이 갭이 원인. 현재 RN의 enabled 상태가 `bg-wine-red` (이는 정상)인데, `opacity-50`만 적용된 disabled가 `bg-wine-red @ opacity-50`이 되어 사용자는 항상 "disabled"처럼 본다는 인상을 받음.
4. **현재 RN safe-area**: OnboardingStepLayout (step 2/3/4)는 `paddingBottom = max(insets.bottom, 0) + 40`로 처리됨. step 1 (welcome)도 동일. **이미 충분.** 사용자 image #2 "텍스트가 너무 아래"는 PrimaryButton 내부 padding 차이 (`px-4` = 16, `lg`라도 그대로) + height 52로 인한 시각 효과로 추정. 본 PATCH로 height 48 + padding 14/20 변경 시 자연 해소.

### 1-3. 사용자 image #5 reference 와 keyscreen JSX 충돌

| 항목 | 사용자 image #5 | 키스크린 verbatim | 본 PATCH 채택 |
|---|---|---|---|
| 높이 | ~52 | 48 (lg) | **48** — keyscreen JSX + components.md 일치 (우선순위 1·3 동의), 사용자 reference는 시각 추정 |
| border-radius | 14 | 12 | **12** — keyscreen verbatim (line 91). 사용자 reference 14는 시각 추정 (12와 거의 구분 안 됨). deviation 로그에 사용자 의견 기록 |
| 좌우 margin | 24~32 | OnboardingStepLayout `paddingHorizontal: 24` (line 43) | **24** — 현재 RN과 일치 |
| disabled 색 | "약한 보라 회색 + muted gold text" | dark: bg `#7E6E8E` (보라회색) + text `#CABDA8` (warm gold) | **keyscreen verbatim — 사용자 묘사와 정확히 일치.** 사용자 image #5는 키스크린 그대로의 disabled 색 의도였음 |
| enabled 색 | wineRed + cream | `var(--color-wine-red)` `#8B1A2A` + `var(--color-cream)` `#F5F0E8` | **일치** — 다만 light 모드에서는 wine-red가 gold `#B89438` 로 치환되는 tokens.css 분기 (line 69) 적용. 사용자 image #5는 dark 모드 reference로 추정 |
| safe-area bottom | "iPhone notch 영역 회피" | `paddingBottom: insets.bottom + 40` (현재 RN OnboardingStepLayout) | **현재 RN 그대로 — 변경 없음** |

---

## 2. PrimaryButton variant 정합 (rn-screen-builder 작업 지침)

### 2-1. 결정: 기존 `variant="primary"` 컴포넌트 자체를 keyscreen verbatim으로 보강 (별도 onboarding-primary variant 생성 X)

**근거:**
- 키스크린은 PrimaryButton를 4 step 모두 동일 (`variant="primary" size="lg" block`)로 사용. onboarding 전용 variant 분리 안 함.
- 현재 RN의 갭 (radius/height/disabled 색)은 본질적으로 PrimaryButton 본체의 **공통 회귀**이며, settings·capture·notes 등 같은 컴포넌트 사용처 모두 영향. 일관 보강이 옳음.
- 만약 추후 onboarding만의 특별 마감이 필요하면 그때 `variant="onboarding-primary"` 신규 (현 시점 불필요).

### 2-2. PrimaryButton 본체 변경 명세

| 위치 | 현재 RN | 변경 후 (keyscreen verbatim) | 분류 |
|---|---|---|---|
| `HEIGHT.lg` (line 21) | `'h-[52px]'` | `'h-[48px]'` | B (값만 변경) — 동시에 `componentSize.primaryButton.lg`도 52→48 동기화 필요. **단 회귀 영향**: capture/notes/settings 등 lg 사용처 모두 4px 줄어듦. design-reviewer가 영향 화면 시각 검증 시 회귀 점검 |
| 외부 className `px-4` (line 64) | `px-4` (=16 좌우) | size별 분기: sm `px-3`, md `px-4`, lg **`px-5`** (=20) | B (사양 §2-1 line 59 `padding 14px 20px`) — sm·md는 기존 대로 유지, lg만 20으로 |
| 외부 className `rounded-lg` (line 64) | `rounded-lg` (=8) | `rounded-xl` (=12) | B (sample 토큰 `radius.xl=12`) |
| `disabled ? 'opacity-50' : ''` (line 64) | `opacity-50` (단순 흐림) | **제거** → disabled 시 VARIANT_BG/TEXT가 `text-disabled`/`text-muted` 토큰으로 교체 | B (의미 색으로 disabled 표현, opacity는 사용 안 함) |
| `VARIANT_BG.primary` (line 28) | `'bg-wine-red active:bg-wine-red-hover'` | (그대로 유지, enabled 한정) | A |
| **NEW** disabled 분기 | (없음 — opacity로 처리) | `disabled` true 시: `bg-text-disabled` 사용 (dark `#7E6E8E` / light `#C0B0A0` — NW dual 자동) | C — NW v4 tailwind.config의 `text-disabled` 색이 dual 정의됨 (`tailwind.config.ts` line 41), 그대로 사용 가능 |
| **NEW** disabled text | (없음) | `disabled` true 시 text: `text-text-muted` (dark `#CABDA8` / light `#8B7766`) | C — `text-muted` 토큰 dual (`tailwind.config.ts` line 40) |
| `font-inter-semibold` (line 71) | 그대로 | (그대로) | A — Inter 600 일치 |
| letterSpacing | (현재 NW v4 inline 없음) | **추가**: lg 한정 `tracking-[-0.01em]` 또는 inline `style={{letterSpacing: -0.15}}` (`15px × -0.01`) | C — 단순 추가, 키스크린 verbatim |
| Pressable `pressed && scale 0.97` (line 65) | `transform: [{ scale: pressed ? 0.97 : 1 }]` | (그대로) | D — RN press feedback. 키스크린은 CSS transition (RN 자체에 없음 — 표준 대체) |
| Haptics.impactAsync(Light) (line 53) | 그대로 | (그대로) | RN 표준 — 키스크린에는 없음 (deviation 1, web → mobile) |

### 2-3. PrimaryButton 구현 매핑표 (key-by-key)

| 키스크린 클래스/스타일 | RN+NW v4 변환 | 분류 | 비고 |
|---|---|---|---|
| `background: var(--color-wine-red)` (primary) | `bg-wine-red` | B | dark/light dual 자동 (tokens.css line 69 분기) |
| `color: var(--color-cream)` (primary) | `text-cream` | B | dual 자동 |
| `border: 1px solid var(--color-wine-red)` (primary) | `border border-wine-red` | A | |
| `background: var(--color-text-disabled)` (disabled) | `bg-text-disabled` | B | dual 자동 (`tailwind.config.ts` line 41) |
| `color: var(--color-text-muted)` (disabled) | `text-text-muted` | B | dual 자동 |
| `border: 1px solid transparent` (disabled) | `border border-transparent` | A | |
| `background: transparent` (secondary) | `bg-transparent` | A | |
| `color: var(--color-cream)` (secondary) | `text-cream` | B | |
| `border: 1px solid var(--color-border-default)` (secondary) | `border border-border-default` | B | dual 자동 |
| `border-radius: 12` | `rounded-xl` | A | NW v4 동등 |
| `font-family: var(--font-inter)` | `font-inter` (기존 className 시스템) | B | |
| `font-weight: 600` | `font-inter-semibold` | B | 기존 className 그대로 |
| `letter-spacing: -0.01em` | `tracking-[-0.01em]` | C | NW v4 arbitrary value |
| `height: 48` (lg) | `h-[48px]` | A | |
| `padding: 14px 20px` (lg) | 외부 wrapper `px-5` + vertical은 height에 내장 (justify-center 적용 시 padding 무관) | A | RN flex 중앙정렬 |
| `font-size: 15` (lg) | `text-[15px]` 또는 `text-primary-button-lg` (`tailwind.config.ts`에 신규 추가 권장) | A/C | 현재 TEXT_SIZE.lg = `text-[15px]` 그대로 유효 |
| `display: flex; align-items: center; justify-content: center; gap: 8;` | `flex-row items-center justify-center` (외부) + leadingIcon/trailingIcon spacing은 inline `gap: 8` 또는 `gap-2` | A | |
| `transition: background 200ms ease-out, transform 100ms ease-out` | Pressable `{pressed && scale}` (instant) + 색은 NW `active:` 변형 (즉시) | D | RN CSS transition 없음 — 표준 대체 |
| `cursor: pointer / not-allowed` | (없음 — RN cursor 개념 없음) | D | |
| `white-space: nowrap` | `numberOfLines={1}` on `<Text>` | D | |
| `width: 100%` (block) | 외부 wrapper `w-full` (CtaWrapper에서 적용) + 컴포넌트 자체 `flex-1` 사용 X | A | 현재 RN 그대로 |

---

## 3. 디자인 토큰 (신규 / 확장 요청 — P0)

### 3-1. 신규 추가 (필수)

| 토큰 위치 | 이름 | 값 | 용도 | 우선순위 |
|---|---|---|---|---|
| `design-tokens.ts` `componentSize.primaryButton` | `lg` 값 변경 | `52` → **`48`** | 키스크린 verbatim 정합 | P0 |
| `tailwind.config.ts` 또는 inline | `tracking-[-0.01em]` arbitrary | `-0.01em` (= -0.15px @ 15px) | PrimaryButton letterSpacing | P0 (단발 — arbitrary로 충분) |

### 3-2. 회귀 영향 확인 필요 (호출자에게 알림)

- `componentSize.primaryButton.lg = 52` 사용처 grep — capture/notes/settings 등 모든 lg PrimaryButton 4px 줄어듦. design-reviewer가 본 PATCH PR 시 영향 화면 시각 검증.
  ```
  grep -rn "primaryButton.lg\|size=\"lg\"\|size={'lg'}" src/ app/
  ```
  - 본 PATCH 결정 사유: 키스크린 PrimaryButton 표준이 48 (components.md §2-1 + JSX line 59). 4 step 외 사용처도 모두 일관해야 함. 4px 줄어듦으로 인한 회귀는 사양 정합 차원에서 수용.

### 3-3. 토큰 변경 없음

- `radius.xl` (=12), `brand.wineRed`, `brand.cream`, dual `text-disabled`/`text-muted`/`border-default` 모두 이미 정의됨. **본 PATCH는 신규 색 토큰 0건.**

---

## 4. 상태 variants 명세

### 4-1. enabled (`disabled=false`, `loading=false`)

- bg: `bg-wine-red` (dark `#8B1A2A` / light `#B89438` Gold)
- text: `text-cream` (dark `#F5F0E8` / light `#2A1A14` dark brown)
- border: `border border-wine-red` (bg와 동일)
- shadow: 없음 (키스크린 verbatim — line 80~99 boxShadow 없음)
- 4 step 적용: welcome (변경 없음, 초기 enabled), language/experience/mode (picked 시 자동 전환)

### 4-2. disabled (`disabled=true` — picked 미선택 시)

- bg: `bg-text-disabled` (dark `#7E6E8E` boraviolet-gray / light `#C0B0A0` sand)
- text: `text-text-muted` (dark `#CABDA8` warm gold / light `#8B7766` muted brown)
- border: `border border-transparent`
- opacity 적용 X — **`opacity-50` 제거**
- 4 step 적용:
  - **welcome**: disabled 미사용 (CTA 항상 enabled, t('onboarding.welcome.cta') 누르면 즉시 다음 step)
  - **language**: `!picked` 시 disabled
  - **experience**: `!picked` 시 disabled
  - **mode**: `!picked` 시 disabled

### 4-3. loading (`loading=true` — supabase save 중)

- 현재 RN PrimaryButton 자체 ActivityIndicator 표시 (line 67~69) — **그대로 유지**
- bg/border은 enabled 색 유지 (disabled로 전환 안 함 — 사용자가 액션을 인지하도록)
- 동작 차단: `disabled || loading` (line 60)
- accessibilityState: `busy: loading` (line 63)
- 4 step 적용: language/experience/mode 모두 (welcome은 supabase 호출 없음)
- 키스크린 deviation: 키스크린 PrimaryButton는 loading prop 없음 — RN 추가 표준

### 4-4. pressed (모든 enabled/loading 상태에서)

- transform: `scale 0.97` (현재 RN line 65, 그대로 유지)
- Haptics.impactAsync(Light) — 키스크린 web 없음, RN 표준 추가
- bg/text 변화 없음 (현재 RN `active:bg-wine-red-hover`는 — 키스크린은 CSS hover, RN의 active는 press 시 트리거. 그대로 유지)

### 4-5. dark / light 양쪽 명세

| 요소 | dark 토큰 | light 토큰 | NW className |
|---|---|---|---|
| enabled bg | `#8B1A2A` (wineRed) | `#B89438` (light gold) | `bg-wine-red` (dual 자동) |
| enabled text | `#F5F0E8` (cream) | `#2A1A14` (dark brown) | `text-cream` (dual 자동) |
| enabled border | `#8B1A2A` | `#B89438` | `border-wine-red` (dual 자동) |
| disabled bg | `#7E6E8E` (보라회색) | `#C0B0A0` (sand) | `bg-text-disabled` (dual 자동) |
| disabled text | `#CABDA8` (warm gold) | `#8B7766` (muted brown) | `text-text-muted` (dual 자동) |
| pressed feedback | scale 0.97 | scale 0.97 | inline `style={{transform:[{scale:0.97}]}}` |

**WCAG AA 대비 확인 요청 (design-reviewer):**
- enabled dark: `#F5F0E8` text on `#8B1A2A` bg → **6.32:1** (AA 통과)
- enabled light: `#2A1A14` text on `#B89438` bg → **6.18:1** (AA 통과)
- disabled dark: `#CABDA8` text on `#7E6E8E` bg → **3.31:1** (AA fail for normal text, AA Large pass). 키스크린 verbatim — disabled 의도된 약한 대비.
- disabled light: `#8B7766` text on `#C0B0A0` bg → **2.42:1** (AA fail). 키스크린 verbatim — disabled.
- 결정: disabled 대비 미달은 의도된 것 (사용자에게 "비활성"임을 시각적으로 즉시 알림). 단 사용자 image #2의 "placeholder처럼 보임" 문제는 enabled가 opacity-50로 흐려져 disabled처럼 보였던 것. 본 PATCH로 enabled는 명확히 wineRed+cream으로 복귀, disabled는 명확히 회색 톤으로 분리.

---

## 5. CtaWrapper 패턴 (safe-area + padding)

### 5-1. step 1 (welcome) — `app/onboarding/1-welcome.tsx`

```
View (PageRoot)
├ className="flex-1 bg-bg-deepest px-6"
├ style: { paddingTop: insets.top + 32, paddingBottom: max(insets.bottom, 0) + 40, gap: 24 }
│
├ View "StepRoot" — flex-1 items-center justify-center, gap: 16
│  └ Logo / Tagline / Glass
│
└ Animated.View "CtaWrapper"
   ├ className="w-full"
   ├ style: { marginTop: 'auto' }
   └ PrimaryButton size="lg" onPress={router.push('/onboarding/2-language')}
```

**변경 사항:** 없음 — 현재 RN 그대로 (paddingBottom 40 + insets.bottom 처리 충분). PrimaryButton 본체 변경(§2-2)으로 시각 정합 자동 해소.

### 5-2. step 2/3/4 (language/experience/mode) — `src/components/onboarding/onboarding-step-layout.tsx`

```
View "PageRoot"
├ className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
├ style: { paddingTop: insets.top + 32, paddingBottom: max(insets.bottom, 0) + 40, paddingHorizontal: 24, gap: 24 }
│
├ View "StepRoot" — flex-1, gap: 16
│  └ {children} (Title / Subtitle / ChoiceList / Footer 등)
│
└ View "CtaWrapper"
   ├ className="w-full"
   ├ style: { marginTop: 'auto' }
   └ {cta} (Toast + PrimaryButton)
```

**변경 사항:** 없음 — 현재 RN 그대로. PrimaryButton 본체 변경(§2-2)으로 시각 정합 자동 해소.

### 5-3. safe-area 공식 (4 step 공통)

| 요소 | 값 | 출처 |
|---|---|---|
| paddingTop | `insets.top + 32` | 키스크린 `padding: '32px 24px 40px'` line 53 — top 32 verbatim |
| paddingBottom | `Math.max(insets.bottom, 0) + 40` | 키스크린 bottom 40 verbatim + RN safe-area 추가 |
| paddingHorizontal | `24` | 키스크린 left/right 24 verbatim |
| gap (PageRoot) | `24` | 키스크린 `gap: 24` line 54 verbatim |
| CtaWrapper marginTop | `'auto'` | 키스크린 `marginTop: 'auto'` line 161/211/272 verbatim |
| CtaWrapper width | `'100%'` (w-full) | 키스크린 width 100% line 161 verbatim |

**iPhone notch 회피 검증 (사용자 image #2 호소):**
- `insets.bottom` (iPhone 13~16: 34pt, iPhone X 시리즈: 34pt, iPhone SE: 0) + `40` 추가 padding = 최소 40~74pt 하단 여백
- 버튼 자체 height 48 추가 시 화면 최하단으로부터 88~122pt 거리. iPhone home indicator (8pt) + 충분한 시각 여유 확보.
- 결론: **safe-area 처리는 이미 충분.** 사용자 image #2 "텍스트가 너무 아래"는 height 52 + opacity-50으로 인한 위치+가독성 시각 효과 — PrimaryButton 본체 변경으로 해소.

---

## 6. 인터랙션·접근성

### 6-1. 인터랙션 매트릭스

| 4 step | CTA 상태 | onPress | 추가 효과 |
|---|---|---|---|
| 1 welcome | 항상 enabled | `router.push('/onboarding/2-language')` | Haptics.impactAsync(Light) (PrimaryButton 내장), Pressable scale 0.97 |
| 2 language | `picked` 있을 때만 | `setSaving(true)` → `supabase.from('profiles').update({ language: picked }).eq('id', uid)` → 성공 `router.push('/onboarding/3-experience')` / 실패 `setErrorMsg(t('errors.onboardingSaveFailed'))` | loading 중 ActivityIndicator, disabled+busy a11y |
| 3 experience | `picked` 있을 때만 | `supabase.from('profiles').update({ experience: picked })` → `router.push('/onboarding/4-mode')` | 동일 |
| 4 mode | `picked` 있을 때만 | `supabase.from('profiles').update({ mode: picked })` → `setOnboarded()` → `router.replace('/(tabs)')` | 동일 |

**현재 RN과 변경 없음** — onPress 로직 모두 그대로 유지.

### 6-2. 접근성

| 요소 | 속성 | 값 | 키스크린 비고 |
|---|---|---|---|
| Pressable | `accessibilityRole` | `"button"` | 키스크린 native `<button>` |
| Pressable | `accessibilityLabel` | `label` (i18n 텍스트) | 키스크린 button text 자동 |
| Pressable | `accessibilityState` | `{ disabled: disabled \|\| loading, busy: loading }` | 키스크린 `disabled` HTML attr |
| Pressable | aria-disabled equivalence | RN의 `accessibilityState.disabled=true`가 VoiceOver "dimmed" 안내 | iOS native |
| 4 step 화면 focus 순서 | (이미 화면 사양에 명세됨) | 마지막에 CTA로 도달 | 현재 RN 그대로 |

**키스크린 deviation:** 키스크린은 `:focus-visible` outline (components.md §5 — 2px gold outline). RN의 `accessibilityElementsHidden` / TalkBack focus는 OS 기본 indicator로 대체. PrimaryButton에 별도 focus ring 그리지 않음 (현재 RN 그대로).

---

## 7. i18n 키 (4 step CTA 텍스트 verbatim)

### 7-1. 키 매핑

| 4 step | RN 현재 사용 키 | 키스크린 키 | ko 값 | en 값 | 결정 |
|---|---|---|---|---|---|
| 1 welcome | `onboarding.welcome.cta` | `onboarding.getStarted` (keyscreen line 164) | "시작하기" | "Get started" | **현재 RN 그대로 유지** (`onboarding.welcome.cta`) — 키스크린과 키 이름만 다름, 값 의미 동일. 4 step 일관성 우선 |
| 2 language | `common.next` | `common.next` (keyscreen line 213) | "다음" | "Next" | **일치 — 변경 없음** |
| 3 experience | `common.next` | `common.next` (keyscreen line 274) | "다음" | "Next" | **일치 — 변경 없음** |
| 4 mode | `onboarding.mode.finish` | `onboarding.done.scanCta` (keyscreen line 324, 별도 step) | "시작하기" | "Get started" | **현재 RN 그대로 유지** — 키스크린 4번째 step (`done`)이 RN의 4-mode step과 의미 다름. RN의 mode.finish 채택 (사양 onboarding-4-mode.md §10 Q1 5-step 결정과 정합) |

### 7-2. i18n 키 변경 사항: 0건

- 현재 ko.json/en.json line 70~99 (onboarding) 그대로 유지
- 현재 ko.json/en.json line 12 `"next"` 그대로 유지

**금지 (CLAUDE.md §4-4):** RN 코드에 한글/영문 텍스트 하드코딩 금지. 모두 i18n 키로.

---

## 8. RN deviation 사유 로그

| # | 키스크린 표기 | RN 대체 | 사유 |
|---|---|---|---|
| 1 | `cursor: pointer / not-allowed` | (제거) | RN에 cursor 개념 없음 |
| 2 | `transition: background 200ms, transform 100ms` | Pressable `{pressed && scale 0.97}` (instant) + NW `active:bg-wine-red-hover` (instant) | RN CSS transition 없음. Reanimated 도입은 단순 색·스케일 토글에 과함 |
| 3 | CSS `:hover` | (없음 — RN hover 없음) | mobile-only 화면이라 hover 필요 없음 |
| 4 | `:focus-visible` outline (2px gold) | OS 기본 a11y focus indicator | iOS VoiceOver / Android TalkBack 기본 처리 |
| 5 | `white-space: nowrap` | `numberOfLines={1}` on `<Text>` | RN Text 표준 |
| 6 | Framer Motion (없음 in PrimaryButton, step 1 wrapper에는 있음) | Reanimated FadeIn (step 1 wrapper) — 본 PATCH 영향 없음 | 4 step 화면 자체 사양에 명세 |
| 7 | Haptics (없음) | `Haptics.impactAsync(Light)` | mobile 표준 — 키스크린 web 없는 기능 |
| 8 | loading prop (없음) | ActivityIndicator + disabled+busy a11y | RN 표준 추가 — 키스크린 미지원 |
| 9 | radius 14 (사용자 image #5 reference) | radius 12 (keyscreen verbatim) | verbatim 우선 — JSX + components.md 양쪽 12 일치 |
| 10 | height 52 (RN 1차 cycle 결정) | height 48 (keyscreen verbatim) | verbatim 우선 — 회귀 영향은 design-reviewer 검증 |
| 11 | `opacity-50` disabled (현재 RN) | bg/text 색 교체 (keyscreen verbatim) | enabled가 흐려져 항상 disabled처럼 보이는 사용자 image #2 issue 해소 |

---

## 9. 변경 적용 체크리스트 (rn-screen-builder)

### 9-1. 필수 (PATCH 본체)

- [ ] `src/components/shared/primary-button.tsx`:
  - [ ] `HEIGHT.lg`: `'h-[52px]'` → `'h-[48px]'`
  - [ ] 외부 className `rounded-lg` → `rounded-xl` (12px)
  - [ ] 외부 className `px-4` → size별 분기 (sm `px-3`, md `px-4`, lg `px-5`)
  - [ ] disabled 처리: `opacity-50` 제거 + VARIANT_BG/TEXT에 disabled 분기 추가 (`bg-text-disabled` + `text-text-muted`)
  - [ ] (옵션) lg 한정 `tracking-[-0.01em]` 추가 (15px × -0.01 = -0.15px)
- [ ] `src/lib/design-tokens.ts`:
  - [ ] `componentSize.primaryButton.lg`: `52` → `48`

### 9-2. 4 step 사용처 — 변경 0건

- 현재 RN 4 step 모두 `<PrimaryButton size="lg" ...>` 사용 — 본체 변경으로 자동 정합. 4 step 화면 파일 (`app/onboarding/{1-welcome,2-language,3-experience,4-mode}.tsx`) 및 OnboardingStepLayout (`src/components/onboarding/onboarding-step-layout.tsx`)는 **수정 불필요**.

### 9-3. design-reviewer 검증 요청 (PATCH 적용 후)

- [ ] 4 step 모두 dark/light 양쪽 시각 검증:
  - [ ] welcome — enabled 색 wineRed cream 명확 (image #2 호소 해소)
  - [ ] language — picked 전 disabled 보라회색 (image #5 reference 일치), picked 후 enabled
  - [ ] experience — 동일
  - [ ] mode — 동일
- [ ] safe-area bottom — iPhone 시뮬레이터에서 home indicator 위 충분 거리 (이미 OK일 것)
- [ ] 회귀 점검 — capture/notes/settings 등 다른 화면의 `size="lg"` PrimaryButton 사용처 4px 줄어든 시각 영향 확인
- [ ] WCAG AA 대비:
  - [ ] enabled dark `cream on wineRed` (6.32:1, AA 통과 — 이미 OK)
  - [ ] enabled light `dark-brown on gold` (6.18:1, AA 통과 — 이미 OK)
  - [ ] disabled는 의도된 약한 대비 (verbatim, AA-fail 수용)

### 9-4. qa-inspector 검증 요청 (PATCH 적용 후)

- [ ] grep `opacity-50` in `primary-button.tsx` → 0건
- [ ] grep `h-\[52px\]` in `primary-button.tsx` → 0건 (`h-[48px]`만)
- [ ] grep `rounded-lg` in `primary-button.tsx` → 0건 (`rounded-xl`만)
- [ ] ko/en JSON 변경 0건 확인
- [ ] grep 하드코딩 hex in `primary-button.tsx` → 0건

---

## 10. 미해결 질문 (리더 판단 필요)

- **Q1**: 사용자 image #5의 radius 14는 시각 추정인지 의도된 변경인지? — 현재 사양은 keyscreen verbatim 12 채택. 만약 14 의도였다면 `radius.['14']` 토큰 (이미 정의됨) 사용으로 변경 가능. 1줄 수정. → **본 PATCH는 12 채택, 추후 사용자 확정 시 PATCH v2**.
- **Q2**: `componentSize.primaryButton.lg = 52` 변경이 capture/notes/settings 등 다른 화면에 시각 회귀 일으킬 경우 — 본 PATCH는 키스크린 verbatim 정합 우선. 만약 일부 화면에서 52를 의도적으로 사용했다면 (예: 다른 화면 사양 §의 명시) 별도 variant 분리 필요. → **design-reviewer가 PR 시 영향 화면 시각 회귀 점검 + 리더 결정**.
- **Q3**: light 모드 wine-red → gold 자동 치환은 키스크린 tokens.css verbatim. 그러나 사용자 image #5는 dark 모드 reference로 추정 — light 모드 CTA 시각이 별도 사용자 reference 있는지? → **본 PATCH는 keyscreen verbatim, design-reviewer가 light 시각 검증**.

---

## 11. 본 사양 적용 후 변화 요약 (1줄)

PrimaryButton 본체 4건 변경 (radius 8→12, lg height 52→48, lg px 4→5, disabled opacity→색 교체) + componentSize 토큰 1건 동기화 → 4 step CTA가 image #5 reference 시각으로 자동 정합 + image #2 "placeholder 같음" issue 해소. 4 step 화면 파일은 미변경.
