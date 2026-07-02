/**
 * Community comments — 실 테이블 연동 (M3 moderation).
 *
 * 기존 mock `src/lib/mock/community-comments.ts` 의 getCommentsByPost / 작성 흐름을
 * 실 `comments` 테이블(M1 마이그레이션)로 교체한다. 댓글 신고의 선결 조건.
 *
 * 데이터 계약(M1):
 *   - comments(id, post_id, author_id, parent_id, body=단일 text, moderation_status, created_at).
 *   - RLS: SELECT(visible OR 본인 OR 비차단) — 차단/가시성 필터는 DB 가 자동 강제(§4-6).
 *     클라이언트는 추가 필터 없이 신뢰. removed 행은 본문 보존되어 내려옴 → UI 가 tombstone 렌더.
 *   - INSERT(author_id = auth.uid()). UPDATE/DELETE(본인).
 *
 * 작성자 표시명/레벨: comments 는 author_id(UUID)만 보유 → profiles_public VIEW 조인.
 *   조회 후 registerCommunityUser 로 동적 registry 에 등록 → CommentRow(getCommunityUser) 호환.
 *   §4-5: UUID 는 registry id 로만 사용, anonymous_display 만 표시.
 *
 * 본문은 단일 text (사용자 입력 콘텐츠는 단일 언어 — design-spec 결정). CommComment.body 는
 * LocalizedString({ko,en}) shape 이므로 동일 문자열을 양쪽에 담아 호환(localizedBody 가 분기해도 동일).
 */
import { supabase } from '@/lib/supabase';
import { registerCommunityUser } from '@/lib/mock/community-posts';
import type { CommComment } from '@/lib/mock/community-comments';
import type { CommentModerationStatus } from '@/components/community/comment-row';

type LevelId = 1 | 2 | 3 | 4 | 5;

export interface CommentEntry {
  comment: CommComment;
  status: CommentModerationStatus;
  authorId: string;
}

/** created_at → 상대시간(ko). community-posts relativeAgoKo 와 동일 컨벤션(locale 무관 — 기존 한계 승계). */
function relativeAgoKo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '방금 전';
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

function toModerationStatus(raw: string | null | undefined): CommentModerationStatus {
  if (raw === 'removed') return 'removed';
  if (raw === 'pending') return 'pending';
  return 'visible';
}

/**
 * 특정 post 의 댓글을 실 테이블에서 조회. created_at 오름차순(스레드 순서).
 * RLS 가 차단/가시성 자동 필터 → 반환되는 행은 모두 표시 대상(removed 는 tombstone).
 */
export async function fetchCommentsByPost(postId: string): Promise<CommentEntry[]> {
  const { data: rows, error } = await supabase
    .from('comments')
    .select('id, post_id, author_id, parent_id, body, moderation_status, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  // 작성자 표시명/레벨 — profiles_public 조인 (안전 컬럼만, §4-5).
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const { data: profiles } = await supabase
    .from('profiles_public')
    .select('id, anonymous_display, level')
    .in('id', authorIds);
  const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows.map((r) => {
    const p = profMap.get(r.author_id);
    const name = p?.anonymous_display ?? '—';
    const level = (p?.level as LevelId) ?? 1;
    // CommentRow 가 getCommunityUser(comment.userId) 로 표시명/레벨 lookup → registry 등록.
    registerCommunityUser({ id: r.author_id, name, level });

    const comment: CommComment = {
      id: r.id,
      postId: r.post_id,
      userId: r.author_id,
      ago: relativeAgoKo(r.created_at),
      body: { ko: r.body, en: r.body },
      reactions: 0,
      isReply: !!r.parent_id,
      parentId: r.parent_id ?? undefined,
    };
    return { comment, status: toModerationStatus(r.moderation_status), authorId: r.author_id };
  });
}

/** 댓글 INSERT (RLS author_id=auth.uid()). 반환은 새 행 id. parent_id 는 답글 시. */
export async function insertComment(input: {
  postId: string;
  authorId: string;
  body: string;
  parentId?: string | null;
}): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      body: input.body,
      parent_id: input.parentId ?? null,
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return { id: data.id };
}

/** 댓글 DELETE (본인 — RLS 강제). */
export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  return !error;
}
