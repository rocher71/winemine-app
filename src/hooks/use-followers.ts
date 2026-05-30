/**
 * useFollowers — follow-list §5-1 신규 hook.
 *
 * follows 에서 대상 id 집합을 구한 뒤, 프로필 정보는 public.profiles_public
 * VIEW(안전 컬럼만)에서 .in('id', ids) 로 조회한다. base profiles 는 owner-only
 * RLS 라서 `profiles!follower_id(*)` embed 는 본인 행만 반환(깨짐) — 또한 (*) 는
 * 민감 컬럼까지 끌어온다. 뷰 조회로 두 문제(접근/과다노출)를 동시에 해소
 * (§4-5 anonymization, §4-6 RLS).
 *
 * 각 항목 isMutual: 반대 방향(상대도 나를 팔로우)인지 — followers ∩ following 교차.
 * 각 항목 isFollowing: 내가 그 사람을 팔로우 중인지 (following set).
 *
 * §4-5 anonymization: id(UUID)는 내부 key (userId) 로만. UI 표시는 anonymous_display.
 * DEMO_MODE: MOCK_FOLLOW_USERS 8명 (디자인 리뷰 스크린샷용).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_FOLLOW_USERS } from '@/lib/mock/users';

export type FollowTab = 'followers' | 'following';

export interface FollowUser {
  /** raw UUID — 내부 key / 프로필 이동용. Text 출력 X (§4-5). */
  userId: string;
  anonymousDisplay: string;
  handle: string | null;
  levelId: 1 | 2 | 3 | 4 | 5;
  bio: string | null;
  isMutual: boolean;
  isFollowing: boolean;
}

interface ProfileJoin {
  id: string;
  anonymous_display: string;
  handle: string | null;
  bio: string | null;
  level: number;
}

function clampLevel(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return value as 1 | 2 | 3 | 4 | 5;
}

export interface UseFollowersResult {
  users: FollowUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFollowers(
  userId: string | undefined,
  tab: FollowTab,
): UseFollowersResult {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        setUsers(MOCK_FOLLOW_USERS);
        return;
      }
      const target = userId ?? (await getCurrentUserId());
      if (!target) {
        setUsers([]);
        return;
      }

      // 내가 팔로우 중인 set (isFollowing 판정용)
      const { data: myFollowing, error: mfErr } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', target);
      if (mfErr) throw mfErr;
      const followingSet = new Set(
        (myFollowing ?? []).map((r) => r.following_id),
      );

      // 나를 팔로우하는 set (mutual 판정용)
      const { data: myFollowers, error: mfrErr } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', target);
      if (mfrErr) throw mfrErr;
      const followerSet = new Set(
        (myFollowers ?? []).map((r) => r.follower_id),
      );

      // tab 에 따라 표시 대상 id 집합 선택 (위에서 이미 조회한 set 재사용).
      //   followers: 나를 팔로우하는 사람 = followerSet
      //   following: 내가 팔로우하는 사람 = followingSet
      const ids = Array.from(tab === 'followers' ? followerSet : followingSet);

      const profilesById = new Map<string, ProfileJoin>();
      if (ids.length > 0) {
        const { data, error: err } = await supabase
          .from('profiles_public')
          .select('id, anonymous_display, handle, bio, level')
          .in('id', ids);
        if (err) throw err;
        for (const p of data ?? []) {
          if (p.id) profilesById.set(p.id, p as ProfileJoin);
        }
      }

      const list: FollowUser[] = [];
      for (const id of ids) {
        const p = profilesById.get(id);
        if (!p) continue;
        list.push({
          userId: p.id,
          anonymousDisplay: p.anonymous_display,
          handle: p.handle,
          levelId: clampLevel(p.level),
          bio: p.bio,
          // mutual: 양방향 (나를 팔로우 + 내가 팔로우)
          isMutual: followerSet.has(p.id) && followingSet.has(p.id),
          isFollowing: followingSet.has(p.id),
        });
      }

      setUsers(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  return { users, loading, error, refresh: load };
}
