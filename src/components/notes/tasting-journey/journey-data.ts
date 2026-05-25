/**
 * journey-data.ts — Tasting Journey (전문가 조회) 뷰 모델 리졸버.
 *
 * 디자인 출처: Claude Design 핸드오프 `winemine Tasting Note View.html`
 *   → `wm-note-view-c-themed.jsx` (Variant C · Tasting Journey Timeline, dark+light).
 *
 * 실제 노트 데이터(ExpertFields + wines_localized)를 디자인 뷰 모델로 매핑한다.
 * 데이터 모델에 없는 항목(오프닝 타임라인 narrative·Rotundone·T+4 delta·라벨인식%·
 * 색/강도·탄닌 질감·카우달리 수치)은 디자인 기본값으로 채운다.
 * (사용자 결정 2026-05-25: "상세 화면 교체 + 실데이터" — 없는 건 디자인 기본값)
 *
 * 라벨 문자열은 컴포넌트가 i18n(t)으로 해석한다. 여기서는 데이터 값만 산출한다.
 */
import type { TastingNoteDetail } from '@/hooks/use-notes';
import type { ExpertFields } from '@/components/notes/expert-form';
import type { AromaTag } from '@/components/notes/aroma-grid';
import type { WineVariant } from '@/components/notes/variant-tabs';
import {
  AROMA_CATEGORIES,
  wsetToNumber,
  type AromaCategoryId,
  type WSETScale,
} from '@/lib/notes/tasting-note-lexicon';
import { bottleColorDefault } from '@/lib/design-tokens';

export type FinishBand = 'short' | 'medium' | 'long' | 'veryLong';

export interface JourneyAromaCat {
  id: AromaCategoryId;
  color: string;
  tags: AromaTag[];
}

export interface JourneyVM {
  // identity
  type: WineVariant;
  isRed: boolean;
  wineName: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  appellation: string | null;
  bottleColor: string;
  tastedAt: string | null;
  rating: number;
  // ch1 — sight (fallback by type)
  recognitionPct: number;
  sightColorEn: string;
  sightColorKey: 'garnet' | 'ruby' | 'gold' | 'straw' | 'salmon' | 'amber';
  sightIntensityKey: 'pale' | 'medium' | 'deep';
  // ch2 — nose
  aromaCats: JourneyAromaCat[];
  aromaActive: AromaCategoryId[];
  aromaSelected: AromaCategoryId;
  showRotundone: boolean;
  // ch3 — palate (1..5)
  sweet: number;
  acid: number;
  body: number;
  alcohol: number;
  // ch4 — tannin
  tanninStrength: number;
  tanninTextures: string[];
  // ch5 — finish
  finishBand: FinishBand;
  caudalies: number;
  // ch6 — drink window (real or vintage-derived)
  dwFrom: number;
  dwPeak: number;
  dwTo: number;
  // ch7 — closing
  closing: string | null;
}

// 8-tag beginner aroma set → 12-wedge UC Davis 카테고리 매핑.
const TAG_TO_CATEGORY: Record<AromaTag, AromaCategoryId> = {
  berry: 'fruity',
  citrus: 'fruity',
  stoneFruit: 'fruity',
  floral: 'floral',
  spice: 'spicy',
  sweet: 'caramelized',
  earth: 'earthy',
  yeast: 'microbiological',
};

const CATEGORY_COLOR: Record<AromaCategoryId, string> = Object.fromEntries(
  AROMA_CATEGORIES.map((c) => [c.id, c.color]),
) as Record<AromaCategoryId, string>;

// 종류별 sight 색·강도 기본값 (모델에 색/강도 컬럼 부재 → 디자인 fallback).
const SIGHT_BY_TYPE: Record<
  WineVariant,
  { colorEn: string; colorKey: JourneyVM['sightColorKey']; intensity: JourneyVM['sightIntensityKey'] }
> = {
  red: { colorEn: 'Garnet', colorKey: 'garnet', intensity: 'medium' },
  white: { colorEn: 'Straw', colorKey: 'straw', intensity: 'pale' },
  sparkling: { colorEn: 'Gold', colorKey: 'gold', intensity: 'pale' },
  blind: { colorEn: 'Ruby', colorKey: 'ruby', intensity: 'medium' },
};

function finishToBand(finish: string | undefined): { band: FinishBand; caudalies: number } {
  switch (finish) {
    case 'short':
      return { band: 'short', caudalies: 12 };
    case 'medium':
      return { band: 'medium', caudalies: 22 };
    case 'long':
      return { band: 'long', caudalies: 32 };
    case 'veryLong':
      return { band: 'veryLong', caudalies: 37 };
    default:
      return { band: 'long', caudalies: 30 };
  }
}

function wsetNum(v: WSETScale | undefined, fallback: number): number {
  if (!v) return fallback;
  const n = wsetToNumber(v);
  return n >= 1 && n <= 5 ? n : fallback;
}

function variantFromType(typeCanonical: string | null | undefined, fields: ExpertFields): WineVariant {
  if (fields.blind || fields.variant === 'blind') return 'blind';
  if (fields.variant) return fields.variant;
  if (typeCanonical === 'white') return 'white';
  if (typeCanonical === 'sparkling') return 'sparkling';
  return 'red';
}

/**
 * resolveJourney — 실데이터(note/wine/fields)를 JourneyVM으로.
 * locale은 wineName 한글/영문 선택에만 사용.
 */
export function resolveJourney(
  note: TastingNoteDetail,
  fields: ExpertFields,
  locale: 'ko' | 'en',
): JourneyVM {
  const wine = note.wine;
  const type = variantFromType(wine?.type_canonical, fields);
  const isRed = type === 'red';

  const wineName =
    (locale === 'ko' ? wine?.name_ko ?? wine?.display_name : wine?.display_name) ??
    wine?.display_name ??
    '';

  const vintage = typeof wine?.vintage === 'number' ? wine.vintage : null;
  const bottleColor =
    wine?.bottle_color ??
    bottleColorDefault[(wine?.type_canonical as keyof typeof bottleColorDefault) ?? 'red'] ??
    bottleColorDefault.red;

  // ── aroma: 8-tag → 12-category grouping ──
  // jsonb 데이터 방어 — legacy/손상 shape에서 aromas가 배열이 아닐 수 있음.
  const tags: AromaTag[] = Array.isArray(fields.aromas) ? (fields.aromas as AromaTag[]) : [];
  const grouped = new Map<AromaCategoryId, AromaTag[]>();
  for (const tag of tags) {
    const cat = TAG_TO_CATEGORY[tag];
    if (!cat) continue;
    const arr = grouped.get(cat) ?? [];
    arr.push(tag);
    grouped.set(cat, arr);
  }
  const aromaCats: JourneyAromaCat[] = [...grouped.entries()].map(([id, t]) => ({
    id,
    color: CATEGORY_COLOR[id],
    tags: t,
  }));
  const aromaActive = aromaCats.map((c) => c.id);
  // selected = 가장 많은 태그를 가진 카테고리 (없으면 'fruity')
  const aromaSelected =
    aromaCats.slice().sort((a, b) => b.tags.length - a.tags.length)[0]?.id ?? 'fruity';
  const showRotundone = isRed && tags.includes('spice');

  // ── palate WSET (1..5) ──
  const palate = fields.palate;
  const sweet = wsetNum(palate?.sweetness, 1);
  const acid = wsetNum(palate?.acidity, 4);
  const body = wsetNum(palate?.body, 4);
  const alcohol = wsetNum(palate?.alcohol, 3);

  // ── tannin (red only) ──
  const tanninStrength = wsetNum(palate?.tannin, 4);
  // 질감은 모델 부재 → 디자인 기본값 (강도 기반 2종).
  const tanninTextures = tanninStrength >= 4 ? ['fine', 'firm'] : ['silky', 'velvety'];

  // ── finish ──
  const { band: finishBand, caudalies } = finishToBand(fields.finish);

  // ── drink window (실제 wine 컬럼 우선, 없으면 vintage 기반) ──
  const baseYear = vintage ?? new Date().getFullYear();
  const dwFrom = wine?.drink_window_from_year ?? baseYear;
  const dwPeak = wine?.drink_window_peak_year ?? baseYear + 7;
  const dwTo = wine?.drink_window_to_year ?? baseYear + 15;

  // ── rating: note.rating(half-step) 우선, 없으면 fields.quality ──
  const rating =
    typeof note.rating === 'number' && note.rating > 0
      ? Number(note.rating)
      : typeof fields.quality === 'number'
        ? fields.quality
        : 0;

  const sight = SIGHT_BY_TYPE[type] ?? SIGHT_BY_TYPE.red;
  // jsonb 데이터 방어 — memo가 문자열이 아닐 수 있음 (legacy/손상 shape).
  const memo = typeof fields.memo === 'string' ? fields.memo.trim() : '';

  return {
    type,
    isRed,
    wineName,
    producer: wine?.producer_name ?? null,
    vintage,
    region: wine?.region ?? null,
    country: wine?.country ?? null,
    appellation: wine?.classification ?? null,
    bottleColor,
    tastedAt: note.tasted_at ?? null,
    rating,
    recognitionPct: 98,
    sightColorEn: sight.colorEn,
    sightColorKey: sight.colorKey,
    sightIntensityKey: sight.intensity,
    aromaCats,
    aromaActive,
    aromaSelected,
    showRotundone,
    sweet,
    acid,
    body,
    alcohol,
    tanninStrength,
    tanninTextures,
    finishBand,
    caudalies,
    dwFrom,
    dwPeak,
    dwTo,
    closing: memo.length > 0 ? memo : null,
  };
}
