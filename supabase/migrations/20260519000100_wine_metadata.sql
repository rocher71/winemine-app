-- 20260519000100_wine_metadata.sql: winemine-specific metadata per LWIN (bottle_color, drink_window, type_canonical)
-- Source: docs/spec/v0.1.0.md <database_schema>. Public read, service_role write only.

create table if not exists public.wine_metadata (
  lwin text primary key references public.wines(lwin) on delete cascade,
  bottle_color text,
  drink_window_from_year int,
  drink_window_peak_year int,
  drink_window_to_year int,
  type_canonical text check (type_canonical in ('red','white','rose','sparkling','fortified','dessert')),
  vintage_override int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wine_metadata enable row level security;

drop policy if exists "wine_metadata_public_read" on public.wine_metadata;
create policy "wine_metadata_public_read" on public.wine_metadata for select using (true);

-- INSERT/UPDATE/DELETE require service_role (no policy = blocked for anon/authenticated).
