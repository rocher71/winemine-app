/**
 * Favorites — keyscreen src/lib/mock/favorites.ts 7 entries verbatim 포팅.
 *
 * 사양: _workspace/design-specs/favorites.md §5-2 / §10 A.
 *
 * v0.1.0 mock 단계 — wine_favorites 테이블 마이그레이션 부재 (사양 §9 supabase-engineer 트리거 미완).
 * v0.2.0 에서 wine_favorites 테이블 + RLS + wines_localized join (wine_lwin FK) 으로 교체.
 *
 * keyscreen wineId(슬러그) 는 RN 측 LWIN 기반 라우팅에 직접 매핑되지 않으므로,
 * 본 mock 은 와인 메타 (name/producer/vintage/region/bottleColor/avgPriceKrw) 를
 * inline 으로 보존해 UI 렌더 자족성을 확보. WineRow 의 onPress 는 placeholder
 * lwin (와인 카탈로그 fallback) 으로 wine/[lwin] 라우팅 — wine 카탈로그 LWIN 매핑은
 * v0.2.0 wine_favorites 테이블 + wines_localized join 시점에 정식 처리.
 */

export interface FavoriteWineMock {
  id: string;
  userId: string;
  wineId: string;
  /**
   * RN 라우팅용 placeholder LWIN.
   * v0.2.0 wine_favorites.wine_lwin FK 적용 시 실데이터로 대체.
   * v0.1.0: wine 상세 화면 진입은 wines_localized 가 해당 lwin 보유 시만 정상 — 그 외 not-found 표시.
   */
  wineLwin: string;
  notifyOnPurchase: boolean;
  addedAt: string;
  /** 와인 메타 (RN mock 한정 inline — v0.2.0 wines_localized join 으로 대체). */
  wine: {
    name: string;
    nameKo: string | null;
    producer: string;
    vintage: number;
    /** locale 무관 단일 region (RN wines_localized VIEW 와 동일 shape). */
    region: { ko: string; en: string };
    /** 와인 종별 hex bottle color (keyscreen verbatim). */
    bottleColor: string;
    /** wine type — bottle gradient fallback 용 (현재 미사용; v0.2.0 wines_localized.type_canonical). */
    type: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';
    averagePriceKrw: number;
  };
}

export const FAVORITES: FavoriteWineMock[] = [
  {
    id: 'fav_001',
    userId: 'me-heavy',
    wineId: 'bgy-romanee-st-vivant',
    wineLwin: '1009345',
    notifyOnPurchase: true,
    addedAt: '2025-12-15',
    wine: {
      name: 'Romanée-Saint-Vivant Grand Cru',
      nameKo: '로마네 생 비방 그랑 크뤼',
      producer: 'Domaine de la Romanée-Conti',
      vintage: 2018,
      region: { ko: '부르고뉴', en: 'Burgundy' },
      bottleColor: '#7a1f33',
      type: 'red',
      averagePriceKrw: 5_500_000,
    },
  },
  {
    id: 'fav_002',
    userId: 'me-heavy',
    wineId: 'pie-barolo-giacomo-conterno',
    wineLwin: '1099201',
    notifyOnPurchase: true,
    addedAt: '2025-11-20',
    wine: {
      name: 'Barolo Cascina Francia',
      nameKo: '바롤로 카시나 프란치아',
      producer: 'Giacomo Conterno',
      vintage: 2017,
      region: { ko: '피에몬테', en: 'Piedmont' },
      bottleColor: '#691728',
      type: 'red',
      averagePriceKrw: 1_300_000,
    },
  },
  {
    id: 'fav_003',
    userId: 'me-heavy',
    wineId: 'rhn-chateau-rayas',
    wineLwin: '1024531',
    notifyOnPurchase: true,
    addedAt: '2025-12-05',
    wine: {
      name: 'Château Rayas Châteauneuf-du-Pape',
      nameKo: '샤또 라야스 샤또네프 뒤 빠쁘',
      producer: 'Château Rayas',
      vintage: 2017,
      region: { ko: '론', en: 'Rhône' },
      bottleColor: '#80213b',
      type: 'red',
      averagePriceKrw: 1_100_000,
    },
  },
  {
    id: 'fav_004',
    userId: 'me-heavy',
    wineId: 'mos-egon-muller-scharzhof',
    wineLwin: '1156782',
    notifyOnPurchase: true,
    addedAt: '2026-01-10',
    wine: {
      name: 'Scharzhofberger Riesling Kabinett',
      nameKo: '샤르츠호프베르거 리슬링 카비넷',
      producer: 'Egon Müller',
      vintage: 2019,
      region: { ko: '모젤', en: 'Mosel' },
      bottleColor: '#c9b86a',
      type: 'white',
      averagePriceKrw: 380_000,
    },
  },
  {
    id: 'fav_005',
    userId: 'me-heavy',
    wineId: 'nap-screaming-eagle',
    wineLwin: '1186433',
    notifyOnPurchase: true,
    addedAt: '2026-02-04',
    wine: {
      name: 'Screaming Eagle',
      nameKo: '스크리밍 이글',
      producer: 'Screaming Eagle',
      vintage: 2017,
      region: { ko: '나파 밸리', en: 'Napa Valley' },
      bottleColor: '#3f0f1f',
      type: 'red',
      averagePriceKrw: 6_800_000,
    },
  },
  {
    id: 'fav_006',
    userId: 'me-heavy',
    wineId: 'tus-bolgheri-sassicaia',
    wineLwin: '1043522',
    notifyOnPurchase: false,
    addedAt: '2026-02-28',
    wine: {
      name: 'Sassicaia',
      nameKo: '사씨카이아',
      producer: 'Tenuta San Guido',
      vintage: 2018,
      region: { ko: '토스카나', en: 'Tuscany' },
      bottleColor: '#5d1424',
      type: 'red',
      averagePriceKrw: 480_000,
    },
  },
  {
    id: 'fav_007',
    userId: 'me-heavy',
    wineId: 'aus-penfolds-grange',
    wineLwin: '1067899',
    notifyOnPurchase: true,
    addedAt: '2026-03-15',
    wine: {
      name: 'Penfolds Grange',
      nameKo: '펜폴즈 그랜지',
      producer: 'Penfolds',
      vintage: 2017,
      region: { ko: '바로사 밸리', en: 'Barossa Valley' },
      bottleColor: '#3a0a1c',
      type: 'red',
      averagePriceKrw: 1_200_000,
    },
  },
];

export function getFavoritesByUser(userId: string): FavoriteWineMock[] {
  return FAVORITES.filter((f) => f.userId === userId);
}
