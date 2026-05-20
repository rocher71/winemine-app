-- 20260519000400_wines_localized_view.sql: wines + best wine_korean_names + wine_metadata in one row
-- Source: docs/spec/v0.1.0.md <database_schema>. security_invoker=true required so anon/authenticated callers inherit RLS.

drop view if exists public.wines_localized;

create view public.wines_localized
with (security_invoker = true) as
select
  w.lwin,
  w.display_name,
  kn.name_ko,
  w.producer_title,
  w.producer_name,
  w.wine,
  w.country,
  w.region,
  w.classification,
  w.type as type_raw,
  coalesce(wm.type_canonical, lower(split_part(w.type, ' ', 1))) as type_canonical,
  wm.bottle_color,
  wm.drink_window_from_year,
  wm.drink_window_peak_year,
  wm.drink_window_to_year,
  coalesce(
    wm.vintage_override,
    case when length(w.lwin) in (11, 13) then substring(w.lwin from 8 for 4)::int else null end
  ) as vintage,
  w.status
from public.wines w
left join lateral (
  select name_ko
  from public.wine_korean_names
  where lwin = w.lwin
  order by confidence desc nulls last, id asc
  limit 1
) kn on true
left join public.wine_metadata wm on wm.lwin = w.lwin
where w.status = 'Live';

grant select on public.wines_localized to anon, authenticated;

-- Seed wine_metadata.type_canonical from wines.type for every Live wine (single-pass mapping).
insert into public.wine_metadata (lwin, type_canonical)
select
  w.lwin,
  case
    when lower(w.type) like '%champagne%' or lower(w.type) like '%sparkling%' then 'sparkling'
    when lower(w.type) like '%white%' then 'white'
    when lower(w.type) like '%rose%' or lower(w.type) like '%rosé%' then 'rose'
    when lower(w.type) like '%fortified%' or lower(w.type) like '%port%' or lower(w.type) like '%sherry%' then 'fortified'
    when lower(w.type) like '%dessert%' or lower(w.type) like '%sweet%' then 'dessert'
    else 'red'
  end
from public.wines w
where w.status = 'Live'
on conflict (lwin) do nothing;
