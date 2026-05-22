import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_CELLAR_ITEMS } from '@/lib/mock/cellar';
import { MOCK_TASTING_NOTES } from '@/lib/mock/tasting-notes';
import { getMockWineByLwin } from '@/lib/mock/wines';
import type { Database } from '@shared/types/database.types';

type WineLocalizedRow = Database['public']['Views']['wines_localized']['Row'];
type CellarItemRow = Database['public']['Tables']['cellar_items']['Row'];

export type CellarStatus = 'cellared' | 'consumed';
/**
 * cellar 화면 sort key.
 * - recent: acquired_at (or consumed_at) 최신 우선
 * - drinkSoon: drink-window from year 임박 우선 (없으면 뒤로)
 * - vintage: 빈티지 최신 우선
 * - region: wines_localized.region 알파벳 순
 * - storage: cellar_items.storage 알파벳 순
 * - price: purchase_price_krw 높은 가격 우선
 */
export type CellarSortKey = 'recent' | 'drinkSoon' | 'vintage' | 'region' | 'storage' | 'price';

export type CellarItemWithWine = CellarItemRow & {
  wine: Pick<
    WineLocalizedRow,
    | 'lwin'
    | 'display_name'
    | 'name_ko'
    | 'producer_name'
    | 'country'
    | 'region'
    | 'bottle_color'
    | 'type_canonical'
    | 'vintage'
    | 'drink_window_from_year'
    | 'drink_window_peak_year'
    | 'drink_window_to_year'
  > | null;
};

export interface UseCellarSummaryResult {
  cellaredCount: number;
  /** consumed 상태 cellar_items 수 (tasted 탭 placeholder count) */
  consumedCount: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCellarSummary(): UseCellarSummaryResult {
  const [cellaredCount, setCellaredCount] = useState(0);
  const [consumedCount, setConsumedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const cellaredN = MOCK_CELLAR_ITEMS.filter((i) => i.status === 'cellared').length;
        const consumedN = MOCK_CELLAR_ITEMS.filter((i) => i.status === 'consumed').length;
        setCellaredCount(cellaredN);
        setConsumedCount(consumedN);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setCellaredCount(0);
        setConsumedCount(0);
        return;
      }
      const [cellared, consumed] = await Promise.all([
        supabase
          .from('cellar_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('status', 'cellared'),
        supabase
          .from('cellar_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('status', 'consumed'),
      ]);
      if (cellared.error) throw cellared.error;
      if (consumed.error) throw consumed.error;
      setCellaredCount(cellared.count ?? 0);
      setConsumedCount(consumed.count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { cellaredCount, consumedCount, loading, error, refresh: load };
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
      if (DEMO_MODE) {
        const filtered = MOCK_CELLAR_ITEMS.filter((i) => i.status === status).map((i) => ({
          ...i,
          wine: getMockWineByLwin(i.wine_lwin) as CellarItemWithWine['wine'],
        }));
        // sort by acquired_at (cellared) or consumed_at (consumed) desc
        const orderColumn = status === 'cellared' ? 'acquired_at' : 'consumed_at';
        filtered.sort((a, b) => {
          const av = (a[orderColumn] as string | null) ?? '';
          const bv = (b[orderColumn] as string | null) ?? '';
          return bv.localeCompare(av);
        });
        setItems(filtered);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setItems([]);
        return;
      }
      const orderColumn = status === 'cellared' ? 'acquired_at' : 'consumed_at';
      const { data, error: err } = await supabase
        .from('cellar_items')
        .select(
          '*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, region, bottle_color, type_canonical, vintage, drink_window_from_year, drink_window_peak_year, drink_window_to_year)',
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

export async function deleteCellarItem(id: string): Promise<void> {
  const { error } = await supabase.from('cellar_items').delete().eq('id', id);
  if (error) throw error;
}

export interface UseCellarItemResult {
  item: CellarItemWithWine | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCellarItem(
  lwin: string | null | undefined,
  cellarItemId: string | null | undefined,
): UseCellarItemResult {
  const [item, setItem] = useState<CellarItemWithWine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!lwin) {
      setItem(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const matches = MOCK_CELLAR_ITEMS.filter((i) => i.wine_lwin === lwin);
        let found: typeof matches[number] | undefined;
        if (cellarItemId) {
          found = matches.find((i) => i.id === cellarItemId);
        } else {
          found = matches
            .slice()
            .sort((a, b) => (b.acquired_at ?? '').localeCompare(a.acquired_at ?? ''))[0];
        }
        if (!found) {
          setItem(null);
          return;
        }
        setItem({
          ...found,
          wine: getMockWineByLwin(found.wine_lwin) as CellarItemWithWine['wine'],
        });
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setItem(null);
        return;
      }
      let query = supabase
        .from('cellar_items')
        .select(
          '*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, region, classification, bottle_color, type_canonical, vintage, drink_window_from_year, drink_window_peak_year, drink_window_to_year)',
        )
        .eq('user_id', uid)
        .eq('wine_lwin', lwin);
      if (cellarItemId) {
        query = query.eq('id', cellarItemId);
      } else {
        query = query.order('acquired_at', { ascending: false }).limit(1);
      }
      const { data, error: err } = await query.maybeSingle();
      if (err) throw err;
      setItem((data ?? null) as unknown as CellarItemWithWine | null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [lwin, cellarItemId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { item, loading, error, refresh: load };
}

export interface UseNotesCountResult {
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useNotesCountForWine(lwin: string | null | undefined): UseNotesCountResult {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!lwin) {
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const n = MOCK_TASTING_NOTES.filter((note) => note.wine_lwin === lwin).length;
        setCount(n);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setCount(0);
        return;
      }
      const { count: c, error } = await supabase
        .from('tasting_notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('wine_lwin', lwin);
      if (error) throw error;
      setCount(c ?? 0);
    } catch (err) {
      console.warn('[notes count] failed:', err);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [lwin]);

  useEffect(() => {
    void load();
  }, [load]);

  return { count, loading, refresh: load };
}
