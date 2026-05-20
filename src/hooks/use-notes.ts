import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import type { Database } from '@shared/types/database.types';

type WineLocalizedRow = Database['public']['Views']['wines_localized']['Row'];
type TastingNoteRow = Database['public']['Tables']['tasting_notes']['Row'];

export type TastingNoteWithWine = TastingNoteRow & {
  wine: Pick<
    WineLocalizedRow,
    'lwin' | 'display_name' | 'name_ko' | 'bottle_color' | 'type_canonical' | 'vintage'
  > | null;
};

export interface UseRecentNotesResult {
  notes: TastingNoteWithWine[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useRecentNotes(limit = 3): UseRecentNotesResult {
  const [notes, setNotes] = useState<TastingNoteWithWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setNotes([]);
        return;
      }
      const { data, error: err } = await supabase
        .from('tasting_notes')
        .select(
          '*, wine:wines_localized!inner(lwin, display_name, name_ko, bottle_color, type_canonical, vintage)',
        )
        .eq('user_id', uid)
        .order('tasted_at', { ascending: false })
        .limit(limit);
      if (err) throw err;
      setNotes((data ?? []) as unknown as TastingNoteWithWine[]);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { notes, loading, error, refresh: load };
}
