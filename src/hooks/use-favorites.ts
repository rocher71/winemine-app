/**
 * useFavorites — favorites 화면 데이터 훅.
 *
 * 사양: _workspace/design-specs/favorites.md §5-3 / §10 A.
 *
 * v0.1.0 — §10 결정 A: supabase `wine_favorites` 테이블 마이그레이션 부재 → 정적 mock 사용.
 * v0.2.0 에서 supabase 교체 — 인터페이스는 그대로 유지.
 *
 *   v0.2.0 호출 패턴:
 *     const { data } = await supabase
 *       .from('wine_favorites')
 *       .select(`id, notify_on_purchase, added_at,
 *                wines_localized!inner ( lwin, name_ko, display_name, vintage, region, bottle_color, avg_price_krw )`)
 *       .order('added_at', { ascending: false });
 *
 * 비동기 형태로 노출해 supabase 마이그레이션 시 호환성 보장 (wine-story 훅 동일 패턴).
 */
import { useCallback, useEffect, useState } from 'react';
import {
  FAVORITES,
  getFavoritesByUser,
  type FavoriteWineMock,
} from '@/lib/mock/favorites';

/** RN UI 가 row 단위로 소비하는 정규화 shape. */
export interface FavoriteRow {
  id: string;
  wineId: string;
  wineLwin: string;
  /** 한글명 — i18n locale 분기 시 ko 우선. */
  nameKo: string | null;
  /** 영문 표시명 — getLocalizedWineName fallback. */
  displayName: string;
  producer: string;
  vintage: number;
  region: { ko: string; en: string };
  bottleColor: string;
  averagePriceKrw: number | null;
  notifyOnPurchase: boolean;
  addedAt: string;
}

export interface UseFavoritesResult {
  favorites: FavoriteRow[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  toggleNotify: (id: string, next: boolean) => Promise<void>;
}

// v0.1.0 mock 단계 — hardcoded user (keyscreen `me-heavy` verbatim).
// v0.2.0 supabase: const { data: { user } } = await supabase.auth.getUser();
const MOCK_USER_ID = 'me-heavy';

function toRow(fav: FavoriteWineMock): FavoriteRow {
  return {
    id: fav.id,
    wineId: fav.wineId,
    wineLwin: fav.wineLwin,
    nameKo: fav.wine.nameKo,
    displayName: fav.wine.name,
    producer: fav.wine.producer,
    vintage: fav.wine.vintage,
    region: fav.wine.region,
    bottleColor: fav.wine.bottleColor,
    averagePriceKrw: fav.wine.averagePriceKrw,
    notifyOnPurchase: fav.notifyOnPurchase,
    addedAt: fav.addedAt,
  };
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // mock 단계 — sync lookup 이지만 future supabase 호환 위해 microtask 분리.
      const rows = await Promise.resolve().then(() =>
        getFavoritesByUser(MOCK_USER_ID).map(toRow),
      );
      setFavorites(rows);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleNotify = useCallback(async (id: string, next: boolean) => {
    // optimistic update — mock 단계는 in-memory FAVORITES 직접 변이 + state 동기화.
    // v0.2.0 supabase:
    //   const { error } = await supabase
    //     .from('wine_favorites')
    //     .update({ notify_on_purchase: next })
    //     .eq('id', id);
    //   error 시 rollback.
    const idx = FAVORITES.findIndex((f) => f.id === id);
    if (idx >= 0) {
      const cur = FAVORITES[idx];
      if (cur) {
        FAVORITES[idx] = {
          id: cur.id,
          userId: cur.userId,
          wineId: cur.wineId,
          wineLwin: cur.wineLwin,
          notifyOnPurchase: next,
          addedAt: cur.addedAt,
          wine: cur.wine,
        };
      }
    }
    setFavorites((prev) =>
      prev.map((f) => (f.id === id ? { ...f, notifyOnPurchase: next } : f)),
    );
  }, []);

  return {
    favorites,
    loading,
    error,
    refresh: load,
    toggleNotify,
  };
}
