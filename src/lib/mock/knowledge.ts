/**
 * Knowledge 탭 mock 데이터 — 핸드오프 knowledge-c-light.jsx 데이터를 타입화.
 *
 * v0.1.0 mock 단계: supabase 마이그레이션 없이 정적 모듈 (wine-stories.ts 와 동일 패턴).
 * v0.2.0 에서 lessons / regions / wineries / vintages 테이블 + seed.sql 로 이관 예정.
 *
 * 모든 사용자 노출 텍스트는 LocalizedString({ ko, en }) 양쪽 채움 (CLAUDE.md §4-4).
 * 원본 핸드오프는 ko 단일 → en 은 도메인 표준 번역으로 채움.
 *
 * 데이터 출처: ~/dev/local-handoff/knowledge-tab-export/knowledge-c-light.jsx
 *   L_TODAY/L_PREV → MOCK_LESSONS, L_REGIONS → MOCK_REGIONS(국가 레벨),
 *   L_WINERIES → MOCK_WINERIES, L_VINTAGES → MOCK_VINTAGES.
 */
import type { LocalizedString } from '@/components/shared/locale-text';

export type { LocalizedString };

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
export interface CompareCol {
  name: LocalizedString;
  items: string[];
}

export interface PriceRow {
  name: string;
  region: string;
  price: number;
  display: string;
  /** accent tone key — 'gold' | 'wine' | 'muted' 등 카드 표시 색 분기용. */
  tone: string;
}

export type ContentBlock =
  | { type: 'paragraph'; text: LocalizedString }
  | { type: 'compare'; left: CompareCol; right: CompareCol }
  | { type: 'callout'; text: LocalizedString }
  | { type: 'price-chart'; rows: PriceRow[] };

export interface Section {
  idx: string;
  title: LocalizedString;
  content: ContentBlock[];
}

export interface Lesson {
  id: string;
  day: number;
  category: LocalizedString;
  title: LocalizedString;
  subtitle: LocalizedString;
  body: Section[];
  summary: LocalizedString;
  readMinutes: number;
  publishedAt: string;
}

export interface LessonStreak {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedDays: number[];
}

export interface ProfileAxis {
  label: string;
  value: number;
}

export interface TierRow {
  name: string;
  sub: string;
  pct: number;
  color: string;
}

export interface Region {
  id: string;
  type: 'country' | 'subregion' | 'appellation';
  parentId: string | null;
  name: LocalizedString;
  nameLatin: string;
  accent: string;
  grapes: string[];
  stats: Record<string, string>;
  description: LocalizedString;
  climate: string;
  soil: string;
  grapeCount: number;
  profile?: ProfileAxis[];
  tiers?: TierRow[];
}

export interface WineEntry {
  id: string;
  name: string;
  type: string;
  vintage?: number;
}

export interface CruEntry {
  name: string;
  ha: number;
  highlight: boolean;
  desc: LocalizedString;
}

export interface Winery {
  id: string;
  shortName: string;
  fullName: string;
  country: string;
  location: LocalizedString;
  established: number;
  acreage: string;
  flagship: string;
  philosophy: LocalizedString;
  description: LocalizedString;
  accentColor: string;
  lineup: WineEntry[];
  grandCrus: CruEntry[];
}

export interface ClimateEvent {
  when: string;
  headline: string;
  body: string;
  tone: string;
}

export interface PairingItem {
  food: LocalizedString;
  note: LocalizedString;
}

export interface RelatedVintage {
  id: string;
  year: number;
  score: number;
  tag: LocalizedString;
}

export interface VintageEntry {
  id: string;
  region: LocalizedString;
  year: number;
  score: number;
  climate: LocalizedString;
  tag: LocalizedString;
  summary: LocalizedString;
  accentColor: string;
  climateEvents: ClimateEvent[];
  pairing?: PairingItem[];
  relatedVintages?: RelatedVintage[];
}

// ── Chart screen types ──
export interface VintageYearScore {
  year: number;
  score: number;
  highlight: boolean;
  note: LocalizedString;
}

export interface VintageChartData {
  regionId: string;
  regionName: LocalizedString;
  years: VintageYearScore[];
  tip: LocalizedString;
}

// ── Compare screen types ──
export interface CompareRowData {
  key: LocalizedString;
  left: string;
  right: string;
}

export interface RadarAxisData {
  label: LocalizedString;
  aVal: number;
  bVal: number;
}

export interface VintageCompareData {
  aId: string;
  bId: string;
  subheading: LocalizedString;
  rows: CompareRowData[];
  radar: RadarAxisData[];
  verdict: LocalizedString;
}

// ──────────────────────────────────────────────────────────────
// MOCK_LESSONS — Day 1~12 (오늘 = Day 12 "부르고뉴 vs 보르도, 3줄 차이")
// ──────────────────────────────────────────────────────────────
export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    day: 1,
    category: { ko: '입문', en: 'Basics' },
    title: { ko: '와인이란 무엇인가', en: 'What Is Wine?' },
    subtitle: { ko: '포도에서 잔까지', en: 'From Grape to Glass' },
    readMinutes: 3,
    publishedAt: '2026-05-15',
    summary: {
      ko: '와인은 포도즙을 발효시킨 술이다. 품종·떼루아·양조가 맛을 결정한다.',
      en: 'Wine is fermented grape juice. Variety, terroir, and winemaking shape its flavor.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '정의', en: 'Definition' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '와인은 포도즙의 당분이 효모에 의해 알코올로 발효된 음료다. 사과·배 등 다른 과일도 쓰이지만, 단순히 "와인"이라 하면 포도 와인을 가리킨다.',
              en: 'Wine is a beverage made when yeast ferments the sugar in grape juice into alcohol. Other fruits exist, but "wine" alone means grape wine.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-2',
    day: 2,
    category: { ko: '테이스팅', en: 'Tasting' },
    title: { ko: '와인 색으로 읽는 정보', en: 'Reading Wine by Color' },
    subtitle: { ko: '눈으로 시작하는 시음', en: 'Tasting Begins with the Eyes' },
    readMinutes: 4,
    publishedAt: '2026-05-16',
    summary: {
      ko: '색의 농도와 가장자리 색조는 품종·숙성·상태의 단서다.',
      en: 'Color depth and rim hue hint at variety, age, and condition.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '농도와 색조', en: 'Depth and Hue' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '잔을 기울여 가장자리를 보면 숙성 정도를 읽을 수 있다. 레드는 시간이 지나며 자주빛에서 벽돌색으로, 화이트는 옅은 노랑에서 황금빛으로 변한다.',
              en: 'Tilt the glass and read the rim for age. Reds shift from purple to brick; whites from pale yellow to gold.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-3',
    day: 3,
    category: { ko: '테이스팅', en: 'Tasting' },
    title: { ko: '향을 맡는 세 단계', en: 'The Three Stages of Aroma' },
    subtitle: { ko: '1차·2차·3차 향', en: 'Primary, Secondary, Tertiary' },
    readMinutes: 5,
    publishedAt: '2026-05-17',
    summary: {
      ko: '품종에서 오는 1차, 양조에서 오는 2차, 숙성에서 오는 3차 향을 구분한다.',
      en: 'Distinguish primary (grape), secondary (winemaking), and tertiary (aging) aromas.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '세 가지 향', en: 'Three Aromas' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '1차 향은 포도 품종 자체에서, 2차 향은 발효와 효모에서, 3차 향은 오크·병 숙성에서 나온다. 이 셋을 분리해 맡으면 와인의 이력이 보인다.',
              en: 'Primary aromas come from the grape, secondary from fermentation and yeast, tertiary from oak and bottle aging. Separating them reveals the wine’s history.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-4',
    day: 4,
    category: { ko: '테이스팅', en: 'Tasting' },
    title: { ko: '탄닌이란 무엇인가', en: 'What Are Tannins?' },
    subtitle: { ko: '떫음의 정체', en: 'The Source of Astringency' },
    readMinutes: 4,
    publishedAt: '2026-05-18',
    summary: {
      ko: '탄닌은 껍질·씨·오크에서 오는 떫은 폴리페놀. 레드의 구조를 만든다.',
      en: 'Tannins are astringent polyphenols from skins, seeds, and oak — the backbone of reds.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '구조의 뼈대', en: 'Structural Backbone' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '탄닌은 입안을 마르게 하는 떫은 감각으로 느껴진다. 잘 익은 탄닌은 부드럽고, 덜 익으면 거칠다. 장기 숙성 와인의 핵심 요소다.',
              en: 'Tannins register as a drying, astringent sensation. Ripe tannins feel smooth; underripe ones feel harsh. They are key to ageworthy wines.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-5',
    day: 5,
    category: { ko: '서빙', en: 'Serving' },
    title: { ko: '와인 온도의 과학', en: 'The Science of Serving Temperature' },
    subtitle: { ko: '몇 도에 마실까', en: 'At What Temperature?' },
    readMinutes: 4,
    publishedAt: '2026-05-19',
    summary: {
      ko: '레드는 16–18도, 화이트는 8–12도. 온도가 향과 구조를 좌우한다.',
      en: 'Reds at 16–18°C, whites at 8–12°C. Temperature governs aroma and structure.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '온도와 인상', en: 'Temperature and Impression' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '너무 차가우면 향이 닫히고, 너무 따뜻하면 알코올이 도드라진다. 레드도 상온보다 약간 시원하게 마시는 편이 좋다.',
              en: 'Too cold mutes aroma; too warm exaggerates alcohol. Even reds taste best slightly below room temperature.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-6',
    day: 6,
    category: { ko: '양조', en: 'Winemaking' },
    title: { ko: '오크 숙성의 비밀', en: 'The Secret of Oak Aging' },
    subtitle: { ko: '나무가 더하는 향', en: 'What the Barrel Adds' },
    readMinutes: 5,
    publishedAt: '2026-05-20',
    summary: {
      ko: '오크는 바닐라·토스트·스파이스 향과 미세한 산소 교환을 더한다.',
      en: 'Oak lends vanilla, toast, and spice, plus gentle oxygen exchange.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '새 오크 vs 헌 오크', en: 'New vs Used Oak' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '새 오크는 강한 향을 더하고, 여러 번 쓴 오크는 향보다 산소 미세 교환에 기여한다. 양조자는 둘을 비율로 조절한다.',
              en: 'New oak imparts strong flavor; used oak contributes more to micro-oxygenation than aroma. Winemakers blend the two by ratio.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-7',
    day: 7,
    category: { ko: '서빙', en: 'Serving' },
    title: { ko: '와인 글래스 모양과 향', en: 'Glass Shape and Aroma' },
    subtitle: { ko: '잔이 맛을 바꾼다', en: 'The Glass Shapes the Taste' },
    readMinutes: 3,
    publishedAt: '2026-05-21',
    summary: {
      ko: '볼이 큰 잔은 향을 모으고, 입구가 좁으면 향이 집중된다.',
      en: 'A large bowl gathers aroma; a narrow rim concentrates it.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '품종별 잔', en: 'Glass by Variety' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '부르고뉴 잔은 볼이 넓어 피노 누아의 섬세한 향을, 보르도 잔은 길쭉해 카베르네의 구조를 살린다.',
              en: 'The Burgundy glass has a wide bowl for delicate Pinot Noir; the Bordeaux glass is tall to channel Cabernet’s structure.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-8',
    day: 8,
    category: { ko: '양조', en: 'Winemaking' },
    title: { ko: '오크 숙성이 만드는 향', en: 'Aromas Born from Oak Aging' },
    subtitle: { ko: '숙성의 화학', en: 'The Chemistry of Aging' },
    readMinutes: 5,
    publishedAt: '2026-05-22',
    summary: {
      ko: '오크 숙성은 바닐린·락톤을 통해 바닐라·코코넛·정향 향을 만든다.',
      en: 'Oak aging produces vanilla, coconut, and clove via vanillin and lactones.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '토스트 레벨', en: 'Toast Level' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '배럴을 굽는 정도(토스트)에 따라 향이 달라진다. 라이트 토스트는 신선한 나무 향, 헤비 토스트는 커피·캐러멜 향을 더한다.',
              en: 'The degree of toasting changes aroma. Light toast gives fresh wood; heavy toast adds coffee and caramel.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-9',
    day: 9,
    category: { ko: '품종', en: 'Variety' },
    title: { ko: '피노 누아의 세계', en: 'The World of Pinot Noir' },
    subtitle: { ko: '가장 섬세한 적포도', en: 'The Most Delicate Red Grape' },
    readMinutes: 7,
    publishedAt: '2026-05-23',
    summary: {
      ko: '피노 누아는 얇은 껍질, 옅은 색, 섬세한 향. 떼루아에 가장 민감하다.',
      en: 'Pinot Noir has thin skins, pale color, and delicate aroma — the most terroir-sensitive grape.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '왜 어려운가', en: 'Why It’s Difficult' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '피노 누아는 기후 변화에 민감하고 병에 약하다. 그러나 잘 익으면 라즈베리·체리·버섯·흙의 복합적 향을 낸다.',
              en: 'Pinot Noir is climate-sensitive and prone to disease. Yet when ripe, it offers complex raspberry, cherry, mushroom, and earth notes.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-10',
    day: 10,
    category: { ko: '테이스팅', en: 'Tasting' },
    title: { ko: '와인 산도, 혀로 구분하기', en: 'Tasting Acidity on the Tongue' },
    subtitle: { ko: '침이 도는 그 감각', en: 'That Mouthwatering Sensation' },
    readMinutes: 4,
    publishedAt: '2026-05-24',
    summary: {
      ko: '산도는 침이 도는 감각으로 느껴진다. 와인에 생기와 균형을 준다.',
      en: 'Acidity registers as a mouthwatering feel, giving wine freshness and balance.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '산도와 기후', en: 'Acidity and Climate' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '서늘한 지역의 와인일수록 산도가 높다. 산도는 음식과의 페어링에서도 핵심 요소다.',
              en: 'Cooler regions yield higher acidity. Acidity is also central to food pairing.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-11',
    day: 11,
    category: { ko: '품종', en: 'Variety' },
    title: { ko: '샤르도네란 무엇인가', en: 'What Is Chardonnay?' },
    subtitle: { ko: '가장 다재다능한 백포도', en: 'The Most Versatile White Grape' },
    readMinutes: 6,
    publishedAt: '2026-05-25',
    summary: {
      ko: '샤르도네는 떼루아와 양조에 따라 사과부터 버터까지 폭넓게 표현된다.',
      en: 'Chardonnay spans apple to butter depending on terroir and winemaking.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '오크 유무', en: 'Oaked or Not' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '오크를 쓰지 않은 샤블리는 미네랄·사과, 오크를 쓴 캘리포니아는 버터·바닐라 향이 두드러진다.',
              en: 'Unoaked Chablis shows mineral and apple; oaked California shows butter and vanilla.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'lesson-12',
    day: 12,
    category: { ko: '비교 학습', en: 'Comparative Study' },
    title: { ko: '부르고뉴 vs 보르도, 3줄 차이', en: 'Burgundy vs Bordeaux in Three Lines' },
    subtitle: { ko: '프랑스 두 거장 지역', en: 'France’s Two Master Regions' },
    readMinutes: 6,
    publishedAt: '2026-05-26',
    summary: {
      ko: '부르고뉴는 단일 품종·떼루아·도멘, 보르도는 블렌딩·샤토 브랜드·등급 체계가 핵심이다.',
      en: 'Burgundy is single-variety, terroir, and domaine; Bordeaux is blending, château brand, and classification.',
    },
    body: [
      {
        idx: '1',
        title: { ko: '품종 접근', en: 'Approach to Variety' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '부르고뉴는 피노 누아·샤르도네 단일 품종으로 떼루아를 표현하고, 보르도는 카베르네 소비뇽·메를로 등을 블렌딩해 일관된 스타일을 만든다.',
              en: 'Burgundy expresses terroir through single varieties (Pinot Noir, Chardonnay), while Bordeaux blends Cabernet Sauvignon, Merlot, and more for a consistent style.',
            },
          },
          {
            type: 'compare',
            left: {
              name: { ko: '부르고뉴', en: 'Burgundy' },
              items: ['Pinot Noir', 'Chardonnay', '단일 품종 / Single variety'],
            },
            right: {
              name: { ko: '보르도', en: 'Bordeaux' },
              items: ['Cabernet Sauvignon', 'Merlot', '블렌딩 / Blending'],
            },
          },
        ],
      },
      {
        idx: '2',
        title: { ko: '브랜드 구조', en: 'Brand Structure' },
        content: [
          {
            type: 'paragraph',
            text: {
              ko: '부르고뉴의 중심은 떼루아와 도멘, 보르도의 중심은 샤토 브랜드와 1855년 등급 체계다.',
              en: 'Burgundy centers on terroir and domaine; Bordeaux on château brand and the 1855 classification.',
            },
          },
          {
            type: 'callout',
            text: {
              ko: '그랑크뤼 부르고뉴는 보르도 1등급보다 평균가가 압도적으로 높은 경우가 많다.',
              en: 'Grand Cru Burgundy often commands far higher average prices than Bordeaux First Growths.',
            },
          },
        ],
      },
      {
        idx: '3',
        title: { ko: '가격 비교', en: 'Price Comparison' },
        content: [
          {
            type: 'price-chart',
            rows: [
              { name: 'Romanée-Conti', region: 'Burgundy', price: 25000, display: '$25,000+', tone: 'wine' },
              { name: 'Château Lafite', region: 'Bordeaux', price: 1200, display: '$1,200', tone: 'gold' },
              { name: 'Village Burgundy', region: 'Burgundy', price: 80, display: '$80', tone: 'muted' },
            ],
          },
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// MOCK_STREAK
// ──────────────────────────────────────────────────────────────
export const MOCK_STREAK: LessonStreak = {
  currentStreak: 12,
  longestStreak: 28,
  totalCompleted: 87,
  completedDays: [
    1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 24,
    25, 26,
  ],
};

// ──────────────────────────────────────────────────────────────
// MOCK_REGIONS — 국가 5 (FR/IT/ES/US/DE) + 프랑스 하위 6 + 부르고뉴 하위 5 + 본 로마네 아펠라시옹
// ──────────────────────────────────────────────────────────────
export const MOCK_REGIONS: Region[] = [
  // ---- 국가 레벨 (L_REGIONS verbatim) ----
  {
    id: 'fr',
    type: 'country',
    parentId: null,
    name: { ko: '프랑스', en: 'France' },
    nameLatin: 'France',
    accent: '#8B1A2A',
    grapes: ['Pinot Noir', 'Cabernet Sauvignon', 'Chardonnay', 'Merlot'],
    grapeCount: 4,
    stats: { regions: '13', appellations: '234' },
    climate: 'temperate-oceanic',
    soil: 'limestone-clay',
    description: {
      ko: '와인의 본고장. 부르고뉴·보르도·샹파뉴 등 세계 최정상 산지가 모여 있다.',
      en: 'The heartland of wine, home to Burgundy, Bordeaux, and Champagne — the world’s top regions.',
    },
  },
  {
    id: 'it',
    type: 'country',
    parentId: null,
    name: { ko: '이탈리아', en: 'Italy' },
    nameLatin: 'Italia',
    accent: '#7A2D40',
    grapes: ['Sangiovese', 'Nebbiolo', 'Barbera'],
    grapeCount: 3,
    stats: { regions: '20', appellations: '408' },
    climate: 'mediterranean',
    soil: 'volcanic-clay',
    description: {
      ko: '20개 주 전역에서 와인을 생산하는 다양성의 나라. 산지오베제와 네비올로가 대표 품종.',
      en: 'A nation of diversity producing wine across all 20 regions, led by Sangiovese and Nebbiolo.',
    },
  },
  {
    id: 'es',
    type: 'country',
    parentId: null,
    name: { ko: '스페인', en: 'Spain' },
    nameLatin: 'España',
    accent: '#a04030',
    grapes: ['Tempranillo', 'Garnacha'],
    grapeCount: 2,
    stats: { regions: '17', appellations: '96' },
    climate: 'continental-dry',
    soil: 'limestone-sand',
    description: {
      ko: '포도밭 면적 세계 1위. 템프라니요 중심의 리오하·리베라 델 두에로가 유명하다.',
      en: 'The largest vineyard area in the world, famed for Tempranillo-driven Rioja and Ribera del Duero.',
    },
  },
  {
    id: 'us',
    type: 'country',
    parentId: null,
    name: { ko: '미국', en: 'USA' },
    nameLatin: 'United States',
    accent: '#7a4a6a',
    grapes: ['Cabernet Sauvignon', 'Zinfandel'],
    grapeCount: 2,
    stats: { regions: '50', appellations: '268' },
    climate: 'varied',
    soil: 'volcanic-alluvial',
    description: {
      ko: '나파·소노마를 중심으로 한 신대륙 와인의 선두주자. 진판델은 미국 고유 품종이다.',
      en: 'A New World leader led by Napa and Sonoma; Zinfandel is its signature grape.',
    },
  },
  {
    id: 'de',
    type: 'country',
    parentId: null,
    name: { ko: '독일', en: 'Germany' },
    nameLatin: 'Deutschland',
    accent: '#5d6a40',
    grapes: ['Riesling', 'Spätburgunder'],
    grapeCount: 2,
    stats: { regions: '13', appellations: 'Mosel·Rheingau' },
    climate: 'cool-continental',
    soil: 'slate',
    description: {
      ko: '리슬링의 본고장. 모젤·라인가우의 가파른 점판암 비탈에서 산미 또렷한 화이트를 만든다.',
      en: 'The home of Riesling, crafting vivid whites on the steep slate slopes of Mosel and Rheingau.',
    },
  },

  // ---- 프랑스 하위 6 지역 (subregion) ----
  {
    id: 'fr-bourgogne',
    type: 'subregion',
    parentId: 'fr',
    name: { ko: '부르고뉴', en: 'Burgundy' },
    nameLatin: 'Bourgogne',
    accent: '#a83040',
    grapes: ['Pinot Noir', 'Chardonnay'],
    grapeCount: 2,
    stats: { villages: '84', grandCrus: '33' },
    climate: 'cool-continental',
    soil: 'limestone-marl',
    description: {
      ko: '단일 품종과 떼루아의 성지. 작은 밭 단위로 등급이 나뉘며 도멘 중심으로 운영된다.',
      en: 'The sanctuary of single varieties and terroir, classified plot by plot and run by domaines.',
    },
    profile: [
      { label: 'body', value: 3 },
      { label: 'acidity', value: 4 },
      { label: 'tannin', value: 2 },
      { label: 'fruit', value: 3 },
    ],
    tiers: [
      { name: 'Grand Cru', sub: '최상위 / Top', pct: 2, color: '#8B1A2A' },
      { name: 'Premier Cru', sub: '1등급밭 / 1st plots', pct: 12, color: '#C9A84C' },
      { name: 'Village', sub: '마을 / Village', pct: 36, color: '#9B8B7A' },
      { name: 'Régionale', sub: '지방 / Regional', pct: 50, color: '#A89580' },
    ],
  },
  {
    id: 'fr-bordeaux',
    type: 'subregion',
    parentId: 'fr',
    name: { ko: '보르도', en: 'Bordeaux' },
    nameLatin: 'Bordeaux',
    accent: '#8B1A2A',
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'],
    grapeCount: 3,
    stats: { châteaux: '6000+', classified: '61' },
    climate: 'maritime',
    soil: 'gravel-clay',
    description: {
      ko: '블렌딩과 샤토 브랜드의 본고장. 1855년 등급 체계가 좌안 와인을 규정한다.',
      en: 'The home of blending and château brands, with the 1855 classification defining Left Bank wines.',
    },
    profile: [
      { label: 'body', value: 4 },
      { label: 'acidity', value: 3 },
      { label: 'tannin', value: 4 },
      { label: 'fruit', value: 3 },
    ],
    tiers: [
      { name: '1er Cru', sub: '1등급 / 1st Growth', pct: 5, color: '#8B1A2A' },
      { name: '2e–5e Cru', sub: '2–5등급', pct: 25, color: '#C9A84C' },
      { name: 'Cru Bourgeois', sub: '부르주아', pct: 30, color: '#9B8B7A' },
      { name: 'AOC Bordeaux', sub: '일반', pct: 40, color: '#A89580' },
    ],
  },
  {
    id: 'fr-champagne',
    type: 'subregion',
    parentId: 'fr',
    name: { ko: '샹파뉴', en: 'Champagne' },
    nameLatin: 'Champagne',
    accent: '#caa84e',
    grapes: ['Pinot Noir', 'Chardonnay', 'Pinot Meunier'],
    grapeCount: 3,
    stats: { houses: '350+', growers: '16000' },
    climate: 'cool-marginal',
    soil: 'chalk',
    description: {
      ko: '병 내 2차 발효로 만드는 스파클링의 본고장. 백악질 토양이 섬세한 산미를 만든다.',
      en: 'The home of sparkling wine via secondary bottle fermentation; chalk soils yield fine acidity.',
    },
  },
  {
    id: 'fr-rhone',
    type: 'subregion',
    parentId: 'fr',
    name: { ko: '론', en: 'Rhône' },
    nameLatin: 'Rhône',
    accent: '#7a2d28',
    grapes: ['Syrah', 'Grenache', 'Mourvèdre'],
    grapeCount: 3,
    stats: { north: 'Syrah', south: 'GSM' },
    climate: 'mediterranean',
    soil: 'granite-galets',
    description: {
      ko: '북부는 시라 단일, 남부는 그르나슈 블렌딩. 따뜻하고 스파이시한 레드의 산지.',
      en: 'Northern Syrah and southern Grenache blends — a source of warm, spicy reds.',
    },
  },
  {
    id: 'fr-loire',
    type: 'subregion',
    parentId: 'fr',
    name: { ko: '루아르', en: 'Loire' },
    nameLatin: 'Loire',
    accent: '#5d6a40',
    grapes: ['Sauvignon Blanc', 'Chenin Blanc', 'Cabernet Franc'],
    grapeCount: 3,
    stats: { length: '1000km', styles: 'all' },
    climate: 'cool-oceanic',
    soil: 'flint-tuffeau',
    description: {
      ko: '강을 따라 펼쳐진 다양한 스타일. 소비뇽 블랑·슈냉 블랑의 산뜻한 화이트가 대표적.',
      en: 'Diverse styles along the river, best known for crisp Sauvignon Blanc and Chenin Blanc whites.',
    },
  },
  {
    id: 'fr-alsace',
    type: 'subregion',
    parentId: 'fr',
    name: { ko: '알자스', en: 'Alsace' },
    nameLatin: 'Alsace',
    accent: '#7a4a6a',
    grapes: ['Riesling', 'Gewürztraminer', 'Pinot Gris'],
    grapeCount: 3,
    stats: { grandCrus: '51', style: 'varietal' },
    climate: 'dry-continental',
    soil: 'granite-limestone',
    description: {
      ko: '독일 국경의 화이트 산지. 품종명을 라벨에 적는 아로마틱한 드라이 화이트가 특징.',
      en: 'A white-wine region on the German border, known for aromatic dry whites labeled by variety.',
    },
  },

  // ---- 부르고뉴 하위 5 (subregion → 더 작은 단위) ----
  {
    id: 'bg-chablis',
    type: 'subregion',
    parentId: 'fr-bourgogne',
    name: { ko: '샤블리', en: 'Chablis' },
    nameLatin: 'Chablis',
    accent: '#caa84e',
    grapes: ['Chardonnay'],
    grapeCount: 1,
    stats: { grandCrus: '7', style: 'mineral' },
    climate: 'cool',
    soil: 'kimmeridgian',
    description: {
      ko: '오크 없이 미네랄과 산미를 강조하는 샤르도네의 북쪽 끝.',
      en: 'The northern edge of Chardonnay, emphasizing mineral and acidity without oak.',
    },
  },
  {
    id: 'bg-cote-de-nuits',
    type: 'subregion',
    parentId: 'fr-bourgogne',
    name: { ko: '코트 드 뉘', en: 'Côte de Nuits' },
    nameLatin: 'Côte de Nuits',
    accent: '#8B1A2A',
    grapes: ['Pinot Noir'],
    grapeCount: 1,
    stats: { grandCrus: '24', focus: 'red' },
    climate: 'cool-continental',
    soil: 'limestone-marl',
    description: {
      ko: '부르고뉴 최고의 레드 산지. 대부분의 그랑크뤼 피노 누아가 여기 모여 있다.',
      en: 'Burgundy’s finest red region, home to most of its Grand Cru Pinot Noir.',
    },
  },
  {
    id: 'bg-cote-de-beaune',
    type: 'subregion',
    parentId: 'fr-bourgogne',
    name: { ko: '코트 드 본', en: 'Côte de Beaune' },
    nameLatin: 'Côte de Beaune',
    accent: '#caa84e',
    grapes: ['Chardonnay', 'Pinot Noir'],
    grapeCount: 2,
    stats: { grandCrus: '8', focus: 'white' },
    climate: 'cool-continental',
    soil: 'limestone-clay',
    description: {
      ko: '세계 최고의 화이트 부르고뉴 산지. 몽라셰·뫼르소가 여기 속한다.',
      en: 'The source of the world’s greatest white Burgundy, including Montrachet and Meursault.',
    },
  },
  {
    id: 'bg-cote-chalonnaise',
    type: 'subregion',
    parentId: 'fr-bourgogne',
    name: { ko: '코트 샬로네즈', en: 'Côte Chalonnaise' },
    nameLatin: 'Côte Chalonnaise',
    accent: '#a83040',
    grapes: ['Pinot Noir', 'Chardonnay'],
    grapeCount: 2,
    stats: { villages: '5', value: 'high' },
    climate: 'cool-continental',
    soil: 'limestone',
    description: {
      ko: '코트 도르 남쪽의 가성비 좋은 산지. 합리적 가격의 부르고뉴를 찾을 수 있다.',
      en: 'A value region south of the Côte d’Or offering well-priced Burgundy.',
    },
  },
  {
    id: 'bg-maconnais',
    type: 'subregion',
    parentId: 'fr-bourgogne',
    name: { ko: '마코네', en: 'Mâconnais' },
    nameLatin: 'Mâconnais',
    accent: '#d9be6e',
    grapes: ['Chardonnay'],
    grapeCount: 1,
    stats: { star: 'Pouilly-Fuissé', focus: 'white' },
    climate: 'mild',
    soil: 'limestone-clay',
    description: {
      ko: '부르고뉴 남쪽 끝의 따뜻한 화이트 산지. 푸이퓌세가 대표 아펠라시옹.',
      en: 'A warm white-wine region at Burgundy’s southern tip; Pouilly-Fuissé is its star appellation.',
    },
  },

  // ---- 본 로마네 아펠라시옹 (appellation) ----
  {
    id: 'ap-vosne-romanee',
    type: 'appellation',
    parentId: 'bg-cote-de-nuits',
    name: { ko: '본 로마네', en: 'Vosne-Romanée' },
    nameLatin: 'Vosne-Romanée',
    accent: '#5a2030',
    grapes: ['Pinot Noir'],
    grapeCount: 1,
    stats: { grandCrus: '8', icon: 'Romanée-Conti' },
    climate: 'cool-continental',
    soil: 'limestone-marl',
    description: {
      ko: '세계에서 가장 비싼 피노 누아의 고향. 로마네콩티를 포함한 8개 그랑크뤼가 모여 있다.',
      en: 'The home of the world’s most expensive Pinot Noir, with 8 Grand Crus including Romanée-Conti.',
    },
    profile: [
      { label: 'body', value: 4 },
      { label: 'acidity', value: 4 },
      { label: 'tannin', value: 3 },
      { label: 'fruit', value: 5 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// MOCK_WINERIES — DRC / Opus One / Penfolds / Sassicaia (L_WINERIES verbatim)
// ──────────────────────────────────────────────────────────────
export const MOCK_WINERIES: Winery[] = [
  {
    id: 'drc',
    shortName: 'DRC',
    fullName: 'Domaine de la Romanée-Conti',
    country: 'FR',
    location: { ko: '부르고뉴, 본 로마네', en: 'Burgundy, Vosne-Romanée' },
    established: 1869,
    acreage: '25 ha',
    flagship: 'Romanée-Conti Grand Cru',
    accentColor: '#5a2030',
    philosophy: {
      ko: '떼루아를 가장 순수하게 표현하기 위해 극도로 낮은 수확량과 유기농을 고수한다.',
      en: 'To express terroir in its purest form through extremely low yields and organic farming.',
    },
    description: {
      ko: '8개 그랑크뤼만 생산하는 부르고뉴 최정상. 매년 6,000병 미만의 로마네콩티는 세계에서 가장 비싼 와인 중 하나다.',
      en: 'Burgundy’s pinnacle, producing only 8 Grand Crus. Its Romanée-Conti, under 6,000 bottles a year, is among the world’s most expensive wines.',
    },
    lineup: [
      { id: 'drc-rc', name: 'Romanée-Conti', type: 'red', vintage: 2019 },
      { id: 'drc-lt', name: 'La Tâche', type: 'red', vintage: 2019 },
      { id: 'drc-ri', name: 'Richebourg', type: 'red', vintage: 2019 },
      { id: 'drc-mt', name: 'Montrachet', type: 'white', vintage: 2019 },
    ],
    grandCrus: [
      {
        name: 'Romanée-Conti',
        ha: 1.8,
        highlight: true,
        desc: {
          ko: '단일 밭 1.8헥타르. 세계에서 가장 작고 비싼 그랑크뤼.',
          en: 'A single 1.8-hectare plot — the smallest and most expensive Grand Cru in the world.',
        },
      },
      {
        name: 'La Tâche',
        ha: 6.0,
        highlight: false,
        desc: {
          ko: 'DRC 독점 모노폴. 농밀하고 스파이시한 피노 누아.',
          en: 'A DRC monopole — dense, spicy Pinot Noir.',
        },
      },
    ],
  },
  {
    id: 'opus',
    shortName: 'Opus One',
    fullName: 'Opus One',
    country: 'US',
    location: { ko: '나파 밸리, 오크빌', en: 'Napa Valley, Oakville' },
    established: 1979,
    acreage: '68 ha',
    flagship: 'Opus One (Bordeaux Blend)',
    accentColor: '#4a2040',
    philosophy: {
      ko: '프랑스 양조 전통과 캘리포니아 떼루아를 결합한 단일 그랑크뤼급 블렌드를 지향한다.',
      en: 'To unite French winemaking tradition with California terroir in a single Grand Cru-level blend.',
    },
    description: {
      ko: '1979년 로버트 몬다비와 바롱 필립 드 로칠드의 합작. 카베르네 소비뇽 중심 보르도 스타일 블렌드의 미국 대표.',
      en: 'Founded in 1979 by Robert Mondavi and Baron Philippe de Rothschild — America’s flagship Cabernet-led Bordeaux-style blend.',
    },
    lineup: [
      { id: 'opus-1', name: 'Opus One', type: 'red', vintage: 2019 },
      { id: 'opus-ov', name: 'Overture', type: 'red' },
    ],
    grandCrus: [],
  },
  {
    id: 'pen',
    shortName: 'Penfolds',
    fullName: 'Penfolds',
    country: 'AU',
    location: { ko: '바로사 밸리, 호주', en: 'Barossa Valley, Australia' },
    established: 1844,
    acreage: 'multi-regional',
    flagship: 'Grange Bin 95',
    accentColor: '#7a5a2a',
    philosophy: {
      ko: '단일 포도밭보다 여러 지역의 최상급 포도를 블렌딩해 일관된 스타일을 추구한다.',
      en: 'To pursue a consistent style by blending top fruit from multiple regions rather than a single vineyard.',
    },
    description: {
      ko: '1844년 설립. 시라즈 중심 그란지는 신대륙 와인의 상징. 멀티 리저널 블렌딩이 특징이다.',
      en: 'Founded in 1844. Its Shiraz-led Grange is a New World icon, defined by multi-regional blending.',
    },
    lineup: [
      { id: 'pen-grange', name: 'Grange Bin 95', type: 'red', vintage: 2018 },
      { id: 'pen-bin389', name: 'Bin 389', type: 'red', vintage: 2020 },
      { id: 'pen-bin28', name: 'Bin 28', type: 'red', vintage: 2021 },
    ],
    grandCrus: [],
  },
  {
    id: 'sas',
    shortName: 'Sassicaia',
    fullName: 'Tenuta San Guido',
    country: 'IT',
    location: { ko: '볼게리, 토스카나', en: 'Bolgheri, Tuscany' },
    established: 1968,
    acreage: '90 ha',
    flagship: 'Sassicaia',
    accentColor: '#6b3550',
    philosophy: {
      ko: '토스카나 해안에서 보르도 품종으로 우아함과 장기 숙성력을 동시에 추구한다.',
      en: 'To pursue both elegance and ageworthiness with Bordeaux varieties on the Tuscan coast.',
    },
    description: {
      ko: '1968년 첫 빈티지. 토스카나에서 카베르네 소비뇽이 가능함을 증명한 슈퍼 투스칸의 시작점.',
      en: 'First vintage in 1968 — the origin of the Super Tuscans, proving Cabernet Sauvignon could thrive in Tuscany.',
    },
    lineup: [
      { id: 'sas-sass', name: 'Sassicaia', type: 'red', vintage: 2020 },
      { id: 'sas-guidalberto', name: 'Guidalberto', type: 'red', vintage: 2021 },
    ],
    grandCrus: [],
  },
];

// ──────────────────────────────────────────────────────────────
// MOCK_VINTAGES — 보르도 2020 / 부르고뉴 2019 / 피에몬테 2022 / 모젤 2021 (L_VINTAGES verbatim)
// ──────────────────────────────────────────────────────────────
export const MOCK_VINTAGES: VintageEntry[] = [
  {
    id: 'bdx19',
    region: { ko: '보르도', en: 'Bordeaux' },
    year: 2019,
    score: 96,
    accentColor: '#8B1A2A',
    climate: { ko: '균형', en: 'Balanced' },
    tag: { ko: '우아함', en: 'Elegant' },
    summary: {
      ko: '산도와 구조의 완벽한 균형. 카베르네 소비뇽이 압도하는 클래식 보르도 빈티지.',
      en: 'Perfect balance of acidity and structure — a classic Bordeaux year dominated by Cabernet Sauvignon.',
    },
    climateEvents: [
      { when: 'Spring', headline: 'Cool, even bud break', body: '온화한 발아기, 고른 결실.', tone: 'gold' },
      { when: 'Summer', headline: 'Warm, dry August', body: '8월 고온건조로 완숙.', tone: 'gold' },
      { when: 'Harvest', headline: 'Late September pick', body: '산도 보존하며 이상적 수확.', tone: 'muted' },
    ],
    pairing: [
      { food: { ko: '립아이 스테이크', en: 'Ribeye Steak' }, note: { ko: '탄닌이 지방을 정리해 줍니다', en: 'Tannins cut through the fat beautifully' } },
      { food: { ko: '양 갈비', en: 'Rack of Lamb' }, note: { ko: '허브와 카베르네의 완벽한 조화', en: 'Herbs meet Cabernet in perfect harmony' } },
      { food: { ko: '숙성 그뤼에르', en: 'Aged Gruyère' }, note: { ko: '산도가 치즈의 짠맛과 균형', en: 'Acidity balances the salinity of the cheese' } },
    ],
    relatedVintages: [
      { id: 'bdx20', year: 2020, score: 96, tag: { ko: '바디감 강함', en: 'Full-Bodied' } },
      { id: 'bdx16', year: 2016, score: 97, tag: { ko: '세기의 빈티지', en: 'Vintage of the Century' } },
      { id: 'bdx18', year: 2018, score: 94, tag: { ko: '접근성 높음', en: 'Approachable' } },
    ],
  },
  {
    id: 'bdx20',
    region: { ko: '보르도', en: 'Bordeaux' },
    year: 2020,
    score: 96,
    accentColor: '#8B1A2A',
    climate: { ko: '더운 해', en: 'Hot Year' },
    tag: { ko: '바디감 강함', en: 'Full-Bodied' },
    summary: {
      ko: '드라이한 여름과 이른 수확. 풀바디 메를로가 인상적인 빈티지.',
      en: 'A dry summer and early harvest yielded an impressive full-bodied Merlot vintage.',
    },
    climateEvents: [
      { when: 'spring', headline: 'Mild bud break', body: '온화한 발아기로 고른 결실.', tone: 'gold' },
      { when: 'summer', headline: 'Drought stress', body: '가뭄으로 작은 알맹이·농축된 과실.', tone: 'wine' },
      { when: 'harvest', headline: 'Early picking', body: '이른 수확으로 신선한 산도 보존.', tone: 'muted' },
    ],
    pairing: [
      { food: { ko: '브레이즈드 숏립', en: 'Braised Short Ribs' }, note: { ko: '농축된 메를로와 찐한 소스의 조화', en: 'Rich Merlot meets a deep, braised sauce' } },
      { food: { ko: '오리 가슴살 콩피', en: 'Duck Breast Confit' }, note: { ko: '과실 풍미가 오리의 풍성함을 받쳐줍니다', en: 'Fruit-forward notes support the richness of duck' } },
      { food: { ko: '트러플 리조토', en: 'Truffle Risotto' }, note: { ko: '흙내음이 포므롤 스타일과 공명', en: 'Earthy notes resonate with Pomerol-style wines' } },
    ],
    relatedVintages: [
      { id: 'bdx19', year: 2019, score: 96, tag: { ko: '우아함', en: 'Elegant' } },
      { id: 'bdx16', year: 2016, score: 97, tag: { ko: '세기의 빈티지', en: 'Vintage of the Century' } },
      { id: 'bdx15', year: 2015, score: 93, tag: { ko: '풍성함', en: 'Generous' } },
    ],
  },
  {
    id: 'bgn19',
    region: { ko: '부르고뉴', en: 'Burgundy' },
    year: 2019,
    score: 98,
    accentColor: '#a83040',
    climate: { ko: '균형', en: 'Balanced' },
    tag: { ko: '최고작', en: 'Top Vintage' },
    summary: {
      ko: '산도·과실·구조의 완벽한 균형. 피노 누아의 황금 빈티지.',
      en: 'A perfect balance of acidity, fruit, and structure — a golden vintage for Pinot Noir.',
    },
    climateEvents: [
      { when: 'spring', headline: 'Frost risk', body: '봄 서리 피해로 수확량 감소.', tone: 'muted' },
      { when: 'summer', headline: 'Warm and dry', body: '따뜻하고 건조한 여름으로 완숙.', tone: 'gold' },
      { when: 'harvest', headline: 'Ideal conditions', body: '이상적 수확기로 균형 잡힌 과실.', tone: 'wine' },
    ],
  },
  {
    id: 'pmt22',
    region: { ko: '피에몬테', en: 'Piedmont' },
    year: 2022,
    score: 93,
    accentColor: '#6a3050',
    climate: { ko: '더운 해', en: 'Hot Year' },
    tag: { ko: '조숙', en: 'Early-Maturing' },
    summary: {
      ko: '바롤로는 숙성 기간을 4–5년 단축 가능. 풀바디에 접근성도 높은 빈티지.',
      en: 'Barolo can mature 4–5 years sooner — a full-bodied yet approachable vintage.',
    },
    climateEvents: [
      { when: 'summer', headline: 'Heat spike', body: '폭염으로 빠른 숙성·높은 당도.', tone: 'wine' },
      { when: 'harvest', headline: 'Early ripeness', body: '조숙으로 부드러운 탄닌.', tone: 'gold' },
    ],
  },
  {
    id: 'mos21',
    region: { ko: '모젤', en: 'Mosel' },
    year: 2021,
    score: 95,
    accentColor: '#5d6a40',
    climate: { ko: '서늘', en: 'Cool' },
    tag: { ko: '산도 절정', en: 'Peak Acidity' },
    summary: {
      ko: '리슬링 카비넷·슈페트레제 모두 산미가 또렷한 서늘한 빈티지.',
      en: 'A cool vintage with vivid acidity across Riesling Kabinett and Spätlese.',
    },
    climateEvents: [
      { when: 'summer', headline: 'Cool growing season', body: '서늘한 생육기로 높은 산도 유지.', tone: 'gold' },
      { when: 'harvest', headline: 'Late harvest', body: '늦은 수확으로 농축과 균형.', tone: 'muted' },
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// MOCK_VINTAGE_CHART_BORDEAUX — 보르도 10년 (2014–2023)
// ──────────────────────────────────────────────────────────────
export const MOCK_VINTAGE_CHART_BORDEAUX: VintageChartData = {
  regionId: 'bordeaux',
  regionName: { ko: '보르도', en: 'Bordeaux' },
  years: [
    { year: 2014, score: 88, highlight: false, note: { ko: '비 많은 해, 라이트 스타일', en: 'Wet year, lighter style' } },
    { year: 2015, score: 93, highlight: false, note: { ko: '풍성하고 일찍 익는 빈티지', en: 'Generous and early-drinking' } },
    { year: 2016, score: 97, highlight: true,  note: { ko: '세기의 빈티지, 완벽한 구조', en: 'Vintage of the century, exceptional structure' } },
    { year: 2017, score: 86, highlight: false, note: { ko: '봄 서리 피해, 불균일한 품질', en: 'Spring frost damage, uneven quality' } },
    { year: 2018, score: 94, highlight: false, note: { ko: '따뜻하고 풍부, 접근성 높음', en: 'Warm and generous, approachable' } },
    { year: 2019, score: 96, highlight: true,  note: { ko: '우아함과 긴 숙성 잠재력', en: 'Elegance and exceptional aging potential' } },
    { year: 2020, score: 96, highlight: true,  note: { ko: '더운 해, 농축된 메를로', en: 'Hot year, concentrated Merlot' } },
    { year: 2021, score: 90, highlight: false, note: { ko: '서늘한 회복기, 신선한 산도', en: 'Cool recovery, fresh acidity' } },
    { year: 2022, score: 93, highlight: false, note: { ko: '폭염 빈티지, 조숙한 타닌', en: 'Heat vintage, early-ripening tannins' } },
    { year: 2023, score: 91, highlight: false, note: { ko: '균형 잡힌 빈티지 (잠정 평가)', en: 'Balanced vintage (preliminary score)' } },
  ],
  tip: {
    ko: '보르도에서 90점 이상 빈티지는 좌안(메독·그라브)이 주도하고, 우안(포므롤·생테밀리옹)은 더운 해에 강합니다.',
    en: 'In Bordeaux, 90+ vintages are often led by the Left Bank (Médoc, Graves), while the Right Bank (Pomerol, Saint-Émilion) excels in hot years.',
  },
};

// ──────────────────────────────────────────────────────────────
// MOCK_VINTAGE_COMPARE_BDX — 보르도 2019 vs 2020 비교
// ──────────────────────────────────────────────────────────────
export const MOCK_VINTAGE_COMPARE_BDX: VintageCompareData = {
  aId: 'bdx19',
  bId: 'bdx20',
  subheading: { ko: '보르도 · 2019 vs 2020', en: 'Bordeaux · 2019 vs 2020' },
  rows: [
    { key: { ko: '기후', en: 'Climate' },       left: '균형 / Balanced',      right: '고온건조 / Hot & Dry' },
    { key: { ko: '우세 품종', en: 'Dominant' }, left: 'Cabernet Sauvignon',   right: 'Merlot' },
    { key: { ko: '수확 시기', en: 'Harvest' },  left: '9월 하순',              right: '9월 초' },
    { key: { ko: '알코올', en: 'Alcohol' },     left: '13.5%',                 right: '14.2%' },
    { key: { ko: '산도', en: 'Acidity' },       left: '높음 / High',           right: '중간 / Medium' },
    { key: { ko: '타닌', en: 'Tannin' },        left: '실키 / Silky',          right: '강건 / Firm' },
  ],
  radar: [
    { label: { ko: '바디', en: 'Body' },          aVal: 3, bVal: 5 },
    { label: { ko: '산도', en: 'Acidity' },       aVal: 4, bVal: 3 },
    { label: { ko: '타닌', en: 'Tannin' },        aVal: 3, bVal: 5 },
    { label: { ko: '과실', en: 'Fruit' },         aVal: 5, bVal: 4 },
    { label: { ko: '숙성잠재력', en: 'Aging' },   aVal: 5, bVal: 4 },
  ],
  verdict: {
    ko: '두 빈티지 모두 역대급이지만 성격이 다르다. 2019는 우아함과 긴 숙성을, 2020은 풍성함과 즉각적인 즐거움을 약속한다.',
    en: 'Both are exceptional but speak different languages. 2019 promises elegance and long aging; 2020 delivers richness and immediate pleasure.',
  },
};
