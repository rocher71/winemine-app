# 디자인 리뷰 — /onboarding/4-mode (v2, post-fix)

- 대상: 2차 검증 (rn-screen-builder 1차 FAIL 5/6 해소 PR 후)
- 사양: `_workspace/design-specs/onboarding-4-mode.md` (v1)
- 원본: keyscreen 모바일에는 mode step 자체 부재 — `../winemine-keyscreen/src/app/onboarding/page.tsx` line 220~279 (StepExperience verbatim) baseline 차용 (사양 §0)
- 1차 보고서: `_workspace/design-review_onboarding-4-mode_20260521_025433.md` (5/6 FAIL — a/b/d/e/f, c PASS)
- 2차 구현:
  - `app/onboarding/4-mode.tsx` (재작성, 158 LOC, 미커밋)
  - `src/components/onboarding/mode-choice-card.tsx` (신규, 123 LOC, 미커밋)
- 인접 표준: `src/components/onboarding/{onboarding-step-layout,experience-choice-card,language-choice-card}.tsx` (2/3-step hardening 표준)
- 스크린샷: `_workspace/keyscreen-shots/onboarding.png`은 welcome step만 — mode step keyscreen 부재
- 타임스탬프: 2026-05-21 03:00:31

---

## 0. 검증 기준 (1차 동일)

- 사양 §0 차선(StepExperience verbatim) + step-experience/-language 패턴 일관성 기준
- SCOPE-OUT: Day 6 settings / BottomNav / AppHeader / Q3 라이트 모드 gold icon 대비 (language·experience·mode 일괄 후속)

---

## 1. 6항목 체크리스트 (1차 FAIL 5건 해소 확인)

### (a) 요소 누락 — PASS

1차 FAIL 항목 모두 해소:
- a-1 wrapper `OnboardingStep` → `OnboardingStepLayout` 교체: `app/onboarding/4-mode.tsx:100-113` `<OnboardingStepLayout cta={...}>` 확인. step 2/3와 동일 표준.
- a-2 progress eyebrow "4 / 4" 제거: `OnboardingStepLayout`는 progress UI 자체 없음 (`src/components/onboarding/onboarding-step-layout.tsx:36-56`) — 자동 해결 확인.
- a-3 `OptionCard` → `ModeChoiceCard` 교체: `4-mode.tsx:134-147` `<ModeChoiceCard variant=... />` 2개 확인.
- a-4 신규 `src/components/onboarding/mode-choice-card.tsx` 작성: 123 LOC, ExperienceChoiceCard verbatim mirror 확인.
- a-5 좌측 Lucide icon: `mode-choice-card.tsx:81,107` `const Icon = variant === 'first-time' ? Sparkles : BookOpen` + `<Icon size={24} strokeWidth={1.5} color={brand.gold} />` — 좌측 IconWrap 내부 확인.

### (b) Spacing 비율 — PASS

1차 FAIL 항목 모두 해소:
- b-1 카드 padding 16→18 사방: `mode-choice-card.tsx:93` `padding: 18` 확인 (experience-choice-card.tsx:84 동일).
- b-2 카드 gap 14 (icon ↔ text): `mode-choice-card.tsx:94` `gap: 14` 확인.
- b-3 ChoiceList marginTop 8: `4-mode.tsx:133` `<View className="gap-3 mt-2">` 확인 (`mt-2` = 8).
- b-4 상단 PageRoot 32/24/40 + StepRoot gap 16: `OnboardingStepLayout` (`onboarding-step-layout.tsx:38-49`) `paddingTop: insets.top + 32`, `paddingBottom: insets.bottom + 40`, `paddingHorizontal: 24`, `gap: 24`, `StepRoot gap: 16` — 사양 §1 일치.
- TextStack gap 4: `mode-choice-card.tsx:111` `style={{ gap: 4 }}` 확인.

### (c) Gradient 방향·깊이 — PASS (1차 동일)

- 사양 §1/§3 gradient 요구 없음. 구현도 gradient 없음 — 일치.

### (d) Corner radius — PASS

1차 FAIL 해소:
- 카드 `rounded-xl` (12) → `rounded-2xl` (16): `mode-choice-card.tsx:91` `className="flex-row items-start rounded-2xl bg-surface dark:bg-surface"` 확인. experience-choice-card.tsx:82 동일 표준.

### (e) Typography 위계 — PASS

1차 FAIL 5개 모두 해소:
- e-1 Page Title Playfair 24→26 / lineHeight 28.8→31.2: `4-mode.tsx:119-125` `<Text className="font-playfair text-text-primary dark:text-text-primary" style={{ fontSize: 26, lineHeight: 31.2 }}>` 확인 — experience step과 동일 (사양 §10 Q4).
- e-2 Subtitle `text-card-body text-text-secondary` → `text-onboarding-step-subtitle text-text-muted`: `4-mode.tsx:128` `className="font-inter text-onboarding-step-subtitle text-text-muted dark:text-text-muted"` 확인.
- e-3 Card title Playfair 16 → Inter 600 16 (`text-source-card-title`): `mode-choice-card.tsx:113` `className="font-inter-semibold text-source-card-title text-text-primary dark:text-text-primary"` 확인.
- e-4 Card sub Inter 12 → Inter 13 (`text-card-body`): `mode-choice-card.tsx:117` `className="font-inter text-card-body text-text-muted dark:text-text-muted"` 확인.
- e-5 progress eyebrow 제거: (a-2와 동일) — `OnboardingStepLayout` 자체에 progress 없음.

### (f) Color 사용 — PASS

1차 FAIL 3개 모두 해소:
- f-1 unselected border `border-text-disabled` → `border.default` dual (useColorScheme 분기): `mode-choice-card.tsx:73-74` `const scheme = useColorScheme(); const borderUnselected = scheme === 'light' ? light.border.default : dark.border.default;` + `:96` `borderColor: selected ? brand.gold : borderUnselected` 확인. experience-choice-card.tsx:64-65 동일 패턴.
- f-2 unselected opacity 0.85 추가: `mode-choice-card.tsx:97` `opacity: pressed ? (selected ? 0.95 : 0.8) : selected ? 1 : 0.85` 확인.
- f-3 subtitle `text-text-secondary` → `text-text-muted`: `4-mode.tsx:128` 확인 (e-2와 동일 라인).
- selected ring border 2px brand.gold: `mode-choice-card.tsx:95-96` `borderWidth: selected ? 2 : 1, borderColor: selected ? brand.gold : borderUnselected` — 사양 §1-1 verbatim.
- 하드코딩 hex/rgba grep: `grep -nE "#[0-9A-Fa-f]{3,6}"` 결과 코멘트(`라인 36` "하드코딩 hex/rgba 0") 1건만 — 코드 hex 0건 확인. PASS.

---

## 2. 다크/라이트 양쪽 모드

- [x] 코드 레벨 dual 토큰 사용 확인:
  - `bg-surface dark:bg-surface` (카드)
  - `bg-bg-deepest dark:bg-bg-deepest` (PageRoot — OnboardingStepLayout 처리)
  - `text-text-primary dark:text-text-primary` (Title / card title)
  - `text-text-muted dark:text-text-muted` (Subtitle / sub)
  - `useColorScheme()` 분기로 `border.default` 토큰 사용 (unselected border)
  - `brand.gold` (icon, selected border) — 단일 값 (brand 고정, 의도적)
- [ ] dark 모드 시뮬레이터 캡처 미확인 — rn-screen-builder PR 시 점검 권장
- [ ] light 모드 시뮬레이터 캡처 미확인 — 위와 동일
- Q3 (light 모드 gold icon `#C9A84C` on white 2.0:1 AA 미달)은 SCOPE-OUT 처리 — language/experience/mode 일괄 후속 cycle.

---

## 3. 스크린샷 비교

- `_workspace/keyscreen-shots/onboarding.png`은 welcome step만 캡처 (사양 §0 — mode step keyscreen 부재).
- 시각 패턴은 `experience-choice-card.tsx` verbatim mirror로 보장 — 두 컴포넌트 diff:
  - import: `GlassWater, Award` → `Sparkles, BookOpen`
  - type alias: `ExperienceVariant` → `ModeVariant`
  - prop variant union: `'beginner' | 'expert'` → `'first-time' | 'heavy'`
  - Icon switch: `variant === 'beginner' ? GlassWater : Award` → `variant === 'first-time' ? Sparkles : BookOpen`
  - 나머지 100% 동일 (padding/gap/border/opacity/scale/색 토큰/접근성/Haptics)
- 시뮬레이터 캡처는 PASS 후 EAS Build / 실기 검증 단계에서 보강 권장.

---

## 4. 결정

- **결과: PASS (6항목 6 PASS — a/b/c/d/e/f 모두)**
- 1차 FAIL 5건 모두 해소. 신규 FAIL 0건.
- 사양 §12 검증 체크리스트 22개 중 다음만 미확인 (시뮬레이터 캡처 의존):
  - `gestureEnabled: false` (`_layout.tsx` — 본 보고서 범위 외, 기존 유지 가정)
  - dark/light 양쪽 실기 캡처 (코드 레벨 dual 토큰 확인 완료, 후속)

### 라우팅

- **rn-screen-builder**: 본 cycle 작업 완료 통보 — 다음 작업 (Day 6 또는 다음 retroactive) 진행 가능.
- **qa-inspector** (다음 게이트): `/onboarding/4-mode` qa 단계 진입 가능 — RLS·shape·i18n·hex grep·LWIN·OAuth 검증으로 이관.
- **design-spec-author**: 사양 추가 보강 불필요 (사양 v1 그대로 충분).
- **infra-architect** (P0 비차단, 후속): `onboardingStepTitleSm` (Playfair 26/31.2) typography 토큰화 — 3-experience + 4-mode 두 사용처 inline arbitrary 통합. 본 cycle PASS 영향 없음.

### 재검증 시점

본 PASS — 재검증 불필요. qa-inspector PASS 후 commit 게이트로 진행.

---

## 5. 신규 FAIL / STILL-FAIL

- **STILL-FAIL: 없음** (1차 FAIL 5건 모두 해소)
- **신규 FAIL: 없음**

---

## 6. 비고 (정보성, FAIL 아님)

- `mode-choice-card.tsx`는 `experience-choice-card.tsx`와 ~90% 코드 중복 (사양 §10 Q5 (b) 분리 채택 결과). DRY 부담은 작음 (verbatim 일치, 유지보수시 동기 update만 필요).
- `4-mode.tsx` LOC 79 → 158 (사양 §9 예상 80~90 LOC 초과). 사유: 코멘트 (1~54 line) 비중 큼. 실 JSX는 ~60 LOC 수준.
- `text-onboarding-step-subtitle`, `text-source-card-title`, `text-card-body`, `bg-surface`, `border-default` 등 토큰 모두 `tailwind.config.ts` / `design-tokens.ts`에 등록 확인 (grep 결과).

---

## 보고서 위치

`/Users/yejinkim/dev/winemine-app/_workspace/design-review_onboarding-4-mode_20260521_030031_v2.md`
