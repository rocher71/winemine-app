-- supabase/tests/rls_block_bidirectional.sql
-- 차단 양방향 비가시 검증: A 가 B 를 차단하면 B 는 A 콘텐츠를 못 보고(나를 차단한 자),
-- A 도 B 콘텐츠를 못 본다(내가 차단한 자). 비차단 C 는 정상.
-- Run: docker exec -i supabase_db_winemine-app psql -U postgres -d postgres -f - < this_file

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;

  -- A, B, C 각각 public note 포스트 1개 발행
  insert into public.community_posts (id, author_id, type, title, body, visibility)
  values
    ('a0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'note', 'A post', '', 'public'),
    ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'note', 'B post', '', 'public'),
    ('c0000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'note', 'C post', '', 'public');

  -- A 가 B 를 차단
  insert into public.user_blocks (blocker_id, blocked_id)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  -- ── A 시점: B 포스트 안 보임 / C 포스트 보임 ──
  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';
  do $$
  declare sees_b int; sees_c int;
  begin
    select count(*) into sees_b from public.community_posts where author_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    select count(*) into sees_c from public.community_posts where author_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    if sees_b <> 0 then raise exception 'FAIL: A still sees blocked B post (got %)', sees_b; end if;
    if sees_c <> 1 then raise exception 'FAIL: A should see non-blocked C post (got %)', sees_c; end if;
    raise notice 'PASS: blocker A cannot see blocked B, can see C';
  end $$;

  -- ── B 시점: A 포스트 안 보임(나를 차단한 자) / C 포스트 보임 ──
  set local "request.jwt.claims" to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';
  do $$
  declare sees_a int; sees_c int;
  begin
    select count(*) into sees_a from public.community_posts where author_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    select count(*) into sees_c from public.community_posts where author_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    if sees_a <> 0 then raise exception 'FAIL: blocked B still sees blocker A post (got %)', sees_a; end if;
    if sees_c <> 1 then raise exception 'FAIL: B should see non-involved C post (got %)', sees_c; end if;
    raise notice 'PASS: blocked B cannot see blocker A (bidirectional), can see C';
  end $$;

  -- ── C 시점: A, B 둘 다 보임(비차단) ──
  set local "request.jwt.claims" to '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}';
  do $$
  declare sees_a int; sees_b int;
  begin
    select count(*) into sees_a from public.community_posts where author_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    select count(*) into sees_b from public.community_posts where author_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    if sees_a <> 1 or sees_b <> 1 then raise exception 'FAIL: non-blocking C should see both A(%) and B(%)', sees_a, sees_b; end if;
    raise notice 'PASS: non-blocking C sees both A and B';
  end $$;
rollback;
