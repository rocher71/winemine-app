-- 00000000000000_local_stub_external_catalog.sql
--
-- LOCAL DEV STUB ONLY. NEVER PUSH TO REMOTE.
--
-- The remote Supabase project already owns public.wines and public.wine_korean_names
-- (181,915 wines and 5,240 wine_korean_names rows as of 2026-05-19; see _workspace/02_supabase_backend.md).
-- This file exists only so `supabase db reset` can satisfy the foreign keys in the 6 winemine migrations
-- (wine_metadata.lwin, tasting_notes.wine_lwin, cellar_items.wine_lwin) inside a fresh local Postgres.
--
-- If you ever run `supabase db push --linked`, mark this migration as already-applied BEFORE the push:
--   supabase migration repair --status applied 00000000000000
-- Otherwise Postgres will raise duplicate-object errors on remote.
--
-- Schema mirrors the remote dump (supabase db dump --linked --schema public, 2026-05-19).
-- Do NOT add columns or constraints here beyond what's required for FK resolution.

create table if not exists public.wines (
  lwin text primary key,
  display_name text not null,
  producer_title text,
  producer_name text,
  wine text,
  country text,
  region text,
  classification text,
  status text default 'Live',
  type text default 'Wine',
  created_at timestamptz default now()
);

create table if not exists public.wine_korean_names (
  id bigserial primary key,
  lwin text not null,
  name_ko text not null,
  source text not null,
  source_url text,
  confidence real,
  country_match boolean,
  importer_num integer,
  llm_model text,
  llm_reasoning text,
  created_at timestamptz default now()
);
