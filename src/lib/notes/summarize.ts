/**
 * summarizeBeginner — BeginnerFields → ko/en 한 줄 자동 요약 (AutoSummaryCard 본문)
 *
 * 사양: design-spec notes-write.md §10 E14 + §2-2 AutoSummaryCard.
 * 키스크린 원본: src/lib/auto-description.ts 의 BeginnerNote 자동 요약 로직.
 *
 * 입력값(impression / palate / aromas / finish / rating)을 받아 자연어 한 문장 생성.
 * 모든 step 디폴트 (값이 모두 디폴트) 인 경우 짧은 가이드 문장 반환.
 *
 * SCOPE-OUT: ML/LLM 기반 표현 다양화 (v0.2.0).
 */
import type { BeginnerImpression, BeginnerPalate, BeginnerFinish, BeginnerAroma } from '@/components/notes/beginner-form';

interface SummarizeInput {
  impression: BeginnerImpression;
  palate: BeginnerPalate;
  aromas: readonly BeginnerAroma[];
  finish: BeginnerFinish;
  rating: number;
  locale: 'ko' | 'en';
}

// impression → ko/en 톤 형용사
const IMPRESSION_KO: Record<BeginnerImpression, string> = {
  star: '인상적인 한 잔.',
  smile: '편안하게 즐긴 한 잔.',
  thinking: '아직 정리되지 않은 한 잔.',
};
const IMPRESSION_EN: Record<BeginnerImpression, string> = {
  star: 'A standout glass.',
  smile: 'A relaxing pour.',
  thinking: 'Still puzzling out this glass.',
};

// finish → ko/en
const FINISH_KO: Record<BeginnerFinish, string> = {
  short: '여운은 짧고',
  medium: '여운은 알맞게 머물고',
  long: '여운은 길게 이어지고',
};
const FINISH_EN: Record<BeginnerFinish, string> = {
  short: 'with a short finish',
  medium: 'with a balanced finish',
  long: 'with a lingering finish',
};

function palatePhraseKo(p: BeginnerPalate): string {
  const parts: string[] = [];
  if (p.body === 'high') parts.push('묵직한 바디');
  else if (p.body === 'low') parts.push('가벼운 바디');
  if (p.acidity === 'high') parts.push('또렷한 산미');
  else if (p.acidity === 'low') parts.push('부드러운 산미');
  if (p.sweetness === 'high') parts.push('달콤함');
  else if (p.sweetness === 'low') parts.push('드라이함');
  if (p.tannin === 'high') parts.push('단단한 타닌');
  else if (p.tannin === 'low') parts.push('가벼운 타닌');
  if (parts.length === 0) return '균형 잡힌 맛';
  return parts.slice(0, 2).join(', ');
}

function palatePhraseEn(p: BeginnerPalate): string {
  const parts: string[] = [];
  if (p.body === 'high') parts.push('full body');
  else if (p.body === 'low') parts.push('light body');
  if (p.acidity === 'high') parts.push('bright acidity');
  else if (p.acidity === 'low') parts.push('soft acidity');
  if (p.sweetness === 'high') parts.push('a sweet note');
  else if (p.sweetness === 'low') parts.push('a dry character');
  if (p.tannin === 'high') parts.push('firm tannin');
  else if (p.tannin === 'low') parts.push('gentle tannin');
  if (parts.length === 0) return 'balanced flavors';
  return parts.slice(0, 2).join(', ');
}

const AROMA_KO: Record<BeginnerAroma, string> = {
  berry: '베리',
  citrus: '시트러스',
  stoneFruit: '핵과일',
  floral: '꽃',
  spice: '향신료',
  sweet: '꿀·캐러멜',
  earth: '흙·허브',
  yeast: '빵·이스트',
};
const AROMA_EN: Record<BeginnerAroma, string> = {
  berry: 'berry',
  citrus: 'citrus',
  stoneFruit: 'stone fruit',
  floral: 'floral',
  spice: 'spice',
  sweet: 'honey-caramel',
  earth: 'earth-herb',
  yeast: 'bread-yeast',
};

function aromaPhraseKo(aromas: readonly BeginnerAroma[]): string {
  if (aromas.length === 0) return '향은 은은하게';
  const names = aromas.slice(0, 3).map((a) => AROMA_KO[a]).join('·');
  return `${names} 향이 떠오르고`;
}

function aromaPhraseEn(aromas: readonly BeginnerAroma[]): string {
  if (aromas.length === 0) return 'subtle aromas';
  const names = aromas.slice(0, 3).map((a) => AROMA_EN[a]).join('/');
  return `${names} aromas come through`;
}

export function summarizeBeginner({
  impression,
  palate,
  aromas,
  finish,
  rating,
  locale,
}: SummarizeInput): string {
  const ratingText =
    rating > 0
      ? locale === 'ko'
        ? ` ${rating.toFixed(rating % 1 === 0 ? 0 : 1)}점.`
        : ` ${rating.toFixed(rating % 1 === 0 ? 0 : 1)}/5.`
      : '';

  if (locale === 'ko') {
    return `${IMPRESSION_KO[impression]} ${aromaPhraseKo(aromas)} ${palatePhraseKo(palate)}, ${FINISH_KO[finish]}${ratingText}`.trim();
  }
  return `${IMPRESSION_EN[impression]} ${aromaPhraseEn(aromas)}; ${palatePhraseEn(palate)}, ${FINISH_EN[finish]}.${ratingText}`.trim();
}
