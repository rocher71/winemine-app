# Supabase 통합 패턴

winemine-app(RN+Expo)에서 Supabase(DB·Auth·Storage·Edge Functions) 사용 패턴 모음.

---

## Auth 흐름 (익명 우선)

```typescript
// app 진입 시
const { data } = await supabase.auth.signInAnonymously();
// → JWT 발급, AsyncStorage에 자동 persist
// → 이후 모든 PostgREST/Edge Functions 호출에 Bearer 자동 첨부
```

이후 호출에서 `Authorization` 헤더 자동 첨부. user 객체는 `supabase.auth.getUser()`로.

---

## DB 접근 (PostgREST)

```typescript
// PostgREST 자동 endpoint
const { data: wines } = await supabase
  .from('wines')
  .select('*')
  .range(0, 19);  // pagination — Range header 사용

// RLS가 권한 강제 — 본인 노트만 조회 가능
const { data: notes } = await supabase
  .from('tasting_notes')
  .select('*')
  .order('tasted_at', { ascending: false });
```

응답 shape: PostgREST 표준 (array 직접 반환). 우리 envelope `{data, meta}` 적용 안 됨 (specs/api/CONVENTIONS.md §Plan D 적용 범위).

---

## Storage (라벨 사진)

```typescript
const { data, error } = await supabase.storage
  .from('label-photos')
  .upload(`${user.id}/${Date.now()}.jpg`, file);

// public URL 또는 signed URL
const { data: { publicUrl } } = supabase.storage
  .from('label-photos')
  .getPublicUrl(data.path);
```

버킷 권한은 Supabase Dashboard에서 설정 — 사용자 폴더별 RLS-style 제한.

---

## Edge Functions (커스텀 로직)

```typescript
// supabase/functions/label-scan/index.ts (Deno 런타임)
import { serve } from 'https://deno.land/std/http/server.ts';
serve(async (req) => {
  // 라벨 인식 외부 API 호출 등
  return new Response(JSON.stringify({ wine_id: '...' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// 클라이언트 호출
const { data, error } = await supabase.functions.invoke('label-scan', {
  body: { photo_url: '...' }
});
```

**Plan D 전제**: Edge Functions는 외부 API wrapper만 (CLAUDE.md §4-8). 비즈니스 로직 over-engineering 금지.

---

## 환경변수

| 변수 | 위치 | public? |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` (RN 빌드 시 번들 포함) | [OK] public OK |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` | [OK] public OK (RLS로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Supabase Dashboard → Edge Functions → Secrets만** | [NO] RN 절대 X |
| `SUPABASE_JWT_SECRET` | 동일 (Edge Functions만) | [NO] RN 절대 X |
| `WINEMINE_ANONYMIZATION_SALT` | 동일 (Edge Functions만) | [NO] RN 절대 X |

Edge Functions에서 시크릿 접근:
```typescript
const salt = Deno.env.get('WINEMINE_ANONYMIZATION_SALT')!;
```

---

## TS 타입 자동 생성

```bash
# Supabase 프로젝트에 link된 상태에서
supabase gen types typescript --linked > shared/types/database.types.ts
```

생성된 타입 사용:
```typescript
import { Database } from '@/shared/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(url, anonKey);
// 이제 supabase.from('wines').select() 가 fully typed
```

---

## RLS 정책 작성 패턴

```sql
-- 본인 노트만 조회·수정·삭제 가능
alter table tasting_notes enable row level security;

create policy "own notes only — select"
  on tasting_notes for select
  using (auth.uid() = user_id);

create policy "own notes only — insert"
  on tasting_notes for insert
  with check (auth.uid() = user_id);

create policy "own notes only — update"
  on tasting_notes for update
  using (auth.uid() = user_id);

create policy "own notes only — delete"
  on tasting_notes for delete
  using (auth.uid() = user_id);
```

**테스트 필수**: 사용자 A의 노트를 B 토큰으로 조회 시 빈 결과여야 함.

---

## 관련 문서

- [CLAUDE.md §4](../CLAUDE.md) — 절대 금지 규칙 (RLS·시크릿·익명화)
- [docs/COMMANDS.md](./COMMANDS.md) — Supabase CLI 명령
- `../specs/domain/policies/anonymization.md` — 익명화 정책
