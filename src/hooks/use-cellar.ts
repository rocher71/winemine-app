import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import type { Database } from '@shared/types/database.types';

type WineLocalizedRow = Database['public']['Views']['wines_localized']['Row'];
type CellarItemRow = Database['public']['Tables']['cellar_items']['Row'];

export type CellarStatus = 'cellared' | 'consumed';
export type CellarSortKey = 'recent' | 'vintage' | 'price';

export type CellarItemWithWine = CellarItemRow & {
  wine: Pick<
    WineLocalizedRow,
    'lwin' | 'display_name' | 'name_ko' | 'producer_name' | 'country' | 'bottle_color' | 'type_canonical' | 'vintage'
  > | null;
};

export interface UseCellarSummaryResult {
  cellaredCount: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCellarSummary(): UseCellarSummaryResult {
  const [cellaredCount, setCellaredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setCellaredCount(0);
        return;
      }
      const { count, error: err } = await supabase
        .from('cellar_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('status', 'cellared');
      if (err) throw err;
      setCellaredCount(count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { cellaredCount, loading, error, refresh: load };
}

export interface UseCellarListResult {
  items: CellarItemWithWine[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCellarList(status: CellarStatus): UseCellarListResult {
  const [items, setItems] = useState<CellarItemWithWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setItems([]);
        return;
      }
      const orderColumn = status === 'cellared' ? 'acquired_at' : 'consumed_at';
      const { data, error: err } = await supabase
        .from('cellar_items')
        .select(
          '*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, bottle_color, type_canonical, vintage)',
        )
        .eq('user_id', uid)
        .eq('status', status)
        .order(orderColumn, { ascending: false, nullsFirst: false });
      if (err) throw err;
      setItems((data ?? []) as unknown as CellarItemWithWine[]);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, refresh: load };
}

export async function setCellarStatus(
  id: string,
  next: CellarStatus,
): Promise<void> {
  const payload: { status: CellarStatus; consumed_at: string | null } = {
    status: next,
    consumed_at: next === 'consumed' ? new Date().toISOString().slice(0, 10) : null,
  };
  const { error } = await supabase.from('cellar_items').update(payload).eq('id', id);
  if (error) throw error;
}
