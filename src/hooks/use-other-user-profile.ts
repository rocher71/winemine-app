/**
 * useOtherUserProfile — profile-other §5-1 신규 hook.
 *
 * 교차 사용자 읽기는 public.profiles_public VIEW(안전 컬럼만)로 조회 — base
 * profiles 테이블은 owner-only RLS 라서 email / linked_providers 등 민감 컬럼은
 * 타 사용자에게 절대 도달 불가 (§4-5 anonymization, §4-6 RLS). select('*') 대신
 * 화면이 실제로 쓰는 안전 컬럼만 명시 (defense-in-depth).
 *
 * §4-5 anonymization: id 는 결과에 포함되나 UI Text 자식 출력 X (anonymous_display 만 표시).
 * DEMO_MODE: MOCK_OTHER_PROFILE 의 공개 컬럼만 반환 (디자인 리뷰 스크린샷용).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_OTHER_PROFILE } from '@/lib/mock/users';
import type { Database } from '@shared/types/database.types';

/** 공개 프로필 — profiles_public VIEW Row. 민감 컬럼(email 등) 미포함. */
export type Profile = Database['public']['Views']['profiles_public']['Row'];

const PUBLIC_PROFILE_COLUMNS =
  'id, anonymous_display, handle, bio, nickname, level, public_wines_count, public_countries_count, public_regions_count, public_notes_count, follower_count, following_count, created_at';

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
        const m = MOCK_OTHER_PROFILE;
        setProfile({
          id: userId ?? m.id,
          anonymous_display: m.anonymous_display,
          handle: m.handle,
          bio: m.bio,
          nickname: m.nickname,
          level: m.level,
          public_wines_count: m.public_wines_count,
          public_countries_count: m.public_countries_count,
          public_regions_count: m.public_regions_count,
          public_notes_count: m.public_notes_count,
          follower_count: m.follower_count,
          following_count: m.following_count,
          created_at: m.created_at,
        });
        return;
      }
      if (!userId) {
        setProfile(null);
        return;
      }
      const { data, error: err } = await supabase
        .from('profiles_public')
        .select(PUBLIC_PROFILE_COLUMNS)
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
