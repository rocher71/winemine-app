-- 20260601000500_admin_api.sql
-- admin RPC(restore/remove/dismiss) + admin_pending_queue VIEW.
-- Source: docs/spec/moderation.md <admin_api>.
--
-- 앱 내 admin UI 없음 — 미래 admin 페이지가 그대로 호출할 RPC + 운영자 검토용 큐 VIEW 만 제공.
-- 모든 RPC: SECURITY DEFINER + 진입부에서 caller role 검증
--   (select role from profiles where id = auth.uid()) = 'admin' 아니면 RAISE EXCEPTION.
-- Studio(service_role)에서는 직접 SQL 로 동일 작업 가능. 일반 유저 호출 차단.
-- target_type 매핑은 트리거(20260601000200)와 동일.

-- ── 공통: caller admin 검증 헬퍼 ─────────────────────────────────────────────
create or replace function public.assert_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce((select role from public.profiles where id = auth.uid()), 'user') <> 'admin' then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;
end $$;

comment on function public.assert_admin() is
  'admin RPC 진입 가드. caller profiles.role 이 admin 이 아니면 42501 예외. security definer 로 role 조회.';

-- ── moderation_restore: 콘텐츠 visible 복원 ──────────────────────────────────
create or replace function public.moderation_restore(p_target_type text, p_target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  case p_target_type
    when 'post'    then update public.community_posts set moderation_status = 'visible' where id = p_target_id;
    when 'comment' then update public.comments        set moderation_status = 'visible' where id = p_target_id;
    when 'note'    then update public.tasting_notes   set moderation_status = 'visible' where id = p_target_id;
    when 'list'    then update public.wine_lists      set moderation_status = 'visible' where id = p_target_id;
    when 'profile' then update public.profiles        set moderation_status = 'visible' where id = p_target_id;
    else raise exception 'invalid target_type: %', p_target_type using errcode = '22023';
  end case;
end $$;

comment on function public.moderation_restore(text, uuid) is
  'admin: 콘텐츠 moderation_status -> visible 복원. caller admin 검증.';

-- ── moderation_remove: 운영자 확정 삭제 ──────────────────────────────────────
create or replace function public.moderation_remove(p_target_type text, p_target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  case p_target_type
    when 'post'    then update public.community_posts set moderation_status = 'removed' where id = p_target_id;
    when 'comment' then update public.comments        set moderation_status = 'removed' where id = p_target_id;
    when 'note'    then update public.tasting_notes   set moderation_status = 'removed' where id = p_target_id;
    when 'list'    then update public.wine_lists      set moderation_status = 'removed' where id = p_target_id;
    when 'profile' then update public.profiles        set moderation_status = 'removed' where id = p_target_id;
    else raise exception 'invalid target_type: %', p_target_type using errcode = '22023';
  end case;
end $$;

comment on function public.moderation_remove(text, uuid) is
  'admin: 콘텐츠 moderation_status -> removed 확정 삭제(원문 보존). caller admin 검증.';

-- ── report_dismiss: 신고 기각 + 콘텐츠 visible 복원 ──────────────────────────
-- 해당 target 의 open/reviewed reports 를 dismissed 로. 콘텐츠가 pending 이면 visible 복원
--   (운영자가 신고를 부당하다 판단). removed 는 명시적 remove 결정이므로 자동 복원하지 않음.
create or replace function public.report_dismiss(p_target_type text, p_target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  update public.reports
    set status = 'dismissed'
    where target_type = p_target_type and target_id = p_target_id and status <> 'dismissed';
  case p_target_type
    when 'post'    then update public.community_posts set moderation_status = 'visible' where id = p_target_id and moderation_status = 'pending';
    when 'comment' then update public.comments        set moderation_status = 'visible' where id = p_target_id and moderation_status = 'pending';
    when 'note'    then update public.tasting_notes   set moderation_status = 'visible' where id = p_target_id and moderation_status = 'pending';
    when 'list'    then update public.wine_lists      set moderation_status = 'visible' where id = p_target_id and moderation_status = 'pending';
    when 'profile' then update public.profiles        set moderation_status = 'visible' where id = p_target_id and moderation_status = 'pending';
    else raise exception 'invalid target_type: %', p_target_type using errcode = '22023';
  end case;
end $$;

comment on function public.report_dismiss(text, uuid) is
  'admin: 해당 target 의 reports.status -> dismissed + pending 콘텐츠 visible 복원(removed 는 유지). caller admin 검증.';

grant execute on function public.moderation_restore(text, uuid) to authenticated;
grant execute on function public.moderation_remove(text, uuid) to authenticated;
grant execute on function public.report_dismiss(text, uuid) to authenticated;

-- ── admin_pending_queue VIEW ─────────────────────────────────────────────────
-- pending + removed 콘텐츠를 target_type 무관 통합. 고유 신고자 수 / 최근 신고시각으로 정렬.
-- security_invoker = true: 호출자 권한으로 평가 -> 일반 유저가 SELECT 하면 콘텐츠 RLS(가시성·차단)에
--   막혀 빈 결과에 가깝고, reports 집계도 본인 신고건만 보인다. 운영자는 service_role 로 전체 조회.
-- removed(자동 10건 포함)도 노출 — 운영자가 복구 여부 검토 가능해야 하므로(스펙 NOTE).
create or replace view public.admin_pending_queue
with (security_invoker = true) as
with flagged as (
  select 'post'::text    as target_type, id as target_id, author_id, moderation_status,
         left(coalesce(title, body), 200) as preview, created_at
    from public.community_posts where moderation_status in ('pending','removed')
  union all
  select 'comment'::text, id, author_id, moderation_status, left(body, 200), created_at
    from public.comments where moderation_status in ('pending','removed')
  union all
  select 'note'::text, id, user_id, moderation_status, wine_lwin, created_at
    from public.tasting_notes where moderation_status in ('pending','removed')
  union all
  select 'list'::text, id, user_id, moderation_status, left(title, 200), created_at
    from public.wine_lists where moderation_status in ('pending','removed')
  union all
  select 'profile'::text, id, id, moderation_status, left(coalesce(nickname, anonymous_display), 200), created_at
    from public.profiles where moderation_status in ('pending','removed')
),
report_stats as (
  select target_type, target_id,
         count(distinct reporter_id) as unique_reporters,
         max(created_at) as last_reported_at
    from public.reports
   group by target_type, target_id
)
select
  f.target_type,
  f.target_id,
  f.author_id,
  f.moderation_status,
  f.preview,
  f.created_at,
  coalesce(rs.unique_reporters, 0) as unique_reporters,
  rs.last_reported_at
from flagged f
left join report_stats rs on rs.target_type = f.target_type and rs.target_id = f.target_id
order by coalesce(rs.unique_reporters, 0) desc, rs.last_reported_at desc nulls last;

comment on view public.admin_pending_queue is
  '운영자 검토 큐: pending+removed 콘텐츠 통합. 고유 신고자수 desc, 최근 신고시각 desc 정렬. security_invoker=true — 전체 조회는 service_role 로.';

grant select on public.admin_pending_queue to authenticated;
