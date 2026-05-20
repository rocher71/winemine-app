/**
 * BeginnerForm — 6 Step verbatim 재작성 (Day 6 retroactive hardening).
 *
 * 사양: design-spec notes-write.md §2-2 BeginnerForm + §10 E6 (재작성) + §11-2 BeginnerFields shape.
 * 키스크린 원본: beginner-note.tsx + note-write-beginner.tsx.
 *
 * 구조 (gap 18):
 *   ├── BeginnerHeader (eyebrow + WineName + Producer + Greeting)
 *   ├── Step 1 — 첫 인상 (StepHeader + ImpressionTriad)
 *   ├── Step 2 — 맛의 균형 (StepHeader + PalateTriad)
 *   ├── Step 3 — 어떤 향이 떠올라요? (StepHeader + AromaGrid 8)
 *   ├── Step 4 — 여운은 얼마나? (StepHeader + FinishTriad)
 *   ├── Step 5 — 평점 (StepHeader + StarRating)
 *   ├── Step 6 — 한 줄 메모 (StepHeader + Memo TextInput)
 *   ├── AutoSummaryCard
 *   ├── PriceCapture
 *   └── ShareToCommunity
 *
 * 카드 wrapper 없이 일렬 (step 사이 gap 18). 보조 카드 3종(AutoSummary/Price/Share)만 wrapper 사용.
 *
 * BeginnerFields shape (DB tasting_notes.beginner_fields jsonb):
 *   { impression, palate{sweetness,acidity,body,tannin?,bubble?}, aromas[], finish, memo,
 *     priceCapture?, shareToCommunity? }
 */
import { useMemo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BeginnerHeader } from './beginner-header';
import { StepHeader } from './step-header';
import { ImpressionTriad, type ImpressionValue } from './impression-triad';
import {
  PalateTriad,
  defaultPalateState,
  type PalateState,
  type PalateDim,
} from './palate-triad';
import { AromaGrid, type AromaTag } from './aroma-grid';
import { FinishTriad, type FinishLevel } from './finish-triad';
import { StarRating } from './star-rating';
import { AutoSummaryCard } from './auto-summary-card';
import { PriceCapture, defaultPriceCapture, type PriceCaptureState } from './price-capture';
import { ShareToCommunity } from './share-to-community';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { summarizeBeginner } from '@/lib/notes/summarize';
import { currentLocale } from '@/lib/i18n';
import type { WineLocalized } from '@/hooks/use-wine';

// ---- Public types (DB jsonb shape + export 유지 — note-body-beginner.tsx 호환) ----

export type BeginnerImpression = ImpressionValue;
export type BeginnerPalate = PalateState;
export type BeginnerFinish = FinishLevel;
export type BeginnerAroma = AromaTag;

export interface BeginnerFields {
  impression: BeginnerImpression;
  palate: BeginnerPalate;
  aromas: BeginnerAroma[];
  finish: BeginnerFinish;
  memo: string;
  priceCapture?: PriceCaptureState;
  shareToCommunity?: boolean;
}

interface Props {
  wine: WineLocalized | null;
  rating: number;
  onRatingChange: (v: number) => void;
  fields: BeginnerFields;
  onFieldsChange: (f: BeginnerFields) => void;
}

export function BeginnerForm({ wine, rating, onRatingChange, fields, onFieldsChange }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  // Memo bg: D3 — dark은 bottle-shelf(#1A0A1E 어두운 wine 분위기), light은 bg-deep(#F2EAD9 가독성).
  const memoBg = scheme === 'light' ? light.bg.deep : dark.bg.bottleShelf;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const textPrimary = scheme === 'light' ? light.text.primary : dark.text.primary;
  const textDisabled = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  // 와인 type으로 dim 분기 (red면 tannin, sparkling이면 bubble).
  const palateDims: ReadonlyArray<PalateDim> = useMemo(() => {
    const type = wine?.type_canonical;
    const base: PalateDim[] = ['sweetness', 'acidity', 'body'];
    if (type === 'sparkling') return [...base, 'bubble'];
    if (type === 'white' || type === 'rose') return base;
    // red / fortified / dessert / unknown → tannin
    return [...base, 'tannin'];
  }, [wine?.type_canonical]);

  // Auto summary (useMemo — 입력값 변경 시만 재계산).
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const summaryText = useMemo(
    () =>
      summarizeBeginner({
        impression: fields.impression,
        palate: fields.palate,
        aromas: fields.aromas,
        finish: fields.finish,
        rating,
        locale,
      }),
    [fields.impression, fields.palate, fields.aromas, fields.finish, rating, locale],
  );

  // Patch helpers
  const setImpression = (v: ImpressionValue) => onFieldsChange({ ...fields, impression: v });
  const setPalate = (next: PalateState) => onFieldsChange({ ...fields, palate: next });
  const setAromas = (next: readonly AromaTag[]) =>
    onFieldsChange({ ...fields, aromas: [...next] });
  const setFinish = (v: FinishLevel) => onFieldsChange({ ...fields, finish: v });
  const setMemo = (v: string) => onFieldsChange({ ...fields, memo: v });
  const setPriceCapture = (v: PriceCaptureState) =>
    onFieldsChange({ ...fields, priceCapture: v });
  const setShare = (v: boolean) => onFieldsChange({ ...fields, shareToCommunity: v });

  return (
    <View style={{ rowGap: 18 }}>
      {/* BeginnerHeader (eyebrow + WineName + Producer + Greeting) */}
      <BeginnerHeader wine={wine} variant="beginner" />

      {/* Step 1 — 첫 인상 */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={1} title={t('notes.writeForm.beginnerStep.impression')} variant="beginner" />
        <ImpressionTriad value={fields.impression} onChange={setImpression} />
      </View>

      {/* Step 2 — 맛의 균형 */}
      <View style={{ rowGap: 10 }}>
        <StepHeader step={2} title={t('notes.writeForm.beginnerStep.palate')} variant="beginner" />
        <PalateTriad value={fields.palate} onChange={setPalate} dims={palateDims} />
      </View>

      {/* Step 3 — 어떤 향이 떠올라요? */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={3} title={t('notes.writeForm.beginnerStep.aroma')} variant="beginner" />
        <AromaGrid selected={fields.aromas} onChange={setAromas} />
      </View>

      {/* Step 4 — 여운은 얼마나? */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={4} title={t('notes.writeForm.beginnerStep.finish')} variant="beginner" />
        <FinishTriad value={fields.finish} onChange={setFinish} />
      </View>

      {/* Step 5 — 평점 */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={5} title={t('notes.rating')} variant="beginner" />
        <StarRating value={rating} onChange={onRatingChange} />
      </View>

      {/* Step 6 — 한 줄 메모 */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={6} title={t('notes.writeForm.beginnerStep.memo')} variant="beginner" />
        <TextInput
          value={fields.memo}
          onChangeText={setMemo}
          placeholder={t('notes.writeForm.beginnerMemoPlaceholder')}
          placeholderTextColor={textDisabled}
          multiline
          numberOfLines={3}
          maxLength={5000}
          accessibilityLabel={t('notes.writeForm.beginnerStep.memo')}
          style={{
            backgroundColor: memoBg,
            borderWidth: 1,
            borderColor: borderDefault,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            color: textPrimary,
            minHeight: 80,
            textAlignVertical: 'top',
          }}
        />
      </View>

      {/* AutoSummaryCard */}
      <AutoSummaryCard text={summaryText} />

      {/* PriceCapture (UI state only — DB는 jsonb에 그대로 저장) */}
      <PriceCapture
        value={fields.priceCapture ?? defaultPriceCapture()}
        onChange={setPriceCapture}
      />

      {/* ShareToCommunity (UI state only — is_public 컬럼 부재 시 insert payload omit) */}
      <ShareToCommunity value={fields.shareToCommunity ?? false} onChange={setShare} />
    </View>
  );
}

export function defaultBeginnerFields(): BeginnerFields {
  return {
    impression: 'smile',
    palate: defaultPalateState(),
    aromas: [],
    finish: 'medium',
    memo: '',
    priceCapture: defaultPriceCapture(),
    shareToCommunity: false,
  };
}

// Suppress unused warning for `brand` import used elsewhere if tree-shake misses it
void brand;
