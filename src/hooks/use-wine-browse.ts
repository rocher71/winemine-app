/**
 * useWineBrowse — 홈 "와인 둘러보기" 카탈로그 페이지네이션 훅.
 *
 * use-wine.ts와 동일한 DEMO_MODE 패턴:
 *   - DEMO_MODE  → src/lib/mock/wines MOCK_WINES (15와인) 클라이언트 페이지네이션
 *   - 실 모드    → wines_localized VIEW를 .range()로 페이지 조회 (RLS 자동)
 *
 * 리더 결정: wines_localized엔 rating/price/grapes가 없으므로 카드에서 해당 요소는 숨김
 * (MockWine.score/priceKrw/grapes optional). rating 집계 VIEW는 별도 supabase 작업(v0.2.0).
 *
 * raw row를 보관하고 locale로 매핑 → 언어 전환 시 이름이 즉시 ko/en 반영.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { MOCK_WINES } from '@/lib/mock/wines';
import type { Database } from '@shared/types/database.types';
import type { TypeCanonical } from '@/lib/design-tokens';
import type { MockWine } from '@/components/home/wine-feed-row';

type WineLocalized = Database['public']['Views']['wines_localized']['Row'];

const PAGE_SIZE = 6;

function toBrowseWine(r: WineLocalized, locale: string): MockWine {
  const name =
    locale === 'en'
      ? r.display_name ?? r.name_ko ?? r.wine ?? ''
      : r.name_ko ?? r.display_name ?? r.wine ?? '';
  return {
    id: r.lwin ?? name,
    lwin: r.lwin ?? '',
    name,
    producer: r.producer_name ?? '',
    vintage: r.vintage ?? 0,
    region: r.region ?? '',
    country: r.country ?? '',
    type: (r.type_canonical as TypeCanonical | null) ?? 'red',
    // grapes/score/priceKrw: wines_localized 미보유 → undefined (카드에서 숨김)
  };
}

export interface UseWineBrowseResult {
  wines: MockWine[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useWineBrowse(): UseWineBrowseResult {
  const { i18n } = useTranslation();
  const [rows, setRows] = useState<WineLocalized[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // in-flight 가드 (near-bottom 스크롤이 loadMore를 연속 호출하는 것 방지)
  const fetching = useRef(false);

  const fetchPage = useCallback(async (offset: number) => {
    if (fetching.current) return;
    fetching.current = true;
    const initial = offset === 0;
    if (initial) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const page = MOCK_WINES.slice(offset, offset + PAGE_SIZE);
        setRows((prev) => (initial ? page : [...prev, ...page]));
        setHasMore(offset + PAGE_SIZE < MOCK_WINES.length);
        return;
      }
      const { data, error: err } = await supabase
        .from('wines_localized')
        .select('*')
        .eq('status', 'active')
        .order('display_name', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (err) throw err;
      const page = data ?? [];
      setRows((prev) => (initial ? page : [...prev, ...page]));
      setHasMore(page.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetching.current = false;
    }
  }, []);

  useEffect(() => {
    void fetchPage(0);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (fetching.current || !hasMore || loading) return;
    void fetchPage(rows.length);
  }, [fetchPage, hasMore, loading, rows.length]);

  const refresh = useCallback(() => {
    void fetchPage(0);
  }, [fetchPage]);

  const wines = useMemo(() => rows.map((r) => toBrowseWine(r, i18n.language)), [rows, i18n.language]);

  return { wines, loading, loadingMore, hasMore, error, loadMore, refresh };
}
