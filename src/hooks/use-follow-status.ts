/**
 * useFollowStatus — profile-other §5-3 / follow-list §5-1 신규 hook.
 *
 * follows 테이블 (마이그레이션 완료):
 *   - 조회: select('follower_id').eq('follower_id', myUid).eq('following_id', targetUserId).maybeSingle()
 *   - follow: insert({ follower_id: myUid, following_id: targetUserId })
 *   - unfollow: delete().eq('follower_id', myUid).eq('following_id', targetUserId)
 *
 * optimistic update + followPending. 실패 시 롤백.
 *
 * §4-5 anonymization: follower_id/following_id 는 raw UUID — UI 노출 X (boolean 만).
 * DEMO_MODE: 로컬 상태 토글만 (supabase 호출 0).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';

export interface UseFollowStatusResult {
  isFollowing: boolean;
  pending: boolean;
  error: Error | null;
  /** 현재 상태 반전 (follow ↔ unfollow). optimistic. */
  toggle: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFollowStatus(
  targetUserId: string | undefined,
): UseFollowStatusResult {
  const [isFollowing, setIsFollowing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (DEMO_MODE) {
        return; // 로컬 상태 유지
      }
      if (!targetUserId) {
        setIsFollowing(false);
        return;
      }
      const myUid = await getCurrentUserId();
      if (!myUid) {
        setIsFollowing(false);
        return;
      }
      const { data, error: err } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', myUid)
        .eq('following_id', targetUserId)
        .maybeSingle();
      if (err) throw err;
      setIsFollowing(!!data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [targetUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(async () => {
    if (inFlight.current || !targetUserId) return;
    inFlight.current = true;
    const next = !isFollowing;
    setIsFollowing(next); // optimistic
    setPending(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        return;
      }
      const myUid = await getCurrentUserId();
      if (!myUid) throw new Error('not authenticated');
      if (next) {
        const { error: err } = await supabase
          .from('follows')
          .insert({ follower_id: myUid, following_id: targetUserId });
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', myUid)
          .eq('following_id', targetUserId);
        if (err) throw err;
      }
    } catch (e) {
      setIsFollowing(!next); // 롤백
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  }, [isFollowing, targetUserId]);

  return { isFollowing, pending, error, toggle, refresh: load };
}
