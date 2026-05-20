# 디자인 리뷰 — /onboarding/3-experience

> **회차:** 1차 (retroactive — Day 5 기존 77 LOC 갭 검증)
> **검증자:** design-reviewer
> **검증일:** 2026-05-21 02:32:33
> **사양 버전:** v1 (design-spec-author `_workspace/design-specs/onboarding-3-experience.md`)

---

## 0. 대상

| 항목 | 경로 |
|---|---|
| 사양 | `_workspace/design-specs/onboarding-3-experience.md` (569 lines) |
| 원본 JSX `StepExperience` | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 220~279 |
| 원본 JSX `ExperienceCard` | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 396~452 |
| 원본 i18n ko | `../winemine-keyscreen/messages/ko.json` line 38~46 |
| 원본 i18n en | `../winemine-keyscreen/messages/en.json` line 38~46 |
| 구현 화면 | `app/onboarding/3-experience.tsx` (77 LOC) |
| 구현 카드 | `src/components/shared/option-card.tsx` (재사용 중 — 부적합) |
| 구현 wrapper | `src/components/onboarding/onboarding-step.tsx` (사양은 `onboarding-step-layout.tsx` 요구) |
| 구현 i18n ko | `src/lib/i18n/ko.json` line 77~82 (`beginnerDescription`/`expertDescription`) |
| 구현 i18n en | `src/lib/i18n/en.json` line 77~82 |
| 키스크린 스크린샷 | `_workspace/keyscreen-shots/onboarding.png` (welcome step만 — experience step 캡처 부재. JSX line-by-line 비교로 보강) |
| 인접 표준 | `src/components/onboarding/language-choice-card.tsx` (이미 hardening 완료 — verbatim 짝 패턴) |

**SCOPE-OUT 확인:** Day 6 settings 3 sub + settings hub + `(tabs)/settings/_layout` + BottomNav + AppHeader. Q1(RN 5-step vs keyscreen 4-step) → step 4 mode cycle에서 결정. 모두 본 리뷰 카운트 외.

---

## 1. 6항목 체크리스트

### (a) 요소 누락 — **FAIL**

키스크린 `StepExperience` 트리(line 220~278) 대비 현재 RN 누락/혼입 요소:

| # | 요소 | 키스크린 | 현재 RN | 상태 |
|---|---|---|---|---|
| a-1 | Progress eyebrow ("3 / 4") | 없음 | `OnboardingStep` 내장 (`onboarding-step.tsx` line 29~31) 노출 | **혼입** — 키스크린은 step 카운터 없음. `OnboardingStepLayout`(language step에서 사용 중)으로 교체하면 자동 해결 |
| a-2 | ExperienceCard 좌측 Lucide icon (GlassWater / Award) | line 251, 258, size 24 strokeWidth 1.5 gold, **카드 좌측 + paddingTop 2** | 누락. `OptionCard`는 우측에 `Check`만, selected 시에만 노출 (line 51) | **누락** — `app/onboarding/3-experience.tsx:62~73`에 `icon` prop 자체 없음. `OptionCard` 시그니처가 icon prop 미지원 |
| a-3 | IconWrap (paddingTop:2 baseline 정렬) | line 427 verbatim | 누락 (icon 자체가 없음) | **누락** — a-2 종속 |
| a-4 | 카드 본문 sub (Inter 13 1.4 muted) | line 439~447 — 2-tier `title` + `sub` (분리된 `<span>` 두 개) | `OptionCard`는 description 단일 라인 + size 12 (cardMeta) — 위계 1단계 낮음 | **혼입+불일치** — sub 자체는 있으나 size·family 모두 다름 (§(e) 참조) |
| a-5 | Footer 안내 문구 ("설정에서 언제든 변경할 수 있어요") | line 262~271, Inter 12 muted, ChoiceList 아래 자체 child | 누락 | **누락 (critical)** — 구현 어디에도 노출 없음. i18n 키도 미정의 |
| a-6 | ChoiceList marginTop:8 | line 246 verbatim | 누락 (`OnboardingStep`이 ScrollView로 children wrap, 위 spacing 다름) | **누락** |
| a-7 | unselected opacity 0.85 | line 424, 449 verbatim (active ? 1 : 0.85) | `OptionCard` 미적용 — selected 무관 opacity 1 | **누락** |
| a-8 | radio role + accessibilityHint(sub) | (HTML `<button>`로 키스크린은 별도 role 없음. RN 사양 §7 요구) | `OptionCard` line 33: `radio` + `state.selected`는 있으나 `accessibilityHint` 없음 (sub를 hint로 분리 권장 — 사양 §7) | **누락** |
| a-9 | StepRoot flex-column gap 16 + PageRoot padding 32/24/40 + gap 24 | line 232 (gap:16) + line 47~57 (PageRoot) | `OnboardingStep`은 `px-6 pt-6` + ScrollView `pt:24 pb:24` — wrapper 자체가 다름 (insets만 적용) | **불일치 (wrapper 교체 필요)** |
| a-10 | Inactive border color = `border.default` dual | line 422 `var(--color-border-default)` | `OptionCard` `border-text-disabled` (잘못된 토큰 — disabled는 더 옅은 회색) line 37 | **불일치** |
| a-11 | sub TextStack column gap 4 | line 428 verbatim | `OptionCard` line 46 `mt-1`(=4) — 동등 | OK (구조는 다르나 결과 동일) |

**판정:** **FAIL** — 4건 누락(a-2/a-3/a-5/a-7) + 3건 혼입/불일치(a-1/a-4/a-10) + 2건 wrapper 갭(a-6/a-9) + 1건 a11y(a-8).

### (b) Spacing 비율 — **FAIL**

| 항목 | 키스크린 | 현재 RN | 차이 |
|---|---|---|---|
| PageRoot paddingTop | SafeArea.top + 32 (line 49~50) | `insets.top` only (`onboarding-step.tsx:27`) | **-32pt** |
| PageRoot paddingBottom | SafeArea.bottom + 40 | `Math.max(insets.bottom, 16) + 12` (`pb:12`) — 28pt 추정 | **-12~-16pt** |
| PageRoot paddingHorizontal | 24 (line 51) | `px-6` (=24) ✓ + ScrollView contentContainer `px:24` ✓ | OK |
| PageRoot gap (Step ↔ Cta) | 24 (line 51) | header block `pt-6` + ScrollView + footer `pt:12` — gap 의미 없음(ScrollView로 분리) | **구조 불일치** |
| StepRoot gap (Title/Sub/Choice/Footer) | 16 (line 232) | header 안 `mt-3`(=12, Title), `mt-2`(=8, Sub), children gap-3(=12 ChoiceList) — 모두 다름 | **부분 불일치** |
| ChoiceList gap | 12 (line 246) | `gap-3` (=12) ✓ | OK |
| ChoiceList marginTop | 8 (line 246) | 없음 (ScrollView contentContainer pt:24가 대신 — 의미 다름) | **누락** |
| ExperienceCard padding | 18 사방 (line 419) | `px-4 py-4` (=16/16) | **-2pt 사방** (시각 차이 미세하나 keyscreen verbatim 위반) |
| ExperienceCard gap (icon ↔ TextStack) | 14 (line 418) | n/a (icon 자체 없음) | **누락 (icon 추가 후 14)** |
| TextStack gap (title ↔ sub) | 4 (line 428) | `mt-1` (=4) | OK |
| CtaWrapper marginTop | `auto` (line 272) | View 별도 block `pt:12` — `marginTop:auto` 의미 손실 (ScrollView로 인해 mt-auto 동작 안 함) | **불일치** |

**판정:** **FAIL** — 비율 자체보다 구조(ScrollView 도입)로 keyscreen의 "정적 stack + marginTop:auto" 패턴이 깨졌고, padding 절대값(`32+SafeArea` / `+40`)이 -32/-16 축소.

### (c) Gradient 방향·깊이 — **PASS**

키스크린 `StepExperience` + `ExperienceCard` 모두 **gradient 미사용** (line 232~278 + line 396~452 verbatim 확인). 단색 surface bg + border 1/2px + opacity만 사용.

현재 RN도 gradient 없음. **누락·혼입 0**.

OnboardingStepLayout이 적용되어도 PageRoot bg는 단색 `bg.deepest` dual (사양 §1 + 4-7/8 확인).

**판정:** **PASS** — gradient 항목 자체가 사양에 0건.

### (d) Corner radius — **FAIL**

| 요소 | 키스크린 | 현재 RN | 상태 |
|---|---|---|---|
| ExperienceCard radius | 16 (`rounded-2xl`) — line 420 verbatim | `OptionCard` `rounded-xl` (=12) — line 36 | **-4pt (12 vs 16)** |
| PageRoot / StepRoot radius | 무 (line 47~57: `<main>` flex container) | 무 | OK |
| Toast / PrimaryButton | 사양 §2-12 PrimaryButton 기본 — 무 변경 | PrimaryButton 기본 (사양 미명시) | OK |

**판정:** **FAIL** — ExperienceCard radius 12 → 16 변경 필요. NW v4 토큰 `rounded-2xl`은 이미 지원.

### (e) Typography 위계 — **FAIL**

| 요소 | 키스크린 (verbatim) | 현재 RN | 차이 |
|---|---|---|---|
| Title (StepExperience h2) | Playfair **26** / lineHeight 31.2 (= 26 × 1.2) / margin 0 (line 234~239) | `text-page-title` = Playfair **24** / lh 28.8 (`onboarding-step.tsx:32`) + `mt-3` | **-2pt size, lh -2.4** — `pageTitle` 토큰은 page-level용. 사양은 `text-[26px] leading-[31px]` inline 권장 (§3-2) |
| Subtitle (StepExperience p) | Inter **14** / lh ratio default ≈ 20 / muted / margin 0 (line 243~245) | `text-card-body` = Inter **13** / lh 19.5 / `text-text-secondary` (`onboarding-step.tsx:36`) | **-1pt size + 잘못된 색 토큰 (secondary ≠ muted)** — 사양 §2-3은 `text-onboarding-step-subtitle` (Inter 14/20) + `text-muted` 요구. 토큰은 이미 design-tokens.ts line 490에 등록됨 |
| Card title | Inter **16 / weight 600** / cream (line 429~437) | `font-inter-semibold text-card-title` (`option-card.tsx:42`). `cardTitle` = **Playfair 16 / 20.8** (design-tokens.ts:363) — **font family 불일치** (Playfair → Inter) | **family 불일치 (Playfair → Inter 필요)** — 사양 §2-9는 `text-source-card-title` (Inter 600 16/19.2 — design-tokens.ts:444 등록됨) 또는 arbitrary 권장 |
| Card sub | Inter **13** / lh 1.4 (= 18.2) / muted (line 439~447) | `font-inter text-card-meta` = Inter **12** / lh 14.4 (`option-card.tsx:46`) | **-1pt size, lh -3.8** — 사양 §2-10은 `text-card-body` (Inter 13/19.5) 재사용 (1.3pt 차이 수용 — §6 deviation 10) |
| Footer | Inter 12 / lh default / muted (line 262~271) | 누락 | **0건** |
| CTA button | PrimaryButton lg primary block (line 273~275) | PrimaryButton lg + disabled `!picked` ✓ | OK |

**위계 그래프 (verbatim):**
- 26 (Title Playfair) → 16 (Card title Inter 600) → 14 (Subtitle Inter) → 13 (Sub Inter) → 12 (Footer Inter)

**현재 RN 위계:**
- 24 (Playfair) → 16 (Playfair — title family 잘못) → 13 (Inter — subtitle 잘못 작아짐) → 12 (Inter — sub 잘못 작아짐)

5단계 위계 → 4단계로 압축 (Footer 0건). 시각적으로 본문 밀도 + 카드 위계 깨짐.

**판정:** **FAIL** — 5개 항목 중 5건 불일치.

### (f) Color 사용 — **PASS (with caveat)**

**하드코딩 hex grep:**
```
grep "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}" app/onboarding/3-experience.tsx src/components/shared/option-card.tsx
→ 0건 (no output)
```

토큰 사용 상태:
- `bg-bg-deepest` dual ✓ (`onboarding-step.tsx:27`)
- `bg-surface` dual ✓ (`option-card.tsx:36`)
- `text-text-primary dark:text-text-primary` ✓
- `text-text-muted dark:text-text-muted` ✓ (단, subtitle은 `text-text-secondary` 잘못 — §(e) 참조 / 색 자체는 토큰. 분류 fail은 typography)
- `border-gold` ✓ (selected) — NW tailwind에 등록된 `brand.gold` 매핑
- `border-text-disabled` ✗ — **잘못된 토큰 선택** (사양 §2-5: `border.default` dual + useColorScheme 분기. `text-disabled`는 카드 border 용도 아님 — `option-card.tsx:37`)
- Check icon `brand.gold` ✓ (`option-card.tsx:51`)

**Caveat:** 하드코딩 hex 0건은 색 hardening 통과, 그러나 `border-text-disabled` 토큰 의미 오용 — `border.default`가 옳음 (`#5A3D6A` dark / `#E0D2BC` light). 시각 차이로 분류 시 (e)에 가깝지만 토큰 사용 정합성은 (f). 토큰 자체는 design-tokens.ts에 모두 등록되어 있음.

**판정:** **PASS** — 하드코딩 hex 0건, 모든 색 토큰 출처. 단 `border-text-disabled` 오용 1건은 §(a) a-10에 이미 반영됨 — 색 토큰 선택 자체는 디자인 시스템 안. 시각 표현은 §(e)/(a)에 흡수.

---

## 2. 다크/라이트 양쪽 모드

| 모드 | 캡처 가능? | 상태 |
|---|---|---|
| dark | 시뮬레이터 미실행 (1차 정적 검증) | JSX 기준 토큰 분기 자동 — `bg-surface dark:bg-surface` 등 `dark:` 접두 모두 적용. 단 §(e) typography 갭 양쪽 모드 공통 |
| light | 시뮬레이터 미실행 | 동일. 사양 §4-8 라이트 대비 검증표 통과 — text-muted on bg-deepest = 4.7:1 (AA) |

**Q3 (사양 §10) 라이트 모드 Icon gold #C9A84C on white = 2.0:1 AA 미달:** icon 미구현 상태이므로 본 cycle에서 추가 후 재검증. icon 추가 시 design-tokens.ts `light.border.active` `#B89438` 또는 `goldDeep` `#A07F2E`로 swap 검토 — design-reviewer 2차에서 처리.

**판정:** dual mode 자체는 토큰으로 자동 처리. 모드별 추가 갭 0건 (1차 검증 한계 — 시뮬레이터 캡처 부재로 §10 Q3는 2차 게이트로).

---

## 3. 스크린샷 비교 (멀티모달)

`_workspace/keyscreen-shots/onboarding.png`:
- 캡처 내용: welcome step (winemine 워드마크 + 와인잔 글로우 + 시작하기 CTA)
- **experience step은 별도 캡처 없음** — 사양 §0 line 20도 동일 인지

대안: 키스크린 JSX line 220~452 line-by-line 비교 + 인접 standard `language-choice-card.tsx`(이미 PASS 통과 짝 패턴) reference로 시각 추정.

**시각 추정 결과 (글로벌):**
- 카드 본문 위계 1-tier로 압축 (sub만, 좌측 icon 없음) → keyscreen의 "2-tier + Lucide icon + paddingTop:2" 깊이감 손실
- Footer 안내 문구 누락 → choice list 아래 빈 공간 → mt-auto의 CTA가 위로 떠올라 균형 깨짐
- Progress eyebrow ("3 / 4") 강제 표시 → keyscreen의 "정적 무 chrome step UI"와 톤 충돌

**판정:** **시각 갭 큼** — Day 5 9 화면 통과 기준이 아니라, 디자인 hardening 게이트로 재검증되는 retroactive 화면. 키스크린의 의도(좌측 icon으로 카드 시각 무게 + 2-tier 위계로 정보 밀도)가 lost.

---

## 4. 결정

**결과:** **FAIL** (6항목 중 4 FAIL — a/b/d/e, 1 PASS — c, 1 PASS with caveat — f)

**FAIL 항목 수: 4 / 6**

**라우팅:**

- **rn-screen-builder (P0 — 본 cycle 즉시):** 사양 §11 변경 요청 1~4 전체 수행
  - 1. `app/onboarding/3-experience.tsx` 보강 — wrapper 교체 (`OnboardingStep` → `OnboardingStepLayout`), `OptionCard` → 신규 `ExperienceChoiceCard`, Footer 추가, progress eyebrow 제거
  - 2. **신규** `src/components/onboarding/experience-choice-card.tsx` — ExperienceCard verbatim (Lucide GlassWater/Award size 24 1.5 gold, paddingTop 2, padding 18 사방, rounded-2xl, items-start, gap 3.5, opacity 0.85 unselected, border 1→2px gold selected)
  - 3. i18n ko/en `onboarding.experience.*` 키 교체:
    - 제거: `beginnerDescription`, `expertDescription` (4 키 → ko/en json line 80~81)
    - 신규: `beginnerLabel`, `beginnerSub`, `expertLabel`, `expertSub`, `footer` (5×2 = 10 키, keyscreen `messages/{ko,en}.json` line 41~45 verbatim)
    - 교체: `subtitle` ko/en (keyscreen line 40 verbatim)
  - 4. (선택) Title 26 inline arbitrary `text-[26px] leading-[31px]` 또는 사양 §3-2의 토큰 보류 결정 — rn-screen-builder 재량
- **design-spec-author:** 갭 0건 (사양 자체는 v1으로 완전 — line-by-line 검증 완료)
- **infra-architect:** 토큰 0건 (모든 토큰 design-tokens.ts·tailwind.config.ts에 등록됨 — `onboarding-step-subtitle`, `source-card-title`, `card-body`, `card-meta`, `brand.gold`, `bg-surface`, `border.default` dual)
- **리더 alert:** Q1 (5-step vs 4-step) — step 4 mode cycle에서 결정. 본 cycle 영향 없음 (router.push 대상은 사양 §9 #19에서 `/onboarding/4-mode` 유지로 합의됨)

**재검증 시점:**
rn-screen-builder가 변경 요청 1~3 완료 후 본 화면 + 신규 카드 + i18n diff PR을 design-reviewer에 SendMessage → 동일 체크리스트 + 시뮬레이터 dark/light 양쪽 캡처 비교 (2차 게이트). PASS 시 qa-inspector로.

---

## 5. 추가 메모

- **하드코딩 hex 0건 (§(f) PASS):** 색 토큰 거버넌스는 통과. 토큰 의미 오용(`border-text-disabled`)은 §(a)/§(e)로 분류.
- **i18n 4건 deprecate 안전성:** `beginnerDescription`/`expertDescription` 사용처는 `app/onboarding/3-experience.tsx` 단일 (grep 확인). 다른 화면 미참조 — 안전 제거 가능. settings `experiencePage.{beginnerDesc, expertDesc}`는 별개 키, 영향 0.
- **컴포넌트 분리 권장 (사양 §10 Q5 + §9-1):** language step과 짝 패턴 — `src/components/onboarding/experience-choice-card.tsx` 신규. inline보다 컴포넌트 분리가 일관성·읽기 쉬움.
- **`OptionCard` 재사용 여부:** 현재 `OptionCard`는 mode step(4-mode)에서도 사용될 가능성 있음. 본 cycle은 experience만 분리하고 mode step은 별도 사양 cycle에서 결정.
- **PrimaryButton `Haptics.impactAsync`:** 사양 §5는 CTA에서 light impact 명시 — PrimaryButton 내장 여부 확인 필요. 내장 안 되어 있으면 신규 카드에 `Haptics.selectionAsync` + CTA에 별도 impact 호출. (현재 OptionCard는 line 25~28에서 selectionAsync — 카드 분리 후 보존).
