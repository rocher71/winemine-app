/**
 * Purchases — 12 featured 와인 × 4~9건 = 70 entries.
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/purchases.ts verbatim 동등 포팅.
 * v0.1.0 mock 단계 — wine-prices.md §10 A: supabase 마이그레이션 없이 정적 모듈.
 *
 * keyscreen wineId 는 slug 형식 ('bdx-margaux' 등). RN 측은 LWIN 기반 라우팅이라
 * `wine-stories.ts` 와 동일 fallback 전략: 일부 featured LWIN → slug 매핑 테이블 두어
 * `getPurchasesByLwin(lwin)` 으로 lookup. 매핑 없는 LWIN 은 시각 검증을 위해
 * featured slug 첫 항목 (bdx-margaux) 로 fallback 가능 (개발 모드만).
 *
 * userId 'me-heavy'/'me-first' 는 본인 entry 표기용. 그 외 anon-XXX 는 닉네임 노출 X 정책.
 * source 분포: cellarRegistration 약 40%, tastingNote 약 60%.
 */

export type PurchaseSource = 'cellarRegistration' | 'tastingNote' | 'priceManualEntry';

export type Purchase = {
  id: string;
  userId: string;
  wineId: string; // slug 형식 (keyscreen verbatim)
  priceKrw: number;
  currency: 'KRW';
  storeId: string;
  purchasedAt: string; // 'YYYY-MM-DD'
  source: PurchaseSource;
};

/** 헬퍼 — 짧은 정의 위한 verbatim helper (keyscreen line 14). */
function p(
  id: string,
  wineId: string,
  priceKrw: number,
  storeId: string,
  purchasedAt: string,
  source: PurchaseSource = 'cellarRegistration',
  userId = 'me-heavy',
): Purchase {
  return {
    id,
    userId,
    wineId,
    priceKrw,
    currency: 'KRW',
    storeId,
    purchasedAt,
    source,
  };
}

export const PURCHASES: Purchase[] = [
  /* bdx-margaux × 7 — 가장 자주 매입 */
  p('pur_001', 'bdx-margaux', 1_180_000, 'store_001', '2025-10-04', 'cellarRegistration'),
  p('pur_002', 'bdx-margaux', 1_220_000, 'store_005', '2025-11-12', 'tastingNote', 'anon-001'),
  p('pur_003', 'bdx-margaux', 1_150_000, 'store_011', '2025-09-22', 'cellarRegistration', 'anon-002'),
  p('pur_004', 'bdx-margaux', 1_280_000, 'store_003', '2025-12-08', 'tastingNote', 'anon-003'),
  p('pur_005', 'bdx-margaux', 1_190_000, 'store_007', '2026-01-15', 'cellarRegistration', 'anon-004'),
  p('pur_006', 'bdx-margaux', 1_210_000, 'store_014', '2026-02-25', 'tastingNote', 'anon-005'),
  p('pur_007', 'bdx-margaux', 1_240_000, 'store_001', '2026-03-30', 'cellarRegistration', 'anon-006'),

  /* bgy-romanee-st-vivant × 4 — 희소 */
  p('pur_008', 'bgy-romanee-st-vivant', 5_400_000, 'store_011', '2025-12-15', 'cellarRegistration'),
  p('pur_009', 'bgy-romanee-st-vivant', 5_650_000, 'store_013', '2026-01-08', 'tastingNote', 'anon-007'),
  p('pur_010', 'bgy-romanee-st-vivant', 5_280_000, 'store_014', '2026-02-20', 'cellarRegistration', 'anon-008'),
  p('pur_011', 'bgy-romanee-st-vivant', 5_550_000, 'store_011', '2026-04-12', 'tastingNote', 'anon-009'),

  /* cha-krug-grande-cuvee × 6 */
  p('pur_012', 'cha-krug-grande-cuvee', 510_000, 'store_003', '2026-04-02', 'cellarRegistration'),
  p('pur_013', 'cha-krug-grande-cuvee', 530_000, 'store_001', '2025-11-22', 'tastingNote'),
  p('pur_014', 'cha-krug-grande-cuvee', 495_000, 'store_011', '2025-12-25', 'cellarRegistration', 'anon-010'),
  p('pur_015', 'cha-krug-grande-cuvee', 540_000, 'store_005', '2026-01-30', 'tastingNote', 'anon-011'),
  p('pur_016', 'cha-krug-grande-cuvee', 515_000, 'store_014', '2026-03-08', 'cellarRegistration', 'anon-012'),
  p('pur_017', 'cha-krug-grande-cuvee', 520_000, 'store_003', '2026-04-25', 'tastingNote', 'anon-013'),

  /* tus-brunello-biondi-santi × 6 */
  p('pur_018', 'tus-brunello-biondi-santi', 950_000, 'store_001', '2025-11-04', 'cellarRegistration'),
  p('pur_019', 'tus-brunello-biondi-santi', 980_000, 'store_005', '2025-10-05', 'tastingNote'),
  p('pur_020', 'tus-brunello-biondi-santi', 940_000, 'store_011', '2025-12-18', 'cellarRegistration', 'anon-014'),
  p('pur_021', 'tus-brunello-biondi-santi', 1_020_000, 'store_014', '2026-01-22', 'tastingNote', 'anon-015'),
  p('pur_022', 'tus-brunello-biondi-santi', 960_000, 'store_003', '2026-02-28', 'cellarRegistration', 'anon-016'),
  p('pur_023', 'tus-brunello-biondi-santi', 970_000, 'store_007', '2026-04-04', 'tastingNote', 'anon-017'),

  /* pie-barolo-giacomo-conterno × 6 */
  p('pur_024', 'pie-barolo-giacomo-conterno', 1_270_000, 'store_003', '2026-02-14', 'cellarRegistration'),
  p('pur_025', 'pie-barolo-giacomo-conterno', 1_310_000, 'store_001', '2026-01-12', 'tastingNote'),
  p('pur_026', 'pie-barolo-giacomo-conterno', 1_250_000, 'store_014', '2025-12-01', 'cellarRegistration', 'anon-018'),
  p('pur_027', 'pie-barolo-giacomo-conterno', 1_340_000, 'store_011', '2026-03-15', 'tastingNote', 'anon-019'),
  p('pur_028', 'pie-barolo-giacomo-conterno', 1_280_000, 'store_005', '2026-04-08', 'cellarRegistration', 'anon-020'),
  p('pur_029', 'pie-barolo-giacomo-conterno', 1_300_000, 'store_003', '2026-04-28', 'tastingNote', 'anon-021'),

  /* rio-lopez-de-heredia × 5 */
  p('pur_030', 'rio-lopez-de-heredia', 230_000, 'store_011', '2025-09-22', 'cellarRegistration'),
  p('pur_031', 'rio-lopez-de-heredia', 245_000, 'store_005', '2025-12-04', 'tastingNote'),
  p('pur_032', 'rio-lopez-de-heredia', 225_000, 'store_007', '2026-02-26', 'tastingNote'),
  p('pur_033', 'rio-lopez-de-heredia', 240_000, 'store_001', '2026-01-15', 'cellarRegistration', 'anon-022'),
  p('pur_034', 'rio-lopez-de-heredia', 235_000, 'store_014', '2026-03-22', 'tastingNote', 'anon-023'),

  /* rhn-chateau-rayas × 5 */
  p('pur_035', 'rhn-chateau-rayas', 1_080_000, 'store_001', '2025-11-15', 'cellarRegistration'),
  p('pur_036', 'rhn-chateau-rayas', 1_120_000, 'store_011', '2025-12-22', 'tastingNote', 'anon-024'),
  p('pur_037', 'rhn-chateau-rayas', 1_050_000, 'store_014', '2026-02-10', 'cellarRegistration', 'anon-025'),
  p('pur_038', 'rhn-chateau-rayas', 1_100_000, 'store_003', '2026-03-18', 'tastingNote', 'anon-026'),
  p('pur_039', 'rhn-chateau-rayas', 1_110_000, 'store_005', '2026-04-25', 'cellarRegistration', 'anon-027'),

  /* mos-egon-muller-scharzhof × 5 */
  p('pur_040', 'mos-egon-muller-scharzhof', 380_000, 'store_003', '2026-03-25', 'cellarRegistration'),
  p('pur_041', 'mos-egon-muller-scharzhof', 395_000, 'store_011', '2025-12-19', 'tastingNote'),
  p('pur_042', 'mos-egon-muller-scharzhof', 370_000, 'store_014', '2026-01-23', 'tastingNote'),
  p('pur_043', 'mos-egon-muller-scharzhof', 385_000, 'store_001', '2026-02-12', 'cellarRegistration', 'anon-028'),
  p('pur_044', 'mos-egon-muller-scharzhof', 390_000, 'store_005', '2026-04-08', 'tastingNote', 'anon-029'),

  /* nap-screaming-eagle × 4 */
  p('pur_045', 'nap-screaming-eagle', 6_800_000, 'store_013', '2025-11-15', 'cellarRegistration', 'anon-030'),
  p('pur_046', 'nap-screaming-eagle', 7_050_000, 'store_014', '2026-01-05', 'tastingNote', 'anon-031'),
  p('pur_047', 'nap-screaming-eagle', 6_650_000, 'store_011', '2026-02-22', 'cellarRegistration', 'anon-032'),
  p('pur_048', 'nap-screaming-eagle', 6_920_000, 'store_013', '2026-04-15', 'tastingNote', 'anon-033'),

  /* por-niepoort-vintage-port × 5 */
  p('pur_049', 'por-niepoort-vintage-port', 315_000, 'store_003', '2025-12-25', 'cellarRegistration'),
  p('pur_050', 'por-niepoort-vintage-port', 325_000, 'store_001', '2025-11-08', 'tastingNote', 'anon-034'),
  p('pur_051', 'por-niepoort-vintage-port', 310_000, 'store_011', '2026-01-18', 'cellarRegistration', 'anon-035'),
  p('pur_052', 'por-niepoort-vintage-port', 320_000, 'store_014', '2026-02-25', 'tastingNote', 'anon-036'),
  p('pur_053', 'por-niepoort-vintage-port', 330_000, 'store_005', '2026-04-02', 'cellarRegistration', 'anon-037'),

  /* arg-catena-zapata-malbec × 5 */
  p('pur_054', 'arg-catena-zapata-malbec', 380_000, 'store_011', '2026-04-06', 'tastingNote'),
  p('pur_055', 'arg-catena-zapata-malbec', 395_000, 'store_005', '2025-12-12', 'cellarRegistration', 'anon-038'),
  p('pur_056', 'arg-catena-zapata-malbec', 370_000, 'store_003', '2026-01-25', 'tastingNote', 'anon-039'),
  p('pur_057', 'arg-catena-zapata-malbec', 385_000, 'store_001', '2026-02-18', 'cellarRegistration', 'anon-040'),
  p('pur_058', 'arg-catena-zapata-malbec', 390_000, 'store_014', '2026-03-22', 'tastingNote', 'anon-041'),

  /* aus-penfolds-grange × 5 */
  p('pur_059', 'aus-penfolds-grange', 1_180_000, 'store_012', '2025-12-08', 'cellarRegistration'),
  p('pur_060', 'aus-penfolds-grange', 1_220_000, 'store_011', '2025-11-04', 'tastingNote', 'anon-042'),
  p('pur_061', 'aus-penfolds-grange', 1_160_000, 'store_014', '2026-02-08', 'cellarRegistration', 'anon-043'),
  p('pur_062', 'aus-penfolds-grange', 1_230_000, 'store_003', '2026-03-12', 'tastingNote', 'anon-044'),
  p('pur_063', 'aus-penfolds-grange', 1_210_000, 'store_001', '2026-04-18', 'cellarRegistration', 'anon-045'),

  /* daily 와인 — heavy 유저 빈도 시뮬 */
  p('pur_064', 'tus-chianti-classico', 45_000, 'store_009', '2025-09-20', 'tastingNote'),
  p('pur_065', 'tus-chianti-classico', 42_000, 'store_009', '2025-11-25', 'tastingNote'),
  p('pur_066', 'tus-chianti-classico', 44_000, 'store_010', '2026-04-10', 'tastingNote'),
  p('pur_067', 'rioja', 35_000, 'store_009', '2025-09-27', 'tastingNote'),
  p('pur_068', 'rioja', 33_000, 'store_010', '2026-02-22', 'tastingNote'),
  p('pur_069', 'casillero', 22_000, 'store_008', '2025-10-23', 'tastingNote'),
  p('pur_070', 'casillero', 21_000, 'store_008', '2026-01-28', 'tastingNote'),
];

/**
 * LWIN → keyscreen slug 매핑 (mock 단계 임시).
 * 일부 featured LWIN 만 매핑. 매핑 미존재 시 fallback slug 사용 (개발 시각 검증 목적).
 * v0.2.0 supabase 마이그레이션 후 wine_lwin 직접 매핑으로 대체.
 */
const LWIN_TO_SLUG: Record<string, string> = {
  '1011196': 'bdx-margaux', // Château Margaux (wine-stories.ts 동일)
  '1011207': 'bgy-romanee-st-vivant',
  '1011219': 'cha-krug-grande-cuvee',
  '1011225': 'tus-brunello-biondi-santi',
  '1011230': 'pie-barolo-giacomo-conterno',
  '1011245': 'rio-lopez-de-heredia',
  '1011251': 'rhn-chateau-rayas',
  '1011268': 'mos-egon-muller-scharzhof',
  '1011273': 'nap-screaming-eagle',
  '1011284': 'por-niepoort-vintage-port',
  '1011292': 'arg-catena-zapata-malbec',
  '1011305': 'aus-penfolds-grange',
};

/** fallback slug — wine-prices 시각 검증 목적 (개발 시 모든 LWIN 이 데이터 보유하도록). */
const FALLBACK_SLUG = 'bdx-margaux';

/**
 * LWIN 으로 purchases 조회. 매핑 미존재 시 dev 환경에서는 fallback slug 사용.
 * production 에서는 매핑 미존재 시 빈 배열 반환 (empty state 진입).
 */
export function getPurchasesByLwin(lwin: string | null | undefined): Purchase[] {
  if (!lwin) return [];
  const slug = LWIN_TO_SLUG[lwin] ?? (__DEV__ ? FALLBACK_SLUG : null);
  if (!slug) return [];
  return PURCHASES.filter((p) => p.wineId === slug);
}
