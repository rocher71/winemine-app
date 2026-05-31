# winemine-app — RN + Expo + Supabase (1-repo monorepo)

> winemine 모바일 앱 + 백엔드(Supabase). **Full Supabase 아키텍처(Plan D)** 로 1 레포에서 모든 개발.
> Phase 3: 2026-05 · Phase 2 시안: `../winemine-keyscreen/` (frozen, read-only)
> v0.1.0 목표: Internal Alpha (1주, 스토어 심사용)

---

## 0. 정체성

winemine 사용자 모바일 앱 + 백엔드(Supabase)를 **단일 레포**에 통합.

- **클라이언트**: React Native + Expo + TypeScript strict
- **백엔드**: Supabase 전체 (Postgres + PostgREST + Auth + Storage + Edge Functions)
- **API contract**: Supabase schema = 진실 소스 (`supabase gen types`로 TS 자동)
- **호스팅**: Supabase 자체 · **비용**: Free plan (~$0/월, MAU 50k까지)

---

## 1. 레포 구조

```
winemine-app/
├── app/ 또는 src/                  React Native + Expo (TS)
├── supabase/{migrations,functions,seed.sql,config.toml}   Supabase CLI 표준
├── shared/types/database.types.ts  supabase gen types 산출물
├── docs/                           이 레포 docs (§8 Quick Reference)
├── specs/                          submodule → winemine-specs (도메인 docs)
└── CLAUDE.md                       ← 이 파일
```

---

## 2. 핵심 의존

- **`specs/`** (submodule, read-only) — `github.com/rocher71/winemine-specs.git`. `specs/api/CONVENTIONS.md`는 Edge Functions에만 적용, `specs/domain/`(glossary·policies·design-tokens·wine-research)가 핵심. 갱신 명령: [docs/COMMANDS.md](./docs/COMMANDS.md).
- **`../winemine-keyscreen/`** (sibling, read-only, **수정 X**) — Phase 2 시안. `pages/{route}.md`(39개 화면 명세) · `FEATURES.md`(개요) · `src/`(React 원본) · `src/lib/*`(DB schema·Edge Function 변환 base) · `docs/design-system/`(토큰).

---

## 3. Supabase 통합 패턴

코드 예시 전체: [docs/SUPABASE_PATTERNS.md](./docs/SUPABASE_PATTERNS.md). 핵심:

- Auth: `supabase.auth.signInAnonymously()` → JWT 자동 persist
- DB: `supabase.from('table').select()` (RLS로 권한 강제)
- 환경변수: RN에는 `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`만 (절대 `SERVICE_ROLE_KEY` X)

---

## 4. 절대 금지 / 필수 규칙

- **4-1. emoji 금지** — 코드·docs·SQL·UI 모두. 점검 `node scripts/lint-emoji.js`.
- **4-2. `specs/` 직접 수정 금지** — submodule, read-only. 변경은 winemine-specs 본 레포 PR.
- **4-3. `../winemine-keyscreen/` 수정 금지** — Phase 2 frozen.
- **4-4. 한쪽 locale 누락 금지** — 사용자 노출 텍스트는 `{ ko, en }` 양쪽. 영어 모드에서 한글 노출 X.
- **4-5. 사용자 ID 공개 노출 금지** — UUID는 DB·내부만. UI는 익명화(`velvety-fox-37`). `specs/domain/policies/anonymization.md`.
- **4-6. RLS 우회 금지** — 사용자 데이터 테이블 RLS enabled 필수 + SQL 단위 테스트(A 노트를 B가 못 보는지). `SERVICE_ROLE_KEY`는 Edge Functions admin만.
- **4-7. 시크릿 관리** — `SERVICE_ROLE_KEY`/`JWT_SECRET`/`ANONYMIZATION_SALT`는 Supabase Dashboard Secrets만. 코드·`.env` commit 금지. `EXPO_PUBLIC_*`는 번들 포함이므로 public 키만.
- **4-9. 라이트 모드 우선 + 색 하드코딩 금지** — 배포 전까지 **라이트 모드만 구현**한다. 단 다크 모드를 추후 지원하므로 **hex 색 하드코딩 절대 금지** — 색은 토큰(`useThemeTokens()` 등)으로만 사용하고 토큰은 라이트/다크 dual definition으로 유지. 상세·점검: [docs/THEME_VERIFICATION.md](./docs/THEME_VERIFICATION.md).
- **4-10. CSS→Yoga layout primitive 직역 금지** — 키스크린 JSX의 `margin*: -N`(poke-out)/`position:sticky`/`grid`/`backdrop-filter`/`borderRadius:9999`(원형)/shadow 토큰 spread는 RN equivalent로 변환. 표·예시: [docs/NEXT_TO_RN_TRANSLATION.md §8a](./docs/NEXT_TO_RN_TRANSLATION.md). 새 web-only primitive fix 시 §8a에 항목 추가(누적 의무). 점검:
  ```bash
  grep -rn "marginTop: -\|position: 'sticky'\|display: 'grid'\|backdropFilter\|borderRadius: 9999\|radius.full" app/ src/ --include="*.tsx"
  ```
- **4-11. CRITICAL — Pressable layout 패턴** — 이 stack(React19 + RN0.81 + Reanimated4 + NativeWind4.1 + Fabric)에서 `Pressable`에 `className` + 함수형 `style` + 복잡한 nested 자식이 동시에 있으면 layout 스타일이 무시됨. **규칙**: Pressable은 hit target + opacity press feedback만, 모든 layout/visual은 inner `<View>`에 inline `style`로 분리, 부모 flex 자식이면 `flex`도 outer View로(3-layer 구조). 상세 패턴·before/after: [docs/NEXT_TO_RN_TRANSLATION.md §8c](./docs/NEXT_TO_RN_TRANSLATION.md). 점검 `bash scripts/audit-pressable.sh` (DANGEROUS 0건이어야 PR 가능).
- **4-12. 스택 버전 정책** — pre-1.0 패키지 직접 사용 금지: `react-native-worklets`(0.5.1)는 Reanimated 내부 의존성으로만, 직접 `useWorklet`/`runOnUI` 추가 금지. `reanimated`(4.1.1)/`nativewind`(4.1.0) 직접 사용·`className` 추가 시 §4-11 위반 즉시 점검. 신규 UI primitive는 `src/components/__spike__/`에서 spike test(라이트 스크린샷 확인) 후 도입, 통과하면 실제 위치로 이동·spike 삭제.
- **4-13. 브랜치/워크트리 워크플로우 (모든 코드 작업 필수)** — `main`/`dev`에서 직접 작업·커밋 **금지**. 절차: ① `dev` 기준 워크트리 생성 (`git worktree add .claude/worktrees/<task> -b <task> dev`, 하네스는 EnterWorktree, base는 항상 `dev`) → ② 워크트리에서만 커밋 → ③ 완료 후 `git switch dev && git merge --no-ff <task>` (사용자가 UI 확인) → ④ 사용자 명시 요청 전까지 `dev`→`main` 머지 금지 → ⑤ `git worktree remove`. 예외: CLAUDE.md 같은 메타 작업은 사용자 지시 시 직접 처리 가능 (코드/화면은 예외 없이 워크트리 경유).
- **4-14. UI 컴포넌트 재사용 우선** — 화면·UI 설계 시 **무조건 기존 컴포넌트 중 재사용 가능한 것을 먼저 확인**(`src/components/`, [docs/component-catalog/](./docs/component-catalog/)). 있으면 활용, 없으면 **새 컴포넌트 구조를 최우선으로 정의**하고 최대한 재사용 가능하게 설계 — 동일 UI를 화면마다 중복 구현하지 말 것. 신규 공용 컴포넌트는 component-catalog에 기록.

---

## 5. AI(Claude Code) 협업 지침

**할 일**: 키스크린 → RN+Expo 변환(§4-10 사전 거치기) · migration SQL(테이블+RLS) · `supabase gen types` 후 타입 import · Edge Functions(최소한) · 익명화 유틸 · 정책 점검(emoji·locale·RLS·익명화·hex) · 시각 게이트(화면 완성 시 keyscreen-shot + RN **라이트** 스크린샷 `_workspace/`에 두고 design-reviewer 멀티모달 비교 통과) · 워크트리 경유(§4-13) · 컴포넌트 재사용 우선(§4-14).

**금지**: `main`/`dev` 직접 작업(§4-13) · `specs/`·키스크린 수정 · 정책 임의 변경(XP·익명화는 specs/domain/policies/) · `SERVICE_ROLE_KEY` RN import · RLS 비활성 테이블 · 시크릿·hex 하드코딩 · CSS primitive 직역(§4-10) · 스크린샷 없이 디자인 PASS.

**컨텍스트 흐름**: 화면 변환 → keyscreen `pages/{route}.md` + React 구현 동시 참조 / DB → `supabase.from()`(타입 `shared/types/database.types.ts`) / 도메인 결정 → `specs/domain/` 우선 / 정책 모호 → 사용자에게 질문(임의 결정 X).

---

## 6. 결정 사항 (Plan D)

| 항목 | 결정 |
|---|---|
| 아키텍처 | Full Supabase 1-repo |
| DB / Auth / Storage / Edge Functions | Supabase (Free plan) |
| API contract | Supabase schema (PostgREST auto) |
| 클라이언트 SDK | @supabase/supabase-js + Expo AsyncStorage adapter |
| 사용자 ID | Supabase UUID (DB) → 익명화 변환 (UI) |

남은 라이브러리·도구 결정: [docs/TBD.md](./docs/TBD.md).

---

## 7. 서비스 컨텍스트

**winemine** — 와인 라벨 촬영 → AI 인식 → 세계 지도 시각화 → 노트 작성 모바일 앱.

- 사용자 모드: `first-time` ↔ `heavy` · 경험 수준: `beginner` ↔ `expert`
- 언어: 한국어 ↔ English (LocalizedString) · 테마: 라이트(배포 범위) → 다크 추후 지원(§4-9)
- 5단계 레벨: 입문자 / 애호가 / 감식가 / 소믈리에 / 마스터

---

## 8. Quick Reference

| 작업 / 궁금증 | 어디 보면 됨 |
|---|---|
| Supabase 코드 패턴 (Auth·DB·Storage·Edge·RLS) | [docs/SUPABASE_PATTERNS.md](./docs/SUPABASE_PATTERNS.md) |
| 테마·색 토큰 검증 | [docs/THEME_VERIFICATION.md](./docs/THEME_VERIFICATION.md) |
| CSS→RN 변환 치트시트 (§8a Yoga, §8c Pressable) | [docs/NEXT_TO_RN_TRANSLATION.md](./docs/NEXT_TO_RN_TRANSLATION.md) |
| 컴포넌트 카탈로그 (재사용) | [docs/component-catalog/](./docs/component-catalog/) |
| 자주 쓰는 명령 (Supabase CLI / Expo / EAS / git) | [docs/COMMANDS.md](./docs/COMMANDS.md) |
| 라이브러리 결정 필요 항목 | [docs/TBD.md](./docs/TBD.md) |
| 화면별 변환 명세 (39개) | `../winemine-keyscreen/pages/{route}.md` |
| Phase 2 전체 개요 | `../winemine-keyscreen/FEATURES.md` |
| 디자인 시스템 (색·타이포·컴포넌트) | `../winemine-keyscreen/docs/design-system/` |
| 비즈니스 로직 reference (Phase 2 lib) | `../winemine-keyscreen/src/lib/` |
| 익명화 정책 | `specs/domain/policies/anonymization.md` |
| 와인 도메인 리서치 | `specs/domain/wine-research/_workspace/` |
| Supabase / Expo 공식 docs | https://supabase.com/docs · https://docs.expo.dev |

---

## 9. 하네스: winemine v0.1.0 빌드 팀

**목표:** Plan D 기준 v0.1.0 Internal Alpha를 1주 안에 빌드. 7명 팀(infra-architect / supabase-engineer / design-spec-author / rn-screen-builder / design-reviewer / qa-inspector / release-engineer)으로 인프라 + 6 마이그레이션 + Edge Function + 12 화면 + 디자인 시각 게이트 + 통합 정합성 검증 + EAS Build를 Day 1~7에 진행.

**트리거:** v0.1.0 빌드·구현·개발·Day N 작업 요청(부분 재실행·마이그레이션 수정·빌드 다시·QA 다시·이전 결과 개선 포함) 시 `winemine-build` 스킬. 단순 질문은 직접 응답.

**흐름:** design-spec-author → rn-screen-builder(키스크린 직접 Read 금지, `_workspace/design-specs/{route}.md`만 입력) → design-reviewer(FAIL 시 loop) → qa-inspector.

**스펙:** [docs/spec/v0.1.0.md](./docs/spec/v0.1.0.md).

**진행 현황 (2026-05-20 기준):** Day 1~5 완료 — 인프라 + 9 마이그레이션 원격 적용(wines 손상 0) + label-scan Edge Function 배포 + 11 화면(온보딩·홈·캡처·와인 상세·셀러 리스트/상세·노트 source/write/detail). 남은 작업: 설정 화면(Day 6) + EAS Build(Day 7).
