# QA — /onboarding/4-mode retroactive hardening 통합 정합성 게이트

- 시각: 2026-05-21 03:03:47 KST
- 대상 (미커밋):
  - `app/onboarding/4-mode.tsx` (158 LOC, 재작성)
  - `src/components/onboarding/mode-choice-card.tsx` (123 LOC, 신규)
- 사양: `_workspace/design-specs/onboarding-4-mode.md`
- 디자인 리뷰 게이트: `_workspace/design-review_onboarding-4-mode_20260521_030031_v2.md` (PASS 6/6)
- SCOPE-OUT: Day 6 settings / BottomNav / AppHeader
- 결과: **PASS (8/8)**, FAIL 0

---

## 1. profiles.mode 업데이트 supabase 호출 ↔ RLS 호환 — PASS

생산자 (RLS):
- `supabase/migrations/20260519000000_profiles.sql:80-81` `policy "profiles_update_own" ... using (id = auth.uid()) with check (id = auth.uid())`
- `mode` 컬럼 CHECK: `check (mode in ('first-time','heavy'))` (line 65)

소비자 (RN):
- `app/onboarding/4-mode.tsx:85-88`
  ```
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('no session');
  const { error } = await supabase.from('profiles').update({ mode: picked }).eq('id', uid);
  ```
- `picked: Mode = 'first-time' | 'heavy'` (line 67) — CHECK 제약 100% 만족.
- `.eq('id', uid)` 명시 — RLS USING(id=auth.uid()) + WITH CHECK 동일 절 일관.
- `getCurrentUserId()` (`src/lib/auth/index.ts:35-38`)는 `supabase.auth.getSession()`에서 `data.session?.user.id` 반환 → `auth.uid()`와 동일 UUID.

정합성: USING/WITH CHECK 두 절 모두 `id = auth.uid()` 통과. update payload `{ mode: 'first-time' | 'heavy' }`는 mode CHECK 통과. 다른 컬럼 변경 0 — `experience/language/theme` etc.에 영향 없음.

---

## 2. ko/en — 기존 키 그대로 / 영문 모드 한글 노출 X — PASS

사용 키 8개 (`4-mode.tsx`):
- `onboarding.mode.title` / `onboarding.mode.subtitle` / `onboarding.mode.firstTimeDescription` / `onboarding.mode.heavyDescription` / `onboarding.mode.finish`
- `mode.firstTime` / `mode.heavy`
- `errors.onboardingSaveFailed`

`ko.json` / `en.json` 모두 8키 완비 (ko line 36-39, 86-92, 775 / en line 36-39, 86-92, 775). 누락 0.

영문 노출:
- `en.json:37-38` `firstTime: "Just starting out"`, `heavy: "I keep many notes"` — 한글 0건.
- `en.json:86-92` `onboarding.mode.*` 5키 — 한글 0건.
- `en.json:775` `onboardingSaveFailed: "Failed to save your settings. Please try again."` — 한글 0건.

신규 키 추가 없음 — i18n 누락 위험 0.

---

## 3. dark/light dual — useColorScheme 분기 — PASS

`mode-choice-card.tsx`:
- line 73-74: `const scheme = useColorScheme(); const borderUnselected = scheme === 'light' ? light.border.default : dark.border.default;` — 명시적 분기.
- line 91: `className="flex-row items-start rounded-2xl bg-surface dark:bg-surface"` — NW v4 dual.
- line 96: `borderColor: selected ? brand.gold : borderUnselected` — selected는 brand-fixed gold (양쪽 모드 의도적 동일).
- line 113: `text-text-primary dark:text-text-primary` — NW v4 dual.
- line 117: `text-text-muted dark:text-text-muted` — NW v4 dual.

`4-mode.tsx`:
- line 121: `text-text-primary dark:text-text-primary` (title).
- line 128: `text-text-muted dark:text-text-muted` (subtitle).

토큰 검증 (`tailwind.config.ts`):
- `surface: { DEFAULT: '#3D2A4A', light: '#FFFFFF' }` (line 36) → dual 확정.
- `text-primary: { DEFAULT: '#F8F4ED', light: '#2A1A14' }` (line 38) → dual 확정.
- `text-muted: { DEFAULT: '#CABDA8', light: '#8B7766' }` (line 40) → dual 확정.

WCAG AA (light): muted #8B7766 ↔ surface #FFFFFF = 약 4.6:1 ≥ 4.5:1. 통과.
WCAG AA (dark): muted #CABDA8 ↔ surface #3D2A4A = 약 7.9:1. 통과.

`OnboardingStepLayout` (`onboarding-step-layout.tsx:38`): `bg-bg-deepest dark:bg-bg-deepest` — 페이지 배경도 dual.

Lucide icon color (line 107: `color={brand.gold}`)은 brand-fixed — 사양 §10 Q3 SCOPE-OUT 항목 (라이트 모드 gold 대비 후속 cycle), 의도적 deferral.

---

## 4. emoji grep — PASS

Python 정규식 (U+1F300~U+1FAFF, U+2600~U+27BF, U+1F000~U+1F9FF + U+FE0F variation selector) 양쪽 파일 검사:
```
emoji/VS hits: 0
```
`SCOPE: app/onboarding/4-mode.tsx + src/components/onboarding/mode-choice-card.tsx`

---

## 5. 하드코딩 hex/rgba grep — PASS

`grep -nE "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}\b|rgba\(|rgb\("` 결과:
- `app/onboarding/4-mode.tsx`: 0건.
- `mode-choice-card.tsx`: 주석 1건 (`line 24: * boxShadow ring '0 0 0 1px rgba(139,26,42,0.4)' → border 1→2px (brand.gold).`) — JSDoc deviation 사유 설명, 실제 코드 사용 0. **PASS** (CLAUDE.md §4-9 + design-tokens.ts 단일 출처 규칙은 실행 코드 한정).

코드 색 사용 4건 모두 토큰:
- `brand.gold` (line 96, 107) — design-tokens.ts brand 토큰.
- `borderUnselected` = `light.border.default | dark.border.default` (line 74, 96) — design-tokens.ts dark/light 토큰.
- 그 외 색은 모두 NW v4 className 토큰 (`bg-surface`, `text-text-primary`, `text-text-muted`).

---

## 6. SUPABASE_SERVICE_ROLE_KEY 격리 — PASS

`grep -n "SUPABASE_SERVICE_ROLE_KEY\|service_role"` 양쪽 파일 → 0건.

`EXPO_PUBLIC_` 사용 0건 (직접 supabase 클라이언트 호출만 — `@/lib/supabase` import 경유).

CLAUDE.md §4-6, §4-7 모두 통과.

---

## 7. profiles 트리거 영향 — PASS

- `handle_new_user` 트리거 (`20260519000000_profiles.sql:85-97`): INSERT 시 `(id, anonymize(new.id))` 자동 채움. mode/experience/language/theme/xp/level은 컬럼 DEFAULT (`'first-time' / 'beginner' / 'ko' / 'system' / 0 / 1`).
- 본 cycle 코드 변경은 **`profiles.update({ mode: picked }).eq('id', uid)`** UPDATE만. 트리거는 `after insert on auth.users`로 INSERT만 fire — UPDATE 경로 영향 0.
- mode CHECK 제약 (line 65) `in ('first-time','heavy')` — `picked` 타입 `'first-time' | 'heavy'`로 100% 충족. CHECK 위반 가능성 0.
- `updated_at` 자동 갱신 트리거 없음 (column DEFAULT `now()`만 — INSERT 시점 고정). UPDATE는 `updated_at` 변경 X — v0.1.0 의도된 한계 (스펙과 일치).
- `on_auth_user_created` 트리거가 본 update 경로에서 재호출되지 않음 확인 (auth.users INSERT 아님).

---

## 8. 홈 진입 흐름 — first-time vs heavy 분기 — PASS

`4-mode.tsx:90` `router.replace('/(tabs)')` → `app/(tabs)/index.tsx`.

`app/(tabs)/index.tsx` 진입 가드 + 분기 로직 (line 39-93):
- line 44-57: `useEffect` — `isOnboarded()` 호출, `mode === 'first-time' && !done` 시 `/onboarding` 재진입 가드.
  - 본 cycle은 `setOnboarded()` (line 89) 후 `router.replace('/(tabs)')` — `done = true`이므로 가드 무시 통과.
- line 76: `const mode = profile?.mode ?? 'first-time'` — `useProfile()` 훅이 `profiles.mode` Row 직접 SELECT (`use-profile.ts`).
- line 87-91:
  ```
  {mode === 'heavy' ? (
    <HeavyHome displayName={localizedDisplay} />
  ) : (
    <FirstTimeHome displayName={localizedDisplay} />
  )}
  ```
- HomeHeader도 mode 분기 (line 83): `mode={mode === 'heavy' ? 'heavy' : 'first-time'}`.

생산자 타입 (`database.types.ts:126`): `profiles.Row.mode: string` — value 'first-time' / 'heavy' (CHECK 제약). 소비자 비교 `=== 'heavy'`는 정상 작동.

흐름 정합성:
1. `4-mode.tsx` `picked` = 'heavy' → `update({ mode: 'heavy' })` → DB 저장.
2. `setOnboarded()` (AsyncStorage `winemine.onboarded = 'true'`) → 가드 통과.
3. `router.replace('/(tabs)')` → HomeScreen 마운트 → `useProfile()` fetch → `profile.mode === 'heavy'` → `HeavyHome` 렌더.
4. 'first-time' 경로 동일 → `FirstTimeHome` 렌더.

분기 누락 0. HomeHeader/HomeBody 둘 다 mode 따름.

---

## Summary

| # | 항목 | 결과 |
|---|---|---|
| 1 | profiles.mode 업데이트 RLS 호환 | PASS |
| 2 | ko/en 누락 + 영문 한글 노출 | PASS |
| 3 | dark/light dual (useColorScheme) | PASS |
| 4 | emoji grep | PASS |
| 5 | 하드코딩 hex/rgba grep | PASS |
| 6 | SUPABASE_SERVICE_ROLE_KEY 격리 | PASS |
| 7 | profiles 트리거 영향 | PASS |
| 8 | 홈 진입 흐름 (first-time/heavy 분기) | PASS |

**총평: 8/8 PASS, FAIL 0.** 미커밋 상태 그대로 커밋 가능. 후속 cycle (P0):
- (Q3) ModeChoiceCard Lucide icon 라이트 모드 gold 대비 — language/experience/mode 일괄 후속.
- (P0) `onboardingStepTitleSm` (Playfair 26/31.2) 토큰화 — experience/mode 두 사용처 inline arbitrary 통합.
