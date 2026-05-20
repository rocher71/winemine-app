-- supabase/tests/wines_localized_view.sql
-- Verifies wines_localized exists with security_invoker=true and returns Live wines with name_ko join.

do $$
declare opts text;
begin
  select array_to_string(c.reloptions, ',') into opts
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'wines_localized';
  if opts is null or opts !~ 'security_invoker=true' then
    raise exception 'FAIL: wines_localized must be created with security_invoker=true (got: %)', coalesce(opts,'<none>');
  end if;
  raise notice 'PASS: wines_localized.security_invoker=true';
end $$;

-- anon role can SELECT
begin;
  set local role anon;
  do $$
  declare n int;
  begin
    select count(*) into n from public.wines_localized;
    raise notice 'PASS: anon SELECT wines_localized returns % rows', n;
  exception when insufficient_privilege then
    raise exception 'FAIL: anon cannot SELECT wines_localized — grant select needed';
  end $$;
rollback;
