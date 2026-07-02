-- supabase/tests/rls_role_and_admin_rpc.sql
-- (1) 일반 유저가 본인 role 을 'admin' 으로 못 바꾼다(profiles UPDATE WITH CHECK).
-- (2) 비admin 의 admin RPC 호출은 RAISE EXCEPTION(forbidden).
-- (3) admin 의 RPC 호출은 콘텐츠 status 를 변경한다.

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;

  -- D 를 admin 으로 (Studio/service_role 시뮬레이션 — 트랜잭션은 기본 service_role/postgres 컨텍스트)
  update public.profiles set role = 'admin' where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

  -- A 의 pending 포스트(복구 대상)
  insert into public.community_posts (id, author_id, type, title, body, visibility, moderation_status)
  values ('a0000000-0000-0000-0000-0000000000b2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'note', 'pending post', '', 'public', 'pending');

  -- ── (1) 일반 유저 A 가 본인 role 을 admin 으로 변경 시도 -> 차단 ──
  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';
  -- WITH CHECK 위반은 RLS 정책 위반(42501)으로 하드 에러가 난다(0행 업데이트보다 강함).
  do $$
  begin
    update public.profiles set role = 'admin' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    raise exception 'FAIL: user A self-promoted to admin without error';
  exception when insufficient_privilege then
    raise notice 'PASS: user role self-promotion rejected (RLS WITH CHECK, 42501)';
  end $$;

  -- ── (2) 비admin A 가 admin RPC 호출 -> 거부 ──
  do $$
  begin
    perform public.moderation_restore('post', 'a0000000-0000-0000-0000-0000000000b2');
    raise exception 'FAIL: non-admin invoked moderation_restore without error';
  exception when insufficient_privilege then
    raise notice 'PASS: non-admin moderation_restore rejected (42501)';
  end $$;

  -- ── (3) admin D 가 RPC 호출 -> 복구 성공 ──
  set local "request.jwt.claims" to '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}';
  do $$
  declare st text;
  begin
    perform public.moderation_restore('post', 'a0000000-0000-0000-0000-0000000000b2');
    select moderation_status into st from public.community_posts where id = 'a0000000-0000-0000-0000-0000000000b2';
    if st <> 'visible' then raise exception 'FAIL: admin restore did not set visible (got %)', st; end if;
    raise notice 'PASS: admin moderation_restore set status visible';
  end $$;
rollback;
