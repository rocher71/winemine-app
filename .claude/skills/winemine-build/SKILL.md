---
name: winemine-build
description: "winemine v0.1.0 RN+Expo+Supabase 빌드 오케스트레이터. infra-architect/supabase-engineer/rn-screen-builder/qa-inspector/release-engineer 5명 팀을 조율해 Tier 0 인프라 + 6개 마이그레이션 + Edge Function + 12 화면 + 통합 정합성 검증 + EAS Build를 Day 1~7 일정에 진행. 'winemine 빌드 시작', 'v0.1.0 개발', '하네스 실행', 'spec 기반 구현', 'Day N 작업'. 후속 작업: '특정 화면만 다시', '마이그레이션 수정', 'Day N부터 재실행', '인프라 보완', '빌드 다시', 'QA 다시 돌려', '이전 결과 개선' 시에도 반드시 사용."
---

# winemine v0.1.0 Build Orchestrator

winemine v0.1.0 (RN+Expo+Supabase, 1주 Internal Alpha)의 5명 에이전트 팀을 조율한다.

## 실행 모드: 에이전트 팀

`TeamCreate`로 5명 팀 구성. 팀원 간 `SendMessage` 직접 통신. 공유 `TaskCreate`로 Day 1~7 작업 분배.

## 에이전트 구성

| 팀원 | subagent_type | 역할 | 스킬 | 주 산출물 |
|---|---|---|---|---|
| infra-architect | infra-architect | Tier 0 인프라 (Expo, NativeWind, i18n, design-tokens, lwin/anonymize/auth/label-scan 골격, 공통 컴포넌트) | rn-screen-impl 일부 | `app/_layout.tsx`, `src/lib/**`, `src/components/{nav,shared}/**`, `tailwind.config.ts`, `app.config.ts` |
| supabase-engineer | supabase-engineer | 6개 마이그레이션, RLS, VIEW, 트리거, Edge Function label-scan, types 생성 | supabase-migrations, edge-function-dev | `supabase/migrations/*.sql`, `supabase/functions/label-scan/*`, `shared/types/database.types.ts` |
| rn-screen-builder | rn-screen-builder | 12 화면 + 훅 + zod 검증 + 카메라/Storage 통합 | rn-screen-impl, winemine-data-access | `app/**`, `src/hooks/**`, `src/stores/**` |
| qa-inspector | qa-inspector | 통합 정합성 incremental 검증 | integration-coherence-check, winemine-data-access | `_workspace/qa_*.md` |
| release-engineer | release-engineer | EAS Build, TestFlight, production deploy | eas-build-deploy | `eas.json`, TestFlight 빌드, `_workspace/05_release_notes.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인 (후속 작업 지원)

1. `_workspace/` 디렉토리 존재 여부 확인
2. 분기:
   - **`_workspace/` 미존재** → 초기 실행, Phase 1로
   - **`_workspace/` 존재 + 부분 수정 요청** ("Day 3 캡처 화면만 다시", "마이그레이션 수정") → 부분 재실행. 해당 에이전트만 활성화. 이전 산출물 경로를 에이전트 프롬프트에 포함.
   - **`_workspace/` 존재 + 새 입력 (스펙 변경 등)** → 새 실행. `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1.
3. 부분 재실행 시 영향 분석: 해당 모듈의 다운스트림(예: 마이그레이션 변경 → types 재생성 → 훅 재검증) 동시 재실행 고려.

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
      prompt: "winemine v0.1.0 Tier 0 인프라 담당. docs/spec/v0.1.0.md의 <technology_stack>, <file_structure>, <aesthetic_guidelines>를 진실 소스로. Day 1 산출물: Expo 프로젝트, NativeWind, i18n, design-tokens, lwin/anonymize/auth/label-scan 골격, 공통 컴포넌트. 진행 로그 _workspace/01_infra_setup.md. 완료 시 rn-screen-builder에 알림. supabase-engineer와 Day 1 병렬." },
    { name: "supabase-engineer", agent_type: "supabase-engineer", model: "opus",
      prompt: "winemine v0.1.0 백엔드 담당. 6개 마이그레이션 + Edge Function + types 생성. CRITICAL: 기존 wines/wine_korean_names 손상 0 (count diff 검증). docs/spec/v0.1.0.md의 <core_data_entities>, <key_implementation_notes>.<database_schema> 그대로 옮김. 진행 로그 _workspace/02_supabase_backend.md. types 생성 후 infra-architect + rn-screen-builder 알림." },
    { name: "rn-screen-builder", agent_type: "rn-screen-builder", model: "opus",
      prompt: "winemine v0.1.0 12 화면 담당. infra-architect + supabase-engineer 산출물 의존. docs/spec/v0.1.0.md의 <pages_and_interfaces> + 키스크린 ../winemine-keyscreen/pages/*.md 참조. 화면 완성마다 qa-inspector에 검증 요청. 진행 로그 _workspace/03_rn_screens_day{N}.md." },
    { name: "qa-inspector", agent_type: "qa-inspector", model: "opus",
      prompt: "winemine v0.1.0 통합 정합성 검증. incremental — 각 모듈 완성 즉시. 양쪽 동시 읽기 원칙. 우선순위: 기존 wines 손상 0, RLS↔클라이언트, wines_localized VIEW↔훅↔WineNameDisplay, ko/en·dark/light, 보안 격리. 보고서 _workspace/qa_{module}_{timestamp}.md. 발견 즉시 담당 에이전트 + 리더 SendMessage." },
    { name: "release-engineer", agent_type: "release-engineer", model: "opus",
      prompt: "winemine v0.1.0 Day 7 빌드·릴리즈. qa-inspector 전체 통과 대기. eas.json, EAS Build iOS preview, TestFlight 자동 업로드, 빌드 사이즈 <50MB 검증, production migrations push (사전 wines count diff 0). 진행 로그 _workspace/05_release_notes.md." }
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

### Phase 4~8: Day 2~6 — 12 화면 + Incremental QA

Day별 화면 분배:

| Day | 화면 | 담당 | QA 시점 |
|---|---|---|---|
| 2 | 온보딩 4 + 홈 | rn-screen-builder | 홈 완성 시 wines_localized 훅 검증 |
| 3 | 캡처 + 와인 상세 | rn-screen-builder | label-scan flow + bottle_color fallback 검증 |
| 4 | 셀러 리스트 + 셀러 상세 | rn-screen-builder | cellar_items RLS + swipe action 검증 |
| 5 | 노트 source picker + 작성 + 상세 | rn-screen-builder | tasting_notes INSERT zod + jsonb schema 검증 |
| 6 | 설정 4 + 디자인 polishing | rn-screen-builder | profiles UPDATE + dark/light·ko/en 양쪽 모드 |

각 day 진입 시:
```
TaskCreate(tasks: [
  { title: "Day {N}: {화면} 구현", assignee: "rn-screen-builder" },
  { title: "QA Day {N}: 경계면 검증", assignee: "qa-inspector", depends_on: ["Day {N}"] }
])
```

rn-screen-builder가 화면 완성마다 qa-inspector에 SendMessage("검증 요청: {화면}, 데이터 호출 경로: {hook 파일}"). qa-inspector 통과 후 다음 화면.

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
    ├── TeamCreate(5명)
    ├── Day별 TaskCreate
    │
    ├── [infra-architect] ──SendMessage──→ [rn-screen-builder]
    │       │                                     ↑
    │       ↓                                     │
    │   _workspace/01_infra_setup.md              │
    │                                             │
    ├── [supabase-engineer] ──SendMessage──→ [infra-architect, rn-screen-builder]
    │       │                                     │
    │       ↓                                     │
    │   shared/types/database.types.ts ───────────┘
    │   _workspace/02_supabase_backend.md
    │                                             ↓
    │                                     [rn-screen-builder]
    │                                             │
    │                                     화면 완성마다
    │                                             ↓
    │                            ──SendMessage──→ [qa-inspector]
    │                                             │
    │                                             ↓
    │                                     _workspace/qa_*.md
    │                                             │
    │                                  통과 시 SendMessage 회신
    │                                  실패 시 양쪽 에이전트 + 리더 alert
    │
    └── [release-engineer] (Day 7)
            │
            ├── eas.json, app.config.ts
            ├── supabase db push (count diff 0)
            ├── EAS Build
            ├── TestFlight
            └── _workspace/05_release_notes.md
```

## 에러 핸들링

| 상황 | 전략 |
|---|---|
| infra-architect 막힘 (30분+) | SendMessage로 차선책 확인. 라이브러리 충돌 시 사용자에게 보고 후 결정. |
| supabase-engineer 마이그레이션 적용 실패 | 즉시 rollback (로컬 db reset, 원격 down migration). 사용자에게 보고. |
| **기존 wines count diff 발견** (CRITICAL) | 즉시 모든 작업 stop. 사용자에게 alert. revert 절차. 원인 분석 완료 전 재시작 금지. |
| rn-screen-builder 화면 깨짐 | qa-inspector incremental 검증으로 조기 발견. 영향 화면만 재구현. |
| qa-inspector 경계면 불일치 다수 발견 | 양쪽 에이전트 합의 회의 (SendMessage 라운드) — 어느 쪽 수정할지 결정 후 진행. |
| EAS Build 실패 | release-engineer가 로그 분석 → infra-architect와 의존성 조정. |
| 팀원 타임아웃 | 현재까지 결과로 부분 진행. 누락 항목 보고서 명시. |
| 사용자 입력 변경 (spec revision) | Phase 0 분기 — 새 실행으로 전환. 기존 _workspace 보관. |

## 테스트 시나리오

### 정상 흐름 (Day 1 → Day 7 전체)

1. Phase 0: `_workspace/` 미존재 → 초기 실행
2. Phase 1: spec 읽고 사용자에게 Apple Dev 계정 준비 확인
3. Phase 2: 5명 팀 + Day 1 task 12개 등록
4. Phase 3: infra-architect + supabase-engineer 병렬 Day 1 진행. types 생성 후 infra가 supabase 클라이언트 셋업.
5. QA-1 통과 (wines count diff 0)
6. Phase 4~8: rn-screen-builder가 Day 2~6 순차 화면 구현. qa-inspector incremental 검증.
7. Phase 9: 최종 QA 통과 → release-engineer Day 7 빌드 + TestFlight 업로드
8. Phase 10: 팀 정리, _workspace 보존, 결과 요약
9. 예상 결과: TestFlight URL + `_workspace/05_release_notes.md`

### 에러 흐름 (마이그레이션 적용 중 wines count diff 발견)

1. Phase 3에서 supabase-engineer가 T2 적용 시도
2. QA-1이 count diff 1 감지 ("wines: 12345 → 12340, 5 rows 손실")
3. qa-inspector가 모든 팀원에게 "CRITICAL STOP" SendMessage + 리더 alert
4. 리더가 모든 진행 중 작업 freeze
5. supabase-engineer가 down migration 적용 + 원인 분석 (어떤 SQL이 wines에 영향?)
6. 마이그레이션 수정 후 로컬에서 db reset 재검증
7. 통과 시 원격 재시도. qa-inspector 재확인.
8. 보고서에 "마이그레이션 v2 수정 — wines 보호 강화" 기록

## 후속 작업 패턴

| 사용자 요청 | 동작 |
|---|---|
| "Day 3 캡처 화면만 다시" | Phase 0 → 부분 재실행 → rn-screen-builder만 활성화 → app/(tabs)/capture.tsx 재구현 → qa-inspector 검증 |
| "마이그레이션 수정해줘" | supabase-engineer만 활성화 → SQL 수정 → 로컬 재검증 → types 재생성 → infra/rn에 알림 → qa 재검증 |
| "빌드 다시" | release-engineer만 → 코드 변경 없으면 동일 SHA로, 있으면 버전 bump |
| "QA 다시 돌려" | qa-inspector만 → 전체 모듈 순회 검증 |
| "이전 결과 기반으로 X 추가" | Phase 0 → 부분 재실행 → 해당 에이전트만, 이전 산출물 경로 프롬프트에 포함 |
| "v0.2.0 OAuth 추가" | 별도 milestone — 새 spec 작성 후 새 하네스 실행 권장 (v0.1.0 구조는 보존) |

## 자세한 reference

- 스펙: `docs/spec/v0.1.0.md` (1100+ 줄, 모든 결정 포함)
- 키스크린: `../winemine-keyscreen/pages/*.md`
- 디자인: `../winemine-keyscreen/docs/design-system/*.md`
- Supabase 패턴: `docs/SUPABASE_PATTERNS.md`
- 테마 검증: `docs/THEME_VERIFICATION.md`
- 명령어: `docs/COMMANDS.md`
