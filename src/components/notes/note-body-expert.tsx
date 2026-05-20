/**
 * NoteBodyExpert — note detail 화면에서 ExpertFields 표시 (read-only, WSET 4-section).
 *
 * 사양: design-spec notes-detail.md §2-5B + §10 E8 (a) — 4-section 유지 (RN ExpertFields shape 정합).
 * §13 retroactive: 카드 Eyebrow 위계 keyscreen verbatim (Inter 600 10 gold uppercase ls 1.8 mb 10),
 *                  Section radius 14 통일.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
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
    <View
      className="bg-surface border-border-default"
      style={{
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        rowGap: 12,
      }}
    >
      <Text
        allowFontScaling={false}
        className="font-inter-semibold"
        style={{
          fontSize: 10,
          lineHeight: 12,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: brand.gold,
          marginBottom: -2, // rowGap 12 보정 (eyebrow→첫 항목은 keyscreen mb 10 → rowGap 12 - 2)
        }}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function NoteText({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View>
      <Text
        allowFontScaling={false}
        className="font-inter text-text-secondary dark:text-text-secondary"
        style={{ fontSize: 12, lineHeight: 14.4, textTransform: 'uppercase' }}
      >
        {label}
      </Text>
      <Text
        allowFontScaling={false}
        className="font-inter text-text-primary dark:text-text-primary"
        style={{ fontSize: 13, lineHeight: 19.5, marginTop: 6 }}
      >
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
          <Text
            allowFontScaling={false}
            className="font-inter text-text-secondary dark:text-text-secondary"
            style={{ fontSize: 12, lineHeight: 14.4, textTransform: 'uppercase' }}
          >
            {t('notes.expert.conclusionsReadiness')}
          </Text>
          <Text
            allowFontScaling={false}
            className="font-inter-semibold text-text-primary dark:text-text-primary"
            style={{ fontSize: 13, lineHeight: 19.5, marginTop: 6 }}
          >
            {readinessLabel(t, c.readiness)}
          </Text>
        </View>
        {typeof c.estimated_price_krw === 'number' ? (
          <View>
            <Text
              allowFontScaling={false}
              className="font-inter text-text-secondary dark:text-text-secondary"
              style={{ fontSize: 12, lineHeight: 14.4, textTransform: 'uppercase' }}
            >
              {t('notes.expert.conclusionsPriceKrw')}
            </Text>
            <Text
              allowFontScaling={false}
              className="font-inter-semibold text-text-primary dark:text-text-primary"
              style={{ fontSize: 13, lineHeight: 19.5, marginTop: 6 }}
            >
              {c.estimated_price_krw.toLocaleString()} {t('cellar.meta.priceUnit')}
            </Text>
          </View>
        ) : null}
      </Section>
    </View>
  );
}
