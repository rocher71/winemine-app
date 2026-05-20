-- 20260520000100_cellar_items_acquired_at_check.sql
--
-- Adds a defense-in-depth DB CHECK so future-dated acquired_at values cannot be
-- inserted via direct REST/SQL calls that bypass the zod check on the RN side.
-- Mirrors the tasted_at pattern in 20260519000200_tasting_notes.sql and matches
-- spec <security_considerations>.<input_validation> ("tasted_at must be blocked
-- at both zod and SQL layers").
--
-- Scope: cellar_items only. wines / wine_korean_names untouched.
-- Pre-existing rows are unlikely to be future-dated under the normal UI flow,
-- but `not valid` would let bad data slip through silently — so we validate
-- immediately and let a CHECK failure surface during push if any row violates.

alter table public.cellar_items
  drop constraint if exists cellar_items_acquired_at_not_future;

alter table public.cellar_items
  add constraint cellar_items_acquired_at_not_future
  check (acquired_at <= current_date);
