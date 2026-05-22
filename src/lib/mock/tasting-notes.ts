/**
 * Tasting notes — 47 entries (heavy user demo, 처음 47개만 포팅).
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/tasting-notes.ts — note_001 ~ note_047.
 * (LWIN-EXPANSION 048~065는 일부 매핑되는 mock wine 없어 생략 — fallback LWIN 사용 가능하지만
 *  통계 기여가 작아 시간 절약상 skip.)
 *
 * shape: Database['public']['Tables']['tasting_notes']['Row'] 동등.
 *
 * 변환 규칙:
 *   - `wineId` (slug) → `wine_lwin`: SLUG_TO_LWIN 매핑. 매핑 없는 slug 는 fallback Margaux.
 *   - `userId` → `user_id` = DEMO_USER_ID.
 *   - `mode`: 'expert' | 'beginner' 그대로.
 *   - `beginnerFields` → `beginner_fields` (Json).
 *   - `expertFields` → `expert_fields` (Json).
 *   - `rating`: keyscreen expert 0~100, beginner 0~5. RN tasting_notes.rating CHECK: 0~5 half-step.
 *     → expert는 round(rating / 20 * 2) / 2 로 변환 (예: 92 → 4.5).
 *     → beginner는 그대로 (이미 0~5).
 *   - `tastedAt` → `tasted_at` (YYYY-MM-DD).
 *   - `source`: 'cellar' → 'cellar', 'newEntry' → 'newEntry' (스키마 상 enum 없으므로 그대로).
 *   - `photoUrl` → `photo_url` (대부분 null).
 *   - `priceKrw`: schema에 컬럼 없음 — drop.
 *   - `cellarItemId`: schema에 컬럼 없음 — drop.
 *   - `isPublic` / `createdAt`: schema 단순 — created_at만 보존.
 *
 * v0.1.0 DEMO_MODE 활성 시 useRecentNotes() / useNote() / useMyNoteForWine() 에서 사용.
 */
import type { Database } from '@shared/types/database.types';
import { DEMO_USER_ID } from '@/lib/demo-mode';
import { SLUG_TO_LWIN, FALLBACK_LWIN } from './wines';

export type TastingNoteRow = Database['public']['Tables']['tasting_notes']['Row'];

function slugToLwin(slug: string): string {
  return SLUG_TO_LWIN[slug] ?? FALLBACK_LWIN;
}

/** expert rating 0~100 → DB half-step 0~5 변환. */
function expertRatingToDb(score: number): number {
  const half = Math.round((score / 20) * 2) / 2;
  if (half < 0) return 0;
  if (half > 5) return 5;
  return half;
}

type ExpertSeed = {
  id: string;
  slug: string;
  source: 'cellar' | 'newEntry';
  tastedAt: string;
  rating100: number;
  aromas: { categoryId: string; terms: string[] }[];
  caudalies: number;
  servingTemp?: number;
  body?: string;
  tannin?: string;
  acidity?: string;
  finishLength?: string;
  intensity?: string;
  peakEstimateYear?: number;
  memoKo: string;
  memoEn: string;
};

type BeginnerSeed = {
  id: string;
  slug: string;
  tastedAt: string;
  impression: 'love' | 'good' | 'okay' | 'meh' | 'dislike';
  rating: number;
  aromas: string[];
  sweetness?: number;
  acidity?: number;
  body?: number;
  tannin?: number;
  finish?: string;
  memoKo: string;
  memoEn: string;
};

function expRow(s: ExpertSeed): TastingNoteRow {
  const expert_fields = {
    sweetness: 'low',
    acidity: s.acidity ?? 'mediumPlus',
    body: s.body ?? 'mediumPlus',
    alcohol: 'medium',
    tannin: s.tannin ?? 'medium',
    tanninTexture: 'silky',
    tanninRipeness: null,
    intensity: s.intensity ?? 'mediumPlus',
    flavorIntensity: s.intensity ?? 'mediumPlus',
    finishLength: s.finishLength ?? 'long',
    aromaWheel: s.aromas,
    faults: [],
    caudalies: s.caudalies,
    rating: s.rating100,
    memo: { ko: s.memoKo, en: s.memoEn },
    flavorNotes: { ko: '', en: '' },
    wouldBuyAgain: null,
    bubbles: null,
    dosage: null,
    servingTempCelsius: s.servingTemp ?? 17,
    peakEstimateYear: s.peakEstimateYear ?? null,
    peakEstimateConfidence: s.peakEstimateYear ? 'medium' : null,
    peakEstimateNote: null,
  };

  return {
    id: s.id,
    user_id: DEMO_USER_ID,
    wine_lwin: slugToLwin(s.slug),
    mode: 'expert',
    rating: expertRatingToDb(s.rating100),
    beginner_fields: null,
    expert_fields: expert_fields as unknown as Database['public']['Tables']['tasting_notes']['Row']['expert_fields'],
    photo_url: null,
    source: s.source,
    location_text: null,
    tasted_at: s.tastedAt,
    created_at: `${s.tastedAt}T00:00:00.000Z`,
    updated_at: `${s.tastedAt}T00:00:00.000Z`,
  };
}

function begRow(s: BeginnerSeed): TastingNoteRow {
  const beginner_fields = {
    impression: s.impression,
    sweetness: s.sweetness ?? 2,
    acidity: s.acidity ?? 4,
    body: s.body ?? 3,
    tannin: s.tannin ?? 3,
    aromas: s.aromas,
    finish: s.finish ?? 'medium',
    rating: s.rating,
    memo: { ko: s.memoKo, en: s.memoEn },
  };

  return {
    id: s.id,
    user_id: DEMO_USER_ID,
    wine_lwin: slugToLwin(s.slug),
    mode: 'beginner',
    rating: s.rating,
    beginner_fields: beginner_fields as unknown as Database['public']['Tables']['tasting_notes']['Row']['beginner_fields'],
    expert_fields: null,
    photo_url: null,
    source: 'newEntry',
    location_text: null,
    tasted_at: s.tastedAt,
    created_at: `${s.tastedAt}T00:00:00.000Z`,
    updated_at: `${s.tastedAt}T00:00:00.000Z`,
  };
}

/* eslint-disable max-lines */
export const MOCK_TASTING_NOTES: TastingNoteRow[] = [
  /* 2025-09 */
  expRow({ id: 'note_001', slug: 'bdx-margaux', source: 'newEntry', tastedAt: '2025-09-14', rating100: 92, aromas: [{ categoryId: 'fruity', terms: ['cassis', 'black-cherry'] }, { categoryId: 'woody', terms: ['cedar', 'pencil-lead'] }, { categoryId: 'earthy', terms: ['graphite', 'tobacco'] }], caudalies: 14, body: 'high', tannin: 'high', acidity: 'mediumPlus', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2033, memoKo: '여전히 어리지만 향만으로도 압도된다. 시더와 흑연이 길게 깔린다.', memoEn: 'Still young, but the nose alone overwhelms. Cedar and graphite lay long.' }),
  begRow({ id: 'note_002', slug: 'tus-chianti-classico', tastedAt: '2025-09-20', impression: 'good', rating: 4, aromas: ['red-cherry', 'tomato-leaf'], memoKo: '식사와 가볍게. 체리와 토마토잎이 단정하게 깔린다.', memoEn: 'Casual dinner pairing. Cherry and tomato leaf sit tidy.' }),
  begRow({ id: 'note_003', slug: 'rioja', tastedAt: '2025-09-27', impression: 'good', rating: 4, aromas: ['red-cherry', 'vanilla', 'leather'], body: 4, memoKo: '리오하 입문. 미국 오크의 바닐라가 친근하다.', memoEn: 'A Rioja entry. The American-oak vanilla is friendly.' }),

  /* 2025-10 */
  expRow({ id: 'note_004', slug: 'tus-brunello-biondi-santi', source: 'newEntry', tastedAt: '2025-10-05', rating100: 95, aromas: [{ categoryId: 'fruity', terms: ['red-cherry'] }, { categoryId: 'earthy', terms: ['leather', 'forest-floor', 'tar'] }, { categoryId: 'herbaceous', terms: ['tobacco'] }], caudalies: 16, body: 'high', tannin: 'high', acidity: 'high', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2038, memoKo: '산지오베제의 정점. 가죽과 타르가 천천히 펼쳐진다. 디캔팅 90분 권장.', memoEn: 'The pinnacle of Sangiovese. Leather and tar unfold slowly. Decant 90 min.' }),
  expRow({ id: 'note_005', slug: 'pie-barbaresco', source: 'newEntry', tastedAt: '2025-10-12', rating100: 93, aromas: [{ categoryId: 'fruity', terms: ['red-cherry'] }, { categoryId: 'floral', terms: ['rose'] }, { categoryId: 'earthy', terms: ['tar', 'truffle', 'leather'] }], caudalies: 13, body: 'mediumPlus', tannin: 'high', acidity: 'high', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2032, memoKo: '바롤로보다 향기롭다. 장미와 트러플의 삼각 균형.', memoEn: 'More perfumed than Barolo. The triangular balance of rose and truffle.' }),
  begRow({ id: 'note_006', slug: 'pie-barbera-asti', tastedAt: '2025-10-19', impression: 'good', rating: 4, aromas: ['red-cherry', 'blackberry'], acidity: 5, body: 3, memoKo: '산미가 활기차다. 토마토 파스타와 좋았다.', memoEn: 'Vibrant acidity. Paired well with tomato pasta.' }),
  begRow({ id: 'note_007', slug: 'casillero', tastedAt: '2025-10-23', impression: 'okay', rating: 3, aromas: ['cassis', 'vanilla'], body: 4, memoKo: '가격대비 무난하다. 평일 저녁의 안정감.', memoEn: 'Decent for the price. The reliability of a weeknight glass.' }),
  begRow({ id: 'note_008', slug: 'bdx-margaux', tastedAt: '2025-10-26', impression: 'good', rating: 5, aromas: ['cassis', 'cedar', 'graphite'], body: 5, tannin: 5, memoKo: '두 번째 마고. 디캔팅 2시간 후 향이 깨어났다.', memoEn: 'My second Margaux. The nose woke up after 2 hours of decanting.' }),
  expRow({ id: 'note_009', slug: 'rhn-cote-rotie', source: 'newEntry', tastedAt: '2025-10-30', rating100: 91, aromas: [{ categoryId: 'spicy', terms: ['black-pepper'] }, { categoryId: 'floral', terms: ['violet'] }, { categoryId: 'fruity', terms: ['black-cherry'] }, { categoryId: 'earthy', terms: ['leather'] }], caudalies: 12, body: 'mediumPlus', tannin: 'mediumPlus', finishLength: 'long', peakEstimateYear: 2030, memoKo: '북부 론 시라의 흑후추가 길게 이어진다.', memoEn: 'Northern Rhône Syrah pepper carries long.' }),

  /* 2025-11 */
  expRow({ id: 'note_010', slug: 'bgy-gevrey-chambertin', source: 'newEntry', tastedAt: '2025-11-03', rating100: 90, aromas: [{ categoryId: 'fruity', terms: ['black-cherry'] }, { categoryId: 'earthy', terms: ['forest-floor', 'leather'] }, { categoryId: 'floral', terms: ['violet'] }], caudalies: 11, body: 'mediumPlus', tannin: 'mediumPlus', finishLength: 'long', memoKo: '쥬브레의 남성성. 검은 체리와 숲바닥이 두텁게 깔린다.', memoEn: 'The masculine edge of Gevrey. Black cherry and forest floor lay thick.' }),
  expRow({ id: 'note_011', slug: 'bgy-puligny-montrachet', source: 'newEntry', tastedAt: '2025-11-08', rating100: 91, aromas: [{ categoryId: 'nutty', terms: ['hazelnut'] }, { categoryId: 'microbiological', terms: ['butter'] }, { categoryId: 'fruity', terms: ['apple'] }, { categoryId: 'earthy', terms: ['wet-stone'] }], caudalies: 10, body: 'mediumPlus', acidity: 'mediumPlus', finishLength: 'long', servingTemp: 11, memoKo: '뫼르소의 풍성한 텍스처. 헤이즐넛과 버터의 부드러움.', memoEn: "Meursault's plush texture. The softness of hazelnut and butter." }),
  begRow({ id: 'note_012', slug: 'loi-sancerre', tastedAt: '2025-11-12', impression: 'good', rating: 4, aromas: ['grapefruit', 'grass', 'flint'], acidity: 5, body: 2, memoKo: '청량한 자몽과 부싯돌. 굴 요리에 완벽했다.', memoEn: 'Crisp grapefruit and flint. Perfect with oysters.' }),
  begRow({ id: 'note_013', slug: 'ven-prosecco', tastedAt: '2025-11-16', impression: 'good', rating: 4, aromas: ['apple', 'pear', 'acacia'], finish: 'short', body: 2, memoKo: '가볍게 시작하는 저녁. 사과와 인동초의 산뜻함.', memoEn: 'A light dinner opener. The lift of apple and honeysuckle.' }),
  expRow({ id: 'note_014', slug: 'cha-krug-grande-cuvee', source: 'newEntry', tastedAt: '2025-11-22', rating100: 96, aromas: [{ categoryId: 'microbiological', terms: ['brioche', 'yeast', 'bread-dough'] }, { categoryId: 'fruity', terms: ['apple', 'lemon'] }, { categoryId: 'nutty', terms: ['hazelnut'] }], caudalies: 15, body: 'mediumPlus', acidity: 'high', finishLength: 'veryLong', servingTemp: 10, memoKo: '브리오슈와 헤이즐넛이 절제와 풍성함의 균형을 만든다. 단연 최고의 NV.', memoEn: 'Brioche and hazelnut shape the balance of restraint and lushness. Easily the finest NV.' }),
  begRow({ id: 'note_015', slug: 'tus-chianti-classico', tastedAt: '2025-11-25', impression: 'good', rating: 4, aromas: ['red-cherry', 'tomato-leaf'], memoKo: '키안티의 두 번째 잔. 같은 와인이지만 한결 깊어졌다.', memoEn: 'Second glass of Chianti. The same wine, but deeper now.' }),
  begRow({ id: 'note_016', slug: 'jacobs', tastedAt: '2025-11-29', impression: 'okay', rating: 3, aromas: ['blackberry', 'black-pepper'], body: 4, memoKo: '호주 시라즈 입문. 흑후추가 친근하다.', memoEn: 'An Australian Shiraz entry. The black pepper feels familiar.' }),

  /* 2025-12 */
  expRow({ id: 'note_017', slug: 'rio-lopez-de-heredia', source: 'newEntry', tastedAt: '2025-12-04', rating100: 93, aromas: [{ categoryId: 'earthy', terms: ['leather', 'forest-floor'] }, { categoryId: 'herbaceous', terms: ['tobacco'] }, { categoryId: 'fruity', terms: ['red-cherry'] }, { categoryId: 'woody', terms: ['cedar', 'dill'] }], caudalies: 13, body: 'mediumPlus', tannin: 'medium', acidity: 'mediumPlus', finishLength: 'veryLong', memoKo: '시간이 만든 리오하. 부르고뉴의 우아함을 닮았다.', memoEn: 'A Rioja shaped by time. It echoes Burgundian grace.' }),
  expRow({ id: 'note_018', slug: 'rhn-chateauneuf', source: 'newEntry', tastedAt: '2025-12-10', rating100: 90, aromas: [{ categoryId: 'fruity', terms: ['raspberry', 'black-cherry'] }, { categoryId: 'floral', terms: ['lavender'] }, { categoryId: 'spicy', terms: ['licorice'] }], caudalies: 11, body: 'high', tannin: 'mediumPlus', finishLength: 'long', memoKo: '그르나슈의 따스함과 라벤더. 갈렛이 만든 무게.', memoEn: 'Grenache warmth and lavender. The weight built by galets.' }),
  begRow({ id: 'note_019', slug: 'mendoza', tastedAt: '2025-12-15', impression: 'good', rating: 4, aromas: ['blackberry', 'violet', 'vanilla'], body: 4, memoKo: '말벡의 부드러운 풀바디. 안데스의 햇볕.', memoEn: 'The gentle full body of Malbec. Andean sunlight.' }),
  expRow({ id: 'note_020', slug: 'mos-egon-muller-scharzhof', source: 'newEntry', tastedAt: '2025-12-19', rating100: 95, aromas: [{ categoryId: 'fruity', terms: ['apricot', 'apple', 'lime'] }, { categoryId: 'chemical', terms: ['petrol'] }, { categoryId: 'earthy', terms: ['wet-stone'] }], caudalies: 17, body: 'medium', acidity: 'high', finishLength: 'veryLong', servingTemp: 9, peakEstimateYear: 2040, memoKo: '잔당과 산미의 비현실적 균형. 30년을 더 견딜 와인.', memoEn: 'The unreal balance of sugar and acid. A wine that will outlast 30 more years.' }),
  expRow({ id: 'note_021', slug: 'bgy-puligny-montrachet', source: 'newEntry', tastedAt: '2025-12-24', rating100: 94, aromas: [{ categoryId: 'nutty', terms: ['hazelnut'] }, { categoryId: 'fruity', terms: ['lemon', 'apple'] }, { categoryId: 'earthy', terms: ['chalk'] }, { categoryId: 'floral', terms: ['acacia'] }], caudalies: 13, body: 'mediumPlus', acidity: 'high', finishLength: 'veryLong', servingTemp: 11, memoKo: '꼬뜨 드 본 화이트의 정점. 미네랄의 긴장감.', memoEn: 'The pinnacle of Côte de Beaune whites. A taut mineral tension.' }),

  /* 2026-01 */
  expRow({ id: 'note_022', slug: 'bgy-romanee-st-vivant', source: 'newEntry', tastedAt: '2026-01-04', rating100: 98, aromas: [{ categoryId: 'fruity', terms: ['strawberry', 'raspberry'] }, { categoryId: 'floral', terms: ['rose', 'violet'] }, { categoryId: 'earthy', terms: ['forest-floor', 'mushroom'] }], caudalies: 18, body: 'medium', tannin: 'medium', acidity: 'mediumPlus', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2040, memoKo: '향기 그 자체로 충만한 와인. 추출의 흔적이 없다.', memoEn: 'A wine full of perfume alone. No trace of extraction.' }),
  expRow({ id: 'note_023', slug: 'pie-barolo-giacomo-conterno', source: 'newEntry', tastedAt: '2026-01-12', rating100: 96, aromas: [{ categoryId: 'floral', terms: ['rose'] }, { categoryId: 'earthy', terms: ['tar', 'truffle'] }, { categoryId: 'fruity', terms: ['red-cherry'] }, { categoryId: 'spicy', terms: ['licorice'] }], caudalies: 17, body: 'high', tannin: 'high', acidity: 'high', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2040, memoKo: '바롤로 전통주의의 정점. 장미·타르·트러플의 삼각 균형.', memoEn: 'The peak of traditional Barolo. The triangular balance of rose, tar, and truffle.' }),
  begRow({ id: 'note_024', slug: 'cha-veuve-clicquot-yellow', tastedAt: '2026-01-18', impression: 'good', rating: 4, aromas: ['apple', 'brioche', 'lemon'], acidity: 4, body: 2, memoKo: '신년 모임. 노란 라벨의 정직함.', memoEn: 'A New Year gathering. The honesty of the Yellow Label.' }),
  expRow({ id: 'note_025', slug: 'mos-egon-muller-scharzhof', source: 'newEntry', tastedAt: '2026-01-23', rating100: 92, aromas: [{ categoryId: 'fruity', terms: ['apple', 'apricot', 'lime'] }, { categoryId: 'earthy', terms: ['wet-stone'] }, { categoryId: 'caramelized', terms: ['honey'] }], caudalies: 12, body: 'mediumPlus', acidity: 'high', finishLength: 'long', memoKo: '라인가우 GG의 단단함. 사과·살구·미네랄의 균형.', memoEn: 'The firmness of Rheingau GG. The balance of apple, apricot, and mineral.' }),
  begRow({ id: 'note_026', slug: 'casillero', tastedAt: '2026-01-28', impression: 'okay', rating: 3, aromas: ['cassis', 'black-cherry'], body: 4, memoKo: '두 번째 카시예로. 늘 같은 안정감.', memoEn: 'Second Casillero. Always the same reliability.' }),

  /* 2026-02 */
  expRow({ id: 'note_027', slug: 'tus-bolgheri-sassicaia', source: 'newEntry', tastedAt: '2026-02-02', rating100: 94, aromas: [{ categoryId: 'fruity', terms: ['cassis', 'black-cherry'] }, { categoryId: 'woody', terms: ['cedar'] }, { categoryId: 'herbaceous', terms: ['tobacco'] }], caudalies: 14, body: 'high', tannin: 'high', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2035, memoKo: '슈퍼 투스칸의 시조. 보르도의 골격과 토스카나의 향기.', memoEn: 'The founder of Super Tuscans. Bordeaux skeleton, Tuscan perfume.' }),
  begRow({ id: 'note_028', slug: 'bdx-haut-bages-liberal', tastedAt: '2026-02-07', impression: 'good', rating: 4, aromas: ['cassis', 'cedar', 'graphite'], body: 4, tannin: 4, memoKo: '뽀이악 입문. 5등급이지만 떼루아의 무게가 잡힌다.', memoEn: 'A Pauillac entry. A 5th growth, but the terroir weight is there.' }),
  expRow({ id: 'note_029', slug: 'chl-almaviva', source: 'newEntry', tastedAt: '2026-02-12', rating100: 92, aromas: [{ categoryId: 'fruity', terms: ['cassis'] }, { categoryId: 'herbaceous', terms: ['bell-pepper'] }, { categoryId: 'woody', terms: ['cedar'] }, { categoryId: 'earthy', terms: ['graphite', 'tobacco'] }], caudalies: 13, body: 'high', tannin: 'mediumPlus', finishLength: 'long', memoKo: '까르메네르의 식물성이 시그니처. 칠레 최고의 표현.', memoEn: 'Carménère vegetality is the signature. Chile at its finest.' }),
  expRow({ id: 'note_030', slug: 'bdx-pichon-baron', source: 'newEntry', tastedAt: '2026-02-18', rating100: 92, aromas: [{ categoryId: 'fruity', terms: ['cassis'] }, { categoryId: 'woody', terms: ['cedar', 'pencil-lead'] }, { categoryId: 'earthy', terms: ['graphite'] }, { categoryId: 'herbaceous', terms: ['tobacco'] }], caudalies: 13, body: 'high', tannin: 'high', finishLength: 'veryLong', peakEstimateYear: 2032, memoKo: '슈퍼 세컨드의 균형. 뽀이악의 골격에 마고의 향기로움.', memoEn: 'The balance of a Super Second. Pauillac skeleton, Margaux perfume.' }),
  begRow({ id: 'note_031', slug: 'rioja', tastedAt: '2026-02-22', impression: 'good', rating: 4, aromas: ['red-cherry', 'vanilla'], memoKo: '평일 저녁의 안정. 미국 오크 바닐라.', memoEn: 'Weeknight comfort. American-oak vanilla.' }),
  expRow({ id: 'note_032', slug: 'rio-lopez-de-heredia', source: 'newEntry', tastedAt: '2026-02-26', rating100: 89, aromas: [{ categoryId: 'fruity', terms: ['blackberry'] }, { categoryId: 'earthy', terms: ['leather'] }, { categoryId: 'woody', terms: ['cedar'] }], caudalies: 10, body: 'mediumPlus', tannin: 'mediumPlus', memoKo: '리베라 템프라니요의 정통. 짙고 단단하다.', memoEn: 'Orthodox Ribera Tempranillo. Deep and firm.' }),

  /* 2026-03 */
  begRow({ id: 'note_033', slug: 'cha-billecart-rose', tastedAt: '2026-03-04', impression: 'good', rating: 5, aromas: ['strawberry', 'raspberry', 'rose'], finish: 'long', body: 3, memoKo: '로제 샴페인의 우아함. 봄 저녁에 완벽.', memoEn: 'The grace of rosé Champagne. Perfect on a spring evening.' }),
  expRow({ id: 'note_034', slug: 'bgy-puligny-montrachet', source: 'newEntry', tastedAt: '2026-03-08', rating100: 91, aromas: [{ categoryId: 'nutty', terms: ['hazelnut'] }, { categoryId: 'microbiological', terms: ['butter'] }, { categoryId: 'fruity', terms: ['apple', 'lemon'] }], caudalies: 11, body: 'high', acidity: 'mediumPlus', finishLength: 'long', memoKo: '캘리포니아 부르고뉴식 샤르도네. 풍성하지만 균형있다.', memoEn: 'A Burgundian Chardonnay from California. Lush yet balanced.' }),
  begRow({ id: 'note_035', slug: 'nzl-cloudy-bay', tastedAt: '2026-03-13', impression: 'good', rating: 4, aromas: ['grapefruit', 'passion-fruit', 'grass'], acidity: 5, body: 2, memoKo: '말보로 소비뇽 블랑. 자몽과 패션프루트의 폭발.', memoEn: 'Marlborough Sauvignon Blanc. An explosion of grapefruit and passion fruit.' }),
  expRow({ id: 'note_036', slug: 'bdx-pichon-baron', source: 'newEntry', tastedAt: '2026-03-19', rating100: 93, aromas: [{ categoryId: 'fruity', terms: ['cassis', 'blackberry'] }, { categoryId: 'woody', terms: ['cedar'] }, { categoryId: 'herbaceous', terms: ['tobacco'] }, { categoryId: 'woody', terms: ['mocha'] }], caudalies: 14, body: 'high', tannin: 'high', finishLength: 'veryLong', peakEstimateYear: 2034, memoKo: '신·구세계의 만남. 균형이 완벽하다.', memoEn: 'Old World meets New. A perfect balance.' }),
  begRow({ id: 'note_037', slug: 'ven-prosecco', tastedAt: '2026-03-24', impression: 'okay', rating: 3, aromas: ['apple', 'pear'], finish: 'short', body: 2, memoKo: '점심에 가볍게. 사과의 산뜻함.', memoEn: 'A light lunch glass. The lift of apple.' }),
  expRow({ id: 'note_038', slug: 'bgy-chablis-grand-cru', source: 'newEntry', tastedAt: '2026-03-28', rating100: 93, aromas: [{ categoryId: 'fruity', terms: ['lemon', 'apple'] }, { categoryId: 'earthy', terms: ['oyster-shell', 'chalk', 'flint'] }], caudalies: 13, body: 'medium', acidity: 'high', finishLength: 'veryLong', servingTemp: 10, memoKo: '키메리지안 토양의 굴껍질. 샤블리의 정점.', memoEn: 'The oyster shell of Kimmeridgian soil. The peak of Chablis.' }),

  /* 2026-04 */
  expRow({ id: 'note_039', slug: 'rib-vega-sicilia-unico', source: 'newEntry', tastedAt: '2026-04-02', rating100: 95, aromas: [{ categoryId: 'fruity', terms: ['cassis', 'black-cherry'] }, { categoryId: 'earthy', terms: ['leather', 'truffle'] }, { categoryId: 'woody', terms: ['cedar'] }, { categoryId: 'herbaceous', terms: ['tobacco'] }], caudalies: 15, body: 'high', tannin: 'high', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2038, memoKo: '스페인의 슈퍼스타. 10년의 오크가 빚은 단단함.', memoEn: "Spain's superstar. The firmness forged by 10 years in oak." }),
  expRow({ id: 'note_040', slug: 'arg-catena-zapata-malbec', source: 'newEntry', tastedAt: '2026-04-06', rating100: 92, aromas: [{ categoryId: 'fruity', terms: ['blackberry'] }, { categoryId: 'floral', terms: ['violet'] }, { categoryId: 'earthy', terms: ['graphite'] }, { categoryId: 'spicy', terms: ['black-pepper'] }], caudalies: 12, body: 'high', tannin: 'high', finishLength: 'long', peakEstimateYear: 2035, memoKo: '안데스 고도의 말벡. 흑연과 제비꽃의 미네랄.', memoEn: 'Andean high-altitude Malbec. The mineral of graphite and violet.' }),
  begRow({ id: 'note_041', slug: 'tus-chianti-classico', tastedAt: '2026-04-10', impression: 'good', rating: 4, aromas: ['red-cherry', 'tomato-leaf', 'leather'], memoKo: '키안티의 세 번째. 매번 새롭게 느껴진다.', memoEn: 'Third Chianti. Feels fresh every time.' }),
  expRow({ id: 'note_042', slug: 'bgy-chablis-grand-cru', source: 'newEntry', tastedAt: '2026-04-14', rating100: 92, aromas: [{ categoryId: 'nutty', terms: ['hazelnut'] }, { categoryId: 'microbiological', terms: ['butter'] }, { categoryId: 'fruity', terms: ['lemon', 'apple'] }, { categoryId: 'earthy', terms: ['wet-stone'] }], caudalies: 12, body: 'mediumPlus', acidity: 'mediumPlus', finishLength: 'long', memoKo: '마가렛 리버의 정상. 미네랄과 풍성함의 균형.', memoEn: 'The summit of Margaret River. The balance of mineral and richness.' }),
  begRow({ id: 'note_043', slug: 'jacobs', tastedAt: '2026-04-18', impression: 'good', rating: 4, aromas: ['raspberry', 'bell-pepper', 'violet'], body: 3, tannin: 3, memoKo: '루아르 카베르네 프랑. 라즈베리와 피망의 균형.', memoEn: 'Loire Cabernet Franc. The balance of raspberry and bell pepper.' }),
  expRow({ id: 'note_044', slug: 'ven-amarone', source: 'newEntry', tastedAt: '2026-04-22', rating100: 90, aromas: [{ categoryId: 'fruity', terms: ['prune', 'fig', 'raisin'] }, { categoryId: 'caramelized', terms: ['dark-chocolate'] }, { categoryId: 'earthy', terms: ['leather'] }, { categoryId: 'spicy', terms: ['licorice'] }], caudalies: 12, body: 'high', tannin: 'mediumPlus', finishLength: 'long', servingTemp: 18, memoKo: '말린 포도의 무게. 건자두와 다크초콜릿.', memoEn: 'The weight of dried grapes. Prune and dark chocolate.' }),
  begRow({ id: 'note_045', slug: 'als-trimbach-riesling', tastedAt: '2026-04-26', impression: 'good', rating: 4, aromas: ['lime', 'apple', 'petrol', 'wet-stone'], acidity: 5, body: 2, memoKo: '알자스 리슬링의 절제. 등유 노트가 처음 잡혔다.', memoEn: "Alsace Riesling's restraint. First time I caught the petrol note." }),

  /* 2026-05 */
  expRow({ id: 'note_046', slug: 'rhn-chateauneuf', source: 'newEntry', tastedAt: '2026-05-02', rating100: 91, aromas: [{ categoryId: 'fruity', terms: ['apricot', 'peach'] }, { categoryId: 'floral', terms: ['honeysuckle', 'orange-blossom'] }], caudalies: 10, body: 'mediumPlus', acidity: 'medium', finishLength: 'long', servingTemp: 11, memoKo: '100% 비오니에. 살구·꿀·인동초의 풍성한 아로마.', memoEn: 'Pure Viognier. Apricot, honey, and honeysuckle in luxurious aroma.' }),
  expRow({ id: 'note_047', slug: 'bdx-margaux', source: 'newEntry', tastedAt: '2026-05-08', rating100: 94, aromas: [{ categoryId: 'fruity', terms: ['cassis', 'black-cherry'] }, { categoryId: 'woody', terms: ['cedar', 'pencil-lead'] }, { categoryId: 'earthy', terms: ['graphite', 'tobacco'] }, { categoryId: 'floral', terms: ['violet'] }], caudalies: 15, body: 'high', tannin: 'high', finishLength: 'veryLong', intensity: 'high', peakEstimateYear: 2034, memoKo: '세 번째 마고. 매번 같은 와인이 다른 깊이를 보인다.', memoEn: 'Third Margaux. The same wine reveals different depths every time.' }),
];
