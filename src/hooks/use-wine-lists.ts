import { useCallback, useEffect, useState } from 'react';
import { supabase as _supabase } from '@/lib/supabase';

// New tables (wine_lists, wine_list_items, wine_list_saves, wine_list_likes, wine_lists_stats)
// are not yet in generated types. Cast to bypass until `supabase gen types` is re-run post-migration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = _supabase as any;
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE, DEMO_USER_ID } from '@/lib/demo-mode';
import {
  MOCK_LIST_STATS,
  MOCK_WINE_LIST_ITEMS,
  MOCK_PUBLIC_LIST,
  MOCK_PUBLIC_LIST_ITEMS,
  type MockWineListStats,
  type MockWineListItem,
} from '@/lib/mock/wine-lists';
import { getMockWineByLwin, getMockWineByLwinStrict } from '@/lib/mock/wines';
import { currentLocale } from '@/lib/i18n';

export type ListSortKey = 'recent' | 'created' | 'name' | 'count';
export type ListVisibility = 'public' | 'private';

export interface WineListStats {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  visibility: ListVisibility;
  created_at: string;
  updated_at: string;
  source_list_id: string | null;
  source_list_title: string | null;
  source_author_display: string | null;
  wine_count: number;
  save_count: number;
  like_count: number;
  creator_name: string | null;
  tasted_count?: number;
  /** 설명 없을 때 카드 본문을 채울 와인명 미리보기 (최대 3). home 큐레이션 카드용. */
  preview_names?: string[];
}

/** locale 우선 와인명 (ko면 한글명 우선). */
function pickWineName(wine: { name_ko?: string | null; display_name?: string | null } | null): string | null {
  if (!wine) return null;
  if (currentLocale() === 'ko' && wine.name_ko) return wine.name_ko;
  return wine.display_name ?? wine.name_ko ?? null;
}

/** DEMO: 리스트의 첫 3개 와인명 미리보기 (sort_order 순). */
function mockPreviewNames(listId: string): string[] {
  return MOCK_WINE_LIST_ITEMS.filter((i) => i.list_id === listId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 3)
    .map((i) => pickWineName(getMockWineByLwinStrict(String(i.lwin))))
    .filter((n): n is string => !!n);
}

export interface WineListItemWithWine {
  id: string;
  list_id: string;
  lwin: number;
  sort_order: number;
  note: string | null;
  added_at: string;
  wine: {
    lwin: number;
    display_name: string | null;
    name_ko: string | null;
    producer_name: string | null;
    country: string | null;
    region: string | null;
    bottle_color: string | null;
    type_canonical: string | null;
    vintage: number | null;
  } | null;
}

// ── useMyLists ──────────────────────────────────────────────────────────────
export interface UseMyListsResult {
  lists: WineListStats[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function sortMockLists(lists: MockWineListStats[], sort: ListSortKey): MockWineListStats[] {
  const copy = [...lists];
  switch (sort) {
    case 'recent':
      return copy.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    case 'created':
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case 'name':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'count':
      return copy.sort((a, b) => b.wine_count - a.wine_count);
  }
}

export function useMyLists(sort: ListSortKey = 'recent'): UseMyListsResult {
  const [lists, setLists] = useState<WineListStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const sorted = sortMockLists(MOCK_LIST_STATS, sort) as WineListStats[];
        setLists(sorted.map((l) => ({ ...l, preview_names: mockPreviewNames(l.id) })));
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) { setLists([]); return; }

      const orderCol = sort === 'recent' ? 'updated_at'
        : sort === 'created' ? 'created_at'
        : sort === 'name' ? 'title'
        : 'updated_at';
      const { data, error: err } = await db
        .from('wine_lists_stats')
        .select('*')
        .eq('user_id', uid)
        .order(orderCol, { ascending: sort === 'name' });
      if (err) throw err;
      let rows = (data ?? []) as WineListStats[];
      if (sort === 'count') rows = rows.sort((a, b) => b.wine_count - a.wine_count);

      // 설명 없는 카드 본문용 와인명 미리보기 (리스트별 첫 3개) — 단일 쿼리로 N+1 회피.
      if (rows.length) {
        const { data: itemRows } = await db
          .from('wine_list_items')
          .select('list_id, sort_order, wine:wines_localized!inner(display_name, name_ko)')
          .in('list_id', rows.map((r) => r.id))
          .order('sort_order');
        if (itemRows) {
          const byList = new Map<string, string[]>();
          for (const it of itemRows as { list_id: string; wine: { display_name: string | null; name_ko: string | null } }[]) {
            const arr = byList.get(it.list_id) ?? [];
            if (arr.length >= 3) continue;
            const name = pickWineName(it.wine);
            if (name) { arr.push(name); byList.set(it.list_id, arr); }
          }
          rows = rows.map((r) => ({ ...r, preview_names: byList.get(r.id) ?? [] }));
        }
      }
      setLists(rows);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [sort]);

  useEffect(() => { void load(); }, [load]);

  return { lists, isLoading, error, refetch: load };
}

// ── useListDetail ──────────────────────────────────────────────────────────
export interface UseListDetailResult {
  list: WineListStats | null;
  wines: WineListItemWithWine[];
  isSaved: boolean;
  isOwner: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function mockItemsToWines(items: MockWineListItem[]): WineListItemWithWine[] {
  return items.map((item) => ({
    ...item,
    wine: getMockWineByLwin(String(item.lwin)) as WineListItemWithWine['wine'],
  }));
}

export function useListDetail(id: string): UseListDetailResult {
  const [list, setList] = useState<WineListStats | null>(null);
  const [wines, setWines] = useState<WineListItemWithWine[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const found =
          MOCK_LIST_STATS.find((l) => l.id === id) ??
          (MOCK_PUBLIC_LIST.id === id ? (MOCK_PUBLIC_LIST as WineListStats) : null);
        setList(found ?? null);
        setIsOwner(found?.user_id === DEMO_USER_ID);
        const items =
          id === MOCK_PUBLIC_LIST.id
            ? MOCK_PUBLIC_LIST_ITEMS
            : MOCK_WINE_LIST_ITEMS.filter((i) => i.list_id === id);
        setWines(mockItemsToWines(items));
        setIsSaved(false);
        return;
      }
      const uid = await getCurrentUserId();
      const [listRes, itemsRes, savedRes] = await Promise.all([
        db.from('wine_lists_stats').select('*').eq('id', id).single(),
        db
          .from('wine_list_items')
          .select('*, wine:wines_localized!inner(lwin, display_name, name_ko, producer_name, country, region, bottle_color, type_canonical, vintage)')
          .eq('list_id', id)
          .order('sort_order'),
        uid
          ? db
              .from('wine_list_saves')
              .select('id')
              .eq('list_id', id)
              .eq('saver_id', uid)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      if (listRes.error) throw listRes.error;
      if (itemsRes.error) throw itemsRes.error;
      setList(listRes.data as WineListStats);
      setWines((itemsRes.data ?? []) as unknown as WineListItemWithWine[]);
      setIsSaved(!!savedRes.data);
      setIsOwner(listRes.data?.user_id === uid);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  return { list, wines, isSaved, isOwner, isLoading, error, refetch: load };
}

// ── useCreateList ──────────────────────────────────────────────────────────
export interface CreateListPayload {
  title: string;
  description?: string | null;
  visibility?: ListVisibility;
  lwinList?: number[];
}

export function useCreateList() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (payload: CreateListPayload): Promise<string> => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 400));
        return `list_demo_${Date.now()}`;
      }
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('Not authenticated');
      const { data: listData, error: listErr } = await db
        .from('wine_lists')
        .insert({
          user_id: uid,
          title: payload.title,
          description: payload.description ?? null,
          visibility: payload.visibility ?? 'private',
        })
        .select('id')
        .single();
      if (listErr) throw listErr;
      const newId = listData.id as string;
      if (payload.lwinList && payload.lwinList.length > 0) {
        const items = payload.lwinList.map((lwin, i) => ({
          list_id: newId,
          lwin,
          sort_order: i,
        }));
        const { error: itemErr } = await db.from('wine_list_items').insert(items);
        if (itemErr) throw itemErr;
      }
      return newId;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading };
}

// ── useUpdateList ──────────────────────────────────────────────────────────
export interface UpdateListPayload {
  title?: string;
  description?: string | null;
  visibility?: ListVisibility;
}

export function useUpdateList() {
  const [isLoading, setIsLoading] = useState(false);

  const update = useCallback(async (id: string, fields: UpdateListPayload): Promise<void> => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 300));
        return;
      }
      const { error } = await db
        .from('wine_lists')
        .update(fields)
        .eq('id', id);
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading };
}

// ── useDeleteList ──────────────────────────────────────────────────────────
export function useDeleteList() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteList = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 300));
        return;
      }
      const { error } = await db.from('wine_lists').delete().eq('id', id);
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteList, isLoading };
}

// ── useSaveList ────────────────────────────────────────────────────────────
export function useSaveList(listId: string, initialSaved: boolean) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const save = useCallback(async () => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 200));
        setIsSaved(true);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('Not authenticated');
      const { error } = await db
        .from('wine_list_saves')
        .insert({ list_id: listId, saver_id: uid });
      if (error) throw error;
      setIsSaved(true);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const unsave = useCallback(async () => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 200));
        setIsSaved(false);
        return;
      }
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('Not authenticated');
      const { error } = await db
        .from('wine_list_saves')
        .delete()
        .eq('list_id', listId)
        .eq('saver_id', uid);
      if (error) throw error;
      setIsSaved(false);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  return { isSaved, save, unsave, isLoading };
}

// ── useImportList ──────────────────────────────────────────────────────────
export function useImportList() {
  const [isLoading, setIsLoading] = useState(false);

  const importList = useCallback(async (
    sourceId: string,
    titleSuffix: string,
  ): Promise<string> => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 500));
        return `list_import_${Date.now()}`;
      }
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('Not authenticated');
      // 원본 리스트 읽기
      const [listRes, itemsRes] = await Promise.all([
        db.from('wine_lists').select('*').eq('id', sourceId).single(),
        db.from('wine_list_items').select('lwin, sort_order, note').eq('list_id', sourceId).order('sort_order'),
      ]);
      if (listRes.error) throw listRes.error;
      if (itemsRes.error) throw itemsRes.error;
      // 복사본 생성
      const { data: newList, error: createErr } = await db
        .from('wine_lists')
        .insert({
          user_id: uid,
          title: titleSuffix,
          description: listRes.data.description,
          visibility: 'private',
          source_list_id: sourceId,
        })
        .select('id')
        .single();
      if (createErr) throw createErr;
      const newId = newList.id as string;
      if (itemsRes.data && itemsRes.data.length > 0) {
        const items = (itemsRes.data as Array<Record<string, unknown>>).map((i) => ({ ...i, list_id: newId }));
        const { error: itemErr } = await db.from('wine_list_items').insert(items);
        if (itemErr) throw itemErr;
      }
      return newId;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { importList, isLoading };
}

// ── useToggleVisibility ────────────────────────────────────────────────────
export function useToggleVisibility() {
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(async (
    id: string,
    currentVisibility: ListVisibility,
  ): Promise<void> => {
    const next: ListVisibility = currentVisibility === 'public' ? 'private' : 'public';
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 300));
        return;
      }
      const { error } = await db
        .from('wine_lists')
        .update({ visibility: next })
        .eq('id', id);
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { toggle, isLoading };
}
