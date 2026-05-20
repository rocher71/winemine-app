import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WSETReadOnly } from './wset-readonly';
import type { BeginnerFields } from './beginner-form';

interface Props {
  fields: BeginnerFields;
}

export function NoteBodyBeginner({ fields }: Props) {
  const { t } = useTranslation();
  const wset = fields.wset;
  const tags = fields.aroma_tags ?? [];

  return (
    <View className="gap-4">
      <View className="rounded-xl bg-surface p-4 gap-3">
        <WSETReadOnly label={t('notes.beginner.wsetSweetness')} value={wset.sweetness} />
        <WSETReadOnly label={t('notes.beginner.wsetAcidity')} value={wset.acidity} />
        <WSETReadOnly label={t('notes.beginner.wsetTannin')} value={wset.tannin} />
        <WSETReadOnly label={t('notes.beginner.wsetBody')} value={wset.body} />
      </View>

      <View className="rounded-xl bg-surface p-4">
        <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.detail.sectionAroma')}
        </Text>
        {tags.length === 0 ? (
          <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-3">
            {t('notes.detail.noAroma')}
          </Text>
        ) : (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="rounded-full bg-bg-deep px-3 py-1"
                accessibilityRole="text"
              >
                <Text className="font-inter text-card-meta text-gold">
                  {t(`notes.beginner.aromaTags.${tag}`)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="rounded-xl bg-surface p-4">
        <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.detail.sectionComment')}
        </Text>
        <Text className="font-inter text-card-body text-text-primary dark:text-text-primary mt-3">
          {fields.comments?.trim() ? fields.comments : t('notes.detail.noComment')}
        </Text>
      </View>
    </View>
  );
}
