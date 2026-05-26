/**
 * cellar-filters — 셀러 리스트 필터·정렬 순수 함수.
 *
 * 화면 로직 없이 `CellarItemWithWine[]` → `CellarItemWithWine[]` 변환만 담당.
 * `app/(tabs)/cellar.tsx` 및 추후 셀러 관련 뷰에서 import해 사용.
 */
import type { CellarItemWithWine, CellarSortKey, TastedGroup, TastedSortKey } from '@/hooks/use-cellar';
import type { TypeFilter } from '@/components/cellar/type-filter-chips';
import { parseLwinVintage } from '@/lib/lwin';
import { getDrinkWindow } from '@/lib/drink-window';

export function applySearch(items: CellarItemWithWine[], q: string): CellarItemWithWine[] {
  if (!q.trim()) return items;
  const needle = q.trim().toLowerCase();
  return items.filter((it) => {
    const w = it.wine;
    if (!w) return false;
    return (
      (w.display_name?.toLowerCase().includes(needle) ?? false) ||
      (w.name_ko?.toLowerCase().includes(needle) ?? false) ||
      (w.producer_name?.toLowerCase().includes(needle) ?? false) ||
      (w.region?.toLowerCase().includes(needle) ?? false) ||
      (w.country?.toLowerCase().includes(needle) ?? false)
    );
  });
}

export function applyTypeFilter(
  items: CellarItemWithWine[],
  tf: TypeFilter,
): CellarItemWithWine[] {
  if (tf === 'all') return items;
  return items.filter((it) => it.wine?.type_canonical === tf);
}

function vintageOf(it: CellarItemWithWine): number {
  return it.wine?.vintage ?? (it.wine?.lwin ? (parseLwinVintage(it.wine.lwin) ?? 0) : 0);
}

function drinkSoonScore(it: CellarItemWithWine, currentYear: number): number {
  const dw = getDrinkWindow({
    vintage: it.wine?.vintage ?? null,
    type_canonical: it.wine?.type_canonical ?? null,
  });
  if (!dw) return Number.POSITIVE_INFINITY;
  return Math.max(0, dw.from - currentYear);
}

export function applySort(
  items: CellarItemWithWine[],
  sort: CellarSortKey,
  isCellared: boolean,
): CellarItemWithWine[] {
  const copy = items.slice();
  const currentYear = new Date().getFullYear();
  switch (sort) {
    case 'vintage':
      copy.sort((a, b) => vintageOf(b) - vintageOf(a));
      break;
    case 'price':
      copy.sort((a, b) => (b.purchase_price_krw ?? 0) - (a.purchase_price_krw ?? 0));
      break;
    case 'region':
      copy.sort((a, b) => (a.wine?.region ?? '').localeCompare(b.wine?.region ?? ''));
      break;
    case 'storage':
      copy.sort((a, b) => (a.storage ?? '').localeCompare(b.storage ?? ''));
      break;
    case 'drinkSoon':
      copy.sort((a, b) => drinkSoonScore(a, currentYear) - drinkSoonScore(b, currentYear));
      break;
    case 'recent':
    default: {
      copy.sort((a, b) => {
        const aKey = isCellared ? a.acquired_at : (a.consumed_at ?? a.acquired_at);
        const bKey = isCellared ? b.acquired_at : (b.consumed_at ?? b.acquired_at);
        return new Date(bKey).getTime() - new Date(aKey).getTime();
      });
      break;
    }
  }
  return copy;
}

// ── TastedGroup 전용 필터·정렬 ──────────────────────────────────────

export function applyTastedSearch(groups: TastedGroup[], q: string): TastedGroup[] {
  if (!q.trim()) return groups;
  const needle = q.trim().toLowerCase();
  return groups.filter((g) => {
    const w = g.wine;
    if (!w) return false;
    return (
      (w.display_name?.toLowerCase().includes(needle) ?? false) ||
      (w.name_ko?.toLowerCase().includes(needle) ?? false) ||
      (w.producer_name?.toLowerCase().includes(needle) ?? false) ||
      (w.region?.toLowerCase().includes(needle) ?? false) ||
      (w.country?.toLowerCase().includes(needle) ?? false)
    );
  });
}

export function applyTastedTypeFilter(groups: TastedGroup[], tf: TypeFilter): TastedGroup[] {
  if (tf === 'all') return groups;
  return groups.filter((g) => g.wine?.type_canonical === tf);
}

export function applyTastedSort(groups: TastedGroup[], sort: TastedSortKey): TastedGroup[] {
  const copy = groups.slice();
  switch (sort) {
    case 'count':
      copy.sort((a, b) => b.count - a.count);
      break;
    case 'vintage': {
      const vintageOf = (g: TastedGroup) =>
        g.wine?.vintage ?? (g.wine?.lwin ? (parseLwinVintage(g.wine.lwin) ?? 0) : 0);
      copy.sort((a, b) => vintageOf(b) - vintageOf(a));
      break;
    }
    case 'region':
      copy.sort((a, b) => (a.wine?.region ?? '').localeCompare(b.wine?.region ?? ''));
      break;
    case 'price':
      copy.sort((a, b) => (b.maxPriceKrw ?? 0) - (a.maxPriceKrw ?? 0));
      break;
    case 'recent':
    default:
      copy.sort((a, b) => (b.lastConsumedAt ?? '').localeCompare(a.lastConsumedAt ?? ''));
      break;
  }
  return copy;
}
