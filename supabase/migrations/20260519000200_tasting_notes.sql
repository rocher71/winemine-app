-- 20260519000200_tasting_notes.sql: per-user tasting notes with RLS
-- Source: docs/spec/v0.1.0.md <database_schema>

create table if not exists public.tasting_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wine_lwin text not null references public.wines(lwin) on delete restrict,
  mode text not null check (mode in ('beginner','expert')),
  rating numeric(3,1) check (rating between 0 and 5),
  beginner_fields jsonb,
  expert_fields jsonb,
  photo_url text,
  tasted_at date not null default current_date check (tasted_at <= current_date),
  source text check (source in ('cellar','restaurant','shop','gift','tasting_event','other')),
  location_text text check (char_length(location_text) <= 200),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tasting_notes_user_tasted_at_idx
  on public.tasting_notes (user_id, tasted_at desc);
create index if not exists tasting_notes_user_wine_idx
  on public.tasting_notes (user_id, wine_lwin);

alter table public.tasting_notes enable row level security;

drop policy if exists "tasting_notes_all_own" on public.tasting_notes;
create policy "tasting_notes_all_own" on public.tasting_notes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
