---
name: winemine-build
description: "winemine v0.1.0 RN+Expo+Supabase 빌드 오케스트레이터. infra-architect/supabase-engineer/design-spec-author/rn-screen-builder/design-reviewer/qa-inspector/release-engineer 7명 팀을 조율해 Tier 0 인프라 + 6개 마이그레이션 + Edge Function + 12 화면(spec-driven) + 디자인 시각 게이트 + 통합 정합성 검증 + EAS Build를 Day 1~7 일정에 진행. 'winemine 빌드 시작', 'v0.1.0 개발', '하네스 실행', 'spec 기반 구현', 'Day N 작업', 'Day 6 설정 화면', '디자인 hardening'. 후속 작업: '특정 화면만 다시', '마이그레이션 수정', 'Day N부터 재실행', '인프라 보완', '빌드 다시', 'QA 다시 돌려', '이전 결과 개선', '기존 화면 시각 보강', 'retroactive 디자인 리뷰' 시에도 반드시 사용."
---

# winemine v0.1.0 Build Orchestrator

winemine v0.1.0 (RN+Expo+Supabase, 1주 Internal Alpha)의 7명 에이전트 팀을 조율한다.

## 실행 모드: 에이전트 팀

`TeamCreate`로 7명 팀 구성. 팀원 간 `SendMessage` 직접 통신. 공유 `TaskCreate`로 Day 1~7 작업 분배.

## 에이전트 구성

| 팀원 | subagent_type | 역할 | 스킬 | 주 산출물 |
|---|---|---|---|---|
| infra-architect | infra-architect | Tier 0 인프라 (Expo, NativeWind, i18n, design-tokens, lwin/anonymize/auth/label-scan 골격, 공통 컴포넌트) | rn-screen-impl 일부 | `app/_layout.tsx`, `src/lib/**`, `src/components/{nav,shared}/**`, `tailwind.config.ts`, `app.config.ts` |
| supabase-engineer | supabase-engineer | 6개 마이그레이션, RLS, VIEW, 트리거, Edge Function label-scan, types 생성 | supabase-migrations, edge-function-dev | `supabase/migrations/*.sql`, `supabase/functions/label-scan/*`, `shared/types/database.types.ts` |
| **design-spec-author** | **design-spec-author** | **키스크린 JSX 재귀 읽기 + RN 변환 사양 작성 (verbatim 원칙). 레이아웃 트리·NativeWind 매핑표·상태 variants·deviation 사유** | **design-spec-authoring** | **`_workspace/design-specs/{route}.md`, `_workspace/06_design_specs_*.md`** |
| rn-screen-builder | rn-screen-builder | 12 화면 + 훅 + zod 검증 + 카메라/Storage 통합. **spec-driven (사양만 입력, 키스크린 직접 X)** | rn-screen-impl, winemine-data-access | `app/**`, `src/hooks/**`, `src/stores/**` |
| **design-reviewer** | **design-reviewer** | **6항목 시각 체크리스트 (요소 누락/spacing/gradient/radius/typography/color) + 멀티모달 스크린샷 비교. PASS 시 qa로, FAIL 시 rn-screen-builder 반려(loop)** | **design-review-gate** | **`_workspace/design-review_{route}_*.md`** |
| qa-inspector | qa-inspector | 통합 정합성 incremental 검증 (design-reviewer PASS 후) | integration-coherence-check, winemine-data-access | `_workspace/qa_*.md` |
| release-engineer | release-engineer | EAS Build, TestFlight, production deploy | eas-build-deploy | `eas.json`, TestFlight 빌드, `_workspace/05_release_notes.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인 (후속 작업 지원)

1. `_workspace/` 디렉토리 존재 여부 확인
2. 분기:
   - **`_workspace/` 미존재** → 초기 실행, Phase 1로
   - **`_workspace/` 존재 + 부분 수정 요청** ("Day 3 캡처 화면만 다시", "마이그레이션 수정", "기존 홈 화면 시각 보강") → 부분 재실행. 해당 에이전트만 활성화. 이전 산출물 경로를 에이전트 프롬프트에 포함.
   - **`_workspace/` 존재 + retroactive 시각 hardening 요청** → 새 분기 (아래 Phase 8 참조). design-spec-author → rn-screen-builder → design-reviewer 사이클로 기존 화면 보강.
   - **`_workspace/` 존재 + 새 입력 (스펙 변경 등)** → 새 실행. `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1.
3. 부분 재실행 시 영향 분석:
   - 마이그레이션 변경 → types 재생성 → 훅 재검증 동시 재실행 고려
   - 사양 변경 → rn-screen-builder 재구현 → design-reviewer 재검증 → qa-inspector 재검증 사이클
   - design-tokens.ts·tailwind.config.ts 확장 (P0 세션 산출물) 후 → 모든 사양·구현 재점검 권장

### Phase 1: 준비

1. `docs/spec/v0.1.0.md` 읽기 (필수)
2. 사용자가 변경한 부분 확인 (revision 이력)
3. `_workspace/` 생성
4. `_workspace/00_input/spec.md` 심볼릭 링크 또는 복사
5. 사용자에게 진행 계획 요약 + 1~2 확인 질문 (특히 Day 1 병렬 시작 가능 여부, Apple Dev 계정 준비 여부)

### Phase 2: 팀 구성

```
TeamCreate(
  team_name: "winemine-v0.1.0",
  members: [
    { name: "infra-architect", agent_type: "infra-architect", model: "opus",
      prompt: "winemine v0.1.0 Tier 0 인프라 담당. docs/spec/v0.1.0.md의 <technology_stack>, <file_structure>, <aesthetic_guidelines>를 진실 소스로. Day 1 산출물: Expo 프로젝트, NativeWind, i18n, design-tokens(P0 확장 시 추가 토큰 반영), lwin/anonymize/auth/label-scan 골격, 공통 컴포넌트. 진행 로그 _workspace/01_infra_setup.md. 완료 시 design-spec-author + rn-screen-builder에 알림. supabase-engineer와 Day 1 병렬." },
    { name: "supabase-engineer", agent_type: "supabase-engineer", model: "opus",
      prompt: "winemine v0.1.0 백엔드 담당. 6개 마이그레이션 + Edge Function + types 생성. CRITICAL: 기존 wines/wine_korean_names 손상 0 (count diff 검증). docs/spec/v0.1.0.md의 <core_data_entities>, <key_implementation_notes>.<database_schema> 그대로 옮김. 진행 로그 _workspace/02_supabase_backend.md. types 생성 후 infra-architect + rn-screen-builder 알림." },
    { name: "design-spec-author", agent_type: "design-spec-author", model: "opus",
      prompt: "winemine v0.1.0 디자인 사양 작성 담당. ../winemine-keyscreen/src/ JSX를 재귀적으로 읽고 RN+Expo 변환 사양을 _workspace/design-specs/{route}.md로 산출. verbatim 변환 원칙: 단순화·임의 개선 금지. RN 제약 deviation만 사유 명시 허용. 매핑표(NW v4)·상태 variants·인터랙션·접근성·토큰 확장 요청 누적 명시. 진행 로그 _workspace/06_design_specs_day{N}.md. 화면 사양 완성마다 rn-screen-builder에 SendMessage." },
    { name: "rn-screen-builder", agent_type: "rn-screen-builder", model: "opus",
      prompt: "winemine v0.1.0 12 화면 담당. **spec-driven**: 시각·레이아웃 정보는 _workspace/design-specs/{route}.md(design-spec-author 산출물)에서만. ../winemine-keyscreen/ 직접 Read 금지. docs/spec/v0.1.0.md의 <pages_and_interfaces>는 데이터·인터랙션·라우팅 진실 소스. 화면 완성마다 design-reviewer에 검증 요청 (qa-inspector는 시각 PASS 후). 진행 로그 _workspace/03_rn_screens_day{N}.md." },
    { name: "design-reviewer", agent_type: "design-reviewer", model: "opus",
      prompt: "winemine v0.1.0 시각 게이트 담당. rn-screen-builder 산출물을 키스크린 원본 + 사양과 line-by-line 비교. 6항목 체크리스트 (요소 누락/spacing 비율/gradient 방향·깊이/corner radius/typography 위계/color 사용). _workspace/keyscreen-shots/{route}.png 있으면 멀티모달 비교. PASS 시 qa-inspector + rn-screen-builder 알림. FAIL 시 rn-screen-builder에 파일:라인 + 원본·현재 + 수정안 SendMessage (loop). 보고서 _workspace/design-review_{route}_{timestamp}.md." },
    { name: "qa-inspector", agent_type: "qa-inspector", model: "opus",
      prompt: "winemine v0.1.0 통합 정합성 검증. incremental — 각 모듈 완성 즉시 (단, 화면은 design-reviewer PASS 후). 양쪽 동시 읽기 원칙. 우선순위: 디자인 게이트 통과 확인 → 기존 wines 손상 0, RLS↔클라이언트, wines_localized VIEW↔훅↔WineNameDisplay, ko/en·dark/light, 보안 격리. 보고서 _workspace/qa_{module}_{timestamp}.md. 발견 즉시 담당 에이전트 + 리더 SendMessage." },
    { name: "release-engineer", agent_type: "release-engineer", model: "opus",
      prompt: "winemine v0.1.0 Day 7 빌드·릴리즈. design-reviewer + qa-inspector 전체 통과 대기. eas.json, EAS Build iOS preview, TestFlight 자동 업로드, 빌드 사이즈 <50MB 검증, production migrations push (사전 wines count diff 0). 진행 로그 _workspace/05_release_notes.md." }
  ]
)
```

### Phase 3: Day 1 — Tier 0 인프라 + 백엔드 (병렬)

```
TaskCreate(tasks: [
  { title: "T1: Expo 프로젝트 생성 + tailwind 셋업", assignee: "infra-architect" },
  { title: "T2: 6개 마이그레이션 작성 + 로컬 검증", assignee: "supabase-engineer" },
  { title: "T3: shared/types/database.types.ts 생성", assignee: "supabase-engineer", depends_on: ["T2"] },
  { title: "T4: Edge Function label-scan mock + 배포", assignee: "supabase-engineer" },
  { title: "T5: src/lib/supabase.ts (PKCE flowType)", assignee: "infra-architect", depends_on: ["T3"] },
  { title: "T6: src/lib/{lwin,anonymize,design-tokens}.ts + tailwind config", assignee: "infra-architect" },
  { title: "T7: src/lib/{auth,label-scan}/ 골격", assignee: "infra-architect" },
  { title: "T8: src/lib/i18n + 공통 컴포넌트 (LocaleText, WineNameDisplay, PrimaryButton, LevelPill, EmptyState, Toast, BottomNav, AppHeader, BackHeader)", assignee: "infra-architect" },
  { title: "QA-1: 마이그레이션 적용 전후 wines count diff 0 검증", assignee: "qa-inspector", depends_on: ["T2"] },
  { title: "QA-2: 보안 격리 (SERVICE_ROLE) + emoji + 하드코딩 hex grep", assignee: "qa-inspector", depends_on: ["T6", "T7", "T8"] },
  { title: "QA-3: OAuth 골격 호환성 (profiles 컬럼, auth stubs, PKCE)", assignee: "qa-inspector", depends_on: ["T3", "T7"] }
])
```

**팀원 간 통신 규칙**:
- supabase-engineer T3 완료 → infra-architect에게 "types 생성됨" SendMessage → T5 진행
- infra-architect T8 완료 → rn-screen-builder에게 "Day 2 시작 가능" SendMessage
- qa-inspector QA-1 critical 발견 시 → 즉시 모든 작업 stop, 리더에게 alert

### Phase 4~8: Day 2~6 — 12 화면 + Spec-driven 흐름 + 디자인 게이트 + Incremental QA

**화면별 4단계 흐름** (각 화면마다 동일):

1. **design-spec-author** → `_workspace/design-specs/{route}.md` 작성 → rn-screen-builder에 사양 준비 알림
2. **rn-screen-builder** → 사양 따라 코드 구현 → design-reviewer에 디자인 리뷰 요청
3. **design-reviewer** → 6항목 체크 → PASS면 qa-inspector + rn-screen-builder 알림. FAIL이면 rn-screen-builder 반려(loop)
4. **qa-inspector** → 디자인 PASS 보고서 확인 → 텍스트 기반 정합성 검증 → 통과면 다음 화면

Day별 화면 분배:

| Day | 화면 | 담당 (순서) | 게이트 |
|---|---|---|---|
| 2 | 온보딩 4 + 홈 | design-spec-author → rn-screen-builder → design-reviewer → qa-inspector | 시각 6항목 + wines_localized 훅 |
| 3 | 캡처 + 와인 상세 | 동일 흐름 | 시각 6항목 + label-scan flow + bottle_color fallback |
| 4 | 셀러 리스트 + 셀러 상세 | 동일 흐름 | 시각 6항목 + cellar_items RLS + swipe action |
| 5 | 노트 source picker + 작성 + 상세 | 동일 흐름 | 시각 6항목 + tasting_notes INSERT zod + jsonb schema |
| 6 | 설정 4 + 디자인 polishing | 동일 흐름 | 시각 6항목 + profiles UPDATE + dark/light·ko/en 양쪽 모드 |

각 day 진입 시:
```
TaskCreate(tasks: [
  { title: "Day {N} 사양: {화면} design-specs/{route}.md 작성", assignee: "design-spec-author" },
  { title: "Day {N} 구현: {화면}", assignee: "rn-screen-builder", depends_on: ["Day {N} 사양"] },
  { title: "Day {N} 디자인 리뷰: {화면} 6항목 체크", assignee: "design-reviewer", depends_on: ["Day {N} 구현"] },
  { title: "Day {N} QA: 경계면 검증", assignee: "qa-inspector", depends_on: ["Day {N} 디자인 리뷰"] }
])
```

순서 강제:
- design-spec-author는 화면 사양 완성 즉시 rn-screen-builder에 SendMessage. rn은 사양 받기 전 코드 작성 금지.
- rn-screen-builder는 화면 완성 즉시 design-reviewer에 SendMessage. **qa-inspector에 직접 알림 금지** (게이트 순서 위반).
- design-reviewer PASS 시에만 qa-inspector 작업 시작. FAIL은 rn-screen-builder 반려, 사양 갭은 design-spec-author 반려.
- 같은 화면 design-reviewer 3회 FAIL → 리더 escalate.

### Phase 8: Retroactive 시각 hardening (기존 11 화면)

Day 5까지 완료된 11 화면에 대해 시각 품질 보강 필요 시 (사용자 요청 또는 P0 토큰 확장 완료 후):

```
TaskCreate(tasks: [
  { title: "Retro 사양: 기존 11 화면 design-specs 작성", assignee: "design-spec-author",
    metadata: { mode: "retroactive", existing_routes: ["/", "/onboarding/*", "/wine/[lwin]", "/capture", "/cellar/*", "/notes/*"] } },
  { title: "Retro 리뷰: 사양 + 기존 구현 + 원본 3-way 비교", assignee: "design-reviewer",
    depends_on: ["Retro 사양"] },
  { title: "Retro 구현 보강: design-reviewer FAIL 항목 수정", assignee: "rn-screen-builder",
    depends_on: ["Retro 리뷰"] },
  { title: "Retro 재검증", assignee: "design-reviewer", depends_on: ["Retro 구현 보강"] },
  { title: "Retro QA: 변경 후 경계면 회귀 확인", assignee: "qa-inspector", depends_on: ["Retro 재검증"] }
])
```

retroactive 사양에는 design-spec-author가 "## 현재 구현 차이" 섹션을 추가하고, design-reviewer는 우선순위표(시각 차이 큰 순)로 단계적 수정 권장. P0 토큰 확장 완료 후 진행하는 것이 권장(토큰 없으면 또 하드코딩으로 도망).

### Phase 9: Day 7 — 빌드 + 릴리즈

qa-inspector "전체 통과" 메시지 대기:

```
TaskCreate(tasks: [
  { title: "최종 QA: 전체 화면 시나리오 1~12 통과 확인", assignee: "qa-inspector" },
  { title: "eas.json + app.config.ts release 값", assignee: "release-engineer", depends_on: ["최종 QA"] },
  { title: "Production migrations push (wines count 사전·사후 0)", assignee: "release-engineer", depends_on: ["최종 QA"], collaborator: "supabase-engineer" },
  { title: "Edge Function deploy", assignee: "release-engineer", depends_on: ["Production migrations push"] },
  { title: "EAS Build iOS preview", assignee: "release-engineer" },
  { title: "빌드 사이즈 <50MB 검증", assignee: "release-engineer" },
  { title: "TestFlight 업로드 + 테스터 안내", assignee: "release-engineer" }
])
```

### Phase 10: 정리

1. 팀원에게 종료 SendMessage
2. `TeamDelete`
3. `_workspace/` 보존
4. CLAUDE.md 변경 이력에 빌드 완료 기록
5. 사용자에게 결과 요약 (TestFlight URL, 알려진 제약, v0.2.0 진입 시 다음 작업)

## 데이터 흐름

```
[리더 (winemine-build)]
    ├── TeamCreate(7명)
    ├── Day별 TaskCreate
    │
    ├── [infra-architect] ──SendMessage──→ [design-spec-author, rn-screen-builder]
    │       │
    │       ↓
    │   _workspace/01_infra_setup.md
    │   src/lib/design-tokens.ts, tailwind.config.ts
    │
    ├── [supabase-engineer] ──SendMessage──→ [infra-architect, rn-screen-builder]
    │       │
    │       ↓
    │   shared/types/database.types.ts
    │   _workspace/02_supabase_backend.md
    │
    │   ┌─────────────────── 화면별 4단계 게이트 (각 화면 반복) ───────────────────┐
    │   │
    │   ↓
    ├── [design-spec-author] ── 사양 작성 → _workspace/design-specs/{route}.md
    │       │                                ─SendMessage→ [rn-screen-builder]
    │       │
    │       ↓
    ├── [rn-screen-builder] ── 사양 따라 코드 구현 → app/**, src/components/**
    │       │                                  ─SendMessage→ [design-reviewer]
    │       │
    │       ↓
    ├── [design-reviewer] ── 6항목 시각 체크 → _workspace/design-review_{route}_*.md
    │       │
    │       ├── PASS → ─SendMessage→ [qa-inspector, rn-screen-builder]
    │       │
    │       └── FAIL → ─SendMessage→ [rn-screen-builder] (loop, 3회 FAIL 시 리더 escalate)
    │                  사양 갭 → ─SendMessage→ [design-spec-author] (사양 보강)
    │       ↓
    ├── [qa-inspector] ── 디자인 PASS 확인 + 정합성 검증 → _workspace/qa_*.md
    │       │
    │       ├── PASS → 다음 화면 시작 가능
    │       └── FAIL → 양쪽 에이전트 + 리더 alert
    │   │
    │   └────────────────────── 다음 화면 (Day +1) ──────────────────────┘
    │
    └── [release-engineer] (Day 7)
            │
            ├── eas.json, app.config.ts
            ├── supabase db push (count diff 0)
            ├── EAS Build
            ├── TestFlight
            └── _workspace/05_release_notes.md
```

### 연계 산출물 (별도 P0/P2 세션 — 본 빌드 외부)

- **P0**: `src/lib/design-tokens.ts` + `tailwind.config.ts` 확장 (shadow, 누락 spacing, gradient, font weight) + `docs/NEXT_TO_RN_TRANSLATION.md` 변환 치트시트. design-spec-author·design-reviewer가 누적한 토큰 확장 요청 일괄 처리.
- **P2**: `_workspace/keyscreen-shots/{route}.png` 12장 캡처. design-reviewer 멀티모달 비교 입력.

이 산출물은 본 오케스트레이터가 만들지 않지만 design-spec-author·design-reviewer 프롬프트에 경로가 미리 포함되어 있어, 도착 시 자동 활용된다.

## 에러 핸들링

| 상황 | 전략 |
|---|---|
| infra-architect 막힘 (30분+) | SendMessage로 차선책 확인. 라이브러리 충돌 시 사용자에게 보고 후 결정. |
| supabase-engineer 마이그레이션 적용 실패 | 즉시 rollback (로컬 db reset, 원격 down migration). 사용자에게 보고. |
| **기존 wines count diff 발견** (CRITICAL) | 즉시 모든 작업 stop. 사용자에게 alert. revert 절차. 원인 분석 완료 전 재시작 금지. |
| design-spec-author 키스크린 누락/모호 발견 | 사양에 "미해결 질문" 섹션 명시 + 리더 보고. 임의 결정 금지. |
| rn-screen-builder가 키스크린 직접 Read 시도 | 즉시 차단 — 사양만 입력 원칙. design-spec-author에 보강 요청 라우팅. |
| design-reviewer 같은 화면 3회 FAIL | 리더 escalate. 사양 자체 갭인지 / 토큰 부족인지 / rn-screen-builder 한계인지 진단. P0 토큰 확장 선행 권장. |
| design-reviewer FAIL인데 스크린샷 부재 | JSX·CSS만으로 검증, 보고서에 "P2 완료 후 재검증" 명시. 통과 시도는 멀티모달 데이터로 한 번 더. |
| rn-screen-builder 화면 깨짐 | design-reviewer + qa-inspector incremental 검증으로 조기 발견. 영향 화면만 재구현. |
| qa-inspector 경계면 불일치 다수 발견 | 양쪽 에이전트 합의 회의 (SendMessage 라운드) — 어느 쪽 수정할지 결정 후 진행. |
| qa-inspector가 디자인 게이트 미통과 화면 검증 요청 받음 | SKIP 후 design-reviewer PASS 대기. SKIP 사유 보고서에 1줄. |
| EAS Build 실패 | release-engineer가 로그 분석 → infra-architect와 의존성 조정. |
| 팀원 타임아웃 | 현재까지 결과로 부분 진행. 누락 항목 보고서 명시. |
| 사용자 입력 변경 (spec revision) | Phase 0 분기 — 새 실행으로 전환. 기존 _workspace 보관. |
| P0 토큰 확장 미완료 상태에서 retroactive 진행 요청 | 사용자에게 P0 선행 권장 보고. 강행 시 design-reviewer FAIL 누적 예상 명시. |

## 테스트 시나리오

### 정상 흐름 (Day 1 → Day 7 전체, spec-driven)

1. Phase 0: `_workspace/` 미존재 → 초기 실행
2. Phase 1: spec 읽고 사용자에게 Apple Dev 계정 준비 확인
3. Phase 2: 7명 팀 + Day 1 task 등록
4. Phase 3: infra-architect + supabase-engineer 병렬 Day 1 진행. types 생성 후 infra가 supabase 클라이언트 셋업. QA-1 통과 (wines count diff 0)
5. Phase 4~8: Day 2~6 화면별 4단계 흐름
   - design-spec-author가 `_workspace/design-specs/{route}.md` 작성
   - rn-screen-builder가 사양 따라 구현
   - design-reviewer 6항목 PASS
   - qa-inspector 정합성 PASS
6. Phase 9: 최종 QA 통과 → release-engineer Day 7 빌드 + TestFlight 업로드
7. Phase 10: 팀 정리, _workspace 보존, 결과 요약
8. 예상 결과: TestFlight URL + `_workspace/05_release_notes.md` + 12개 design-specs + 12개 design-review 보고서

### 에러 흐름 1 (마이그레이션 적용 중 wines count diff 발견)

1. Phase 3에서 supabase-engineer가 T2 적용 시도
2. QA-1이 count diff 1 감지 ("wines: 12345 → 12340, 5 rows 손실")
3. qa-inspector가 모든 팀원에게 "CRITICAL STOP" SendMessage + 리더 alert
4. 리더가 모든 진행 중 작업 freeze
5. supabase-engineer가 down migration 적용 + 원인 분석
6. 마이그레이션 수정 후 로컬에서 db reset 재검증
7. 통과 시 원격 재시도. qa-inspector 재확인.

### 에러 흐름 2 (디자인 게이트 3회 FAIL — 토큰 부족 신호)

1. Day 3 캡처 화면 — design-spec-author 사양 작성 → rn-screen-builder 구현
2. design-reviewer 1차 검증: gradient 깊이 부족 + shadow 누락 FAIL → rn-screen-builder 수정
3. design-reviewer 2차: shadow 토큰이 design-tokens.ts에 없어서 또 임의 hex로 도망 → FAIL
4. design-reviewer 3차: 동일 문제 반복 → 리더 escalate
5. 리더 진단: P0 토큰 확장 (shadow.lg, gradient.capture-hero) 미완료가 근본 원인
6. 사용자에게 보고: "P0 세션 선행 권장. design-tokens.ts에 다음 토큰 필요: ..."
7. P0 완료 후 재시작 → 1회 PASS

### 에러 흐름 3 (rn-screen-builder가 키스크린 직접 Read 시도)

1. rn-screen-builder가 사양 모호 → 키스크린 직접 추적 충동
2. 사양 위반 — 즉시 자체 차단 (스킬 규칙)
3. 대신 design-spec-author에 "사양 X 영역 모호" SendMessage
4. design-spec-author가 사양 보강 → rn-screen-builder 재진행

## 후속 작업 패턴

| 사용자 요청 | 동작 |
|---|---|
| "Day 3 캡처 화면만 다시" | Phase 0 → 부분 재실행 → design-spec-author 사양 재작성 → rn-screen-builder 재구현 → design-reviewer → qa-inspector |
| "Day 6 설정 화면 진행" | Phase 0 → 신규 Day 6 — 4단계 흐름 (사양 → 구현 → 디자인 리뷰 → qa) 4 화면 반복 |
| "마이그레이션 수정해줘" | supabase-engineer만 활성화 → SQL 수정 → 로컬 재검증 → types 재생성 → infra/rn에 알림 → qa 재검증 |
| "빌드 다시" | release-engineer만 → 코드 변경 없으면 동일 SHA로, 있으면 버전 bump |
| "QA 다시 돌려" | design-reviewer + qa-inspector 둘 다 활성화 → 전체 모듈 순회 (시각 게이트 → 정합성 게이트) |
| "기존 화면 시각 보강", "retroactive 디자인 리뷰", "디자인 hardening" | Phase 8 retroactive 흐름. design-spec-author가 기존 11 화면 사양 작성 → design-reviewer 비교 → rn-screen-builder 단계적 보강 → 재검증 |
| "홈 화면 사양만 만들어줘" | design-spec-author만 활성화 → 해당 라우트 사양 작성 → 리더에 완료 알림 |
| "X 화면 디자인 리뷰만" | design-reviewer만 활성화 → 사양 + 구현 + (있을 때) 스크린샷 비교 → 보고서 출력 |
| "이전 결과 기반으로 X 추가" | Phase 0 → 부분 재실행 → 해당 에이전트만, 이전 산출물 경로 프롬프트에 포함 |
| "P0 토큰 확장 완료, 전체 화면 검증" | design-reviewer 전체 11 화면 순회 → FAIL 목록 → rn-screen-builder 우선순위 수정 |
| "v0.2.0 OAuth 추가" | 별도 milestone — 새 spec 작성 후 새 하네스 실행 권장 (v0.1.0 구조는 보존) |

## 자세한 reference

- 스펙: `docs/spec/v0.1.0.md` (1100+ 줄, 모든 결정 포함)
- 키스크린 원본 (design-spec-author만 직접 Read): `../winemine-keyscreen/src/` (read-only)
- 키스크린 산문 (보조): `../winemine-keyscreen/pages/*.md`
- 디자인 시스템: `../winemine-keyscreen/docs/design-system/*.md`
- 디자인 사양 산출물 (rn-screen-builder의 유일한 시각 입력): `_workspace/design-specs/{route}.md`
- 디자인 리뷰 보고서: `_workspace/design-review_{route}_*.md`
- 변환 치트시트 (P0 산출물): `docs/NEXT_TO_RN_TRANSLATION.md`
- 스크린샷 (P2 산출물): `_workspace/keyscreen-shots/{route}.png` 12장
- Supabase 패턴: `docs/SUPABASE_PATTERNS.md`
- 테마 검증: `docs/THEME_VERIFICATION.md`
- 명령어: `docs/COMMANDS.md`
