-- 20260601000400_block_filter_rls.sql
-- 각 콘텐츠 SELECT RLS USING 절에 양방향 차단 필터 추가. 가시성 필터(20260601000100)와 함께 AND 결합.
-- Source: docs/spec/moderation.md <rls_and_triggers> block_filter.
--
-- CRITICAL: 기존 허용 범위 축소 금지 — AND 로만 결합. 차단 필터는
--   author_id <> ALL (ARRAY(SELECT public.blocked_user_ids())) 형태.
--   본인 콘텐츠는 차단 합집합에 자기 자신이 들어가지 않으므로(self-block 금지) 항상 통과.
-- 기존 wines / wine_korean_names 변경 없음 (손상 0).

-- ── community_posts ──────────────────────────────────────────────────────────
drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select" on public.community_posts
  for select using (
    (visibility = 'public' or author_id = auth.uid())
    and (moderation_status = 'visible' or author_id = auth.uid())
    and author_id <> all (array(select public.blocked_user_ids()))
  );

-- ── comments ─────────────────────────────────────────────────────────────────
-- removed 댓글은 스레드 구조 보존 위해 행 노출(본문은 UI tombstone). 단 차단 상대 댓글은 숨김.
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select using (
    (moderation_status in ('visible','removed') or author_id = auth.uid())
    and author_id <> all (array(select public.blocked_user_ids()))
  );

-- ── wine_lists ───────────────────────────────────────────────────────────────
drop policy if exists "wine_lists_select" on public.wine_lists;
create policy "wine_lists_select" on public.wine_lists
  for select using (
    (visibility = 'public' or user_id = auth.uid())
    and (moderation_status = 'visible' or user_id = auth.uid())
    and user_id <> all (array(select public.blocked_user_ids()))
  );

-- ── follows ──────────────────────────────────────────────────────────────────
-- 팔로워/팔로잉 목록에서도 차단 상대가 사라져야 한다. 기존(20260527000100): auth.uid() is not null.
-- 양 끝점(follower_id / following_id) 중 어느 쪽도 차단 합집합에 없을 때만 노출.
drop policy if exists "follows_select_any" on public.follows;
create policy "follows_select_any" on public.follows
  for select using (
    auth.uid() is not null
    and follower_id <> all (array(select public.blocked_user_ids()))
    and following_id <> all (array(select public.blocked_user_ids()))
  );

-- ── tasting_notes ────────────────────────────────────────────────────────────
-- owner-only(FOR ALL using user_id=auth.uid()) 라 비작성자에게 애초 비노출 -> 차단 필터 불필요.
--   본인 노트는 차단 합집합에 자기 자신 없으므로 영향 없음. (정책 변경 없음.)

-- ── profiles_public VIEW: 차단 필터 추가 ─────────────────────────────────────
-- 크로스유저 프로필 표시 경로. 가시성 필터(20260601000100)에 차단 필터 AND 결합.
--   본인 프로필은 id=auth.uid() 로 항상 통과. 차단 상대 프로필은 행 제외.
create or replace view public.profiles_public
with (security_invoker = false) as
select
  id,
  anonymous_display,
  handle,
  bio,
  level,
  public_wines_count,
  public_countries_count,
  public_regions_count,
  public_notes_count,
  follower_count,
  following_count,
  created_at,
  nickname
from public.profiles
where (moderation_status = 'visible' or id = auth.uid())
  and id <> all (array(select public.blocked_user_ids()));

grant select on public.profiles_public to authenticated;
