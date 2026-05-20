---
name: integration-coherence-check
description: "winemine 통합 정합성 검증 체크리스트. RLS ↔ 클라이언트 호출 교차 검증, wines_localized VIEW ↔ 훅 ↔ WineNameDisplay shape 비교, 기존 wines/wine_korean_names count diff 0 검증, ko/en·dark/light 양쪽 모드 검증, emoji·하드코딩 hex·SUPABASE_SERVICE_ROLE_KEY 격리 grep, LWIN 형식 검증, OAuth 골격 호환성 검증, profiles 트리거 동작 검증. QA 검증, 통합 정합성 점검, 회귀 차단, 빌드 전 게이트 요청 시 사용."
---

# Integration Coherence Check — winemine 경계면 검증 체크리스트

이 스킬은 qa-inspector가 incremental 검증할 때 따르는 절차다. 핵심 원칙: **"양쪽 동시 읽기"** — 한쪽만 보면 경계면 버그를 못 잡는다.

## 검증 영역 (우선순위)

1. **기존 데이터 손상 0 (CRITICAL)** — 비가역적
2. **RLS ↔ 클라이언트 호출** — 보안·기능 양쪽 영향
3. **wines_localized VIEW ↔ 훅 ↔ WineNameDisplay shape**
4. **ko/en·dark/light 양쪽 모드**
5. **emoji·하드코딩 hex·SERVICE_ROLE 격리**
6. **LWIN 형식·FK 일치**
7. **OAuth 골격 호환성 (v0.2.0 사전)**
8. **profiles 트리거·anonymize 동작**

## 영역별 절차

### 1. 기존 데이터 손상 0 (마이그레이션 적용 전후 매번)

```bash
# 적용 전
psql "$DB_URL" -c "SELECT 'wines' AS t, count(*) FROM public.wines
                   UNION ALL SELECT 'wine_korean_names', count(*) FROM public.wine_korean_names;"
# > pre.txt

# supabase db push --linked

# 적용 후 동일 쿼리
# > post.txt

diff pre.txt post.txt
# diff 0이어야 함
```

또한 schema diff:
```bash
pg_dump --schema-only --table=public.wines "$DB_URL" > pre_schema.sql
# push
pg_dump --schema-only --table=public.wines "$DB_URL" > post_schema.sql
diff pre_schema.sql post_schema.sql
# 0이어야 함
```

불일치 발견 시 즉시 모든 작업 stop + 리더에게 critical alert.

### 2. RLS ↔ 클라이언트 호출 교차 검증

**왼쪽 (정책)**: `supabase/migrations/*.sql`의 `create policy ... using (...) with check (...)`
**오른쪽 (호출)**: `src/hooks/use-*.ts`, `app/**/*.tsx`의 `supabase.from('...').select/insert/update/delete`

체크:
- 모든 사용자 데이터 SELECT가 RLS와 호환 (본인 데이터만 가져옴 — 빈 결과 디버깅 어려움)
- INSERT 시 `user_id`가 명시되고 `auth.uid()`와 일치하도록 보장
- 본인 외 데이터 시도 (악의적 또는 버그) 시 401/403 받는지 SQL 테스트 (supabase/tests/rls_*.sql)

### 3. wines_localized VIEW ↔ 훅 ↔ WineNameDisplay (CRITICAL — LWIN 도메인)

**3-way 교차 검증**:

A. VIEW 정의 (`supabase/migrations/20260519000400_wines_localized_view.sql`):
   - SELECT 컬럼 목록 추출
B. 타입 정의 (`shared/types/database.types.ts`):
   - `Database.public.Views.wines_localized.Row` 필드 확인
C. 훅 사용 (`src/hooks/use-wine.ts`):
   - `.select('컬럼1, 컬럼2, ...')` 또는 `.select('*')` → 사용처에서 어떤 필드 접근?
D. WineNameDisplay (`src/components/shared/wine-name-display.tsx`):
   - props (lwin, name_ko, display_name)가 항상 VIEW에서 제공되는지
   - name_ko가 null일 때 fallback 동작

비교 매트릭스:
| 컬럼 | VIEW 정의 | types.Row | 훅 select | 사용처 |
|---|---|---|---|---|
| lwin | text NOT NULL | string | 사용 | WineNameDisplay |
| display_name | text NOT NULL | string | 사용 | WineNameDisplay, WineCard |
| name_ko | text NULL | string \| null | 사용 | WineNameDisplay (fallback 처리 확인) |
| bottle_color | text NULL | string \| null | 사용 | WineHero (getDefaultBottleColor fallback) |
| type_canonical | text NULL | string \| null | 사용 | bottle_color fallback에 사용 |
| vintage | int NULL | number \| null | 사용 | WineMeta (없으면 "Vintage NA") |

null 처리 누락 시 런타임 크래시 → 즉시 발견.

### 4. ko/en·dark/light 양쪽 모드

#### ko/en
- `src/lib/i18n/en.json`의 모든 키가 `ko.json`에도 있는지 (역도):
  ```bash
  jq -r 'paths(scalars) | join(".")' src/lib/i18n/ko.json | sort > ko_keys.txt
  jq -r 'paths(scalars) | join(".")' src/lib/i18n/en.json | sort > en_keys.txt
  diff ko_keys.txt en_keys.txt
  ```
- 영어 모드 렌더에서 한글 grep (와인명 fallback 제외):
  빌드 결과 또는 스크린샷에서 `[가-힣]` 검색

#### dark/light
- 양쪽 모드에서 모든 화면 렌더 (시뮬레이터에서 토글)
- 하드코딩 hex grep (의도된 예외 제외):
  ```bash
  rg -n '#[0-9a-fA-F]{6}' src/ app/ \
    | rg -v 'design-tokens.ts|wine-card.tsx#bottle|seed.sql'
  # 결과 0건이어야 함
  ```
- 대비: WCAG AA 4.5:1 (수동 — 텍스트 가독성 확인)

### 5. 보안 격리 grep

```bash
# SERVICE_ROLE 격리
rg -n 'SUPABASE_SERVICE_ROLE_KEY' src/ app/ --type ts --type tsx
# 0건이어야 함 (supabase/functions/ 내부 Deno 코드는 OK)

# EXPO_PUBLIC_ 일치
rg -n 'EXPO_PUBLIC_\w+' src/ app/ -o | sort -u  # 사용된 변수
# .env.example 또는 app.config.ts와 비교

# 시크릿 파일
git ls-files | rg '\.env$|\.key$|\.pem$'
# 0건
```

### 6. emoji 검증

```bash
# Unicode emoji 또는 variation selector
rg -P '[\x{1F000}-\x{1FFFF}]|\x{FE0F}' src/ app/ supabase/ docs/
# 0건
```

### 7. LWIN 형식·FK 일치

- 클라이언트 zod schema 확인:
  ```bash
  rg -n 'wine_lwin.*regex' src/
  # /^\d{7}$|^\d{11}$|^\d{13}$/ 일치
  ```
- DB 측 FK는 wines.lwin (text). CHECK 추가 권장:
  ```sql
  check (length(wine_lwin) in (7, 11, 13))
  ```
- 라우트 파라미터 사용 시 parseInt 금지 (text 그대로)

### 8. OAuth 골격 호환성 (v0.2.0 사전)

```bash
# profiles 컬럼 확인
psql "$DB_URL" -c "\\d public.profiles"
# linked_providers text[], is_upgraded boolean, email text 존재

# auth providers stubs
ls src/lib/auth/providers/
# kakao.ts google.ts apple.ts 모두 존재
rg -n 'NotImplemented' src/lib/auth/providers/
# 3개 다 throw

# PKCE 활성
rg -n "flowType.*pkce" src/lib/supabase.ts
# 1건
```

### 9. profiles 트리거·anonymize

```sql
-- 신규 사용자 가입 시 profiles 자동 생성 확인
begin;
  insert into auth.users (id, aud, role) values (gen_random_uuid(), 'authenticated', 'authenticated');
  -- 트리거가 profiles 행 추가했는지
  select * from public.profiles where id = (select id from auth.users order by created_at desc limit 1);
  -- anonymous_display가 'adjective-noun-NN' 형식인지
rollback;
```

## 보고 형식

`_workspace/qa_{module}_{YYYYMMDD_HHMMSS}.md`:

```markdown
# QA 보고서 — {모듈명}

## 통과 (PASS)
- 검증 항목 1
- 검증 항목 2

## 실패 (FAIL)
- 항목 X — 파일:라인 — 기대: A — 실제: B — 수정 요청: {agent} 에게

## 미검증 (SKIPPED)
- 항목 Y — 사유: 의존 모듈 미완성

## 결정
- 다음 단계 진행 가능 여부
- 양쪽 에이전트 합의 필요한 경계면 이슈
```

발견 즉시 담당 에이전트에게 SendMessage. critical (기존 데이터 손상)은 리더에게 별도 alert.

## 절대 금지

- "전체 완성 후" 1회 검증 — incremental 원칙
- 한쪽만 보고 판단 — 반드시 양쪽 동시 읽기
- 통과/실패 모호한 보고 — 명확한 파일:라인 + 기대값 vs 실제값
- 스펙 외 항목 자체 추가 — 리더 승인 거침
- 검증 실패 무시하고 다음 진행

## 자세한 reference

QA 가이드: `~/.claude/plugins/cache/harness-marketplace/harness/1.2.0/skills/harness/references/qa-agent-guide.md` (메타 가이드)
스펙: `docs/spec/v0.1.0.md`의 `<security_considerations>`, `<success_criteria>`, `<key_implementation_notes>.<critical_paths>`
