# winemine-app — RN + Expo + Supabase (1-repo monorepo)

> winemine 모바일 앱 + 백엔드(Supabase). **Full Supabase 아키텍처**로 1 레포에서 모든 개발.
> Phase 3: 2026-05 · Phase 2 시안: `../winemine-keyscreen/` (frozen, read-only)
> v0.1.0 목표: Internal Alpha (1주, 스토어 심사용)

---

## 0. 정체성

winemine 사용자가 쓰는 모바일 앱 + 백엔드(Supabase) 설정을 **단일 레포**에 통합.

- **클라이언트**: React Native + Expo + TypeScript strict
- **백엔드**: Supabase 전체 (Postgres + PostgREST + Auth + Storage + Edge Functions)
- **API contract**: Supabase schema = 진실 소스 (`supabase gen types`로 TS 자동)
- **호스팅**: Supabase 자체. 별도 서버 X
- **운영 비용**: Supabase Free plan (~$0/월, MAU 50k까지)

> **아키텍처 변경 이력**: 2026-05-19 Option B(Spring+Supabase+Fly.io) → 같은 날 Plan D(Full Supabase 1-repo) 재결정. 6개월 후 결제 도입 시점에 Spring 전환 검토 — [docs/V2_MIGRATION_CHECKLIST.md](./docs/V2_MIGRATION_CHECKLIST.md).

---

## 1. 레포 구조

```
winemine-app/
├── app/  또는 src/                React Native + Expo (TS)
├── supabase/                       Supabase CLI 표준
│   ├── migrations/                 SQL schema (Flyway 같은 거)
│   ├── functions/                  Edge Functions (TS/Deno)
│   ├── seed.sql                    초기 와인 카탈로그
│   └── config.toml
├── shared/types/database.types.ts  supabase gen types 산출물
├── docs/                           이 레포 docs (Quick Reference §8 참조)
│   ├── {SUPABASE_PATTERNS, THEME_VERIFICATION, COMMANDS, TBD, V2_MIGRATION_CHECKLIST}.md
│   └── spec/spec-writer-prompt.md  /project-spec-writer 입력
├── specs/                          submodule → winemine-specs (도메인 docs)
├── .gitignore
└── CLAUDE.md                       ← 이 파일
```

---

## 2. 핵심 의존

### `specs/` (submodule)

`github.com/rocher71/winemine-specs.git` → `specs/`에 마운트.

**Plan D에서 specs의 역할**:
- ~~`specs/api/openapi.yaml`~~ — Plan D에서 의미 약함 (Supabase schema가 진실)
- `specs/api/CONVENTIONS.md` — **Edge Functions에만 적용** (PostgREST는 Supabase 표준)
- `specs/domain/` — 핵심 가치: glossary, policies(anonymization 등), design-tokens, wine-research submodule

submodule 갱신: `git submodule update --remote specs && git add specs && git commit`. 자세히는 [docs/COMMANDS.md](./docs/COMMANDS.md).

### `../winemine-keyscreen/` (sibling, read-only)

Phase 2 시안. UI/UX·도메인 로직 변환 input.

| 자료 | 용도 |
|---|---|
| `pages/{route}.md` (39개) | 화면별 변환 명세 |
| `FEATURES.md` | 전체 시스템 개요 |
| `src/` | React 원본 (RN 변환 reference) |
| `src/lib/mock/*.ts` | DB schema 설계 input |
| `src/lib/{community-peak-aggregator,drink-window,xp,compatibility}.ts` | Edge Function/SQL 변환 base |
| `docs/design-system/` | 색·타이포·컴포넌트 토큰 |

**read-only — 절대 수정 X.**

---

## 3. Supabase 통합 패턴

[docs/SUPABASE_PATTERNS.md](./docs/SUPABASE_PATTERNS.md) — Auth(익명) / DB(PostgREST) / Storage / Edge Functions / 환경변수 / RLS 정책 / TS 타입 자동 생성 코드 예시.

**핵심만**:
- Auth: `supabase.auth.signInAnonymously()` → JWT 자동 persist
- DB: `supabase.from('table').select()` (RLS로 권한 강제)
- 환경변수: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`만 RN에 (절대 `SERVICE_ROLE_KEY` X)

---

## 4. 절대 금지 규칙

### 4-1. emoji 사용 금지
코드·docs·SQL·UI 모두. 점검: [docs/COMMANDS.md §점검](./docs/COMMANDS.md).

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
- 정책 작성 후 SQL 단위 테스트 (A의 노트를 B가 못 보는지)
- `SUPABASE_SERVICE_ROLE_KEY` 사용은 Edge Functions admin 작업만 (RN 절대 X)

### 4-7. 시크릿 관리
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `WINEMINE_ANONYMIZATION_SALT` → **Supabase Dashboard Secrets만**
- 코드·`.env` commit 금지 (`.gitignore` 처리)
- `EXPO_PUBLIC_*` 접두사는 RN 번들 포함 — public 키만

### 4-8. 6개월간 TS code 작게 유지 (Plan D 전제)
v2.0 Spring 전환 비용 폭증 방지:
- 비즈니스 로직 **80%는 SQL 함수 / RLS**에
- Edge Functions은 **외부 API wrapper만** (라벨 인식 외부 호출 등)
- 의식적으로 얇게 유지

### 4-9. 테마(다크/라이트) 변경 시 양쪽 모드 검증 필수
색·간격·컴포넌트 스타일 변경 시 한쪽 모드만 보고 끝내지 말 것. 상세 규칙·점검 명령·학습 배경: [docs/THEME_VERIFICATION.md](./docs/THEME_VERIFICATION.md).

핵심: 하드코딩 hex 금지 / 토큰 dual definition / Expo dev에서 양쪽 토글 검증.

---

## 5. AI(Claude Code) 협업 지침

### 할 일
- 키스크린 화면을 RN+Expo 컴포넌트로 변환
- Supabase migration SQL 작성 (테이블 + RLS 정책)
- `supabase gen types` 후 TS 타입 import
- Edge Functions 작성 (필요 최소한)
- 익명화 유틸 (`specs/domain/policies/anonymization.md` 참조)
- 정책 위반 점검 (emoji, locale 누락, RLS 우회, 익명화 누락)
- **테마 변경 시 양쪽 모드 검증** (§4-9)

### 하면 안 되는 것
- `specs/` 또는 `../winemine-keyscreen/` 수정
- 정책 임의 변경 (XP·익명화 등은 specs/domain/policies/)
- `SUPABASE_SERVICE_ROLE_KEY`를 RN 코드에 import
- RLS 비활성 테이블 생성
- 시크릿·hex 색 하드코딩
- Edge Functions에 비즈니스 로직 over-engineering (§4-8)
- 테마 한쪽만 보고 스타일 commit (§4-9)

### 컨텍스트 흐름
1. 화면 변환 → 키스크린 명세(`../winemine-keyscreen/pages/{route}.md`) + React 구현 동시 참조
2. DB 데이터 → `supabase.from('table').select()` (타입은 `shared/types/database.types.ts`)
3. 도메인 결정 → `specs/domain/` 안 문서 우선
4. 정책 모호 → 사용자에게 질문 (임의 결정 X)

---

## 6. 결정 사항 (Plan D 확정 2026-05-19)

| 항목 | 결정 |
|---|---|
| 아키텍처 | Full Supabase 1-repo |
| DB / Auth / Storage / Edge Functions | Supabase (Free plan) |
| API contract | Supabase schema (PostgREST auto) |
| 호스팅 | Supabase 자체 |
| 클라이언트 SDK | @supabase/supabase-js + Expo AsyncStorage adapter |
| 사용자 ID | Supabase UUID (DB) → 익명화 변환 (UI) |

남은 라이브러리·도구 결정: [docs/TBD.md](./docs/TBD.md).

---

## 7. 서비스 컨텍스트

**winemine** — 와인 라벨 촬영 → AI 인식 → 세계 지도 시각화 → 노트 작성 모바일 앱.

- 사용자 모드: `first-time` ↔ `heavy`
- 경험 수준: `beginner` ↔ `expert`
- 언어: 한국어 ↔ English (LocalizedString)
- 테마: 다크(와인 바) ↔ 라이트(화이트 와인)
- 5단계 레벨: 입문자 / 애호가 / 감식가 / 소믈리에 / 마스터

---

## 8. Quick Reference

| 작업 / 궁금증 | 어디 보면 됨 |
|---|---|
| Supabase 코드 패턴 (Auth·DB·Storage·Edge Functions·RLS) | [docs/SUPABASE_PATTERNS.md](./docs/SUPABASE_PATTERNS.md) |
| 테마 dual-mode 검증 규칙 | [docs/THEME_VERIFICATION.md](./docs/THEME_VERIFICATION.md) |
| 자주 쓰는 명령 (Supabase CLI / Expo / EAS / git) | [docs/COMMANDS.md](./docs/COMMANDS.md) |
| 라이브러리 결정 필요 항목 | [docs/TBD.md](./docs/TBD.md) |
| v2.0 Spring 전환 절차 | [docs/V2_MIGRATION_CHECKLIST.md](./docs/V2_MIGRATION_CHECKLIST.md) |
| spec writer 프롬프트 | [docs/spec/spec-writer-prompt.md](./docs/spec/spec-writer-prompt.md) |
| 화면별 변환 명세 (39개) | `../winemine-keyscreen/pages/{route}.md` |
| Phase 2 전체 개요 | `../winemine-keyscreen/FEATURES.md` |
| 색·타이포·컴포넌트 디자인 시스템 | `../winemine-keyscreen/docs/design-system/{colors,typography,components}.md` |
| 비즈니스 로직 reference (Phase 2 lib) | `../winemine-keyscreen/src/lib/{community-peak-aggregator,drink-window,xp,compatibility}.ts` |
| 익명화 정책 | `specs/domain/policies/anonymization.md` |
| 와인 도메인 리서치 | `specs/domain/wine-research/_workspace/` |
| Phase 3 master plan (참고용 — Plan D와 일부 다름) | `specs/domain/wine-research/site/src/content/docs/misc/70-76*.md` |
| Supabase 공식 docs | https://supabase.com/docs |
| Expo 공식 docs | https://docs.expo.dev |

---

## 9. 하네스: winemine v0.1.0 빌드 팀

**목표:** Plan D (Full Supabase 1-repo) 기준 v0.1.0 Internal Alpha를 1주 안에 빌드. 5명 에이전트 팀(infra-architect / supabase-engineer / rn-screen-builder / qa-inspector / release-engineer)으로 인프라 + 6개 마이그레이션 + Edge Function + 12 화면 + 통합 정합성 검증 + EAS Build를 Day 1~7에 진행.

**트리거:** v0.1.0 빌드·구현·개발·Day N 작업 요청 시 `winemine-build` 스킬 사용. 후속(부분 재실행, Day N 다시, 마이그레이션 수정, 빌드 다시, QA 다시, 이전 결과 개선) 요청도 동일. 단순 질문은 직접 응답.

**스펙:** [docs/spec/v0.1.0.md](./docs/spec/v0.1.0.md) (1100+ 줄, 모든 결정 포함)

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|---|---|---|---|
| 2026-05-19 | 초기 구성 (5 agents + 7 skills) | 전체 | v0.1.0 빌드 시작 |
