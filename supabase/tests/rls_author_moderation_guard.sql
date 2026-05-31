-- supabase/tests/rls_author_moderation_guard.sql
-- M1b 보안 수정 검증: author-owned UPDATE 가 moderation_status 자가변경 불가(모더레이션 우회 차단).
-- (a) 작성자 본인 pending/removed 행을 visible 로 UPDATE 시도 -> 차단
-- (b) admin RPC moderation_restore 는 정상 동작(정당 경로 통과)
-- (c) 임계값 트리거 자동 pending/removed 정상 동작(회귀)
-- (d) 작성자가 moderation_status 외 컬럼(body/title 등)은 정상 수정 가능(과잉 차단 아님)

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;
  update public.profiles set role='admin' where id='dddddddd-dddd-dddd-dddd-dddddddddddd';

  insert into public.wines (lwin, display_name) values ('1000000000000','Guard Wine') on conflict do nothing;

  -- A 의 콘텐츠: pending post, pending comment, visible list, pending note
  insert into public.community_posts (id, author_id, type, title, body, visibility, moderation_status)
    values ('a0000000-0000-0000-0000-0000000000a1'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','note','orig title','orig body','public','pending');
  insert into public.comments (id, post_id, author_id, body, moderation_status)
    values ('a0000000-0000-0000-0000-0000000000a2'::uuid, 'a0000000-0000-0000-0000-0000000000a1'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','orig comment','pending');
  insert into public.wine_lists (id, user_id, title, visibility, moderation_status)
    values ('a0000000-0000-0000-0000-0000000000a3'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','orig list','public','pending');
  insert into public.tasting_notes (id, user_id, wine_lwin, mode, moderation_status)
    values ('a0000000-0000-0000-0000-0000000000a4'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','1000000000000','beginner','pending');
  -- A 의 프로필을 pending 으로 (신고 'profile' >=3 시뮬레이션 — owner 권한으로 직접 세팅)
  update public.profiles set moderation_status='pending' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';

  -- (a) 작성자가 자기 pending -> visible 자가복구 시도: 4개 테이블 모두 차단(RLS WITH CHECK 42501)
  do $$
  declare blocked int := 0; tag text;
  begin
    begin update public.community_posts set moderation_status='visible' where id='a0000000-0000-0000-0000-0000000000a1'::uuid;
      tag:='community_posts'; exception when insufficient_privilege then blocked:=blocked+1; end;
    begin update public.comments set moderation_status='visible' where id='a0000000-0000-0000-0000-0000000000a2'::uuid;
      tag:='comments'; exception when insufficient_privilege then blocked:=blocked+1; end;
    begin update public.wine_lists set moderation_status='visible' where id='a0000000-0000-0000-0000-0000000000a3'::uuid;
      tag:='wine_lists'; exception when insufficient_privilege then blocked:=blocked+1; end;
    begin update public.tasting_notes set moderation_status='visible' where id='a0000000-0000-0000-0000-0000000000a4'::uuid;
      tag:='tasting_notes'; exception when insufficient_privilege then blocked:=blocked+1; end;
    if blocked <> 4 then raise exception 'FAIL: author self-restore not blocked on all 4 tables (blocked=%, last passing=%)', blocked, tag; end if;
    raise notice 'PASS: author self-restore of moderation_status blocked on all 4 content tables (4/4 RLS 42501)';
  end $$;

  -- (a2) profiles owner self-restore 차단 (RLS WITH CHECK moderation_status 불변 가드; SELECT RLS 가
  --      id=auth.uid() 단순식이라 self-subquery 재귀 없음 — 콘텐츠 4종과 달리 트리거 불필요).
  do $$
  begin
    update public.profiles set moderation_status='visible' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    raise exception 'FAIL: profile owner self-restored moderation_status (VULNERABLE)';
  exception when insufficient_privilege then
    raise notice 'PASS: profile owner self-restore of moderation_status blocked (RLS WITH CHECK 42501)';
  end $$;

  -- (a3) profiles 정상 컬럼(bio) 수정은 owner 가능(과잉 차단 아님).
  do $$
  declare bv text;
  begin
    update public.profiles set bio='edited bio' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    select bio into bv from public.profiles where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if bv <> 'edited bio' then raise exception 'FAIL: profile owner normal bio edit blocked (got %)', bv; end if;
    raise notice 'PASS: profile owner can still edit non-moderation columns (bio)';
  end $$;

  -- (d) 작성자가 moderation_status 외 컬럼은 정상 수정 가능(과잉 차단 아님)
  do $$
  declare t text; b text;
  begin
    update public.community_posts set title='edited title' where id='a0000000-0000-0000-0000-0000000000a1'::uuid;
    select title into t from public.community_posts where id='a0000000-0000-0000-0000-0000000000a1'::uuid;
    update public.comments set body='edited comment' where id='a0000000-0000-0000-0000-0000000000a2'::uuid;
    select body into b from public.comments where id='a0000000-0000-0000-0000-0000000000a2'::uuid;
    if t <> 'edited title' or b <> 'edited comment' then raise exception 'FAIL: author normal edit blocked (title=%, body=%)', t, b; end if;
    raise notice 'PASS: author can still edit non-moderation columns (title/body)';
  end $$;

  -- (b) admin RPC moderation_restore 정상 동작(정당 경로 통과)
  set local "request.jwt.claims" to '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}';
  do $$
  declare st text;
  begin
    perform public.moderation_restore('comment','a0000000-0000-0000-0000-0000000000a2'::uuid);
    select moderation_status into st from public.comments where id='a0000000-0000-0000-0000-0000000000a2'::uuid;
    if st <> 'visible' then raise exception 'FAIL: admin restore blocked by guard (got %)', st; end if;
    raise notice 'PASS: admin moderation_restore passes guard (SECURITY DEFINER bypass)';
  end $$;

  -- (c) 임계값 트리거 회귀: 3 신고자 -> pending 자동 (정당 경로)
  insert into public.community_posts (id, author_id, type, title, body, visibility)
    values ('a0000000-0000-0000-0000-0000000000a5'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd','note','t','','public');
  insert into auth.users (id, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, encrypted_password)
  values
    ('00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000000','authenticated','authenticated','{}','{}',false,now(),now(),''),
    ('00000000-0000-0000-0000-000000000092','00000000-0000-0000-0000-000000000000','authenticated','authenticated','{}','{}',false,now(),now(),''),
    ('00000000-0000-0000-0000-000000000093','00000000-0000-0000-0000-000000000000','authenticated','authenticated','{}','{}',false,now(),now(),'')
  on conflict (id) do nothing;
  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000091","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason) values ('00000000-0000-0000-0000-000000000091','post','a0000000-0000-0000-0000-0000000000a5'::uuid,'spam');
  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000092","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason) values ('00000000-0000-0000-0000-000000000092','post','a0000000-0000-0000-0000-0000000000a5'::uuid,'spam');
  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000093","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason) values ('00000000-0000-0000-0000-000000000093','post','a0000000-0000-0000-0000-0000000000a5'::uuid,'spam');
  reset role;
  do $$
  declare st text;
  begin
    select moderation_status into st from public.community_posts where id='a0000000-0000-0000-0000-0000000000a5'::uuid;
    if st <> 'pending' then raise exception 'FAIL: threshold trigger regression — expected pending (got %)', st; end if;
    raise notice 'PASS: threshold trigger still auto-pending at 3 reporters (guard does not block trigger)';
  end $$;
rollback;
