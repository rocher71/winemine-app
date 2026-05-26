/**
 * Cellar items — 28 entries (heavy user demo).
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/cellar.ts — 처음 28개 entries만 포팅
 * (LWIN expansion 29~55는 매핑되는 mock wine 없어 생략 — fallback LWIN 사용).
 *
 * shape: Database['public']['Tables']['cellar_items']['Row'] 동등.
 *
 * 변환 규칙:
 *   - `wineId` (slug) → `wine_lwin`: SLUG_TO_LWIN 매핑 (12 entries).
 *     매핑 없는 slug 는 fallback `'1011196'` (Margaux) 사용.
 *   - `userId` 'me-heavy' → `user_id`: DEMO_USER_ID (고정 UUID).
 *   - `notes: { ko, en } | null` → `notes_ko` / `notes_en` 분리.
 *   - `notifyAtPeak` → `notify_at_peak`.
 *   - `purchasePriceKrw` → `purchase_price_krw`.
 *   - `acquiredAt` → `acquired_at`.
 *   - `photoUrl` → 무시 (Storage 미구현).
 *   - `status`: 모두 'cellared' (28개 중 consumed 0 — keyscreen 동일).
 *   - `quantity`: 1 (기본).
 *   - `consumed_at`: null.
 *
 * v0.1.0 DEMO_MODE 활성 시 useCellarSummary() / useCellarList() / useCellarItem() 에서 사용.
 */
import type { Database } from '@shared/types/database.types';
import { DEMO_USER_ID } from '@/lib/demo-mode';
import { SLUG_TO_LWIN, FALLBACK_LWIN } from './wines';

export type CellarItemRow = Database['public']['Tables']['cellar_items']['Row'];

/** slug → LWIN (fallback FALLBACK_LWIN if no mapping). */
function slugToLwin(slug: string): string {
  return SLUG_TO_LWIN[slug] ?? FALLBACK_LWIN;
}

type CellarSeed = {
  id: string;
  slug: string;
  acquiredAt: string;
  storage: 'cellar' | 'fridge' | 'room' | 'offsite';
  notesKo: string | null;
  notesEn: string | null;
  purchasePriceKrw: number;
  notifyAtPeak: boolean;
};

const SEEDS: CellarSeed[] = [
  /* cellar (18) */
  { id: 'cellar_001', slug: 'bdx-margaux', acquiredAt: '2025-10-04', storage: 'cellar', notesKo: '결혼 5주년 와인으로 매입. 2032년 즈음 오픈 예정.', notesEn: 'Bought for our 5th anniversary. Plan to open around 2032.', purchasePriceKrw: 1_180_000, notifyAtPeak: true },
  { id: 'cellar_002', slug: 'bdx-pichon-baron', acquiredAt: '2025-09-18', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 270_000, notifyAtPeak: true },
  { id: 'cellar_003', slug: 'bdx-leoville-barton', acquiredAt: '2025-11-22', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 175_000, notifyAtPeak: false },
  { id: 'cellar_004', slug: 'bgy-romanee-st-vivant', acquiredAt: '2025-12-15', storage: 'cellar', notesKo: '2035년쯤 50번째 생일에. 절대 일찍 열지 말 것.', notesEn: "Save for the 50th birthday around 2035. Don't open early.", purchasePriceKrw: 5_400_000, notifyAtPeak: true },
  { id: 'cellar_005', slug: 'bgy-gevrey-chambertin', acquiredAt: '2025-09-30', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 215_000, notifyAtPeak: false },
  { id: 'cellar_006', slug: 'bgy-chambolle-musigny', acquiredAt: '2026-01-08', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 315_000, notifyAtPeak: false },
  { id: 'cellar_007', slug: 'bgy-pommard', acquiredAt: '2025-10-25', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 275_000, notifyAtPeak: true },
  { id: 'cellar_008', slug: 'tus-brunello-biondi-santi', acquiredAt: '2025-11-04', storage: 'cellar', notesKo: '리세르바 출시 5년차. 매년 한 병씩 시음 예정.', notesEn: 'Riserva, year 5 since release. Plan to taste one bottle each year.', purchasePriceKrw: 950_000, notifyAtPeak: true },
  { id: 'cellar_009', slug: 'tus-bolgheri-sassicaia', acquiredAt: '2025-12-20', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 470_000, notifyAtPeak: true },
  { id: 'cellar_010', slug: 'pie-barolo-giacomo-conterno', acquiredAt: '2026-02-14', storage: 'cellar', notesKo: '발렌타인 선물. 결혼 10주년에 오픈.', notesEn: 'Valentine gift. Open on the 10th anniversary.', purchasePriceKrw: 1_270_000, notifyAtPeak: true },
  { id: 'cellar_011', slug: 'pie-barbaresco', acquiredAt: '2025-10-10', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 570_000, notifyAtPeak: false },
  { id: 'cellar_012', slug: 'rhn-chateau-rayas', acquiredAt: '2025-11-15', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 1_080_000, notifyAtPeak: true },
  { id: 'cellar_013', slug: 'rhn-cote-rotie', acquiredAt: '2025-12-02', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 660_000, notifyAtPeak: false },
  { id: 'cellar_014', slug: 'rio-lopez-de-heredia', acquiredAt: '2025-09-22', storage: 'cellar', notesKo: '셀러에서 이미 12년 보낸 와인. 천천히 마시면 된다.', notesEn: 'Already 12 years in the cellar. No need to rush.', purchasePriceKrw: 230_000, notifyAtPeak: false },
  { id: 'cellar_015', slug: 'rib-vega-sicilia-unico', acquiredAt: '2026-03-08', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 670_000, notifyAtPeak: true },
  { id: 'cellar_016', slug: 'pri-laurel-priorat', acquiredAt: '2025-10-30', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 215_000, notifyAtPeak: false },
  { id: 'cellar_017', slug: 'nap-opus-one', acquiredAt: '2026-01-20', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 710_000, notifyAtPeak: true },
  { id: 'cellar_018', slug: 'por-niepoort-vintage-port', acquiredAt: '2025-12-25', storage: 'cellar', notesKo: '크리스마스 선물. 2040년대를 위해.', notesEn: 'Christmas gift. Saved for the 2040s.', purchasePriceKrw: 315_000, notifyAtPeak: true },

  /* fridge (6) */
  { id: 'cellar_019', slug: 'cha-krug-grande-cuvee', acquiredAt: '2026-04-02', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 510_000, notifyAtPeak: false },
  { id: 'cellar_020', slug: 'cha-billecart-rose', acquiredAt: '2026-03-18', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 155_000, notifyAtPeak: false },
  { id: 'cellar_021', slug: 'bgy-puligny-montrachet', acquiredAt: '2026-02-28', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 510_000, notifyAtPeak: false },
  { id: 'cellar_022', slug: 'bgy-chablis-grand-cru', acquiredAt: '2026-04-12', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 220_000, notifyAtPeak: false },
  { id: 'cellar_023', slug: 'mos-egon-muller-scharzhof', acquiredAt: '2026-03-25', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 380_000, notifyAtPeak: false },
  { id: 'cellar_024', slug: 'loi-sancerre', acquiredAt: '2026-04-25', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 92_000, notifyAtPeak: false },

  /* room (3) */
  { id: 'cellar_025', slug: 'tus-chianti-classico', acquiredAt: '2026-04-08', storage: 'room', notesKo: null, notesEn: null, purchasePriceKrw: 42_000, notifyAtPeak: false },
  { id: 'cellar_026', slug: 'rioja', acquiredAt: '2026-03-15', storage: 'room', notesKo: null, notesEn: null, purchasePriceKrw: 33_000, notifyAtPeak: false },
  { id: 'cellar_027', slug: 'casillero', acquiredAt: '2026-04-22', storage: 'room', notesKo: null, notesEn: null, purchasePriceKrw: 21_000, notifyAtPeak: false },

  /* offsite (1) */
  { id: 'cellar_028', slug: 'aus-penfolds-grange', acquiredAt: '2025-12-08', storage: 'offsite', notesKo: '와인포스트 외부 셀러 보관. 출시 직후 매입.', notesEn: 'Stored at the Wine Post offsite cellar. Bought on release.', purchasePriceKrw: 1_180_000, notifyAtPeak: true },
];

function toRow(seed: CellarSeed): CellarItemRow {
  return {
    id: seed.id,
    user_id: DEMO_USER_ID,
    wine_lwin: slugToLwin(seed.slug),
    status: 'cellared',
    acquired_at: seed.acquiredAt,
    consumed_at: null,
    storage: seed.storage,
    purchase_price_krw: seed.purchasePriceKrw,
    quantity: 1,
    notes_ko: seed.notesKo,
    notes_en: seed.notesEn,
    notify_at_peak: seed.notifyAtPeak,
    created_at: `${seed.acquiredAt}T00:00:00.000Z`,
  };
}

// consumed 목데이터 — 마신 와인 탭 (사용자 요청)
const CONSUMED_SEEDS: (CellarSeed & { consumedAt: string })[] = [
  { id: 'consumed_001', slug: 'bdx-margaux', acquiredAt: '2024-06-10', storage: 'cellar', notesKo: '결혼기념일에 오픈. 탄닌이 부드럽고 붉은 과실향이 풍부.', notesEn: 'Opened on anniversary. Soft tannins, rich red fruit.', purchasePriceKrw: 950_000, notifyAtPeak: false, consumedAt: '2024-12-31' },
  { id: 'consumed_002', slug: 'bgy-romanee-st-vivant', acquiredAt: '2023-12-01', storage: 'cellar', notesKo: '루소 방문 기념으로 구입. 우아함의 극치.', notesEn: 'Bought to commemorate a visit to Rousseau. Pinnacle of elegance.', purchasePriceKrw: 4_200_000, notifyAtPeak: false, consumedAt: '2025-01-14' },
  { id: 'consumed_003', slug: 'cha-krug-grande-cuvee', acquiredAt: '2024-03-20', storage: 'fridge', notesKo: null, notesEn: null, purchasePriceKrw: 480_000, notifyAtPeak: false, consumedAt: '2024-09-22' },
  { id: 'consumed_004', slug: 'tus-brunello-biondi-santi', acquiredAt: '2022-05-11', storage: 'cellar', notesKo: '20년 후 마시려 했지만 결혼식 피로연에 부모님과 함께.', notesEn: 'Planned for 20 years later but shared with parents at the wedding reception.', purchasePriceKrw: 870_000, notifyAtPeak: false, consumedAt: '2024-10-05' },
  { id: 'consumed_005', slug: 'pie-barolo-giacomo-conterno', acquiredAt: '2023-08-18', storage: 'cellar', notesKo: null, notesEn: null, purchasePriceKrw: 1_100_000, notifyAtPeak: false, consumedAt: '2025-02-28' },
  { id: 'consumed_006', slug: 'aus-penfolds-grange', acquiredAt: '2022-11-30', storage: 'offsite', notesKo: '호주 출장 후 직구. 예상보다 일찍 오픈.', notesEn: 'Bought directly after a business trip to Australia. Opened earlier than expected.', purchasePriceKrw: 1_350_000, notifyAtPeak: false, consumedAt: '2025-03-12' },
  { id: 'consumed_007', slug: 'nap-screaming-eagle', acquiredAt: '2021-09-07', storage: 'cellar', notesKo: '와인 친구 생일 파티. 잊을 수 없는 밤.', notesEn: "Friend's birthday party. An unforgettable night.", purchasePriceKrw: 2_800_000, notifyAtPeak: false, consumedAt: '2025-04-20' },
  // Krug 3회 시음 — useTastedGrouped 그루핑 테스트용 (3회 뱃지 확인)
  { id: 'consumed_008', slug: 'cha-krug-grande-cuvee', acquiredAt: '2023-11-15', storage: 'fridge', notesKo: '생일 축하. 복잡미묘한 효모향.', notesEn: 'Birthday celebration. Complex yeasty aroma.', purchasePriceKrw: 490_000, notifyAtPeak: false, consumedAt: '2025-01-01' },
  { id: 'consumed_009', slug: 'cha-krug-grande-cuvee', acquiredAt: '2025-02-10', storage: 'fridge', notesKo: '새 빈티지. 여전히 훌륭함.', notesEn: 'New vintage. Still outstanding.', purchasePriceKrw: 510_000, notifyAtPeak: false, consumedAt: '2025-05-10' },
];

function toConsumedRow(seed: CellarSeed & { consumedAt: string }): CellarItemRow {
  return {
    id: seed.id,
    user_id: DEMO_USER_ID,
    wine_lwin: slugToLwin(seed.slug),
    status: 'consumed',
    acquired_at: seed.acquiredAt,
    consumed_at: seed.consumedAt,
    storage: seed.storage,
    purchase_price_krw: seed.purchasePriceKrw,
    quantity: 1,
    notes_ko: seed.notesKo,
    notes_en: seed.notesEn,
    notify_at_peak: seed.notifyAtPeak,
    created_at: `${seed.acquiredAt}T00:00:00.000Z`,
  };
}

export const MOCK_CELLAR_ITEMS: CellarItemRow[] = [
  ...SEEDS.map(toRow),
  ...CONSUMED_SEEDS.map(toConsumedRow),
];
