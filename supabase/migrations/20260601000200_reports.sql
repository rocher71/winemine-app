-- 20260601000200_reports.sql
-- reports 테이블(polymorphic target) + RLS + 2단계 임계값 DB 트리거.
-- Source: docs/spec/moderation.md <data_model> table=reports, <rls_and_triggers> threshold_trigger.
--
-- target_type 명명 (open_question 해소):
--   'post'    = community_posts (post 의 자체 type 이 note/column/album/news/question/list 무관 — 커뮤니티 발행 글 전체)
--   'comment' = comments
--   'note'    = tasting_notes (공유 시음 노트 본체. community_posts(type='note') 와 구분 위해 'note' 별도 명명)
--   'list'    = wine_lists
--   'profile' = profiles
--   => community 발행 글은 항상 'post', 시음 노트 본체는 'note'. 트리거/admin RPC 모두 동일 매핑 재사용.
-- 임계값 상수: 고유 신고자 >= 3 -> pending(모든 콘텐츠) / > 10 AND comment -> removed(댓글만). 추후 설정화 future.

create table if not exists public.reports (
  id          uuid        primary key default gen_random_uuid(),
  reporter_id uuid        not null references auth.users(id) on delete cascade,
  target_type text        not null check (target_type in ('post','comment','note','list','profile')),
  target_id   uuid        not null,
  reason      text        not null check (reason in ('spam','harassment','sexual','misinfo','impersonation','other')),
  detail      text        check (detail is null or char_length(detail) <= 1000),
  status      text        not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at  timestamptz not null default now(),
  -- 동일 유저는 동일 target 을 1회만 신고 가능(중복 카운트 방지, specs Decision 2).
  unique (reporter_id, target_type, target_id),
  -- other 사유는 자유입력(detail) 필수.
  constraint reports_other_requires_detail check (reason <> 'other' or detail is not null)
);

create index if not exists idx_reports_target on public.reports(target_type, target_id);
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_reports_status on public.reports(status);

alter table public.reports enable row level security;

-- INSERT: 본인(reporter_id=auth.uid()) 만. 무인증은 auth.uid() NULL 로 자동 차단.
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (reporter_id = auth.uid());

-- SELECT: 본인 신고건만. 피신고 콘텐츠 작성자에게 신고 사실 노출 금지(운영자는 service_role 로 전체 조회).
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports
  for select using (reporter_id = auth.uid());

-- UPDATE/DELETE: 일반 유저 정책 없음(=차단). 상태 변경은 admin RPC / service_role 만.

-- ── 2단계 임계값 트리거 ──────────────────────────────────────────────────────
-- reports AFTER INSERT. 동일 (target_type, target_id) 의 고유 reporter_id 수(n) 계산 후:
--   n >= 3                          -> 해당 콘텐츠 moderation_status 'visible' -> 'pending'
--   n > 10 AND target_type='comment'-> comments.moderation_status -> 'removed' (원문 보존)
-- 멱등: 이미 removed 면 무변경. pending->removed 전환 허용. visible/pending->pending 은 조건절로 멱등.
-- CASE target_type 분기로 콘텐츠 테이블 매핑. profiles 는 id 컬럼이 PK.
create or replace function public.apply_report_thresholds()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  unique_reporters int;
begin
  select count(distinct reporter_id) into unique_reporters
  from public.reports
  where target_type = new.target_type and target_id = new.target_id;

  -- 10건 초과 + 댓글 -> removed (원문 body 보존, status 만 변경). 이미 removed 면 무변경(멱등).
  if unique_reporters > 10 and new.target_type = 'comment' then
    update public.comments
      set moderation_status = 'removed'
      where id = new.target_id and moderation_status <> 'removed';
    return new;
  end if;

  -- 3건 이상 -> pending (모든 target_type). visible 인 것만 pending 으로 (이미 pending/removed 면 무변경).
  if unique_reporters >= 3 then
    case new.target_type
      when 'post' then
        update public.community_posts set moderation_status = 'pending'
          where id = new.target_id and moderation_status = 'visible';
      when 'comment' then
        update public.comments set moderation_status = 'pending'
          where id = new.target_id and moderation_status = 'visible';
      when 'note' then
        update public.tasting_notes set moderation_status = 'pending'
          where id = new.target_id and moderation_status = 'visible';
      when 'list' then
        update public.wine_lists set moderation_status = 'pending'
          where id = new.target_id and moderation_status = 'visible';
      when 'profile' then
        update public.profiles set moderation_status = 'pending'
          where id = new.target_id and moderation_status = 'visible';
    end case;
  end if;

  return new;
end $$;

comment on function public.apply_report_thresholds() is
  '2단계 자동 모더레이션: 고유 신고자 >=3 모든 콘텐츠 pending, >10 AND comment removed(원문 보존). security definer 로 콘텐츠 테이블 status 갱신. specs Decision 3.';

drop trigger if exists on_report_insert on public.reports;
create trigger on_report_insert
  after insert on public.reports
  for each row execute function public.apply_report_thresholds();
