# winemine-app — RN + Expo + Supabase (1-repo monorepo)

> winemine 모바일 앱 + 백엔드(Supabase). **Full Supabase 아키텍처**로 1 레포에서 모든 개발.
> Phase 3 시작: 2026-05 · Phase 2 시안 reference: `../winemine-keyscreen/` (frozen)
> v0.1.0 목표: Internal Alpha (1주, 스토어 심사 올리기용)

---

## 0. 이 레포의 정체성

winemine 사용자가 쓰는 모바일 앱 + 백엔드(Supabase) 설정을 **단일 레포**에 통합.

- **클라이언트**: React Native + Expo + TypeScript (strict)
- **백엔드**: Supabase
  - Postgres (DB)
  - PostgREST (자동 REST API)
  - Auth (anonymous + JWT)
  - Storage (라벨 사진)
  - Edge Functions (TypeScript/Deno) — 라벨 인식 등 커스텀 로직
- **API contract**: Supabase schema = 진실 소스. `supabase gen types`로 TS 자동 생성
- **호스팅**: Supabase가 다 host. 별도 서버 X
- **운영 비용**: Supabase Free plan (~$0/월, MAU 50k까지)

> **아키텍처 변경 이력**: 2026-05-19 처음 Option B (Spring+Supabase+Fly.io) 결정 → 같은 날 Plan D (Full Supabase 1-repo)로 재결정. 사유: 1주 Internal Alpha 우선, 6개월간 결제 없음, 결제 도입 시점에 Spring 전환 검토.

---

## 1. 레포 구조

```
winemine-app/
├── app/  또는 src/                React Native + Expo (TS)
│   ├── (tabs)/
│   ├── components/
│   ├── lib/
│   └── ...
├── supabase/                       Supabase CLI 표준 디렉토리
│   ├── migrations/                 SQL schema 변경 (Flyway 같은 거)
│   │   └── 20260519000000_init.sql
│   ├── functions/                  Edge Functions (TS/Deno)
│   │   └── label-scan/
│   │       └── index.ts
│   ├── seed.sql                    초기 시드 데이터 (와인 카탈로그 등)
│   └── config.toml                 Supabase 프로젝트 설정
├── shared/
│   └── types/
│       └── database.types.ts       Supabase가 schema → TS 자동 생성
├── docs/spec/                      spec writer 산출물
│   └── spec-writer-prompt.md
├── specs/                          submodule → winemine-specs (domain/* 참조용)
└── CLAUDE.md                       ← 이 파일
```

---

## 2. 핵심 의존

### `specs/` (submodule)

`https://github.com/rocher71/winemine-specs.git` → `specs/`에 마운트.

**Plan D에서 specs의 역할 변화**:
- ~~`specs/api/openapi.yaml`~~ — Supabase가 schema에서 자동 생성, 우리 yaml은 의미 약해짐
- `specs/api/CONVENTIONS.md` — **Edge Functions와 customized API에만 적용**. PostgREST 자동 endpoint는 Supabase 표준 따름
- `specs/domain/` — **여전히 가치 큼**: glossary, policies(anonymization 등), design-tokens, wine-research submodule
- 변경 시:
  ```bash
  git submodule update --remote specs
  git add specs
  git commit -m "chore: bump specs to <SHA>"
  ```

### `../winemine-keyscreen/` (sibling, read-only)

Phase 2 시안. UI/UX·도메인 로직 변환 input.

| 자료 | 용도 |
|---|---|
| `pages/{route}.md` (39개) | 화면별 변환 명세 (UX behavior) |
| `FEATURES.md` | 전체 시스템 개요 |
| `src/` | React 원본 (RN 변환 reference) |
| `src/lib/mock/*.ts` | DB schema 설계 input |
| `src/lib/{community-peak-aggregator,drink-window,xp,compatibility}.ts` | Edge Function 변환 base |
| `docs/design-system/` | 색·타이포·컴포넌트 토큰 |

**read-only — 절대 수정 X.**

---

## 3. Supabase 통합 패턴

### Auth 흐름 (익명 우선)

```typescript
// app 진입 시
const { data } = await supabase.auth.signInAnonymously();
// → JWT 발급, AsyncStorage에 자동 persist
// → 이후 모든 PostgREST/Edge Functions 호출에 Bearer 자동 첨부
```

### DB 접근

```typescript
// PostgREST 자동 endpoint
const { data: wines } = await supabase
  .from('wines')
  .select('*')
  .range(0, 19);  // pagination

// RLS가 권한 강제 — 본인 노트만 조회 가능
const { data: notes } = await supabase
  .from('tasting_notes')
  .select('*')
  .order('tasted_at', { ascending: false });
```

### Storage (라벨 사진)

```typescript
const { data } = await supabase.storage
  .from('label-photos')
  .upload(`${user.id}/${Date.now()}.jpg`, file);
```

### Edge Functions (커스텀 로직)

```typescript
// supabase/functions/label-scan/index.ts (Deno)
import { serve } from 'https://deno.land/std/http/server.ts';
serve(async (req) => {
  // 라벨 인식 로직
  return new Response(JSON.stringify({ wine_id: '...' }));
});

// 클라이언트 호출
const { data } = await supabase.functions.invoke('label-scan', {
  body: { photo_url: '...' }
});
```

### 환경변수

- `EXPO_PUBLIC_SUPABASE_URL` — `https://<project>.supabase.co` (public OK, RN 번들 포함 가능)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — public anon key (RN 번들 포함 가능)
- **절대 금지**: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` — server-only. Edge Functions의 `Deno.env`로만 접근. RN 번들 절대 X

---

## 4. 절대 금지 규칙

### 4-1. emoji 사용 금지

```bash
grep -rP "[\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\x{1F900}-\\x{1F9FF}]" \
  --include='*.tsx' --include='*.ts' --include='*.sql' --include='*.md' .
```

### 4-2. `specs/` 직접 수정 금지
submodule, read-only. 변경은 winemine-specs 본 레포에서 PR.

### 4-3. `../winemine-keyscreen/` 수정 금지
Phase 2 frozen.

### 4-4. 한쪽 locale 누락 금지
사용자 노출 텍스트는 `{ ko, en }` 양쪽 채움. 영어 모드에서 한글 한 글자도 노출 X.

### 4-5. 사용자 ID 공개 노출 금지
Supabase UUID는 DB·내부에만. UI 표시 시 익명화 패턴 (`velvety-fox-37`). `specs/domain/policies/anonymization.md`.

### 4-6. RLS 정책 우회 금지
- 모든 사용자 데이터 테이블에 **RLS enabled** 필수
- 정책 작성 후 반드시 SQL 단위 테스트 (사용자 A의 노트를 사용자 B가 못 보는지 검증)
- `SUPABASE_SERVICE_ROLE_KEY` 사용은 Edge Functions의 admin 작업에만 (RN 절대 X)

### 4-7. 시크릿 관리
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `WINEMINE_ANONYMIZATION_SALT` 등은 **Supabase Dashboard → Edge Functions → Secrets**에만 설정
- 코드 commit 금지, `.env` 금지 (또는 `.gitignore`)
- `EXPO_PUBLIC_*` 접두사는 RN 번들 포함됨 — public 키만 사용

### 4-8. 6개월간 TS code 작게 유지 (Plan D 전제)

6개월 후 Spring 전환 가능성을 위해:
- 비즈니스 로직 **80%는 SQL 함수 / RLS**에 (`supabase/migrations/*.sql`)
- Edge Functions은 **외부 API wrapper만** (라벨 인식 외부 호출 등)
- "Edge Functions이 점점 두꺼워지면 전환 비용 폭증" — 의식적으로 얇게 유지

### 4-9. 테마(다크/라이트) 변경 시 반대 모드 영향 점검 필수

색·간격·컴포넌트 스타일 변경 시 한쪽 모드만 보고 끝내지 말 것. 반드시 양쪽 모두 검증.

**규칙**:
1. **변경하려는 모드 토큰만 수정** — 다른 모드 토큰 실수로 건드리지 않기
2. **하드코딩 hex 금지** — 항상 토큰 변수(`colors.wineRed.dark` / `colors.wineRed.light` 또는 테마 hook) 사용
3. **양쪽 모드 토글 후 시각 확인** — Expo dev에서 settings 토글로 둘 다 확인
4. **컴포넌트 추가 시 양쪽 모드 모두 의도대로 보이는가 확인** (대비, 가독성, 강조)
5. **각 토큰은 dual definition 필수** — `{ dark, light }` 양쪽 채움. 한쪽만 정의된 토큰 금지

**점검 명령**:
```bash
# 하드코딩 hex 색 검출 (토큰 거치지 않는 색 사용)
grep -rnE "#[0-9a-fA-F]{3,6}" --include='*.tsx' --include='*.ts' src/ app/ \
  | grep -v "tokens\|theme\|// " | head
# (hex가 나오면 거의 다 토큰화 대상)
```

**학습 배경**: 키스크린(Phase 2) 단계에서 다크 기준으로만 작업하다 라이트모드 지도 색상 가독성 깨진 사고 발생 (commit `2fc3ac6` 사후 수정). 토큰 dual definition + 양쪽 검증 디스시플린으로 재발 방지.

**관련 참조**:
- `specs/domain/design-tokens/` — 토큰 정의 (md + tokens.json + tokens.css)
- `../winemine-keyscreen/docs/design-system/colors.md` — 키스크린 색 팔레트 (다크/라이트 dual)

---

## 5. AI(Claude Code) 협업 지침

### 할 일
- 키스크린 화면을 RN+Expo 컴포넌트로 변환
- Supabase migration SQL 작성 (테이블 + RLS 정책)
- `supabase gen types` 후 TS 타입 import
- Edge Functions 작성 (필요 최소한)
- 익명화 유틸 (HMAC-SHA256 → adjective-noun-number) — `specs/domain/policies/anonymization.md` 참조
- 정책 위반 점검 (emoji, locale 누락, RLS 우회, 익명화 누락)
- **테마 변경 시 양쪽 모드(다크/라이트) 모두 검증** — §4-9

### 하면 안 되는 것
- `specs/` 안 파일 수정
- `../winemine-keyscreen/` 안 파일 수정
- 정책 임의 변경 (XP·익명화 등은 specs/domain/policies/ 정의)
- `SUPABASE_SERVICE_ROLE_KEY`를 RN 코드에 import
- RLS 비활성 테이블 생성 (모든 사용자 데이터 테이블 필수)
- 시크릿 하드코딩
- Edge Functions에 비즈니스 로직 over-engineering (Plan D 전제 §4-8)
- **테마 한쪽만 보고 스타일 변경** — 반대 모드 검증 안 한 채 commit (§4-9)
- **컴포넌트 색·간격 hex 하드코딩** — 항상 토큰 변수 사용 (§4-9)

### 컨텍스트 흐름
1. 화면 변환 시 → 키스크린 명세(`../winemine-keyscreen/pages/{route}.md`) + 키스크린 구현 동시 참조
2. DB 데이터 → `supabase.from('table').select()` (TS 타입은 `shared/types/database.types.ts`)
3. 도메인 결정 → `specs/domain/` 안 문서 우선
4. 정책 모호 → 사용자에게 질문 (임의 결정 X)

---

## 6. 결정 사항 (Plan D 확정 2026-05-19)

| 항목 | 결정 |
|---|---|
| 아키텍처 | **Full Supabase 1-repo** (RN+Expo + supabase/) |
| DB | Supabase Postgres (Free plan) |
| Auth | Supabase Auth (anonymous + JWT) |
| Storage | Supabase Storage |
| Backend custom 로직 | Edge Functions (TS/Deno) — **최소화** |
| API contract | Supabase schema 자체 (PostgREST auto-spec) |
| 호스팅 | Supabase 자체 (Edge Functions + Postgres) |
| 클라이언트 SDK | @supabase/supabase-js (Expo용 AsyncStorage adapter) |
| 사용자 ID | Supabase UUID (DB) → 익명화 변환 (UI) |

---

## 7. 결정 필요 (TBD)

| 항목 | 옵션 |
|---|---|
| Navigation | Expo Router (권장) vs React Navigation |
| 스타일링 | NativeWind vs StyleSheet vs styled-components |
| 상태 관리 | Zustand vs Jotai vs Redux Toolkit |
| 네트워크 | Supabase client 직접 vs TanStack Query wrapper |
| 아이콘 | lucide-react-native (권장) vs @expo/vector-icons |
| i18n | i18next vs lingui vs format.js |
| 지도 | react-native-maps vs MapLibre GL vs Mapbox |
| 차트 | Victory Native vs react-native-svg + 직접 |
| 환경변수 | expo-constants (권장) vs react-native-config |
| Expo SDK 버전 | 51+ 권장 |
| Edge Functions 테스트 | Deno test (built-in, 권장) |
| RN 테스트 | Jest + React Native Testing Library |
| DB 테스트 | Supabase CLI local + SQL 단위 테스트 |

---

## 8. 서비스 컨텍스트

**winemine** — 와인 라벨 촬영 → AI 인식 → 세계 지도 시각화 → 노트 작성 모바일 앱.

- 사용자 모드: `first-time` ↔ `heavy`
- 경험 수준: `beginner` ↔ `expert`
- 언어: 한국어 ↔ English (LocalizedString)
- 5단계 레벨: 입문자 / 애호가 / 감식가 / 소믈리에 / 마스터

---

## 9. Quick Reference

| 작업 / 궁금증 | 어디 보면 됨 |
|---|---|
| 화면별 변환 명세 | `../winemine-keyscreen/pages/{route}.md` |
| Phase 2 전체 개요 | `../winemine-keyscreen/FEATURES.md` |
| mock 데이터 (schema 설계 input) | `../winemine-keyscreen/src/lib/mock/*.ts` |
| 비즈니스 로직 reference | `../winemine-keyscreen/src/lib/{community-peak-aggregator,drink-window,xp,compatibility}.ts` |
| 색 팔레트·CSS 변수 | `../winemine-keyscreen/docs/design-system/colors.md` |
| 타이포 | `../winemine-keyscreen/docs/design-system/typography.md` |
| 컴포넌트별 스펙 | `../winemine-keyscreen/docs/design-system/components.md` |
| 익명화 정책 | `specs/domain/policies/anonymization.md` |
| 용어 사전 | `specs/domain/glossary/` |
| 와인 도메인 리서치 | `specs/domain/wine-research/_workspace/` |
| Phase 3 master plan (참고용, Plan D와 일부 다름) | `specs/domain/wine-research/site/src/content/docs/misc/70-76*.md` |
| Supabase 공식 docs | https://supabase.com/docs |
| Expo 공식 docs | https://docs.expo.dev |

---

## 10. 자주 쓰는 명령

```bash
# Supabase CLI 셋업
npm i -g supabase
supabase init
supabase login
supabase link --project-ref <project-ref>

# 로컬 DB 띄우기 (Docker)
supabase start

# Migration 생성
supabase migration new <description>

# Migration 적용 (로컬)
supabase db reset

# 원격 push (production schema 변경)
supabase db push

# TS 타입 자동 생성
supabase gen types typescript --linked > shared/types/database.types.ts

# Edge Function 새로 만들기
supabase functions new <name>

# Edge Function 배포
supabase functions deploy <name>

# Expo 개발
npx expo start

# specs submodule 갱신
git submodule update --remote specs
git add specs && git commit -m "chore: bump specs to <SHA>"
```

---

## 11. 6개월 후 Spring 전환 시 체크리스트 (Plan D → v2.0)

전환 시점이 되면 다음 순서로:

- [ ] `~/dev/winemine-server` GitHub repo unarchive
- [ ] Spring Boot 프로젝트 setup (Spring Initializr, Gradle, JPA, Flyway, Security)
- [ ] Supabase Postgres에 Spring이 JDBC 연결 (DB schema 그대로)
- [ ] Flyway baseline 설정 (기존 supabase migrations을 baseline으로 등록)
- [ ] Supabase JWT 검증 Spring Security Filter
- [ ] 결제 endpoint부터 Spring으로 이전 (PostgREST endpoint 일부 deprecate)
- [ ] 점진적으로 다른 endpoint 이전 (한 번에 다 안 옮김)
- [ ] Fly.io 배포
- [ ] app의 base URL 분기 (일부는 Supabase 직접, 일부는 Spring)

상세는 v2.0 시점에 spec writer 다시 돌려서 작성.
