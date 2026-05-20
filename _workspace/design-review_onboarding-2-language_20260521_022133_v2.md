# 디자인 리뷰 — /onboarding/2-language (2차 post-fix)

> **검증일:** 2026-05-21
> **검증자:** design-reviewer
> **사양:** `_workspace/design-specs/onboarding-2-language.md` (v1, 534 lines)
> **1차 보고서:** `_workspace/design-review_onboarding-2-language_20260521_021458.md` (5/6 FAIL)
> **2차 구현 (미커밋):**
> - `app/onboarding/2-language.tsx` (재작성, 127 LOC)
> - `src/components/onboarding/onboarding-step-layout.tsx` (신규, 57 LOC)
> - `src/components/onboarding/language-choice-card.tsx` (신규, 106 LOC)
> - `src/lib/design-tokens.ts` (typography 3건 신규: onboardingStepTitle/Subtitle/ChoiceLabel)
> - `tailwind.config.ts` (fontSize 3건 신규: onboarding-step-title/subtitle, onboarding-choice-label)
> - `src/lib/i18n/{ko,en}.json` (각 `onboarding.language.{ko,en}` 키 2건씩)
>
> **스크린샷:** `_workspace/keyscreen-shots/onboarding.png` (welcome step만 — language step 별도 캡쳐 없음. JSX line-by-line 비교)
> **범위 외 (사용자 명시):** Day 6 settings / BottomNav / AppHeader.

---

## 대상

- 사양: `_workspace/design-specs/onboarding-2-language.md`
- 원본: `../winemine-keyscreen/src/app/onboarding/page.tsx`
  - `StepLanguage` line 171–218
  - `ChoiceCard` line 336–394 (verbatim base for `LanguageChoiceCard`)
  - `<main>` PageRoot line 47–93 (verbatim base for `OnboardingStepLayout`)
- 구현: `app/onboarding/2-language.tsx` + `src/components/onboarding/{onboarding-step-layout, language-choice-card}.tsx`

---

## 1차 FAIL 5건 해소 검증 (STILL-FAIL 여부)

### (a) 요소 누락 — STILL-FAIL? **PASS**

| 1차 ID | 항목 | 1차 상태 | 2차 검증 | 결과 |
|---|---|---|---|---|
| a-1 | IconBadge 44×44 round | FAIL | `language-choice-card.tsx:83-94` width:44 height:44 borderRadius:22 bg withAlpha(brand.gold, 0.08) items/justify center | **해소** |
| a-2 | IconBadge text "KR"/"EN" Playfair 16 gold | FAIL | `language-choice-card.tsx:95-97` font-playfair text-gold fontSize:16 + `ICON_TEXT[locale]` literal | **해소** |
| a-3 | opacity active ? 1 : 0.85 | FAIL | `language-choice-card.tsx:78` `opacity: pressed ? (selected ? 0.95 : 0.8) : selected ? 1 : 0.85` | **해소** (press feedback도 keyscreen 0.99 scale + settings-radio-row 일관 추가) |
| a-4 | active ring (boxShadow 대체) | FAIL | `language-choice-card.tsx:76-77` `borderWidth: selected ? 2 : 1, borderColor: selected ? brand.gold : borderUnselected` — 사양 §6 deviation 채택 (border 2px) | **해소** (deviation 사양 명세 일치) |
| a-5 | progress eyebrow "2 / 4" 제거 | FAIL | `app/onboarding/2-language.tsx:83` `OnboardingStepLayout` 사용 — progress eyebrow 없는 신규 wrapper. `OnboardingStep` 의존 제거 | **해소** |
| a-6 | i18n 키 `onboarding.language.{ko,en}` | FAIL | `src/lib/i18n/ko.json:71-76` `"ko": "한국어", "en": "English"` + `en.json` 동일. `2-language.tsx:114,120` `t('onboarding.language.ko')`/`t('onboarding.language.en')` | **해소** |

→ **(a) PASS**

### (b) Spacing 비율 — STILL-FAIL? **PASS**

| 1차 차이 | 1차 상태 | 2차 검증 | 결과 |
|---|---|---|---|
| PageRoot padding `32/24/40` (top SafeArea+32, bottom +40) | FAIL | `onboarding-step-layout.tsx:39-44` paddingTop:insets.top+32, paddingBottom:Math.max(insets.bottom,0)+40, paddingHorizontal:24, gap:24 | **해소** |
| StepRoot gap 16 (단일) | FAIL | `onboarding-step-layout.tsx:47` `<View className="flex-1" style={{ gap: 16 }}>` — title/subtitle/list가 단일 stack | **해소** |
| ChoiceList `mt-2 gap-3` (=8/12) | FAIL | `2-language.tsx:111` `className="gap-3 mt-2"` | **해소** |
| ChoiceCard height 96 | FAIL | `language-choice-card.tsx:73` `height: 96` | **해소** |
| ChoiceCard paddingHorizontal 18 | FAIL | `language-choice-card.tsx:74` `paddingHorizontal: 18` | **해소** |
| ChoiceCard row gap 14 | FAIL | `language-choice-card.tsx:75` `gap: 14` | **해소** |
| ScrollView 인위적 24 paddingTop 제거 | FAIL | `OnboardingStepLayout`은 ScrollView 미사용 — 단순 View stack | **해소** |

→ **(b) PASS**

### (c) Gradient 방향·깊이 — **N/A → PASS** (1차 동일)

본 화면 gradient 요소 없음. PageRoot 단색 `bg-bg-deepest`. PASS.

### (d) Corner radius — STILL-FAIL? **PASS**

| 위치 | 1차 | 2차 검증 | 결과 |
|---|---|---|---|
| ChoiceCard `rounded-2xl` (16) | FAIL (`rounded-xl` 12) | `language-choice-card.tsx:71` `rounded-2xl` | **해소** |
| IconBadge `rounded-full` (=22) | N/A (컴포넌트 누락) | `language-choice-card.tsx:89` `borderRadius: 22` (=44/2 = full) | **신규 해소** |

→ **(d) PASS**

### (e) Typography 위계 — STILL-FAIL? **PASS**

| 항목 | 1차 | 2차 검증 (사양 §3-2 신규 토큰 채택) | 결과 |
|---|---|---|---|
| Title Playfair **28** / lh 33.6 | FAIL (24/28.8) | `2-language.tsx:100` `font-playfair text-onboarding-step-title text-text-primary dark:text-text-primary` ← `tailwind.config.ts:181` `['28px', { lineHeight: '33.6px' }]` | **해소** |
| Subtitle Inter **14** / muted | FAIL (13/19.5, secondary) | `2-language.tsx:106` `font-inter text-onboarding-step-subtitle text-text-muted dark:text-text-muted` ← `tailwind.config.ts:182` `['14px', { lineHeight: '20px' }]` | **해소** |
| ChoiceCard title Inter **18** / 600 | FAIL (Playfair 16 + family override race) | `language-choice-card.tsx:101` `font-inter-semibold text-onboarding-choice-label text-text-primary dark:text-text-primary` ← `tailwind.config.ts:183` `['18px', { lineHeight: '21.6px' }]` | **해소** (family race도 단일 className으로 해결) |
| IconBadge text Playfair **16** / gold | (1차 N/A — 누락) | `language-choice-card.tsx:95` `font-playfair text-gold` + `fontSize: 16` inline | **신규 해소** |
| progress eyebrow 잉여 | FAIL | OnboardingStep 미사용 → 제거 | **해소** |

→ **(e) PASS**

### (f) Color 사용 — STILL-FAIL? **PASS**

| 1차 위치 | 1차 | 2차 검증 | 결과 |
|---|---|---|---|
| Subtitle `text-text-secondary` → `text-text-muted` | FAIL | `2-language.tsx:106` `text-text-muted dark:text-text-muted` | **해소** |
| ChoiceCard unselected border `border-text-disabled` → `border.default` | FAIL | `language-choice-card.tsx:57,77` `useColorScheme()` 분기 → `light.border.default`/`dark.border.default` (raw token 사용, dual 자동 분기) | **해소** |
| Active border brand.gold (deviation 2px) | FAIL (verbatim 기준) | `language-choice-card.tsx:76-77` borderWidth 2 / brand.gold — 사양 §6 deviation 채택 | **해소** (deviation 일치) |
| 하드코딩 hex 0건 | PASS | `grep '#[0-9a-fA-F]{3,8}|rgba(' app/onboarding/2-language.tsx src/components/onboarding/onboarding-step-layout.tsx src/components/onboarding/language-choice-card.tsx` → **0건** (rgba 1건은 주석 내 키스크린 verbatim 표기) | **유지 PASS** |

→ **(f) PASS**

---

## 신규 FAIL (2차 도입된 새 이슈) — **0건**

2차 구현은 1차 FAIL 5건을 모두 해소했고, 새로 도입된 회귀/시각 이슈는 발견되지 않음. 세부 검증:

- **토큰 사용 검증:** `bg-bg-deepest` / `bg-surface` / `text-text-primary` / `text-text-muted` / `border-default` (raw via useColorScheme) / `text-gold` / `withAlpha(brand.gold, 0.08)` — 모두 design-tokens.ts + tailwind.config.ts 등록 토큰. 하드코딩 hex 0건 (`grep -nE "#[0-9a-fA-F]{3,8}|rgba\(" ...` 결과: 본문 0, 주석 1건 verbatim 표기만).
- **신규 typography 토큰 3건 정합:** design-tokens.ts:489-491 + tailwind.config.ts:181-183 — 양쪽 일치 (28/33.6, 14/20, 18/21.6). 사양 §3-2 권장값 일치.
- **i18n 키 4건 정합:** ko.json:71-76 + en.json:71-76 — `onboarding.language.{title,subtitle,ko,en}` 모두 존재. 자기 언어명은 양쪽 모드 동일 (사양 §4-6 일치).
- **다크/라이트 양쪽 모드:** 모든 색 dual 토큰 자동 분기 (`bg-bg-deepest dark:bg-bg-deepest` 패턴). IconBadge `withAlpha(brand.gold, 0.08)`는 양쪽 모드 동일 (사양 §4-4/5 명시). border.default는 `useColorScheme()` 분기로 처리 — RN deviation 사양 §6 #5 일치.
- **접근성:** `accessibilityRole="radio"` + `accessibilityState={{ selected }}` + `hitSlop={6}` + IconBadge `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` (사양 §7 일치).
- **인터랙션:** `Haptics.selectionAsync()` on ChoiceCard (사양 §5 일치), `changeLanguage(locale)` 즉시 호출 (`2-language.tsx:57`), CTA disabled=!picked, loading=saving, profile update + router.push, errorMsg Toast (사양 §5-1/5-2 일치).
- **OnboardingStepLayout marginTop:auto:** `onboarding-step-layout.tsx:52` `style={{ marginTop: 'auto' }}` — keyscreen verbatim. PageRoot gap:24가 StepRoot ↔ CtaWrapper 사이 적용.
- **press feedback:** `scale 0.99` + opacity dim (settings-radio-row 일관, 사양 §4-3) — `language-choice-card.tsx:78-79`.

**검증 한계 (1차와 동일):**
- 시뮬레이터 실제 캡쳐 비교 미수행 — JSX/CSS line-by-line 검증. P2 세션에서 language step 스크린샷 캡쳐 후 시각 재검증 권장.
- 라이트 모드 IconBadge "KR"/"EN" 가독성 (사양 §10 Q5 — gold-on-gold-alpha-0.08 over white ~2.5:1) — 시각 캡쳐 확보 후 확인. 본 cycle 차단 사유 아님 (보조 식별자, 본 라벨은 choice title — AAA).

---

## 결정

- **결과: PASS**
- **6항목 PASS/FAIL 합계: 6 PASS / 0 FAIL** (1차 5 FAIL → 2차 0 FAIL)
- **STILL-FAIL: 0건**
- **신규 FAIL: 0건**
- **하드코딩 hex 0건 (sub-check PASS — 1차 유지)**

### 라우팅

- **qa-inspector (다음 단계 — 통합 정합성 검증):**
  - RLS 검증: `profiles.update({ language })` — RLS 정책 `id = auth.uid()` 자동 필터링 (anon JWT). RN에서 `SUPABASE_SERVICE_ROLE_KEY` 사용 0 확인 필요.
  - shape 검증: `profiles.language` 컬럼 `'ko'|'en'` enum CHECK. `AppLocale` 타입과 일치.
  - i18n 누락 grep: `t('onboarding.language.title/subtitle/ko/en')` + `t('common.next')` + `t('errors.onboardingSaveFailed')` — 5건 모두 ko/en 양쪽 존재 확인.
  - 하드코딩 hex grep: `src/components/onboarding/{onboarding-step-layout,language-choice-card}.tsx` + `app/onboarding/2-language.tsx` → 0건 확인됨.
- **rn-screen-builder (본 cycle 작업 완료):** 본 cycle 추가 작업 없음.
- **design-spec-author (사양 갭 없음):** 사양 v1이 2차 구현을 정확히 반영. 추가 보강 요청 없음.
- **infra-architect (P0 토큰 확장 — 완료):** typography 3건 신규 토큰(`onboardingStepTitle/Subtitle/ChoiceLabel`) + tailwind.config 클래스 3건 모두 등록 확인됨. step 3/4 사양 작성 시 재사용 가능.
- **리더 escalation (사양 §10 미해결 질문 후속 — 본 cycle 영향 없음, 다음 cycle 처리):**
  - Q2 (`OnboardingStep` 처분 — 4 step 영향): 본 cycle은 `OnboardingStepLayout` 신규로 우회. 3-experience/4-mode 사양 작성 시 `OnboardingStep` 폐기 또는 리팩토링 일괄 결정. **본 cycle 차단 사유 아님.**
  - Q5 (라이트 모드 IconBadge 가독성): 시각 캡쳐 확보 후 별도 cycle. **본 cycle 차단 사유 아님.**

### 다음 단계

qa-inspector 단계 진행 가능 (디자인 시각 게이트 통과). 본 화면 commit 후 1차/2차 보고서 + 사양 함께 PR에 첨부 권장.

---

## 부록 — 1차→2차 변경 요약

| 영역 | 1차 | 2차 |
|---|---|---|
| wrapper | `OnboardingStep` (progress 강제) | `OnboardingStepLayout` 신규 (verbatim PageRoot+StepRoot) |
| 카드 | `OptionCard` (Check icon, rounded-xl, py-4) | `LanguageChoiceCard` 신규 (IconBadge KR/EN, rounded-2xl, h-24, paddingH 18) |
| typography | typography.pageTitle(24)/cardBody(13)/cardTitle(16) | 신규 onboardingStepTitle(28)/Subtitle(14)/ChoiceLabel(18) |
| i18n | top-level `language.ko/en` | `onboarding.language.ko/en` (sub-namespace) |
| LOC | 75 (단일) | 127 + 57 + 106 = 290 (3 파일 분리, 재사용 가능) |
