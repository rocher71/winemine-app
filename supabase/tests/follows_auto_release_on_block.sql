-- supabase/tests/follows_auto_release_on_block.sql
-- 차단 시 follows 양방향 자동 해제 검증 (specs Decision 4).

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;

  -- profiles 행은 handle_new_user 트리거로 생성됨. follows FK 충족.
  -- A->B, B->A 양방향 팔로우
  insert into public.follows (follower_id, following_id) values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

  -- A 가 B 차단 -> 트리거가 양방향 follows 삭제
  insert into public.user_blocks (blocker_id, blocked_id)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  do $$
  declare remaining int;
  begin
    select count(*) into remaining from public.follows
    where (follower_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and following_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
       or (follower_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' and following_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    if remaining <> 0 then raise exception 'FAIL: follows not auto-released on block (remaining %)', remaining; end if;
    raise notice 'PASS: both follow edges auto-released on block';
  end $$;
rollback;
