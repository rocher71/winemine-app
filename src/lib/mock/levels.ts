/**
 * Level 카탈로그 — 5단계.
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/levels.ts verbatim 동등 포팅.
 *
 * 임계값은 specs/domain/xp.ts 와 동기.
 *   L1 Novice         0 ~ 99    XP
 *   L2 Enthusiast   100 ~ 499   XP
 *   L3 Connoisseur  500 ~ 1499  XP
 *   L4 Sommelier   1500 ~ 3999  XP
 *   L5 Master      4000+        XP
 *
 * 색은 brand.gold / brand.wineRed 와 일관 — design-tokens.ts level.L1~L5 가 진실.
 * 이 모듈은 name (LocalizedString) + description 만 노출. 색은 design-tokens 참조.
 */

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface Level {
  id: LevelId;
  name: { ko: string; en: string };
  minXp: number;
  maxXp: number | null;
  description: { ko: string; en: string };
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: { ko: '입문자', en: 'Novice' },
    minXp: 0,
    maxXp: 99,
    description: {
      ko: '와인의 세계에 발을 디뎠습니다. 한 모금이 호기심으로 바뀌는 단계.',
      en: 'You have entered the world of wine. The stage where one sip becomes curiosity.',
    },
  },
  {
    id: 2,
    name: { ko: '애호가', en: 'Enthusiast' },
    minXp: 100,
    maxXp: 499,
    description: {
      ko: '취향이 생기기 시작했습니다. 좋아하는 산지와 품종이 어렴풋이 잡힙니다.',
      en: 'Your taste is starting to form. You can faintly sketch the regions and grapes you prefer.',
    },
  },
  {
    id: 3,
    name: { ko: '감식가', en: 'Connoisseur' },
    minXp: 500,
    maxXp: 1499,
    description: {
      ko: '아펠라시옹과 빈티지를 비교하기 시작합니다. 라벨만 보고도 윤곽을 그릴 수 있습니다.',
      en: 'You start comparing appellations and vintages. The label alone gives you a silhouette.',
    },
  },
  {
    id: 4,
    name: { ko: '소믈리에', en: 'Sommelier' },
    minXp: 1500,
    maxXp: 3999,
    description: {
      ko: '구조·균형·여운을 언어로 분해할 수 있습니다. 누구에게 무엇을 권할지 망설이지 않습니다.',
      en: 'You can decompose structure, balance, and finish into language. You no longer hesitate when pairing.',
    },
  },
  {
    id: 5,
    name: { ko: '마스터', en: 'Master' },
    minXp: 4000,
    maxXp: null,
    description: {
      ko: '한 잔에서 떼루아의 시간 흐름을 읽습니다. 새로운 와인이 또 다른 첫걸음이 됩니다.',
      en: 'You read the passage of terroir time in a single glass. Each new wine becomes another first step.',
    },
  },
];

export const LEVELS_BY_ID: Record<LevelId, Level> = LEVELS.reduce<
  Record<LevelId, Level>
>(
  (acc, lvl) => {
    acc[lvl.id] = lvl;
    return acc;
  },
  {} as Record<LevelId, Level>,
);

export function getLevel(levelId: number): Level {
  return LEVELS_BY_ID[(levelId as LevelId)] ?? LEVELS[0];
}
