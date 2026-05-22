/**
 * Tonight glasses — mock data (v0.1.0).
 *
 * 사양: design-spec community-side.md §1-A §2-A §10-A.
 *
 * 키스크린 verbatim 포팅 (`../winemine-keyscreen/src/app/community/tonight/page.tsx` line 14~32).
 * v0.2.0: supabase `tonight_glasses` 테이블 마이그레이션 후 클라이언트 fetch로 대체.
 *
 * §0-2 light-only mode (dark variant 생략).
 * §10-A 결정: 화면(.tsx)에서 인라인 fixture → 별도 파일 분리. 향후 supabase 전환 시 한 곳만 수정.
 */

export interface TonightEntry {
  userId: string;
  /** keyscreen mock wineId (slug 형식 — RN wines.ts MOCK_WINES.lwin 와 매핑되지 않을 수 있음) */
  wineId: string;
  place: { ko: string; en: string };
  placeDetail: { ko: string; en: string };
  hour: string;
  vibe: { ko: string; en: string };
}

export interface MapDot {
  /** SVG viewBox 0 0 358 220 기준 좌표 */
  x: number;
  y: number;
  label: { ko: string; en: string };
  /** count of glasses at this region — dot radius와 glow halo 크기 계산에 사용 */
  n: number;
}

export const TONIGHT_ENTRIES: readonly TonightEntry[] = [
  {
    userId: 'jiwon',
    wineId: 'bgy-pommard',
    place: { ko: '청담', en: 'Cheongdam' },
    placeDetail: { ko: '집', en: 'Home' },
    hour: '21:42',
    vibe: { ko: '두 시간 디캔팅 중', en: 'Decanting for two hours' },
  },
  {
    userId: 'mineral',
    wineId: 'bgy-puligny-montrachet',
    place: { ko: '한남', en: 'Hannam' },
    placeDetail: { ko: '와인바 ZIN', en: 'Wine bar ZIN' },
    hour: '21:30',
    vibe: { ko: '단독 시음', en: 'Solo tasting' },
  },
  {
    userId: 'duckhu',
    wineId: 'cha-krug-grande-cuvee',
    place: { ko: '판교', en: 'Pangyo' },
    placeDetail: { ko: '집', en: 'Home' },
    hour: '21:15',
    vibe: { ko: '기념일', en: 'Anniversary' },
  },
  {
    userId: 'haerin',
    wineId: 'loi-sancerre',
    place: { ko: '강남', en: 'Gangnam' },
    placeDetail: { ko: '리바이스 식당', en: 'Levis restaurant' },
    hour: '20:55',
    vibe: { ko: '식사와 함께', en: 'With dinner' },
  },
  {
    userId: 'minho',
    wineId: 'bdx-pichon-baron',
    place: { ko: '성수', en: 'Seongsu' },
    placeDetail: { ko: '집', en: 'Home' },
    hour: '20:40',
    vibe: { ko: '셀러 정리 후', en: 'After cellar cleanup' },
  },
] as const;

export const MAP_DOTS: readonly MapDot[] = [
  { x: 240, y: 90, label: { ko: '청담', en: 'Cheongdam' }, n: 4 },
  { x: 178, y: 95, label: { ko: '한남', en: 'Hannam' }, n: 3 },
  { x: 200, y: 175, label: { ko: '판교', en: 'Pangyo' }, n: 3 },
  { x: 280, y: 75, label: { ko: '성수', en: 'Seongsu' }, n: 2 },
  { x: 175, y: 140, label: { ko: '강남', en: 'Gangnam' }, n: 2 },
] as const;

/**
 * 와인 이름 lookup — TonightEntry.wineId(keyscreen slug)에 대응하는 표시명.
 * RN MOCK_WINES의 LWIN 매핑이 일부만 일치하므로 verbatim string fallback.
 * v0.2.0: supabase wines_localized 조회로 대체.
 */
export const TONIGHT_WINE_NAMES: Record<string, string> = {
  'bgy-pommard': 'Domaine Pommard Les Rugiens',
  'bgy-puligny-montrachet': 'Puligny-Montrachet 1er Cru',
  'cha-krug-grande-cuvee': 'Krug Grande Cuvée',
  'loi-sancerre': 'Sancerre Les Monts Damnés',
  'bdx-pichon-baron': 'Château Pichon Baron',
};
