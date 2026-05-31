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

const BUCKET = 'community-photos';

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
 * storage path 또는 이미 절대 URL/로컬 URI 를 expo-image source 로 쓸 수 있는 문자열로 변환.
 *   - http(s):// 또는 file:///ph:// → 그대로 (실모드 업로드 전 optimistic, DEMO 로컬 미리보기)
 *   - 그 외 → community-photos public URL 로 변환 (DB 에 저장된 path)
 */
export function communityPhotoUrl(pathOrUrl: string): string {
  if (/^(https?:|file:|ph:|content:|data:)/.test(pathOrUrl)) return pathOrUrl;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(pathOrUrl);
  return data.publicUrl;
}
