/**
 * levelPillStyle — keyscreen level-pill.tsx levelStyle verbatim (light 모드).
 *
 * ProfileHero / OtherUserHero 공통 LevelPill 색. 하드코딩 hex 회피 — brand.* / level.* 토큰만.
 *
 * - L1: cream bg / deepestDark fg
 * - L2: goldSoft bg / deepestDark fg
 * - L3: gold bg / deepestDark fg
 * - L4: wineRed bg / cream fg
 * - L5: level.L5 bg / cream fg (작은 inline pill 안은 gradient 대신 단색 fallback)
 */
import { brand, level as levelColors } from '@/lib/design-tokens';

export type LevelId = 1 | 2 | 3 | 4 | 5;

export function levelPillStyle(level: LevelId): { bg: string; fg: string } {
  switch (level) {
    case 1:
      return { bg: brand.cream, fg: brand.deepestDark };
    case 2:
      return { bg: brand.goldSoft, fg: brand.deepestDark };
    case 3:
      return { bg: brand.gold, fg: brand.deepestDark };
    case 4:
      return { bg: brand.wineRed, fg: brand.cream };
    case 5:
      return { bg: levelColors.L5, fg: brand.cream };
  }
}
