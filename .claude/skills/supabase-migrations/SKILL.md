---
name: supabase-migrations
description: "winemine Supabase 마이그레이션 작성 가이드. profiles/wine_metadata/tasting_notes/cellar_items 테이블, RLS 정책, anonymize SQL 함수, handle_new_user 트리거, wines_localized VIEW (security_invoker=true), Storage 정책을 작성할 때 사용. CRITICAL: 기존 public.wines / public.wine_korean_names 손상 0 보장. 마이그레이션 SQL 작성, RLS 작성, VIEW 작성, 트리거 작성, 기존 데이터 보호 검증 요청 시 반드시 사용."
---

# Supabase Migrations — winemine v0.1.0 백엔드 스키마 작성

이 스킬은 supabase-engineer 에이전트가 winemine의 6개 마이그레이션을 작성할 때 따르는 절차다.

## 절대 원칙 (CRITICAL)

1. **기존 `public.wines`, `public.wine_korean_names`에 ALTER TABLE 금지** — 한 줄도. 우리 앱 specific은 신규 테이블/VIEW로 분리.
2. **모든 사용자 데이터 테이블에 `alter table ... enable row level security` 필수** — profiles, tasting_notes, cellar_items, wine_metadata. RLS 미적용 테이블 생성 금지.
3. **마이그레이션 적용 전후 count diff 0 검증 필수**:
   ```
   psql $DB_URL -c "SELECT count(*) FROM public.wines; SELECT count(*) FROM public.wine_korean_names;"
   # supabase db push --linked
   # 동일 명령 재실행 → 결과 일치
   ```
4. **emoji·SQL 코멘트의 한글 깨짐 주의** — UTF-8 인코딩, 코멘트 영문 권장.

## 파일 순서와 책임

| 순서 | 파일 | 책임 |
|---|---|---|
| 1 | 20260519000000_profiles.sql | anonymize 함수 + profiles + handle_new_user 트리거 |
| 2 | 20260519000100_wine_metadata.sql | wine_metadata 테이블 + RLS public_read |
| 3 | 20260519000200_tasting_notes.sql | tasting_notes + 인덱스 + RLS own |
| 4 | 20260519000300_cellar_items.sql | cellar_items + 인덱스 + RLS own + CHECK constraint |
| 5 | 20260519000400_wines_localized_view.sql | VIEW + wine_metadata type_canonical seed |
| 6 | 20260519000500_storage_label_photos.sql | bucket + 폴더 격리 정책 |

## 진실 소스

`docs/spec/v0.1.0.md`의 `<key_implementation_notes>.<database_schema>` 섹션에 6개 파일의 핵심 SQL이 그대로 작성되어 있다. **자의적 변경 금지** — 그대로 옮기되 다음만 추가:
- 모든 SQL 상단에 `-- {file}: {role}` 코멘트
- 마이그레이션은 idempotent하게 (`create table if not exists`, `on conflict do nothing`)

## RLS 정책 패턴

```sql
-- 본인 데이터만 (tasting_notes, cellar_items)
create policy "{table}_all_own" on public.{table} for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 본인 SELECT/UPDATE만 (profiles)
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- public read (wine_metadata)
create policy "{table}_public_read" on public.{table} for select using (true);
```

INSERT 정책이 없으면 차단된다. profiles INSERT는 트리거가 처리하므로 정책 불필요 (트리거는 `security definer`로 RLS 우회).

## wines_localized VIEW 특수 사항

```sql
create view public.wines_localized
with (security_invoker = true) as  -- Postgres 15+ 필수
select ...
from public.wines w
left join lateral (
  select name_ko from public.wine_korean_names
  where lwin = w.lwin
  order by confidence desc nulls last, id asc
  limit 1
) kn on true
left join public.wine_metadata wm on wm.lwin = w.lwin
where w.status = 'Live';

grant select on public.wines_localized to anon, authenticated;
```

`security_invoker = true`가 빠지면 anon role이 SELECT 못 한다 (VIEW는 owner 권한 상속이 기본).

## 트리거 + SQL 함수 패턴

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, anonymous_display)
  values (new.id, public.anonymize(new.id));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
```

`security definer`는 RLS 우회를 위한 것 — 트리거가 사용자 권한이 아닌 함수 소유자 권한으로 실행되어야 profiles INSERT 가능.

## 익명화 SQL 함수

```sql
create or replace function public.anonymize(user_id uuid)
returns text language plpgsql immutable as $$
declare
  adjectives text[] := array[...50개..., specs/domain/policies/anonymization.md 따름];
  nouns text[] := array[...50개...];
  h bytea;
begin
  h := extensions.hmac(user_id::text, current_setting('app.anonymization_salt', true), 'sha256');
  -- bytes 3개로 (adj, noun, num 0-99) 매핑
  return adjectives[(get_byte(h,0) % array_length(adjectives,1)) + 1]
      || '-' || nouns[(get_byte(h,1) % array_length(nouns,1)) + 1]
      || '-' || (((get_byte(h,2)*256) + get_byte(h,3)) % 100)::text;
end $$;
```

salt 설정: `ALTER DATABASE postgres SET app.anonymization_salt = '...';` (Supabase Vault 또는 Dashboard SQL editor에서 1회)

## 적용 절차

1. 로컬 검증: `supabase db reset` (로컬 docker DB 초기화 + 마이그레이션 + seed 모두 적용)
2. 로컬 dry run pass 시 원격 적용 사전 검증:
   ```
   psql $REMOTE_DB_URL -c "SELECT count(*) FROM public.wines, public.wine_korean_names;"  # 현재 count 기록
   ```
3. `supabase db push --linked`
4. 적용 후 동일 count 확인 → 일치하지 않으면 즉시 alert
5. `supabase gen types typescript --linked > shared/types/database.types.ts`

## SQL 테스트 (RLS 격리)

```sql
-- supabase/tests/rls_tasting_notes.sql
begin;
  select plan(2);

  -- 사용자 A로 노트 INSERT
  set local "request.jwt.claim.sub" to 'user-a-uuid';
  insert into public.tasting_notes (user_id, wine_lwin, mode, tasted_at)
    values ('user-a-uuid', '1012345', 'beginner', current_date);

  -- 사용자 B로 전환 → A의 노트 SELECT 시 빈 결과
  set local "request.jwt.claim.sub" to 'user-b-uuid';
  select ok((select count(*) from public.tasting_notes where user_id = 'user-a-uuid') = 0,
            'RLS: user B cannot see user A notes');

  select * from finish();
rollback;
```

## 절대 금지

- `alter table public.wines ...` 모든 형태
- `delete from public.wines ...`
- `truncate public.wines ...`
- RLS 비활성 테이블 생성
- `SUPABASE_SERVICE_ROLE_KEY`를 마이그레이션에 하드코딩
- emoji 사용 (SQL 코멘트 포함)
- VIEW에서 `security_invoker` 빠뜨림 → anon role SELECT 실패

## 자세한 reference

전체 SQL 전문은 `docs/spec/v0.1.0.md`의 `<key_implementation_notes>.<database_schema>` 참조. 정책 모호 시 `docs/SUPABASE_PATTERNS.md` 참조.
