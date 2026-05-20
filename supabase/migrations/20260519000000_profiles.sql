-- 20260519000000_profiles.sql: anonymize SQL function + profiles table + handle_new_user trigger
-- Source: docs/spec/v0.1.0.md <database_schema>, specs/domain/policies/anonymization.md §4 (KO/EN pools 50 each)

-- pgcrypto for HMAC-SHA256 (Supabase exposes via extensions schema)
create extension if not exists pgcrypto with schema extensions;

-- anonymize(user_id) -> '{adjective}-{noun}-{NN}' deterministic via HMAC-SHA256(user_id, app.anonymization_salt)
-- KO/EN pools share index ordering so locale switch maps to the same row.
create or replace function public.anonymize(user_id uuid)
returns text language plpgsql immutable as $$
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
  h bytea;
  adj_idx int;
  noun_idx int;
  num int;
begin
  h := extensions.hmac(user_id::text, current_setting('app.anonymization_salt', true), 'sha256');
  adj_idx := (get_byte(h, 0) % array_length(adjectives_en, 1)) + 1;
  noun_idx := (get_byte(h, 1) % array_length(nouns_en, 1)) + 1;
  num := ((get_byte(h, 2) * 256) + get_byte(h, 3)) % 100;
  -- v0.1.0: return EN form; KO form derived client-side from same index via locale pool
  return adjectives_en[adj_idx] || '-' || nouns_en[noun_idx] || '-' || lpad(num::text, 2, '0');
end $$;

comment on function public.anonymize(uuid) is
  'Deterministic anonymous display name from user UUID. Pools (50 adj x 50 noun x 100 num = 250k combos) mirror specs/domain/policies/anonymization.md. KO mirror pool lives in src/lib/anonymize.ts (same index order).';

-- Resolve KO/EN pools at runtime via index lookup. Client code in src/lib/anonymize.ts mirrors these exact arrays.
create or replace function public.anonymize_index(user_id uuid)
returns table(adj_index int, noun_index int, num int) language plpgsql immutable as $$
declare
  h bytea;
begin
  h := extensions.hmac(user_id::text, current_setting('app.anonymization_salt', true), 'sha256');
  adj_index := get_byte(h, 0) % 50;
  noun_index := get_byte(h, 1) % 50;
  num := ((get_byte(h, 2) * 256) + get_byte(h, 3)) % 100;
  return next;
end $$;

comment on function public.anonymize_index(uuid) is
  'Raw (adj_index, noun_index, num) so callers can map to KO or EN pool consistently. EN pool order matches public.anonymize().';

-- profiles: 1:1 with auth.users. OAuth upgrade-ready columns prepared but anonymous-only in v0.1.0.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  anonymous_display text not null,
  email text,
  linked_providers text[] not null default '{}',
  is_upgraded boolean not null default false,
  mode text not null default 'first-time' check (mode in ('first-time','heavy')),
  experience text not null default 'beginner' check (experience in ('beginner','expert')),
  language text not null default 'ko' check (language in ('ko','en')),
  theme text not null default 'system' check (theme in ('system','dark','light')),
  xp int not null default 0 check (xp >= 0),
  level int not null default 1 check (level between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- INSERT is blocked at policy level; only the trigger (security definer) creates rows.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.profiles (id, anonymous_display)
  values (new.id, public.anonymize(new.id))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
