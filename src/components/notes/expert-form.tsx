/**
 * ExpertForm — 키스크린 verbatim 7-Step Expert 노트 작성.
 *
 * 사양: design-spec notes-write.md + ../winemine-keyscreen/src/components/tasting-note/note-write-expert.tsx.
 *
 * 구조 (rowGap 18 — BeginnerForm 패턴과 동일):
 *   ├── BeginnerHeader (variant='expert')
 *   ├── BlindToggle (sticky top — 인쇄/메모 가리는 옵션)
 *   ├── VariantTabs (white/red/sparkling/blind)
 *   ├── Step 1 — 향 (Aroma intensity slider + AromaGrid 8)
 *   ├── Step 2 — 미각 (Palate WSET 5-step 5~6 sliders)
 *   │     sweetness / acidity / body / alcohol / flavor [+ tannin (red) / bubble (sparkling)]
 *   ├── Step 3 — 여운 (FinishTriad)
 *   ├── Step 4 — 평점 (StarRating)
 *   ├── Step 5 — 음용 적기 & 결론 (ReadinessTriad + 예상 가격)
 *   ├── Step 6 — 메모 (TextInput)
 *   ├── Step 7 — 다시 살까? (Switch row)
 *   ├── AutoSummary (Playfair italic)
 *   ├── PriceCapture
 *   └── ShareToCommunity
 *
 * **New ExpertFields shape** (additive, jsonb 호환):
 *   variant / blind / aroma_intensity / aromas[] / palate{} / finish / quality
 *   readiness / estimated_price_krw / would_buy_again / memo / priceCapture? / shareToCommunity?
 *
 * **Legacy shape** (Day 5 이전: appearance/nose/palate/conclusions) — note-body-expert.tsx에서 fallback 처리.
 *
 * Light 모드만 (useColorScheme/dark: 제거).
 */
import { useMemo } from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BeginnerHeader } from './beginner-header';
import { StepHeader } from './step-header';
import { VariantTabs, type WineVariant } from './variant-tabs';
import { WSETSlider5 } from './wset-slider-5';
import { AromaGrid, type AromaTag } from './aroma-grid';
import { FinishTriad, type FinishLevel } from './finish-triad';
import { StarRating } from './star-rating';
import { ReadinessTriad, type Readiness } from './readiness-triad';
import { AutoSummaryCard } from './auto-summary-card';
import { PriceCapture, defaultPriceCapture, type PriceCaptureState } from './price-capture';
import { ShareToCommunity } from './share-to-community';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import type { WineLocalized } from '@/hooks/use-wine';

// ---- New canonical Expert shape ----

export type { Readiness };

export interface ExpertPalate {
  sweetness: number;
  acidity: number;
  body: number;
  alcohol: number;
  flavor_intensity: number;
  tannin?: number;
  bubble?: number;
}

export interface ExpertFields {
  variant: WineVariant;
  blind: boolean;
  aroma_intensity: number;
  aromas: AromaTag[];
  palate: ExpertPalate;
  finish: FinishLevel;
  quality: number; // 1..5 (star)
  readiness: Readiness;
  estimated_price_krw: number | null;
  would_buy_again: boolean;
  memo: string;
  priceCapture?: PriceCaptureState;
  shareToCommunity?: boolean;
}

interface Props {
  wine: WineLocalized | null;
  rating: number;
  onRatingChange: (v: number) => void;
  tastedAt: string;
  onTastedAtChange: (v: string) => void;
  fields: ExpertFields;
  onFieldsChange: (f: ExpertFields) => void;
}

function variantFromWineType(t: string | null | undefined): WineVariant {
  if (t === 'white') return 'white';
  if (t === 'sparkling') return 'sparkling';
  // rose/fortified/dessert/unknown → red (대다수 케이스)
  return 'red';
}

export function ExpertForm({
  wine,
  rating,
  onRatingChange,
  tastedAt,
  onTastedAtChange,
  fields,
  onFieldsChange,
}: Props) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';

  // --- patch helpers ---
  const patch = (next: Partial<ExpertFields>) => onFieldsChange({ ...fields, ...next });
  const patchPalate = (key: keyof ExpertPalate, value: number) =>
    onFieldsChange({ ...fields, palate: { ...fields.palate, [key]: value } });

  const setVariant = (v: WineVariant) => patch({ variant: v, blind: v === 'blind' ? true : fields.blind });
  const setBlind = (b: boolean) => patch({ blind: b, variant: b ? 'blind' : (fields.variant === 'blind' ? variantFromWineType(wine?.type_canonical) : fields.variant) });

  // --- AutoSummary (Playfair italic) ---
  const summaryText = useMemo(() => {
    return summarizeExpert(fields, rating, locale);
  }, [fields, rating, locale]);

  // --- conditional palate dims ---
  const showTannin = fields.variant === 'red';
  const showBubble = fields.variant === 'sparkling';

  return (
    <View style={{ rowGap: 18 }}>
      {/* Wine header */}
      <BeginnerHeader wine={wine} variant="expert" />

      {/* Blind toggle (sticky top — separate from variant tabs) */}
      <View
        style={{
          backgroundColor: light.bg.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: fields.blind ? brand.gold : light.border.default,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 13,
              lineHeight: 15.6,
              color: light.text.primary,
            }}
          >
            {t('notes.writeForm.blindMode')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              lineHeight: 13.2,
              color: light.text.muted,
              marginTop: 2,
            }}
          >
            {t('notes.writeForm.blindHint')}
          </Text>
        </View>
        <Switch
          value={fields.blind}
          onValueChange={setBlind}
          trackColor={{ true: brand.gold, false: light.text.disabled }}
          thumbColor={brand.cream}
          accessibilityLabel={t('notes.writeForm.blindMode')}
        />
      </View>

      {/* Variant tabs (white/red/sparkling/blind) */}
      <VariantTabs value={fields.variant} onChange={setVariant} />

      {/* Step 1 — Aroma */}
      <View style={{ rowGap: 12 }}>
        <StepHeader step={1} title={t('notes.expert.stepAroma')} variant="expert" />
        <WSETSlider5
          label={t('notes.expert.aromaIntensity')}
          value={fields.aroma_intensity}
          onChange={(v) => patch({ aroma_intensity: v })}
        />
        <AromaGrid
          selected={fields.aromas}
          onChange={(next) => patch({ aromas: [...next] })}
        />
      </View>

      {/* Step 2 — Palate */}
      <View style={{ rowGap: 14 }}>
        <StepHeader step={2} title={t('notes.expert.stepPalate')} variant="expert" />
        <WSETSlider5
          label={t('notes.expert.palateSweetness')}
          value={fields.palate.sweetness}
          onChange={(v) => patchPalate('sweetness', v)}
        />
        <WSETSlider5
          label={t('notes.expert.palateAcidity')}
          value={fields.palate.acidity}
          onChange={(v) => patchPalate('acidity', v)}
        />
        <WSETSlider5
          label={t('notes.expert.palateBody')}
          value={fields.palate.body}
          onChange={(v) => patchPalate('body', v)}
        />
        <WSETSlider5
          label={t('notes.expert.palateAlcohol')}
          value={fields.palate.alcohol}
          onChange={(v) => patchPalate('alcohol', v)}
        />
        {showTannin ? (
          <WSETSlider5
            label={t('notes.expert.palateTannin')}
            value={fields.palate.tannin ?? 3}
            onChange={(v) => patchPalate('tannin', v)}
          />
        ) : null}
        {showBubble ? (
          <WSETSlider5
            label={t('notes.expert.palateBubble')}
            value={fields.palate.bubble ?? 3}
            onChange={(v) => patchPalate('bubble', v)}
          />
        ) : null}
        <WSETSlider5
          label={t('notes.expert.palateFlavor')}
          value={fields.palate.flavor_intensity}
          onChange={(v) => patchPalate('flavor_intensity', v)}
        />
      </View>

      {/* Step 3 — Finish */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={3} title={t('notes.expert.stepFinish')} variant="expert" />
        <FinishTriad value={fields.finish} onChange={(v) => patch({ finish: v })} />
      </View>

      {/* Step 4 — Rating */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={4} title={t('notes.rating')} variant="expert" />
        <StarRating value={rating} onChange={onRatingChange} />
      </View>

      {/* Step 5 — Readiness & estimated price */}
      <View style={{ rowGap: 10 }}>
        <StepHeader step={5} title={t('notes.expert.stepConclusions')} variant="expert" />
        <View style={{ rowGap: 6 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              lineHeight: 14.4,
              color: light.text.primary,
            }}
          >
            {t('notes.expert.conclusionsReadiness')}
          </Text>
          <ReadinessTriad
            value={fields.readiness}
            onChange={(v) => patch({ readiness: v })}
          />
        </View>
        <PriceEstimate
          value={fields.estimated_price_krw}
          onChange={(v) => patch({ estimated_price_krw: v })}
        />
      </View>

      {/* Step 6 — Memo */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={6} title={t('notes.expert.stepMemo')} variant="expert" />
        <TextInput
          value={fields.memo}
          onChangeText={(v) => patch({ memo: v })}
          placeholder={t('notes.writeForm.expertMemoPlaceholder')}
          placeholderTextColor={light.text.disabled}
          multiline
          numberOfLines={3}
          maxLength={5000}
          accessibilityLabel={t('notes.expert.stepMemo')}
          style={{
            backgroundColor: light.bg.deep,
            borderWidth: 1,
            borderColor: light.border.default,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            lineHeight: 20,
            color: light.text.primary,
            minHeight: 96,
            textAlignVertical: 'top',
            fontFamily: 'Freesentation_4Regular',
          }}
        />
      </View>

      {/* Step 7 — Would buy again */}
      <View
        style={{
          backgroundColor: light.bg.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: fields.would_buy_again ? brand.gold : light.border.default,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 12,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontSize: 13,
            lineHeight: 15.6,
            color: light.text.primary,
            flex: 1,
          }}
        >
          {t('notes.expert.wouldBuyAgain')}
        </Text>
        <Switch
          value={fields.would_buy_again}
          onValueChange={(v) => patch({ would_buy_again: v })}
          trackColor={{ true: brand.gold, false: light.text.disabled }}
          thumbColor={brand.cream}
          accessibilityLabel={t('notes.expert.wouldBuyAgain')}
        />
      </View>

      {/* Auto summary */}
      <AutoSummaryCard text={summaryText} />

      {/* PriceCapture (paid price) */}
      <PriceCapture
        value={fields.priceCapture ?? defaultPriceCapture()}
        onChange={(v) => patch({ priceCapture: v })}
      />

      {/* Share to community */}
      <ShareToCommunity
        value={fields.shareToCommunity ?? false}
        onChange={(v) => patch({ shareToCommunity: v })}
      />

      {/* Tasted-at (hidden — write screen already controls; expose simple inline note) */}
      {/* Suppress: tastedAt prop is consumed by parent for DB write; UI exposure is via header. */}
      <HiddenTastedAtMarker tastedAt={tastedAt} onTastedAtChange={onTastedAtChange} />
    </View>
  );
}

function PriceEstimate({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const { t } = useTranslation();
  const text = value !== null ? String(value) : '';
  return (
    <View style={{ rowGap: 6 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          lineHeight: 14.4,
          color: light.text.primary,
        }}
      >
        {t('notes.expert.conclusionsPriceKrw')}
      </Text>
      <TextInput
        value={text}
        onChangeText={(raw) => {
          const trimmed = raw.trim();
          if (!trimmed) {
            onChange(null);
            return;
          }
          const n = parseInt(trimmed.replace(/[^0-9]/g, ''), 10);
          onChange(Number.isNaN(n) ? null : n);
        }}
        placeholder={t('notes.writeForm.pricePlaceholder')}
        placeholderTextColor={light.text.disabled}
        keyboardType="number-pad"
        accessibilityLabel={t('notes.expert.conclusionsPriceKrw')}
        style={{
          backgroundColor: light.bg.deep,
          borderWidth: 1,
          borderColor: light.border.default,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: light.text.primary,
          fontFamily: 'Freesentation_4Regular',
        }}
      />
    </View>
  );
}

/**
 * HiddenTastedAtMarker — keep `tastedAt` callback prop wired without rendering UI.
 * write.tsx 호환 — 향후 노출 시 단순 inline 노출.
 */
function HiddenTastedAtMarker({
  tastedAt,
  onTastedAtChange,
}: {
  tastedAt: string;
  onTastedAtChange: (v: string) => void;
}) {
  // 현재 v0.1.0: tastedAt은 자동(today) — write 화면 mount 시점에 설정.
  // 컴포넌트가 prop을 받아두기만 함 (silent).
  void tastedAt;
  void onTastedAtChange;
  return null;
}

// ---- AutoSummary for Expert ----
function summarizeExpert(f: ExpertFields, rating: number, locale: 'ko' | 'en'): string {
  const ratingTxt =
    rating > 0
      ? locale === 'ko'
        ? ` ${rating.toFixed(rating % 1 === 0 ? 0 : 1)}점.`
        : ` ${rating.toFixed(rating % 1 === 0 ? 0 : 1)}/5.`
      : '';

  if (locale === 'ko') {
    const bodyTxt = f.palate.body >= 4 ? '묵직한 바디' : f.palate.body <= 2 ? '가벼운 바디' : '균형 잡힌 바디';
    const acidTxt = f.palate.acidity >= 4 ? '또렷한 산미' : f.palate.acidity <= 2 ? '부드러운 산미' : '안정된 산미';
    const finishTxt = f.finish === 'long' ? '긴 여운' : f.finish === 'short' ? '짧은 여운' : '적당한 여운';
    const variantTxt =
      f.variant === 'red' ? '레드' : f.variant === 'white' ? '화이트' : f.variant === 'sparkling' ? '스파클링' : '블라인드';
    return `${variantTxt} 와인. ${bodyTxt}, ${acidTxt}에 ${finishTxt}.${ratingTxt}`.trim();
  }
  const bodyTxt = f.palate.body >= 4 ? 'full-bodied' : f.palate.body <= 2 ? 'light-bodied' : 'medium-bodied';
  const acidTxt = f.palate.acidity >= 4 ? 'bright acidity' : f.palate.acidity <= 2 ? 'soft acidity' : 'balanced acidity';
  const finishTxt = f.finish === 'long' ? 'long finish' : f.finish === 'short' ? 'short finish' : 'medium finish';
  const variantTxt =
    f.variant === 'red' ? 'red' : f.variant === 'white' ? 'white' : f.variant === 'sparkling' ? 'sparkling' : 'blind';
  return `A ${variantTxt} wine — ${bodyTxt}, ${acidTxt}, ${finishTxt}.${ratingTxt}`.trim();
}

// ---- Default factory ----
export function defaultExpertFields(): ExpertFields {
  return {
    variant: 'red',
    blind: false,
    aroma_intensity: 3,
    aromas: [],
    palate: {
      sweetness: 2,
      acidity: 3,
      body: 3,
      alcohol: 3,
      flavor_intensity: 3,
      tannin: 3,
    },
    finish: 'medium',
    quality: 3,
    readiness: 'drink',
    estimated_price_krw: null,
    would_buy_again: false,
    memo: '',
    priceCapture: defaultPriceCapture(),
    shareToCommunity: false,
  };
}

// Suppress unused token import (kept for future readability/grep)
void withAlpha;
