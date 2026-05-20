import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WSETReadOnly } from './wset-readonly';
import type { ExpertFields, Readiness } from './expert-form';

interface Props {
  fields: ExpertFields;
}

function readinessLabel(t: (k: string) => string, r: Readiness): string {
  switch (r) {
    case 'tooYoung':
      return t('notes.expert.readinessTooYoung');
    case 'drink':
      return t('notes.expert.readinessDrink');
    case 'pastPeak':
      return t('notes.expert.readinessPastPeak');
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="rounded-xl bg-surface p-4 gap-3">
      <Text className="font-inter text-section-title text-gold uppercase">{title}</Text>
      {children}
    </View>
  );
}

function NoteText({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
        {label}
      </Text>
      <Text className="font-inter text-card-body text-text-primary dark:text-text-primary mt-2">
        {value?.trim() ? value : t('notes.detail.noComment')}
      </Text>
    </View>
  );
}

export function NoteBodyExpert({ fields }: Props) {
  const { t } = useTranslation();
  const a = fields.appearance;
  const n = fields.nose;
  const p = fields.palate;
  const c = fields.conclusions;

  return (
    <View className="gap-4">
      <Section title={t('notes.expert.sectionAppearance')}>
        <WSETReadOnly label={t('notes.expert.appearanceIntensity')} value={a.intensity} />
        <WSETReadOnly label={t('notes.expert.appearanceClarity')} value={a.clarity} min={1} max={3} />
        <NoteText label={t('notes.expert.appearanceNotes')} value={a.notes} />
      </Section>

      <Section title={t('notes.expert.sectionNose')}>
        <WSETReadOnly label={t('notes.expert.noseIntensity')} value={n.intensity} />
        <WSETReadOnly label={t('notes.expert.noseDevelopment')} value={n.development} min={1} max={3} />
        <NoteText label={t('notes.expert.noseAromas')} value={n.aromas} />
      </Section>

      <Section title={t('notes.expert.sectionPalate')}>
        <WSETReadOnly label={t('notes.expert.palateSweetness')} value={p.sweetness} />
        <WSETReadOnly label={t('notes.expert.palateAcidity')} value={p.acidity} />
        <WSETReadOnly label={t('notes.expert.palateTannin')} value={p.tannin} />
        <WSETReadOnly label={t('notes.expert.palateAlcohol')} value={p.alcohol} />
        <WSETReadOnly label={t('notes.expert.palateBody')} value={p.body} />
        <WSETReadOnly label={t('notes.expert.palateFlavor')} value={p.flavor} />
        <WSETReadOnly label={t('notes.expert.palateFinish')} value={p.finish} />
      </Section>

      <Section title={t('notes.expert.sectionConclusions')}>
        <WSETReadOnly label={t('notes.expert.conclusionsQuality')} value={c.quality} />
        <View>
          <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
            {t('notes.expert.conclusionsReadiness')}
          </Text>
          <Text className="font-inter-semibold text-card-body text-text-primary dark:text-text-primary mt-2">
            {readinessLabel(t, c.readiness)}
          </Text>
        </View>
        {typeof c.estimated_price_krw === 'number' ? (
          <View>
            <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
              {t('notes.expert.conclusionsPriceKrw')}
            </Text>
            <Text className="font-inter-semibold text-card-body text-text-primary dark:text-text-primary mt-2">
              {c.estimated_price_krw.toLocaleString()} {t('cellar.meta.price')}
            </Text>
          </View>
        ) : null}
      </Section>
    </View>
  );
}
