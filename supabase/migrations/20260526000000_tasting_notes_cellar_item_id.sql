-- 20260526000000_tasting_notes_cellar_item_id.sql: link tasting notes to a cellar item
-- Source: docs/spec/v0.1.0.md <database_schema>
-- Adds nullable FK so a tasting note authored from a cellar bottle can reference it.
-- on delete set null: removing a cellar item keeps the note, just drops the link.
-- Nullable column means no backfill is needed; existing rows are unaffected.
-- RLS is unchanged: the existing tasting_notes_all_own policy covers all columns.

alter table public.tasting_notes
  add column if not exists cellar_item_id uuid
  references public.cellar_items(id) on delete set null;

create index if not exists tasting_notes_cellar_item_idx
  on public.tasting_notes (cellar_item_id);
