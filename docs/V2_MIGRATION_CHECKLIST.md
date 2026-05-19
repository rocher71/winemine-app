# v2.0 마이그레이션 체크리스트 (Plan D → Spring Boot 전환)

6개월 후 결제 도입·트래픽 증가 시 Spring Boot로 백엔드 전환할 때 따르는 절차.

> **현재(v0.1.0~v1.x)**: Plan D — Full Supabase 1-repo
> **전환 트리거**: 결제 도입 또는 사용자 검수 필요성 절실해질 때
> **추정 작업 시간**: 약 4주 (Edge Functions 양에 비례)

---

## 사전 점검 (전환 시작 전)

- [ ] 사용자 수·트래픽 측정 (Supabase Free 한도 근접한가)
- [ ] Edge Functions 코드 양 측정 (`wc -l supabase/functions/**/*.ts`)
- [ ] 비즈니스 로직 위치 점검 (SQL/RLS vs Edge Functions 비율)
- [ ] 결제 PG 결정 (Toss / Stripe / 아임포트 등)
- [ ] DB 사이즈 확인 (500MB Free 한도 vs Pro 필요?)
- [ ] 키스크린 단계의 디자인 시스템과 v0.1.0~v1.x 진화 비교 검토

---

## 전환 단계

### Phase A: 인프라 준비 (약 5일)

- [ ] `~/dev/winemine-server` GitHub repo **unarchive**
- [ ] Spring Boot 프로젝트 setup (Spring Initializr → Gradle Kotlin DSL)
  - Web, Validation, Security, Data JPA, PostgreSQL, Testcontainers, Springdoc
- [ ] Java 21 (또는 더 최신 LTS) 셋업
- [ ] `winemine-specs/` submodule 추가 (`git submodule add ...`)
- [ ] OpenAPI Generator Gradle plugin 셋업 (interfaceOnly)
- [ ] Flyway 셋업
- [ ] Supabase Postgres에 Spring이 JDBC 연결
  - `spring.datasource.url=jdbc:postgresql://<ref>.supabase.co:5432/postgres`
  - HikariCP connection pool
- [ ] Flyway baseline 설정 (**기존 supabase migrations을 baseline으로 등록**)

### Phase B: Auth · 보안 (약 2일)

- [ ] Supabase JWT 검증 Spring Security Filter 작성
  - HS256 검증 (SUPABASE_JWT_SECRET 환경변수)
  - claims에서 user UUID 추출 → SecurityContext에 Principal 설정
- [ ] `@AuthenticationPrincipal` 통합 테스트
- [ ] 익명화 유틸 Java 포팅 (HMAC-SHA256 → adjective-noun-number)

### Phase C: 결제 endpoint 우선 이전 (약 1주)

- [ ] 결제 PG 통합 (PG SDK)
- [ ] 결제 endpoint(들) Spring으로 작성
- [ ] webhook 처리 endpoint
- [ ] 결제 관련 PostgREST endpoint 모두 비활성 (deprecate)
- [ ] app에서 결제 호출 URL → Spring으로 변경

### Phase D: 다른 endpoint 점진 이전 (약 1~2주)

- [ ] Edge Functions → Spring 서비스로 변환 (1개씩)
  - 변환량 = Edge Functions 코드 양 × 1.5~2 (Java verbose)
- [ ] 각 endpoint마다 통합 테스트 (@WebMvcTest + Testcontainers)
- [ ] PostgREST endpoint 점진 deprecate
  - app에서 endpoint별 base URL 분기
  - `/api/v1/...` (Spring) vs `supabase.from(...)` (PostgREST 잔존)

### Phase E: 호스팅 셋업 (약 3일)

- [ ] Dockerfile 작성
- [ ] Fly.io 셋업 (`fly launch`)
- [ ] 시크릿 설정 (`fly secrets set SUPABASE_JWT_SECRET=... SUPABASE_SERVICE_ROLE_KEY=...`)
- [ ] CI/CD 셋업 (GitHub Actions → fly deploy)
- [ ] 도메인 + TLS

### Phase F: 검증 · 모니터링 (약 3일)

- [ ] 전체 통합 테스트
- [ ] Sentry 또는 Datadog 통합
- [ ] CloudWatch 또는 Fly metrics
- [ ] Load test (k6 등)
- [ ] 점진 cutover (트래픽 일부 → 전체)

---

## DB schema 처리

**변환 0** — Supabase Postgres 그대로 Spring이 connect:
- 기존 `supabase/migrations/*.sql`을 Flyway `db/migration/V1__init.sql`로 baseline
- 이후 추가 schema 변경은 Flyway가 관리
- Supabase Dashboard에서 직접 schema 변경 금지 (Spring Flyway가 진실 소스)

---

## app 측 변경

- [ ] API client에 endpoint별 base URL 분기 로직
- [ ] Auth flow는 그대로 (Supabase Auth → JWT)
- [ ] 응답 shape 변경 처리:
  - Spring endpoint → `{data, meta}` envelope
  - PostgREST endpoint (잔존) → array 직접
  - 두 패턴 모두 처리하는 wrapper 또는 TanStack Query 도입 시점

---

## 검증 시점에 다시 점검

- [ ] `specs/api/CONVENTIONS.md` 적용 범위 갱신 (Spring endpoint는 우리 컨벤션 부활)
- [ ] `specs/TBD.md`에 v2.0 결정 로그 추가
- [ ] winemine-keyscreen은 이미 archive (v1.x 시점에 처리됨)
- [ ] 메모리 갱신 (`project-winemine-phase3-repo.md` v2.0 섹션)
- [ ] 새 spec writer prompt 작성 (v2.0 milestone 기준)

---

## 참조

- `specs/domain/wine-research/site/src/content/docs/misc/72_backend_spring_boot.md` — Phase 3 master plan (v2.0 시점에 reference로 활용)
- `winemine-server/` GitHub repo (archive 상태)
- [CLAUDE.md §4-8](../CLAUDE.md) — Plan D 전제 (TS code 작게 유지)
