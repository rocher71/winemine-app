/**
 * 커뮤니티 발행 글 사진 업로드 유틸.
 *
 * 흐름:
 *   - 작성 화면에서 expo-image-picker 로 고른 로컬 file:// URI 배열을 받아
 *     community-photos 버킷의 본인 폴더(<uid>/...)에 업로드하고 storage path 배열을 반환.
 *   - 저장은 path 만 (community_posts.photos jsonb). 렌더 시 communityPhotoUrl() 로 public URL 변환.
 *
 * 버킷: community-photos (public read / 본인 폴더 쓰기) — 20260531000000 마이그레이션.
 * 업로드 패턴: capture.tsx uriToArrayBuffer 와 동일 (RN 에서 Blob 대신 ArrayBuffer 신뢰).
 */
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { shortId } from '@/lib/id';
import { DEMO_MODE } from '@/lib/demo-mode';

const BUCKET = 'community-photos';

/**
 * 유효한 community-photos 버킷 path 형태: "<uuid>/<filename>.<ext>".
 *   - <uuid>: 작성자 폴더(storage RLS 와 동일 규칙). 36자 hex+hyphen.
 *   - <ext>: jpg/jpeg/png/webp.
 * DB 에서 읽은 값은 반드시 이 형태여야 렌더한다 — 임의 외부 URL(트래킹 픽셀)·`data:` 주입 차단.
 */
const PHOTO_PATH_RE = /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i;

/** DB 유래 사진 값이 안전한 버킷 path 인지 검증 (외부 URL/경로 탈출 거부). */
export function isCommunityPhotoPath(value: string): boolean {
  return PHOTO_PATH_RE.test(value);
}

/** RN file:// URI → ArrayBuffer (capture.tsx 동일 패턴). */
async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`fetch ${uri} → ${res.status}`);
  return res.arrayBuffer();
}

/**
 * 로컬 사진 URI 배열을 업로드하고 storage path 배열을 반환.
 * 일부 실패해도 성공한 것만 반환(부분 성공 허용) — 작성 흐름이 통째로 막히지 않도록.
 *
 * @param uris expo-image-picker asset URI 들 (file:// 또는 ph://)
 * @returns 업로드 성공한 path 들 (예: "<uid>/ab12cd.jpg")
 */
export async function uploadCommunityPhotos(uris: string[]): Promise<string[]> {
  if (uris.length === 0) return [];
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('uploadCommunityPhotos: no session');

  const paths: string[] = [];
  for (const uri of uris) {
    try {
      const path = `${uid}/${shortId()}.jpg`;
      const buffer = await uriToArrayBuffer(uri);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
      if (error) {
        console.warn('[uploadCommunityPhotos] upload failed:', error.message);
        continue;
      }
      paths.push(path);
    } catch (err) {
      console.warn('[uploadCommunityPhotos] error:', err);
    }
  }
  return paths;
}

/**
 * 사진 값을 expo-image source 로 쓸 수 있는 문자열로 변환.
 *
 * 보안(2026-05-31 보안 리뷰): 외부 URL(`http(s):`)·`data:` 패스스루 제거.
 *   - DEMO 모드 한정으로만 기기 로컬 미리보기 스킴(file:/ph:/content:)을 그대로 통과
 *     (DEMO 는 Supabase 미접근 — DB 유래 untrusted 값이 없음).
 *   - 실모드 값은 전부 DB/업로드 유래이므로 community-photos 버킷 path 로만 신뢰.
 *     형식 위반(임의 URL 등)은 빈 문자열 반환 → <Image> 가 아무것도 fetch 안 함(트래킹 픽셀 차단).
 *   설령 악성 'https://evil.com/x.jpg' 가 들어와도 getPublicUrl 은 우리 supabase 도메인
 *   하위 경로로 만들 뿐 외부로 요청하지 않는다(여기선 형식 검증으로 그 전에 차단).
 */
export function communityPhotoUrl(pathOrUrl: string): string {
  if (DEMO_MODE && /^(file:|ph:|content:)/.test(pathOrUrl)) return pathOrUrl;
  if (!isCommunityPhotoPath(pathOrUrl)) return '';
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(pathOrUrl);
  return data.publicUrl;
}
