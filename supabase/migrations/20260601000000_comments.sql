-- 20260601000000_comments.sql: 댓글 실 테이블 신설 (mock lib/mock/community-comments.ts 영속화)
-- Source: docs/spec/moderation.md <data_model> table=comments. 댓글 신고의 선결 조건.
--
-- 본문 타입 결정 (open_question 해소): 단일 문자열 text.
--   mock CommComment.body 는 LocalizedString { ko, en } 이지만, 그것은 키스크린 하드코딩 데모
--   문장을 verbatim 포팅하기 위한 mock 전용 shape 이다. 실제 사용자가 입력하는 댓글은 한 언어로
--   작성되므로 단일 text 가 자연스럽고(스펙 NOTE 동일 판단), 신고/모더레이션 대상도 단일 본문이다.
--   따라서 컬럼은 text body 로 고정. (mock의 ko/en 데모 데이터는 시드 대상 아님.)
-- 기존 wines / wine_korean_names / community_posts 데이터 변경 없음 (손상 0). 신규 테이블만 추가.

create table if not exists public.comments (
  id                uuid        primary key default gen_random_uuid(),
  post_id           uuid        not null references public.community_posts(id) on delete cascade,
  author_id         uuid        not null references auth.users(id) on delete cascade,
  -- 답글 (1 depth thread). 부모 댓글 삭제 시 답글도 함께 삭제.
  parent_id         uuid        references public.comments(id) on delete cascade,
  body              text        not null check (char_length(body) between 1 and 2000),
  -- moderation_status: 가시성 상태. removed 는 원문 보존 + UI tombstone (스펙 결정).
  moderation_status text        not null default 'visible'
                                  check (moderation_status in ('visible','pending','removed')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_comments_post_created on public.comments(post_id, created_at);
create index if not exists idx_comments_author on public.comments(author_id);
create index if not exists idx_comments_parent on public.comments(parent_id);

alter table public.comments enable row level security;

-- SELECT: visible 댓글은 누구나(인증 세션), 본인 댓글은 status 무관 열람 가능.
--   차단 필터 + (작성자가 아닌) pending/removed 숨김은 후속 마이그레이션에서 USING 절 확장으로 추가.
--   removed 댓글은 스레드 구조 보존을 위해 행 자체는 노출하되 본문을 UI tombstone 으로 교체하므로
--   여기서는 removed 도 SELECT 허용 범위에 포함한다(가시성 필터는 visible/pending 만 작성자 비교).
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select using (
    moderation_status in ('visible','removed')
    or author_id = auth.uid()
  );

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert with check (author_id = auth.uid());

drop policy if exists "comments_update" on public.comments;
create policy "comments_update" on public.comments
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments
  for delete using (author_id = auth.uid());
