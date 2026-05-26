# Cellar Tab — Supabase API 계획서

> PostgREST(supabase-js) 기반. HTTP endpoint 직접 호출 없이 `supabase.from()` 패턴만 사용.
> 인증: Anonymous Auth JWT (RLS `user_id = auth.uid()` 자동 필터).

---

## 데이터베이스 테이블 / 뷰 요약

| 이름 | 유형 | 비고 |
|---|---|---|
| `cellar_items` | Table | 사용자 셀러 항목 (RLS enabled) |
| `wines_localized` | View | LWIN + 한글명 + wine_metadata JOIN (security_invoker = true) |
| `tasting_notes` | Table | 테이스팅 노트 (cellar 탭 count 표시용) |

### `cellar_items` 컬럼

| 컬럼 | 타입 | 제약 |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | auth.users(id), RLS 필터 기준 |
| `wine_lwin` | text FK | wines(lwin) |
| `status` | text | 'cellared' \| 'consumed' |
| `acquired_at` | date | NOT NULL, `<= current_date` (DB CHECK) |
| `consumed_at` | date | NULL 허용. status='consumed' 이면 필수 (CHECK) |
| `storage` | text | max 100자 |
| `purchase_price_krw` | int | >= 0 |
| `quantity` | int | >= 1, default 1 |
| `notes_ko` | text | 사용자 메모 (한국어) |
| `notes_en` | text | 사용자 메모 (영어) |
| `notify_at_peak` | bool | default true |
| `created_at` | timestamptz | now() |

---

## API 목록

### C-1. 셀러 카운트 조회 (cellared / consumed)

홈 탭 셀러 요약 + 셀러 탭 헤더 숫자 배지용.

**호출**
```ts
// cellared 카운트
supabase
  .from('cellar_items')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', uid)
  .eq('status', 'cellared')

// consumed 카운트 (병렬)
supabase
  .from('cellar_items')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', uid)
  .eq('status', 'consumed')
```

**Response**
```ts
{
  count: number | null,  // null 이면 0으로 처리
  error: PostgrestError | null
}
```

**에러 케이스**
- 세션 없음: uid null → count 0 반환 (throw 없음)
- Supabase 오류: `error` 필드 throw

---

### C-2. 셀러 목록 조회 (status 기준)

셀러 탭 리스트 + 마신 와인 탭 리스트.

**호출**
```ts
supabase
  .from('cellar_items')
  .select(`
    *,
    wine:wines_localized!inner(
      lwin, display_name, name_ko, producer_name,
      country, region, bottle_color, type_canonical, vintage,
      drink_window_from_year, drink_window_peak_year, drink_window_to_year
    )
  `)
  .eq('user_id', uid)
  .eq('status', status)              // 'cellared' | 'consumed'
  .order(orderColumn, { ascending: false, nullsFirst: false })
  // orderColumn: status='cellared' → 'acquired_at', status='consumed' → 'consumed_at'
```

**Response**
```ts
Array<{
  // cellar_items 전체 컬럼
  id: string
  user_id: string
  wine_lwin: string
  status: 'cellared' | 'consumed'
  acquired_at: string          // YYYY-MM-DD
  consumed_at: string | null
  storage: string | null
  purchase_price_krw: number | null
  quantity: number
  notes_ko: string | null
  notes_en: string | null
  notify_at_peak: boolean | null
  created_at: string

  // wines_localized JOIN
  wine: {
    lwin: string
    display_name: string | null
    name_ko: string | null
    producer_name: string | null
    country: string | null
    region: string | null
    bottle_color: string | null
    type_canonical: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert' | null
    vintage: number | null
    drink_window_from_year: number | null
    drink_window_peak_year: number | null
    drink_window_to_year: number | null
  } | null
}>
```

**클라이언트 필터 (서버 아님)**

서버에서 전체 목록 수신 후, 클라이언트에서 아래 필터 적용:
- 검색: `display_name`, `name_ko`, `producer_name`, `region`, `country` 대소문자 무시 포함
- 타입 필터: `wine.type_canonical` 일치 (`all` 이면 전체)
- 정렬: `recent` / `drinkSoon` / `vintage` / `region` / `storage` / `price` (`cellar-filters.ts`)

> 목록 크기가 small (v0.1.0 단일 사용자, 수백 병 이하)이라 클라이언트 필터로 충분. v2 이후 서버 cursor 페이징 고려.

---

### C-3. 셀러 단건 조회 (상세 화면)

`/cellar/[lwin]` 상세 진입 시.

**호출**
```ts
// cellarItemId 있을 때 (목록에서 탭)
supabase
  .from('cellar_items')
  .select(`
    *,
    wine:wines_localized!inner(
      lwin, display_name, name_ko, producer_name,
      country, region, classification, bottle_color, type_canonical, vintage,
      drink_window_from_year, drink_window_peak_year, drink_window_to_year
    )
  `)
  .eq('user_id', uid)
  .eq('wine_lwin', lwin)
  .eq('id', cellarItemId)
  .maybeSingle()

// cellarItemId 없을 때 (lwin 직접 딥링크)
supabase
  .from('cellar_items')
  .select(`...`)
  .eq('user_id', uid)
  .eq('wine_lwin', lwin)
  .order('acquired_at', { ascending: false })
  .limit(1)
  .maybeSingle()
```

**Response**
```ts
// 단건 또는 null
{
  // cellar_items 전체 컬럼 (C-2와 동일)
  wine: {
    // C-2 wine 필드 + classification 추가
    classification: string | null
  }
} | null
```

**에러 케이스**
- `null` 반환: EmptyState 표시 (삭제됐거나 다른 사용자 항목)
- DB 오류: error throw

---

### C-4. 셀러 항목 추가 (Add to Cellar)

와인 상세 화면 → "셀러에 추가" CTA.

**호출**
```ts
supabase.from('cellar_items').insert({
  user_id: uid,
  wine_lwin: wineLwin,
  status: 'cellared',
  acquired_at: string,           // YYYY-MM-DD, <= today (zod + DB CHECK)
  quantity: number,              // >= 1
  purchase_price_krw: number | null,
  storage: string | null,        // max 100자
})
```

**Request 유효성 검사 (클라이언트 zod)**
```ts
z.object({
  acquired_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => new Date(d) <= new Date()),
  quantity: z.number().int().min(1),
  purchase_price_krw: z.number().int().min(0).optional().nullable(),
  storage: z.string().max(100).optional().nullable(),
})
```

**DB 제약 (이중 방어)**
- `acquired_at <= current_date` (CHECK)
- `quantity >= 1` (CHECK)
- `purchase_price_krw >= 0` (CHECK)
- `storage` max 100자 (CHECK)

**Response**
```ts
{ data: CellarItemRow[] | null, error: PostgrestError | null }
```

**성공 후 동작**
- `onSuccess()` 콜백 → 셀러 목록 refresh
- Toast "셀러에 추가됐습니다" / "Added to cellar"

**에러 케이스**
- 세션 없음: throw 'no session'
- 중복 LWIN: DB 제약 없음 (동일 LWIN 여러 행 허용 — 여러 빈티지·구매 이력)
- DB 오류: error toast 표시

---

### C-5. 셀러 항목 수정 (Edit)

셀러 상세 → Edit 버튼 → `AddToCellarSheet` mode='edit'.

수정 가능 필드: `acquired_at`, `quantity`, `purchase_price_krw`, `storage`

**호출**
```ts
supabase
  .from('cellar_items')
  .update({
    acquired_at: string,
    quantity: number,
    purchase_price_krw: number | null,
    storage: string | null,
  })
  .eq('id', cellarItemId)
  .eq('user_id', uid)            // RLS 이중 방어
```

**Response**
```ts
{ error: PostgrestError | null }
```

**수정 불가 필드**
- `wine_lwin`, `user_id`, `created_at` — 서버/RLS에서 차단
- `status`, `consumed_at` — C-6(상태 전환) API 별도

---

### C-6. 셀러 상태 전환 (cellared ↔ consumed)

"이 와인 마셨어요" CTA / 셀러에 되돌리기.

**호출**
```ts
// cellared → consumed
supabase
  .from('cellar_items')
  .update({
    status: 'consumed',
    consumed_at: new Date().toISOString().slice(0, 10),  // 오늘 날짜
  })
  .eq('id', id)

// consumed → cellared (롤백)
supabase
  .from('cellar_items')
  .update({
    status: 'cellared',
    consumed_at: null,
  })
  .eq('id', id)
```

**DB 제약**
- `status = 'consumed'` 이면 `consumed_at IS NOT NULL` (CHECK `consumed_needs_date`)
- RLS: `user_id = auth.uid()` (자신 항목만 수정 가능)

**Response**
```ts
{ error: PostgrestError | null }
```

---

### C-7. 피크 알림 토글 (notify_at_peak)

셀러 상세 → NotifyToggleCard 스위치.

**호출**
```ts
supabase
  .from('cellar_items')
  .update({ notify_at_peak: boolean })
  .eq('id', id)
  .eq('user_id', uid)
```

**Response**
```ts
{ error: PostgrestError | null }
```

**낙관적 업데이트**: 스위치 즉시 반영 → 실패 시 원복 + error toast.

---

### C-8. 셀러 항목 삭제

셀러 상세 → 삭제 아이콘 → Alert 확인.

**호출**
```ts
supabase
  .from('cellar_items')
  .delete()
  .eq('id', id)
  // RLS가 user_id 필터 자동 적용
```

**Response**
```ts
{ error: PostgrestError | null }
```

**성공 후 동작**: `router.back()` → 셀러 목록으로 복귀.

**에러 케이스**
- 이미 삭제된 항목: `error` null, 영향 row 0 → 동일하게 뒤로 이동 (멱등)
- 다른 사용자 항목: RLS로 차단 (영향 row 0)

---

### C-9. 와인별 테이스팅 노트 카운트

셀러 상세 "내 노트 N개" 표시.

**호출**
```ts
supabase
  .from('tasting_notes')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', uid)
  .eq('wine_lwin', lwin)
```

**Response**
```ts
{ count: number | null, error: PostgrestError | null }
```

**비고**: 노트 없으면 count=0 표시. 에러는 warn 로그만 (UI 비차단).

---

## 정렬 기준 서버 vs 클라이언트

| 기준 | 처리 위치 | 비고 |
|---|---|---|
| `recent` (기본) | 서버 `.order()` | acquired_at / consumed_at DESC |
| `drinkSoon` | 클라이언트 | drink-window 계산 필요 |
| `vintage` | 클라이언트 | LWIN 파싱 필요 |
| `region` | 클라이언트 | locale sort |
| `storage` | 클라이언트 | 문자열 sort |
| `price` | 클라이언트 | number sort |

---

## 에러 처리 공통 패턴

```ts
// 훅 내부
try {
  const { data, error } = await supabase.from('cellar_items').select(...)
  if (error) throw error
  setState(data)
} catch (e) {
  setError(e instanceof Error ? e : new Error(String(e)))
} finally {
  setLoading(false)
}
```

UI 표시:
- 로딩 중: ActivityIndicator
- 에러: EmptyState `tone="error"` 또는 Toast `tone="error"`
- 빈 목록: EmptyState (에러 아님)

---

## 미구현 / v2 고려 사항

| 항목 | 현재 | v2 계획 |
|---|---|---|
| 검색 | 클라이언트 필터 | 서버 full-text search (`websearch_to_tsquery`) |
| 페이징 | 전체 fetch | cursor pagination (`range()`) |
| 피크 알림 Push | toggle 저장만 | Edge Function + APNs/FCM |
| 메모 다국어 입력 UI | notes_ko / notes_en 분리 저장 | 단일 필드 UI + locale 감지 분기 |
| 셀러 통계 | 미구현 | SQL RPC `get_cellar_stats(uid)` |
