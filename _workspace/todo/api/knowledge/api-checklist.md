# Knowledge Tab API 구현 체크리스트

생성일: 2026-05-26  
기준: `src/hooks/use-knowledge.ts` (mock 단계) → Supabase 교체 계획  
목표: v0.2.0 mock → v0.3.0 Supabase 실연동

상태 표시: `[ ]` 구현전 · `[구현중]` 구현중 · `[x]` 구현완료

---

## 화면 태그 범례

| 태그 | 화면 경로 |
|------|-----------|
| `[탭메인]` | `app/(tabs)/knowledge.tsx` |
| `[레슨상세]` | `app/knowledge/lesson/[lessonId].tsx` |
| `[레슨완료]` | `app/knowledge/lesson/[lessonId]/done.tsx` |
| `[학습기록]` | `app/knowledge/lesson/history.tsx` |
| `[지역상세]` | `app/knowledge/region/[regionId].tsx` |
| `[와이너리상세]` | `app/knowledge/winery/[wineryId].tsx` |
| `[라인업]` | `app/knowledge/winery/[wineryId]/lineup.tsx` |
| `[빈티지상세]` | `app/knowledge/vintage/[vintageId].tsx` |
| `[빈티지비교]` | `app/knowledge/vintage/compare.tsx` |
| `[빈티지차트]` | `app/knowledge/vintage/[regionId]/chart.tsx` |

---

## 1. 마이그레이션 SQL — 테이블 생성

> 파일 위치: `supabase/migrations/20260601000100_knowledge_tables.sql`

### 1-1. `knowledge_lessons`
- [ ] 테이블 생성 (id, day, category_ko, category_en, title_ko, title_en, subtitle_ko, subtitle_en, body, summary_ko, summary_en, read_minutes, published_at)
  - `body` 컬럼: `jsonb` — `Section[]` 직렬화 (type/paragraph/compare/callout/price-chart)
  - `day` 컬럼: `integer UNIQUE NOT NULL`
  - **태그:** `[탭메인]` `[레슨상세]` `[레슨완료]` `[학습기록]`

### 1-2. `lesson_completions`
- [ ] 테이블 생성 (id uuid PK, user_id uuid FK → auth.users, lesson_id text FK → knowledge_lessons.id, completed_at timestamptz DEFAULT now())
  - `UNIQUE(user_id, lesson_id)` — 중복 방지
  - **태그:** `[레슨완료]` `[학습기록]` `[레슨상세 StreakBar]`

### 1-3. `knowledge_regions`
- [ ] 테이블 생성 (id, type, parent_id FK self-ref, name_ko, name_en, name_latin, accent, grapes, stats, description_ko, description_en, climate, soil, grape_count, profile, tiers)
  - `type` 컬럼: `text CHECK (type IN ('country','subregion','appellation'))`
  - `grapes`, `profile`, `tiers`, `stats`: `jsonb`
  - **태그:** `[탭메인]` `[지역상세]`

### 1-4. `knowledge_wineries`
- [ ] 테이블 생성 (id, short_name, full_name, country, location_ko, location_en, established, acreage, flagship, philosophy_ko, philosophy_en, description_ko, description_en, accent_color, lineup, grand_crus)
  - `lineup`, `grand_crus`: `jsonb` — `WineEntry[]`, `CruEntry[]` 직렬화
  - **태그:** `[탭메인]` `[와이너리상세]` `[라인업]`

### 1-5. `knowledge_vintages`
- [ ] 테이블 생성 (id, region_ko, region_en, year, score, climate_ko, climate_en, tag_ko, tag_en, summary_ko, summary_en, accent_color, climate_events, pairing, related_vintages)
  - `climate_events`, `pairing`, `related_vintages`: `jsonb`
  - **태그:** `[탭메인]` `[빈티지상세]`

### 1-6. `vintage_charts`
- [ ] 테이블 생성 (region_id text PK, region_name_ko, region_name_en, years jsonb, tip_ko, tip_en)
  - `years`: `jsonb` — `VintageYearScore[]` (year, score, highlight, note_ko, note_en)
  - **태그:** `[빈티지차트]`

### 1-7. `vintage_compares`
- [ ] 테이블 생성 (id uuid PK, a_id text, b_id text, subheading_ko, subheading_en, rows jsonb, radar jsonb, verdict_ko, verdict_en)
  - `UNIQUE(a_id, b_id)` — 쌍 중복 방지
  - `rows`: `CompareRowData[]`, `radar`: `RadarAxisData[]`
  - **태그:** `[빈티지비교]`

---

## 2. RLS 정책

> 파일 위치: `supabase/migrations/20260601000200_knowledge_rls.sql`

### 콘텐츠 테이블 (읽기 전용, 모든 사용자)
- [ ] `knowledge_lessons` — `SELECT` for all (anon + authenticated)
  - **태그:** `[탭메인]` `[레슨상세]` `[레슨완료]` `[학습기록]`
- [ ] `knowledge_regions` — `SELECT` for all
  - **태그:** `[탭메인]` `[지역상세]`
- [ ] `knowledge_wineries` — `SELECT` for all
  - **태그:** `[탭메인]` `[와이너리상세]` `[라인업]`
- [ ] `knowledge_vintages` — `SELECT` for all
  - **태그:** `[탭메인]` `[빈티지상세]`
- [ ] `vintage_charts` — `SELECT` for all
  - **태그:** `[빈티지차트]`
- [ ] `vintage_compares` — `SELECT` for all
  - **태그:** `[빈티지비교]`

### 사용자 데이터 테이블 (본인만)
- [ ] `lesson_completions` — `SELECT` for `user_id = auth.uid()`
- [ ] `lesson_completions` — `INSERT` for `user_id = auth.uid()`
- [ ] `lesson_completions` — `UPDATE` for `user_id = auth.uid()` (재완료 시 completed_at 갱신)
  - **태그:** `[레슨완료]` `[학습기록]`

---

## 3. Seed 데이터

> 파일 위치: `supabase/seed_knowledge.sql`  
> 기준: `src/lib/mock/knowledge.ts` 데이터를 SQL INSERT로 변환

- [ ] `knowledge_lessons` seed — Day 1~12 (MOCK_LESSONS verbatim)
  - `body` jsonb: Section[] 직렬화 검증 필요 (paragraph/compare/callout/price-chart)
  - **태그:** `[탭메인]` `[레슨상세]` `[레슨완료]` `[학습기록]`
- [ ] `knowledge_regions` seed — 국가 5 + 하위 지역 12 (MOCK_REGIONS verbatim)
  - **태그:** `[탭메인]` `[지역상세]`
- [ ] `knowledge_wineries` seed — DRC / Opus One / Penfolds / Sassicaia (MOCK_WINERIES verbatim)
  - **태그:** `[탭메인]` `[와이너리상세]` `[라인업]`
- [ ] `knowledge_vintages` seed — bdx19 / bdx20 / bgn19 / pmt22 / mos21 (MOCK_VINTAGES verbatim)
  - pairing / related_vintages jsonb 포함
  - **태그:** `[탭메인]` `[빈티지상세]`
- [ ] `vintage_charts` seed — MOCK_VINTAGE_CHART_BORDEAUX (bordeaux 10년)
  - **태그:** `[빈티지차트]`
- [ ] `vintage_compares` seed — MOCK_VINTAGE_COMPARE_BDX (bdx19 vs bdx20)
  - **태그:** `[빈티지비교]`

---

## 4. RPC 함수 (SQL)

> 파일 위치: `supabase/migrations/20260601000300_knowledge_rpc.sql`

### `calc_lesson_streak(p_user_id uuid)`
- [ ] 함수 생성
  - 입력: `p_user_id uuid`
  - 출력: `(current_streak int, longest_streak int, total_completed int, completed_day_numbers int[])`
  - 로직:
    - `lesson_completions` WHERE `user_id = p_user_id` JOIN `knowledge_lessons` ON `lesson_id = id`
    - `completed_day_numbers`: 완료한 레슨의 `day` 번호 배열
    - `total_completed`: COUNT
    - `current_streak`: 오늘 기준 연속 완료일 역산 (lesson.published_at 기준)
    - `longest_streak`: 전체 이력의 최장 연속
  - 보안: `SECURITY DEFINER` 불필요 (RLS로 충분)
  - **태그:** `[탭메인 StreakBar]` `[레슨완료]` `[학습기록]`

---

## 5. PostgREST API — 쿼리 목록

### 5-1. 레슨

| # | 쿼리 | 용도 | 화면 태그 |
|---|------|------|-----------|
| L-1 | `SELECT * FROM knowledge_lessons ORDER BY day ASC` | 전체 레슨 목록 | `[탭메인]` `[학습기록]` |
| L-2 | `SELECT * FROM knowledge_lessons WHERE id = $1` | 레슨 단건 상세 | `[레슨상세]` `[레슨완료]` |
| L-3 | `SELECT * FROM knowledge_lessons ORDER BY day DESC LIMIT 1` | 오늘의 레슨 (가장 최신 day) | `[탭메인]` |

- [ ] L-1 구현 (`useLessons` 훅 교체)
- [ ] L-2 구현 (`useLessonDetail` 훅 교체)
- [ ] L-3 구현 (`useLessons.todayLesson` 로직 교체)

### 5-2. 학습 완료 기록

| # | 쿼리 | 용도 | 화면 태그 |
|---|------|------|-----------|
| C-1 | `SELECT lesson_id, completed_at FROM lesson_completions WHERE user_id = auth.uid()` | 완료 기록 전체 조회 | `[학습기록]` `[탭메인 StreakBar]` |
| C-2 | `INSERT INTO lesson_completions (user_id, lesson_id) VALUES (auth.uid(), $1) ON CONFLICT DO UPDATE SET completed_at = now()` | 학습 완료 기록 | `[레슨완료]` |
| C-3 | `SELECT calc_lesson_streak(auth.uid())` | Streak 계산 RPC | `[탭메인]` `[레슨상세]` `[레슨완료]` `[학습기록]` |

- [ ] C-1 구현 (학습기록 달력 완료 날짜 표시)
- [ ] C-2 구현 (`markComplete()` no-op → 실제 INSERT)
- [ ] C-3 구현 (`MOCK_STREAK` → RPC 결과로 교체)

### 5-3. 지역

| # | 쿼리 | 용도 | 화면 태그 |
|---|------|------|-----------|
| R-1 | `SELECT * FROM knowledge_regions WHERE type = 'country' ORDER BY name_en` | 국가 목록 | `[탭메인]` |
| R-2 | `SELECT * FROM knowledge_regions WHERE id = $1` | 지역 단건 | `[지역상세]` |
| R-3 | `SELECT * FROM knowledge_regions WHERE parent_id = $1 ORDER BY name_en` | 하위 지역 목록 | `[지역상세 드릴다운]` |

- [ ] R-1 구현 (`useRegions()` 훅 교체)
- [ ] R-2 구현 (`useRegionDetail` 훅 교체)
- [ ] R-3 구현 (`useRegionDetail.children` 로직 교체)

### 5-4. 와이너리

| # | 쿼리 | 용도 | 화면 태그 |
|---|------|------|-----------|
| W-1 | `SELECT id, short_name, country, location_ko, location_en, flagship, accent_color FROM knowledge_wineries ORDER BY short_name` | 와이너리 목록 (lineup/grand_crus 제외 — 성능) | `[탭메인]` |
| W-2 | `SELECT * FROM knowledge_wineries WHERE id = $1` | 와이너리 단건 (lineup, grand_crus 포함) | `[와이너리상세]` `[라인업]` |

- [ ] W-1 구현 (`useWineries()` 훅 교체)
- [ ] W-2 구현 (`useWineryDetail` 훅 교체)

### 5-5. 빈티지

| # | 쿼리 | 용도 | 화면 태그 |
|---|------|------|-----------|
| V-1 | `SELECT id, region_ko, region_en, year, score, tag_ko, tag_en, accent_color FROM knowledge_vintages ORDER BY score DESC` | 빈티지 목록 (climate_events/pairing 제외 — 성능) | `[탭메인]` |
| V-2 | `SELECT * FROM knowledge_vintages WHERE id = $1` | 빈티지 단건 (pairing, related_vintages 포함) | `[빈티지상세]` |
| V-3 | `SELECT * FROM vintage_charts WHERE region_id = $1` | 10년 차트 데이터 | `[빈티지차트]` |
| V-4 | `SELECT * FROM vintage_compares WHERE a_id = $1 AND b_id = $2` | 두 빈티지 비교 | `[빈티지비교]` |

- [ ] V-1 구현 (`useVintages()` 훅 교체)
- [ ] V-2 구현 (`useVintageDetail` 훅 교체)
- [ ] V-3 구현 (`useVintageChart` 훅 교체)
- [ ] V-4 구현 (`useVintageCompare` 훅 교체)

---

## 6. 훅 교체 — `src/hooks/use-knowledge.ts`

> 교체 시 시그니처 동일하게 유지 (이미 Supabase-compatible로 설계됨).  
> `isLoading: false` → `isLoading: boolean` 활성화 필요.

| 훅 | 현재 | 교체 대상 쿼리 |
|----|------|----------------|
| `useLessons()` | MOCK_LESSONS + MOCK_STREAK | L-1, L-3, C-3 |
| `useLessonDetail(id)` | MOCK_LESSONS.find | L-2 |
| `useLessonDetail.markComplete()` | no-op | C-2 |
| `useRegions(type, parentId)` | MOCK_REGIONS 필터 | R-1, R-3 |
| `useRegionDetail(id)` | MOCK_REGIONS.find | R-2, R-3 |
| `useWineries()` | MOCK_WINERIES | W-1 |
| `useWineryDetail(id)` | MOCK_WINERIES.find | W-2 |
| `useVintages()` | MOCK_VINTAGES | V-1 |
| `useVintageDetail(id)` | MOCK_VINTAGES.find | V-2 |
| `useVintageChart(regionId)` | MOCK_VINTAGE_CHART_BORDEAUX | V-3 |
| `useVintageCompare(aId, bId)` | MOCK_VINTAGE_COMPARE_BDX | V-4 |

- [ ] `useLessons()` 교체
- [ ] `useLessonDetail(id)` 교체 + `markComplete()` 실구현
- [ ] `useRegions()` / `useRegionDetail()` 교체
- [ ] `useWineries()` / `useWineryDetail()` 교체
- [ ] `useVintages()` / `useVintageDetail()` 교체
- [ ] `useVintageChart()` / `useVintageCompare()` 교체

---

## 7. 구현 순서 권장 (의존성 기준)

```
마이그레이션 SQL (1-1 ~ 1-7)
    ↓
RLS 정책 (2)
    ↓
Seed 데이터 (3)          ← wines count diff 0 검증 필수 (기존 wines 테이블 비접촉)
    ↓
RPC 함수 (4)
    ↓
훅 교체 (6) — 콘텐츠 먼저 (L, R, W, V), 이후 Completion (C) 순
    ↓
QA: 양쪽 locale(ko/en) + mock→real 데이터 동일성 확인
```

---

## 8. 주의사항

- `supabase gen types` 재실행 필요 — 신규 테이블 추가 후 `shared/types/database.types.ts` 갱신
- `jsonb` 컬럼 접근 시 런타임 파싱 (`JSON.parse`) 또는 PostgREST 자동 역직렬화 여부 확인 필요
- `lesson_completions` RLS: Anonymous 사용자도 `lesson_id` 기록 가능하도록 설계 권장 (익명 Auth UID 사용)
- `vintage_compares`는 `(a_id, b_id)` 순서 정규화 필요 — `a_id < b_id` 강제 저장 후 쿼리 시 정렬
- Streak 계산은 `knowledge_lessons.published_at` 기준이 아닌 `lesson_completions.completed_at` 기준으로 해야 날짜별 연속 계산이 정확함
