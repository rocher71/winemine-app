/**
 * useMyNoteForWine — 현재 사용자가 작성한 노트를 wine_lwin으로 조회.
 *
 * 사양: wine-detail.md §12 Q14 — MyTastingNoteCard 분기 (있을 때) / WriteNoteCta (없을 때).
 * RLS가 user_id 자동 필터링 — limit 1로 첫 노트만 가져옴 (한 사용자가 같은 와인에 여러 노트 가능하지만
 * 현재 wine-detail은 가장 최근 1개만 표시 — keyscreen 동일).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_TASTING_NOTES } from '@/lib/mock/tasting-notes';
import type { Database } from '@shared/types/database.types';

type TastingNoteRow = Database['public']['Tables']['tasting_notes']['Row'];

export interface UseMyNoteForWineResult {
  note: TastingNoteRow | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useMyNoteForWine(
  wineLwin: string | null | undefined,
): UseMyNoteForWineResult {
  const [note, setNote] = useState<TastingNoteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!wineLwin) {
      setNote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const matches = MOCK_TASTING_NOTES.filter((n) => n.wine_lwin === wineLwin);
        const latest = matches
          .slice()
          .sort((a, b) => (b.tasted_at ?? '').localeCompare(a.tasted_at ?? ''))[0];
        setNote(latest ?? null);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setNote(null);
        return;
      }
      const { data, error: err } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', uid)
        .eq('wine_lwin', wineLwin)
        .order('tasted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (err) throw err;
      setNote(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [wineLwin]);

  useEffect(() => {
    void load();
  }, [load]);

  return { note, loading, error, refresh: load };
}
