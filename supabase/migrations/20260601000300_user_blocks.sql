-- 20260601000300_user_blocks.sql
-- user_blocks 테이블 + blocked_user_ids() SECURITY DEFINER + 차단 시 follows 양방향 자동해제.
-- Source: docs/spec/moderation.md <data_model> table=user_blocks, <rls_and_triggers> block_filter / follow_auto_release.
-- 기존 wines / wine_korean_names 변경 없음 (손상 0). follows 는 행 DELETE 만(트리거), 스키마 변경 없음.

create table if not exists public.user_blocks (
  id         uuid        primary key default gen_random_uuid(),
  blocker_id uuid        not null references auth.users(id) on delete cascade,
  blocked_id uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists idx_user_blocks_blocker on public.user_blocks(blocker_id);
create index if not exists idx_user_blocks_blocked on public.user_blocks(blocked_id);

alter table public.user_blocks enable row level security;

-- SELECT: 본인 차단목록만(blocker_id=auth.uid()). 내가 누구를 차단했는지만 보이고,
--   나를 누가 차단했는지는 노출하지 않는다(차단의 비가시성).
drop policy if exists "user_blocks_select_own" on public.user_blocks;
create policy "user_blocks_select_own" on public.user_blocks
  for select using (blocker_id = auth.uid());

drop policy if exists "user_blocks_insert_own" on public.user_blocks;
create policy "user_blocks_insert_own" on public.user_blocks
  for insert with check (blocker_id = auth.uid());

drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own" on public.user_blocks
  for delete using (blocker_id = auth.uid());

-- ── blocked_user_ids(): 양방향 합집합 ────────────────────────────────────────
-- auth.uid() 기준: 내가 차단한 자(blocked_id) ∪ 나를 차단한 자(blocker_id).
-- SECURITY DEFINER 로 user_blocks 의 owner-only SELECT RLS 를 우회해 "나를 차단한 자"까지 조회.
--   (RLS 상 일반 SELECT 로는 blocker_id=auth.uid() 행만 보이므로, 반대 방향은 definer 가 필요.)
-- STABLE: 한 트랜잭션 내 동일 결과. 콘텐츠 RLS USING 절에서 ARRAY(SELECT ...) 로 사용.
create or replace function public.blocked_user_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select blocked_id from public.user_blocks where blocker_id = auth.uid()
  union
  select blocker_id from public.user_blocks where blocked_id = auth.uid()
$$;

comment on function public.blocked_user_ids() is
  '현재 auth.uid() 기준 양방향 차단 합집합(내가 차단 ∪ 나를 차단). security definer 로 양방향 모두 조회. 콘텐츠 SELECT RLS 의 차단 필터에 사용.';

grant execute on function public.blocked_user_ids() to authenticated;

-- ── 차단 시 follows 양방향 자동 해제 ─────────────────────────────────────────
-- user_blocks AFTER INSERT. blocker<->blocked 사이 follows 양방향 edge 삭제(specs Decision 4).
-- follows DELETE 는 follower=blocker 또는 follower=blocked 양쪽 — follows 의 follow_counts 트리거가
--   자동으로 카운터를 보정한다(20260527000100). security definer 로 양쪽 행 삭제 권한 확보.
create or replace function public.release_follows_on_block()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.follows
    where (follower_id = new.blocker_id and following_id = new.blocked_id)
       or (follower_id = new.blocked_id and following_id = new.blocker_id);
  return new;
end $$;

comment on function public.release_follows_on_block() is
  '차단 생성 시 blocker<->blocked 양방향 follows edge 자동 삭제. follow_counts 트리거가 카운터 보정. specs Decision 4.';

drop trigger if exists on_block_release_follows on public.user_blocks;
create trigger on_block_release_follows
  after insert on public.user_blocks
  for each row execute function public.release_follows_on_block();
