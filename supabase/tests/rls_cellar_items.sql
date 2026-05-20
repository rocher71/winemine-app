-- supabase/tests/rls_cellar_items.sql
-- Asserts user A cannot see user B's cellar items.

begin;
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', null, '{"provider":"anonymous"}', '{}', false, now(), now())
  on conflict (id) do nothing;

  insert into public.cellar_items (user_id, wine_lwin, status, acquired_at)
  select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', lwin, 'cellared', current_date
  from public.wines limit 1;

  set local role authenticated;
  set local "request.jwt.claims" to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';

  do $$
  declare other_count int;
  begin
    select count(*) into other_count from public.cellar_items
      where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if other_count <> 0 then
      raise exception 'FAIL: user B sees % of user A cellar items (expected 0)', other_count;
    end if;
    raise notice 'PASS: cellar_items RLS isolates per user_id';
  end $$;
rollback;
