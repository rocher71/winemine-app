-- Wine Lists feature: 4 tables + stats VIEW + RLS policies
-- wine_lists, wine_list_items, wine_list_saves, wine_list_likes

-- ── wine_lists ─────────────────────────────────────────────────────────────
CREATE TABLE wine_lists (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL CHECK (char_length(title) <= 50),
  description text        CHECK (description IS NULL OR char_length(description) <= 200),
  visibility  text        NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wine_lists_user_id ON wine_lists(user_id);
CREATE INDEX idx_wine_lists_visibility_updated ON wine_lists(visibility, updated_at DESC);

ALTER TABLE wine_lists ENABLE ROW LEVEL SECURITY;

-- public 리스트는 전체 읽기, private은 본인만
CREATE POLICY "wine_lists_select" ON wine_lists
  FOR SELECT USING (
    visibility = 'public'
    OR user_id = auth.uid()
  );

CREATE POLICY "wine_lists_insert" ON wine_lists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "wine_lists_update" ON wine_lists
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "wine_lists_delete" ON wine_lists
  FOR DELETE USING (user_id = auth.uid());

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_wine_lists_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_wine_lists_updated_at
  BEFORE UPDATE ON wine_lists
  FOR EACH ROW EXECUTE FUNCTION update_wine_lists_updated_at();

-- ── wine_list_items ────────────────────────────────────────────────────────
CREATE TABLE wine_list_items (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    uuid        NOT NULL REFERENCES wine_lists(id) ON DELETE CASCADE,
  -- wines.lwin 은 text (00000000000000_local_stub / wine_metadata 참조) — FK 타입 일치 필수.
  lwin       text        NOT NULL REFERENCES wines(lwin),
  sort_order integer     NOT NULL DEFAULT 0,
  note       text,
  added_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, lwin)
);

CREATE INDEX idx_wine_list_items_list_sort ON wine_list_items(list_id, sort_order);

ALTER TABLE wine_list_items ENABLE ROW LEVEL SECURITY;

-- 부모 wine_lists 가시성에 따라 읽기 권한 상속
CREATE POLICY "wine_list_items_select" ON wine_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wine_lists wl
      WHERE wl.id = list_id
        AND (wl.visibility = 'public' OR wl.user_id = auth.uid())
    )
  );

-- INSERT/UPDATE/DELETE: 리스트 소유자만
CREATE POLICY "wine_list_items_insert" ON wine_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wine_lists wl
      WHERE wl.id = list_id AND wl.user_id = auth.uid()
    )
  );

CREATE POLICY "wine_list_items_update" ON wine_list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wine_lists wl
      WHERE wl.id = list_id AND wl.user_id = auth.uid()
    )
  );

CREATE POLICY "wine_list_items_delete" ON wine_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wine_lists wl
      WHERE wl.id = list_id AND wl.user_id = auth.uid()
    )
  );

-- ── wine_list_saves ────────────────────────────────────────────────────────
CREATE TABLE wine_list_saves (
  id       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id  uuid        NOT NULL REFERENCES wine_lists(id) ON DELETE CASCADE,
  saver_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, saver_id)
);

CREATE INDEX idx_wine_list_saves_saver ON wine_list_saves(saver_id);

ALTER TABLE wine_list_saves ENABLE ROW LEVEL SECURITY;

-- 리스트 소유자 or 저장한 본인이 읽기 가능
CREATE POLICY "wine_list_saves_select" ON wine_list_saves
  FOR SELECT USING (
    saver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wine_lists wl
      WHERE wl.id = list_id AND wl.user_id = auth.uid()
    )
  );

-- 인증된 사용자라면 저장 가능 (단, 본인 리스트는 저장 불가 — 앱 레이어에서 검증)
CREATE POLICY "wine_list_saves_insert" ON wine_list_saves
  FOR INSERT WITH CHECK (saver_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "wine_list_saves_delete" ON wine_list_saves
  FOR DELETE USING (saver_id = auth.uid());

-- ── wine_list_likes ────────────────────────────────────────────────────────
CREATE TABLE wine_list_likes (
  id      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid        NOT NULL REFERENCES wine_lists(id) ON DELETE CASCADE,
  user_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, user_id)
);

CREATE INDEX idx_wine_list_likes_user ON wine_list_likes(user_id);

ALTER TABLE wine_list_likes ENABLE ROW LEVEL SECURITY;

-- 공개 리스트의 좋아요는 전체 읽기
CREATE POLICY "wine_list_likes_select" ON wine_list_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wine_lists wl
      WHERE wl.id = list_id AND wl.visibility = 'public'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "wine_list_likes_insert" ON wine_list_likes
  FOR INSERT WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "wine_list_likes_delete" ON wine_list_likes
  FOR DELETE USING (user_id = auth.uid());

-- ── wine_lists_stats VIEW ──────────────────────────────────────────────────
CREATE VIEW wine_lists_stats AS
  SELECT
    wl.id,
    wl.user_id,
    wl.title,
    wl.description,
    wl.visibility,
    wl.created_at,
    wl.updated_at,
    COUNT(DISTINCT wli.id) AS wine_count,
    COUNT(DISTINCT wls.id) AS save_count,
    COUNT(DISTINCT wll.id) AS like_count
  FROM wine_lists wl
  LEFT JOIN wine_list_items wli ON wli.list_id = wl.id
  LEFT JOIN wine_list_saves wls ON wls.list_id = wl.id
  LEFT JOIN wine_list_likes wll ON wll.list_id = wl.id
  GROUP BY wl.id;
