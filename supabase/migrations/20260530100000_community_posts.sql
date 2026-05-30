-- Community Posts: 커뮤니티 발행(공유) 글 1 테이블 + RLS
-- 정책: domain/policies/anonymization.md (2026-05-30) — 조회 무인증 / 작성 회원 한정.
--   작성자는 author_id(=auth.uid())로 저장, UI 표시는 profiles.nickname (profiles_public VIEW).
-- v0.1.0 범위: type='note'(노트 공유)만 클라이언트에서 발행. 나머지 type 은 forward-compat 로 허용.
-- 기존 wines / tasting_notes / wine_lists 테이블 변경 없음 (손상 0).

-- ── community_posts ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL DEFAULT 'note'
                            CHECK (type IN ('note','column','album','news','question','list')),
  title       text        NOT NULL CHECK (char_length(title) <= 120),
  body        text        NOT NULL DEFAULT '' CHECK (char_length(body) <= 5000),
  -- 첨부 와인 LWIN (mock note 의 wine_lwin 슬러그/번호). FK 없음 — 카탈로그 미수록 슬러그 허용.
  wine_lwin   text,
  -- 5점 0.5 단위 사회적 평점 (Model C). null 허용.
  rating      numeric(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  photo_count integer     NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  -- type='list' 일 때 연결 (현재 범위 외, forward-compat).
  list_id     uuid        REFERENCES public.wine_lists(id) ON DELETE SET NULL,
  visibility  text        NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility_created
  ON public.community_posts(visibility, created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 조회: public 글은 누구나(인증 세션), private 은 본인만.
CREATE POLICY "community_posts_select" ON public.community_posts
  FOR SELECT USING (
    visibility = 'public'
    OR author_id = auth.uid()
  );

-- 작성/수정/삭제: 본인 글만 (회원 한정 — 무인증은 auth.uid() NULL 이라 자동 차단).
CREATE POLICY "community_posts_insert" ON public.community_posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "community_posts_update" ON public.community_posts
  FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "community_posts_delete" ON public.community_posts
  FOR DELETE USING (author_id = auth.uid());

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.update_community_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_community_posts_updated_at();
