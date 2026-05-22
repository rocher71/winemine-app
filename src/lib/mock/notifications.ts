/**
 * Notifications — keyscreen src/lib/mock/notifications.ts 12 entries verbatim 포팅.
 *
 * 사양: _workspace/design-specs/notifications.md §5-2 / §10 A.
 *
 * v0.1.0 mock 단계 — notifications 테이블 마이그레이션 부재 (사양 §9 supabase-engineer 트리거 v0.2.0).
 * v0.2.0 에서 notifications 테이블 + RLS + ENUM(notification_kind) 으로 교체.
 *
 * 분포 (사양 §5-2 / SPEC mock_data_setup):
 *   favoritePurchase 5 / drinkWindowReached 4 / badgeEarned 2 / levelUp 1 / reviewLiked 0.
 * createdAt 최신 → 과거 순. 일부 read=true, 일부 false.
 *
 * keyscreen wineId(슬러그) → RN `wineLwin`(LWIN catalog 7/11/13 자리수) 매핑은 §10 A 결정:
 *   v0.1.0 mock 단계는 placeholder LWIN 사용 (wines_localized 가 해당 lwin 보유 시만 정상),
 *   v0.2.0 wine_favorites + wines_localized join 시점에 정식 매핑.
 *
 * actorUserId 는 anonymous_display (이미 anonymize 된 값) — raw UUID 노출 0 보장 (CLAUDE.md §4-5).
 */

export type NotificationKind =
  | 'favoritePurchase'
  | 'drinkWindowReached'
  | 'badgeEarned'
  | 'levelUp'
  | 'reviewLiked';

export interface NotificationMock {
  id: string;
  userId: string;
  kind: NotificationKind;
  /** LWIN placeholder (keyscreen slug-id → RN LWIN; mock 한정 — §10 A 후속 매핑). */
  wineLwin: string | null;
  cellarItemId: string | null;
  badgeId: string | null;
  /** anonymous_display 값 (raw UUID 아님 — §4-5 보호). */
  actorAnonDisplay: string | null;
  title: { ko: string; en: string };
  body: { ko: string; en: string };
  /** ISO 8601 timestamp. */
  createdAt: string;
  read: boolean;
}

export const NOTIFICATIONS: NotificationMock[] = [
  /* ── favoritePurchase × 5 ── */
  {
    id: 'noti_001',
    userId: 'me-heavy',
    kind: 'favoritePurchase',
    wineLwin: '1009345',
    cellarItemId: null,
    badgeId: null,
    actorAnonDisplay: 'anon-cp-0029',
    title: { ko: '관심 와인이 등록됐어요', en: 'A favourite wine just got logged' },
    body: {
      ko: '도윤님이 Romanée-Saint-Vivant Grand Cru를 ₩5,650,000에 구매 기록했습니다.',
      en: 'Doyoon logged a purchase of Romanée-Saint-Vivant Grand Cru at ₩5,650,000.',
    },
    createdAt: '2026-05-10T09:14:00Z',
    read: false,
  },
  {
    id: 'noti_002',
    userId: 'me-heavy',
    kind: 'favoritePurchase',
    wineLwin: '1064502',
    cellarItemId: null,
    badgeId: null,
    actorAnonDisplay: 'anon-cp-0083',
    title: { ko: '관심 와인이 등록됐어요', en: 'A favourite wine just got logged' },
    body: {
      ko: '익명 사용자가 Barolo Cascina Francia를 ₩1,250,000에 구매 기록했습니다.',
      en: 'An anonymous user logged a purchase of Barolo Cascina Francia at ₩1,250,000.',
    },
    createdAt: '2026-05-08T18:22:00Z',
    read: false,
  },
  {
    id: 'noti_003',
    userId: 'me-heavy',
    kind: 'favoritePurchase',
    wineLwin: '1085210',
    cellarItemId: null,
    badgeId: null,
    actorAnonDisplay: 'anon-cp-0142',
    title: { ko: '관심 와인이 등록됐어요', en: 'A favourite wine just got logged' },
    body: {
      ko: '익명 사용자가 Scharzhofberger Kabinett을 ₩395,000에 구매 기록했습니다.',
      en: 'An anonymous user logged a purchase of Scharzhofberger Kabinett at ₩395,000.',
    },
    createdAt: '2026-05-05T14:08:00Z',
    read: true,
  },
  {
    id: 'noti_004',
    userId: 'me-heavy',
    kind: 'favoritePurchase',
    wineLwin: '1031874',
    cellarItemId: null,
    badgeId: null,
    actorAnonDisplay: 'anon-cp-0195',
    title: { ko: '관심 와인이 등록됐어요', en: 'A favourite wine just got logged' },
    body: {
      ko: '익명 사용자가 Château Rayas를 ₩1,100,000에 구매 기록했습니다.',
      en: 'An anonymous user logged a purchase of Château Rayas at ₩1,100,000.',
    },
    createdAt: '2026-04-30T11:45:00Z',
    read: true,
  },
  {
    id: 'noti_005',
    userId: 'me-heavy',
    kind: 'favoritePurchase',
    wineLwin: '1119062',
    cellarItemId: null,
    badgeId: null,
    actorAnonDisplay: 'anon-cp-0231',
    title: { ko: '관심 와인이 등록됐어요', en: 'A favourite wine just got logged' },
    body: {
      ko: '익명 사용자가 Penfolds Grange를 ₩1,210,000에 구매 기록했습니다.',
      en: 'An anonymous user logged a purchase of Penfolds Grange at ₩1,210,000.',
    },
    createdAt: '2026-04-22T20:30:00Z',
    read: true,
  },

  /* ── drinkWindowReached × 4 ── */
  {
    id: 'noti_006',
    userId: 'me-heavy',
    kind: 'drinkWindowReached',
    wineLwin: '1042617',
    cellarItemId: 'cellar_003',
    badgeId: null,
    actorAnonDisplay: null,
    title: { ko: '마실 시기가 다가왔어요', en: 'A drinking window has opened' },
    body: {
      ko: '셀러의 Château Léoville Barton 2014 (생 줄리앙 2eme Cru)이 시음 적기에 진입했습니다.',
      en: 'Your cellar bottle of Château Léoville Barton 2014 (Saint-Julien 2ème Cru) has entered its drinking window.',
    },
    createdAt: '2026-05-09T07:00:00Z',
    read: false,
  },
  {
    id: 'noti_007',
    userId: 'me-heavy',
    kind: 'drinkWindowReached',
    wineLwin: '1098423',
    cellarItemId: 'cellar_014',
    badgeId: null,
    actorAnonDisplay: null,
    title: { ko: '마실 시기가 다가왔어요', en: 'A drinking window has opened' },
    body: {
      ko: '셀러의 Viña Tondonia Gran Reserva 2010이 절정기에 가까워졌습니다.',
      en: 'Your cellar bottle of Viña Tondonia Gran Reserva 2010 is approaching peak.',
    },
    createdAt: '2026-04-28T07:00:00Z',
    read: true,
  },
  {
    id: 'noti_008',
    userId: 'me-heavy',
    kind: 'drinkWindowReached',
    wineLwin: '1076584',
    cellarItemId: 'cellar_025',
    badgeId: null,
    actorAnonDisplay: null,
    title: { ko: '마실 시기가 다가왔어요', en: 'A drinking window has opened' },
    body: {
      ko: '셀러의 Chianti Classico 2021 (Felsina)이 곧 절정에 도달합니다.',
      en: 'Your cellar bottle of Chianti Classico 2021 (Felsina) is about to reach peak.',
    },
    createdAt: '2026-04-12T07:00:00Z',
    read: true,
  },
  {
    id: 'noti_009',
    userId: 'me-heavy',
    kind: 'drinkWindowReached',
    wineLwin: '1054321',
    cellarItemId: 'cellar_020',
    badgeId: null,
    actorAnonDisplay: null,
    title: { ko: '마실 시기가 다가왔어요', en: 'A drinking window has opened' },
    body: {
      ko: '냉장고의 Billecart-Salmon Brut Rosé가 시음 적기에 진입했습니다.',
      en: 'Your fridge bottle of Billecart-Salmon Brut Rosé has entered its drinking window.',
    },
    createdAt: '2026-04-02T07:00:00Z',
    read: true,
  },

  /* ── badgeEarned × 2 ── */
  {
    id: 'noti_010',
    userId: 'me-heavy',
    kind: 'badgeEarned',
    wineLwin: null,
    cellarItemId: null,
    badgeId: 'badge_007',
    actorAnonDisplay: null,
    title: { ko: '아로마 헌터 뱃지 획득', en: 'Aroma Hunter badge earned' },
    body: {
      ko: '12개 아로마 카테고리 모두에서 노트를 작성했습니다. 코가 깊어지고 있어요.',
      en: 'You have written notes in all 12 aroma categories. Your nose is getting deeper.',
    },
    createdAt: '2026-03-28T15:20:00Z',
    read: true,
  },
  {
    id: 'noti_011',
    userId: 'me-heavy',
    kind: 'badgeEarned',
    wineLwin: null,
    cellarItemId: null,
    badgeId: 'badge_011',
    actorAnonDisplay: null,
    title: { ko: '셀러의 손길 뱃지 획득', en: "Cellarer's Touch badge earned" },
    body: {
      ko: '드링킹 윈도우 도래 시점에 셀러 와인을 열었습니다. 인내의 보상이에요.',
      en: 'You opened a cellar bottle just as its drinking window arrived. A reward for patience.',
    },
    createdAt: '2026-02-15T19:45:00Z',
    read: true,
  },

  /* ── levelUp × 1 ── */
  {
    id: 'noti_012',
    userId: 'me-heavy',
    kind: 'levelUp',
    wineLwin: null,
    cellarItemId: null,
    badgeId: null,
    actorAnonDisplay: null,
    title: { ko: '레벨 3 감식가로 진입', en: 'Reached Level 3 — Connoisseur' },
    body: {
      ko: '아펠라시옹과 빈티지를 비교하는 단계입니다. 라벨만 봐도 윤곽이 잡혀요.',
      en: 'You compare appellations and vintages now. The label alone sketches a silhouette.',
    },
    createdAt: '2026-01-08T12:00:00Z',
    read: true,
  },
];

export function getNotificationsByUser(userId: string): NotificationMock[] {
  return NOTIFICATIONS.filter((n) => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return NOTIFICATIONS.filter((n) => n.userId === userId && !n.read).length;
}
