# 디자인 리뷰 — /onboarding/* CTA 일관성 (cross-cutting PATCH 1차 검증)

> **버전:** v1 (1차 디자인 게이트)
> **검증 일시:** 2026-05-21 12:50:44
> **검증 대상:** 4 step (welcome/language/experience/mode)의 primary CTA만
> **검증자:** design-reviewer
> **사양:** _workspace/design-specs/onboarding-cta.md (v1 PATCH)
> **scope-out (이번 cycle 미검증):** BottomNav (F1 fix), WineFeed (F2-a fix), 따라잉 노트 row (F2-b fix), AppHeader, 4 step 화면 자체 layout 변경

---

## 0. 검증 입력

| 자료 | 경로 / 출처 |
|---|---|
| 사양 | `_workspace/design-specs/onboarding-cta.md` (401 lines) |
| 원본 PrimaryButton | `../winemine-keyscreen/src/components/shared/primary-button.tsx` line 1–107 (사양 §1-2 verbatim 인용) |
| 원본 4 step 사용처 | `../winemine-keyscreen/src/app/onboarding/page.tsx` line 163/212/273/323 (사양 §1-1 verbatim 인용) |
| 현재 RN PrimaryButton | `src/components/shared/primary-button.tsx` line 1–78 |
| 현재 RN — step 1 | `app/onboarding/1-welcome.tsx` line 80–84 (`<PrimaryButton size="lg" />`) |
| 현재 RN — step 2 | `app/onboarding/2-language.tsx` line 87–93 (`<PrimaryButton size="lg" disabled={!picked} loading={saving} />`) |
| 현재 RN — step 3 | `app/onboarding/3-experience.tsx` line 97–103 (동일) |
| 현재 RN — step 4 | `app/onboarding/4-mode.tsx` line 104–110 (동일 — label만 `onboarding.mode.finish`) |
| 현재 RN — CtaWrapper (2/3/4 공통) | `src/components/onboarding/onboarding-step-layout.tsx` line 33–57 |
| 현재 RN — CtaWrapper (1 inline) | `app/onboarding/1-welcome.tsx` line 75–85 |
| 토큰 — design-tokens.ts | `src/lib/design-tokens.ts` `componentSize.primaryButton` (line 706), `brand.{wineRed,cream}` (line 14, 17), `typography.primaryButtonLg` (line 380) |
| 토큰 — tailwind.config.ts | `tailwind.config.ts` `wine-red` (line 23), `cream` (line 26), `text-muted` dual (line 40), `text-disabled` dual (line 41) |
| 사용자 reference 스크린샷 | image #5 (사양 §0 line 20 인용 — 본 검증자 직접 참조 X, 사양 §1-3 분석 기반으로만 verbatim 정합 평가) |

**스크린샷 검증 한계:** 사용자 image #2/#5는 사양 §1-2/§1-3에 기록되어 있으며, 본 검증자가 직접 시뮬레이터에서 캡처한 RN dark/light 스크린샷은 없음. 따라서 본 1차 게이트는 **JSX/CSS 코드 line-by-line 정합 + 사양 verbatim 평가**로 한정. (P2 세션의 실측 캡처 도착 시 2차 게이트에서 보강.)

---

## 1. 6항목 체크리스트 + safe-area

### (a) 요소 누락 — **FAIL**

#### 발견 a-1: `disabled` 분기 누락 (현재 RN 미구현)
- **사양 §2-2 line 112, §4-2:** disabled true 시 VARIANT_BG/TEXT 분기로 `bg-text-disabled` + `text-text-muted` 사용 (opacity-50 제거).
- **현재 RN `primary-button.tsx:28`:** `VARIANT_BG.primary = 'bg-wine-red active:bg-wine-red-hover'` — disabled 분기 없음.
- **현재 RN `primary-button.tsx:64`:** `${disabled ? 'opacity-50' : ''}` — 색 교체 대신 opacity만 적용.
- **영향:** 4 step 중 2/3/4 step의 picked 미선택 disabled 상태가 키스크린 verbatim (보라회색 bg + warm gold text)이 아님. 사용자 image #2 "placeholder 같음" 호소의 직접 원인.
- **수정 요청 (rn-screen-builder):**
  ```tsx
  // src/components/shared/primary-button.tsx:27-40
  const VARIANT_BG_DISABLED: Record<Variant, string> = {
    primary:   'bg-text-disabled',
    secondary: 'bg-text-disabled',
    ghost:     'bg-transparent',
    cellar:    'bg-text-disabled border border-transparent',
  };
  const VARIANT_TEXT_DISABLED: Record<Variant, string> = {
    primary:   'text-text-muted',
    secondary: 'text-text-muted',
    ghost:     'text-text-muted',
    cellar:    'text-text-muted',
  };
  // line 64 className 분기:
  ${disabled ? `${VARIANT_BG_DISABLED[variant]}` : VARIANT_BG[variant]}
  // line 71 className 분기:
  ${disabled ? VARIANT_TEXT_DISABLED[variant] : VARIANT_TEXT[variant]}
  // line 64에서 `opacity-50` 제거
  ```

#### 발견 a-2: `letter-spacing -0.01em` 누락 (사양 §2-2 line 117 권장 옵션)
- **사양 §1-2 line 57:** 키스크린 verbatim `letter-spacing: -0.01em`. §2-2/§2-3에서도 lg 한정 `tracking-[-0.01em]` 추가 명시.
- **현재 RN `primary-button.tsx:71`:** `font-inter-semibold ${TEXT_SIZE[size]}` — letterSpacing inline/className 없음.
- **영향:** Inter 600 15px text가 키스크린 대비 약 0.15px 더 넓음. 단일 줄 짧은 텍스트(2자 "다음")라 시각 차이는 미미하나 verbatim 정합 차원에서 누락.
- **수정 요청:** `<Text>` className에 `tracking-[-0.01em]` 추가 (단발 arbitrary, 토큰화 불필요 — 사양 §3-1 P0 인정).

#### 발견 a-3: `numberOfLines={1}` 누락 (사양 §2-3 line 144 `white-space: nowrap` 대응)
- **사양 §2-3:** 키스크린 `white-space: nowrap` → RN `numberOfLines={1}`.
- **현재 RN `primary-button.tsx:71-73`:** `<Text className="...">{label}</Text>` — numberOfLines prop 없음.
- **영향:** 현재 i18n 키 (`onboarding.welcome.cta` = "시작하기"/"Get started", `common.next` = "다음"/"Next", `onboarding.mode.finish` = "시작하기"/"Get started")는 모두 짧아 wrap 발생 risk 낮음. 그러나 향후 긴 텍스트(독일어 등)에서 2-line wrap 가능. verbatim 정합 차원에서 누락.
- **수정 요청:** `<Text numberOfLines={1} className="...">{label}</Text>`.

#### 발견 a-4: `border` 누락 (사양 §1-2 line 65 + §2-3 line 127)
- **사양 §1-2:** primary `border: 1px solid var(--color-wine-red)`, disabled `border: 1px solid transparent`, secondary `border: 1px solid var(--color-border-default)`.
- **현재 RN `primary-button.tsx:28`:** `'bg-wine-red active:bg-wine-red-hover'` — border 없음 (primary).
- **현재 RN `primary-button.tsx:29`:** `'bg-surface border border-gold'` — secondary는 border 있으나 `border-gold`로 정의 (사양은 `border-default` 토큰).
- **영향:** primary는 bg와 동일 색 1px border이므로 시각 차이 0 — **무영향**. secondary는 RN 현재 `gold`와 사양 `border-default`가 dark 모드에서 다름 (gold #B89438 vs dark border-default #5A3D6A). 단 secondary는 본 PATCH scope-out (4 step 모두 primary만 사용).
- **수정 요청 (primary):** `'bg-wine-red active:bg-wine-red-hover border border-wine-red'` (시각 무영향이나 verbatim).
- **수정 요청 (disabled):** disabled VARIANT_BG에 `border border-transparent` 명시.

#### 발견 a-5: PrimaryButton 외부 wrapper `flex-row items-center justify-center` 외 `gap` 누락 (사양 §2-3 line 141)
- **사양 §2-3:** `display: flex; align-items: center; justify-content: center; gap: 8;` — gap 8.
- **현재 RN `primary-button.tsx:70`:** 내부 `<View className="flex-row items-center">` — gap 없음. leadingIcon/trailingIcon 미사용이라 시각 영향 0.
- **영향:** 본 PATCH 4 step CTA 모두 아이콘 없음 (mode step도 사양 §1-1 line 47에서 키스크린 done step의 Camera/ArrowRight 아이콘은 RN에서 미사용 결정). **현재 무영향**.
- **수정 권장 (낮은 우선순위, 옵션):** 향후 capture screen의 ConfirmCellar 등에서 leadingIcon 추가 시 `gap-2` 필요. 본 cycle 미수정 OK.

**소결 (a):** **FAIL** — 핵심 disabled 분기 (a-1) + verbatim 정합 누락 3건 (a-2, a-3, a-4). a-5는 무영향.

---

### (b) Spacing 비율 — **FAIL**

#### 발견 b-1: `lg` height 4px 초과 (사양 §2-2 line 109)
- **사양:** `h-[52px]` → **`h-[48px]`** (키스크린 verbatim, components.md §2-1 + JSX line 59 양쪽 48 일치).
- **현재 RN `primary-button.tsx:20`:** `lg: 'h-[52px]'` — 4px 초과.
- **사용자 image #2 "텍스트가 너무 아래" 호소의 보조 원인 (주 원인은 a-1 opacity-50).**
- **수정 요청:** `lg: 'h-[48px]'` + `design-tokens.ts:706` `componentSize.primaryButton.lg: 52` → `48` 동기화.

#### 발견 b-2: `lg` 좌우 padding 불일치 (사양 §2-2 line 110)
- **사양:** size별 분기 — sm `px-3`, md `px-4`, lg **`px-5`** (=20, 키스크린 `padding: 14px 20px` verbatim).
- **현재 RN `primary-button.tsx:64`:** `px-4` (=16) 모든 size 공통.
- **영향:** lg에서 좌우 padding 4px 부족 (16 vs 20). 짧은 텍스트 ("다음")는 시각 차이 미미하나 긴 텍스트(아이콘 + 텍스트 조합)에서 가시. verbatim 정합 차원 FAIL.
- **수정 요청:** `px-4`를 size별 분기 — 새 `PX: Record<Size, string> = { sm: 'px-3', md: 'px-4', lg: 'px-5' }` 추가.

#### 발견 b-3: safe-area 패딩 (사양 §5-3) — **PASS**
- **사양:** `paddingTop: insets.top + 32`, `paddingBottom: max(insets.bottom, 0) + 40`, `paddingHorizontal: 24`, `gap: 24` (PageRoot).
- **현재 RN step 1 (`1-welcome.tsx:43-47`):** `paddingTop: insets.top + 32`, `paddingBottom: Math.max(insets.bottom, 0) + 40`, `gap: 24` (px-6는 24 — NW v4 `px-6` = 1.5rem = 24px). **일치.**
- **현재 RN step 2/3/4 (`onboarding-step-layout.tsx:40-44`):** 동일하게 일치.
- **CtaWrapper `marginTop: 'auto'`:** step 1 line 78, OnboardingStepLayout line 52. 양쪽 키스크린 verbatim (사양 §5-1/§5-2).
- **결론:** safe-area 처리 자체는 사양 §5-3 verbatim. 이미 충분. **PASS.**

#### 발견 b-4: PageRoot horizontal padding 통일 — **PASS, 단 주의**
- step 1: `className="...px-6"` = 24px (NW v4 spacing scale `px-6` = 1.5rem = 24px).
- step 2/3/4 (OnboardingStepLayout): inline `paddingHorizontal: 24`.
- 두 방식의 시각 결과 동일. **PASS.** (style 일관화는 추후 cycle 권장 — 본 PATCH scope-out.)

**소결 (b):** **FAIL** — b-1 height 4px 초과 (핵심), b-2 padding lg 4px 부족. b-3/b-4 PASS.

---

### (c) Gradient 방향·깊이 — **PASS (N/A)**

- 키스크린 PrimaryButton `primary-button.tsx` line 80–99 verbatim 분석 (사양 §1-2): **그라데이션 없음.** 단색 `var(--color-wine-red)` bg + 1px border. boxShadow 없음.
- 현재 RN PrimaryButton: `bg-wine-red` 단색 일치. LinearGradient 없음.
- **결론:** 본 컴포넌트에 그라데이션 자체가 없음. **N/A PASS.**

---

### (d) Corner radius — **FAIL**

#### 발견 d-1: `rounded-lg` (8px) vs 사양 `rounded-xl` (12px) (사양 §2-2 line 111)
- **사양:** 모든 size·variant 공통 12px (`rounded-xl`). 키스크린 verbatim `border-radius: 12` line 91.
- **현재 RN `primary-button.tsx:64`:** `rounded-lg` (= 8px).
- **영향:** 4 step CTA 모두 모서리 4px 차이. 사용자 image #5 reference (radius 14 시각 추정)와도 4~6px 차이. 시각 갭 확실.
- **수정 요청:** className `rounded-lg` → `rounded-xl`.
- **사양 §10 Q1 미해결:** 사용자 image #5는 radius 14 추정 (시각). 사양은 키스크린 verbatim 12 채택. 본 검증자는 사양 결정 (12) 따름. 사용자 확정 시 PATCH v2에서 14로 변경 가능.

**소결 (d):** **FAIL** — radius 8 → 12 변경 필요.

---

### (e) Typography 위계 — **FAIL**

#### 발견 e-1: `letter-spacing -0.01em` 누락 (a-2와 동일 항목, typography 차원 재명시)
- **사양 §1-2 line 57, §2-3 line 137:** Inter 600 15px / letterSpacing -0.01em (= -0.15px @ 15px).
- **현재 RN `primary-button.tsx:71`:** `font-inter-semibold text-[15px]` — letterSpacing 없음.
- **영향:** Inter 600 fontFamily는 일치 (font-inter-semibold). fontSize 15 일치 (TEXT_SIZE.lg). **fontWeight, fontSize, fontFamily 모두 PASS. letterSpacing만 누락 (FAIL).**
- **수정 요청:** `<Text>` className에 `tracking-[-0.01em]` 추가.

#### 발견 e-2: fontFamily / fontWeight / fontSize — **PASS**
- 사양 §1-2: Inter 600, 15px (lg).
- 현재 RN: `font-inter-semibold` (Inter_600SemiBold, `design-tokens.ts:380` 정의), `text-[15px]`. **일치.**

#### 발견 e-3: 위계 일관성 (4 step CTA 모두 `size="lg"`) — **PASS**
- step 1: `size="lg"` (line 82). step 2: `size="lg"` (line 89). step 3: `size="lg"` (line 99). step 4: `size="lg"` (line 106). **일관.**
- 키스크린 verbatim (사양 §1-1 표 — 4 step 모두 size lg).

**소결 (e):** **FAIL** — letterSpacing 단일 누락. weight/size/family는 PASS.

---

### (f) Color 사용 — **FAIL**

#### 발견 f-1: disabled bg / text 색 누락 (a-1 동일 항목, color 차원 재명시)
- **사양 §4-2:** disabled `bg-text-disabled` (dark `#7E6E8E` / light `#C0B0A0`) + `text-text-muted` (dark `#CABDA8` / light `#8B7766`).
- **현재 RN:** opacity-50으로 enabled wineRed/cream 흐려짐 — 보라회색·warm gold 색이 아님.
- **tailwind.config.ts:40-41 확인:** `text-muted` / `text-disabled` 두 토큰 모두 dark/light dual로 이미 정의됨. **신규 토큰 추가 불필요.**
- **수정 요청 (a-1과 동일):** disabled 분기에 `bg-text-disabled` + `text-text-muted` 적용.

#### 발견 f-2: enabled bg / text 색 — **PASS**
- 사양 §4-1 / §4-5: enabled bg `bg-wine-red`, text `text-cream`.
- 현재 RN `primary-button.tsx:28,36`: `'bg-wine-red active:bg-wine-red-hover'` + `'text-cream'`. **일치.**
- tailwind.config.ts:23-26: `'wine-red': '#8B1A2A'`, `cream: '#F5F0E8'` 일치 (단 dual 정의 X — light 모드에서도 동일 색 출력. 사양 §4-5에서는 light bg가 `#B89438` gold로 dual 치환 명시. 현재 RN dual 미적용 — 별도 FAIL 가능성).
- **추가 발견 f-2-sub: light 모드 dual 치환 누락.**
  - 사양 §4-5 line 213: light 모드 enabled bg는 `#B89438` (gold) + text는 `#2A1A14` (dark brown).
  - 현재 RN tailwind.config.ts:23,26: `wine-red`/`cream` 단일 hex — light 모드 분기 없음.
  - **영향:** light 모드에서 CTA가 dark 모드와 동일 wineRed/cream으로 표시. 사양 §4-5 verbatim 미준수.
  - **수정 요청:** tailwind.config.ts `'wine-red'`/`cream`을 dual 정의로 확장 — 그러나 이는 다른 화면(home/capture/notes 등) 사용처 전반에 영향. **본 PATCH scope 초과 — 리더 결정 필요 (사양 §10 Q3 미해결과 동일).**

#### 발견 f-3: 하드코딩 hex grep — **PASS**
- `src/components/shared/primary-button.tsx` 전체 78 line에 hex 색 (`#XXXXXX`) 0건. 모두 NW className.
- **결론:** 하드코딩 hex FAIL 항목 없음. **PASS.**

#### 발견 f-4: border 색 (a-4와 일부 중복) — **FAIL (primary, 시각 무영향)**
- primary는 border bg와 동일 색 → 시각 영향 0이나 verbatim 차원 누락.

**소결 (f):** **FAIL** — f-1 disabled 색 (핵심), f-2-sub light 모드 dual 치환 (사양 §10 Q3 미해결, scope 초과 가능성 — 리더 결정 보류).

---

### (g) safe-area 처리 — **PASS** (b-3 항목과 일부 중복, 별도 강조)

- **사양 §5-3 line 268-281:** PageRoot `paddingBottom: Math.max(insets.bottom, 0) + 40` + 버튼 자체 48 = 화면 최하단으로부터 88~122pt 거리 (iPhone home indicator 8pt 위로 충분).
- **현재 RN step 1 (`1-welcome.tsx:45`):** `paddingBottom: Math.max(insets.bottom, 0) + 40` — 일치.
- **현재 RN step 2/3/4 (`onboarding-step-layout.tsx:41`):** `paddingBottom: Math.max(insets.bottom, 0) + 40` — 일치.
- **결론:** safe-area 처리 키스크린 verbatim. **PASS.** 사용자 image #2 "텍스트가 너무 아래" 호소는 safe-area 자체가 아니라 height 52 + opacity-50으로 인한 PrimaryButton 내부 시각 효과 (사양 §1-2 line 81 분석 일치) — b-1 + a-1 수정 시 자동 해소.

---

## 2. 4 step CTA 시각 상태 점검 (사양 §1-1 + §4-1/4-2 verbatim)

| Step | 파일:line | CTA 호출 | 예상 시각 상태 (사양 verbatim) | 현재 RN 실측 (코드 분석) | 일치? |
|---|---|---|---|---|---|
| 1 welcome | `app/onboarding/1-welcome.tsx:80-84` | `<PrimaryButton label={t('onboarding.welcome.cta')} size="lg" onPress={...} />` | **항상 enabled** (disabled prop 없음) — wineRed bg + cream text + 48 height + 12 radius + 20 px padding + -0.01em tracking | enabled — wineRed bg + cream text + **52 height (b-1 FAIL)** + **8 radius (d-1 FAIL)** + **16 px padding (b-2 FAIL)** + **letterSpacing 0 (e-1 FAIL)** | **FAIL** (4건 시각 갭) |
| 2 language | `app/onboarding/2-language.tsx:87-93` | `<PrimaryButton label={t('common.next')} size="lg" disabled={!picked} loading={saving} ... />` | picked=null → **disabled (보라회색 bg + warm gold text)**. picked=ko/en → **enabled wineRed+cream**. 동일 height/radius/padding/tracking | picked=null → **wineRed @ opacity 0.5 (a-1+f-1 FAIL — placeholder처럼 보임)**. picked → wineRed @ opacity 1.0. + b-1/d-1/b-2/e-1 갭 | **FAIL** (5건 — disabled 색 + 4 verbatim 갭) |
| 3 experience | `app/onboarding/3-experience.tsx:97-103` | `<PrimaryButton label={t('common.next')} size="lg" disabled={!picked} loading={saving} ... />` | step 2와 동일 (picked=beginner/expert toggle) | step 2와 동일 갭 | **FAIL** (5건) |
| 4 mode | `app/onboarding/4-mode.tsx:104-110` | `<PrimaryButton label={t('onboarding.mode.finish')} size="lg" disabled={!picked} loading={saving} ... />` | step 2/3과 동일 (picked=first-time/heavy toggle) | step 2/3과 동일 갭 | **FAIL** (5건) |

**i18n 키 검증 (사양 §7-1):**
- step 1: `onboarding.welcome.cta` (사양은 keyscreen `onboarding.getStarted`와 키 이름만 다름 — 의미 동일 "시작하기"/"Get started" — 사양 §7-1 결정: 현재 RN 그대로 유지). **PASS.**
- step 2/3: `common.next` (keyscreen 일치). **PASS.**
- step 4: `onboarding.mode.finish` (keyscreen `onboarding.done.scanCta`와 키 다름, 사양 §7-1 결정: 5-step 채택으로 현재 RN 그대로). **PASS.**
- **i18n 키 변경 0건 확인.** 사양 §7-2 verbatim 정합.

**loading 상태 검증 (사양 §4-3):**
- step 2/3/4 모두 `loading={saving}` prop 전달. PrimaryButton 내부 `loading ? <ActivityIndicator /> : ...` 분기 (line 67-69) 적용. accessibilityState `busy: loading` 처리 (line 63). 사양 §4-3 verbatim. **PASS.**
- step 1은 loading prop 없음 (supabase 호출 없음 — 사양 §4-3 verbatim). **PASS.**

---

## 3. §10 Q2 — `primaryButton.lg 52→48` 변경의 capture/notes/settings 회귀 영향 grep

### 3-1. grep 결과 (`size="lg"` PrimaryButton 사용처)

```
src/components/home/first-time-greeting.tsx:68
src/components/capture/recognized-view.tsx:191
src/components/capture/recognized-view.tsx:198
src/components/capture/label-scan-result-modal.tsx:115
src/components/wine/add-to-cellar-sheet.tsx:213
app/(tabs)/capture.tsx:370
```
(+ 본 PATCH scope 4 step: `app/onboarding/{1-welcome,2-language,3-experience,4-mode}.tsx` × 1건씩)

### 3-2. 회귀 영향 항목별 분류

| 사용처 | 화면 컨텍스트 | 4px 감소 시 시각 영향 | 회귀 위험 |
|---|---|---|---|
| `home/first-time-greeting.tsx:68` | 홈 화면 first-time 모드 환영 카드 내부 CTA | 카드 내부 단일 버튼, 주변 spacing 16 gap — 4px 감소 시 카드 하단 여백 4px 증가 (시각 차이 미세) | **LOW** |
| `capture/recognized-view.tsx:191` | 라벨 인식 후 결과 view 1차 CTA ("셀러에 추가" 등) | bottom-sheet 내부, 1차/2차 버튼 2개 stack (line 191+198) — 두 버튼 동시 4px 감소 → 합계 8px 감소. bottom-sheet 높이 영향 | **MEDIUM** — bottom-sheet snap point 재계산 필요 가능성 |
| `capture/recognized-view.tsx:198` | 동일 view 2차 CTA | 동상 | **MEDIUM** (동일 화면) |
| `capture/label-scan-result-modal.tsx:115` | 라벨 스캔 modal CTA | modal 내부 단일 버튼 | **LOW** |
| `wine/add-to-cellar-sheet.tsx:213` | 셀러 추가 bottom-sheet CTA | sheet 내부 단일 버튼 + safe-area | **LOW** (CtaWrapper와 유사 패턴) |
| `app/(tabs)/capture.tsx:370` | 캡처 화면 메인 shutter? CTA | 카메라 화면 하단 fixed CTA — 4px 감소 시 safe-area 처리 여부 따라 영향 | **LOW~MEDIUM** — capture 사양 확인 필요 |

### 3-3. 회귀 권고

- **MEDIUM 위험 2건 (recognized-view 2-stack):** bottom-sheet snap point 또는 stack gap이 height 기준 계산되었다면 8px 누적 감소로 사양 위반 가능. **rn-screen-builder가 PATCH 적용 시 capture recognized-view 시각 회귀 점검 필수.** design-reviewer는 본 PATCH 통과 후 별도 capture 화면 검증 cycle에서 확인.
- **LOW 위험 4건:** 단일 버튼 사용처는 4px 감소가 주변 spacing 자연 흡수. **사양 §3-2 결정 (키스크린 verbatim 정합 우선) 그대로 수용 권고.**
- **추가 보강 권고 (사양 §10 Q2 미해결 해소안):** `componentSize.primaryButton.lg` 변경 직후 design-reviewer가 capture/notes/settings 화면별 PATCH 후 시각 캡처 — 본 1차 게이트 통과 후 별도 cycle.

---

## 4. 결정

### 4-1. 종합 결과: **FAIL**

| 6항목 + safe-area | 결과 | FAIL 항목 수 |
|---|---|---|
| (a) 요소 누락 | **FAIL** | 4 (a-1 disabled 분기, a-2 letterSpacing, a-3 numberOfLines, a-4 border) |
| (b) Spacing 비율 | **FAIL** | 2 (b-1 height 52→48, b-2 lg padding 16→20) |
| (c) Gradient | **PASS (N/A)** | 0 |
| (d) Corner radius | **FAIL** | 1 (d-1 radius 8→12) |
| (e) Typography 위계 | **FAIL** | 1 (e-1 letterSpacing — a-2와 중복) |
| (f) Color 사용 | **FAIL** | 1 핵심 (f-1 disabled 색) + 1 보류 (f-2-sub light mode dual, 리더 결정 필요) |
| (g) safe-area | **PASS** | 0 |

**고유 FAIL 항목 수: 8건** (a-1=f-1 = disabled 분기·색 동일 항목으로 합산. a-2=e-1 = letterSpacing 동일 항목 합산.)

**고유 정리:**
1. **disabled 분기 누락 (a-1/f-1)** — 핵심. 사용자 image #2 호소 직접 원인.
2. **height 52 → 48 (b-1)** — 키스크린 verbatim.
3. **padding lg 16 → 20 (b-2)** — 키스크린 verbatim.
4. **radius 8 → 12 (d-1)** — 키스크린 verbatim.
5. **letterSpacing -0.01em 누락 (a-2/e-1)** — 키스크린 verbatim.
6. **numberOfLines={1} 누락 (a-3)** — wrap 방지.
7. **border 누락 (a-4)** — primary는 시각 무영향이나 verbatim 정합.
8. **light 모드 dual 치환 (f-2-sub)** — 사양 §10 Q3 미해결, scope 초과 — **본 결정에서 분리, 리더 escalate.**

**FAIL 수 (scope-in): 7건** (f-2-sub 제외).

### 4-2. 라우팅

- **rn-screen-builder:** 위 1~7번 7건 모두 `src/components/shared/primary-button.tsx` 단일 파일에서 해결. 사양 §9-1 체크리스트 그대로 적용. `design-tokens.ts:706` `componentSize.primaryButton.lg` 52 → 48 동기화 1건 추가.
- **design-spec-author:** 사양 자체 갭 없음. 현재 사양 (v1)이 위 7건 모두 명시. **사양 보강 요청 0건.**
- **infra-architect:** 신규 토큰 추가 0건 (사양 §3-3: 모두 기존 토큰 재사용). **요청 0건.**
- **리더 escalate:** `f-2-sub` light 모드 dual 치환 — tailwind.config.ts `wine-red`/`cream` 토큰을 dual로 확장 시 home/capture/notes 등 사용처 전반 영향. 사양 §10 Q3 미해결과 동일 항목. **본 PATCH scope 초과 — 별도 cycle (P0) 결정 필요.** 사용자 image #5가 dark 모드 reference로 추정되므로 (사양 §1-3 line 91), 본 cycle은 dark 모드만 검증·정합하고 light 모드 dual은 **별도 cycle로 분리** 권고.
- **qa-inspector:** 본 게이트 통과 후 사양 §9-4 grep 4건 (`opacity-50`, `h-[52px]`, `rounded-lg`, 하드코딩 hex) 검증.

### 4-3. capture/notes/settings 회귀 권고 (사양 §10 Q2 해소)

- rn-screen-builder PATCH 적용 직후 design-reviewer가 별도 cycle에서 다음 6 사용처 시각 캡처 + 회귀 점검:
  1. `home/first-time-greeting.tsx:68` — LOW
  2. `capture/recognized-view.tsx:191,198` (2-stack) — **MEDIUM (bottom-sheet snap 재계산 가능성)**
  3. `capture/label-scan-result-modal.tsx:115` — LOW
  4. `wine/add-to-cellar-sheet.tsx:213` — LOW
  5. `app/(tabs)/capture.tsx:370` — LOW~MEDIUM
- 본 1차 게이트는 onboarding 4 step만 검증 (scope-in 그대로).

### 4-4. 재검증 시점

- rn-screen-builder PATCH 적용 완료 → 동일 6항목 + safe-area 체크리스트 재실행 (`_workspace/design-review_onboarding-cta_{ts}_v2.md`).
- v2 PASS 시 qa-inspector 통과 후 capture/notes/settings 별도 회귀 cycle 진행.

---

## 5. 요약 (1줄)

PrimaryButton 본체 7건 갭 (disabled 분기/색 + height 52→48 + lg padding 16→20 + radius 8→12 + letterSpacing + numberOfLines + border) — 모두 `src/components/shared/primary-button.tsx` + `design-tokens.ts:706` 단일 파일 보강으로 4 step 자동 정합. light 모드 dual은 별도 cycle 분리 권고 (사양 §10 Q3 미해결).
