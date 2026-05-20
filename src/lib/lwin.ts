/**
 * LWIN (Liv-ex Wine ID) 헬퍼.
 * LWIN 7자리 = master wine, 11자리 = +vintage, 13자리 = +pack size.
 * vintage는 8~11번째 문자(인덱스 7..11).
 *
 * 하드코딩 hex 허용 위치 (bottle color 기본값).
 */
import { bottleColorDefault, type TypeCanonical } from './design-tokens';

export function parseLwinVintage(lwin: string): number | null {
  if (lwin.length === 11 || lwin.length === 13) {
    const v = parseInt(lwin.slice(7, 11), 10);
    return Number.isNaN(v) ? null : v;
  }
  return null;
}

export function getDefaultBottleColor(type: TypeCanonical | null | undefined): string {
  if (!type) return bottleColorDefault.red;
  return bottleColorDefault[type];
}

export function getLocalizedWineName(
  lang: 'ko' | 'en',
  row: { display_name: string; name_ko: string | null },
): { primary: string; needsEnFallbackChip: boolean } {
  if (lang === 'ko' && row.name_ko) {
    return { primary: row.name_ko, needsEnFallbackChip: false };
  }
  if (lang === 'ko' && !row.name_ko) {
    return { primary: row.display_name, needsEnFallbackChip: true };
  }
  return { primary: row.display_name, needsEnFallbackChip: false };
}

const LWIN_REGEX = /^\d{7}$|^\d{11}$|^\d{13}$/;
export function isValidLwin(lwin: string): boolean {
  return LWIN_REGEX.test(lwin);
}
