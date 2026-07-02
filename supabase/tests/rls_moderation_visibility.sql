-- supabase/tests/rls_moderation_visibility.sql
-- 가시성 필터 검증: pending 콘텐츠는 비작성자에게 안 보이고, 작성자 본인은 자기 pending 을 본다.

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;

  -- A 의 pending 포스트
  insert into public.community_posts (id, author_id, type, title, body, visibility, moderation_status)
  values ('a0000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'note', 'A pending post', '', 'public', 'pending');

  -- 비작성자 B: pending 안 보임
  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';
  do $$
  declare n int;
  begin
    select count(*) into n from public.community_posts where id = 'a0000000-0000-0000-0000-0000000000a1';
    if n <> 0 then raise exception 'FAIL: non-author B sees A pending post (got %)', n; end if;
    raise notice 'PASS: non-author cannot see pending content';
  end $$;

  -- 작성자 A: 자기 pending 보임
  set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';
  do $$
  declare n int;
  begin
    select count(*) into n from public.community_posts where id = 'a0000000-0000-0000-0000-0000000000a1';
    if n <> 1 then raise exception 'FAIL: author A cannot see own pending post (got %)', n; end if;
    raise notice 'PASS: author can see own pending content';
  end $$;
rollback;
