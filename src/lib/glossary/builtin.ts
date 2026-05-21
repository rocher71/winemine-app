/**
 * Glossary built-in — keyscreen src/lib/mock/glossary.ts shape 동등 포팅 (subset).
 *
 * Step 1 §10 결정 B: supabase `glossary_terms` 테이블 없이 정적 모듈로 v0.1.0 제공.
 * wine-story 본문의 inline (i) 트리거가 lookup 하는 12+ entries 중,
 * TERM_DEFS (story-history-body.tsx) 가 매칭하는 7 termId 를 우선 포팅:
 *   appellation / terroir / grand-cru / 1855-classification / decanting / wset / brett
 *
 * 추가로 caudalie / residual-sugar / bouchonne / tdn / rotundone 도 5개 포함 (keyscreen 12 entries 중 본 화면 미사용이지만, 향후 노트 상세에서 재사용 대비).
 *
 * 본 모듈은 BottomSheet 콘텐츠 fetch 의 source — wine-story 외 노트 화면에서도 재사용 가능.
 */
import type { LocalizedString } from '@/components/shared/locale-text';

export type GlossaryEntry = {
  id: string;
  term: LocalizedString;
  definition: LocalizedString;
  examples?: LocalizedString;
  source?: LocalizedString;
  category:
    | 'sensory'
    | 'unit'
    | 'classification'
    | 'technique'
    | 'fault'
    | 'other';
};

export const GLOSSARY_BUILTIN: GlossaryEntry[] = [
  {
    id: 'appellation',
    term: { ko: '아펠라시옹 (Appellation)', en: 'Appellation' },
    definition: {
      ko: '법적으로 정의된 와인 산지 명칭과 그에 따른 양조 규정. 프랑스 AOC, 이탈리아 DOCG, 스페인 DOC 등이 해당. 라벨에 표기된 아펠라시옹은 떼루아·품종·양조 방법의 보증 역할.',
      en: 'A legally defined wine-region name and the production rules tied to it — e.g., French AOC, Italian DOCG, Spanish DOC. The appellation on a label is a guarantee of terroir, grapes, and winemaking method.',
    },
    examples: {
      ko: '"Pauillac AOC"는 보르도 메독 좌안의 정해진 구역에서 정해진 품종으로만 양조 가능.',
      en: 'A "Pauillac AOC" label means the wine was made from approved grapes inside the defined Pauillac zone on the Bordeaux Left Bank.',
    },
    source: { ko: 'EU Regulation 607/2009', en: 'EU Regulation 607/2009' },
    category: 'classification',
  },
  {
    id: 'terroir',
    term: { ko: '떼루아 (Terroir)', en: 'Terroir' },
    definition: {
      ko: '와인 산지의 토양·기후·고도·인간 양조 전통 등 모든 환경적 요소의 종합. 같은 품종이라도 떼루아가 다르면 다른 와인이 된다는 부르고뉴식 사고의 핵심 개념.',
      en: 'The total environmental context — soil, climate, altitude, and human winemaking tradition — of a wine region. The core Burgundian idea that the same grape produces different wines in different terroirs.',
    },
    examples: {
      ko: '"이 와인의 떼루아는 갈렛(자갈) 위 모래 토양이다."',
      en: '"The terroir of this wine is sand soil over galets (large pebbles)."',
    },
    source: { ko: 'Wilson, Terroir (1998)', en: 'Wilson, Terroir (1998)' },
    category: 'classification',
  },
  {
    id: 'grand-cru',
    term: { ko: '그랑 크뤼 (Grand Cru)', en: 'Grand Cru' },
    definition: {
      ko: '프랑스 와인 분류에서 최상위 등급. 부르고뉴에서는 빈야드 자체에 부여되며, 보르도 1855년 분류에서는 와이너리에 부여된다. 같은 "Grand Cru" 라도 산지마다 정의가 다르므로 라벨의 아펠라시옹과 함께 해석해야 한다.',
      en: 'The top tier in several French classifications. In Burgundy it is given to a vineyard; in the 1855 Bordeaux classification it is given to an estate. Because the meaning differs by region, the appellation on the label must be read alongside it.',
    },
    source: { ko: 'EU Regulation 607/2009', en: 'EU Regulation 607/2009' },
    category: 'classification',
  },
  {
    id: '1855-classification',
    term: {
      ko: '1855년 메독 분류 (1855 Médoc Classification)',
      en: '1855 Médoc Classification',
    },
    definition: {
      ko: '1855년 파리 만국 박람회를 위해 보르도 상공회의소가 발표한 메독·소테른 와이너리 등급. 1~5등급의 Grand Cru Classé 로 구분되며, 발표 이후 거의 변경되지 않은 매우 보수적 등급. 현재까지도 좌안 보르도 와이너리 위계의 기준.',
      en: 'A ranking of Médoc and Sauternes estates published by the Bordeaux Chamber of Commerce for the 1855 Paris Universal Exposition. Estates are organised into five tiers of Grand Cru Classé. The list has barely changed since publication and remains the canonical hierarchy of the Left Bank.',
    },
    source: { ko: 'Chambre de Commerce de Bordeaux, 1855', en: 'Chambre de Commerce de Bordeaux, 1855' },
    category: 'classification',
  },
  {
    id: 'decanting',
    term: { ko: '디캔팅 (Decanting)', en: 'Decanting' },
    definition: {
      ko: '와인을 본 병에서 디캔터로 옮겨 산소와 접촉시키거나 침전물을 분리하는 행위. 어린 풀바디 레드는 향의 발현을 위해, 오래된 와인은 침전물 분리만을 위해 진행. 어린 바롤로·바르바레스코는 60~120분, 어린 보르도 그랑 크뤼는 90~120분이 권장.',
      en: 'Pouring wine from its bottle into a decanter — either to expose it to oxygen or to separate sediment. Young full-bodied reds benefit from aromatic opening; older wines decant mainly for sediment. Young Barolo/Barbaresco needs 60–120 min, young Bordeaux Grand Cru 90–120 min.',
    },
    examples: {
      ko: '"이 마고는 2시간 디캔팅 후에 향이 깨어났다."',
      en: '"The aromatics of this Margaux woke up after a two-hour decant."',
    },
    source: { ko: 'WSET Diploma', en: 'WSET Diploma' },
    category: 'technique',
  },
  {
    id: 'wset',
    term: {
      ko: 'WSET (Wine & Spirit Education Trust)',
      en: 'WSET (Wine & Spirit Education Trust)',
    },
    definition: {
      ko: '런던에 본부를 둔 와인·증류주 교육 기관. 4단계의 자격증 체계(Level 1~Diploma)와 표준화된 테이스팅 노트 시스템(Systematic Approach to Tasting, SAT)을 운영. 본 앱의 전문가 모드 슬라이더 5단계 평가는 SAT를 기반으로 한다.',
      en: 'A London-based wine and spirits education body. It runs a four-level certification system (Level 1 to Diploma) and the standardised Systematic Approach to Tasting (SAT). The 5-point WSET sliders in expert mode are based on SAT.',
    },
    source: {
      ko: 'WSET Systematic Approach to Tasting',
      en: 'WSET Systematic Approach to Tasting',
    },
    category: 'technique',
  },
  {
    id: 'brett',
    term: { ko: '브렛 (Brettanomyces)', en: 'Brett (Brettanomyces)' },
    definition: {
      ko: '와인에서 발생하는 야생 효모. 4-에틸페놀과 4-에틸과이아콜을 생산해 마구간·말 안장·반창고·훈제 베이컨 같은 향을 부여한다. 저농도에서는 복합성으로 평가되지만 고농도에서는 결함으로 본다.',
      en: 'A wild yeast that contaminates wine, producing 4-ethylphenol and 4-ethylguaiacol — yielding aromas of stable, saddle, band-aid, and smoked bacon. At low concentrations it is considered complexity; at high levels, a fault.',
    },
    examples: {
      ko: '4-EP 약 600 µg/L 이상부터 결함으로 평가.',
      en: 'Generally classified as a fault above ~600 µg/L of 4-EP.',
    },
    source: { ko: 'AWRI Technical Review', en: 'AWRI Technical Review' },
    category: 'fault',
  },
];

const GLOSSARY_BY_ID: Record<string, GlossaryEntry> = GLOSSARY_BUILTIN.reduce<
  Record<string, GlossaryEntry>
>((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});

export function getGlossaryEntry(id: string): GlossaryEntry | null {
  return GLOSSARY_BY_ID[id] ?? null;
}
