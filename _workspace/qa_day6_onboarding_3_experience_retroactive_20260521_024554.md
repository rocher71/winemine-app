# QA Gate — /onboarding/3-experience (Day 6 retroactive hardening v1)

**Date:** 2026-05-21 02:45:54
**Target:** app/onboarding/3-experience.tsx (재작성), src/components/onboarding/experience-choice-card.tsx (신규), src/lib/i18n/{ko,en}.json
**Scope:** integration-coherence-check (9 items)
**SCOPE-OUT:** settings sub 3 pages, settings hub, (tabs)/settings/_layout, BottomNav, AppHeader. Q1 5-step → step 4 cycle.

---

## Verdict

**PASS — FAIL count: 0**

---

## Checklist

### 1. profiles.experience UPDATE supabase 호출 RLS 호환  → PASS

- 호출 (`app/onboarding/3-experience.tsx:78-82`):
  ```ts
  await supabase.from('profiles').update({ experience: picked }).eq('id', uid);
  ```
- RLS 정책 (`supabase/migrations/20260519000000_profiles.sql:80-81`):
  ```sql
  create policy "profiles_update_own" on public.profiles
    for update using (id = auth.uid()) with check (id = auth.uid());
  ```
- 컬럼 정의 (line 66): `experience text not null default 'beginner' check (experience in ('beginner','expert'))`
- 클라이언트 union `'beginner' | 'expert'` → CHECK 만족.
- `uid = getCurrentUserId()` 결과 `auth.uid()`와 동일 → USING/WITH CHECK 두 조건 모두 만족 → row update 통과.
- 실패 경로: `uid === null` → 명시 throw → Toast errors.onboardingSaveFailed (i18n ko/en 양쪽 존재 확인).

### 2. ko/en 양쪽 채움 + 영문 모드 한글 노출 X  → PASS

- 신규 i18n 키 (양쪽 모두 추가됨):
  - `onboarding.experience.title` / `subtitle` / `beginnerLabel` / `beginnerSub` / `expertLabel` / `expertSub` / `footer`
- 사용처 (`3-experience.tsx`): 모든 사용자 노출 텍스트가 t() 호출.
- `grep -P '[가-힣]' src/lib/i18n/en.json` → 3건 (`"ko": "한국어"` × 3, language label로 의도된 노출. CLAUDE.md §4-4 와인명 fallback 예외와 동일 카테고리).
- 코드/컴포넌트 Korean grep → 전부 JSDoc / inline comment (RN 번들 영향 0).

### 3. dark/light dual definition — 신규 컴포넌트 양쪽  → PASS

- `ExperienceChoiceCard` 색 사용처:
  - `bg-surface dark:bg-surface` (NW dual) — tailwind.config.ts:36 `surface: { DEFAULT:'#3D2A4A', light:'#FFFFFF' }`
  - `text-text-primary dark:text-text-primary` — tailwind.config.ts:38 dual
  - `text-text-muted dark:text-text-muted` — tailwind.config.ts:40 dual
  - `borderColor: borderUnselected` — `useColorScheme()` 분기 → `light.border.default` (#E0D2BC) | `dark.border.default` (#5A3D6A) (design-tokens.ts:42/74)
  - `borderColor: brand.gold` (선택 시) — brand-fixed (테마 무관, 의도된 brand accent)
  - `Icon color={brand.gold}` — 동일 brand-fixed 의도
- `3-experience.tsx` 색 사용처:
  - `font-playfair text-text-primary dark:text-text-primary` — dual
  - `text-text-muted dark:text-text-muted` (subtitle, footer) — dual
- 모두 dual 토큰 또는 brand-fixed gold. 한쪽 모드 누락 0.

### 4. emoji grep  → PASS

- 검색 범위: 3-experience.tsx, experience-choice-card.tsx, ko.json, en.json
- 정규식: `[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]`
- 결과: 0건 (exit 1).

### 5. 하드코딩 hex/rgba grep  → PASS

- 정규식: `#[0-9a-fA-F]{3,8}\b|rgba?\(`
- 매치 1건:
  - `experience-choice-card.tsx:18` — JSDoc comment `boxShadow ring '0 0 0 1px rgba(139,26,42,0.4)' → border 1→2px`. **삭제된 keyscreen 원본 값을 사양 deviation §6 로깅용으로 인용**한 것. 런타임 스타일 0건. → 허용.
- 실 런타임 색: 100% 토큰 (brand.gold, light.border.default, dark.border.default) + NW 클래스 (bg-surface, text-text-primary, text-text-muted). CLAUDE.md §4-9 준수.

### 6. SUPABASE_SERVICE_ROLE_KEY 격리  → PASS

- 검색 범위: 3-experience.tsx, experience-choice-card.tsx
- 결과: 0건 (exit 1). RN 번들 노출 위험 0.
- `supabase.from('profiles').update()` → anon key + JWT 기반 (RLS 강제). CLAUDE.md §4-6 / §4-7 준수.

### 7. profiles 트리거 영향 없음  → PASS

- 마이그레이션 수정 0건 (코드 변경만, SQL 미터치).
- `handle_new_user` 트리거 (migrations/20260519000000_profiles.sql:85-97): INSERT 트리거 only (auth.users new row → profiles new row).
- 본 화면은 **UPDATE** (id 매칭 row) — 트리거 발화 경로와 무관.
- experience CHECK constraint는 INSERT/UPDATE 양쪽 적용 — `'beginner' | 'expert'` 만 보냄 → 위반 없음.

### 8. beginnerDescription/expertDescription deprecation regression  → PASS

- i18n diff (git diff HEAD): `onboarding.experience.beginnerDescription` / `expertDescription` 삭제.
- 전체 src/, app/ grep: `onboarding\.experience\.(beginner|expert)Description` → 0건.
- 새 키 `beginnerLabel` / `beginnerSub` / `expertLabel` / `expertSub` 호출자는 3-experience.tsx 1곳뿐.
- 별개 namespace `settings.experiencePage.beginnerDesc` / `expertDesc` (settings/experience.tsx에서 사용)는 그대로 유지됨 → 회귀 0.

### 9. OnboardingStep / OptionCard 폐기 영향  → PASS

- 본 cycle에서 `OnboardingStep`/`OptionCard`는 **폐기 X** — 단지 3-experience.tsx 가 더 이상 그것을 사용하지 않고 `OnboardingStepLayout` + `ExperienceChoiceCard`로 전환했을 뿐.
- `OnboardingStep` import 잔존: `app/onboarding/4-mode.tsx:8` — SCOPE-OUT (step 4 cycle).
- `OptionCard` import 잔존: `app/onboarding/4-mode.tsx:6` — SCOPE-OUT.
- 두 파일 (`onboarding-step.tsx`, `shared/option-card.tsx`) 미수정 → 4-mode.tsx 빌드/런타임 영향 0.
- 만약 후속 cycle에서 4-mode도 OnboardingStepLayout로 마이그레이션 후 OnboardingStep 파일을 지운다면 그 cycle에서 재검증 필요.

---

## Cross-cutting verifications

- **DB types (shared/types/database.types.ts:120/135/150):** profiles.Row/Insert/Update 모두 `experience: string` (or optional). 클라이언트 union `'beginner' | 'expert'`는 string의 narrow form — TypeScript 허용.
- **OnboardingStepLayout:** 동일 컴포넌트가 step 2 (language)에서 이미 검증되어 PASS 받은 wrapper. 본 step에서 재사용 — 신뢰 가능.
- **Haptics.selectionAsync().catch(() => undefined):** 비-iOS 디바이스에서 fail 시 silent fallback. 정상.
- **router.push('/onboarding/4-mode'):** 파일 경로 `app/onboarding/4-mode.tsx` 존재 확인. 라우팅 정합.
- **accessibilityRole="radio" + accessibilityState={ selected }:** RN 표준 a11y 컨벤션 준수.

## Boundary notes (참고용, FAIL 아님)

- 사양 §10 Q4의 "Title 26 vs 28" — 호출자가 명시적으로 26 채택을 결정 (keyscreen verbatim 일관성). 의식적 deviation.
- 디자인 리뷰 v2 보고서 (`_workspace/design-review_onboarding-3-experience_20260521_024130_v2.md`) 별도 게이트로 시각 검증 — 본 보고서는 통합 정합성만 다룸.

---

## Conclusion

모든 9개 통합 정합성 항목 PASS. RLS 호환·이중 모드·시크릿 격리·i18n 완비·회귀 0 확인.

**다음 행보:** 호출자가 결정. design-reviewer가 v2 시각 게이트 PASS 한 후 commit / 또는 다음 retroactive (4-mode·welcome) 진행.
