/**
 * Tasting Templates — 노트 양식 정의 + 커뮤니티 공유 풀 (v0.1.0).
 *
 * 사양: design-spec community-side.md §1-C §10-A.
 *
 * 키스크린 verbatim 포팅 (`../winemine-keyscreen/src/lib/mock/tasting-templates.ts`, 224 LOC).
 * v0.2.0: supabase `community_templates` 테이블 마이그레이션 + `saved_templates` join table 대체.
 *
 * - BUILTIN_BEGINNER / BUILTIN_EXPERT: winemine 제공 (i18n key 기반 — `src/lib/notes/builtin-templates.ts` 와 통합)
 * - COMMUNITY_TEMPLATES: 3종 mock 풀 (sommelier 142 saves / daily 89 / collector 38)
 * - getCommunityTemplatesSorted(sort): popular/latest 정렬
 *
 * §0-2 light-only mode.
 * §10-A 결정: 별도 파일. RN 측에서는 i18n LocalizedString { ko, en } shape 그대로 사용.
 */

import {
  BUILTIN_BEGINNER_ID,
  BUILTIN_EXPERT_ID,
  type TemplateKind,
} from '@/lib/notes/builtin-templates';

export type LocalizedString = { ko: string; en: string };

export type FieldType =
  | 'number'
  | 'text'
  | 'rating'
  | 'wsetScale'
  | 'checkbox'
  | 'slider'
  | 'chipsSingle'
  | 'chipsMulti';

export interface FieldOption {
  id: string;
  label: LocalizedString;
}

export interface TemplateField {
  id: string;
  type: FieldType;
  label: LocalizedString;
  description?: LocalizedString;
  options?: FieldOption[];
  min?: number;
  max?: number;
}

export interface TastingTemplate {
  id: string;
  kind: TemplateKind;
  title: LocalizedString;
  description: LocalizedString;
  authorUserId: string | null;
  authorName: LocalizedString;
  isPublic: boolean;
  savesCount: number;
  createdAt: string;
  fields: TemplateField[];
}

// ────────────────────────────────────────────────────────────────────────────
// Builtin (i18n key 기반 wrapper — display는 화면에서 useTranslation 으로)
// ────────────────────────────────────────────────────────────────────────────
//
// 본 모듈은 community-templates 화면에서만 풀로 사용되므로 builtin은 별도 export로 유지.
// 화면이 builtin을 표시하지 않음 (커뮤니티 양식만 표시) — 명세 §1-C-4.

export const BUILTIN_BEGINNER: TastingTemplate = {
  id: BUILTIN_BEGINNER_ID,
  kind: 'builtinBeginner',
  title: { ko: '입문자용 노트', en: 'Beginner note' },
  description: {
    ko: '5분이면 끝나는 짧은 기록. 첫 인상·맛·향·여운·평점·메모.',
    en: 'A 5-minute log. First impression, palate, aroma, finish, rating, memo.',
  },
  authorUserId: null,
  authorName: { ko: 'winemine 제공', en: 'by winemine' },
  isPublic: true,
  savesCount: 0,
  createdAt: '2025-09-01T00:00:00Z',
  fields: [],
};

export const BUILTIN_EXPERT: TastingTemplate = {
  id: BUILTIN_EXPERT_ID,
  kind: 'builtinExpert',
  title: { ko: '전문가용 노트', en: 'Expert note' },
  description: {
    ko: 'WSET 기반 풀 옵션. 아로마 휠, 카우달리, 결함 체크, 오프닝 타임라인까지.',
    en: 'Full WSET options. Aroma wheel, caudalies, fault check, opening timeline.',
  },
  authorUserId: null,
  authorName: { ko: 'winemine 제공', en: 'by winemine' },
  isPublic: true,
  savesCount: 0,
  createdAt: '2025-09-01T00:00:00Z',
  fields: [],
};

// ────────────────────────────────────────────────────────────────────────────
// Community templates (3종)
// ────────────────────────────────────────────────────────────────────────────

export const COMMUNITY_TEMPLATES: TastingTemplate[] = [
  {
    id: 'tpl-sommelier',
    kind: 'custom',
    title: { ko: '소믈리에의 노트', en: "Sommelier's note" },
    description: {
      ko: '레스토랑 페어링 관점. 음식과의 매칭, 잔당 가격, 서빙 메모.',
      en: 'Restaurant pairing lens. Food match, glass price, service memo.',
    },
    authorUserId: 'sommelier',
    authorName: { ko: '함소믈리에', en: 'Som. Ham' },
    isPublic: true,
    savesCount: 142,
    createdAt: '2026-03-12T11:00:00Z',
    fields: [
      {
        id: 'glassPrice',
        type: 'number',
        label: { ko: '잔당 추천 가격 (원)', en: 'Suggested glass price (KRW)' },
      },
      {
        id: 'foodMatch',
        type: 'chipsMulti',
        label: { ko: '어울리는 음식', en: 'Food pairing' },
        options: [
          { id: 'redMeat', label: { ko: '레드 미트', en: 'Red meat' } },
          { id: 'whiteMeat', label: { ko: '화이트 미트', en: 'White meat' } },
          { id: 'seafood', label: { ko: '해산물', en: 'Seafood' } },
          { id: 'cheese', label: { ko: '치즈', en: 'Cheese' } },
          { id: 'vegetable', label: { ko: '채소', en: 'Vegetable' } },
          { id: 'spicy', label: { ko: '매운 음식', en: 'Spicy' } },
          { id: 'dessert', label: { ko: '디저트', en: 'Dessert' } },
        ],
      },
      {
        id: 'pourGuide',
        type: 'wsetScale',
        label: { ko: '디캔팅 권장도', en: 'Decanting needed' },
      },
      {
        id: 'serviceMemo',
        type: 'text',
        label: { ko: '서비스 메모', en: 'Service memo' },
        description: {
          ko: '서버에게 안내할 한 줄. 잔 모양, 온도, 음식 권장.',
          en: 'One line for the server. Glass shape, temp, dish suggestion.',
        },
      },
      {
        id: 'recommendation',
        type: 'rating',
        label: { ko: '손님에게 추천하시겠어요?', en: 'Recommend to guests?' },
      },
    ],
  },
  {
    id: 'tpl-daily',
    kind: 'custom',
    title: { ko: '데일리 와인 노트', en: 'Daily wine log' },
    description: {
      ko: '평일 저녁 한 잔용 가볍게. 가격, 분위기, 다시 살래요? 정도만.',
      en: 'Weekday-evening light log. Price, vibe, would-buy-again only.',
    },
    authorUserId: 'duckhu',
    authorName: { ko: '와인덕후', en: 'Wine Duckhu' },
    isPublic: true,
    savesCount: 89,
    createdAt: '2026-04-02T19:30:00Z',
    fields: [
      {
        id: 'priceKrw',
        type: 'number',
        label: { ko: '구매 가격 (원)', en: 'Price paid (KRW)' },
      },
      {
        id: 'vibe',
        type: 'chipsSingle',
        label: { ko: '오늘의 분위기', en: 'Tonight vibe' },
        options: [
          { id: 'cozy', label: { ko: '아늑함', en: 'Cozy' } },
          { id: 'celebration', label: { ko: '특별한 날', en: 'Celebration' } },
          { id: 'wind-down', label: { ko: '하루 마무리', en: 'Wind-down' } },
          { id: 'dinner', label: { ko: '식사와 함께', en: 'With dinner' } },
        ],
      },
      {
        id: 'rating',
        type: 'rating',
        label: { ko: '평점', en: 'Rating' },
      },
      {
        id: 'buyAgain',
        type: 'checkbox',
        label: { ko: '다시 살래요', en: 'Would buy again' },
      },
      {
        id: 'memo',
        type: 'text',
        label: { ko: '한 줄 메모', en: 'One-line memo' },
      },
    ],
  },
  {
    id: 'tpl-collector',
    kind: 'custom',
    title: { ko: '컬렉터의 시점 기록', en: "Collector's window log" },
    description: {
      ko: '셀러러용. 빈티지·드링킹 윈도우·가격 변동·다음 시음 시점.',
      en: 'For cellarers. Vintage, drinking window, price drift, next pour.',
    },
    authorUserId: 'jiwon',
    authorName: { ko: '박지원', en: 'Jiwon Park' },
    isPublic: true,
    savesCount: 38,
    createdAt: '2026-02-20T14:15:00Z',
    fields: [
      {
        id: 'vintageQuality',
        type: 'wsetScale',
        label: { ko: '빈티지 평가', en: 'Vintage rating' },
      },
      {
        id: 'currentState',
        type: 'chipsSingle',
        label: { ko: '현재 상태', en: 'Current state' },
        options: [
          { id: 'tooYoung', label: { ko: '아직 어림', en: 'Too young' } },
          { id: 'opening', label: { ko: '열리는 중', en: 'Opening up' } },
          { id: 'peak', label: { ko: '정점', en: 'At peak' } },
          { id: 'past', label: { ko: '내리막', en: 'Past peak' } },
        ],
      },
      {
        id: 'nextPourYear',
        type: 'number',
        label: { ko: '다음 시음 권장 연도', en: 'Next pour year' },
      },
      {
        id: 'priceChange',
        type: 'slider',
        label: {
          ko: '구매 시점 대비 가격 변화 (1=하락, 5=급등)',
          en: 'Price change since purchase (1=down, 5=up)',
        },
        min: 1,
        max: 5,
      },
      {
        id: 'cellarMemo',
        type: 'text',
        label: { ko: '셀러 메모', en: 'Cellar memo' },
      },
    ],
  },
];

export const ALL_TEMPLATES: TastingTemplate[] = [
  BUILTIN_BEGINNER,
  BUILTIN_EXPERT,
  ...COMMUNITY_TEMPLATES,
];

export function getTemplateById(id: string): TastingTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

export function getCommunityTemplatesSorted(
  sortBy: 'popular' | 'latest' = 'popular',
): TastingTemplate[] {
  const arr = [...COMMUNITY_TEMPLATES];
  if (sortBy === 'popular') {
    arr.sort((a, b) => b.savesCount - a.savesCount);
  } else {
    arr.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return arr;
}
