# QA Follow-up: /onboarding/* CTA — 통합 정합성 게이트

- 시각: 2026-05-21 13:03:12
- 검증 범위 (미커밋):
  - `src/components/shared/primary-button.tsx` (전면 재작성)
  - `src/lib/design-tokens.ts` (`componentSize.primaryButton.lg` 52→48)
- SCOPE-OUT: BottomNav / WineFeed / followers note row / AppHeader / light 모드 wine-red·cream dual 치환.

## 결과 요약

- 전체 8개 항목 — **PASS 8 / FAIL 0**

---

## 체크리스트 결과

### (1) PrimaryButton 사용처 grep 정합성 — PASS

- 총 PrimaryButton 호출: **20개** (50 grep hits = import 10건 + 호출 20건 + 주석/JSDoc 일부)
- 호출별 props 시그니처 검증 (label / size / variant / disabled / loading / onPress / accessibilityLabel) — 모두 유효:

| 파일:line | size | variant | disabled | loading |
|---|---|---|---|---|
| `app/onboarding/1-welcome.tsx:80` | `lg` | (default primary) | — | — |
| `app/onboarding/2-language.tsx:87` | `lg` | (default primary) | `!picked` | `saving` |
| `app/onboarding/3-experience.tsx:97` | `lg` | (default primary) | `!picked` | `saving` |
| `app/onboarding/4-mode.tsx:104` | `lg` | (default primary) | `!picked` | `saving` |
| `src/components/home/first-time-greeting.tsx:66` | `lg` | (default primary) | — | — |
| `src/components/capture/recognized-view.tsx:188` | `lg` | `primary` | — | — |
| `src/components/capture/recognized-view.tsx:195` | `lg` | `cellar` | — | — |
| `src/components/capture/label-scan-result-modal.tsx:113` | `lg` | `primary` | — | — |
| `src/components/capture/label-scan-result-modal.tsx:119` | `md` | `secondary` | — | — |
| `src/components/wine/add-to-cellar-sheet.tsx:211` | `lg` | (default primary) | — | `saving` |
| `app/(tabs)/capture.tsx:368/375/428/611/725` | lg/md/sm | primary/secondary | — | — |
| `app/(tabs)/cellar/index.tsx:232` | `md` | (default primary) | — | — |
| `app/cellar/[lwin].tsx:174/326/332` | `md` | secondary/secondary/ghost | — | `busy` (332) |
| `app/notes/[noteId].tsx:165` | `md` | `secondary` | — | — |
| `app/wine/[lwin].tsx:74` | `md` | `secondary` | — | — |
| `src/components/shared/confirm-dialog.tsx:95/103` | `md` | secondary/primary | — | — |

- 신규 컴포넌트의 Props 타입(`PrimaryButtonProps`)이 기존 시그니처(label/onPress/size/variant/disabled/loading/accessibilityLabel)와 호환. **타입 누락·이름 변경 없음**.
- `variant: 'cellar'` 신규 추가 — recognized-view.tsx:195 사용처 유효 (capture ConfirmCellar gold 테두리).

### (2) 4 onboarding step의 disabled 분기 — PASS

- step 1 (welcome): disabled prop 미사용 — 항상 활성. 디자인 의도 일치.
- step 2/3/4: 각각 `disabled={!picked}` + `loading={saving}` 패턴.
- 신규 PrimaryButton의 disabled 분기:
  - `bgClass = disabled ? VARIANT_BG_DISABLED[variant] : VARIANT_BG[variant]` (line 87)
  - `textClass = disabled ? VARIANT_TEXT_DISABLED[variant] : VARIANT_TEXT[variant]` (line 88)
  - `disabled || loading` 시 `onPress` 차단 (line 82) + `Pressable disabled` (line 93) + `accessibilityState.disabled` (line 96).
- primary variant disabled: `bg-text-disabled border border-transparent` + `text-text-muted` (사용자 "placeholder 같음" 해소 위해 opacity 적용 X — 컴포넌트 주석 line 58 확인).

### (3) ko/en — PASS

- i18n 변경 없음 (`src/lib/i18n/{en,ko}.json` working tree 깨끗).
- primary-button.tsx에 한글 grep — code 0건. 주석에 한글 2건 (line 55,56 "보라회색", "warm gold" 같은 한글 형용어) — **주석 한글은 정책 §4-4 영향 0**.
- 라벨 텍스트는 모두 호출자가 `t('...')` 로 주입 (영문 모드 한글 노출 0).

### (4) dark/light dual — PASS

- 사용 토큰별 dual 정의 (tailwind.config.ts:31~62):
  - `text-disabled` → DEFAULT(dark) `#7E6E8E` / light `#C0B0A0` (보라회색 → sand). **dual OK**
  - `text-muted` → DEFAULT(dark) `#CABDA8` / light `#8B7766`. **dual OK**
  - `wine-red` `#8B1A2A` / `wine-red-hover` `#A02030` / `cream` `#F5F0E8` — **brand-fixed (테마 무관)**. 사용자가 명시한 SCOPE-OUT (light 모드 wine-red·cream dual 치환은 별도 cycle) 일관.
  - `border-transparent` — Tailwind 기본, 양쪽 모드 무관.
- 호출자 className에 `dark:` 변형 추가 불필요 (NW v4 `darkMode:'class'` 자동 토글로 토큰 자체가 mode 분기).

### (5) emoji grep — PASS

- `/Users/yejinkim/dev/winemine-app/src/components/shared/primary-button.tsx` + `design-tokens.ts` — emoji / U+FE0F 매치 **0건**.
- 검사 패턴: `[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]`.

### (6) 하드코딩 hex/rgba grep — primary-button.tsx — PASS

- 코드 라인에 `#[0-9a-fA-F]{3,6}` 또는 `rgba?(...)` **0건**.
- 매치된 4건은 모두 주석 (line 55,56 — 토큰 매핑 설명용 reference). 정책 §4-9 위반 0.

### (7) SUPABASE_SERVICE_ROLE_KEY 격리 — PASS

- 두 파일 모두 `SUPABASE_SERVICE_ROLE_KEY` 매치 **0건**.

### (8) componentSize.primaryButton.lg 52→48 회귀 — PASS

- `componentSize.primaryButton` 의 외부 import 사용처: **0건** (grep 결과 design-tokens.ts 내 정의 1건만).
- 즉, snap point / BottomSheet height / settings 화면 등 어디서도 `componentSize.primaryButton.lg` 값을 동적으로 참조하지 않음.
- 신규 primary-button.tsx 의 `HEIGHT.lg` 는 `h-[48px]` 하드코딩 — 토큰과 일치 (sync 유지).
- Legacy `h-[52px]` / `h-13` (52px) 버튼 관련 잔존 reference grep → 0건.
- 결론: **시각 변경(52→48 4px 축소)만 발생, 동작 영향 0**.

---

## 발견 사항

없음.

## 권장

- 본 PATCH PASS — 커밋/머지 진행 가능.
- 후속 cycle 보류 사항 (사용자 SCOPE-OUT 명시 — 본 보고서 외 추적):
  - `wine-red` / `cream` 토큰의 light 모드 dual 치환 (brand-fixed 유지 vs light 모드 대비 개선)
  - BottomNav / WineFeed / followers note row / AppHeader retroactive hardening
