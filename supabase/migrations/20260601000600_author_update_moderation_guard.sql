-- 20260601000600_author_update_moderation_guard.sql
-- 보안 수정(M1b): author-owned UPDATE 가 moderation_status 컬럼 자가변경을 허용해
--   작성자가 자기 pending/removed 콘텐츠를 visible 로 self-restore(모더레이션 우회) 가능했다.
-- Source: 자동 보안 리뷰 HIGH 지적(유효). docs/spec/moderation.md 우회금지(§4-6) 취지.
--
-- 구현 방식 = BEFORE UPDATE 트리거(컬럼 불변 가드). RLS WITH CHECK 의 self-subquery 로 OLD 값을
--   읽으려 하면 같은 테이블 SELECT RLS 가 재귀 호출돼 "infinite recursion detected in policy" 가
--   발생한다. 트리거는 OLD/NEW 를 직접 비교하므로 RLS 재귀 없이 안전하게 불변성을 강제한다.
--
-- 정당 경로 통과 원리: PostgREST 요청은 role 이 'authenticated'/'anon' 으로 강등돼 실행되지만,
--   SECURITY DEFINER 함수(admin RPC moderation_restore/remove/dismiss, 임계값 트리거
--   apply_report_thresholds) 내부에서는 current_user 가 함수 소유자(postgres)가 된다.
--   따라서 트리거는 "moderation_status 가 바뀌었고 current_user 가 요청 role(authenticated/anon) 일 때만"
--   차단한다. 운영자 RPC/트리거/service_role/Studio(superuser) 는 그대로 통과.
-- 기존 wines / wine_korean_names 변경 없음 (손상 0). 기존 author-owned 정책 USING/WITH CHECK 불변(권한 축소 없음).
-- profiles 는 20260601000100 의 RLS role/moderation_status 가드를 그대로 유지한다(이 트리거는 콘텐츠 테이블 4종만).

create or replace function public.guard_moderation_status()
returns trigger language plpgsql as $$
begin
  -- moderation_status 가 변하지 않으면 통과(일반 본문/제목 수정 등).
  if new.moderation_status is not distinct from old.moderation_status then
    return new;
  end if;
  -- 변경 시도 시: 요청 role(authenticated/anon)이면 차단. 권한 role(postgres 등 정당 경로)은 통과.
  if current_user in ('authenticated', 'anon') then
    raise exception 'moderation_status is not user-modifiable (use admin moderation RPC)'
      using errcode = '42501';
  end if;
  return new;
end $$;

comment on function public.guard_moderation_status() is
  'BEFORE UPDATE 가드: 요청 role(authenticated/anon)이 moderation_status 를 직접 바꾸지 못하게 차단(자가 모더레이션 우회 방지). admin RPC/임계값 트리거(SECURITY DEFINER, current_user=postgres)와 service_role 은 통과.';

drop trigger if exists trg_guard_moderation_comments on public.comments;
create trigger trg_guard_moderation_comments
  before update on public.comments
  for each row execute function public.guard_moderation_status();

drop trigger if exists trg_guard_moderation_community_posts on public.community_posts;
create trigger trg_guard_moderation_community_posts
  before update on public.community_posts
  for each row execute function public.guard_moderation_status();

drop trigger if exists trg_guard_moderation_tasting_notes on public.tasting_notes;
create trigger trg_guard_moderation_tasting_notes
  before update on public.tasting_notes
  for each row execute function public.guard_moderation_status();

drop trigger if exists trg_guard_moderation_wine_lists on public.wine_lists;
create trigger trg_guard_moderation_wine_lists
  before update on public.wine_lists
  for each row execute function public.guard_moderation_status();
