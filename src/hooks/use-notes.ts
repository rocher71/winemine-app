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

export type TastingNoteDetail = TastingNoteRow & {
  wine: WineLocalizedRow | null;
};

export interface UseNoteResult {
  note: TastingNoteDetail | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useNote(noteId: string | null | undefined): UseNoteResult {
  const [note, setNote] = useState<TastingNoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!noteId) {
      setNote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasting_notes')
        .select('*, wine:wines_localized!inner(*)')
        .eq('id', noteId)
        .maybeSingle();
      if (err) throw err;
      setNote((data ?? null) as unknown as TastingNoteDetail | null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { note, loading, error, refresh: load };
}

export async function deleteNote(noteId: string): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('no session');
  const { error } = await supabase
    .from('tasting_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', uid);
  if (error) throw error;
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
