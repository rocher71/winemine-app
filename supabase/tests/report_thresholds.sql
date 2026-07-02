-- supabase/tests/report_thresholds.sql
-- 2단계 임계값 트리거 검증:
--   고유 신고자 >=3 -> pending (모든 콘텐츠; 여기선 post 로 검증)
--   고유 신고자 >10 AND comment -> removed (댓글만, 원문 보존)
--   멱등성: 동일 유저 재신고는 UNIQUE 로 차단되어 카운트 증가 없음.

begin;
  -- 작성자 + 신고자 12명 합성
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  select gen_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()
  from (
    select ('00000000-0000-0000-0000-0000000000' || lpad(g::text, 2, '0'))::uuid as gen_uuid
    from generate_series(0, 12) g
  ) s
  on conflict (id) do nothing;

  -- author = ...00, post + comment 작성
  insert into public.community_posts (id, author_id, type, title, body, visibility)
  values ('aaaa0000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'note', 'target post', '', 'public');
  insert into public.comments (id, post_id, author_id, body)
  values ('cccc0000-0000-0000-0000-000000000001', 'aaaa0000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'target comment body original');

  -- ── post 에 고유 신고자 3명 -> pending ──
  -- 신고자 = ...01, ...02, ...03 (각 신고는 reporter 본인 세션에서 INSERT 해야 RLS WITH CHECK 통과)
  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason)
    values ('00000000-0000-0000-0000-000000000001', 'post', 'aaaa0000-0000-0000-0000-000000000001', 'spam');
  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason)
    values ('00000000-0000-0000-0000-000000000002', 'post', 'aaaa0000-0000-0000-0000-000000000001', 'spam');

  -- 2명까지는 visible 유지 확인 (트리거는 security definer 라 role 무관 동작)
  do $$
  declare st text;
  begin
    select moderation_status into st from public.community_posts where id = 'aaaa0000-0000-0000-0000-000000000001';
    if st <> 'visible' then raise exception 'FAIL: post should still be visible at 2 reporters (got %)', st; end if;
    raise notice 'PASS: post visible at 2 unique reporters';
  end $$;

  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason)
    values ('00000000-0000-0000-0000-000000000003', 'post', 'aaaa0000-0000-0000-0000-000000000001', 'spam');

  do $$
  declare st text;
  begin
    select moderation_status into st from public.community_posts where id = 'aaaa0000-0000-0000-0000-000000000001';
    if st <> 'pending' then raise exception 'FAIL: post should be pending at 3 unique reporters (got %)', st; end if;
    raise notice 'PASS: post -> pending at 3 unique reporters';
  end $$;

  -- ── comment 에 고유 신고자 11명(>10) -> removed, 원문 보존 ──
  -- reporter ...01 ~ ...11
  do $$
  declare i int;
  begin
    for i in 1..11 loop
      execute format('set local "request.jwt.claims" to %L',
        json_build_object('sub', '00000000-0000-0000-0000-0000000000' || lpad(i::text,2,'0'), 'role','authenticated')::text);
      insert into public.reports (reporter_id, target_type, target_id, reason)
        values (('00000000-0000-0000-0000-0000000000' || lpad(i::text,2,'0'))::uuid, 'comment', 'cccc0000-0000-0000-0000-000000000001', 'harassment');
    end loop;
  end $$;

  do $$
  declare st text; original_body text;
  begin
    select moderation_status, body into st, original_body from public.comments where id = 'cccc0000-0000-0000-0000-000000000001';
    if st <> 'removed' then raise exception 'FAIL: comment should be removed at 11 unique reporters (got %)', st; end if;
    if original_body <> 'target comment body original' then raise exception 'FAIL: comment body must be preserved (got %)', original_body; end if;
    raise notice 'PASS: comment -> removed at >10 reporters with body preserved';
  end $$;

  -- ── 멱등: 동일 유저 재신고는 UNIQUE 위반으로 거부 (카운트 무변화) ──
  set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';
  do $$
  begin
    begin
      insert into public.reports (reporter_id, target_type, target_id, reason)
        values ('00000000-0000-0000-0000-000000000001', 'post', 'aaaa0000-0000-0000-0000-000000000001', 'spam');
      raise exception 'FAIL: duplicate report by same reporter should violate UNIQUE';
    exception when unique_violation then
      raise notice 'PASS: duplicate report by same reporter rejected (UNIQUE)';
    end;
  end $$;
rollback;
