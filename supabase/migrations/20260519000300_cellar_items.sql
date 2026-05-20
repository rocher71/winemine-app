-- 20260519000300_cellar_items.sql: per-user cellar with RLS + consumed_at constraint
-- Source: docs/spec/v0.1.0.md <database_schema>

create table if not exists public.cellar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wine_lwin text not null references public.wines(lwin) on delete restrict,
  status text not null check (status in ('cellared','consumed')) default 'cellared',
  acquired_at date not null,
  consumed_at date,
  storage text check (char_length(storage) <= 100),
  purchase_price_krw int check (purchase_price_krw >= 0),
  quantity int not null default 1 check (quantity >= 1),
  notes_ko text,
  notes_en text,
  notify_at_peak boolean default true,
  created_at timestamptz default now(),
  constraint consumed_needs_date check (status = 'cellared' or consumed_at is not null)
);

create index if not exists cellar_items_user_status_acquired_idx
  on public.cellar_items (user_id, status, acquired_at desc);

alter table public.cellar_items enable row level security;

drop policy if exists "cellar_items_all_own" on public.cellar_items;
create policy "cellar_items_all_own" on public.cellar_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
