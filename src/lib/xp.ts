/**
 * XP → Level 계산 — keyscreen src/lib/xp.ts verbatim port (RN).
 *
 * profile-me §10 F 결정: lib 정적 (i18n 키와 함께).
 * - levelId 1~5
 * - progress 0~1 (현재 레벨 안에서의 비율)
 * - progressPct 0~100 (반올림)
 * - remaining: 다음 레벨까지 남은 XP (L5는 0)
 *
 * L5 (maxXp=null) 도달 시 progress=1, remaining=0, progressPct=100.
 */
import { LEVELS } from './levels';

export interface XpInfo {
  levelId: 1 | 2 | 3 | 4 | 5;
  progress: number;
  remaining: number;
  progressPct: number;
}

export function xpToLevel(xp: number): XpInfo {
  const safeXp = Number.isFinite(xp) && xp >= 0 ? xp : 0;
  // LEVELS는 const tuple of 5 — 항상 LEVELS[0] 존재. non-null assertion.
  const fallback = LEVELS[0]!;
  const level =
    LEVELS.find(
      (l) => safeXp >= l.minXp && (l.maxXp === null || safeXp <= l.maxXp),
    ) ?? fallback;

  if (level.maxXp === null) {
    return { levelId: level.id, progress: 1, remaining: 0, progressPct: 100 };
  }

  const span = level.maxXp - level.minXp + 1;
  const within = safeXp - level.minXp;
  const progress = Math.max(0, Math.min(1, within / span));
  return {
    levelId: level.id,
    progress,
    remaining: Math.max(0, level.maxXp - safeXp + 1),
    progressPct: Math.round(progress * 100),
  };
}
