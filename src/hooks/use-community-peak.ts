/**
 * useCommunityPeak — community-peak 화면 데이터 훅 (mock + future-supabase 호환 shape).
 *
 * 사양: _workspace/design-specs/wine-community-peak.md §5.
 *
 * v0.1.0 — wine-community-peak.md §10 A (b): mock-only.
 * v0.2.0 — supabase `community_peaks` 테이블 + RLS + SQL `community_peaks_aggregate(lwin)` 또는
 *           client-side aggregateCommunityPeaks 호출 (인터페이스 동일).
 *
 * use-wine-prices.ts 패턴 일치 — { aggregate, estimates, loading, error, refresh } shape.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getCommunityPeaksByLwin,
  lwinToSlug,
  type CommunityPeakEstimate,
} from '@/lib/mock/community-peaks';
import {
  aggregateCommunityPeaks,
  type CommunityPeakAggregate,
} from '@/lib/community-peak-aggregator';

export interface UseCommunityPeakResult {
  aggregate: CommunityPeakAggregate | null;
  estimates: CommunityPeakEstimate[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCommunityPeak(
  lwin: string | null | undefined,
): UseCommunityPeakResult {
  const [aggregate, setAggregate] = useState<CommunityPeakAggregate | null>(
    null,
  );
  const [estimates, setEstimates] = useState<CommunityPeakEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // mock 단계 — sync lookup; future supabase 호환 위해 microtask 분리.
      await Promise.resolve();
      const list = getCommunityPeaksByLwin(lwin);
      const slug = lwinToSlug(lwin);
      const agg = slug
        ? aggregateCommunityPeaks(slug, list)
        : {
            wineSlug: '',
            count: 0,
            meanPeakYear: 0,
            medianPeakYear: 0,
            distribution: [],
            systemPeakYear: 0,
          };
      setEstimates(list);
      setAggregate(agg);
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

  return { aggregate, estimates, loading, error, refresh: load };
}
