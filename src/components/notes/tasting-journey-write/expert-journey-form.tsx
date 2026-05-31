/**
 * ExpertJourneyForm — playground 7-step Expert 작성 폼 충실 재현 (기능 우선 단계).
 *
 * 출처: /Users/yejinkim/dev/winemine/src/app/tasting-note-playground/page.tsx 의 Expert 분기
 *   (CODE-MAP §2.4 7-step 조립도)를 RN으로 재현.
 *   기존 리치 RN 포트(AromaWheelRn/CaudalieMeterRn/OpeningTimelineRn/FaultChecklistRn/
 *   TanninPanelRn·BubblePanelRn/AutoDescriptionRn)를 그대로 합성한다.
 *
 * 7 step (playground 순서 verbatim):
 *   1 라벨 인식(CaptureCard — 실 wine 데이터)
 *   2 향   = aromaIntensity WSETSlider5 + AromaWheelRn (120 어휘)
 *   3 미각 = sweetness/acidity/body/alcohol WSETSlider5 + (red→TanninPanel / sparkling→BubblePanel)
 *   4 여운 = CaudalieMeterRn (탭 타이머)
 *   5 결함 = FaultChecklistRn (11종)
 *   6 오프닝 타임라인 = OpeningTimelineRn (timepoint/delta/peak/chart)
 *   7 평가 = StarRating + AutoDescriptionRn
 *
 * 상단: VariantTabs(white/red/sparkling/blind) + Blind 토글.
 *
 * 상태: 리치 ExpertJourneyFields (controlled). 부모(write.tsx)가 소유, jsonb 저장.
 * NOTE(Phase B): 현재 합성된 포트는 light 모드 전용 — 추후 journey-theme 다크/라이트 테마화 예정.
 *
 * §4-4 ko/en (모든 텍스트 t()/lexicon locale). §4-11 Pressable: 자체 Pressable 없음(포트 합성).
 */
import { useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react-native';
import { StepHeader } from '@/components/notes/step-header';
import { VariantTabs, type WineVariant } from '@/components/notes/variant-tabs';
import { WSETSlider5 } from '@/components/notes/wset-slider-5';
import { AromaWheelRn } from '@/components/notes/aroma-wheel-rn';
import { CaudalieMeterRn } from '@/components/notes/caudalie-meter-rn';
import { FaultChecklistRn } from '@/components/notes/fault-checklist-rn';
import { OpeningTimelineRn } from '@/components/notes/opening-timeline-rn';
import { TanninPanelRn, BubblePanelRn } from '@/components/notes/tannin-bubble-panels-rn';
import { AutoDescriptionRn } from '@/components/notes/auto-description-rn';
import { StarRating } from '@/components/notes/star-rating';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  SWEETNESS_LABELS,
  ACIDITY_LABELS,
  BODY_LABELS,
  ALCOHOL_LABELS,
  INTENSITY_LABELS,
  caudalieCategory,
  type EvolutionPoint,
  type Fault,
  type FormVariant,
} from '@/lib/notes/tasting-note-lexicon';
import type { WineLocalized } from '@/hooks/use-wine';
import type { ExpertJourneyFields } from './write-types';

interface Props {
  wine: WineLocalized | null;
  rating: number;
  onRatingChange: (v: number) => void;
  fields: ExpertJourneyFields;
  onFieldsChange: (f: ExpertJourneyFields) => void;
}

function variantFromWineType(t: string | null | undefined): FormVariant {
  if (t === 'white') return 'white';
  if (t === 'sparkling') return 'sparkling';
  return 'red';
}

export function ExpertJourneyForm({
  wine,
  rating,
  onRatingChange,
  fields,
  onFieldsChange,
}: Props) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';

  const patch = (next: Partial<ExpertJourneyFields>) => onFieldsChange({ ...fields, ...next });

  const setVariant = (v: WineVariant) =>
    patch({ variant: v, blind: v === 'blind' ? true : fields.blind });

  const setBlind = (b: boolean) =>
    patch({
      blind: b,
      variant: b
        ? 'blind'
        : fields.variant === 'blind'
          ? variantFromWineType(wine?.type_canonical)
          : fields.variant,
    });

  const setRating = (v: number) => {
    onRatingChange(v);
    patch({ rating: v });
  };

  const showTannin = fields.variant === 'red';
  const showBubble = fields.variant === 'sparkling';

  // wine meta (OpeningTimeline / AutoDescription 입력)
  const wineName =
    (locale === 'ko' ? wine?.name_ko ?? wine?.display_name : wine?.display_name) ??
    wine?.display_name ??
    '';
  const producer = wine?.producer_name ?? '';
  const region = wine?.region ?? '';
  const vintage = typeof wine?.vintage === 'number' ? wine.vintage : null;
  const grapeVarieties: string[] = [];

  // AutoDescription evolution peak
  const peak: EvolutionPoint | null = useMemo(() => {
    const { peakIndex, timepoints } = fields.evolution;
    if (peakIndex == null) return null;
    return timepoints[peakIndex] ?? null;
  }, [fields.evolution]);

  return (
    <View style={{ rowGap: 22 }}>
      {/* Variant tabs */}
      <VariantTabs value={fields.variant} onChange={setVariant} />

      {/* Blind toggle */}
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
            style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 15.6, color: light.text.primary }}
          >
            {t('notes.writeForm.blindMode')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 13.2, color: light.text.muted, marginTop: 2 }}
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

      {/* Step 1 — 라벨 인식 (실 wine 데이터) */}
      <View style={{ rowGap: 10 }}>
        <StepHeader step={1} title={t('notes.expert.stepCapture')} variant="expert" />
        <View
          style={{
            padding: 16,
            borderWidth: 1,
            borderColor: brand.gold,
            borderRadius: 12,
            backgroundColor: withAlpha(brand.gold, 0.04),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6, marginBottom: 8 }}>
            <Camera size={12} strokeWidth={2} color={brand.gold} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 10,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: brand.gold,
              }}
            >
              {t('notes.expert.captureEyebrow')}
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: light.text.primary }}
          >
            {wineName || t('notes.expert.captureUnknownWine')}
          </Text>
          {producer ? (
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontStyle: 'italic',
                fontSize: 12,
                color: brand.gold,
                marginTop: 2,
              }}
            >
              {producer}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, rowGap: 8 }}>
            {vintage != null ? (
              <MetaTile k={t('notes.journey.metaVintage')} v={String(vintage)} />
            ) : null}
            {region ? <MetaTile k={t('notes.journey.metaRegion')} v={region} /> : null}
          </View>
        </View>
      </View>

      {/* Step 2 — 향 */}
      <View style={{ rowGap: 12 }}>
        <StepHeader step={2} title={t('notes.expert.stepAroma')} variant="expert" />
        <WSETSlider5
          label={t('notes.expert.aromaIntensity')}
          value={fields.aromaIntensity}
          onChange={(v) => patch({ aromaIntensity: v })}
          labels={INTENSITY_LABELS}
        />
        <AromaWheelRn
          variant={fields.variant}
          selected={fields.aromaSelected}
          onToggle={(id) => {
            const has = fields.aromaSelected.includes(id);
            patch({
              aromaSelected: has
                ? fields.aromaSelected.filter((x) => x !== id)
                : [...fields.aromaSelected, id],
            });
          }}
        />
      </View>

      {/* Step 3 — 미각 */}
      <View style={{ rowGap: 14 }}>
        <StepHeader step={3} title={t('notes.expert.stepPalate')} variant="expert" />
        <WSETSlider5
          label={t('notes.expert.palateSweetness')}
          value={fields.sweetness}
          onChange={(v) => patch({ sweetness: v })}
          labels={SWEETNESS_LABELS}
        />
        <WSETSlider5
          label={t('notes.expert.palateAcidity')}
          value={fields.acidity}
          onChange={(v) => patch({ acidity: v })}
          labels={ACIDITY_LABELS}
        />
        <WSETSlider5
          label={t('notes.expert.palateBody')}
          value={fields.body}
          onChange={(v) => patch({ body: v })}
          labels={BODY_LABELS}
        />
        <WSETSlider5
          label={t('notes.expert.palateAlcohol')}
          value={fields.alcohol}
          onChange={(v) => patch({ alcohol: v })}
          labels={ALCOHOL_LABELS}
        />
        {showTannin ? (
          <TanninPanelRn state={fields.tannin} onChange={(s) => patch({ tannin: s })} />
        ) : null}
        {showBubble ? (
          <BubblePanelRn
            bubbles={fields.bubbles}
            dosage={fields.dosage}
            onBubbles={(b) => patch({ bubbles: b })}
            onDosage={(d) => patch({ dosage: d })}
          />
        ) : null}
      </View>

      {/* Step 4 — 여운 (caudalie) */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={4} title={t('notes.expert.stepFinish')} variant="expert" />
        <CaudalieMeterRn caudalies={fields.caudalies} onChange={(n) => patch({ caudalies: n })} />
      </View>

      {/* Step 5 — 결함 */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={5} title={t('notes.expert.stepFaults')} variant="expert" />
        <FaultChecklistRn
          selected={fields.faults}
          onToggle={(id: Fault) => {
            const has = fields.faults.includes(id);
            patch({
              faults: has ? fields.faults.filter((x) => x !== id) : [...fields.faults, id],
            });
          }}
        />
      </View>

      {/* Step 6 — 오프닝 타임라인 */}
      <View style={{ rowGap: 8 }}>
        <StepHeader step={6} title={t('notes.expert.stepEvolution')} variant="expert" />
        <OpeningTimelineRn
          variant={fields.variant}
          meta={{ vintage, grapeVarieties, region }}
          state={fields.evolution}
          onOpenedAt={(iso) => patch({ evolution: { ...fields.evolution, openedAt: iso } })}
          onDecant={(b) => patch({ evolution: { ...fields.evolution, decanted: b } })}
          onUpsert={(tp) => {
            const existing = fields.evolution.timepoints.findIndex(
              (p) => p.minutesAfterOpen === tp.minutesAfterOpen,
            );
            const timepoints =
              existing >= 0
                ? fields.evolution.timepoints.map((p, i) => (i === existing ? tp : p))
                : [...fields.evolution.timepoints, tp];
            patch({ evolution: { ...fields.evolution, timepoints } });
          }}
          onPeak={(idx) => patch({ evolution: { ...fields.evolution, peakIndex: idx } })}
        />
      </View>

      {/* Step 7 — 평가 + 자동 묘사 */}
      <View style={{ rowGap: 12 }}>
        <StepHeader step={7} title={t('notes.expert.stepRating')} variant="expert" />
        <StarRating value={rating} onChange={setRating} />
        <AutoDescriptionRn
          variant={fields.variant}
          meta={{ vintage, producer, region, wineName }}
          aroma={{ intensity: fields.aromaIntensity, primary: fields.aromaSelected, secondary: [] }}
          palate={{
            sweetness: fields.sweetness,
            acidity: fields.acidity,
            body: fields.body,
            alcohol: fields.alcohol,
            tannin: showTannin
              ? { intensity: fields.tannin.intensity, texture: fields.tannin.texture }
              : undefined,
          }}
          finish={{
            caudalies: fields.caudalies > 0 ? fields.caudalies : null,
            length: caudalieCategory(fields.caudalies),
          }}
          rating={rating}
          evolution={{ peak }}
        />
      </View>
    </View>
  );
}

function MetaTile({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ width: '50%' }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 9,
          letterSpacing: 1.3,
          textTransform: 'uppercase',
          color: light.text.muted,
        }}
      >
        {k}
      </Text>
      <Text
        allowFontScaling={false}
        style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: light.text.primary, marginTop: 2 }}
      >
        {v}
      </Text>
    </View>
  );
}
