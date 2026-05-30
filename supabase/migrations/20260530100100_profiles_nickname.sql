-- profiles.nickname: 작성 콘텐츠 표시명 (2026-05-30 정체성 모델 전환)
--   domain/ux-decisions/rating-and-review.md Decision 3 — 작성 콘텐츠는 회원 닉네임으로 표시.
--   기존 anonymous_display(HMAC 핸들)는 폐기 방향이나 컬럼 자체는 보존(데이터 손상 0).
-- nickname: 가입 시 사용자가 정한 핸들. nullable (미설정 시 클라이언트가 첫 발행에서 prompt).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname text
  CHECK (nickname IS NULL OR char_length(nickname) BETWEEN 1 AND 30);

-- profiles_public VIEW 에 nickname 노출 (공개 안전 컬럼).
-- CREATE OR REPLACE VIEW 는 기존 컬럼 순서 보존 + 끝에 신규 컬럼 추가만 허용 → nickname 을 맨 끝에.
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = false) AS
SELECT
  id,
  anonymous_display,
  handle,
  bio,
  level,
  public_wines_count,
  public_countries_count,
  public_regions_count,
  public_notes_count,
  follower_count,
  following_count,
  created_at,
  nickname
FROM public.profiles;
