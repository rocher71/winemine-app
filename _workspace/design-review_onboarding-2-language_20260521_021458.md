# 디자인 리뷰 — /onboarding/2-language (1차 retroactive)

> **검증일:** 2026-05-21
> **검증자:** design-reviewer
> **사양:** `_workspace/design-specs/onboarding-2-language.md` (v1, 534 lines)
> **구현:** `app/onboarding/2-language.tsx` (75 LOC)
> **참고:** `src/components/settings/settings-radio-row.tsx` (radio row 표준)
> **스크린샷:** `_workspace/keyscreen-shots/onboarding.png` (welcome step만 — language step 별도 캡쳐 없음. 시각 비교는 JSX/CSS 기반)

---

## 대상

- 사양: `_workspace/design-specs/onboarding-2-language.md`
- 원본: `../winemine-keyscreen/src/app/onboarding/page.tsx` (line 171–218 `StepLanguage` + line 336–394 `ChoiceCard`)
- 구현: `app/onboarding/2-language.tsx` + `src/components/onboarding/onboarding-step.tsx` + `src/components/shared/option-card.tsx`

---

## 6항목 체크리스트

### (a) 요소 누락 — FAIL

키스크린 verbatim 패턴과 비교했을 때 4개 핵심 요소 누락 + 1개 잉여 요소.

| # | 항목 | 키스크린 | 현재 RN | 위치 |
|---|---|---|---|---|
| a-1 | **IconBadge (44×44 round)** | ChoiceCard line 348~370: 44×44 round bg=gold-alpha-0.08, items/justify-center | ✗ 누락 — `OptionCard` 우측 Check만 | `app/onboarding/2-language.tsx:62-71` (OptionCard) |
| a-2 | **IconBadge text "KR" / "EN"** | ChoiceCard line 357~366: Playfair 16 gold literal | ✗ 누락 | 동상 |
| a-3 | **opacity active ? 1 : 0.85** | ChoiceCard line 343: `opacity: active ? 1 : 0.85` | ✗ 누락 (OptionCard에 opacity 분기 없음) | `src/components/shared/option-card.tsx:39` |
| a-4 | **active ring (boxShadow 대체)** | ChoiceCard line 342: `boxShadow: '0 0 0 1px rgba(139,26,42,0.4)'` (selected) | ✗ 누락 — border 1→2px만 (사양 §6 deviation 채택 시 OK이나 verbatim는 추가 ring) | `src/components/shared/option-card.tsx:37` |
| a-5 | **progress eyebrow "2 / 4" (잉여)** | 키스크린 step 인디케이터 **없음** | ✓ `OnboardingStep` line 28~31에서 강제 노출 | `src/components/onboarding/onboarding-step.tsx:28-31` + `app/onboarding/2-language.tsx:45` (step=2) |
| a-6 | **`onboarding.language.{ko,en}` i18n 키** | keyscreen i18n: `onboarding.language.ko/en` namespace | ✗ — `t('language.ko')` top-level 키만 사용 | `app/onboarding/2-language.tsx:63,68` + `src/lib/i18n/{ko,en}.json` 누락 |

**증거 (file:line):**
- `app/onboarding/2-language.tsx:43-44` `<OnboardingStep step={2} ...>` — progress eyebrow 강제 표시 (사양 §9-#2)
- `app/onboarding/2-language.tsx:62-71` `<OptionCard ...>` — IconBadge/locale 식별자 없음 (사양 §9-#5~#7)
- `app/onboarding/2-language.tsx:63` `t('language.ko')` — sub-namespace `onboarding.language.ko` 미사용 (사양 §8 + §9-#5)
- `src/lib/i18n/ko.json:65-68` — `onboarding.language` 안 `title/subtitle`만 존재, `ko/en` 키 부재

---

### (b) Spacing 비율 — FAIL

키스크린 PageRoot/StepRoot/ChoiceList의 spacing 비율을 보존 못함.

| 위치 | 키스크린 (verbatim) | 현재 RN | 차이 |
|---|---|---|---|
| **PageRoot padding** | `32px 24px 40px` (top 32 / horizontal 24 / bottom 40) | `paddingTop: insets.top` (SafeArea만, +32 누락), bottom `Math.max(insets.bottom, 16)` (40 → 16, **2.5배 축소**) | top: -32, bottom: -24 |
| **StepRoot gap** | `gap: 16` (StepLanguage line 183) | `OnboardingStep`이 title block `mt-3` (=12) + subtitle `mt-2` (=8) + ScrollView body separation `paddingTop: 24` — gap 일관성 깨짐 (12/8/24 fragments) | 위계 손상 |
| **ChoiceList gap** | `gap-12 marginTop-8` (line 197) | `gap-3` (=12) ✓ but `marginTop: 8` 누락 | mt-2 부재 |
| **ChoiceCard height** | `height: 96` (line 339) | `py-4` (=16 + content auto) → 콘텐츠 기준 ~48~56 추정, **96의 약 절반** | -40 |
| **ChoiceCard padding** | `paddingHorizontal: 18` (line 340) | `px-4` (=16) | -2 (미세) |
| **ChoiceCard gap (row)** | `gap: 14` (=spacing[3.5]) | OptionCard `justify-between` (gap 자동, gap-prop 미사용) | 패턴 다름 |
| **OnboardingStep ScrollView paddingTop** | (해당 없음 — title/list는 동일 stack) | `paddingTop: 24` ScrollView 안 별도 padding | 키스크린에 없는 인위적 분리 |

**증거:**
- `src/components/onboarding/onboarding-step.tsx:27` `paddingTop: insets.top` — keyscreen `+32` 추가 padding 누락
- `src/components/onboarding/onboarding-step.tsx:50` `paddingBottom: Math.max(insets.bottom, 16)` — keyscreen 40 대비 -24
- `src/components/onboarding/onboarding-step.tsx:43` `paddingTop: 24` — keyscreen StepRoot에 없는 ScrollView 인위적 spacer
- `src/components/shared/option-card.tsx:36-37` `px-4 py-4 rounded-xl` — keyscreen `px-18 h-24 rounded-2xl` 차이

---

### (c) Gradient 방향·깊이 — N/A → PASS

본 화면(language step)에 gradient 요소 없음. 키스크린 `StepLanguage` 및 `ChoiceCard` line 336~394 어디에도 LinearGradient/CSS gradient 부재. PageRoot도 단색 `bg-bg-deepest`. **체크 항목 자체 해당 없음 — PASS 처리.**

---

### (d) Corner radius — FAIL

| 위치 | 키스크린 | 현재 RN | 차이 |
|---|---|---|---|
| **ChoiceCard** | `borderRadius: 16` (`rounded-2xl`) line 341 | `OptionCard` `rounded-xl` (=12) line 36 | -4 (key visual 손상) |
| IconBadge | `borderRadius: 22` (`rounded-full` 44/2) | ✗ 컴포넌트 누락 (해당 없음) | — |
| PrimaryButton | (별도 컴포넌트 — 사양 범위 외) | (변경 없음) | OK |

**증거:**
- `src/components/shared/option-card.tsx:36` `rounded-xl` — 사양 §2-6 `rounded-2xl` 미달

---

### (e) Typography 위계 — FAIL

5개 항목 위계 손상.

| 위치 | 키스크린 | 현재 RN | 차이 |
|---|---|---|---|
| **Title** | Playfair **28** / lineHeight 33.6 (=1.2) / margin 0 (StepLanguage line 184~191) | `OnboardingStep:32` `text-page-title` (= typography.pageTitle = **24**/28.8) + `mt-3` | -4px (위계 하향) |
| **Subtitle** | Inter **14** / regular / muted / margin 0 (line 194~196) | `OnboardingStep:36` `text-card-body` (= typography.cardBody = **13**/19.5) + `text-secondary` (not `muted`) | -1px + 색 토큰 다름 (`secondary` vs `muted`) |
| **ChoiceCard title** | Inter **18** / weight 600 / cream (line 378~383) | `OptionCard:42` `text-card-title` (= typography.cardTitle Playfair **16**) + `font-inter-semibold` | -2px + family 충돌 (className text-card-title=Playfair, font-inter-semibold override — race) |
| **IconBadge text** | Playfair **16** / regular / gold (line 357~366) | ✗ 누락 | — |
| **progress eyebrow (잉여)** | (없음) | `OnboardingStep:29` `text-card-meta uppercase muted` | 본 화면에 없어야 할 요소 |

**증거:**
- `src/components/onboarding/onboarding-step.tsx:32` `text-page-title` (24px) vs 사양 §2-3 `28px`
- `src/components/onboarding/onboarding-step.tsx:36` `text-card-body text-text-secondary` vs 사양 §2-4 `14px text-text-muted`
- `src/components/shared/option-card.tsx:42` `font-inter-semibold text-card-title` — className 충돌 (typography.cardTitle은 Playfair, font-inter-semibold가 family override) + 16px vs 사양 18px

---

### (f) Color 사용 — FAIL (1건) / 대부분 OK

대부분 토큰 사용 OK. 1건 잘못된 토큰 + 1건 active border 분기 누락.

| 위치 | 키스크린 | 현재 RN | 차이 |
|---|---|---|---|
| **Subtitle color** | `text-muted` (line 195) | `text-text-secondary` (`OnboardingStep:36`) | 토큰 의미 다름 (`muted`는 더 흐림. 사양 §2-4 `text-muted` 권장) |
| **ChoiceCard unselected border** | `border-default` (line 341 unselected branch) | `border-text-disabled` (`OptionCard:37`) | 의미 토큰 misuse (`text-disabled`는 텍스트용 — border에 사용은 settings-radio-row와 불일치) |
| **active border 색** | `brand.gold` 1px + ring `rgba(139,26,42,0.4)` | `border-gold` 2px (ring 누락 — 사양 §6 deviation 채택 시 OK) | 사양 deviation OK 가정하면 PASS, 엄밀히 verbatim 시 FAIL |
| Background bg-deepest | `--color-bg-deepest` dual | `bg-bg-deepest dark:bg-bg-deepest` (OnboardingStep:27) | OK |
| 하드코딩 hex grep | — | grep 결과: `app/onboarding/2-language.tsx` 본문 hex 0건 / `OptionCard`도 brand.* 토큰만 / `OnboardingStep`도 토큰 | **하드코딩 0건 — 이 부분 PASS** |

**증거:**
- `src/components/shared/option-card.tsx:37` `border border-text-disabled` — 사양 §2-6 `border.default` 사용 권장 (settings-radio-row와 일관)
- `src/components/onboarding/onboarding-step.tsx:36` `text-text-secondary` — 사양 §2-4 `text-text-muted`

---

## 다크/라이트 양쪽 모드

- [x] **하드코딩 hex 0건** — `bg-bg-deepest dark:bg-bg-deepest`, `text-text-primary dark:text-text-primary`, `bg-surface` 등 dual 토큰 사용. PASS.
- [ ] **라이트 모드 IconBadge gold-on-white 대비 미달 가능성** — IconBadge 자체 누락이라 N/A.
- [ ] **라이트 모드 subtitle 가독성** — `text-text-secondary`(현재) vs 사양 `text-text-muted` 대비 차이. design-spec 권장 muted 가독성은 §4-5에서 4.7:1 (AA) 확인. 현재 `secondary` 토큰 light 값 확인 필요 (이번 1차에서 별도 확인 없음 — JSX/CSS 검증 위주, 시뮬레이터 캡쳐 보류).

---

## 스크린샷 비교 (멀티모달)

- `_workspace/keyscreen-shots/onboarding.png` 는 **welcome step (StepWelcome) 캡쳐만 포함**. language step (StepLanguage) 캡쳐 없음.
- 사양 §0 (스크린샷 항목) 명시: "welcome step만 캡쳐 — language step 별도 캡쳐 없음".
- **시각 비교는 JSX/CSS line-by-line 검증으로 대체.** 키스크린 line 171~218 (StepLanguage) + line 336~394 (ChoiceCard verbatim) 기반.
- design-reviewer 추가 권장: P2 세션에서 language step 캡쳐 보강 (3-experience, 4-mode도 동일 필요).

---

## 결정

- **결과: FAIL**
- **6항목 PASS/FAIL 합계: 1 PASS (c gradient N/A) / 5 FAIL (a, b, d, e, f) — FAIL 5**
- **하드코딩 hex 0건 (sub-check PASS).**

### 라우팅

- **rn-screen-builder (1차 반려, 구현 수정 요청):**
  - (a-1~a-4) ChoiceCard 컴포넌트 교체 — `OptionCard` 대신 신규 `language-choice-card.tsx` 또는 inline (사양 §10 Q6). IconBadge 44×44 + KR/EN 식별자 + opacity 0.85/1 분기 + active ring 처리.
  - (a-5) `OnboardingStep` progress eyebrow 제거 (또는 `showProgress?: boolean` prop 추가 후 본 화면에서 끔). 사양 §10 Q2 — 본 cycle은 2-language만 적용, 3/4 step은 후속 cycle.
  - (a-6) i18n 키 `onboarding.language.ko`, `onboarding.language.en` 추가 (`src/lib/i18n/{ko,en}.json` 각각 2건씩) + `app/onboarding/2-language.tsx:63,68` `t('onboarding.language.ko/en')`로 교체.
  - (b) Page padding `32px 24px 40px` 정확히. StepRoot `gap-4` (=16) 단일. ChoiceList `mt-2 gap-3`. ChoiceCard `h-24 paddingHorizontal: 18 rounded-2xl flex-row gap-3.5`.
  - (d) ChoiceCard `rounded-xl` → `rounded-2xl`.
  - (e) Title `text-page-title` (24) → 28px inline 또는 신규 `onboardingStepTitle` 토큰. Subtitle 13→14 + `text-text-muted`. Choice title Inter 600 18px (Playfair 16 → Inter 18).
  - (f) Subtitle `text-text-secondary` → `text-text-muted`. ChoiceCard border `border-text-disabled` → `border.default` (useColorScheme 분기).
- **design-spec-author (사양 갭 없음):** 사양은 충분히 명세됨. 본 1차에서 추가 보강 요청 없음.
- **infra-architect (P0 토큰 확장 — 권장, 선택):**
  - typography 신규 3건 (`onboardingStepTitle 28/33.6`, `onboardingStepSubtitle 14/20`, `onboardingChoiceLabel Inter600 18/21.6`) — `src/lib/design-tokens.ts` + `tailwind.config.ts`. 사양 §3-2 / §10 Q4. step 3/4도 같은 위계 재사용. **rn-screen-builder 본 cycle은 inline fallback 허용** (`text-[28px] leading-[34px]` 등). 토큰 추가가 권장이나 선택적.
- **리더 escalation:**
  - Q1 (ko 문구 keyscreen verbatim vs 현재 유지) — 사양 §10 Q1 권장 "현재 RN 유지" 채택. design-reviewer 시각 게이트 차이 없음 (문구만, 의미 동일). 별도 escalation 불필요.
  - Q2 (`OnboardingStep` 처분 — 4 step 영향) — 본 cycle 2-language만 progress 제거. 3/4 step 사양 작성 시 일괄 리팩토링 권장 (사양 §10 Q2). **리더 판단 항목.**
  - Q4 (typography 토큰 추가 정책) — P0 세션 처리. **리더 판단 항목.**

### 재검증 시점

rn-screen-builder 수정 완료 → 재검증 요청 → 동일 6항목 체크리스트 재실행. 본 cycle 통과 시 qa-inspector로.

---

## 부록 — 변경 우선순위 (rn-screen-builder 작업 순서 권장)

| 순위 | 항목 | 사유 |
|---|---|---|
| 1 | a-5 (progress eyebrow 제거) | `OnboardingStep` 단일 prop 변경으로 즉시 효과. 4 step 모두 영향 (Q2 리더 판단 후 진행) |
| 2 | a-1~a-4 (ChoiceCard 교체) | 시각 차이 최대. IconBadge + locale 식별자 + opacity 분기. **신규 컴포넌트 생성 필요** |
| 3 | b (spacing 비율 정정) | 사용자가 느끼는 위계 — 32/24/40 padding, 96 height 등 |
| 4 | e (typography 위계) | 28/14/18 size 정정. 토큰 추가 vs inline 결정 후 |
| 5 | a-6 (i18n 키 추가) | JSON 2 파일 + 코드 1 파일. 단순 |
| 6 | d (rounded-2xl) | 1 라인 변경 |
| 7 | f (token 정정) | text-secondary → text-muted, text-disabled → border.default |

---

## 검증 한계 (1차)

- 시뮬레이터 캡쳐 비교 미수행 — JSX/CSS line-by-line 검증 위주. P2 세션에서 language step 스크린샷 캡쳐 후 2차 검증 권장.
- 라이트 모드 IconBadge 대비 (사양 §4-5 / §10 Q5) — IconBadge 자체 누락이라 N/A. 구현 후 재검증 시 확인.
- `OnboardingStep` 리팩토링 (Q2) 영향 범위 (3-experience, 4-mode) — 본 cycle 범위 외, 별도 cycle.
