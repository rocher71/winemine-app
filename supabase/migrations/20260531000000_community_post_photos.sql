-- Community Post Photos: 커뮤니티 발행 글에 첨부 사진 저장 (DB 경로 + Storage 버킷).
-- 배경: community_posts 는 photo_count(정수)만 보유 → 실제 사진을 저장/조회할 곳이 없어
--   작성 시 첨부한 사진이 발행 후 상세에서 표시되지 않던 문제 해결.
-- 정책: 커뮤니티는 무인증 공개 조회(domain/policies/anonymization.md 2026-05-30) →
--   사진 버킷은 public read. 쓰기는 본인 폴더(auth.uid())만 — label-photos(private)와 구분.
-- 기존 community_posts / wines / tasting_notes 등 다른 테이블 변경 없음 (손상 0).

-- ── community_posts.photos (jsonb 경로 배열) ────────────────────────────────────
-- shape: ["<uid>/<id>.jpg", ...] (community-photos 버킷 기준 storage path 배열).
-- 항상 게시글과 함께 조회되므로 별도 테이블 대신 동일 row 에 보관 (단일 쿼리, Plan D 얇게 유지).
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 배열 + 최대 9장 제약 (작성 UI PHOTO_MAX 와 일치).
ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_photos_array;
ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_photos_array
  CHECK (jsonb_typeof(photos) = 'array' AND jsonb_array_length(photos) <= 9);

-- ── community-photos 버킷 (public read) ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 조회: public 버킷이라 익명 포함 누구나 read (커뮤니티 공개 조회 정책).
DROP POLICY IF EXISTS "community_photos_public_select" ON storage.objects;
CREATE POLICY "community_photos_public_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'community-photos');

-- 쓰기: 본인 폴더(<uid>/...)만. 무인증은 auth.uid() NULL 이라 자동 차단.
DROP POLICY IF EXISTS "community_photos_own_insert" ON storage.objects;
CREATE POLICY "community_photos_own_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "community_photos_own_update" ON storage.objects;
CREATE POLICY "community_photos_own_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "community_photos_own_delete" ON storage.objects;
CREATE POLICY "community_photos_own_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
