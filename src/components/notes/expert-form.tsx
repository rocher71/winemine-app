import { View, Text, TextInput, Pressable, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WSETSlider } from './wset-slider';
import { StarRating } from './star-rating';
import { brand, dark, light, expertBlindBg } from '@/lib/design-tokens';

export type Readiness = 'tooYoung' | 'drink' | 'pastPeak';

export interface ExpertFields {
  appearance: {
    intensity: number;
    clarity: number;
    notes: string;
  };
  nose: {
    intensity: number;
    development: number;
    aromas: string;
  };
  palate: {
    sweetness: number;
    acidity: number;
    tannin: number;
    alcohol: number;
    body: number;
    flavor: number;
    finish: number;
  };
  conclusions: {
    quality: number;
    readiness: Readiness;
    estimated_price_krw: number | null;
  };
  blind: boolean;
}

interface Props {
  rating: number;
  onRatingChange: (v: number) => void;
  tastedAt: string;
  onTastedAtChange: (v: string) => void;
  fields: ExpertFields;
  onFieldsChange: (f: ExpertFields) => void;
}

const READINESS_OPTIONS: Readiness[] = ['tooYoung', 'drink', 'pastPeak'];

export function ExpertForm({
  rating,
  onRatingChange,
  tastedAt,
  onTastedAtChange,
  fields,
  onFieldsChange,
}: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const placeholderColor = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  const setAppearance = (key: keyof ExpertFields['appearance'], value: number | string) => {
    onFieldsChange({ ...fields, appearance: { ...fields.appearance, [key]: value } as ExpertFields['appearance'] });
  };
  const setNose = (key: keyof ExpertFields['nose'], value: number | string) => {
    onFieldsChange({ ...fields, nose: { ...fields.nose, [key]: value } as ExpertFields['nose'] });
  };
  const setPalate = (key: keyof ExpertFields['palate'], value: number) => {
    onFieldsChange({ ...fields, palate: { ...fields.palate, [key]: value } });
  };
  const setConclusions = (
    key: keyof ExpertFields['conclusions'],
    value: number | Readiness | null,
  ) => {
    onFieldsChange({
      ...fields,
      conclusions: { ...fields.conclusions, [key]: value } as ExpertFields['conclusions'],
    });
  };

  return (
    <View className="gap-5">
      <View className="rounded-md bg-surface p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
            {t('notes.writeForm.blindMode')}
          </Text>
          <Switch
            value={fields.blind}
            onValueChange={(v) => onFieldsChange({ ...fields, blind: v })}
            trackColor={{ true: brand.gold, false: dark.text.disabled }}
            thumbColor={brand.cream}
          />
        </View>
        {fields.blind ? (
          <LinearGradient
            colors={[expertBlindBg.start, expertBlindBg.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ marginTop: 12, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 12 }}
          >
            <Text className="font-inter text-card-body text-cream text-center">
              {t('notes.writeForm.blindMode')}
            </Text>
          </LinearGradient>
        ) : null}
      </View>

      <View className="rounded-md bg-surface p-4">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.rating')}
        </Text>
        <View className="mt-2">
          <StarRating value={rating} onChange={onRatingChange} />
        </View>
      </View>

      <Section title={t('notes.expert.sectionAppearance')}>
        <WSETSlider
          label={t('notes.expert.appearanceIntensity')}
          value={fields.appearance.intensity}
          onChange={(v) => setAppearance('intensity', v)}
        />
        <WSETSlider
          label={t('notes.expert.appearanceClarity')}
          value={fields.appearance.clarity}
          onChange={(v) => setAppearance('clarity', v)}
          min={1}
          max={3}
        />
        <Note
          label={t('notes.expert.appearanceNotes')}
          value={fields.appearance.notes}
          onChange={(v) => setAppearance('notes', v)}
          placeholderColor={placeholderColor}
        />
      </Section>

      <Section title={t('notes.expert.sectionNose')}>
        <WSETSlider
          label={t('notes.expert.noseIntensity')}
          value={fields.nose.intensity}
          onChange={(v) => setNose('intensity', v)}
        />
        <WSETSlider
          label={t('notes.expert.noseDevelopment')}
          value={fields.nose.development}
          onChange={(v) => setNose('development', v)}
          min={1}
          max={3}
        />
        <Note
          label={t('notes.expert.noseAromas')}
          value={fields.nose.aromas}
          onChange={(v) => setNose('aromas', v)}
          placeholderColor={placeholderColor}
        />
      </Section>

      <Section title={t('notes.expert.sectionPalate')}>
        <WSETSlider label={t('notes.expert.palateSweetness')} value={fields.palate.sweetness} onChange={(v) => setPalate('sweetness', v)} />
        <WSETSlider label={t('notes.expert.palateAcidity')} value={fields.palate.acidity} onChange={(v) => setPalate('acidity', v)} />
        <WSETSlider label={t('notes.expert.palateTannin')} value={fields.palate.tannin} onChange={(v) => setPalate('tannin', v)} />
        <WSETSlider label={t('notes.expert.palateAlcohol')} value={fields.palate.alcohol} onChange={(v) => setPalate('alcohol', v)} />
        <WSETSlider label={t('notes.expert.palateBody')} value={fields.palate.body} onChange={(v) => setPalate('body', v)} />
        <WSETSlider label={t('notes.expert.palateFlavor')} value={fields.palate.flavor} onChange={(v) => setPalate('flavor', v)} />
        <WSETSlider label={t('notes.expert.palateFinish')} value={fields.palate.finish} onChange={(v) => setPalate('finish', v)} />
      </Section>

      <Section title={t('notes.expert.sectionConclusions')}>
        <WSETSlider
          label={t('notes.expert.conclusionsQuality')}
          value={fields.conclusions.quality}
          onChange={(v) => setConclusions('quality', v)}
        />
        <ReadinessPicker
          label={t('notes.expert.conclusionsReadiness')}
          value={fields.conclusions.readiness}
          onChange={(v) => setConclusions('readiness', v)}
        />
        <PriceField
          label={t('notes.expert.conclusionsPriceKrw')}
          value={fields.conclusions.estimated_price_krw}
          onChange={(v) => setConclusions('estimated_price_krw', v)}
          placeholderColor={placeholderColor}
        />
      </Section>

      <View className="rounded-md bg-surface p-4">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.tastedAt')}
        </Text>
        <TextInput
          value={tastedAt}
          onChangeText={onTastedAtChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={placeholderColor}
          keyboardType="numbers-and-punctuation"
          accessibilityLabel={t('notes.tastedAt')}
          className="mt-2 h-11 rounded-sm bg-bg-deep px-3 font-inter text-card-body text-text-primary dark:text-text-primary"
          style={{ borderWidth: 1, borderColor: brand.gold }}
        />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="rounded-md bg-surface p-4 gap-4">
      <Text className="font-inter text-section-title text-gold uppercase">{title}</Text>
      {children}
    </View>
  );
}

function Note({
  label,
  value,
  onChange,
  placeholderColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholderColor: string;
}) {
  return (
    <View>
      <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor={placeholderColor}
        multiline
        numberOfLines={3}
        maxLength={2000}
        accessibilityLabel={label}
        className="mt-2 rounded-sm bg-bg-deep px-3 py-3 font-inter text-card-body text-text-primary dark:text-text-primary"
        style={{ borderWidth: 1, borderColor: brand.gold, minHeight: 72, textAlignVertical: 'top' }}
      />
    </View>
  );
}

function ReadinessPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Readiness;
  onChange: (v: Readiness) => void;
}) {
  const { t } = useTranslation();
  const optionLabels: Record<Readiness, string> = {
    tooYoung: t('notes.expert.readinessTooYoung'),
    drink: t('notes.expert.readinessDrink'),
    pastPeak: t('notes.expert.readinessPastPeak'),
  };
  return (
    <View>
      <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
        {label}
      </Text>
      <View className="mt-2 flex-row gap-2">
        {READINESS_OPTIONS.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={optionLabels[opt]}
              className={`flex-1 items-center rounded-sm py-2 ${active ? 'bg-gold' : 'bg-bg-deep'}`}
              style={{ borderWidth: 1, borderColor: brand.gold }}
            >
              <Text
                className={`font-inter text-card-meta ${active ? 'text-bg-deepest' : 'text-text-secondary dark:text-text-secondary'}`}
              >
                {optionLabels[opt]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PriceField({
  label,
  value,
  onChange,
  placeholderColor,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholderColor: string;
}) {
  const text = value !== null ? String(value) : '';
  return (
    <View>
      <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
        {label}
      </Text>
      <TextInput
        value={text}
        onChangeText={(raw) => {
          const trimmed = raw.trim();
          if (!trimmed) {
            onChange(null);
            return;
          }
          const n = parseInt(trimmed, 10);
          if (Number.isNaN(n)) {
            onChange(null);
          } else {
            onChange(n);
          }
        }}
        placeholderTextColor={placeholderColor}
        keyboardType="number-pad"
        accessibilityLabel={label}
        className="mt-2 h-11 rounded-sm bg-bg-deep px-3 font-inter text-card-body text-text-primary dark:text-text-primary"
        style={{ borderWidth: 1, borderColor: brand.gold }}
      />
    </View>
  );
}

export function defaultExpertFields(): ExpertFields {
  return {
    appearance: { intensity: 3, clarity: 2, notes: '' },
    nose: { intensity: 3, development: 2, aromas: '' },
    palate: { sweetness: 1, acidity: 3, tannin: 3, alcohol: 3, body: 3, flavor: 3, finish: 3 },
    conclusions: { quality: 3, readiness: 'drink', estimated_price_krw: null },
    blind: false,
  };
}
