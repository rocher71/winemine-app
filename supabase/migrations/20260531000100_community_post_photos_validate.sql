-- Community Post Photos 서버측 검증 (defense in depth — 2026-05-31 보안 리뷰).
-- 배경: community_posts.photos 는 작성자가 RLS 상 자기 글에 쓸 수 있고, 기존 CHECK 는
--   "배열 + 길이<=9" 만 검증 → 클라이언트 우회(PostgREST 직접 호출)로 임의 문자열
--   (예: "https://evil.com/pixel.jpg", "data:...") 를 저장할 수 있었다. 그 글을 보는
--   모든 사용자의 앱이 <Image> 로 해당 URL 을 fetch → IP/UA 유출(트래킹 픽셀)·콘텐츠 주입.
-- 조치: photos 의 각 원소가 community-photos 버킷의 "본인 폴더 path" 형식인지 trigger 로 강제.
--   storage RLS 폴더 규칙((storage.foldername(name))[1] = auth.uid()) 을 DB 레벨에서 미러링.
-- 기존 데이터/다른 테이블 변경 없음 (additive — 함수+트리거만 추가).

CREATE OR REPLACE FUNCTION public.validate_community_post_photos()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  elem text;
BEGIN
  IF jsonb_typeof(NEW.photos) <> 'array' THEN
    RAISE EXCEPTION 'community_posts.photos must be a json array';
  END IF;
  -- 각 원소: "<author_id>/<filename>.(jpg|jpeg|png|webp)" — 본인 폴더 + 허용 확장자.
  -- author_id 는 uuid(소문자 hex+hyphen) 라 정규식 메타문자 없음 → 안전하게 interpolate.
  FOR elem IN SELECT jsonb_array_elements_text(NEW.photos)
  LOOP
    IF elem !~ ('^' || NEW.author_id::text || '/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$') THEN
      RAISE EXCEPTION
        'community_posts.photos element % must be a community-photos path under the author folder',
        elem;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_community_post_photos ON public.community_posts;
CREATE TRIGGER trg_validate_community_post_photos
  BEFORE INSERT OR UPDATE OF photos ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_community_post_photos();
