# `/project-spec-writer` 프롬프트 (winemine v0.1.0 — Internal Alpha)

이 파일은 winemine-app(1-repo monorepo) 레포에서 `/project-spec-writer` 호출 시 입력할 **사전 정의된 프롬프트**입니다.

> **아키텍처 (Plan D 확정 2026-05-19)**: Full Supabase 1-repo — RN+Expo + supabase/ 통합
> **v0.1.0 목표**: Internal Alpha 1주 (스토어 심사 올리기용)
> **백엔드**: Supabase (DB·Auth·Storage·Edge Functions). 별도 Spring 서버 X

## 사용법

본 레포 루트에서 Claude Code 실행 후 한 줄:

```
/project-spec-writer @docs/spec/spec-writer-prompt.md 이거 토대로 v0.1.0 스펙 작성해줘
```

`@` 문법으로 이 파일 내용 자동 로드. spec-writer가:
1. [필수 결정 사항] 남은 항목을 사용자에게 묻기
2. 답 받은 뒤 spec 작성
3. 작성한 spec을 사용자에게 보여주고 review 받기

> 다른 reference(specs, keyscreen)는 `@` 안 해도 됨 — spec-writer가 Read tool로 on-demand 읽음.

## 산출물

- `docs/spec/v0.1.0.md` (XML 형식)
- 그 다음 `/harness:harness`로 에이전트 생성 → 작업 시작

---

## ─── PROMPT ───

```
프로젝트: winemine (RN+Expo + Supabase 1-repo monorepo)
스택: React Native + Expo (managed) + TypeScript strict + Supabase(DB+Auth+Storage+Edge Functions)
산출물 위치: docs/spec/v0.1.0.md (XML 형식)
목표: Internal Alpha — 1주 안에 사업화 가능한 최소 앱 + 스토어 심사용

[배경]
이 작업은 Phase 2 키스크린 시안(Next.js 15 + React)을 RN+Expo로 변환하면서
백엔드는 Supabase로 1-repo monorepo 구축하는 Phase 3 첫 milestone.
기존 reference 자료가 풍부합니다 — spec에 절대 복붙하지 말고 path link만.

[아키텍처 — 확정 결정 사항]
- 클라이언트: React Native + Expo (managed) + TypeScript strict
- 백엔드: Supabase 전체 사용
  - Postgres (DB) — supabase/migrations/*.sql로 관리
  - PostgREST (자동 REST API) — 클라이언트가 supabase.from() 직접 호출
  - Auth (anonymous + JWT) — supabase.auth.signInAnonymously()
  - Storage (라벨 사진) — supabase.storage
  - Edge Functions (TS/Deno) — 라벨 인식 등 커스텀 로직만 (최소화)
- SDK: @supabase/supabase-js + Expo AsyncStorage adapter
- 환경변수: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (public)
- 호스팅: Supabase 자체 (별도 서버 X)
- 운영 비용: Supabase Free plan (~$0/월, MAU 50k까지)
- 사용자 ID: Supabase UUID (DB) → 응답·UI에서 익명화 변환 (velvety-fox-37)

[Plan D 전제 — 6개월 후 Spring 전환 가능성 보존]
- 비즈니스 로직 80%는 SQL 함수 / RLS에 (supabase/migrations/*.sql)
- Edge Functions는 외부 API wrapper만 (라벨 인식 외부 호출 등)
- Edge Functions이 두꺼워지면 6개월 후 Spring 전환 비용 폭증 → 의식적으로 얇게

[참조 자료 — 복붙 금지, link만]
- ../winemine-keyscreen/pages/*.md           39 화면별 상세 명세
- ../winemine-keyscreen/FEATURES.md          전체 시스템 개요
- ../winemine-keyscreen/src/                 Phase 2 React 원본
- ../winemine-keyscreen/src/lib/mock/*.ts    DB schema 설계 input
- ../winemine-keyscreen/src/lib/{community-peak-aggregator,drink-window,xp,compatibility}.ts
                                              비즈니스 로직 reference (SQL 함수 / RLS / Edge Function 변환 base)
- ../winemine-keyscreen/docs/design-system/  색·타이포·컴포넌트
- specs/api/CONVENTIONS.md                    LocalizedString, 익명화, 시간 형식 (Edge Functions에만 적용. PostgREST는 Supabase 표준)
- specs/domain/policies/anonymization.md      익명화 정책 (HMAC-SHA256 → velvety-fox-37)
- specs/domain/wine-research/site/src/content/docs/misc/
    70_tech_plan_master.md                   (참고용, Plan D와 일부 다름)
    73_database_schema.md                    DB schema 설계 base
    75_auth_anonymous_first.md               anonymous Auth 흐름 → Supabase Auth로 구현
    76_ai_label_recognition.md               라벨 인식 → Edge Function
- CLAUDE.md                                   이 레포 정체성·아키텍처·금지 규칙

[v0.1.0 Internal Alpha scope]
1주 안에 동작하는 클라이언트 12 화면 + Supabase 백엔드 + 핵심 흐름 검증.

includes:
  Tier 0 — Supabase 셋업:
  - supabase init + 프로젝트 생성 (Northeast Asia / 서울 region)
  - supabase/migrations/20260519000000_init.sql:
    - users (Supabase Auth 자동 생성하는 auth.users 참조)
    - wines (id, name, producer ko/en, region ko/en, country, vintage, drink_window_from/peak/to, bottle_color)
    - tasting_notes (id, user_id, wine_id, mode, rating, beginner_fields jsonb, expert_fields jsonb, tasted_at)
    - cellar_items (id, user_id, wine_id, acquired_at, storage, purchase_price_krw, notes, notify_at_peak)
  - RLS 정책:
    - tasting_notes: 본인만 SELECT/INSERT/UPDATE/DELETE
    - cellar_items: 본인만 SELECT/INSERT/UPDATE/DELETE
    - wines: 모두 SELECT (read-only public)
  - supabase/seed.sql: 와인 카탈로그 시드 (키스크린 mock 30개 와인)
  - supabase gen types → shared/types/database.types.ts 생성
  - Storage 버킷: label-photos (사용자 폴더별 권한)

  Tier 0 — App 인프라:
  - Expo 프로젝트 생성 + TypeScript strict
  - @supabase/supabase-js + AsyncStorage adapter 셋업
  - 익명화 유틸 (HMAC-SHA256 → adjective-noun-number, specs/domain/policies/anonymization.md 따름)
  - LocaleText / LocalizedString 공통 컴포넌트
  - 디자인 토큰 import (../winemine-keyscreen/docs/design-system/colors.md를 RN StyleSheet로)
  - 공통 컴포넌트 (BottomNav, AppHeader, BackHeader 등)

  Tier 0 — Edge Functions (최소):
  - supabase/functions/label-scan/index.ts (mock 응답으로)
    - 입력: photo_url
    - 출력: { wine_id: 'tus-brunello-terralsole-riserva' } (시안)

  Tier 1 — 12 화면 (RN+Expo):
  - 온보딩 4단계 (/onboarding)
  - 홈 (/) — heavy + first-time 분기
  - 캡처 (/capture) — 4 옵션 + Edge Function 호출
  - 와인 상세 (/wine/[id]) — 기본만 (외부평점·가격차트·커뮤니티 음용적기 placeholder)
  - 셀러 리스트 (/cellar) — 2 탭, 검색·정렬
  - 셀러 상세 (/cellar/[id])
  - 노트 출처 picker (/notes/new)
  - 노트 작성 (/notes/new/write) — beginner + expert
  - 노트 상세 (/notes/[noteId])
  - 설정 홈·언어·경험·외관 (/settings 4개)

defers (다음 milestone):
  - 지도 (/map) — react-native-maps 셋업 무거움, v0.2.0
  - 와인 상세 sub 3개 (/wine/[id]/{story,prices,community-peak})
  - 즐겨찾기·뱃지·사진·알림·글로사리·프로필 계열 8 화면
  - 커뮤니티 전체 9 라우트
  - 양식 builder (/settings/tasting-template/*)
  - 결제 (Plan D 전제 — 6개월간 안 넣음)
  - 외부 평점 연동 (Vivino/WS/CT 크롤링)
  - 푸시 알림 발송 (Supabase Edge Functions + FCM/APNs)

[필수 결정 사항 — spec 작성 전 사용자에게 묻고 답 받을 것]
- Navigation: Expo Router (권장) vs React Navigation
- 스타일링: NativeWind (Tailwind, 권장) vs StyleSheet vs styled-components
- 상태 관리: Zustand (권장) vs Jotai vs Redux Toolkit
- 네트워크 wrapper: Supabase client 직접 (권장 v0.1.0) vs TanStack Query
- 아이콘: lucide-react-native (권장) vs @expo/vector-icons
- i18n: i18next (권장) vs lingui vs format.js
- 차트 (와인 상세 placeholder): Victory Native vs react-native-svg + 직접
- 환경변수 관리: expo-constants (권장) vs react-native-config
- Expo SDK 버전 (51+ 권장)
- Supabase region (Northeast Asia / 서울 권장 — 가장 가까움)
- 익명화 salt 환경변수명 (WINEMINE_ANONYMIZATION_SALT 권장, Supabase Edge Functions Secrets에 저장)
- 라벨 인식 v0.1.0 처리: mock 응답 (권장) vs 외부 API 즉시 통합 (Google Vision/AWS Rekognition)

[절대 금지]
- emoji 사용 금지 (코드·docs·SQL·UI 모두)
- specs/ 안 파일 수정 금지 (read-only submodule)
- ../winemine-keyscreen/ 안 파일 수정 금지 (Phase 2 frozen)
- LocalizedString ko/en 양쪽 누락 금지 (영어 모드 한글 누출 X)
- 사용자 ID(Supabase UUID) 공개 노출 금지 (익명화 패턴 사용 강제)
- RLS 비활성 테이블 생성 금지 (모든 사용자 데이터 테이블 필수)
- SUPABASE_SERVICE_ROLE_KEY를 RN 코드에 import 금지 (Edge Functions의 Deno.env에만)
- 시크릿 코드 commit 금지 (Supabase Dashboard Secrets 사용)
- mock 데이터 RN 코드에 하드코딩 금지 (supabase/seed.sql로 DB에 시드)
- Edge Functions에 비즈니스 로직 over-engineering 금지 (Plan D 전제, §4-8 CLAUDE.md)

[테스트 정책]
v0.1.0 Internal Alpha 단계라 testing은 light. v0.2.0에서 강화 예정.
필수만:
- SQL 단위 테스트 (RLS 정책 검증 — 사용자 A의 노트를 B가 못 보는지)
- Edge Functions: Deno test로 happy path 1개씩
- RN: 핵심 컴포넌트 (BottomNav, AppHeader) snapshot 정도
defers (v0.2.0):
- 전체 E2E (Detox/Maestro)
- 컴포넌트 단위 테스트 전수
- Edge Functions 에러 케이스 전수

[원하는 spec 구조]
<spec milestone="v0.1.0" goal="internal-alpha" timebox="1주">
  <scope>
    <includes> Tier 0 인프라 + Tier 0 Edge Functions + Tier 1 12 화면 </includes>
    <defers> 위 defers 목록 + 결제(6개월간) </defers>
  </scope>
  <tech-decisions> 확정 결정 + 미결정 답변 결과 </tech-decisions>
  <references> 기존 자료 link만 (path) </references>
  <tasks>
    <task id="T1" deps="" estimate="0.5d">
      title: Expo 프로젝트 생성 + Supabase CLI 셋업
      input: 결정된 라이브러리들
      output:
        - package.json
        - app.json (Expo config)
        - supabase/config.toml
      verification: npx expo start 으로 빈 화면 띄움 + supabase start 로컬 DB 동작
    </task>
    <task id="T2" deps="T1" estimate="1d">
      title: 초기 SQL migration (wines, tasting_notes, cellar_items + RLS)
      ...
    </task>
    ...
  </tasks>
  <verification>
    v0.1.0 완료 기준:
    - Supabase project 생성 + migration 적용
    - 12 화면 모두 RN으로 변환 + Expo Go에서 동작
    - Auth: anonymous sign-in 동작
    - 노트 작성 → DB 저장 → 노트 상세 read-back 동작
    - 라벨 캡처 → Edge Function 호출 → 결과 와인 카드 표시
    - RLS 정책 통과 (사용자 A의 노트를 B가 못 봄)
    - 모든 UI 텍스트 ko/en 양쪽
    - 사용자 ID 익명화 패턴 적용 (적용 endpoint 식별)
  </verification>
</spec>

[task 단위 가이드]
- 0.5~1.5일 단위 (1주 안에 다 끝내야 하니 작게)
- 화면 1개당 1 task (컴포넌트 + 상태 + Supabase 연결)
- SQL migration 1~2 task (Tier 0)
- Edge Function 1~2 task
- 인프라(Expo+Supabase+공통 컴포넌트) 합쳐서 2~3 task

[Internal Alpha 1주 일정 가이드 (참고)]
- Day 1: Tier 0 인프라 (Expo 생성, Supabase 셋업, migration 초안, RLS, 공통 컴포넌트)
- Day 2: 온보딩 4스텝 + 홈 (heavy + first-time)
- Day 3: 캡처 + Edge Function label-scan mock + 와인 상세
- Day 4: 셀러 리스트 + 셀러 상세 + 노트 출처 picker
- Day 5: 노트 작성 (beginner + expert) + 노트 상세
- Day 6: 설정 4개 + 디자인 토큰 polishing + 통합 테스트
- Day 7: 버그 fix + Expo build (TestFlight 업로드 또는 EAS Build) + 문서
(scope 늘어나면 일정 미끄러질 수 있음 — Internal Alpha는 fluid)

진행 절차:
1. 먼저 [필수 결정 사항] 사용자에게 묻기
2. 답 받은 뒤 spec 작성
3. 작성한 spec을 사용자에게 보여주고 review 받기
```

---

## 참고 — Plan D의 6개월 후 Spring 전환 시 영향

이 spec은 Full Supabase 1-repo 기준. 6개월 후 Plan D → Spring 전환할 때:
- 이 spec은 v0.1.0 history로 보존
- v2.0 spec writer 새로 돌려서 Spring 전환 task spec 별도 작성
- DB schema는 Supabase Postgres → Spring이 그대로 connect (변환 0)
- Edge Functions → Spring 서비스 (변환량 = Edge Functions 크기 비례, 최소화한 만큼 적음)
- 자세히는 CLAUDE.md §11 참조
