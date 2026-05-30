-- 20260527000100_follows.sql: user -> user follow relationships + denormalized
-- follower_count / following_count counters on profiles.
-- New table only; no existing data affected. wines / wine_korean_names untouched.

-- ── follows table ─────────────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)  -- no self-follow
);

-- reverse lookup index (following_id is not the leading PK column)
create index if not exists follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

-- any authenticated user can read follow relationships (for follower/following counts)
drop policy if exists "follows_select_any" on public.follows;
create policy "follows_select_any" on public.follows for select using (auth.uid() is not null);

-- only the follower can create their own follow edge
drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows for insert with check (follower_id = auth.uid());

-- only the follower can remove their own follow edge
drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows for delete using (follower_id = auth.uid());

-- ── denormalized follow counts on profiles ────────────────────────────────
alter table public.profiles add column if not exists follower_count int not null default 0 check (follower_count >= 0);
alter table public.profiles add column if not exists following_count int not null default 0 check (following_count >= 0);

create or replace function public.update_follow_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1, updated_at = now() where id = new.follower_id;
    update public.profiles set follower_count = follower_count + 1, updated_at = now() where id = new.following_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.profiles set following_count = greatest(0, following_count - 1), updated_at = now() where id = old.follower_id;
    update public.profiles set follower_count = greatest(0, follower_count - 1), updated_at = now() where id = old.following_id;
    return old;
  end if;
  return null;
end $$;

comment on function public.update_follow_counts() is
  'Keeps profiles.follower_count / following_count in sync with public.follows. Security definer so it can update both endpoint profile rows regardless of caller.';

drop trigger if exists on_follow_change on public.follows;
create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute function public.update_follow_counts();
