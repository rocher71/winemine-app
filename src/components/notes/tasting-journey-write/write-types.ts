/**
 * write-types.ts — Tasting Journey "작성" 모드의 리치 상태 모델.
 *
 * 출처: /Users/yejinkim/dev/winemine/src/app/tasting-note-playground/page.tsx 의 `State`
 *   (CODE-MAP §2.1) 를 충실히 포팅. playground의 7-step 입력을 그대로 담는다.
 *
 * 영속화: tasting_notes.expert_fields (jsonb) — 마이그레이션 불필요.
 *   저장 시 `toExpertFieldsBlob()` 로 **리치 키 + legacy 호환 키**를 한 객체에 함께 기록한다.
 *   - 리치 키(aromaSelected/caudalies/tannin/bubbles/dosage/evolution/faults)
 *     → 새 조회(resolveJourney v2) + 작성 round-trip
 *   - legacy 키(variant/blind/aroma_intensity/aromas/palate/finish/quality/…)
 *     → 기존 note-body-expert / 구버전 resolveJourney 가 그대로 읽어 깨지지 않음
 *   - `v: 2` 디스크리미네이터로 리치/legacy 구분
 *
 * §4-4 ko/en 양쪽 · §4-5 익명화 무관(본인 노트) · 하드코딩 hex 0 (이 파일은 데이터만).
 */
import {
  LEX_BY_ID,
  caudalieCategory,
  numberToWset,
  wsetToNumber,
  type WSETScale,
  type FormVariant,
  type TanninTexture,
  type TanninRipeness,
  type BubbleSize,
  type BubblePersistence,
  type MousseTexture,
  type SparklingMethod,
  type SparklingDosage,
  type Fault,
  type FinishLength,
  type AromaCategoryId,
  type EvolutionPoint,
} from '@/lib/notes/tasting-note-lexicon';

// 앱 기존 타입 재사용 (legacy 호환 어댑터용)
import type { AromaTag } from '@/components/notes/aroma-grid';
import type { FinishLevel } from '@/components/notes/finish-triad';
import type { Readiness } from '@/components/notes/readiness-triad';
import type { PriceCaptureState } from '@/components/notes/price-capture';

// ── Rich state (playground State 포팅) ───────────────────────────────────────

export interface TanninState {
  intensity: WSETScale;
  texture: TanninTexture;
  ripeness: TanninRipeness;
}

export interface BubbleState {
  size: BubbleSize;
  persistence: BubblePersistence;
  mousse: MousseTexture;
  pressure: number; // 1..6 atm
  method: SparklingMethod;
}

export interface EvolutionState {
  openedAt: string | null;
  decanted: boolean;
  timepoints: EvolutionPoint[];
  peakIndex: number | null;
}

/**
 * ExpertJourneyFields — 작성 작업본(리치). playground State + 앱 결론(가격/재구매/공유) 보강.
 * jsonb 직렬화 가능한 순수 데이터만.
 */
export interface ExpertJourneyFields {
  variant: FormVariant; // white | red | sparkling | blind
  blind: boolean;
  aromaIntensity: WSETScale;
  aromaSelected: string[]; // AROMA_LEXICON id 배열 (120종)
  sweetness: WSETScale;
  acidity: WSETScale;
  body: WSETScale;
  alcohol: WSETScale;
  tannin: TanninState; // red 전용 입력 (다른 variant는 기본값 유지)
  bubbles: BubbleState; // sparkling 전용
  dosage: SparklingDosage; // sparkling 전용
  caudalies: number;
  faults: Fault[];
  evolution: EvolutionState;
  rating: number; // 0..5 (note.rating과 동기화)
  memo: string;
  // 앱 결론 단계 (playground엔 없음 — 앱 기존 기능 유지)
  estimatedPriceKrw: number | null;
  readiness: Readiness;
  wouldBuyAgain: boolean;
  priceCapture?: PriceCaptureState;
  shareToCommunity?: boolean;
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export function defaultExpertJourneyFields(): ExpertJourneyFields {
  return {
    variant: 'red',
    blind: false,
    aromaIntensity: 'medium',
    aromaSelected: [],
    sweetness: 'low',
    acidity: 'medium',
    body: 'medium',
    alcohol: 'medium',
    tannin: { intensity: 'medium', texture: 'fineGrained', ripeness: 'ripe' },
    bubbles: {
      size: 'fine',
      persistence: 'persistent',
      mousse: 'creamy',
      pressure: 6,
      method: 'traditional',
    },
    dosage: 'brut',
    caudalies: 0,
    faults: [],
    evolution: { openedAt: null, decanted: false, timepoints: [], peakIndex: null },
    rating: 0,
    memo: '',
    estimatedPriceKrw: null,
    readiness: 'drink',
    wouldBuyAgain: false,
  };
}

// ── legacy 호환 매핑 헬퍼 ─────────────────────────────────────────────────────

/** AROMA_CATEGORIES id → 8-tag AromaTag (legacy aromas[] 호환). 미대응 카테고리는 근사 매핑. */
const CATEGORY_TO_TAG: Record<AromaCategoryId, AromaTag> = {
  fruity: 'berry',
  floral: 'floral',
  spicy: 'spice',
  herbaceous: 'earth',
  nutty: 'sweet',
  caramelized: 'sweet',
  woody: 'earth',
  earthy: 'earth',
  chemical: 'earth',
  pungent: 'spice',
  oxidized: 'earth',
  microbiological: 'yeast',
};

/** 리치 aromaSelected(lexicon id[]) → legacy 8-tag set (중복 제거). */
export function aromaSelectedToTags(ids: readonly string[]): AromaTag[] {
  const out = new Set<AromaTag>();
  for (const id of ids) {
    const entry = LEX_BY_ID[id];
    if (!entry) continue;
    out.add(CATEGORY_TO_TAG[entry.category]);
  }
  return [...out];
}

/** caudalies → legacy FinishLevel(short|medium|long). veryLong은 long으로 합침. */
export function caudaliesToFinishLevel(c: number): FinishLevel {
  const band: FinishLength = caudalieCategory(c);
  return band === 'short' ? 'short' : band === 'medium' ? 'medium' : 'long';
}

// ── jsonb 저장/복원 ──────────────────────────────────────────────────────────

/**
 * toExpertFieldsBlob — 리치 state → expert_fields jsonb (리치 + legacy 호환 키 + v:2).
 * 기존 reader(note-body-expert / 구 resolveJourney)가 legacy 키로 그대로 읽는다.
 */
export function toExpertFieldsBlob(f: ExpertJourneyFields): Record<string, unknown> {
  return {
    v: 2,
    // ── 리치 키 ──
    variant: f.variant,
    blind: f.blind,
    aromaIntensity: f.aromaIntensity,
    aromaSelected: [...f.aromaSelected],
    sweetness: f.sweetness,
    acidity: f.acidity,
    body: f.body,
    alcohol: f.alcohol,
    tannin: { ...f.tannin },
    bubbles: { ...f.bubbles },
    dosage: f.dosage,
    caudalies: f.caudalies,
    faults: [...f.faults],
    evolution: {
      openedAt: f.evolution.openedAt,
      decanted: f.evolution.decanted,
      timepoints: f.evolution.timepoints.map((tp) => ({ ...tp })),
      peakIndex: f.evolution.peakIndex,
    },
    rating: f.rating,
    memo: f.memo,
    estimatedPriceKrw: f.estimatedPriceKrw,
    readiness: f.readiness,
    wouldBuyAgain: f.wouldBuyAgain,
    priceCapture: f.priceCapture,
    shareToCommunity: f.shareToCommunity ?? false,
    // ── legacy 호환 키 (기존 reader 비파손) ──
    aroma_intensity: f.aromaIntensity,
    aromas: aromaSelectedToTags(f.aromaSelected),
    palate: {
      sweetness: f.sweetness,
      acidity: f.acidity,
      body: f.body,
      alcohol: f.alcohol,
      flavor_intensity: f.aromaIntensity,
      tannin: f.tannin.intensity,
      bubble: numberToWset(Math.min(5, Math.max(1, f.bubbles.pressure))),
    },
    finish: caudaliesToFinishLevel(f.caudalies),
    quality: f.rating,
    estimated_price_krw: f.estimatedPriceKrw,
    would_buy_again: f.wouldBuyAgain,
  };
}

/** WSETScale 방어 파서 (jsonb 손상/legacy 대비). */
function asWset(v: unknown, fallback: WSETScale): WSETScale {
  const allowed: WSETScale[] = ['low', 'mediumMinus', 'medium', 'mediumPlus', 'high'];
  return typeof v === 'string' && (allowed as string[]).includes(v) ? (v as WSETScale) : fallback;
}

/**
 * fromExpertFieldsBlob — expert_fields jsonb → 리치 state (편집 round-trip / 방어적).
 * v:2 리치 키 우선, 없으면 legacy 키에서 최대한 복원.
 */
export function fromExpertFieldsBlob(blob: unknown): ExpertJourneyFields {
  const d = defaultExpertJourneyFields();
  if (!blob || typeof blob !== 'object') return d;
  const b = blob as Record<string, unknown>;

  const variant = (['white', 'red', 'sparkling', 'blind'] as const).includes(
    b.variant as FormVariant,
  )
    ? (b.variant as FormVariant)
    : d.variant;

  // aroma: 리치 aromaSelected(lexicon id) 우선
  const aromaSelected = Array.isArray(b.aromaSelected)
    ? (b.aromaSelected.filter((x) => typeof x === 'string') as string[])
    : [];

  const palate = (b.palate ?? {}) as Record<string, unknown>;

  const tanninRaw = (b.tannin ?? {}) as Record<string, unknown>;
  const bubblesRaw = (b.bubbles ?? {}) as Record<string, unknown>;
  const evoRaw = (b.evolution ?? {}) as Record<string, unknown>;

  return {
    variant,
    blind: typeof b.blind === 'boolean' ? b.blind : variant === 'blind',
    aromaIntensity: asWset(b.aromaIntensity ?? b.aroma_intensity, d.aromaIntensity),
    aromaSelected,
    sweetness: asWset(b.sweetness ?? palate.sweetness, d.sweetness),
    acidity: asWset(b.acidity ?? palate.acidity, d.acidity),
    body: asWset(b.body ?? palate.body, d.body),
    alcohol: asWset(b.alcohol ?? palate.alcohol, d.alcohol),
    tannin: {
      intensity: asWset(tanninRaw.intensity ?? palate.tannin, d.tannin.intensity),
      texture: (typeof tanninRaw.texture === 'string'
        ? tanninRaw.texture
        : d.tannin.texture) as TanninTexture,
      ripeness: (typeof tanninRaw.ripeness === 'string'
        ? tanninRaw.ripeness
        : d.tannin.ripeness) as TanninRipeness,
    },
    bubbles: {
      size: (typeof bubblesRaw.size === 'string' ? bubblesRaw.size : d.bubbles.size) as BubbleSize,
      persistence: (typeof bubblesRaw.persistence === 'string'
        ? bubblesRaw.persistence
        : d.bubbles.persistence) as BubblePersistence,
      mousse: (typeof bubblesRaw.mousse === 'string'
        ? bubblesRaw.mousse
        : d.bubbles.mousse) as MousseTexture,
      pressure: typeof bubblesRaw.pressure === 'number' ? bubblesRaw.pressure : d.bubbles.pressure,
      method: (typeof bubblesRaw.method === 'string'
        ? bubblesRaw.method
        : d.bubbles.method) as SparklingMethod,
    },
    dosage: (typeof b.dosage === 'string' ? b.dosage : d.dosage) as SparklingDosage,
    caudalies: typeof b.caudalies === 'number' ? b.caudalies : 0,
    faults: Array.isArray(b.faults) ? (b.faults.filter((x) => typeof x === 'string') as Fault[]) : [],
    evolution: {
      openedAt: typeof evoRaw.openedAt === 'string' ? evoRaw.openedAt : null,
      decanted: typeof evoRaw.decanted === 'boolean' ? evoRaw.decanted : false,
      timepoints: Array.isArray(evoRaw.timepoints)
        ? (evoRaw.timepoints as EvolutionPoint[])
        : [],
      peakIndex: typeof evoRaw.peakIndex === 'number' ? evoRaw.peakIndex : null,
    },
    rating:
      typeof b.rating === 'number'
        ? b.rating
        : typeof b.quality === 'number'
          ? b.quality
          : 0,
    memo: typeof b.memo === 'string' ? b.memo : '',
    estimatedPriceKrw:
      typeof b.estimatedPriceKrw === 'number'
        ? b.estimatedPriceKrw
        : typeof b.estimated_price_krw === 'number'
          ? b.estimated_price_krw
          : null,
    readiness: (['tooYoung', 'drink', 'pastPeak'] as const).includes(b.readiness as Readiness)
      ? (b.readiness as Readiness)
      : d.readiness,
    wouldBuyAgain:
      typeof b.wouldBuyAgain === 'boolean'
        ? b.wouldBuyAgain
        : typeof b.would_buy_again === 'boolean'
          ? b.would_buy_again
          : false,
    priceCapture: b.priceCapture as PriceCaptureState | undefined,
    shareToCommunity: typeof b.shareToCommunity === 'boolean' ? b.shareToCommunity : false,
  };
}

/** 리치 state가 비어있는지(미입력) — 저장 검증 보조. */
export function isExpertJourneyEmpty(f: ExpertJourneyFields): boolean {
  return (
    f.aromaSelected.length === 0 &&
    f.caudalies === 0 &&
    f.faults.length === 0 &&
    f.evolution.timepoints.length === 0 &&
    f.rating === 0 &&
    f.memo.trim().length === 0
  );
}

// numberToWset/wsetToNumber 사용 표식 (tree-shake 보호 — palate.bubble 매핑에서 사용)
void wsetToNumber;
