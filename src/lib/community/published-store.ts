/**
 * Published posts session store — 발행된 커뮤니티 글의 세션 메모리 스토어.
 *
 * 용도:
 *   - DEMO_MODE: Supabase 대신 여기에 발행 → 피드/상세가 즉시 반영 (사용자 시각 확인).
 *   - 실모드: Supabase insert 성공 후 optimistic 으로 즉시 노출 (refetch 전 깜빡임 제거).
 *
 * 세션 한정 — 앱 재시작 시 초기화 (영속은 Supabase 가 담당). useSyncExternalStore 연동.
 */
import type { CommPost } from '@/lib/mock/community-posts';

let posts: CommPost[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** 신규 발행 글을 맨 앞(최신)에 추가. 동일 id 는 교체. */
export function addPublishedPost(post: CommPost) {
  posts = [post, ...posts.filter((p) => p.id !== post.id)];
  emit();
}

/** 현재 발행 스토어 스냅샷 (최신순). 참조 안정성 유지 — emit 시에만 새 배열. */
export function getPublishedPosts(): CommPost[] {
  return posts;
}

export function getPublishedPost(id: string): CommPost | undefined {
  return posts.find((p) => p.id === id);
}

export function subscribePublished(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
