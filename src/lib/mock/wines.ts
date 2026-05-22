/**
 * Wines — 12 featured wines for demo mode (heavy user catalog).
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/wines.ts — FEATURED_WINE_IDS 12종.
 * shape: Database['public']['Views']['wines_localized']['Row'] 호환 — 실 supabase row와 동일 모양.
 *
 * keyscreen slug ↔ RN LWIN 매핑: src/lib/mock/purchases.ts LWIN_TO_SLUG (12 entries) 동기.
 *
 * `name_ko`: keyscreen `producer.ko` 또는 와인 한글 명칭 (Localized 데이터 있는 항목만 채움).
 * 없으면 null — supabase wines_localized VIEW의 동작과 동일 (한글명 없을 시 display_name fallback).
 *
 * v0.1.0 DEMO_MODE 활성 시 useWine() / useCellarList() / useNote() 등에서 사용.
 */
import type { Database } from '@shared/types/database.types';

export type WineLocalizedRow = Database['public']['Views']['wines_localized']['Row'];

/** keyscreen slug → LWIN (역방향 — purchases.ts 의 LWIN_TO_SLUG 동기). */
export const SLUG_TO_LWIN: Record<string, string> = {
  'bdx-margaux': '1011196',
  'bgy-romanee-st-vivant': '1011207',
  'cha-krug-grande-cuvee': '1011219',
  'tus-brunello-biondi-santi': '1011225',
  'pie-barolo-giacomo-conterno': '1011230',
  'rio-lopez-de-heredia': '1011245',
  'rhn-chateau-rayas': '1011251',
  'mos-egon-muller-scharzhof': '1011268',
  'nap-screaming-eagle': '1011273',
  'por-niepoort-vintage-port': '1011284',
  'arg-catena-zapata-malbec': '1011292',
  'aus-penfolds-grange': '1011305',
};

/**
 * 12 featured wines.
 * 필드 매핑 (keyscreen Wine → wines_localized):
 *   - `lwin`              ← SLUG_TO_LWIN[wine.id]
 *   - `display_name`      ← wine.producer.en + ' ' + wine.name (또는 그냥 wine.name)
 *   - `name_ko`           ← wine.producer.ko + ' ' + wine.name (한글 producer 있는 항목만)
 *   - `producer_name`     ← wine.producer.en
 *   - `country`           ← wine.country.en
 *   - `region`            ← wine.region.en
 *   - `classification`    ← wine.appellation.en
 *   - `bottle_color`      ← wine.bottleColor
 *   - `type_canonical`    ← wine.wineType ('red'|'white'|'sparkling'|'fortified')
 *   - `type_raw`          ← wine.wineType (동일)
 *   - `vintage`           ← wine.vintage
 *   - `drink_window_*_year` ← wine.drinkWindow.{from|peak|to}
 *   - `producer_title`    ← null (keyscreen에 동등 필드 없음)
 *   - `status`            ← 'active' (모두 활성 카탈로그)
 *   - `wine`              ← wine.name (LWIN raw `wine` 컬럼 — display_name과 동일 시 보존)
 */
export const MOCK_WINES: WineLocalizedRow[] = [
  {
    lwin: '1011196',
    display_name: 'Château Margaux 2018',
    name_ko: '샤또 마고 2018',
    producer_name: 'Château Margaux',
    producer_title: null,
    country: 'France',
    region: 'Bordeaux',
    classification: 'Margaux 1er Grand Cru Classé',
    bottle_color: '#5b1424',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2018,
    drink_window_from_year: 2026,
    drink_window_peak_year: 2035,
    drink_window_to_year: 2050,
    status: 'active',
    wine: 'Château Margaux',
  },
  {
    lwin: '1011207',
    display_name: 'Domaine de la Romanée-Conti Romanée-Saint-Vivant Grand Cru 2018',
    name_ko: '도멘 드 라 로마네 콩티 로마네 생 비방 그랑 크뤼 2018',
    producer_name: 'Domaine de la Romanée-Conti',
    producer_title: null,
    country: 'France',
    region: 'Burgundy',
    classification: 'Vosne-Romanée Grand Cru',
    bottle_color: '#7a1f33',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2018,
    drink_window_from_year: 2026,
    drink_window_peak_year: 2035,
    drink_window_to_year: 2050,
    status: 'active',
    wine: 'Romanée-Saint-Vivant Grand Cru',
  },
  {
    lwin: '1011219',
    display_name: 'Krug Grande Cuvée 171ème Édition',
    name_ko: '크루그 그랑 퀴베 171에디션',
    producer_name: 'Krug',
    producer_title: null,
    country: 'France',
    region: 'Champagne',
    classification: 'Champagne NV (multi-vintage)',
    bottle_color: '#caa84e',
    type_canonical: 'sparkling',
    type_raw: 'sparkling',
    vintage: 2015,
    drink_window_from_year: 2023,
    drink_window_peak_year: 2028,
    drink_window_to_year: 2038,
    status: 'active',
    wine: 'Grande Cuvée 171ème Édition',
  },
  {
    lwin: '1011225',
    display_name: 'Biondi-Santi Brunello di Montalcino 2016',
    name_ko: '비온디 산티 브루넬로 디 몬탈치노 2016',
    producer_name: 'Biondi-Santi',
    producer_title: null,
    country: 'Italy',
    region: 'Tuscany',
    classification: 'Brunello di Montalcino DOCG',
    bottle_color: '#7c1a2a',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2016,
    drink_window_from_year: 2026,
    drink_window_peak_year: 2036,
    drink_window_to_year: 2050,
    status: 'active',
    wine: 'Brunello di Montalcino',
  },
  {
    lwin: '1011230',
    display_name: 'Giacomo Conterno Barolo Cascina Francia 2017',
    name_ko: '쟈코모 콘테르노 바롤로 카시나 프란치아 2017',
    producer_name: 'Giacomo Conterno',
    producer_title: null,
    country: 'Italy',
    region: 'Piedmont',
    classification: 'Barolo DOCG',
    bottle_color: '#691728',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2017,
    drink_window_from_year: 2027,
    drink_window_peak_year: 2037,
    drink_window_to_year: 2055,
    status: 'active',
    wine: 'Barolo Cascina Francia',
  },
  {
    lwin: '1011245',
    display_name: 'R. López de Heredia Viña Tondonia Gran Reserva 2010',
    name_ko: '로페즈 데 에레디아 비냐 톤도니아 그란 레세르바 2010',
    producer_name: 'R. López de Heredia',
    producer_title: null,
    country: 'Spain',
    region: 'Rioja',
    classification: 'Rioja Alta Gran Reserva',
    bottle_color: '#5b1424',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2010,
    drink_window_from_year: 2024,
    drink_window_peak_year: 2030,
    drink_window_to_year: 2050,
    status: 'active',
    wine: 'Viña Tondonia Gran Reserva',
  },
  {
    lwin: '1011251',
    display_name: 'Château Rayas Châteauneuf-du-Pape 2017',
    name_ko: '샤또 라야스 샤또네프 뒤 빠쁘 2017',
    producer_name: 'Château Rayas',
    producer_title: null,
    country: 'France',
    region: 'Rhône',
    classification: 'Châteauneuf-du-Pape',
    bottle_color: '#80213b',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2017,
    drink_window_from_year: 2024,
    drink_window_peak_year: 2032,
    drink_window_to_year: 2045,
    status: 'active',
    wine: 'Châteauneuf-du-Pape',
  },
  {
    lwin: '1011268',
    display_name: 'Egon Müller Scharzhofberger Riesling Kabinett 2019',
    name_ko: '에곤 뮐러 샤르츠호프베르거 리슬링 카비넷 2019',
    producer_name: 'Egon Müller',
    producer_title: null,
    country: 'Germany',
    region: 'Mosel',
    classification: 'Saar',
    bottle_color: '#c9b86a',
    type_canonical: 'white',
    type_raw: 'white',
    vintage: 2019,
    drink_window_from_year: 2022,
    drink_window_peak_year: 2030,
    drink_window_to_year: 2050,
    status: 'active',
    wine: 'Scharzhofberger Riesling Kabinett',
  },
  {
    lwin: '1011273',
    display_name: 'Screaming Eagle 2017',
    name_ko: '스크리밍 이글 2017',
    producer_name: 'Screaming Eagle',
    producer_title: null,
    country: 'USA',
    region: 'Napa Valley',
    classification: 'Oakville AVA',
    bottle_color: '#3f0f1f',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2017,
    drink_window_from_year: 2024,
    drink_window_peak_year: 2034,
    drink_window_to_year: 2050,
    status: 'active',
    wine: 'Screaming Eagle',
  },
  {
    lwin: '1011284',
    display_name: 'Niepoort Vintage Port 2011',
    name_ko: '니푸르트 빈티지 포트 2011',
    producer_name: 'Niepoort',
    producer_title: null,
    country: 'Portugal',
    region: 'Douro',
    classification: 'Vintage Port',
    bottle_color: '#3a0a1c',
    type_canonical: 'fortified',
    type_raw: 'fortified',
    vintage: 2011,
    drink_window_from_year: 2030,
    drink_window_peak_year: 2040,
    drink_window_to_year: 2070,
    status: 'active',
    wine: 'Niepoort Vintage Port',
  },
  {
    lwin: '1011292',
    display_name: 'Bodega Catena Zapata Adrianna Malbec 2018',
    name_ko: '보데가 카테나 자파타 아드리아나 말벡 2018',
    producer_name: 'Bodega Catena Zapata',
    producer_title: null,
    country: 'Argentina',
    region: 'Mendoza',
    classification: 'Gualtallary IG',
    bottle_color: '#4a1226',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2018,
    drink_window_from_year: 2024,
    drink_window_peak_year: 2032,
    drink_window_to_year: 2045,
    status: 'active',
    wine: 'Adrianna Malbec',
  },
  {
    lwin: '1011305',
    display_name: 'Penfolds Grange 2017',
    name_ko: '펜폴즈 그란지 2017',
    producer_name: 'Penfolds',
    producer_title: null,
    country: 'Australia',
    region: 'Barossa Valley',
    classification: 'South Australia',
    bottle_color: '#3a0a1c',
    type_canonical: 'red',
    type_raw: 'red',
    vintage: 2017,
    drink_window_from_year: 2025,
    drink_window_peak_year: 2035,
    drink_window_to_year: 2055,
    status: 'active',
    wine: 'Penfolds Grange',
  },
];

const WINE_BY_LWIN = new Map<string, WineLocalizedRow>(MOCK_WINES.map((w) => [w.lwin ?? '', w]));

/** LWIN으로 mock wine 조회. 없으면 null. */
export function getMockWineByLwin(lwin: string | null | undefined): WineLocalizedRow | null {
  if (!lwin) return null;
  return WINE_BY_LWIN.get(lwin) ?? null;
}

/** Fallback LWIN — mock 매핑이 없는 wineId/lwin에 대한 시각 검증용 default. */
export const FALLBACK_LWIN = '1011196'; // Château Margaux
