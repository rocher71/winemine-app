-- Wine Lists v2: source_list_id attribution column + rebuilt stats VIEW

-- ── source_list_id 컬럼 추가 ──────────────────────────────────────────────
ALTER TABLE wine_lists
  ADD COLUMN source_list_id uuid REFERENCES wine_lists(id) ON DELETE SET NULL;

CREATE INDEX idx_wine_lists_source ON wine_lists(source_list_id)
  WHERE source_list_id IS NOT NULL;

-- ── wine_lists_stats VIEW 재생성 (source 귀속 포함) ──────────────────────
DROP VIEW wine_lists_stats;

CREATE VIEW wine_lists_stats AS
  SELECT
    wl.id,
    wl.user_id,
    wl.title,
    wl.description,
    wl.visibility,
    wl.created_at,
    wl.updated_at,
    wl.source_list_id,
    src.title                AS source_list_title,
    src_p.anonymous_display  AS source_author_display,
    COUNT(DISTINCT wli.id)   AS wine_count,
    COUNT(DISTINCT wls.id)   AS save_count,
    COUNT(DISTINCT wll.id)   AS like_count
  FROM wine_lists            wl
  LEFT JOIN wine_list_items  wli  ON wli.list_id = wl.id
  LEFT JOIN wine_list_saves  wls  ON wls.list_id = wl.id
  LEFT JOIN wine_list_likes  wll  ON wll.list_id = wl.id
  LEFT JOIN wine_lists       src  ON src.id = wl.source_list_id
  LEFT JOIN profiles         src_p ON src_p.id = src.user_id
  GROUP BY wl.id, src.title, src_p.anonymous_display;
