/**
 * appFont — locale-aware 폰트 패밀리 선택.
 *
 * ko locale: 모든 weight → Freesentation_4Regular (단일 weight)
 * en locale: weight별 Inter/Playfair 원본 폰트
 *
 * 사용:
 *   style={{ fontFamily: appFont('semibold') }}
 *
 * 워드마크는 항상 PlayfairDisplay_400Regular (appFont('wordmark')).
 */
import { currentLocale } from '@/lib/i18n';

export type FontHint =
  | 'regular'       // Inter_400Regular / Freesentation_4Regular
  | 'medium'        // Inter_500Medium  / Freesentation_4Regular
  | 'semibold'      // Inter_600SemiBold / Freesentation_4Regular
  | 'display'       // PlayfairDisplay_400Regular / Freesentation_4Regular
  | 'display-bold'  // PlayfairDisplay_700Bold / Freesentation_4Regular
  | 'wordmark';     // 항상 PlayfairDisplay_400Regular (브랜드 고정)

export function appFont(hint: FontHint = 'regular'): string {
  // 워드마크는 locale 무관, 항상 영문 디스플레이 폰트
  if (hint === 'wordmark') return 'PlayfairDisplay_400Regular';

  const isKo = currentLocale() !== 'en';
  if (isKo) return 'Freesentation_4Regular';

  switch (hint) {
    case 'regular':      return 'Inter_400Regular';
    case 'medium':       return 'Inter_500Medium';
    case 'semibold':     return 'Inter_600SemiBold';
    case 'display':      return 'PlayfairDisplay_400Regular';
    case 'display-bold': return 'PlayfairDisplay_700Bold';
    default:             return 'Inter_400Regular';
  }
}
