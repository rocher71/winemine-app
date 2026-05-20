---
name: winemine-data-access
description: "winemine Supabase 데이터 접근 표준 패턴. wines_localized VIEW 조회 (LWIN 기반), wine_korean_names join 한글명 우선, RLS 자동 필터링, supabase.from()/select()/insert()/update()/delete() 호출 패턴, anonymize 사용법, Storage label-photos 업로드, label-scan invoke. RN 훅 작성·QA 경계면 검증 요청 시 사용."
---

# winemine Data Access — supabase.from() 표준 패턴

이 스킬은 rn-screen-builder가 데이터 훅을 만들 때, qa-inspector가 경계면을 검증할 때 공통으로 참조한다.

## 테이블·VIEW 매핑

| 용도 | 대상 | 쓰임 |
|---|---|---|
| 와인 catalog (외부, read-only) | `public.wines` | 직접 X (대신 wines_localized 사용) |
| 한글명 매핑 (외부, read-only) | `public.wine_korean_names` | 직접 X (VIEW가 join 처리) |
| 와인 통합 조회 | `public.wines_localized` (VIEW) | **모든 와인 SELECT는 여기로** |
| 와인 메타 (우리 앱 specific) | `public.wine_metadata` | 직접 SELECT 거의 없음 (VIEW가 join) |
| 사용자 프로필 | `public.profiles` | useProfile 훅 — 본인만 |
| 시음 노트 | `public.tasting_notes` | useNotes 훅 — 본인만 (RLS) |
| 셀러 | `public.cellar_items` | useCellar 훅 — 본인만 (RLS) |

## 7가지 표준 호출

### 1. 와인 단건 조회

```ts
const { data, error } = await supabase
  .from('wines_localized')
  .select('*')
  .eq('lwin', lwin)
  .single();
```

### 2. 와인 검색 (ko+en 동시)

```ts
const { data } = await supabase
  .from('wines_localized')
  .select('lwin, display_name, name_ko, producer_name, country, vintage, bottle_color, type_canonical')
  .or(`display_name.ilike.%${q}%,name_ko.ilike.%${q}%`)
  .limit(20);
```

### 3. 본인 노트 리스트 + 와인 join

```ts
const { data } = await supabase
  .from('tasting_notes')
  .select(`
    *,
    wine:wines_localized!inner(lwin, display_name, name_ko, bottle_color, type_canonical, vintage)
  `)
  .eq('user_id', uid)
  .order('tasted_at', { ascending: false })
  .limit(20);
```

`!inner`는 INNER JOIN — 와인이 wines_localized에 없으면(status != 'Live') 노트가 빠짐. 의도적 (deprecated 와인 숨김).

### 4. 노트 INSERT (zod 검증 후)

```ts
const { data, error } = await supabase
  .from('tasting_notes')
  .insert({
    user_id: session.user.id,
    wine_lwin,
    mode: 'beginner',
    rating: 4.0,
    beginner_fields: { wset: {...}, aroma_tags: [...], comments: '...' },
    tasted_at: '2026-05-19',
    source: 'cellar',
  })
  .select()
  .single();
```

`user_id` 명시 — RLS의 `with check (user_id = auth.uid())`가 통과해야 함.

### 5. 셀러 status 토글

```ts
await supabase
  .from('cellar_items')
  .update({ status: 'consumed', consumed_at: new Date().toISOString().slice(0,10) })
  .eq('id', cellarId);
// RLS가 본인 row만 update 허용
```

### 6. 프로필 sync

```ts
// SELECT (트리거가 생성했으므로 항상 존재)
const { data: profile } = await supabase
  .from('profiles').select('*').eq('id', uid).single();

// UPDATE (mode/experience/language/theme 등)
await supabase
  .from('profiles')
  .update({ mode: 'heavy' })
  .eq('id', uid);
```

### 7. Storage 업로드 + label-scan

```ts
// 업로드
const path = `${uid}/${uuid()}.jpg`;
const { error: upErr } = await supabase.storage
  .from('label-photos')
  .upload(path, blob, { contentType: 'image/jpeg' });

// 공개 URL (RLS로 본인만 접근 — getPublicUrl이지만 정책상 본인 폴더만)
const { data: { publicUrl } } = supabase.storage
  .from('label-photos').getPublicUrl(path);

// label-scan 호출
const { data: scan } = await supabase.functions.invoke('label-scan', {
  body: { photo_url: publicUrl }
});
// scan.lwin → wines_localized 조회
```

## RLS 동작 이해

- 모든 호출에 JWT 헤더 자동 (supabase-js 내장)
- 정책에 `using (user_id = auth.uid())` 있으면 SELECT 시 본인 데이터만 자동 필터링
- INSERT 시 `with check (user_id = auth.uid())`가 통과해야 함 — 다른 user_id 넣으면 403
- 명시적 `.eq('user_id', uid)`는 RLS와 중복이지만 가독성·디버깅에 도움 — 권장

## RLS 함정 (qa-inspector 검증 대상)

- `eq('id', someId)` 누락 시 빈 결과 — RLS 때문에 거른 게 맞는지 확인 필요
- `single()`이 0 rows에 에러 → `.maybeSingle()`로 fallback 검토
- INSERT 시 `user_id` 빠뜨림 → RLS 정책 통과해도 컬럼 NOT NULL이라 에러

## 익명화 사용

profiles.anonymous_display는 트리거가 INSERT 시 자동 채움 (SQL anonymize 함수). 클라이언트는 SELECT만:

```ts
const { data } = await supabase.from('profiles').select('anonymous_display').single();
// data.anonymous_display: 'velvety-fox-37'
```

클라이언트에서 HMAC 직접 호출 (`src/lib/anonymize.ts`)은 v0.1.0 백업 경로 — production은 항상 profiles.anonymous_display.

## 절대 금지

- `supabase.from('wines').select()` — VIEW가 아닌 raw 테이블 직접 SELECT (한글명 join 누락)
- `eq('user_id', ...)` 외 다른 사용자 ID 사용 (자기 외 사용자 데이터 조회 시도)
- `service_role` 클라이언트에서 사용
- INSERT 시 `user_id` 누락 (또는 session.user.id 외 값)
- RLS 정책 우회 위해 RPC + security definer 함수 남용

## QA 경계면 체크리스트 (qa-inspector 전용)

| 비교 대상 | 왼쪽 (DB/VIEW) | 오른쪽 (RN 훅) |
|---|---|---|
| 컬럼 shape | wines_localized SELECT 컬럼 | use-wine.ts의 select() + 사용 |
| FK 일치 | tasting_notes.wine_lwin (text) | INSERT input의 wine_lwin 타입 |
| RLS 필터 | policy의 user_id = auth.uid() | 훅의 .eq('user_id', uid) 또는 의도된 누락 |
| 응답 shape | maybeSingle() 결과 nullable | 사용처의 null 처리 |
| Storage path | RLS 정책의 storage.foldername | 업로드 path 구성 |

## 자세한 reference

스펙: `docs/spec/v0.1.0.md`의 `<core_data_entities>`, `<authentication>`, `<core_functionality>`. Supabase 패턴: `docs/SUPABASE_PATTERNS.md`.
