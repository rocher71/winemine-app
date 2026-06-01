/**
 * useHomeActivity — 홈 Activity feed 실 데이터 파생 (사양 home.md §3-4).
 *
 * 리더 결정 Q2/Q7: fabricated mock 노출 금지. 실 소스 있는 type만 row 생성.
 *  - 'peak' (음용 적기): cellared cellar_items 중 현재 연도가 drink_window 정점 구간(peak..to)에 든 와인.
 *    → useCellarList('cellared') drink_window_{peak,to}_year 기반 (genuine real data).
 *  - 'price' (가격 변동): v0.1.0 실 가격 변동 이벤트 소스 부재 → row 미생성.
 *  - 'badge' (뱃지): v0.1.0 뱃지 이벤트 소스 부재 → row 미생성.
 *
 * 데이터 0건 → 빈 배열 반환 → 모듈은 EmptyState 노출 (모듈 hide 안 함, 리더 Q6).
 * v0.2.0: price/badge 실 이벤트 테이블 추가 시 동일 시그니처에 row 합산.
 */
import { useMemo } from 'react';
import { useCellarList } from '@/hooks/use-cellar';
import { currentLocale } from '@/lib/i18n';

export type HomeActivityKind = 'peak' | 'price' | 'badge';

export interface HomeActivityRow {
  id: string;
  kind: HomeActivityKind;
  /** 와인명(강조 대상) — null이면 강조 없음 */
  wineName: string | null;
  /** wineName 뒤에 붙는 본문 (예: "이(가) 음용 적기에 들어섰어요") */
  bodySuffix: string;
  /** 우측/하단 메타 (예: "셀러") */
  metaPrefix: string;
  /** 탭 시 이동할 lwin (있으면 /cellar/{lwin}) */
  lwin: string | null;
}

export interface UseHomeActivityResult {
  rows: HomeActivityRow[];
  loading: boolean;
}

function localizedWineName(wine: {
  name_ko: string | null;
  display_name: string | null;
} | null): string | null {
  if (!wine) return null;
  if (currentLocale() === 'ko' && wine.name_ko) return wine.name_ko;
  return wine.display_name ?? wine.name_ko ?? null;
}

export function useHomeActivity(): UseHomeActivityResult {
  const { items, loading } = useCellarList('cellared');
  const locale = currentLocale();

  const rows = useMemo<HomeActivityRow[]>(() => {
    const year = new Date().getFullYear();
    const peakRows: HomeActivityRow[] = [];
    for (const item of items) {
      const wine = item.wine;
      if (!wine) continue;
      const peak = (wine as { drink_window_peak_year?: number | null }).drink_window_peak_year;
      const to = (wine as { drink_window_to_year?: number | null }).drink_window_to_year;
      // 현재 연도가 정점~만료 구간 안에 들면 "음용 적기" 활동으로 간주.
      if (peak != null && to != null && year >= peak && year <= to) {
        peakRows.push({
          id: `peak-${item.id}`,
          kind: 'peak',
          wineName: localizedWineName(wine),
          bodySuffix: locale === 'ko' ? '이(가) 음용 적기에 들어섰어요' : ' has entered its drinking window',
          metaPrefix: locale === 'ko' ? '셀러' : 'Cellar',
          lwin: wine.lwin != null ? String(wine.lwin) : null,
        });
      }
    }
    return peakRows.slice(0, 3);
  }, [items, locale]);

  return { rows, loading };
}
