/**
 * useOtherUserProfile — profile-other §5-1 신규 hook.
 *
 * supabase.from('profiles').select('*').eq('id', userId).maybeSingle().
 * 새 컬럼 포함: handle, bio, public_*, follower_count, following_count.
 *
 * §4-5 anonymization: id 는 결과에 포함되나 UI Text 자식 출력 X (anonymous_display 만 표시).
 * DEMO_MODE: MOCK_OTHER_PROFILE 반환 (디자인 리뷰 스크린샷용).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_OTHER_PROFILE } from '@/lib/mock/users';
import type { Database } from '@shared/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UseOtherUserProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useOtherUserProfile(
  userId: string | undefined,
): UseOtherUserProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        setProfile({ ...MOCK_OTHER_PROFILE, id: userId ?? MOCK_OTHER_PROFILE.id });
        return;
      }
      if (!userId) {
        setProfile(null);
        return;
      }
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (err) throw err;
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, loading, error, refresh: load };
}
