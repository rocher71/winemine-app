-- 20260527000000_profiles_social.sql: profile social columns (handle, bio) + public stats counters
-- + cross-user profile read policy + tasting_notes stats trigger
-- CRITICAL: profiles is altered with ADD COLUMN IF NOT EXISTS only (existing data untouched).
-- wines / wine_korean_names are NOT referenced or altered.

-- ── social columns ────────────────────────────────────────────────────────
-- handle: @username form. nullable (optional in v0.1.0). unique.
alter table public.profiles add column if not exists handle text unique;

-- bio: one-line self description. nullable.
alter table public.profiles add column if not exists bio text;

-- ── public stats (denormalized) ───────────────────────────────────────────
-- tasting_notes RLS is owner-only, so other users cannot aggregate someone
-- else's notes directly. Denormalized counters on profiles are the public
-- alternative, kept in sync by the trigger below.
alter table public.profiles add column if not exists public_wines_count int not null default 0 check (public_wines_count >= 0);
alter table public.profiles add column if not exists public_countries_count int not null default 0 check (public_countries_count >= 0);
alter table public.profiles add column if not exists public_regions_count int not null default 0 check (public_regions_count >= 0);
alter table public.profiles add column if not exists public_notes_count int not null default 0 check (public_notes_count >= 0);

-- ── RLS: allow cross-user profile read ────────────────────────────────────
-- Replace owner-only SELECT with authenticated-any SELECT so other users can
-- render a public profile screen. Row level only; column-level masking of
-- email / linked_providers is deferred to v0.2.0 (v0.1.0 trusts client to
-- only render anonymous_display + public columns).
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_any_authenticated" on public.profiles;
create policy "profiles_select_any_authenticated" on public.profiles for select using (auth.uid() is not null);

-- update / insert policies stay as defined in 20260519000000_profiles.sql
-- (profiles_update_own: id = auth.uid(); insert via security definer trigger only).

-- ── stats sync trigger ────────────────────────────────────────────────────
-- public_notes_count = total tasting_notes for the user.
-- public_wines_count = distinct wines (wine_lwin) the user has noted.
-- public_countries_count / public_regions_count need a wines_localized join
-- and are left at their 0 default in v0.1.0 (v0.2.0 expansion).
create or replace function public.update_profile_public_stats()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_user_id uuid;
begin
  target_user_id := coalesce(new.user_id, old.user_id);
  update public.profiles set
    public_notes_count = (select count(*) from public.tasting_notes where user_id = target_user_id),
    public_wines_count = (select count(distinct wine_lwin) from public.tasting_notes where user_id = target_user_id),
    updated_at = now()
  where id = target_user_id;
  return coalesce(new, old);
end $$;

comment on function public.update_profile_public_stats() is
  'Keeps profiles.public_notes_count / public_wines_count in sync with tasting_notes (owner-only table). Runs as security definer to update the profiles row.';

drop trigger if exists on_tasting_note_change on public.tasting_notes;
create trigger on_tasting_note_change
  after insert or delete or update on public.tasting_notes
  for each row execute function public.update_profile_public_stats();
