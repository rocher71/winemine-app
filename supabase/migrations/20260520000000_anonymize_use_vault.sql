-- 20260520000000_anonymize_use_vault.sql
--
-- Switch public.anonymize / public.anonymize_index from `current_setting('app.anonymization_salt')`
-- to Supabase Vault. Hosted Postgres rejects `ALTER DATABASE postgres SET app.…` with 42501
-- (permission denied to set parameter), so the salt cannot live in a GUC.
--
-- New runtime contract:
--   - Secret name in Supabase Vault: 'winemine_anonymization_salt'
--   - Stored via Dashboard -> Project Settings -> Vault -> New secret (one-time, user action)
--   - Function reads via `select decrypted_secret from vault.decrypted_secrets where name = ...`
--
-- Why security definer + stable:
--   - vault.decrypted_secrets is owner-restricted; function executes with definer rights so
--     anon/authenticated callers cannot read the secret directly but still get the derived id.
--   - Vault reads are deterministic for a given secret value but reach outside the call's
--     argument list, so the function must downgrade from IMMUTABLE to STABLE (Postgres
--     planner could otherwise cache a NULL salt result across the very call that sets it up).
--
-- Signature preserved (return type, arg name) so callers, types, and the
-- on_auth_user_created trigger keep working with no changes.

create or replace function public.anonymize(user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public, extensions, vault
as $$
declare
  adjectives_en text[] := array[
    'velvety','crisp','oaky','bright','smoky','silky','mellow','bold','jammy','buttery',
    'toasty','earthy','minerally','floral','spicy','zesty','chewy','robust','elegant','complex',
    'balanced','aromatic','vibrant','rich','lush','juicy','fruity','nutty','savory','gentle',
    'noble','humble','quiet','swift','steady','merry','jolly','daring','curious','wise',
    'clever','nimble','cozy','warm','sunny','breezy','misty','dewy','moonlit','starlit'
  ];
  nouns_en text[] := array[
    'fox','owl','bear','otter','heron','swallow','badger','lynx','hare','raven',
    'sparrow','squirrel','dolphin','whale','seal','crane','falcon','salmon','trout','moth',
    'oak','cedar','juniper','willow','maple','olive','fern','moss','ivy','clover',
    'harbor','meadow','river','valley','orchard','vineyard','brook','cove','grove','ridge',
    'quartz','amber','opal','lantern','compass','anchor','teapot','parchment','cellar','carafe'
  ];
  salt_value text;
  h bytea;
  adj_idx int;
  noun_idx int;
  num int;
begin
  select decrypted_secret into salt_value
  from vault.decrypted_secrets
  where name = 'winemine_anonymization_salt'
  limit 1;

  if salt_value is null then
    raise exception 'anonymization salt not configured in vault (expected secret name: winemine_anonymization_salt)';
  end if;

  h := extensions.hmac(user_id::text, salt_value, 'sha256');
  adj_idx := (get_byte(h, 0) % array_length(adjectives_en, 1)) + 1;
  noun_idx := (get_byte(h, 1) % array_length(nouns_en, 1)) + 1;
  num := ((get_byte(h, 2) * 256) + get_byte(h, 3)) % 100;

  return adjectives_en[adj_idx] || '-' || nouns_en[noun_idx] || '-' || lpad(num::text, 2, '0');
end $$;

revoke all on function public.anonymize(uuid) from public;
grant execute on function public.anonymize(uuid) to authenticated, service_role;

comment on function public.anonymize(uuid) is
  'Deterministic {adj}-{noun}-{NN} from user UUID + vault secret winemine_anonymization_salt. EN pool 50x50x100 mirrors specs/domain/policies/anonymization.md §4. KO pool lives in src/lib/anonymize.ts at the same index order.';

create or replace function public.anonymize_index(user_id uuid)
returns table(adj_index int, noun_index int, num int)
language plpgsql
stable
security definer
set search_path = public, extensions, vault
as $$
declare
  salt_value text;
  h bytea;
begin
  select decrypted_secret into salt_value
  from vault.decrypted_secrets
  where name = 'winemine_anonymization_salt'
  limit 1;

  if salt_value is null then
    raise exception 'anonymization salt not configured in vault (expected secret name: winemine_anonymization_salt)';
  end if;

  h := extensions.hmac(user_id::text, salt_value, 'sha256');
  adj_index := get_byte(h, 0) % 50;
  noun_index := get_byte(h, 1) % 50;
  num := ((get_byte(h, 2) * 256) + get_byte(h, 3)) % 100;
  return next;
end $$;

revoke all on function public.anonymize_index(uuid) from public;
grant execute on function public.anonymize_index(uuid) to authenticated, service_role;

comment on function public.anonymize_index(uuid) is
  'Raw (adj_index, noun_index, num) from same HMAC pipeline as anonymize(). Clients use this to render KO form via the mirrored pool while keeping profiles.anonymous_display in EN.';
