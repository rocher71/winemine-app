/**
 * Drink Window — vintage + type → DrinkWindow {from, peak, to}
 *
 * keyscreen src/lib/drink-window.ts (202 LOC, 28개 region/appellation/price 매칭)의 단순화 포팅.
 * v0.1.0 alpha 범위: wines_localized 컬럼 한계(appellation/averagePriceKrw 없음)로 vintage + type만 사용.
 * 정확한 휴리스틱은 v0.2.0에서 supabase migrations로 컬럼 추가 후 보강.
 *
 * 사양: design-spec cellar-list.md §3-9, §9, §12-4.
 */

export interface DrinkWindow {
  from: number;
  peak: number;
  to: number;
}

export type DrinkWindowStatus = 'too-young' | 'opening' | 'peak' | 'mature' | 'past-peak';

// Type-canonical → {fromYears, peakYears, toYears} 기본값
// 보수적 추정 (keyscreen DEFAULT_HINTS 마지막 fallback line 158~162 + 카테고리별 단순화).
const TYPE_HINTS: Record<string, { fromYears: number; peakYears: number; toYears: number }> = {
  red:       { fromYears: 2, peakYears: 6,  toYears: 12 },
  white:     { fromYears: 1, peakYears: 4,  toYears: 9  },
  rose:      { fromYears: 0, peakYears: 2,  toYears: 5  },
  sparkling: { fromYears: 1, peakYears: 4,  toYears: 8  },
  fortified: { fromYears: 5, peakYears: 15, toYears: 35 },
  dessert:   { fromYears: 3, peakYears: 10, toYears: 25 },
};

const FALLBACK_HINT = { fromYears: 1, peakYears: 4, toYears: 9 };

export interface WineDrinkWindowInput {
  vintage: number | null;
  type_canonical: string | null;
  // 우선 사용 — wines_localized.drink_window_{from,peak,to}_year가 채워져 있으면 그것을 그대로 사용
  drink_window_from_year?: number | null;
  drink_window_peak_year?: number | null;
  drink_window_to_year?: number | null;
}

/**
 * Wine 기준 DrinkWindow를 추정. wines_localized.drink_window_*가 채워져 있으면 그것을 우선.
 * vintage가 없으면 null 반환.
 */
export function getDrinkWindow(wine: WineDrinkWindowInput): DrinkWindow | null {
  // 우선순위 1: DB에 명시된 값
  if (
    wine.drink_window_from_year != null &&
    wine.drink_window_peak_year != null &&
    wine.drink_window_to_year != null
  ) {
    return {
      from: wine.drink_window_from_year,
      peak: wine.drink_window_peak_year,
      to: wine.drink_window_to_year,
    };
  }
  // 우선순위 2: vintage + type 기반 추정
  if (wine.vintage == null) return null;
  const hint = (wine.type_canonical && TYPE_HINTS[wine.type_canonical]) || FALLBACK_HINT;
  return {
    from: wine.vintage + hint.fromYears,
    peak: wine.vintage + hint.peakYears,
    to: wine.vintage + hint.toYears,
  };
}

/**
 * 현재 연도 기준으로 drink-window 상태를 분류 — keyscreen verbatim 5 status.
 */
export function getDrinkWindowStatus(
  wine: WineDrinkWindowInput,
  currentYear: number = new Date().getFullYear(),
): DrinkWindowStatus | null {
  const dw = getDrinkWindow(wine);
  if (!dw) return null;
  const { from, peak, to } = dw;
  if (currentYear < from) return 'too-young';
  if (Math.abs(currentYear - peak) <= 1) return 'peak';
  if (currentYear < peak) return 'opening';
  if (currentYear <= to) return 'mature';
  return 'past-peak';
}
