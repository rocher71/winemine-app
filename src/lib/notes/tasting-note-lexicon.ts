/**
 * Tasting Note Lexicon (RN port of /Users/yejinkim/dev/winemine/src/lib/tasting-note-lexicon.ts).
 *
 * 출처:
 *   - UC Davis Aroma Wheel 12 categories
 *   - WSET 5-step scales
 *   - 03 caudalies (Peynaud finish length)
 *   - 11 wine faults
 *   - 9 opening guide categories
 *
 * 단순화 (RN landing → app port):
 *   - IMPACT_COMPOUNDS 제외 (tooltip 미사용 — TanninTexture group/labels는 유지)
 *   - blind 형태 제외 (RN expert는 별도 blind toggle만 — 4 variant tab만 white/red/sparkling/blind)
 *   - SUMMARY 템플릿 ko/en 양쪽 유지
 *   - 모든 텍스트 ko/en 매핑 객체 형태 (i18next에 의존 X — locale arg 받음)
 */

// ── Variant & Scale Types ───────────────────────────────────────────────────

export type WineColor = 'white' | 'red' | 'sparkling' | 'blind';
export type FormVariant = WineColor;
export type Locale = 'ko' | 'en';

/** WSET 5-step */
export type WSETScale = 'low' | 'mediumMinus' | 'medium' | 'mediumPlus' | 'high';

export const WSET_ORDER: readonly WSETScale[] = [
  'low',
  'mediumMinus',
  'medium',
  'mediumPlus',
  'high',
] as const;

export function wsetToNumber(v: WSETScale): number {
  return WSET_ORDER.indexOf(v) + 1; // 1..5
}
export function numberToWset(n: number): WSETScale {
  const idx = Math.max(0, Math.min(4, Math.round(n) - 1));
  return WSET_ORDER[idx]!;
}

/** EU Commission Regulation 607/2009 7-step sparkling dosage */
export type SparklingDosage =
  | 'brutNature'
  | 'extraBrut'
  | 'brut'
  | 'extraDry'
  | 'sec'
  | 'demiSec'
  | 'doux';

export type FinishLength = 'short' | 'medium' | 'long' | 'veryLong';

export type TanninTexture =
  | 'silky' | 'velvety' | 'smooth' | 'plush' | 'soft' | 'round'
  | 'fineGrained' | 'polished' | 'powdery' | 'dusty' | 'chalky'
  | 'grainy' | 'grippy' | 'firm' | 'chewy'
  | 'coarse' | 'rough' | 'harsh' | 'astringent' | 'drying' | 'aggressive';

export type TanninRipeness = 'unripe' | 'ripe' | 'overripe';

export type BubbleSize = 'fine' | 'medium' | 'coarse';
export type BubblePersistence = 'fleeting' | 'steady' | 'persistent' | 'continuous';
export type MousseTexture = 'creamy' | 'silky' | 'frothy' | 'soft' | 'aggressive';
export type SparklingMethod = 'traditional' | 'charmat' | 'asti' | 'ancestral' | 'unknown';

export type Fault =
  | 'corked' | 'brett' | 'volatileAcidity' | 'reduction' | 'oxidation'
  | 'heat' | 'mercaptan' | 'lightstruck' | 'geranium' | 'mousy' | 'cork';

export type Delta = -2 | -1 | 0 | 1 | 2;

// ── UC Davis Aroma Wheel — 12 categories ────────────────────────────────────

export type AromaCategoryId =
  | 'fruity' | 'floral' | 'spicy' | 'herbaceous' | 'nutty' | 'caramelized'
  | 'woody' | 'earthy' | 'chemical' | 'pungent' | 'oxidized' | 'microbiological';

export type AromaCategoryIconKey =
  | 'cherry' | 'rose' | 'chili' | 'herb' | 'chestnut' | 'honey'
  | 'wood' | 'leaf' | 'testTube' | 'flame' | 'whisky' | 'dna';

export interface AromaCategory {
  id: AromaCategoryId;
  ko: string;
  en: string;
  color: string;
  icon: AromaCategoryIconKey;
}

export const AROMA_CATEGORIES: readonly AromaCategory[] = [
  { id: 'fruity',          ko: '과일',     en: 'Fruity',          color: '#C9A84C', icon: 'cherry' },
  { id: 'floral',          ko: '꽃',       en: 'Floral',          color: '#E8B4D2', icon: 'rose' },
  { id: 'spicy',           ko: '향신료',   en: 'Spicy',           color: '#A05A3D', icon: 'chili' },
  { id: 'herbaceous',      ko: '허브·식물', en: 'Herbaceous',      color: '#7A8B5C', icon: 'herb' },
  { id: 'nutty',           ko: '견과',     en: 'Nutty',           color: '#8B6B47', icon: 'chestnut' },
  { id: 'caramelized',     ko: '캐러멜',   en: 'Caramelized',     color: '#6B4423', icon: 'honey' },
  { id: 'woody',           ko: '나무·오크', en: 'Woody',           color: '#5C3A1E', icon: 'wood' },
  { id: 'earthy',          ko: '흙',       en: 'Earthy',          color: '#4A3D32', icon: 'leaf' },
  { id: 'chemical',        ko: '화학',     en: 'Chemical',        color: '#6A5D7B', icon: 'testTube' },
  { id: 'pungent',         ko: '자극',     en: 'Pungent',         color: '#8B1A2A', icon: 'flame' },
  { id: 'oxidized',        ko: '산화·셰리', en: 'Oxidized',        color: '#7B5C3A', icon: 'whisky' },
  { id: 'microbiological', ko: '미생물',   en: 'Microbiological', color: '#5C5C5C', icon: 'dna' },
] as const;

// ── Aroma lexicon (entries — 2·3차 hierarchy) ───────────────────────────────

export interface LexEntry {
  id: string;
  category: AromaCategoryId;
  subcategory: string;
  ko: string;
  en: string;
  appliesTo: WineColor[];
}

const ALL: WineColor[] = ['white', 'red', 'sparkling', 'blind'];
const RW_ONLY: WineColor[] = ['red', 'blind'];
const WW_ONLY: WineColor[] = ['white', 'sparkling', 'blind'];

export const AROMA_LEXICON: readonly LexEntry[] = [
  // Fruity
  { id: 'lemon',         category: 'fruity', subcategory: 'citrus',     ko: '레몬',     en: 'Lemon',          appliesTo: WW_ONLY },
  { id: 'grapefruit',    category: 'fruity', subcategory: 'citrus',     ko: '자몽',     en: 'Grapefruit',     appliesTo: WW_ONLY },
  { id: 'lime',          category: 'fruity', subcategory: 'citrus',     ko: '라임',     en: 'Lime',           appliesTo: WW_ONLY },
  { id: 'orange-peel',   category: 'fruity', subcategory: 'citrus',     ko: '오렌지껍질', en: 'Orange Peel',  appliesTo: ALL },
  { id: 'apple',         category: 'fruity', subcategory: 'tree-fruit', ko: '사과',     en: 'Apple',          appliesTo: WW_ONLY },
  { id: 'pear',          category: 'fruity', subcategory: 'tree-fruit', ko: '배',       en: 'Pear',           appliesTo: WW_ONLY },
  { id: 'peach',         category: 'fruity', subcategory: 'tree-fruit', ko: '복숭아',   en: 'Peach',          appliesTo: WW_ONLY },
  { id: 'apricot',       category: 'fruity', subcategory: 'tree-fruit', ko: '살구',     en: 'Apricot',        appliesTo: WW_ONLY },
  { id: 'strawberry',    category: 'fruity', subcategory: 'red-berry',  ko: '딸기',     en: 'Strawberry',     appliesTo: RW_ONLY },
  { id: 'raspberry',     category: 'fruity', subcategory: 'red-berry',  ko: '라즈베리', en: 'Raspberry',      appliesTo: RW_ONLY },
  { id: 'red-cherry',    category: 'fruity', subcategory: 'red-berry',  ko: '붉은체리', en: 'Red Cherry',     appliesTo: RW_ONLY },
  { id: 'cranberry',     category: 'fruity', subcategory: 'red-berry',  ko: '크랜베리', en: 'Cranberry',      appliesTo: RW_ONLY },
  { id: 'blackberry',    category: 'fruity', subcategory: 'black-berry', ko: '블랙베리', en: 'Blackberry',    appliesTo: RW_ONLY },
  { id: 'blueberry',     category: 'fruity', subcategory: 'black-berry', ko: '블루베리', en: 'Blueberry',     appliesTo: RW_ONLY },
  { id: 'black-cherry',  category: 'fruity', subcategory: 'black-berry', ko: '검은체리', en: 'Black Cherry',  appliesTo: RW_ONLY },
  { id: 'cassis',        category: 'fruity', subcategory: 'black-berry', ko: '카시스',  en: 'Cassis',         appliesTo: RW_ONLY },
  { id: 'pineapple',     category: 'fruity', subcategory: 'tropical',   ko: '파인애플', en: 'Pineapple',      appliesTo: WW_ONLY },
  { id: 'mango',         category: 'fruity', subcategory: 'tropical',   ko: '망고',     en: 'Mango',          appliesTo: WW_ONLY },
  { id: 'lychee',        category: 'fruity', subcategory: 'tropical',   ko: '리치',     en: 'Lychee',         appliesTo: WW_ONLY },
  { id: 'passion-fruit', category: 'fruity', subcategory: 'tropical',   ko: '패션프루트', en: 'Passion Fruit', appliesTo: WW_ONLY },
  { id: 'banana',        category: 'fruity', subcategory: 'tropical',   ko: '바나나',   en: 'Banana',         appliesTo: ALL },
  { id: 'raisin',        category: 'fruity', subcategory: 'dried-fruit', ko: '건포도',  en: 'Raisin',         appliesTo: ALL },
  { id: 'prune',         category: 'fruity', subcategory: 'dried-fruit', ko: '건자두',  en: 'Prune',          appliesTo: RW_ONLY },
  { id: 'fig',           category: 'fruity', subcategory: 'dried-fruit', ko: '말린무화과', en: 'Dried Fig',   appliesTo: ALL },

  // Floral
  { id: 'rose',          category: 'floral', subcategory: 'floral', ko: '장미',       en: 'Rose',         appliesTo: ALL },
  { id: 'violet',        category: 'floral', subcategory: 'floral', ko: '제비꽃',     en: 'Violet',       appliesTo: RW_ONLY },
  { id: 'orange-blossom', category: 'floral', subcategory: 'floral', ko: '오렌지블로섬', en: 'Orange Blossom', appliesTo: WW_ONLY },
  { id: 'honeysuckle',   category: 'floral', subcategory: 'floral', ko: '인동초',     en: 'Honeysuckle',  appliesTo: WW_ONLY },
  { id: 'acacia',        category: 'floral', subcategory: 'floral', ko: '아카시아',   en: 'Acacia',       appliesTo: WW_ONLY },
  { id: 'jasmine',       category: 'floral', subcategory: 'floral', ko: '자스민',     en: 'Jasmine',      appliesTo: WW_ONLY },
  { id: 'chamomile',     category: 'floral', subcategory: 'floral', ko: '카모마일',   en: 'Chamomile',    appliesTo: WW_ONLY },
  { id: 'lavender',      category: 'floral', subcategory: 'floral', ko: '라벤더',     en: 'Lavender',     appliesTo: ALL },

  // Spicy
  { id: 'black-pepper',  category: 'spicy', subcategory: 'pepper', ko: '흑후추',  en: 'Black Pepper',  appliesTo: RW_ONLY },
  { id: 'white-pepper',  category: 'spicy', subcategory: 'pepper', ko: '흰후추',  en: 'White Pepper',  appliesTo: WW_ONLY },
  { id: 'clove',         category: 'spicy', subcategory: 'sweet-spice', ko: '정향', en: 'Clove',     appliesTo: ALL },
  { id: 'cinnamon',      category: 'spicy', subcategory: 'sweet-spice', ko: '시나몬', en: 'Cinnamon', appliesTo: ALL },
  { id: 'star-anise',    category: 'spicy', subcategory: 'sweet-spice', ko: '팔각', en: 'Star Anise',  appliesTo: ALL },
  { id: 'licorice',      category: 'spicy', subcategory: 'sweet-spice', ko: '감초', en: 'Licorice',    appliesTo: RW_ONLY },
  { id: 'vanilla',       category: 'spicy', subcategory: 'sweet-spice', ko: '바닐라', en: 'Vanilla',  appliesTo: ALL },
  { id: 'nutmeg',        category: 'spicy', subcategory: 'sweet-spice', ko: '너트맥', en: 'Nutmeg',   appliesTo: ALL },

  // Herbaceous
  { id: 'grass',         category: 'herbaceous', subcategory: 'fresh', ko: '풀',       en: 'Cut Grass',    appliesTo: WW_ONLY },
  { id: 'bell-pepper',   category: 'herbaceous', subcategory: 'fresh', ko: '피망',     en: 'Bell Pepper',  appliesTo: ALL },
  { id: 'asparagus',     category: 'herbaceous', subcategory: 'fresh', ko: '아스파라거스', en: 'Asparagus', appliesTo: WW_ONLY },
  { id: 'mint',          category: 'herbaceous', subcategory: 'fresh', ko: '민트',     en: 'Mint',         appliesTo: ALL },
  { id: 'eucalyptus',    category: 'herbaceous', subcategory: 'fresh', ko: '유칼립투스', en: 'Eucalyptus',  appliesTo: RW_ONLY },
  { id: 'tomato-leaf',   category: 'herbaceous', subcategory: 'fresh', ko: '토마토잎', en: 'Tomato Leaf',  appliesTo: RW_ONLY },
  { id: 'tobacco',       category: 'herbaceous', subcategory: 'dried', ko: '담배잎',   en: 'Tobacco Leaf', appliesTo: RW_ONLY },
  { id: 'tea-leaf',      category: 'herbaceous', subcategory: 'dried', ko: '차잎',     en: 'Tea Leaf',     appliesTo: RW_ONLY },

  // Nutty
  { id: 'walnut',        category: 'nutty', subcategory: 'nutty', ko: '호두',     en: 'Walnut',     appliesTo: ALL },
  { id: 'hazelnut',      category: 'nutty', subcategory: 'nutty', ko: '헤이즐넛', en: 'Hazelnut',   appliesTo: ALL },
  { id: 'almond',        category: 'nutty', subcategory: 'nutty', ko: '아몬드',   en: 'Almond',     appliesTo: ALL },

  // Caramelized
  { id: 'caramel',       category: 'caramelized', subcategory: 'caramel', ko: '캐러멜',  en: 'Caramel',  appliesTo: ALL },
  { id: 'honey',         category: 'caramelized', subcategory: 'caramel', ko: '꿀',      en: 'Honey',    appliesTo: ALL },
  { id: 'molasses',      category: 'caramelized', subcategory: 'caramel', ko: '당밀',    en: 'Molasses', appliesTo: RW_ONLY },
  { id: 'dark-chocolate', category: 'caramelized', subcategory: 'chocolate', ko: '다크초콜릿', en: 'Dark Chocolate', appliesTo: RW_ONLY },
  { id: 'cocoa',         category: 'caramelized', subcategory: 'chocolate', ko: '코코아', en: 'Cocoa',   appliesTo: RW_ONLY },

  // Woody
  { id: 'toast',         category: 'woody', subcategory: 'burned', ko: '토스트',  en: 'Toast',  appliesTo: ALL },
  { id: 'smoke',         category: 'woody', subcategory: 'burned', ko: '훈연',    en: 'Smoke',  appliesTo: ALL },
  { id: 'coffee',        category: 'woody', subcategory: 'burned', ko: '커피',    en: 'Coffee', appliesTo: RW_ONLY },
  { id: 'mocha',         category: 'woody', subcategory: 'burned', ko: '모카',    en: 'Mocha',  appliesTo: RW_ONLY },
  { id: 'cedar',         category: 'woody', subcategory: 'oak',    ko: '시더',    en: 'Cedar',  appliesTo: RW_ONLY },
  { id: 'oak',           category: 'woody', subcategory: 'oak',    ko: '오크',    en: 'Oak',    appliesTo: ALL },
  { id: 'coconut',       category: 'woody', subcategory: 'oak',    ko: '코코넛',  en: 'Coconut', appliesTo: ALL },
  { id: 'dill',          category: 'woody', subcategory: 'oak',    ko: '딜',      en: 'Dill',   appliesTo: RW_ONLY },
  { id: 'sandalwood',    category: 'woody', subcategory: 'oak',    ko: '백단향',  en: 'Sandalwood', appliesTo: RW_ONLY },
  { id: 'pencil-lead',   category: 'woody', subcategory: 'oak',    ko: '연필심',  en: 'Pencil Lead', appliesTo: RW_ONLY },

  // Earthy
  { id: 'forest-floor',  category: 'earthy', subcategory: 'earthy', ko: '숲바닥',  en: 'Forest Floor', appliesTo: RW_ONLY },
  { id: 'damp-earth',    category: 'earthy', subcategory: 'earthy', ko: '젖은흙',  en: 'Damp Earth',   appliesTo: RW_ONLY },
  { id: 'truffle',       category: 'earthy', subcategory: 'earthy', ko: '트러플',  en: 'Truffle',      appliesTo: RW_ONLY },
  { id: 'mushroom',      category: 'earthy', subcategory: 'earthy', ko: '버섯',    en: 'Mushroom',     appliesTo: RW_ONLY },
  { id: 'leather',       category: 'earthy', subcategory: 'earthy', ko: '가죽',    en: 'Leather',      appliesTo: RW_ONLY },
  { id: 'tar',           category: 'earthy', subcategory: 'earthy', ko: '타르',    en: 'Tar',          appliesTo: RW_ONLY },
  { id: 'wet-stone',     category: 'earthy', subcategory: 'mineral', ko: '젖은돌', en: 'Wet Stone',    appliesTo: WW_ONLY },
  { id: 'flint',         category: 'earthy', subcategory: 'mineral', ko: '부싯돌', en: 'Flint',        appliesTo: WW_ONLY },
  { id: 'chalk',         category: 'earthy', subcategory: 'mineral', ko: '백악',   en: 'Chalk',        appliesTo: WW_ONLY },
  { id: 'saline',        category: 'earthy', subcategory: 'mineral', ko: '짠맛',   en: 'Saline',       appliesTo: WW_ONLY },
  { id: 'oyster-shell',  category: 'earthy', subcategory: 'mineral', ko: '굴껍질', en: 'Oyster Shell', appliesTo: WW_ONLY },
  { id: 'graphite',      category: 'earthy', subcategory: 'mineral', ko: '흑연',   en: 'Graphite',     appliesTo: RW_ONLY },

  // Chemical
  { id: 'petrol',        category: 'chemical', subcategory: 'petroleum', ko: '휘발유',  en: 'Petrol',   appliesTo: WW_ONLY },
  { id: 'kerosene',      category: 'chemical', subcategory: 'petroleum', ko: '등유',    en: 'Kerosene', appliesTo: WW_ONLY },

  // Pungent
  { id: 'alcohol-heat',  category: 'pungent', subcategory: 'hot',  ko: '알코올열감', en: 'Alcoholic Heat', appliesTo: ALL },
  { id: 'menthol',       category: 'pungent', subcategory: 'cool', ko: '멘톨',     en: 'Menthol',     appliesTo: RW_ONLY },

  // Oxidized
  { id: 'sherry',        category: 'oxidized', subcategory: 'oxidized', ko: '셰리',     en: 'Sherry',       appliesTo: ALL },
  { id: 'bruised-apple', category: 'oxidized', subcategory: 'oxidized', ko: '멍든사과', en: 'Bruised Apple', appliesTo: WW_ONLY },
  { id: 'rancio',        category: 'oxidized', subcategory: 'oxidized', ko: '랑시오',   en: 'Rancio',       appliesTo: ALL },

  // Microbiological
  { id: 'yeast',         category: 'microbiological', subcategory: 'yeasty', ko: '효모',     en: 'Yeast',        appliesTo: WW_ONLY },
  { id: 'bread-dough',   category: 'microbiological', subcategory: 'yeasty', ko: '빵반죽',   en: 'Bread Dough',  appliesTo: WW_ONLY },
  { id: 'brioche',       category: 'microbiological', subcategory: 'yeasty', ko: '브리오슈', en: 'Brioche',      appliesTo: WW_ONLY },
  { id: 'butter',        category: 'microbiological', subcategory: 'lactic', ko: '버터',     en: 'Butter',       appliesTo: WW_ONLY },
  { id: 'yogurt',        category: 'microbiological', subcategory: 'lactic', ko: '요거트',   en: 'Yogurt',       appliesTo: WW_ONLY },
  { id: 'cream',         category: 'microbiological', subcategory: 'lactic', ko: '크림',     en: 'Cream',        appliesTo: WW_ONLY },
] as const;

export const LEX_BY_ID: Record<string, LexEntry> = AROMA_LEXICON.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<string, LexEntry>,
);

// ── Faults ──────────────────────────────────────────────────────────────────

export interface FaultEntry {
  id: Fault;
  ko: string;
  en: string;
  cause: string;
  threshold: string;
  aroma: string;
}

export const FAULTS: readonly FaultEntry[] = [
  { id: 'corked',          ko: '코르크 오염 (Bouchonné)', en: 'Cork Taint',         cause: 'TCA (2,4,6-Trichloroanisole)',          threshold: '~1.5 ng/L',  aroma: '젖은 골판지·곰팡이·젖은 신문지. 과일 향이 죽음' },
  { id: 'brett',           ko: '브렛 (Brettanomyces)',    en: 'Brett',              cause: '4-에틸페놀 / 4-에틸과이아콜',           threshold: '4-EP ~600 µg/L', aroma: '마구간·말 안장·반창고·훈제 베이컨' },
  { id: 'volatileAcidity', ko: '휘발산 (VA)',             en: 'Volatile Acidity',   cause: 'Acetobacter / 야생효모로 아세트산 생성', threshold: '~0.7 g/L',   aroma: '식초·매니큐어·아세톤' },
  { id: 'reduction',       ko: '환원취 (Reduction)',      en: 'Reduction',          cause: '산소 부족으로 H₂S, 메르캅탄 등',         threshold: 'H₂S ~1 µg/L', aroma: '썩은 달걀·양배추·고무·성냥. 산소 노출로 사라짐' },
  { id: 'oxidation',       ko: '산화 (Oxidation)',        en: 'Oxidation',          cause: '과도한 산소 노출',                       threshold: 'Acetaldehyde ~125 mg/L', aroma: '멍든 사과·셰리·캐러멜·견과류. 갈색 변색' },
  { id: 'heat',            ko: '열변성 (Maderization)',   en: 'Heat Damage',        cause: '고온 보관 (>30°C)',                      threshold: '—',          aroma: '익힌 과일·캐러멜' },
  { id: 'mercaptan',       ko: '머캅탄 (Mercaptans)',     en: 'Mercaptans',         cause: '환원 환경에서 황 화합물 발달',           threshold: '—',          aroma: '스컹크·마늘·양파 (고농도)' },
  { id: 'lightstruck',     ko: '라이트 스트럭',           en: 'Lightstruck',        cause: 'UV 노출로 메티오닌 분해',                threshold: '—',          aroma: '양배추·젖은 양털·삶은 채소' },
  { id: 'geranium',        ko: '제라늄 이취',             en: 'Geranium Off-note',  cause: '소르브산이 락트산균에 의해 분해',        threshold: '—',          aroma: '으깬 제라늄 잎' },
  { id: 'mousy',           ko: '쥐냄새 (Mousy)',          en: 'Mousiness',          cause: '락트산균/Brett의 N-헤테로사이클릭 화합물', threshold: '—',          aroma: '쥐장·따뜻한 우유 (입안 후각)' },
  { id: 'cork',            ko: '코르크 결함 (일반)',      en: 'Cork Defect',        cause: '코르크 자체의 부서짐·누수',              threshold: '—',          aroma: '병별 편차 — TCA 외 기타 코르크 유래 결함' },
];

// ── Opening guide ───────────────────────────────────────────────────────────

export interface OpeningGuideEntry {
  id: string;
  ko: string;
  en: string;
  examples: string[];
  recommendedMinutes: { min: number; peak: number; max: number };
  rationale: string;
}

export const OPENING_GUIDE: readonly OpeningGuideEntry[] = [
  { id: 'young-full-red',   ko: '영 풀바디 레드',         en: 'Young Full-bodied Red',   examples: ['Cabernet Sauvignon', 'Barolo', 'Brunello'], recommendedMinutes: { min: 60, peak: 120, max: 180 }, rationale: '단단한 타닌 + 닫힌 과일감. 1~3시간 권장.' },
  { id: 'young-medium-red', ko: '영 미디엄바디 레드',     en: 'Young Medium-bodied Red', examples: ['Merlot', 'Tempranillo', 'Chianti'], recommendedMinutes: { min: 30, peak: 45, max: 60 }, rationale: '타닌이 적당히 풀려 30~60분이면 충분.' },
  { id: 'young-light-red',  ko: '영 라이트바디 레드',     en: 'Young Light-bodied Red',  examples: ['Pinot Noir', 'Gamay'], recommendedMinutes: { min: 15, peak: 20, max: 30 }, rationale: '잔 안에서 15~30분.' },
  { id: 'aged-red-10-20',   ko: '숙성 레드 (10~20년)',     en: 'Aged Red (10-20 years)',  examples: ['숙성 Bordeaux', '숙성 Rioja Gran Reserva'], recommendedMinutes: { min: 20, peak: 30, max: 45 }, rationale: '침전물 제거가 주 목적. 짧게 디캔팅.' },
  { id: 'very-old-red',     ko: '매우 오래된 레드 (35년+)', en: 'Very Old Red (35+ years)', examples: ['1990 이전 Bordeaux'], recommendedMinutes: { min: 0, peak: 5, max: 15 }, rationale: '코르크 풀고 즉시 음용.' },
  { id: 'vintage-port',     ko: '빈티지 포트',             en: 'Vintage Port',            examples: ['Vintage Port'], recommendedMinutes: { min: 120, peak: 180, max: 240 }, rationale: '2~4시간 디캔팅 가능.' },
  { id: 'young-full-white', ko: '영 풀바디 화이트',        en: 'Young Full-bodied White', examples: ['오크 Chardonnay'], recommendedMinutes: { min: 15, peak: 25, max: 45 }, rationale: '오크 위에 묻힌 과일감을 풀어주려면 짧게.' },
  { id: 'aromatic-white',   ko: '아로마틱 화이트',         en: 'Aromatic / Standard White', examples: ['Riesling', 'Sauvignon Blanc'], recommendedMinutes: { min: 0, peak: 5, max: 15 }, rationale: '디캔팅 비권장. 즉시 음용.' },
  { id: 'sparkling',        ko: '스파클링',                en: 'Sparkling',               examples: ['Champagne', 'Cava'], recommendedMinutes: { min: 0, peak: 0, max: 10 }, rationale: '디캔팅 절대 금지. 잔에 따라 즉시.' },
];

export function matchOpeningGuide(meta: {
  variant: FormVariant;
  vintage: number | null;
  grapeVarieties: string[];
  region: string;
}): OpeningGuideEntry | null {
  const now = new Date().getFullYear();
  const age = meta.vintage ? now - meta.vintage : 0;
  const grapes = meta.grapeVarieties.join(' ').toLowerCase();
  const region = meta.region.toLowerCase();

  if (meta.variant === 'sparkling') return OPENING_GUIDE.find(g => g.id === 'sparkling') ?? null;
  if (region.includes('port')) return OPENING_GUIDE.find(g => g.id === 'vintage-port') ?? null;
  if (age >= 35) return OPENING_GUIDE.find(g => g.id === 'very-old-red') ?? null;
  if (age >= 10 && age <= 20 && (grapes.includes('cabernet') || grapes.includes('tempranillo') || grapes.includes('sangiovese') || grapes.includes('nebbiolo'))) {
    return OPENING_GUIDE.find(g => g.id === 'aged-red-10-20') ?? null;
  }
  if (meta.variant === 'red' || meta.variant === 'blind') {
    if (grapes.includes('pinot noir') || grapes.includes('gamay')) return OPENING_GUIDE.find(g => g.id === 'young-light-red') ?? null;
    if (grapes.includes('cabernet') || grapes.includes('syrah') || grapes.includes('shiraz') || grapes.includes('nebbiolo') || grapes.includes('brunello')) {
      return OPENING_GUIDE.find(g => g.id === 'young-full-red') ?? null;
    }
    return OPENING_GUIDE.find(g => g.id === 'young-medium-red') ?? null;
  }
  if (meta.variant === 'white') {
    if (grapes.includes('chardonnay') || region.includes('hermitage') || region.includes('montrachet')) {
      return OPENING_GUIDE.find(g => g.id === 'young-full-white') ?? null;
    }
    return OPENING_GUIDE.find(g => g.id === 'aromatic-white') ?? null;
  }
  return null;
}

// ── Timepoint presets ───────────────────────────────────────────────────────

export interface TimepointPreset {
  minutes: number;
  label: string;
}

export const TIMEPOINT_PRESETS: readonly TimepointPreset[] = [
  { minutes: 0,   label: 'T0' },
  { minutes: 15,  label: '15분' },
  { minutes: 30,  label: '30분' },
  { minutes: 60,  label: '1시간' },
  { minutes: 120, label: '2시간' },
  { minutes: 180, label: '3시간' },
  { minutes: 240, label: '4시간' },
  { minutes: 360, label: '6시간+' },
];

export interface EvolutionPoint {
  minutesAfterOpen: number;
  label: string;
  aromaIntensityDelta: Delta;
  tanninSoftnessDelta: Delta;
  bodyDelta: Delta;
  reductionPresent: boolean;
  newAromasEmerged: string[];
  overallScore: 1 | 2 | 3 | 4 | 5;
  note: string;
}

// ── Caudalies ──────────────────────────────────────────────────────────────

export function caudalieCategory(c: number): FinishLength {
  if (c < 3)  return 'short';
  if (c < 5)  return 'medium';
  if (c < 10) return 'long';
  return 'veryLong';
}

export function caudalieComparison(c: number, locale: Locale = 'ko'): string {
  if (locale === 'en') {
    if (c >= 10) return 'Vintage Champagne, Romanée-Conti';
    if (c >= 8)  return 'Bordeaux Grand Cru Classé level';
    if (c >= 5)  return 'Aged Burgundy Pinot Noir';
    if (c >= 3)  return 'Young Loire Sauvignon Blanc';
    return 'Beaujolais Nouveau, light Muscadet';
  }
  if (c >= 10) return '빈티지 샴페인, Romanée-Conti';
  if (c >= 8)  return 'Bordeaux Grand Cru Classé 수준';
  if (c >= 5)  return '잘 익은 부르고뉴 피노 누아';
  if (c >= 3)  return '영 루아르 소비뇽 블랑';
  return '보졸레 누보, 가벼운 무스카데';
}

// ── Tannin texture groups ──────────────────────────────────────────────────

export const TEXTURE_SOFT:   readonly TanninTexture[] = ['silky', 'velvety', 'smooth', 'plush', 'soft', 'round'];
export const TEXTURE_FINE:   readonly TanninTexture[] = ['fineGrained', 'polished', 'powdery', 'dusty', 'chalky'];
export const TEXTURE_GRIPPY: readonly TanninTexture[] = ['grainy', 'grippy', 'firm', 'chewy'];
export const TEXTURE_HARSH:  readonly TanninTexture[] = ['coarse', 'rough', 'harsh', 'astringent', 'drying', 'aggressive'];

export type TanninTextureGroup = 'soft' | 'fine' | 'grippy' | 'harsh';

export const TANNIN_TEXTURE_GROUP_LABELS: Record<TanninTextureGroup, { ko: string; en: string }> = {
  soft:   { ko: '부드러운 계열',  en: 'Soft' },
  fine:   { ko: '미세한 계열',    en: 'Fine' },
  grippy: { ko: '잡히는 계열',    en: 'Grippy' },
  harsh:  { ko: '거친 계열',      en: 'Harsh' },
};

export const TANNIN_TEXTURE_LABELS: Record<TanninTexture, { ko: string; en: string }> = {
  silky:       { ko: '실키',     en: 'Silky' },
  velvety:     { ko: '벨벳',     en: 'Velvety' },
  smooth:      { ko: '매끄러움', en: 'Smooth' },
  plush:       { ko: '풍성함',   en: 'Plush' },
  soft:        { ko: '부드러움', en: 'Soft' },
  round:       { ko: '둥근',     en: 'Round' },
  fineGrained: { ko: '고운 입자', en: 'Fine-grained' },
  polished:    { ko: '광택',     en: 'Polished' },
  powdery:     { ko: '파우더',   en: 'Powdery' },
  dusty:       { ko: '먼지',     en: 'Dusty' },
  chalky:      { ko: '백악질',   en: 'Chalky' },
  grainy:      { ko: '거친 입자', en: 'Grainy' },
  grippy:      { ko: '잡힘',     en: 'Grippy' },
  firm:        { ko: '단단함',   en: 'Firm' },
  chewy:       { ko: '씹힘',     en: 'Chewy' },
  coarse:      { ko: '거칢',     en: 'Coarse' },
  rough:       { ko: '거친',     en: 'Rough' },
  harsh:       { ko: '날카로움', en: 'Harsh' },
  astringent:  { ko: '수렴성',   en: 'Astringent' },
  drying:      { ko: '입 마름',  en: 'Drying' },
  aggressive:  { ko: '공격적',   en: 'Aggressive' },
};

// ── Labels for WSET-graded dimensions ──────────────────────────────────────

export const SWEETNESS_LABELS: Record<WSETScale, { ko: string; en: string }> = {
  low:         { ko: '본 드라이',   en: 'Bone Dry' },
  mediumMinus: { ko: '드라이',     en: 'Dry' },
  medium:      { ko: '오프 드라이', en: 'Off-Dry' },
  mediumPlus:  { ko: '미디엄',     en: 'Medium' },
  high:        { ko: '스위트',     en: 'Sweet' },
};

export const ACIDITY_LABELS: Record<WSETScale, { ko: string; en: string }> = {
  low:         { ko: '부드러움',   en: 'Soft' },
  mediumMinus: { ko: '약간 낮음', en: 'Medium−' },
  medium:      { ko: '중간',     en: 'Medium' },
  mediumPlus:  { ko: '쨍함',     en: 'Crisp' },
  high:        { ko: '톡 쏨',     en: 'Racy' },
};

export const BODY_LABELS: Record<WSETScale, { ko: string; en: string }> = {
  low:         { ko: '가벼움',     en: 'Light' },
  mediumMinus: { ko: '약간 가벼움', en: 'Medium−' },
  medium:      { ko: '중간',       en: 'Medium' },
  mediumPlus:  { ko: '약간 묵직',   en: 'Medium+' },
  high:        { ko: '풀바디',     en: 'Full' },
};

export const ALCOHOL_LABELS: Record<WSETScale, { ko: string; en: string }> = {
  low:         { ko: '낮음 (<11%)',         en: 'Low (<11%)' },
  mediumMinus: { ko: '약간 낮음 (11–12.5%)', en: 'Medium− (11–12.5%)' },
  medium:      { ko: '중간 (12.5–13.5%)',   en: 'Medium (12.5–13.5%)' },
  mediumPlus:  { ko: '약간 높음 (13.5–14%)', en: 'Medium+ (13.5–14%)' },
  high:        { ko: '높음 (>14%)',         en: 'High (>14%)' },
};

export const TANNIN_INTENSITY_LABELS: Record<WSETScale, { ko: string; en: string }> = {
  low:         { ko: '부드러움',   en: 'Soft' },
  mediumMinus: { ko: '약간 약함', en: 'Medium−' },
  medium:      { ko: '중간',     en: 'Medium' },
  mediumPlus:  { ko: '단단함',   en: 'Firm' },
  high:        { ko: '강함',     en: 'Aggressive' },
};

export const INTENSITY_LABELS: Record<WSETScale, { ko: string; en: string }> = {
  low:         { ko: '닫힘',   en: 'Closed' },
  mediumMinus: { ko: '은은함', en: 'Subtle' },
  medium:      { ko: '중간',   en: 'Medium' },
  mediumPlus:  { ko: '뚜렷함', en: 'Pronounced' },
  high:        { ko: '폭발적', en: 'Explosive' },
};

// ── Sparkling ──────────────────────────────────────────────────────────────

export const DOSAGE_LABELS: Record<SparklingDosage, { ko: string; en: string; range: string }> = {
  brutNature: { ko: 'Brut Nature', en: 'Brut Nature', range: '< 3 g/L' },
  extraBrut:  { ko: 'Extra Brut',  en: 'Extra Brut',  range: '0–6 g/L' },
  brut:       { ko: 'Brut',        en: 'Brut',        range: '< 12 g/L' },
  extraDry:   { ko: 'Extra Dry',   en: 'Extra Dry',   range: '12–17 g/L' },
  sec:        { ko: 'Sec',         en: 'Sec',         range: '17–32 g/L' },
  demiSec:    { ko: 'Demi-Sec',    en: 'Demi-Sec',    range: '32–50 g/L' },
  doux:       { ko: 'Doux',        en: 'Doux',        range: '> 50 g/L' },
};

export const SPARKLING_METHOD_LABELS: Record<SparklingMethod, { ko: string; en: string }> = {
  traditional: { ko: 'Méthode Traditionnelle', en: 'Méthode Traditionnelle' },
  charmat:     { ko: 'Charmat (Tank)',         en: 'Charmat (Tank)' },
  asti:        { ko: 'Asti Method',            en: 'Asti Method' },
  ancestral:   { ko: 'Ancestral (Pét-Nat)',    en: 'Ancestral (Pét-Nat)' },
  unknown:     { ko: '미상',                    en: 'Unknown' },
};

// ── Auto description templates ─────────────────────────────────────────────

export const DESCRIPTION_TEMPLATES = {
  ko: {
    intro: '{vintage}년 {region} {producer}의 {wineName}.',
    introNV: '{producer}의 {wineName} (NV).',
    aroma: '{intensity} 향에 {primary} 노트가 도드라지고, {secondary}가 뒤를 받칩니다.',
    palate: '입안에서는 {body} 바디에 {acidity} 산도, {sweetness} 단맛이 어우러집니다.',
    redTannin: '타닌은 {tanninIntensity}하게 짜여 {tanninTexture} 인상을 남깁니다.',
    finish: '{caudalies} 카우달리({finishLength})의 피니시. {finishQuality} 마무리.',
    finishNoCaudalie: '{finishLength}의 피니시. {finishQuality} 마무리.',
    evolution: '{peakLabel} 시점에서 {firstChange} {newAromas}이(가) 풀려나며, 정점에 도달합니다.',
    rating: '{rating}/5.',
    placeholder: '슬라이더를 만져보면 묘사가 시작됩니다.',
  },
  en: {
    intro: "{vintage} {region} {producer}'s {wineName}.",
    introNV: "{producer}'s {wineName} (NV).",
    aroma: '{intensity} nose with {primary}, backed by {secondary}.',
    palate: 'On the palate, {body} body meets {acidity} acidity and {sweetness} sweetness.',
    redTannin: 'Tannins are {tanninIntensity} with a {tanninTexture} grain.',
    finish: '{caudalies} caudalies ({finishLength}). {finishQuality} finish.',
    finishNoCaudalie: '{finishLength} finish. {finishQuality}.',
    evolution: 'At {peakLabel}, {firstChange} {newAromas} emerge, hitting the peak.',
    rating: '{rating}/5.',
    placeholder: 'Move a slider to start describing.',
  },
} as const;

export const WSET_LABELS_KO: Record<WSETScale, string> = {
  low: '낮음', mediumMinus: '중간−', medium: '중간', mediumPlus: '중간+', high: '높음',
};
export const WSET_LABELS_EN: Record<WSETScale, string> = {
  low: 'Low', mediumMinus: 'Medium−', medium: 'Medium', mediumPlus: 'Medium+', high: 'High',
};
