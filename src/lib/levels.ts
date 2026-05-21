/**
 * Level metadata — keyscreen src/lib/mock/levels.ts verbatim port (RN).
 *
 * profile-me §10 F 결정: minXp/maxXp는 RN lib 정적, name 은 i18n key (`levels.{1~5}.name`).
 * color는 design-tokens.level.L{n}에서 가져옴 (하드코딩 hex 0).
 *
 * L5(maxXp null) — open-ended.
 */

import { level } from './design-tokens';

export interface LevelMeta {
  id: 1 | 2 | 3 | 4 | 5;
  minXp: number;
  /** L5는 null (open-ended). */
  maxXp: number | null;
  /** dot/pill 배경색 (design-tokens.level.L{n}). */
  color: string;
}

export const LEVELS: readonly LevelMeta[] = [
  { id: 1, minXp: 0,    maxXp: 99,   color: level.L1 },
  { id: 2, minXp: 100,  maxXp: 499,  color: level.L2 },
  { id: 3, minXp: 500,  maxXp: 1499, color: level.L3 },
  { id: 4, minXp: 1500, maxXp: 3999, color: level.L4 },
  { id: 5, minXp: 4000, maxXp: null, color: level.L5 },
] as const;

export function getLevel(levelId: number): LevelMeta {
  const idx = Math.max(0, Math.min(4, levelId - 1));
  // LEVELS는 항상 5개 — idx clamp 후 fallback은 LEVELS[0] 보장.
  return LEVELS[idx] ?? LEVELS[0]!;
}
