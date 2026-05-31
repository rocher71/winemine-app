-- 20260601000100_moderation_status.sql
-- 콘텐츠 테이블 moderation_status 컬럼 추가 + profiles.role 추가 + 기존 SELECT RLS 가시성 필터 확장.
-- Source: docs/spec/moderation.md <data_model> <column_additions>, <rls_and_triggers> block_filter (가시성 절).
--
-- CRITICAL: 기존 RLS 는 허용 범위 축소 금지 — 비작성자에게는 visible 만 노출하되,
--   작성자는 자기 pending/removed 도 열람 가능하도록 AND (... OR author=auth.uid()) 로만 결합한다.
--   차단 필터(block_filter)는 후속 20260601000400 에서 동일 USING 절에 추가 AND 로 결합.
-- 기존 wines / wine_korean_names 데이터·스키마 변경 없음 (손상 0).

-- ── moderation_status 컬럼 추가 (community_posts / tasting_notes / wine_lists / profiles) ──
-- comments 는 20260601000000 에서 이미 포함.
alter table public.community_posts add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible','pending','removed'));
alter table public.tasting_notes  add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible','pending','removed'));
alter table public.wine_lists     add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible','pending','removed'));
alter table public.profiles       add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible','pending','removed'));

-- ── profiles.role (admin RPC 인증용) ──
-- 일반 유저는 이 값을 직접 바꿀 수 없다(아래 UPDATE RLS WITH CHECK 에서 차단).
-- admin 지정은 Supabase Studio(service_role) 에서 수동.
alter table public.profiles add column if not exists role text not null default 'user'
  check (role in ('user','admin'));

-- ── community_posts SELECT RLS 확장: 가시성 필터 ──
-- 기존(20260530100000): visibility='public' OR author_id=auth.uid()
-- 확장: 위 조건 AND (moderation_status='visible' OR author_id=auth.uid())
drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select" on public.community_posts
  for select using (
    (visibility = 'public' or author_id = auth.uid())
    and (moderation_status = 'visible' or author_id = auth.uid())
  );

-- ── tasting_notes RLS: 기존은 FOR ALL (owner-only) ──
-- tasting_notes 는 owner-only(user_id=auth.uid()) 라 비작성자에게 애초에 노출되지 않는다.
-- 단, 공유 노트는 community_posts(type='note') 를 통해 노출되므로 노트 본체 모더레이션은
-- community_posts.moderation_status 로 제어된다. tasting_notes 자체 RLS 는 그대로 둔다
-- (owner-only 가 이미 가장 강한 제약 — 가시성/차단 필터 불필요).

-- ── wine_lists SELECT RLS 확장: 가시성 필터 ──
-- 기존(20260526000100): visibility='public' OR user_id=auth.uid()
drop policy if exists "wine_lists_select" on public.wine_lists;
create policy "wine_lists_select" on public.wine_lists
  for select using (
    (visibility = 'public' or user_id = auth.uid())
    and (moderation_status = 'visible' or user_id = auth.uid())
  );

-- ── profiles UPDATE RLS: role 자가 승격 차단 ──
-- 기존(20260519000000 / 20260527000000): profiles_update_own = id=auth.uid() (USING+WITH CHECK).
-- 확장: 본인 행만 수정하되, role 은 현재 저장된 값에서 바꿀 수 없도록 WITH CHECK 에 동등 조건 추가.
--   moderation_status 도 본인이 임의 변경 못 하도록 함께 잠근다(운영자 RPC/Studio 만 변경).
--   USING 절은 기존과 동일(본인 행) — 허용 범위 축소 아님.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and moderation_status = (select p.moderation_status from public.profiles p where p.id = auth.uid())
  );

-- ── profiles_public VIEW: 가시성 필터 ──
-- 크로스유저 프로필 표시는 profiles_public(security_invoker=false, base RLS 우회)를 통한다.
-- 따라서 프로필 모더레이션(닉네임·bio pending/removed 숨김)은 이 VIEW 에서 강제해야 한다.
--   본인 프로필은 항상 보이고, 타인 프로필은 moderation_status='visible' 일 때만 행 노출.
-- CREATE OR REPLACE VIEW 는 컬럼 추가만 허용(기존 컬럼 순서 보존). 컬럼 집합은 20260530100100 과 동일.
--   security_invoker=false 유지(타 유저 행 반환 목적). 안전 컬럼만 노출하는 기존 패턴 그대로.
--   차단 필터(blocked_user_ids)는 후속 20260601000400 에서 동일 WHERE 절에 AND 추가.
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
where moderation_status = 'visible' or id = auth.uid();

grant select on public.profiles_public to authenticated;
