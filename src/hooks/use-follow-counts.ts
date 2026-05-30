/**
 * useFollowCounts — profile-me §CH-5 / profile-other §5-1 신규 hook.
 *
 * profiles.follower_count + following_count 비정규화 컬럼 읽기 (마이그레이션 완료).
 *
 * - userId 미전달 시 현재 유저(auth.uid).
 * - DEMO_MODE: MOCK_ME_PROFILE follower_count/following_count.
 *
 * §4-5 anonymization: 카운트 숫자만 — UUID 노출 0.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_ME_PROFILE } from '@/lib/mock/users';

export interface UseFollowCountsResult {
  followerCount: number | undefined;
  followingCount: number | undefined;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFollowCounts(userId?: string): UseFollowCountsResult {
  const [followerCount, setFollowerCount] = useState<number | undefined>(
    undefined,
  );
  const [followingCount, setFollowingCount] = useState<number | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE && !userId) {
        setFollowerCount(MOCK_ME_PROFILE.follower_count);
        setFollowingCount(MOCK_ME_PROFILE.following_count);
        return;
      }
      const target = userId ?? (await getCurrentUserId());
      if (!target) {
        setFollowerCount(undefined);
        setFollowingCount(undefined);
        return;
      }
      // profiles_public VIEW: 카운트는 공개 컬럼. base profiles 는 owner-only RLS
      // 라서 타 사용자 카운트는 뷰로만 읽힘 (§4-6).
      const { data, error: err } = await supabase
        .from('profiles_public')
        .select('follower_count, following_count')
        .eq('id', target)
        .maybeSingle();
      if (err) throw err;
      setFollowerCount(data?.follower_count ?? undefined);
      setFollowingCount(data?.following_count ?? undefined);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setFollowerCount(undefined);
      setFollowingCount(undefined);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { followerCount, followingCount, loading, error, refresh: load };
}
