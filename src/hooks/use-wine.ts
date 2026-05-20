import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@shared/types/database.types';

export type WineLocalized = Database['public']['Views']['wines_localized']['Row'];

export interface UseWineResult {
  wine: WineLocalized | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWine(lwin: string | null | undefined): UseWineResult {
  const [wine, setWine] = useState<WineLocalized | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!lwin) {
      setWine(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('wines_localized')
        .select('*')
        .eq('lwin', lwin)
        .maybeSingle();
      if (err) throw err;
      setWine(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [lwin]);

  useEffect(() => {
    void load();
  }, [load]);

  return { wine, loading, error, refresh: load };
}
