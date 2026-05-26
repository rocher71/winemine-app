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
export type TastedSortKey = 'recent' | 'count' | 'vintage' | 'region' | 'price';

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

/**
 * TastedGroup — tasted 탭에서 wine_lwin 단위로 묶은 consumed cellar_items 집계.
 * cellar_items는 한 wine_lwin에 여러 row 가능 (같은 와인 N회 음용).
 */
export interface TastedGroup {
  lwin: string;
  wine: CellarItemWithWine['wine'];
  /** 소비 횟수 (consumed 상태 cellar_items count) */
  count: number;
  /** 가장 최근 consumed_at (없으면 null) */
  lastConsumedAt: string | null;
  /** 구매가 중 최고값 (price 정렬용, 없으면 null) */
  maxPriceKrw: number | null;
}

export interface UseTastedGroupedResult {
  groups: TastedGroup[];
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * useTastedGrouped — consumed cellar_items 전부 fetch → wine_lwin 기준 그룹화.
 * lastConsumedAt 내림차순 정렬. (UX 결정: ux-decisions/cellar-tasted-tab.md Decision 1)
 */
export function useTastedGrouped(): UseTastedGroupedResult {
  const [groups, setGroups] = useState<TastedGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let rows: CellarItemWithWine[] = [];
      if (DEMO_MODE) {
        rows = MOCK_CELLAR_ITEMS.filter((i) => i.status === 'consumed').map((i) => ({
          ...i,
          wine: getMockWineByLwin(i.wine_lwin) as CellarItemWithWine['wine'],
        }));
      } else {
        const uid = await getCurrentUserId();
        if (!uid) {
          setGroups([]);
          return;
        }
        const { data, error: err } = await supabase
          .from('cellar_items')
          .select(
            '*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, region, bottle_color, type_canonical, vintage, drink_window_from_year, drink_window_peak_year, drink_window_to_year)',
          )
          .eq('user_id', uid)
          .eq('status', 'consumed')
          .order('consumed_at', { ascending: false, nullsFirst: false });
        if (err) throw err;
        rows = (data ?? []) as unknown as CellarItemWithWine[];
      }

      // wine_lwin 기준 reduce → TastedGroup
      const map = new Map<string, TastedGroup>();
      for (const row of rows) {
        if (!row.wine?.lwin) continue;
        const lwin = row.wine.lwin;
        const existing = map.get(lwin);
        const consumedAt = row.consumed_at ?? null;
        const priceKrw = row.purchase_price_krw ?? null;
        if (existing) {
          existing.count += 1;
          if (consumedAt && (!existing.lastConsumedAt || consumedAt > existing.lastConsumedAt)) {
            existing.lastConsumedAt = consumedAt;
          }
          if (priceKrw !== null && (existing.maxPriceKrw === null || priceKrw > existing.maxPriceKrw)) {
            existing.maxPriceKrw = priceKrw;
          }
        } else {
          map.set(lwin, {
            lwin,
            wine: row.wine,
            count: 1,
            lastConsumedAt: consumedAt,
            maxPriceKrw: priceKrw,
          });
        }
      }

      const grouped = Array.from(map.values()).sort((a, b) => {
        const av = a.lastConsumedAt ?? '';
        const bv = b.lastConsumedAt ?? '';
        return bv.localeCompare(av);
      });
      setGroups(grouped);
    } catch (e) {
      console.warn('[tasted grouped] failed:', e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { groups, loading, refresh: load };
}

/**
 * useCellarHistory — 특정 lwin의 consumed cellar_items 전부 조회 (consumed_at DESC).
 * History Page (`/cellar/[lwin]/history`)에서 사용.
 */
export function useCellarHistory(lwin: string | null | undefined): UseCellarListResult {
  const [items, setItems] = useState<CellarItemWithWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!lwin) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const filtered = MOCK_CELLAR_ITEMS.filter(
          (i) => i.status === 'consumed' && i.wine_lwin === lwin,
        ).map((i) => ({
          ...i,
          wine: getMockWineByLwin(i.wine_lwin) as CellarItemWithWine['wine'],
        }));
        filtered.sort((a, b) => (b.consumed_at ?? '').localeCompare(a.consumed_at ?? ''));
        setItems(filtered);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setItems([]);
        return;
      }
      const { data, error: err } = await supabase
        .from('cellar_items')
        .select(
          '*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, region, bottle_color, type_canonical, vintage, drink_window_from_year, drink_window_peak_year, drink_window_to_year)',
        )
        .eq('user_id', uid)
        .eq('status', 'consumed')
        .eq('wine_lwin', lwin)
        .order('consumed_at', { ascending: false, nullsFirst: false });
      if (err) throw err;
      setItems((data ?? []) as unknown as CellarItemWithWine[]);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [lwin]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, refresh: load };
}

/**
 * insertDrinkAgain — "또 마셨어요" 흐름. 새 consumed cellar_item 삽입.
 * (UX 결정: ux-decisions/cellar-tasted-tab.md Decision 3)
 * 반환: 삽입된 cellar_item.id
 * DEMO_MODE 시 throw (v0.1.0 alpha scope — mock 삽입 미지원).
 */
export async function insertDrinkAgain(lwin: string): Promise<{ id: string }> {
  if (DEMO_MODE) {
    throw new Error('demo mode');
  }
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('not authenticated');
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('cellar_items')
    .insert({
      user_id: uid,
      wine_lwin: lwin,
      status: 'consumed',
      consumed_at: today,
      acquired_at: today,
      quantity: 1,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id };
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

type TastingNoteRow = Database['public']['Tables']['tasting_notes']['Row'];

export interface UseNotesForWineResult {
  notes: TastingNoteRow[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useNotesForWine(lwin: string | null | undefined): UseNotesForWineResult {
  const [notes, setNotes] = useState<TastingNoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!lwin) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const filtered = MOCK_TASTING_NOTES
          .filter((n) => n.wine_lwin === lwin)
          .sort((a, b) => (b.tasted_at ?? '').localeCompare(a.tasted_at ?? ''));
        setNotes(filtered);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) {
        setNotes([]);
        return;
      }
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', uid)
        .eq('wine_lwin', lwin)
        .order('tasted_at', { ascending: false });
      if (error) throw error;
      setNotes(data ?? []);
    } catch (err) {
      console.warn('[notes for wine] failed:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [lwin]);

  useEffect(() => {
    void load();
  }, [load]);

  return { notes, loading, refresh: load };
}
