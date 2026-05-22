import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_ME_PROFILE } from '@/lib/mock/users';
import type { Database } from '@shared/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        setProfile(MOCK_ME_PROFILE);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setProfile(null);
        return;
      }
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (err) throw err;
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, loading, error, refresh: load };
}
