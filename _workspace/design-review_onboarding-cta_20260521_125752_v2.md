# 디자인 리뷰 — /onboarding/* CTA 일관성 (cross-cutting PATCH 2차 검증)

> **버전:** v2 (2차 디자인 게이트 — rn-screen-builder PATCH 적용 후 재검증)
> **검증 일시:** 2026-05-21 12:57:52
> **검증 대상:** 4 step (welcome/language/experience/mode)의 primary CTA + lg 사용처 6곳 회귀 영향
> **검증자:** design-reviewer
> **사양:** _workspace/design-specs/onboarding-cta.md (v1 PATCH)
> **1차 게이트:** _workspace/design-review_onboarding-cta_20260521_125044.md (7 FAIL)
> **scope-out (별도 cycle):** BottomNav · WineFeed · followers note row · AppHeader · light 모드 wine-red/cream dual 치환

---

## 0. 검증 입력

| 자료 | 경로 / 출처 |
|---|---|
| 사양 | `_workspace/design-specs/onboarding-cta.md` (401 lines) |
| 1차 보고서 | `_workspace/design-review_onboarding-cta_20260521_125044.md` (7 FAIL) |
| 변경된 PrimaryButton (미커밋) | `src/components/shared/primary-button.tsx` (line 1–115, **전면 재작성**) |
| 변경된 토큰 (미커밋) | `src/lib/design-tokens.ts` line 705–714 (`componentSize.primaryButton.lg: 52 → 48`) |
| tailwind dual 토큰 (확인) | `tailwind.config.ts:40-41` (`text-muted` / `text-disabled` dual 정의됨) |
| 4 step 화면 (미변경 확인) | `app/onboarding/{1-welcome,2-language,3-experience,4-mode}.tsx` |
| lg 회귀 영향 사용처 (6곳) | `src/components/home/first-time-greeting.tsx:68` · `src/components/capture/recognized-view.tsx:191,198` · `src/components/capture/label-scan-result-modal.tsx:115` · `src/components/wine/add-to-cellar-sheet.tsx:213` · `app/(tabs)/capture.tsx:370` |
| 사용자 reference 스크린샷 | image #5 (사양 §0 line 20 인용 — 본 검증자 직접 참조 X, 사양 §1-3 verbatim 정합 평가 기반) |

**스크린샷 검증 한계:** 본 v2 게이트도 시뮬레이터 실측 캡처는 부재. JSX/CSS 코드 line-by-line 정합 + 사양 verbatim 평가 기반. P2 세션의 실측 캡처 도착 시 3차 게이트에서 보강 (필요 시).

---

## 1. 1차 7 FAIL 항목 재검증 (RESOLVED / STILL-FAIL / SCOPE-OUT)

### FAIL-1: disabled 분기 누락 (a-1/f-1) — **RESOLVED**

- **사양 §2-2/§4-2:** disabled true 시 `bg-text-disabled` + `text-text-muted`, opacity-50 제거.
- **변경 후 `primary-button.tsx:59-70, 87-88`:**
  - 신규 `VARIANT_BG_DISABLED` (line 59–64): primary/secondary/cellar = `'bg-text-disabled border border-transparent'`, ghost = `'bg-transparent'`.
  - 신규 `VARIANT_TEXT_DISABLED` (line 65–70): 4 variant 모두 `'text-text-muted'`.
  - `bgClass` / `textClass` 분기 (line 87–88): `disabled ? DISABLED : ENABLED`.
  - `opacity-50` className 전체 0건 (line 97 검증 — `${HEIGHT[size]} ${bgClass} flex-row items-center justify-center rounded-xl ${PX[size]}` opacity 표기 없음).
- **tailwind dual 확인:** `tailwind.config.ts:40-41` `text-muted`/`text-disabled` 양쪽 dark/light dual 정의 존재 (DEFAULT `#CABDA8` / light `#8B7766`, DEFAULT `#7E6E8E` / light `#C0B0A0`) — NW v4 dual 자동 적용 OK.
- **결과:** **RESOLVED.** 사용자 image #2 "placeholder처럼 보임" 호소의 직접 원인 해소. picked 미선택 disabled가 보라회색(dark) / sand(light) bg + warm gold(dark) / muted brown(light) text로 명확히 분리.

---

### FAIL-2: lg height 52 → 48 (b-1) — **RESOLVED**

- **사양 §2-2 line 109:** lg `h-[48px]` (keyscreen verbatim — primary-button.tsx line 59 + components.md §2-1).
- **변경 후 `primary-button.tsx:19-23`:**
  ```
  const HEIGHT: Record<Size, string> = {
    sm: 'h-[36px]',
    md: 'h-[44px]',
    lg: 'h-[48px]',   ← 52 → 48
  };
  ```
- **토큰 동기화 `design-tokens.ts:707-708`:**
  ```
  componentSize = {
    primaryButton: { sm: 36, md: 44, lg: 48 },   ← lg 52 → 48
    ...
  };
  ```
- **grep 검증:** `src/components/shared/primary-button.tsx`에 `h-[52px]` 0건 확인 (사양 §9-4 통과).
- **결과:** **RESOLVED.** 4 step CTA height 정확히 48pt + 키스크린 verbatim.

---

### FAIL-3: lg padding 16 → 20 (b-2) — **RESOLVED**

- **사양 §2-2 line 110:** size별 분기 — sm `px-3`, md `px-4`, lg **`px-5`** (=20, keyscreen `padding: 14px 20px` verbatim).
- **변경 후 `primary-button.tsx:25-29`:**
  ```
  const PX: Record<Size, string> = {
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-5',   ← 신규 size별 분기
  };
  ```
- **사용처 (line 97):** `className="... ${PX[size]}"` 적용. 기존 `px-4` 단일 값 제거.
- **결과:** **RESOLVED.** 4 step CTA 좌우 padding 정확히 20pt + sm/md는 기존 16/12 그대로 보존.

---

### FAIL-4: radius 8 → 12 (d-1) — **RESOLVED**

- **사양 §2-2 line 111:** 모든 size·variant 공통 12px (`rounded-xl`). 키스크린 verbatim border-radius: 12 (primary-button.tsx line 91).
- **변경 후 `primary-button.tsx:97`:** `className="... rounded-xl ..."` (기존 `rounded-lg` 제거).
- **grep 검증:** `src/components/shared/primary-button.tsx`에 `rounded-lg` 0건 (사양 §9-4 통과).
- **결과:** **RESOLVED.** 모서리 12pt — 키스크린 verbatim. 사양 §10 Q1 (사용자 image #5 radius 14 추정)은 미해결로 남으나 본 PATCH는 keyscreen verbatim 12 채택 그대로 유효.

---

### FAIL-5: letterSpacing -0.01em 누락 (a-2/e-1) — **RESOLVED**

- **사양 §1-2 line 57 / §2-3 line 137:** Inter 600 15px / letterSpacing -0.01em (= -0.15px @ 15px).
- **변경 후 `primary-button.tsx:106`:** `<Text className="${textClass} ${TEXT_SIZE[size]} font-inter-semibold tracking-[-0.01em]">{label}</Text>`.
- **결과:** **RESOLVED.** lg 한정이 아닌 모든 size에 일괄 적용 — 사양은 lg만 명시 (line 117)했으나 키스크린 verbatim은 모든 size 공통 (line 94). 키스크린 verbatim이 더 정확하므로 모든 size 일괄 적용 OK (사양 §3-1 P0 인정 범위 내). sm/md에서도 -0.13/-0.14px 적용 — 거의 시각 0 영향.

---

### FAIL-6: numberOfLines={1} 누락 (a-3) — **RESOLVED**

- **사양 §2-3 line 144:** 키스크린 `white-space: nowrap` → RN `numberOfLines={1}`.
- **변경 후 `primary-button.tsx:103-109`:**
  ```
  <View className="flex-row items-center">
    <Text
      numberOfLines={1}
      className={`${textClass} ${TEXT_SIZE[size]} font-inter-semibold tracking-[-0.01em]`}
    >
      {label}
    </Text>
  </View>
  ```
- **결과:** **RESOLVED.** wrap 방지. 향후 긴 텍스트 (독일어 등) ellipsis 자동 적용.

---

### FAIL-7: border 누락 (a-4) — **RESOLVED**

- **사양 §1-2 line 65 / §2-3 line 127:** primary `border: 1px solid var(--color-wine-red)`, disabled `border: 1px solid transparent`.
- **변경 후 `primary-button.tsx:40, 60`:**
  - `VARIANT_BG.primary = 'bg-wine-red active:bg-wine-red-hover border border-wine-red'` (line 40 — border 추가됨).
  - `VARIANT_BG_DISABLED.primary = 'bg-text-disabled border border-transparent'` (line 60 — disabled border-transparent 추가됨).
- **결과:** **RESOLVED.** primary는 bg와 동일 색 border이므로 시각 무영향이나 keyscreen verbatim 정합 달성.

---

### 1차 7 FAIL 종합

| # | 항목 | 1차 결과 | 2차 결과 |
|---|---|---|---|
| 1 | disabled 분기·색 (a-1/f-1) | FAIL | **RESOLVED** |
| 2 | lg height 52→48 (b-1) | FAIL | **RESOLVED** |
| 3 | lg padding 16→20 (b-2) | FAIL | **RESOLVED** |
| 4 | radius 8→12 (d-1) | FAIL | **RESOLVED** |
| 5 | letterSpacing -0.01em (a-2/e-1) | FAIL | **RESOLVED** |
| 6 | numberOfLines={1} (a-3) | FAIL | **RESOLVED** |
| 7 | border primary/disabled (a-4) | FAIL | **RESOLVED** |

**7/7 RESOLVED.** 1차 보고서 보류 항목 `f-2-sub` (light 모드 wine-red/cream dual 치환)은 본 cycle SCOPE-OUT (사용자 명시).

---

## 2. componentSize.primaryButton.lg 52 → 48 변경의 회귀 영향 점검 (6 사용처)

### 2-1. 사용처 별 영향 분석

| # | 파일:라인 | 컨텍스트 | 4px 감소 영향 | 회귀 등급 |
|---|---|---|---|---|
| A | `src/components/home/first-time-greeting.tsx:68` | 홈 first-time 모드 GradientCard 내부 단일 CTA, 상단 `marginTop: 8`로 본문과 분리 | 카드 외곽 padding이 흡수. card height 4px 감소 → 페이지 흐름 정상. | **LOW — PASS** |
| B | `src/components/capture/recognized-view.tsx:191` (ConfirmNote variant=primary) | PrimaryActions column, `gap: 10` 2-stack 첫 번째 | 카드 height 4px 감소 | **LOW — PASS** (sheet 컨텍스트 아님 — capture screen 본문 inline) |
| C | `src/components/capture/recognized-view.tsx:198` (ConfirmCellar variant=cellar) | 동일 PrimaryActions, 2-stack 두 번째 (cellar variant — 본 PATCH disabled 분기 영향 받으나 정상 케이스는 enabled) | 2-stack 합계 8px 감소. 단 `recognized-view.tsx`는 BottomSheet/snap point 아닌 RecognizedView 본문 (line 1–80 import + line 184–215 단순 column layout) — sheet snap 재계산 불필요 | **LOW — PASS** (사용자 우려한 "2-stack snap" 영향 없음 확인) |
| D | `src/components/capture/label-scan-result-modal.tsx:115` | Modal 내부 CTA 단일 + `mt-5 gap-3`로 본문 분리, 아래 secondary md PrimaryButton (line 119) 무영향 | Modal 내부 자연 흡수 | **LOW — PASS** |
| E | `src/components/wine/add-to-cellar-sheet.tsx:213` | Sheet 내부 단일 CTA (`mt-5` 분리), `loading={saving}` 적용 | sheet height 4px 감소 — 사용자 화면 fit 정상 | **LOW — PASS** |
| F | `app/(tabs)/capture.tsx:370` | 카메라 permission deny 시 fallback 화면 CTA, `mt-8 w-full max-w-xs gap-3` 컨테이너, 아래 secondary md PrimaryButton (line 375) | flex-1 items-center justify-center 중앙 정렬 컨테이너 — 4px 감소 자연 흡수 | **LOW — PASS** |

### 2-2. recognized-view 2-stack (B+C) 상세 점검 (사용자 명시 주의 항목)

**파일 컨텍스트 (line 1–12 docstring + line 184–215):**
- RecognizedView는 capture screen의 stage component (BottomSheet 아님).
- `recognized-view.tsx` import 트리 (line 13–25): React Native View/Text + lucide icons + PrimaryButton + sub-component (AIBadgeBanner, PhotoFrame, MetaRow, FileNotFoundHint, SecondaryIconButton) — **BottomSheet 또는 snap point 관련 import 0건**.
- line 186: `{/* PrimaryActions column gap 10 */}` 주석 + line 187: `<View style={{ gap: 10 }}>` — 단순 vertical stack.
- 두 PrimaryButton (line 188 primary, line 195 cellar) 모두 size lg → 각각 height 52 → 48 (4px 감소) × 2 = **합계 8px 감소**.
- 본 컴포넌트 부모는 capture screen `app/(tabs)/capture.tsx` line 370 (permission fallback) 또는 recognized stage container — 스크린 전체 ScrollView/View 일반 흐름.

**결론:**
- ✅ **BottomSheet snap point 재계산 불필요** — sheet 컨텍스트 아님.
- ✅ 2-stack 8px 감소는 sub-action SecondaryActions row (line 205, `gap: 10`)와 함께 자연스러운 column flow에서 흡수.
- ✅ 사용자 우려 ("recognized-view 2-stack (191+198) snap point 영향 가능")는 **실제 코드 분석 결과 무영향**.

### 2-3. 회귀 등급 종합

- **MEDIUM 위험 0건** (1차 보고서가 우려한 "recognized-view 2-stack" 항목 → 실제 코드 분석 결과 LOW로 재평가).
- **LOW 위험 6건** — 모두 단일 CTA 컨테이너 또는 sub-action 무관 stack. 4px 감소 자연 흡수.
- **결론:** 6/6 PASS. 회귀 영향 없음.

---

## 3. 6항목 체크리스트 재실행 (2차 게이트)

### (a) 요소 누락 — **PASS**
- 1차 FAIL 4건 (a-1 disabled / a-2 letterSpacing / a-3 numberOfLines / a-4 border) 모두 RESOLVED (§1).
- a-5 (gap-2 leadingIcon spacing) — 본 PATCH 4 step CTA 모두 아이콘 미사용, 무영향.

### (b) Spacing 비율 — **PASS**
- b-1 (height 48) RESOLVED.
- b-2 (lg padding 20) RESOLVED.
- b-3 (safe-area paddingBottom = max(insets.bottom, 0) + 40) 그대로 유지 — 1차 PASS 유지.
- b-4 (PageRoot horizontal padding 24 통일) 그대로 유지 — 1차 PASS 유지.

### (c) Gradient 방향·깊이 — **PASS (N/A)**
- PrimaryButton 자체에 그라데이션 없음 (키스크린 verbatim).

### (d) Corner radius — **PASS**
- d-1 (rounded-xl 12pt) RESOLVED.

### (e) Typography 위계 — **PASS**
- e-1 (letterSpacing -0.01em) RESOLVED.
- e-2 (Inter 600, 15px lg) 그대로 유지 — 1차 PASS.
- e-3 (4 step 모두 size lg 일관) 그대로 유지 — 1차 PASS.

### (f) Color 사용 — **PASS** (단 f-2-sub SCOPE-OUT)
- f-1 (disabled bg/text 색) RESOLVED.
- f-2 (enabled bg `bg-wine-red` + text `text-cream`) 그대로 — 1차 PASS.
- f-2-sub (light 모드 wine-red → gold / cream → dark brown dual 치환) — **SCOPE-OUT.** 사용자 명시 "light 모드 wine-red/cream dual 치환 (별도 cycle)" 반영. 본 v2에서 평가 보류.
- f-3 (하드코딩 hex grep) — `src/components/shared/primary-button.tsx` line 1–115 전체에 색 hex 0건 (comment 주석 line 55–56 hex 표기는 코드 아님 — 통과). **PASS.**
- f-4 (primary border 색) RESOLVED (border bg와 동일 — 시각 무영향, verbatim 정합).

### (g) safe-area 처리 — **PASS**
- step 1 (`1-welcome.tsx:45`) + step 2/3/4 (`onboarding-step-layout.tsx:41`) 모두 `paddingBottom: Math.max(insets.bottom, 0) + 40` 그대로. 키스크린 verbatim.

---

## 4. 4 step CTA 시각 상태 재점검 (사양 §1-1 verbatim)

| Step | 파일:line | 호출 패턴 | 2차 시각 상태 (변경 후) | 일치? |
|---|---|---|---|---|
| 1 welcome | `app/onboarding/1-welcome.tsx:82` | `<PrimaryButton size="lg" />` 항상 enabled | wineRed bg + cream text + border wineRed + 48 height + 12 radius + 20 px padding + -0.01em tracking + nowrap | **PASS** |
| 2 language | `app/onboarding/2-language.tsx:89` | `<PrimaryButton size="lg" disabled={!picked} loading={saving} />` | picked=null → bg-text-disabled (보라회색 dark / sand light) + text-text-muted (warm gold dark / muted brown light) + border-transparent. picked → enabled wineRed+cream | **PASS** |
| 3 experience | `app/onboarding/3-experience.tsx:99` | 동일 | 동일 | **PASS** |
| 4 mode | `app/onboarding/4-mode.tsx:106` | `label={t('onboarding.mode.finish')}` 외 동일 | 동일 | **PASS** |

**i18n 키 변경 0건 확인** (사양 §7-2 verbatim).
**loading prop 처리 그대로** (PrimaryButton line 100–101 `loading ? <ActivityIndicator /> : ...`).

---

## 5. qa-inspector grep 검증 사전 통과 (사양 §9-4)

| grep 대상 | 결과 |
|---|---|
| `opacity-50` in `src/components/shared/primary-button.tsx` | **0건** (line 1–115 전체) |
| `h-\[52px\]` in `src/components/shared/primary-button.tsx` | **0건** (line 19–23 HEIGHT scale 확인 — sm 36 / md 44 / lg 48) |
| `rounded-lg` in `src/components/shared/primary-button.tsx` | **0건** (line 97 className `rounded-xl` 단일) |
| 하드코딩 hex in `src/components/shared/primary-button.tsx` | **0건** (line 55–56 주석 표기 외 코드 0건) |

**4/4 통과.** qa-inspector 단계로 진행 가능.

---

## 6. 결정

### 6-1. 종합 결과: **PASS**

| 카테고리 | 결과 |
|---|---|
| 1차 7 FAIL RESOLVED | 7/7 |
| STILL-FAIL | 0건 |
| 신규 FAIL | 0건 |
| SCOPE-OUT (사용자 명시) | 1건 (f-2-sub light 모드 dual 치환) |
| 6 사용처 회귀 영향 | 0건 (모두 LOW — PASS) |
| qa grep 검증 사전 통과 | 4/4 |

### 6-2. 라우팅

- **rn-screen-builder:** 본 PATCH 본체 작업 완료. 추가 수정 0건.
- **qa-inspector:** 본 게이트 PASS — **qa-inspector 단계로 진행.** §5 grep 4건 본 검증자가 사전 통과 확인.
- **design-spec-author:** 사양 추가 보강 0건. 사양 v1 그대로 유효.
- **infra-architect:** 신규 토큰 추가 0건 (사양 §3-3 verbatim).
- **리더 escalate:** f-2-sub (light 모드 wine-red/cream dual 치환) — 사용자 명시 SCOPE-OUT, 별도 cycle. 본 v2에서는 평가 보류. 본 cycle 미해결 사항 0건.

### 6-3. 별도 cycle 추적 항목 (SCOPE-OUT — 본 v2 미검증)

- **light 모드 wine-red/cream dual 치환**: tailwind.config.ts `wine-red`/`cream` 토큰 dual 확장 필요. 영향처 광범위 (home/capture/notes 전반) — 별도 cycle 권장.
- **BottomNav (F1)**, **WineFeed (F2-a)**, **followers note row (F2-b)**, **AppHeader** — 1차 보고서에서도 scope-out 명시, 본 v2도 동일.
- **사양 §10 Q1** (사용자 image #5 radius 14 추정 vs keyscreen verbatim 12) — 미해결, 본 PATCH는 12 채택 그대로 유효. 사용자 확정 시 PATCH v2 가능.

---

## 7. 요약 (1줄)

1차 7 FAIL 모두 RESOLVED (disabled 분기·색 / height 52→48 / lg padding 16→20 / radius 8→12 / letterSpacing -0.01em / numberOfLines / border verbatim) + 6 lg 사용처 회귀 영향 0건 (recognized-view 2-stack도 sheet snap 무관 확인) + qa grep 4건 사전 통과 → **PASS, qa-inspector 단계로 진행.**
