/**
 * Community Peak Aggregator — CommunityPeakEstimate[] → CommunityPeakAggregate.
 *
 * 출처: ../winemine-keyscreen/src/lib/community-peak-aggregator.ts verbatim 동등 포팅.
 *
 * 가중치 (SPEC + 베타 피드백 정책):
 *   L3 = 1.0
 *   L4 = 1.5
 *   L5 = 2.0
 *
 * 사용처: /wine/[lwin]/community-peak 화면의 히스토그램 + 시스템 peak 비교.
 *
 * v0.1.0 mock 단계 — client-side 계산 (community-peak.md §10 B (a) 권장).
 * v0.2.0 supabase SQL function 으로 마이그레이션 가능 (`community_peaks_aggregate(lwin)`).
 */

import {
  COMMUNITY_PEAKS,
  SYSTEM_PEAKS_BY_WINE,
  type CommunityPeakEstimate,
} from './mock/community-peaks';

export type CommunityPeakAggregate = {
  wineSlug: string;
  count: number;
  meanPeakYear: number;
  medianPeakYear: number;
  distribution: { year: number; count: number }[];
  systemPeakYear: number;
};

export const PEAK_WEIGHTS: Record<3 | 4 | 5, number> = {
  3: 1.0,
  4: 1.5,
  5: 2.0,
};

function weightOf(level: number): number {
  if (level === 5) return PEAK_WEIGHTS[5];
  if (level === 4) return PEAK_WEIGHTS[4];
  return PEAK_WEIGHTS[3];
}

/**
 * estimates → aggregate.
 *   meanPeakYear: 가중 평균 (.toFixed(1)).
 *   medianPeakYear: 가중 중앙값 (누적 가중치가 totalWeight/2 을 처음 넘는 항목).
 *   distribution: 연도별 가중 응답 수 (정수 연도로 반올림).
 *   systemPeakYear: SYSTEM_PEAKS_BY_WINE[wineSlug] (없으면 0).
 */
export function aggregateCommunityPeaks(
  wineSlug: string,
  estimates: CommunityPeakEstimate[],
): CommunityPeakAggregate {
  const filtered = estimates.filter((e) => e.wineId === wineSlug);
  const totalWeight = filtered.reduce(
    (sum, e) => sum + weightOf(e.reviewerLevel),
    0,
  );

  // 가중 평균
  const weightedSum = filtered.reduce(
    (sum, e) => sum + e.estimatedPeakYear * weightOf(e.reviewerLevel),
    0,
  );
  const meanPeakYear = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // 가중 중앙값
  const sorted = [...filtered].sort(
    (a, b) => a.estimatedPeakYear - b.estimatedPeakYear,
  );
  let cumulative = 0;
  let medianPeakYear = 0;
  for (const e of sorted) {
    cumulative += weightOf(e.reviewerLevel);
    if (cumulative >= totalWeight / 2) {
      medianPeakYear = e.estimatedPeakYear;
      break;
    }
  }

  // 연도별 가중 분포
  const distMap = new Map<number, number>();
  for (const e of filtered) {
    const y = e.estimatedPeakYear;
    distMap.set(y, (distMap.get(y) ?? 0) + weightOf(e.reviewerLevel));
  }
  const distribution = Array.from(distMap.entries())
    .map(([year, count]) => ({ year, count: Math.round(count * 10) / 10 }))
    .sort((a, b) => a.year - b.year);

  return {
    wineSlug,
    count: filtered.length,
    meanPeakYear: Math.round(meanPeakYear * 10) / 10,
    medianPeakYear,
    distribution,
    systemPeakYear: SYSTEM_PEAKS_BY_WINE[wineSlug] ?? 0,
  };
}

/** wineSlug 한 줄 헬퍼 — COMMUNITY_PEAKS 전체에서 자동 필터. */
export function getCommunityPeakAggregate(
  wineSlug: string,
): CommunityPeakAggregate {
  return aggregateCommunityPeaks(wineSlug, COMMUNITY_PEAKS);
}
