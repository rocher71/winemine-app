-- supabase/tests/rls_reports.sql
-- reports SELECT 는 본인 신고건만. 피신고 콘텐츠 작성자/타 유저에게 신고 사실 비노출.

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;

  insert into public.community_posts (id, author_id, type, title, body, visibility)
  values ('a0000000-0000-0000-0000-0000000000c3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'note', 'reported post', '', 'public');

  -- A 가 신고 INSERT (본인 세션)
  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';
  insert into public.reports (reporter_id, target_type, target_id, reason)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'post', 'a0000000-0000-0000-0000-0000000000c3', 'spam');

  do $$
  declare own int;
  begin
    select count(*) into own from public.reports;
    if own <> 1 then raise exception 'FAIL: reporter A should see own 1 report (got %)', own; end if;
    raise notice 'PASS: reporter sees own report';
  end $$;

  -- B(타 유저)는 A 의 신고건 안 보임
  set local "request.jwt.claims" to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';
  do $$
  declare seen int;
  begin
    select count(*) into seen from public.reports;
    if seen <> 0 then raise exception 'FAIL: user B sees other reports (got %)', seen; end if;
    raise notice 'PASS: non-reporter cannot see reports (no leak to content author or others)';
  end $$;

  -- other 사유인데 detail 없으면 CHECK 위반
  do $$
  begin
    begin
      insert into public.reports (reporter_id, target_type, target_id, reason)
        values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'post', 'a0000000-0000-0000-0000-0000000000c3', 'other');
      raise exception 'FAIL: reason=other without detail should violate CHECK';
    exception when check_violation then
      raise notice 'PASS: reason=other requires detail (check_violation)';
    end;
  end $$;
rollback;
