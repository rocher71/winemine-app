/**
 * useProfileStats — profile-me §5-2 사양 변환.
 *
 * 집계 출처:
 *   - tasting_notes (count, distinct wine_lwin)
 *   - cellar_items (count — 표시는 안 하지만 §10 H 대비 데이터 합산)
 *   - wines_localized (country, region distinct 집계 — 단일 locale §10 L)
 *
 * v0.1.0 RLS가 user_id 자동 필터링하지만 가독성 위해 .eq('user_id', uid) 명시.
 * country/region 컬럼은 wines_localized VIEW에 단일 locale 문자열 (en/ko mixed depending on row).
 * §10 L: 현 schema 그대로. distinct count만 의미 있음 — locale 정합성은 v0.2.0 보강.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';

export interface ProfileStats {
  /** distinct wine_lwin 수 (마신 와인) */
  winesTasted: number;
  /** distinct country 수 */
  countriesExplored: number;
  /** distinct `${country}/${region}` 수 */
  regionsExplored: number;
  /** tasting_notes row 수 */
  notesCount: number;
  /** cellar_items row 수 (참고용 — UI 미노출 §6 #12) */
  cellarCount: number;
}

const EMPTY: ProfileStats = {
  winesTasted: 0,
  countriesExplored: 0,
  regionsExplored: 0,
  notesCount: 0,
  cellarCount: 0,
};

export interface UseProfileStatsResult {
  stats: ProfileStats;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProfileStats(): UseProfileStatsResult {
  const [stats, setStats] = useState<ProfileStats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setStats(EMPTY);
        return;
      }

      // notes 본체 — wine join으로 country/region 한 번에 조회
      const { data: notesRows, error: notesErr } = await supabase
        .from('tasting_notes')
        .select('wine_lwin, wine:wines_localized!inner(country, region)')
        .eq('user_id', uid);
      if (notesErr) throw notesErr;

      // cellar — count만
      const { count: cellarCount, error: cellarErr } = await supabase
        .from('cellar_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid);
      if (cellarErr) throw cellarErr;

      const tastedLwins = new Set<string>();
      const countries = new Set<string>();
      const regions = new Set<string>();

      for (const row of notesRows ?? []) {
        if (row.wine_lwin) tastedLwins.add(row.wine_lwin);
        const wine = (row as { wine?: { country: string | null; region: string | null } | null })
          .wine;
        const country = wine?.country ?? null;
        const region = wine?.region ?? null;
        if (country) countries.add(country);
        if (country && region) regions.add(`${country}/${region}`);
      }

      setStats({
        winesTasted: tastedLwins.size,
        countriesExplored: countries.size,
        regionsExplored: regions.size,
        notesCount: notesRows?.length ?? 0,
        cellarCount: cellarCount ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setStats(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
