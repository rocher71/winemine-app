/**
 * Community Peak Estimates — 12 featured wines × ~30 reviewers = ~360 deterministic seeds.
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/community-peaks.ts verbatim 동등 포팅.
 *
 * v0.1.0 mock 단계 — wine-community-peak.md §10 A: supabase 마이그레이션 없이 정적 모듈.
 * v0.2.0 supabase `community_peaks` 테이블 + RLS 마이그레이션으로 교체 예정.
 *
 * keyscreen wineId 는 slug 형식 ('bdx-margaux' 등). RN 측은 LWIN 기반 라우팅이라
 * `purchases.ts` 와 동일 fallback 전략: featured LWIN → slug 매핑 테이블 두어
 * `getCommunityPeaksByLwin(lwin)` 으로 lookup. 매핑 없는 LWIN 은 시각 검증을 위해
 * dev 환경에서 첫 featured slug (bdx-margaux) 로 fallback.
 *
 * userId 'anon-cp-XXXX' 는 결정적 익명 seed — 노출 X 정책. anonIdFor() 1~999 정수 해시만 표시.
 * 정규분포 + 시스템 peak 보다 약 1~2년 늦은 쪽 bias (전문가의 보수적 추정 시뮬).
 */

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type CommunityPeakEstimate = {
  id: string; // 'cp_0001'
  wineId: string; // slug 형식 (keyscreen verbatim)
  userId: string; // 'anon-cp-0001' — never displayed
  estimatedPeakYear: number;
  confidence: ConfidenceLevel;
  note: { ko: string; en: string } | null;
  createdAt: string; // 'YYYY-MM-DD'
  reviewerLevel: 3 | 4 | 5;
};

interface WinePeakSeed {
  wineId: string;
  systemPeak: number;
  responses: number;
}

const SEEDS: WinePeakSeed[] = [
  { wineId: 'bdx-margaux', systemPeak: 2035, responses: 38 },
  { wineId: 'bgy-romanee-st-vivant', systemPeak: 2035, responses: 24 },
  { wineId: 'cha-krug-grande-cuvee', systemPeak: 2028, responses: 41 },
  { wineId: 'tus-brunello-biondi-santi', systemPeak: 2036, responses: 32 },
  { wineId: 'pie-barolo-giacomo-conterno', systemPeak: 2037, responses: 29 },
  { wineId: 'rio-lopez-de-heredia', systemPeak: 2030, responses: 26 },
  { wineId: 'rhn-chateau-rayas', systemPeak: 2032, responses: 22 },
  { wineId: 'mos-egon-muller-scharzhof', systemPeak: 2030, responses: 27 },
  { wineId: 'nap-screaming-eagle', systemPeak: 2034, responses: 19 },
  { wineId: 'por-niepoort-vintage-port', systemPeak: 2040, responses: 21 },
  { wineId: 'arg-catena-zapata-malbec', systemPeak: 2032, responses: 28 },
  { wineId: 'aus-penfolds-grange', systemPeak: 2035, responses: 33 },
];

/** seed-based deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller normal distribution. */
function gaussian(rand: () => number, mean: number, std: number): number {
  const u1 = rand() || 1e-12;
  const u2 = rand() || 1e-12;
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

const CONFIDENCE_BY_LEVEL: Record<3 | 4 | 5, ConfidenceLevel> = {
  3: 'low',
  4: 'medium',
  5: 'high',
};

const NOTES_KO = [
  '아직 타닌이 너무 강함',
  '향이 막 깨어나는 중',
  '지금 마셔도 충분히 즐길 수 있음',
  '5년 더 묵힐 가치 충분',
  '디캔팅 90분 이상 권장',
  '아직 어리지만 잠재력 분명',
  '몇 년 안에 절정 도달할 듯',
  '시간이 만들어줄 와인',
  '지금이 가장 좋은 시기',
];
const NOTES_EN = [
  'Tannins still tight',
  'Aromatics just beginning to wake',
  'Drinking well even now',
  'Worth aging another five years',
  'Decant 90+ minutes',
  'Young, but the potential is clear',
  'Will hit its stride within a few years',
  'A wine time will shape',
  'At its sweet spot right now',
];

function generatePeaksForSeed(
  seed: WinePeakSeed,
  startId: number,
): CommunityPeakEstimate[] {
  const rand = mulberry32(
    seed.wineId.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7),
  );
  const items: CommunityPeakEstimate[] = [];
  // 시스템 peak 보다 약 +1.2년 mean shift, std 2.5년.
  const mean = seed.systemPeak + 1.2;
  const std = 2.5;

  for (let i = 0; i < seed.responses; i++) {
    const raw = gaussian(rand, mean, std);
    const year = Math.round(raw);

    // reviewerLevel 분포: L3 60%, L4 30%, L5 10%.
    const lvlRoll = rand();
    const level: 3 | 4 | 5 = lvlRoll < 0.6 ? 3 : lvlRoll < 0.9 ? 4 : 5;
    const confidence = CONFIDENCE_BY_LEVEL[level];

    // 약 25% 만 한 줄 메모 작성.
    const hasNote = rand() < 0.25;
    const noteIdx = Math.floor(rand() * NOTES_KO.length);
    // NOTES_KO/EN 은 정적 상수 — index 보장. fallback 으로 빈 문자열 사용 (실제 미발생).
    const noteKo: string = NOTES_KO[noteIdx] ?? '';
    const noteEn: string = NOTES_EN[noteIdx] ?? '';

    // createdAt: 2025-10-01 ~ 2026-05-01 사이 분산.
    const dayOffset = Math.floor(rand() * 210);
    const base = new Date('2025-10-01T00:00:00Z').getTime();
    const date = new Date(base + dayOffset * 86_400_000)
      .toISOString()
      .slice(0, 10);

    items.push({
      id: `cp_${String(startId + i).padStart(4, '0')}`,
      wineId: seed.wineId,
      userId: `anon-cp-${String(startId + i).padStart(4, '0')}`,
      estimatedPeakYear: year,
      confidence,
      note: hasNote ? { ko: noteKo, en: noteEn } : null,
      createdAt: date,
      reviewerLevel: level,
    });
  }

  return items;
}

let idCursor = 1;
export const COMMUNITY_PEAKS: CommunityPeakEstimate[] = SEEDS.flatMap((seed) => {
  const list = generatePeaksForSeed(seed, idCursor);
  idCursor += seed.responses;
  return list;
});

/** systemPeak lookup — community-peak-aggregator.ts 에서 참조. */
export const SYSTEM_PEAKS_BY_WINE: Record<string, number> = SEEDS.reduce<
  Record<string, number>
>((acc, s) => {
  acc[s.wineId] = s.systemPeak;
  return acc;
}, {});

/**
 * LWIN → keyscreen slug 매핑 (mock 단계 임시).
 * purchases.ts / wine-stories.ts 와 동일 패턴.
 * v0.2.0 supabase 마이그레이션 후 wine_lwin 직접 매핑으로 대체.
 */
const LWIN_TO_SLUG: Record<string, string> = {
  '1011196': 'bdx-margaux',
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

/** fallback slug — 개발 모드 시각 검증 목적 (모든 LWIN 이 데이터 보유). */
const FALLBACK_SLUG = 'bdx-margaux';

/** LWIN 으로 community-peak estimates 조회. */
export function getCommunityPeaksByLwin(
  lwin: string | null | undefined,
): CommunityPeakEstimate[] {
  if (!lwin) return [];
  const slug = LWIN_TO_SLUG[lwin] ?? (__DEV__ ? FALLBACK_SLUG : null);
  if (!slug) return [];
  return COMMUNITY_PEAKS.filter((p) => p.wineId === slug);
}

/** slug 직접 lookup (community-peak-aggregator 내부용). */
export function getCommunityPeaksByWineSlug(
  wineSlug: string,
): CommunityPeakEstimate[] {
  return COMMUNITY_PEAKS.filter((p) => p.wineId === wineSlug);
}

/** LWIN → slug 직접 노출 (aggregator systemPeak lookup 용). */
export function lwinToSlug(lwin: string | null | undefined): string | null {
  if (!lwin) return null;
  return LWIN_TO_SLUG[lwin] ?? (__DEV__ ? FALLBACK_SLUG : null);
}
