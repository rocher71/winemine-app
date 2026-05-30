/**
 * 커뮤니티 발행 글 훅 — 피드 조회 / 발행 / 단건 조회.
 *
 * 정책: domain/ux-decisions/rating-and-review.md (2026-05-30) — 조회 무인증 / 작성 회원 한정,
 *   작성 콘텐츠는 닉네임 표시.
 *
 * 데모/실모드 양립:
 *   - DEMO_MODE: Supabase 미접근. 발행은 published-store(세션 메모리) → 피드 즉시 반영.
 *   - 실모드: community_posts insert/select + profiles_public(nickname,level) 조인(2-query).
 * 두 모드 모두 published-store 를 머지해 발행 직후 optimistic 노출.
 *
 * 피드 머지 순서: published(최신) → real(실모드 fetch) → mock(데모 콘텐츠). id 중복 제거.
 */
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE, DEMO_USER_ID } from '@/lib/demo-mode';
import { MOCK_ME_PROFILE } from '@/lib/mock/users';
import {
  getCommunityPosts,
  getCommunityPost,
  registerCommunityUser,
  type CommPost,
  type CommReactions,
} from '@/lib/mock/community-posts';
import {
  addPublishedPost,
  getPublishedPosts,
  getPublishedPost,
  subscribePublished,
} from '@/lib/community/published-store';
import { getCachedNickname, loadNickname } from '@/lib/community/nickname';

// community_posts 는 generated types 재생성 전이라 any 캐스트 (use-wine-lists 패턴 동일).
const db = supabase as any;

const EMPTY_REACTIONS: CommReactions = { glass: 0, sparkle: 0, bookmark: 0, drank: 0 };

type LevelId = 1 | 2 | 3 | 4 | 5;

/** created_at → 상대시간(ko). mock ago 와 동일한 ko 표기 컨벤션 (locale 무관 verbatim — 기존 한계 승계). */
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

/** community_posts row + 작성자(nickname/level) → CommPost. 작성자를 user registry 에 등록. */
function rowToPost(row: any, author: { nickname: string; level: LevelId }, ago: string): CommPost {
  registerCommunityUser({ id: row.author_id, name: author.nickname, level: author.level });
  return {
    id: row.id,
    type: row.type ?? 'note',
    userId: row.author_id,
    ago,
    wineId: row.wine_lwin ?? undefined,
    rating: row.rating ?? undefined,
    title: row.title,
    body: row.body ?? '',
    reactions: EMPTY_REACTIONS,
    comments: 0,
    photoCount: row.photo_count || undefined,
    listId: row.list_id ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useCommunityFeed — mock 위에 발행/실제 글 prepend
// ─────────────────────────────────────────────────────────────────────────────

export interface UseCommunityFeedResult {
  posts: CommPost[];
  loading: boolean;
  refresh: () => void;
}

export function useCommunityFeed(): UseCommunityFeedResult {
  const published = useSyncExternalStore(subscribePublished, getPublishedPosts, getPublishedPosts);
  const [realPosts, setRealPosts] = useState<CommPost[]>([]);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data: rows, error } = await db
          .from('community_posts')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const ids = [...new Set((rows ?? []).map((r: any) => r.author_id))];
        const authorMap = new Map<string, { nickname: string; level: LevelId }>();
        if (ids.length > 0) {
          const { data: profs } = await db
            .from('profiles_public')
            .select('id, nickname, handle, level')
            .in('id', ids);
          for (const p of profs ?? []) {
            authorMap.set(p.id, { nickname: p.nickname ?? p.handle ?? '회원', level: (p.level ?? 1) as LevelId });
          }
        }
        const mapped = (rows ?? []).map((r: any) =>
          rowToPost(r, authorMap.get(r.author_id) ?? { nickname: '회원', level: 1 }, relativeAgoKo(r.created_at))
        );
        if (active) setRealPosts(mapped);
      } catch {
        if (active) setRealPosts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const posts = useMemo(() => {
    const seen = new Set<string>();
    const out: CommPost[] = [];
    const push = (list: CommPost[]) => {
      for (const p of list) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          out.push(p);
        }
      }
    };
    push(published);
    push(realPosts);
    push(getCommunityPosts());
    return out;
  }, [published, realPosts]);

  return { posts, loading, refresh };
}

// ─────────────────────────────────────────────────────────────────────────────
// useCreatePost — note 공유 발행
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePostInput {
  title: string;
  body: string;
  wineLwin?: string | null;
  rating?: number | null;
  photoCount?: number;
  /** caller(t 보유)가 넘긴 '방금 전' 문구. */
  agoLabel: string;
}

export class NicknameRequiredError extends Error {
  constructor() {
    super('NICKNAME_REQUIRED');
    this.name = 'NicknameRequiredError';
  }
}

export function useCreatePost() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (input: CreatePostInput): Promise<string> => {
    setIsLoading(true);
    try {
      const nickname = getCachedNickname() ?? (await loadNickname());
      if (!nickname) throw new NicknameRequiredError();

      // 현재 회원 식별 + level
      let userId: string;
      let level: LevelId;
      if (DEMO_MODE) {
        userId = DEMO_USER_ID;
        level = (MOCK_ME_PROFILE.level as LevelId) ?? 1;
      } else {
        const uid = await getCurrentUserId();
        if (!uid) throw new Error('Not authenticated');
        userId = uid;
        const { data: prof } = await db.from('profiles_public').select('level').eq('id', uid).maybeSingle();
        level = ((prof?.level as LevelId) ?? 1) as LevelId;
      }
      registerCommunityUser({ id: userId, name: nickname, level });

      let id: string;
      if (DEMO_MODE) {
        id = `local-${Date.now()}`;
      } else {
        const { data, error } = await db
          .from('community_posts')
          .insert({
            author_id: userId,
            type: 'note',
            title: input.title,
            body: input.body,
            wine_lwin: input.wineLwin ?? null,
            rating: input.rating ?? null,
            photo_count: input.photoCount ?? 0,
            visibility: 'public',
          })
          .select('id')
          .single();
        if (error) throw error;
        id = data.id as string;
      }

      const post: CommPost = {
        id,
        type: 'note',
        userId,
        ago: input.agoLabel,
        wineId: input.wineLwin ?? undefined,
        rating: input.rating ?? undefined,
        title: input.title,
        body: input.body,
        reactions: { glass: 0, sparkle: 0, bookmark: 0, drank: 0 },
        comments: 0,
        photoCount: input.photoCount || undefined,
      };
      addPublishedPost(post);
      return id;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading };
}

// ─────────────────────────────────────────────────────────────────────────────
// useCommunityPost — 단건 (mock → published → supabase)
// ─────────────────────────────────────────────────────────────────────────────

export function useCommunityPost(id: string | undefined): { post: CommPost | undefined; loading: boolean } {
  const published = useSyncExternalStore(subscribePublished, getPublishedPosts, getPublishedPosts);
  const [remote, setRemote] = useState<CommPost | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const local = useMemo(() => {
    if (!id) return undefined;
    return getCommunityPost(id) ?? published.find((p) => p.id === id) ?? getPublishedPost(id);
  }, [id, published]);

  useEffect(() => {
    if (!id || local || DEMO_MODE) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data: row, error } = await db.from('community_posts').select('*').eq('id', id).maybeSingle();
        if (error || !row) {
          if (active) setRemote(undefined);
          return;
        }
        const { data: prof } = await db
          .from('profiles_public')
          .select('id, nickname, handle, level')
          .eq('id', row.author_id)
          .maybeSingle();
        const author = {
          nickname: prof?.nickname ?? prof?.handle ?? '회원',
          level: (prof?.level ?? 1) as LevelId,
        };
        if (active) setRemote(rowToPost(row, author, relativeAgoKo(row.created_at)));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, local]);

  return { post: local ?? remote, loading };
}
