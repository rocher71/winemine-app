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

### 4-11. **CRITICAL — NativeWind v4 + Fabric 환경의 Pressable layout 패턴 (24시간 학습)**

**2026-05-21 24시간 fix 학습**: 이 stack(`React 19 + RN 0.81 + Reanimated 4 + worklets 0.5 + NativeWind 4.1 + jsxImportSource: 'nativewind' + newArchEnabled: true (Fabric)`)에서, **`Pressable`에 `className` + 함수형 `style` + 복잡한 nested 자식(여러 View / SVG / Text)이 동시에 있으면 layout 스타일이 무시되는 경우 발생**. cssInterop wrapper + Fabric layout 충돌로 추정.

**증거 사례**:
- ✅ `SuggestedActions ActionRow` — className + style 함수 + flexDirection row, 자식은 Text + ChevronRight 단순 → **작동**
- ❌ `WineFeedRow` — 동일 패턴이지만 자식이 3개 nested View + SVG (WMBottle) → **flexDirection row 무시되어 vertical로 렌더**
- ❌ `BottomNav FAB` — Pressable style 함수에 position/size/border/shadow 통째로 → **backgroundColor만 적용, border/radius/위치 무시**

**규칙 (반드시 준수)**:

1. **Pressable은 hit target + opacity press feedback만**:
   ```tsx
   <Pressable onPress={...} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
     <View style={{ /* 모든 layout/visual 여기 */ }}>
       {children}
     </View>
   </Pressable>
   ```

2. **layout/visual은 inner `<View>`로 분리**. inner View는 가능하면 `className` 없이 inline `style`만 (cssInterop wrapping 우회). 색은 `useThemeTokens()` 의 `tokens.bg.surface` / `tokens.border.default` 등으로 직접 inline.

3. **Pressable의 style 함수에 다음 prop을 넣지 말 것** (cssInterop가 무시하는 케이스 빈번):
   - `flexDirection`, `flexWrap`, `alignItems`, `justifyContent`, `gap`
   - `padding*`, `margin*`, `width`, `height`
   - `position`, `top`/`bottom`/`left`/`right`
   - `borderRadius`, `borderWidth`, `borderColor`
   - `backgroundColor`
   - `shadow*`, `elevation`
   - `transform` (scale press feedback도 inner View로 옮길 것)

3.5. **Pressable이 부모 flex container의 자식일 때 `flex`/`flexBasis`/`flexGrow`도 outer View로 분리** (2026-05-21 BottomNav NavTab 24시간 디버깅 학습):
   - Pressable에 `flex: 1` 두면 cssInterop가 무시 → Pressable이 content 폭으로 collapse
   - 결과: BottomNav NavTab들이 가운데 빈 공간 없이 양옆으로 cluster
   - **반드시 `<View style={{ flex: 1 }}><Pressable>...</Pressable></View>` 외곽 wrapper로**
   - inner View(visual) 패턴과 결합 시 3-layer 구조:
     ```tsx
     <View style={{ flex: 1 }}>                          {/* flex 분포 */}
       <Pressable onPress style={({pressed}) => ({ opacity })}>  {/* hit target */}
         <View style={{ flexDirection, padding, bg ... }}>  {/* visual */}
           {icon}{text}
         </View>
       </Pressable>
     </View>
     ```

4. **단순 hit target (icon만, Text만 등)은 예외**. 그러나 미래에 자식 늘어날 가능성 있으면 처음부터 inner View 패턴 권장.

5. **Text font/color는 inline style로** (className font-inter / text-* 도 가능하지만 layout-heavy 부모 안에서는 inline 권장):
   ```tsx
   <Text style={{ fontFamily: 'Inter_400Regular', color: tokens.text.primary, fontSize: 14 }}>...</Text>
   ```

**점검 명령** (코드 작성 후 / PR 전):
```bash
# className + style 함수 동시 사용 Pressable 찾기
grep -rn -B1 "style={({\s*pressed" app/ src/ --include="*.tsx" | grep -B1 "className"
```
발견된 사이트는 자식 복잡도 확인 후 inner View 패턴으로 변환.

**참조**: `docs/NEXT_TO_RN_TRANSLATION.md` §8c — 상세 패턴 + 변환 before/after 예시.

---

### 4-10. 키스크린 verbatim 변환 시 Yoga vs CSS box model 사전 거치기 (NEW)

키스크린 JSX(`../winemine-keyscreen/src/**`)를 RN으로 옮길 때, **CSS와 Yoga의 의미가 다른 layout primitive를 verbatim 옮기면 시각 결과가 깨진다**. 학습 배경: 2026-05-21 BottomNav FAB 4 라운드 fix — `marginTop: -24`를 verbatim 옮긴 게 RN에서 poke-out 작동 안 한 사례.

**규칙**:
1. 화면·컴포넌트 작성 전 `docs/NEXT_TO_RN_TRANSLATION.md` §8a "Yoga vs CSS box model" 표를 grep 확인
2. 다음 패턴 키스크린 발견 시 RN equivalent로 변환 (직역 금지):
   - `marginTop/Bottom/Left/Right: -N` (음수 margin) — 유형 A(부모 위로 튀어나오기)면 `transform: [{ translateY: -N }]` 또는 `position: 'absolute'`. 유형 B/C(centering/sibling overlap/spacing 미세 조정)는 그대로 OK
   - `position: 'sticky'`, `display: 'grid'`, `backdrop-filter`, `vh`/`vw` (RN 미지원)
   - 원형(FAB/아바타) `borderRadius: 9999` 또는 `radius.full` (일부 환경 무시) → `size/2` 명시값
   - shadow 토큰 spread (`...fabShadow`) → floating 요소는 4속성 inline + `elevation` 명시
   - expo-router custom tabBar의 outer wrapper — `tabBarStyle: { borderTopWidth: 0, backgroundColor: 'transparent', overflow: 'visible' }` 명시
3. 사전에 없는 새 web-only primitive를 fix할 때마다 `docs/NEXT_TO_RN_TRANSLATION.md` §8a에 항목 추가 (누적 의무)
4. design-reviewer 8항목 체크리스트 (7) Layout primitive 검증 + (8) 멀티모달 스크린샷 비교 (의무) 통과 필수

점검 명령:
```bash
# 변환 전·중·후 모두 실행
grep -rn "marginTop: -\|marginLeft: -\|marginRight: -\|marginBottom: -" app/ src/ --include="*.tsx" --include="*.ts"
grep -rn "position: 'sticky'\|display: 'grid'\|backdropFilter" app/ src/ --include="*.tsx"
grep -rn "borderRadius: 9999\|radius.full" src/components/nav src/components/shared --include="*.tsx"
```

---

## 5. AI(Claude Code) 협업 지침

### 할 일
- 키스크린 화면을 RN+Expo 컴포넌트로 변환 (단, [docs/NEXT_TO_RN_TRANSLATION.md](./docs/NEXT_TO_RN_TRANSLATION.md) §8a Yoga vs CSS 사전 거치기 의무 §4-10)
- Supabase migration SQL 작성 (테이블 + RLS 정책)
- `supabase gen types` 후 TS 타입 import
- Edge Functions 작성 (필요 최소한)
- 익명화 유틸 (`specs/domain/policies/anonymization.md` 참조)
- 정책 위반 점검 (emoji, locale 누락, RLS 우회, 익명화 누락)
- **테마 변경 시 양쪽 모드 검증** (§4-9)
- **변환 사전 누적 의무** — 새 web-only primitive fix 시 `docs/NEXT_TO_RN_TRANSLATION.md` §8a 항목 추가 (§4-10)
- **시각 게이트 의무** — 화면 완성 시 keyscreen-shot + RN dark/light 스크린샷 모두 `_workspace/{keyscreen-shots,rn-shots}/`에 두고 design-reviewer 멀티모달 비교 통과

### 하면 안 되는 것
- `specs/` 또는 `../winemine-keyscreen/` 수정
- 정책 임의 변경 (XP·익명화 등은 specs/domain/policies/)
- `SUPABASE_SERVICE_ROLE_KEY`를 RN 코드에 import
- RLS 비활성 테이블 생성
- 시크릿·hex 색 하드코딩
- Edge Functions에 비즈니스 로직 over-engineering (§4-8)
- 테마 한쪽만 보고 스타일 commit (§4-9)
- **CSS layout primitive (`marginTop: -N` poke-out / `position: sticky` / `grid` / `backdrop-filter` / `radius.full` 원형) verbatim 직역 — RN equivalent로 변환 (§4-10)**
- **스크린샷 없이 디자인 PASS 결정** (§4-10)

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
| 2026-05-20 | Day 1~4 완료 (9/12 화면) — 인프라 + 9 마이그레이션 원격 적용 (wines 손상 0) + label-scan Edge Function 배포 + 온보딩/홈/캡처/와인 상세/셀러 리스트·상세 | app/, src/, supabase/, shared/ | T2 push + Vault salt 활성 + Anonymous Auth 활성 + QA Day1~4 모두 PASS |
| 2026-05-20 | Day 5 완료 (11 본 화면) — 노트 source picker + 작성 (BeginnerForm+ExpertForm+zod) + 상세 + tasting_notes.rating half-step DB CHECK 마이그레이션 | app/notes/, src/components/notes/, supabase/migrations/ | QA-Day5 PASS 11/11. F.1 narrow 표준 5번째 자동 채택 + N.1 (id+uid 양쪽 명시) 표준 정착. 남은 작업: 설정 3 화면(Day 6) + EAS Build(Day 7) |
| 2026-05-20 | design-spec-author + design-reviewer 추가, rn-screen-builder spec-driven 전환 (7명 팀) | .claude/agents/, .claude/skills/, CLAUDE.md | 디자인 손실 4원인(JSX 안 읽음/매핑 손실/토큰 좁음/시각 피드백 부재) 해결. 흐름: design-spec-author → rn-screen-builder → design-reviewer → (FAIL 시 loop) → qa-inspector. rn-screen-builder는 키스크린 직접 Read 금지, _workspace/design-specs/{route}.md만 입력. Day 6 신규 + 기존 11 화면 retroactive hardening 양쪽 지원. P0(토큰 확장 + 변환 치트시트) / P2(스크린샷) 산출물은 별도 세션. |
