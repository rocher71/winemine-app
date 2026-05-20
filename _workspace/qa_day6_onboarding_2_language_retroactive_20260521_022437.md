# QA Day6 — /onboarding/2-language Retroactive Hardening Integration Gate

- 일시: 2026-05-21 02:24:37 KST
- 대상 (미커밋):
  - `app/onboarding/2-language.tsx` (재작성)
  - `src/components/onboarding/onboarding-step-layout.tsx` (신규)
  - `src/components/onboarding/language-choice-card.tsx` (신규)
  - `src/lib/design-tokens.ts` (typography 3 신규)
  - `tailwind.config.ts` (fontSize 3 신규)
  - `src/lib/i18n/ko.json`, `src/lib/i18n/en.json` (onboarding.language.{ko,en} 2건씩)
- SCOPE-OUT: Day 6 settings sub 화면 (language/experience/appearance), BottomNav, AppHeader

---

## 요약

- **결과: PASS**
- **FAIL: 0**
- **WARN: 0**
- **검증 항목: 8 / 8 통과**

---

## 체크리스트 결과

### 1. ko/en 양쪽 채움 + 영문 모드 한글 노출 (PASS)

- `onboarding.language.title` ko/en 양쪽 존재 (ko.json:72, en.json:72)
- `onboarding.language.subtitle` ko/en 양쪽 존재 (ko.json:73, en.json:73)
- `onboarding.language.ko` = `"한국어"` (ko.json:74, en.json:74)
- `onboarding.language.en` = `"English"` (ko.json:75, en.json:75)
- `common.next` ko/en 양쪽 존재
- `errors.onboardingSaveFailed` ko/en 양쪽 존재 (ko.json:772, en.json:772)
- **의도된 분기 확인**: `onboarding.language.{ko,en}` 값은 자기 언어명을 표기 — 영문 모드에서도 "한국어"가 노출되는 것은 사양 §1-1 verbatim 의도 (LanguageChoiceCard 라벨은 본인 언어 native form). 다른 ko 문자열은 영문 모드에 없음.
- IconBadge의 `"KR"/"EN"` 리터럴은 i18n 키 아닌 locale code (사양 §1-1, language-choice-card.tsx:46~48). 영문 모드에서 적절.

### 2. dark/light dual definition (PASS)

`onboarding-step-layout.tsx`:
- `bg-bg-deepest dark:bg-bg-deepest` (line 38) — NW v4 dual

`language-choice-card.tsx`:
- `bg-surface dark:bg-surface` (line 71) — NW v4 dual
- `borderUnselected = scheme === 'light' ? light.border.default : dark.border.default` (line 57) — useColorScheme 분기
- IconBadge bg = `withAlpha(brand.gold, 0.08)` — 양쪽 모드 동일 의도 (사양 §4-4/5, language-choice-card.tsx:9 주석)
- text-primary는 dual class 사용 (line 101)

`2-language.tsx`:
- Title/Subtitle 모두 `text-text-primary dark:text-text-primary`, `text-text-muted dark:text-text-muted` 적용 (line 100, 106)

### 3. emoji 및 U+FE0F variation selector grep (PASS)

7개 변경 파일 전수 grep — 0건.

### 4. 하드코딩 hex/rgba grep (PASS)

3개 신규/수정 TSX 파일 grep 결과:
- `language-choice-card.tsx:15` 1건 — JSDoc 주석 내 keyscreen 원본 CSS 인용 (`'0 0 0 1px rgba(139,26,42,0.4)'`), deviation 사유 기록 목적. 실코드 X. 허용.
- 색상은 모두 토큰 경유: `brand.gold`, `withAlpha(brand.gold, 0.08)`, `light.border.default`, `dark.border.default`.

### 5. SUPABASE_SERVICE_ROLE_KEY 격리 (PASS)

3개 신규/수정 TSX 파일 grep — 0건. `supabase.from('profiles').update().eq('id', uid)` 는 anon key + RLS (`auth.uid() = id`) 경유.

### 6. OAuth 골격 호환 (PASS — 무변경)

- `supabase/migrations/20260519000000_profiles.sql:62~64` — email/linked_providers/is_upgraded 컬럼 보존
- `src/lib/supabase.ts:41` — `flowType: 'pkce'` 유지
- `src/lib/auth/providers/{kakao,google,apple}.ts` 3개 NotImplemented stub 유지
- `src/lib/auth/link-identity.ts` NotImplemented stub 유지
- 본 cycle은 OAuth 영역 0 변경.

### 7. profiles 트리거 변경 없음 (PASS)

`git status`에 `supabase/` 디렉토리 변경 0건. `handle_new_user`, `anonymize` 함수, `language` 컬럼 CHECK 제약(`language in ('ko','en')`) 모두 무변경. 클라이언트 update 값(`'ko'` | `'en'`)은 CHECK 통과 보장.

### 8. settings-radio-row.tsx 회귀 영향 (PASS — 무관계)

- `src/components/settings/settings-radio-row.tsx` Read 결과: 본 cycle 신규 컴포넌트(`OnboardingStepLayout`, `LanguageChoiceCard`)와 import 의존 0건.
- 공유 토큰만 사용: `brand`, `dark.border.default`, `light.border.default`. 본 cycle은 이 토큰들에 신규 항목만 add (override X). 기존 값 변경 없음.
- typography 신규 3 (onboardingStepTitle/Subtitle/ChoiceLabel) — settings-radio-row 미사용. 회귀 영향 0.
- tailwind.config.ts fontSize 신규 3 — 동일.

---

## 경계면 정합성 추가 검증

- **Dual-source 일치**: design-tokens.ts (camelCase: onboardingStepTitle/Subtitle/ChoiceLabel) ↔ tailwind.config.ts (kebab: onboarding-step-title/subtitle, onboarding-choice-label). size/lineHeight 모두 일치 (28/33.6, 14/20, 18/21.6). PASS.
- **className 매핑**: `text-onboarding-step-title` / `text-onboarding-step-subtitle` / `text-onboarding-choice-label` 모두 tailwind extend에 정의됨 — NativeWind 빌드 시 인식. PASS.
- **import 해상**: `PrimaryButton`, `Toast`, `getCurrentUserId`, `changeLanguage`, `AppLocale`, `supabase` 모두 존재 확인. PASS.
- **font-inter-semibold**: tailwind.config.ts:91에 매핑 (`['Inter_600SemiBold']`). PASS.
- **text-gold**: tailwind.config.ts:20에 매핑 (`#C9A84C`). PASS.
- **i18n key 사용**: 2-language.tsx에서 `t('onboarding.language.{title,subtitle,ko,en}')` 4건 모두 양쪽 JSON에 존재. PASS.

---

## 결론

PASS — 다음 단계 진행 가능 (디자인 리뷰 게이트 통과 후 Day 6 settings sub 화면으로 또는 사양 §10 Q2 후속 cycle: 3-experience / 4-mode 마이그레이션).
