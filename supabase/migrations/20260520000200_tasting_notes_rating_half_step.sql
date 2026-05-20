-- 20260520000200_tasting_notes_rating_half_step.sql
--
-- Adds a DB CHECK so rating values that aren't a multiple of 0.5 cannot land
-- in tasting_notes via direct REST/SQL calls that bypass the zod
-- multipleOf(0.5) check on the RN side. Same defense-in-depth pattern as
-- 20260520000100_cellar_items_acquired_at_check.sql and matches the spec
-- <security_considerations>.<input_validation> rule that user input must be
-- validated at both the zod and SQL layers.
--
-- Scope: tasting_notes only. wines / wine_korean_names untouched.
-- The numeric(3,1) column type already restricts inputs to a single decimal
-- place, so this CHECK only needs to exclude .X where X is odd (0.1/0.3/0.7/...).
-- Validated immediately (no `not valid`) — under the normal UI flow no
-- existing row should be in violation.

alter table public.tasting_notes
  drop constraint if exists tasting_notes_rating_half_step;

alter table public.tasting_notes
  add constraint tasting_notes_rating_half_step
  check (rating is null or (rating * 2) = floor(rating * 2));
