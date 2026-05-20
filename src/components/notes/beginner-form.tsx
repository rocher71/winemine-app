import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { WSETSlider } from './wset-slider';
import { AromaChips, type AromaTag } from './aroma-chips';
import { StarRating } from './star-rating';
import { brand, dark, light } from '@/lib/design-tokens';

export interface BeginnerFields {
  wset: {
    sweetness: number;
    acidity: number;
    tannin: number;
    body: number;
  };
  aroma_tags: AromaTag[];
  comments: string;
}

interface Props {
  rating: number;
  onRatingChange: (v: number) => void;
  tastedAt: string;
  onTastedAtChange: (v: string) => void;
  fields: BeginnerFields;
  onFieldsChange: (f: BeginnerFields) => void;
}

export function BeginnerForm({
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

  const setWset = (key: keyof BeginnerFields['wset'], value: number) => {
    onFieldsChange({ ...fields, wset: { ...fields.wset, [key]: value } });
  };

  return (
    <View className="gap-5">
      <View className="rounded-xl bg-surface p-4">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.rating')}
        </Text>
        <View className="mt-2">
          <StarRating value={rating} onChange={onRatingChange} />
        </View>
      </View>

      <View className="rounded-xl bg-surface p-4 gap-4">
        <WSETSlider
          label={t('notes.beginner.wsetSweetness')}
          value={fields.wset.sweetness}
          onChange={(v) => setWset('sweetness', v)}
        />
        <WSETSlider
          label={t('notes.beginner.wsetAcidity')}
          value={fields.wset.acidity}
          onChange={(v) => setWset('acidity', v)}
        />
        <WSETSlider
          label={t('notes.beginner.wsetTannin')}
          value={fields.wset.tannin}
          onChange={(v) => setWset('tannin', v)}
        />
        <WSETSlider
          label={t('notes.beginner.wsetBody')}
          value={fields.wset.body}
          onChange={(v) => setWset('body', v)}
        />
      </View>

      <View className="rounded-xl bg-surface p-4">
        <AromaChips
          selected={fields.aroma_tags}
          onChange={(tags) => onFieldsChange({ ...fields, aroma_tags: tags })}
        />
      </View>

      <View className="rounded-xl bg-surface p-4">
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
          className="mt-2 h-11 rounded-lg bg-bg-deep px-3 font-inter text-card-body text-text-primary dark:text-text-primary"
          style={{ borderWidth: 1, borderColor: brand.gold }}
        />
      </View>

      <View className="rounded-xl bg-surface p-4">
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.writeForm.commentLabel')}
        </Text>
        <TextInput
          value={fields.comments}
          onChangeText={(c) => onFieldsChange({ ...fields, comments: c })}
          placeholder={t('notes.writeForm.commentPlaceholder')}
          placeholderTextColor={placeholderColor}
          multiline
          numberOfLines={4}
          maxLength={5000}
          accessibilityLabel={t('notes.writeForm.commentLabel')}
          className="mt-2 rounded-lg bg-bg-deep px-3 py-3 font-inter text-card-body text-text-primary dark:text-text-primary"
          style={{ borderWidth: 1, borderColor: brand.gold, minHeight: 96, textAlignVertical: 'top' }}
        />
      </View>
    </View>
  );
}

export function defaultBeginnerFields(): BeginnerFields {
  return {
    wset: { sweetness: 3, acidity: 3, tannin: 3, body: 3 },
    aroma_tags: [],
    comments: '',
  };
}
