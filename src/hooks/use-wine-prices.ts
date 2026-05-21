/**
 * useWinePrices — wine-prices 화면 데이터 훅 (purchases lookup).
 *
 * 사양: _workspace/design-specs/wine-prices.md §5.
 *
 * v0.1.0 — wine-prices.md §10 결정 A: supabase `purchases` 테이블 없이 정적 mock 사용.
 * 향후 v0.2.0 에서 `supabase.from('purchases').select().eq('wine_lwin', lwin)` 으로 교체.
 * 인터페이스는 동일 — { purchases, loading, error, refresh }.
 *
 * 비동기 형태로 노출해 supabase 마이그레이션 시 호환성 보장 (use-wine-story.ts 패턴 일치).
 */
import { useCallback, useEffect, useState } from 'react';
import { getPurchasesByLwin, type Purchase } from '@/lib/mock/purchases';

export interface UseWinePricesResult {
  purchases: Purchase[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWinePrices(
  lwin: string | null | undefined,
): UseWinePricesResult {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // mock 단계 — sync lookup 이지만 future supabase 호환 위해 microtask 분리.
      await Promise.resolve();
      setPurchases(getPurchasesByLwin(lwin));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [lwin]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { purchases, loading, error, refresh: load };
}
