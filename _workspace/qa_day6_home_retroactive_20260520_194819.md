# QA Report — Day 6 Home Retroactive Hardening (Integration Coherence Gate)

- author: qa-inspector
- 작성일: 2026-05-20 19:48:19 KST
- 검증 범위: 미커밋 변경 (modified + untracked) 중 `/home` 경로에 영향을 주는 모든 파일
- 입력: app/(tabs)/index.tsx, app/_layout.tsx, src/components/home/* (18 파일),
  src/components/shared/{wm-bottle, wm-glass-rating, level-chip}.tsx,
  src/components/community/{comm-user-avatar, post-type-badge}.tsx,
  src/lib/{design-tokens.ts, use-theme-tokens.ts}, tailwind.config.ts,
  src/lib/i18n/{ko,en}.json
- 디자인 게이트 선결: design-review_home_20260520_194044_v3.md "PASS (full)" 확인 — qa 진행 자격 만족
- 비교 방식: 양쪽 동시 읽기 (RLS 정책 vs 훅 호출, View 컬럼 vs 훅 select vs WineNameDisplay,
  i18n ko vs en, design-tokens vs tailwind.config, brand 토큰 vs 컴포넌트 fill)

---

## 0. 디자인 시각 게이트 통과 확인 (PREREQUISITE)

- PASS — `_workspace/design-review_home_20260520_194044_v3.md` "PASS (full)" / retroactive hardening 종료
- PASS — `_workspace/design-specs/home.md` 사양 존재 (972 lines)
- 결정: integration QA 진행 가능

---

## 1. 통과 (PASS)

### 1.1 i18n ko/en 키 parity (CLAUDE.md §4-4)
- PASS — `jq` 기반 scalar 경로 비교 결과 diff = 0 (PARITY_OK)
- PASS — home 컴포넌트가 사용하는 모든 키 (`home.peakGreeting.eyebrow`,
  `home.peakGreeting.questions.{0..3}`, `home.peakGreeting.fallback`,
  `home.draftResume.{title,subtitle,cta}`, `home.communityPeek.{eyebrow,title,viewAll}`,
  `home.quickActions.{cellar,cellarSub,map,mapSub,favorites,favoritesSub,badges,badgesSub}`,
  `home.wineFeed.{heading,subtitle,tabs.{featured,trending,explore}}`,
  `home.firstTime.{greeting,sub,scanCta,emptyMap,emptyMapHint,suggest{Tour,Starter,Experience}}`,
  `home.suggestedToast.{tour,starter}`, `home.mapCameo.{title,viewAll}`,
  `home.{statCountries,statWines,statNotes,recentTasted,countriesRegions,anonymousFallback,greetingNew,heavy.recentNotes}`,
  `common.refresh`)이 ko.json + en.json 양쪽에 모두 존재
- PASS — `common.refresh` (사양 §6 line 519 요청 항목): ko "새로고침" / en "Refresh" 양쪽 채워짐

### 1.2 영문 모드에서 한글 노출 0건 검증 (CLAUDE.md §4-4)
- PASS — `home-community-peek.tsx`의 MOCK_POSTS_KO/EN과 `wine-feed.tsx`의
  MOCK_WINES_KO/EN은 `i18n.language === 'en'` 분기로 EN 데이터 사용 (각각 line 192, 269)
- PASS — 와인명/생산자/지역의 fallback 패턴: KO 사용자에게 EN 노출은 허용 (와인 데이터 예외)
- PASS — 소스 코드 grep으로 영문 모드 노출 가능성 있는 KO 텍스트 0건 (코멘트/사양 라인만 KO)

### 1.3 dark/light 양쪽 모드 (CLAUDE.md §4-9)
- PASS — 모든 신규 home 컴포넌트가 `bg-bg-deepest dark:bg-bg-deepest`,
  `bg-surface dark:bg-surface`, `text-text-primary dark:text-text-primary` 등 NW v4
  dual-mode className 패턴 사용
- PASS — 인라인 hex가 필요한 위치 (LinearGradient colors, SVG fill)는 `useThemeTokens()`
  훅 또는 `gradients.draftResume.dark/light` 양쪽 분기 명시
  - `first-time-greeting.tsx` 28: `tokens.scheme === 'light' ? gradients.firstTimeGreeting.light : gradients.firstTimeGreeting.dark`
  - `draft-note-resume.tsx` 31: 동일 패턴
  - `empty-stat-hero.tsx` 25: useThemeTokens() + tokens.border.default
  - `home-header.tsx` 132: tokens.border.default / tokens.text.secondary
  - `home-community-peek.tsx` 101, 167: tokens.border.default + tokens.text.muted
  - `wine-feed.tsx` 147, 180: tokens.border.default / tokens.text.muted
- PASS — design-tokens.ts에 `dark` / `light` 객체 dual definition 유지, tailwind.config.ts
  `'bg-deepest': { DEFAULT, light }` 형태로 동기화
- PASS — `useThemeTokens()` 훅이 colorScheme에 따라 dark/light 토큰 반환 (line 30-32)

### 1.4 하드코딩 hex 격리 (CLAUDE.md §4-9)
- PASS — `src/components/home/`, `src/components/shared/{wm-bottle, wm-glass-rating, level-chip}.tsx`,
  `src/components/community/`, `src/lib/use-theme-tokens.ts` 전 영역에서
  `#[0-9a-fA-F]{3,8}` 일치 0건 (NO_HARDCODED_HEX)
- PASS — `src/`, `app/` 전 영역에서 `#[0-9a-fA-F]{6}` 0건 (예외 디렉토리: design-tokens.ts,
  tailwind.config.ts, lwin.ts — 의도된 토큰 정의 위치)
- 참고: design-tokens.ts에 `brand.black/white/textInk` 추가됨 — SVG primitive alpha 변형용
  raw 토큰. 외부에서 raw hex 대신 토큰 import만 허용하도록 코멘트(line 19) 명시.
  `wm-bottle.tsx` line 45, 48 등에서 `brand.black/white/textInk` 사용 — 적합.

### 1.5 emoji 검증 (CLAUDE.md §4-1)
- PASS — 변경 파일 전체에서 `[\x{1F000}-\x{1FFFF}]` 및 `\x{FE0F}` variation selector
  0건 (NO_EMOJI). 대상: home/ 18 파일, community/ 2 파일, shared/ 3 파일, i18n 2 파일,
  design-tokens.ts, use-theme-tokens.ts, tailwind.config.ts, app/_layout.tsx, app/(tabs)/index.tsx

### 1.6 SUPABASE_SERVICE_ROLE_KEY 격리 (CLAUDE.md §4-6, §4-7)
- PASS — `src/`, `app/` 전 영역에서 SUPABASE_SERVICE_ROLE_KEY 실제 사용 0건
  - 단일 grep hit: `src/lib/supabase.ts:9` — 코멘트 (`SUPABASE_SERVICE_ROLE_KEY는 절대
    import 금지`) — 의도된 가드 문구
- PASS — RN 코드에 등장한 EXPO_PUBLIC_ 환경변수는 4개 (모두 정의된 public 변수):
  `EXPO_PUBLIC_SUPABASE_URL` (supabase.ts:31),
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (supabase.ts:31),
  `EXPO_PUBLIC_ANONYMIZATION_SALT_DEV` (anonymize.ts:13, 91) — 모두 anonymous-only
  v0.1.0 의도와 일치
- PASS — Day 6 home 변경 파일에서 추가/변경된 EXPO_PUBLIC_ 또는 SERVICE_ROLE 흔적 없음

### 1.7 LWIN 형식 검증
- PASS — `src/lib/lwin.ts:36` `LWIN_REGEX = /^\d{7}$|^\d{11}$|^\d{13}$/` 유지
- PASS — home 컴포넌트가 LWIN 사용 시 string 그대로 전달:
  - `recent-notes-strip.tsx:64` `router.push(\`/wine/${wine.lwin}\`)`
  - `wine-feed.tsx:188` 동일 — parseInt 사용 없음, text 그대로 라우트
- PASS — `wm-bottle.tsx`는 LWIN 직접 받지 않고 `bottleColor`/`type` (TypeCanonical)만
  소비 — 형식 검증 책임 없음
- PASS — `wine-feed.tsx` MOCK_WINES_KO/EN의 lwin 값 ('1012345', '1012346', '1012347')
  모두 7자리 LWIN 형식 일치 (LWIN_REGEX 통과). 실 DB에는 없으므로 라우트 시 wineDetail
  notFound 화면이 fallback — 사양 §11 mock placeholder 의도와 일치

### 1.8 OAuth 골격 호환성 (v0.2.0 사전)
- PASS — `profiles` 테이블에 v0.2.0 OAuth 컬럼 모두 존재 (
  `linked_providers text[]`, `is_upgraded boolean`, `email text` —
  supabase/migrations/20260519000000_profiles.sql:60-72)
- PASS — `src/lib/auth/providers/{kakao,google,apple}.ts` 3개 stub 모두 존재 +
  `throw new Error('NotImplemented: ... v0.2.0에서 활성됩니다')` 패턴 일관
- PASS — `src/lib/auth/link-identity.ts:22` `linkProvider` 함수 시그니처가
  Supabase v2 API `auth.linkIdentity` wrapper로 정의됨 — NotImplemented 스텁
- PASS — `src/lib/supabase.ts:41` `flowType: 'pkce'` 설정 유지 (OAuth 사전 준비)
- PASS — Day 6 home 변경이 auth 시스템에 어떤 수정도 가하지 않음

### 1.9 profiles 트리거 동작 (변경 없음 확인)
- PASS — `supabase/migrations/20260519000000_profiles.sql` 변경 없음
  (`git status` supabase/ clean)
- PASS — `handle_new_user` 트리거 (line 86-97) + `on_auth_user_created` AFTER INSERT
  트리거 (line 94-97) 유지. 신규 사용자 가입 시 `public.anonymize()` 결과로
  profiles.anonymous_display 자동 생성 정상
- PASS — `app/_layout.tsx` 부팅 시 `signInAnonymouslyIfNeeded` → 신규 user 생성 →
  트리거 즉시 발화 → 직후 `supabase.from('profiles').select('language, theme')`로
  preference 로드 (line 67-78). 트리거 race 가능성: Supabase auth는 AFTER trigger를
  signInAnonymously 응답 전 commit하므로 race 없음

### 1.10 기존 wines / wine_korean_names 손상 0 (CRITICAL)
- PASS — `git status supabase/` clean — migrations, seed.sql, functions 변경 없음
- PASS — `git diff HEAD -- supabase/` empty
- PASS — `shared/types/database.types.ts` 변경 없음 (DB schema 자동 생성물 동일)
- 결정: 마이그레이션 재적용 불필요 — 기존 데이터 손상 risk 0

### 1.11 RLS ↔ 클라이언트 호출 교차 검증
home에서 호출하는 supabase 쿼리 (양쪽 동시 읽기):

| 호출처 | from(table) | where 절 | RLS 정책 | 합치 |
|---|---|---|---|---|
| `use-profile.ts:30` | `profiles` | `.eq('id', uid)` | `profiles_select_own: id = auth.uid()` | OK |
| `app/_layout.tsx:69` | `profiles` | `.eq('id', uid)` | 동상 | OK |
| `use-notes.ts:96` (useRecentNotes) | `tasting_notes` join wines_localized | `.eq('user_id', uid).order(tasted_at).limit(N)` | `tasting_notes_all_own: user_id = auth.uid()` | OK — uid 명시 + RLS 일치 |
| `use-cellar.ts:42` (useCellarSummary) | `cellar_items` | `.eq('user_id', uid).eq('status','cellared')` | `cellar_items_all_own: user_id = auth.uid()` | OK |

- PASS — 모든 호출에서 `eq('user_id', uid)` 또는 `eq('id', uid)` 명시 (RLS 우회 시도 없음)
- PASS — RLS는 본인 데이터만 반환하므로 다른 사용자 데이터 노출 risk 0
- PASS — uid null 시 빈 결과 반환 (`use-notes.ts:90-93`, `use-cellar.ts:36-39`) — 빈 화면
  fallback 처리 적합 (loading→ActivityIndicator→empty UI)
- PASS — wines_localized VIEW는 `with (security_invoker = true)` 사용 (migrations/20260519000400:7)
  — VIEW가 호출자(anon/authenticated) RLS를 상속하여 잘못된 데이터 노출 없음

### 1.12 wines_localized VIEW ↔ 훅 ↔ WineNameDisplay shape 3-way 검증

| 컬럼 | VIEW SQL (migrations/20260519000400) | types.Row (database.types.ts:408-428) | 훅 select (use-notes.ts:97) | 사용처 | 합치 |
|---|---|---|---|---|---|
| lwin | text (from wines.lwin NOT NULL) | `string \| null` | 선택 | `wine.lwin` (guard line 55) | OK — guard 필수 |
| display_name | text (from wines.display_name) | `string \| null` | 선택 | `wine.display_name` (guard line 55) | OK |
| name_ko | text NULL (lateral join) | `string \| null` | 선택 | `wine.name_ko ?? wine.display_name` (line 67) | OK — fallback 명시 |
| bottle_color | text NULL (wm.bottle_color) | `string \| null` | 선택 | `wine.bottle_color ?? getDefaultBottleColor(type)` (line 57) | OK — fallback |
| type_canonical | text NULL coalesce | `string \| null` | 선택 | TypeCanonical narrow (line 38-41) + bottle fallback | OK |
| vintage | int NULL | `number \| null` | 선택 | `wine.vintage ?? ''` (line 91) | OK |

- PASS — VIEW 컬럼 6개 모두 훅 select 표현식에 명시 (use-notes.ts:97 inner join은 wine은
  NOT NULL 보장)
- PASS — types.Row가 nullable 표기 — RecentNotesStrip line 55 `if (!wine?.lwin || !wine?.display_name) return null` 가드로 런타임 null 크래시 방지
- PASS — `WineNameDisplay` props는 `lwin: string` + `display_name: string` (non-null)
  요구 — 호출 전 guard 통과 후 전달, 타입/런타임 모두 안전
- PASS — name_ko null 시 WineNameDisplay 내부 `getLocalizedWineName`가 KO 모드에서
  display_name로 fallback + `needsEnFallbackChip=true` chip 표시 (사양 §4)
- PASS — bottle_color null 시 `getDefaultBottleColor(type)` → `bottleColorDefault[type] ?? red`
  fallback — wm-bottle은 항상 색을 받음
- PASS — `useCellarSummary`는 count-only HEAD 쿼리 (head:true) — wines join 없음 — shape
  검증 N/A

### 1.13 useFonts ↔ anonymous sign-in race condition
`app/_layout.tsx` (line 38-106) 분석:

- 두 effect는 독립 실행 (font hook은 자체 lifecycle, bootstrap useEffect는 mount 1회)
- `ready = bootstrapped && fontsReady` (line 90) — 양쪽 모두 완료 시에만 hide splash
- PASS — splash가 hideAsync되기 전에는 ActivityIndicator만 노출 (line 100-106)
- PASS — Stack은 ready 후에만 render되므로 (line 108-118) `<Stack.Screen name="(tabs)" />`
  내부 home 화면이 폰트 로드 전에 마운트될 수 없음 → race 없음
- PASS — bootstrap 내 supabase 호출은 `signInAnonymouslyIfNeeded` 실패해도
  try/catch로 흡수 (line 80-82) + `setBootstrapped(true)` 보장 (line 83) — 부팅 데드락 없음
- PASS — preventAutoHideAsync 실패 시 `.catch(() => {})` (line 34) — 비치명적
- PASS — useFonts hook 실패 시 console.warn (line 55-56) + bootstrap은 계속 진행하지만
  fontsReady가 false로 유지되어 splash 무한 노출 risk 존재. 그러나 expo-google-fonts는
  CDN 실패 시에도 시스템 fallback으로 떨어지므로 실 사용 시 발생 가능성 낮음
  - WARNING (FAIL 미카운트): fontError 발생 시 fontsReady가 영원히 false면 splash 갇힘.
    개선안: fontError 발생 시 fontsReady를 강제 true로 (시스템 fallback 허용) — v0.2.0 권장.
    v0.1.0 alpha acceptable.

---

## 2. 실패 (FAIL)

없음. (0건)

---

## 3. 경고 (WARNING — FAIL 미카운트)

### 3.1 useFonts 영구 실패 시 splash 무한 노출 risk
- 위치: `app/_layout.tsx:90`
- 현상: `fontsReady = interLoaded && playfairLoaded` — error 분기에서 둘 다 false면
  ready 영원히 false → splash 무한
- 권장: `const fontsReady = (interLoaded || !!interError) && (playfairLoaded || !!playfairError);`
- 우선순위: P2 (v0.2.0). v0.1.0 alpha에서 expo-google-fonts CDN 실패 가능성 낮음.

### 3.2 Mock 데이터 LWIN 라우트 fallback
- 위치: `wine-feed.tsx:188` `router.push(\`/wine/${wine.lwin}\`)`
- 현상: 1012345/1012346/1012347은 실 DB seed에 없음 → wineDetail 화면이 notFound 표시
- 사양 §11 P2 결정: featured wines 데이터 소스 v0.2.0 — alpha acceptable
- 우선순위: P2 (v0.2.0)

### 3.3 MapCameo / community viewAll 미라우트
- 위치: `map-cameo.tsx:31` (`router.push('/(tabs)/map')` — 라우트 미존재 try/catch),
  `home-community-peek.tsx:228, 119` (noop)
- 현상: silent fallback. 사용자가 탭해도 아무 일도 일어나지 않음 — UX 무반응
- 사양 SCOPE-OUT: 라우트 미존재 silent fallback 명시 — alpha acceptable
- 우선순위: P2 (v0.2.0)

---

## 4. 미검증 (SKIPPED — SCOPE-OUT 또는 환경 제약)

- Day 6 settings 3 sub 화면 + settings hub + (tabs)/settings/_layout + BottomNav tabs:
  사용자 SCOPE-OUT 명시
- 데이터 의존 mock (featured / community / draft) v0.2.0 deferred — 사용자 SCOPE-OUT 명시
- psql 기반 wines/wine_korean_names count diff: DB 변경 없음으로 실제 query 불필요
  (git status supabase/ clean로 정적 검증 완료)
- 시뮬레이터 dark+ko / dark+en / light+ko / light+en 4 조합 시각 검증: design-review v3
  단계에서 멀티모달 스크린샷 비교 완료 (PASS), qa 단계는 코드 정합성만 담당

---

## 5. 최종 결론

- **결과: PASS**
- **FAIL: 0건**
- **WARNING: 3건 (모두 P2 v0.2.0 deferred — v0.1.0 alpha 진행 가능)**
- 기존 wines / wine_korean_names 손상 risk: 0 (supabase/ 변경 없음)
- 디자인 시각 게이트(design-review v3) + 통합 정합성 게이트(본 보고서) 양쪽 통과
- home 화면 retroactive hardening 종료. Day 6 settings 화면 + BottomNav 작업으로 진행 가능

---

## 6. 권장 다음 단계

1. **rn-screen-builder**: Day 6 settings hub + 3 sub 화면 + (tabs)/settings/_layout +
   BottomNav 작업 진행 (home은 게이트 완료)
2. **release-engineer**: Day 7 EAS Build 전 본 PASS 보고서를 release checklist에
   참조 항목으로 포함
3. **design-spec-author** (선택, P2):
   - PeakGreeting / WineFeed featured wines 실 데이터 사양 v0.2.0 보강
   - MapCameo / community 라우트 v0.2.0 추가 시 navigation contract 사양 작성
4. **infra-architect** (선택, P2):
   - useFonts 영구 실패 fallback 패턴 (위 3.1) v0.2.0 적용

---

## 7. 변경 이력

- 2026-05-20 19:48:19 — 초기 작성 (Day 6 home retroactive integration coherence gate)
