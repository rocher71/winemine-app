# 디자인 리뷰 — /onboarding/4-mode

- 대상: 1차 검증 (retroactive hardening)
- 사양: `_workspace/design-specs/onboarding-4-mode.md` (v1)
- 원본: keyscreen 모바일에는 mode step 자체 부재 — `../winemine-keyscreen/src/app/onboarding/page.tsx` line 220~279 (StepExperience verbatim) 패턴을 사양 §0/§9 baseline으로 차용
- 구현: `app/onboarding/4-mode.tsx` (79 LOC), 사용 컴포넌트 `src/components/shared/option-card.tsx`, `src/components/onboarding/onboarding-step.tsx`
- 인접 표준: `src/components/onboarding/{onboarding-step-layout,experience-choice-card,language-choice-card}.tsx` (2/3-step 이미 hardening 완료)
- 스크린샷: `_workspace/keyscreen-shots/onboarding.png`은 welcome step만 존재 (mode step keyscreen 부재). step-experience verbatim 패턴 기반 비교
- 타임스탬프: 2026-05-21 02:54:33

---

## 0. 검증 기준 (SCOPE-OUT 반영)

- keyscreen 1:1 비교 대신 **사양 §0 차선(StepExperience verbatim) + step-experience 패턴 일관성**을 기준으로 적용
- step 2 (language) / step 3 (experience)가 이미 hardening 완료된 표준이므로, step 4도 동일 표준(OnboardingStepLayout + *-choice-card.tsx 패턴) 일관성 요구
- Day 6 settings / BottomNav / AppHeader 검증 제외

---

## 1. 6항목 체크리스트

### (a) 요소 누락 — FAIL

증거:
- **`app/onboarding/4-mode.tsx:46-77` — 사양 §1 트리 요구 wrapper `OnboardingStepLayout` 누락.** 현재 `OnboardingStep`(progress eyebrow 강제) 사용. step 2 (`app/onboarding/2-language.tsx`) / step 3 (`app/onboarding/3-experience.tsx`)는 이미 `OnboardingStepLayout`으로 마이그레이션 완료된 표준임.
- **`app/onboarding/4-mode.tsx:64-75` — 사양 §1-1 요구 `ModeChoiceCard` (좌측 Lucide Sparkles/BookOpen + 2-tier 텍스트) 부재.** 현재 `OptionCard` 사용 — 우측 Check icon + 1-tier 텍스트 위주 구조. 사양 §9 row 5/6 명시.
- **사양 §1 + §11 요구 `src/components/onboarding/mode-choice-card.tsx` 신규 컴포넌트 자체 부재** (`ls src/components/onboarding/` 결과: experience-choice-card / language-choice-card 두 짝만 존재).
- **사양 §11 + §9 row 6 요구 왼쪽 Lucide icon (Sparkles for first-time / BookOpen for heavy, size 24 / strokeWidth 1.5 / brand.gold) 부재.** 현재 우측 Check icon만 존재 (`option-card.tsx:51`).
- 사양 §1 footer Text **없음**은 OK (`§6 deviation 12` 의도적 제거 — subtitle에 동일 안내 흡수).

### (b) Spacing 비율 — FAIL

증거:
- **카드 padding**: 사양 `padding 18 사방` (§1-1, §12 체크리스트) vs 현재 `option-card.tsx:36` `px-4 py-4` (=16/16). 12% 축소 — experience-choice-card.tsx 라인 84 `padding: 18` 표준 위반.
- **카드 gap (icon ↔ text)**: 사양 `gap 14` (=3.5 NW 토큰) vs 현재 OptionCard는 `justify-between` (좌우 분리 — 양 끝 정렬 구조 자체가 다름).
- **ChoiceList marginTop**: 사양 `mt-2` (=8) 요구 (§1, §12) vs 현재 `4-mode.tsx:63` `<View className="gap-3">` — marginTop 없음.
- **상단 헤더 영역 spacing**: `onboarding-step.tsx:28` `px-6 pt-6` + `mt-3` (title-progress) + `mt-2` (subtitle-title) — 사양 §1 PageRoot 표준 (`paddingTop: insets.top + 32`, `gap: 24`, StepRoot 내부 `gap: 16`)과 비율/구조가 다름. 2/3-step의 `OnboardingStepLayout`과 불일치.
- **카드 내부 TextStack gap**: 사양 `gap 4` (§1-1) vs 현재 `option-card.tsx:46` `mt-1` (=4) — 동등 (단, gap 표현 사용 권장).

### (c) Gradient 방향·깊이 — PASS

증거:
- 사양 §1/§3 모두 gradient 요구 없음 (mode step은 평면 카드 stack 패턴, keyscreen StepExperience verbatim).
- 현재 구현도 gradient 없음 — 일치.

### (d) Corner radius — FAIL

증거:
- **카드 radius**: 사양 `rounded-2xl` (16, §1-1, §2-5, §12) vs 현재 `option-card.tsx:36` `rounded-xl` (12). 25% 작음 — experience-choice-card.tsx 라인 82 `rounded-2xl` 표준 위반. 2/3-step 카드보다 작은 카드가 step 4에 나오면 위계 깨짐.

### (e) Typography 위계 — FAIL

증거:
- **Page Title (Title)**: 사양 `Playfair 26 / lineHeight 31.2` (§1, §2-2, §12) vs 현재 `onboarding-step.tsx:32` `font-playfair text-page-title` = `tailwind.config.ts:97` Playfair 24 / 28.8. **2pt 작음 + lineHeight 2.4pt 작음** — 사양 §9 row 3 명시.
- **Subtitle**: 사양 `Inter 14 / lineHeight 20` (`text-onboarding-step-subtitle`, `text-text-muted`) (§2-3) vs 현재 `onboarding-step.tsx:36` `text-card-body text-text-secondary` = Inter 13 / 19.5 / text-secondary. 색·size 모두 위반 (사양 §9 row 4).
- **Card title**: 사양 `Inter 600 16 / lineHeight 19.2` (`text-source-card-title`) (§2-7, §12) vs 현재 `option-card.tsx:42` `font-inter-semibold text-card-title`. `text-card-title`은 `tailwind.config.ts` 매핑상 Playfair 매핑 가능성 검증 필요 — option-card.tsx 코멘트 및 OptionCard는 Playfair 16 가능성. 사양 §9 row 7 "font family 교체 Playfair → Inter" 명시. 위반.
- **Card sub**: 사양 `Inter 13 / lineHeight 19.5` (`text-card-body`) (§2-7, §12) vs 현재 `option-card.tsx:46` `text-card-meta` = Inter 12 / 14.4 (design-tokens.ts:371). **1pt 작음 + lineHeight 5.1pt 작음** — 사양 §9 row 8 명시.
- **Progress eyebrow ("4 / 4")**: 사양 §9 row 2 + §11 + §12 **"제거" 명시** vs 현재 `onboarding-step.tsx:29-31` 강제 표시. 위반.

### (f) Color 사용 — FAIL

증거:
- **카드 unselected border**: 사양 `border.default` (dual, useColorScheme 분기) (§1-1, §4-7/4-8, §9 row 13) vs 현재 `option-card.tsx:37` `border-text-disabled` — 잘못된 토큰 (text-disabled는 텍스트 비활성 의도, border 의도 아님). 사양 §9 row 13 명시.
- **selected ring**: 사양 `border 1→2px brand.gold` (§1-1, §4-2/4-3) — 현재 `option-card.tsx:37` `border-2 border-gold` ✓ 색은 OK. 단 unselected border 1px만 정합 (현재 OK 1px).
- **카드 unselected opacity**: 사양 `opacity active ? 1 : 0.85` (§1-1, §4-1, §9 row 14) — 현재 `option-card.tsx` opacity 없음. 위반.
- **subtitle color**: 사양 `text-text-muted dual` (§2-3) vs 현재 `onboarding-step.tsx:36` `text-text-secondary` — 의미상 muted vs secondary 다름 (secondary는 보조 강조, muted는 약한 강조). 위반.
- **하드코딩 hex grep**: `option-card.tsx` 내 색은 모두 `design-tokens.ts` (brand/dark/light)에서 import — hex 하드코딩 0건 PASS. `4-mode.tsx`도 hex 없음 PASS. tailwind 토큰 사용은 OK.

---

## 2. 다크/라이트 양쪽 모드

- [ ] dark 모드 양쪽 확인 불가 — 시뮬레이터 캡처 없음
- [ ] light 모드 양쪽 확인 불가 — 시뮬레이터 캡처 없음
- **사양 §4-8 light Icon gold (#C9A84C on white) 2.0:1 = AA 미달**은 design-reviewer 일괄 판정 사항으로 (사양 §4-8 + Q3) language/experience 일관 처리 — 본 step 단독 FAIL 항목 아님.
- 코드 레벨 dual 토큰 사용은 부분 위반: `border-text-disabled`는 dual 토큰이지만 의미 부적합. 사양 요구 `border.default` (`option-card.tsx` 사용시 useColorScheme 분기 누락 — experience-choice-card.tsx:64-65 패턴 참조).

---

## 3. 스크린샷 비교

- `_workspace/keyscreen-shots/onboarding.png`은 welcome step만 캡처 (사양 §0 명시 — mode step keyscreen 자체 부재).
- step-experience verbatim 패턴 비교는 코드 레벨로만 수행 — `experience-choice-card.tsx` vs `option-card.tsx` 시각 패턴이 카드 구조 (좌측 icon + 2-tier 텍스트 vs 좌측 텍스트 + 우측 Check) 자체가 다름. 사양 §9 row 5/6 명시된 카드 컴포넌트 교체 필요.
- 시뮬레이터 캡처 후 추가 시각 검증 권장 (단, 현 코드 상태에서는 카드 구조 자체가 달라 캡처 비교 무의미 — rn-screen-builder 수정 완료 후 재검증).

---

## 4. 결정

- **결과: FAIL (6항목 중 5 FAIL — a/b/d/e/f, c만 PASS)**
- 사양 §9 retroactive 분석과 동일 결론 — 현재 79 LOC는 OnboardingStep + OptionCard 조합으로 작성되어 사양 §1 트리 (OnboardingStepLayout + ModeChoiceCard) 표준에 미달.

### 라우팅

- **rn-screen-builder** (1순위 — 본 검증 반려 대상):
  1. `app/onboarding/4-mode.tsx` wrapper 교체: `OnboardingStep` → `OnboardingStepLayout` (`src/components/onboarding/onboarding-step-layout.tsx` 이미 존재, step 2/3와 동일 패턴). progress eyebrow 자동 제거. Title/Subtitle은 사양 §1 inline arbitrary (Playfair 26 / lineHeight 31.2) + `text-onboarding-step-subtitle text-text-muted` 적용.
  2. `src/components/onboarding/mode-choice-card.tsx` 신규 작성 (사양 §1-1 + §9-1 권장 (b) — experience-choice-card.tsx verbatim 복사 후 icon 매핑만 Sparkles(first-time) / BookOpen(heavy)로 교체). props: `{ variant: 'first-time' | 'heavy'; title: string; sub: string; selected: boolean; onPress: () => void; }`.
  3. `4-mode.tsx` 본문 `OptionCard` 2개 → `ModeChoiceCard` 2개 교체. accessibility hint = sub 적용 (experience-choice-card.tsx:80 패턴).
  4. ChoiceList wrapper `<View className="gap-3 mt-2">` (현재 `mt-2` 누락 추가).
  5. PrimaryButton label은 현재 OK (`t('onboarding.mode.finish')` "시작하기"). 변경 없음.
  6. i18n 키 변경 0건 (사양 §8 — 현재 RN 키 그대로 사용).

- **design-spec-author**: 사양 §10 Q1 / Q2 / Q3 / Q5는 사양 자체에 결론 명기 완료 (RN 5-step 정식 채택, Sparkles+BookOpen 유지, light gold AA 미달은 일괄 판정, 카드 분리 (b) 권장). **사양 추가 보강 필요 항목 없음**.

- **infra-architect** (P0 후속, 본 cycle 차단 아님): 사양 §3-2 권장 `onboardingStepTitleSm` (Playfair 26 / lineHeight 31.2) typography 토큰 1건 추가 — 3-experience + 4-mode 두 사용처 커버. 본 cycle은 inline arbitrary 유지 가능하므로 차단 아님.

- **qa-inspector**: 본 검증 FAIL이므로 qa 단계 진입 보류. rn-screen-builder 수정 후 재검증 → PASS 시 qa로 전달.

### 재검증 시점

rn-screen-builder가 위 1~4 수정 완료 → 재검증 요청 SendMessage 받음 → 동일 6항목 체크리스트 재실행. 카드 구조 교체 + wrapper 교체 + progress 제거가 핵심 게이트.

---

## 보고서 위치

`/Users/yejinkim/dev/winemine-app/_workspace/design-review_onboarding-4-mode_20260521_025433.md`
