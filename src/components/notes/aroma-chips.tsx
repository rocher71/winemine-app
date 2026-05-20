import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

const AROMA_KEYS = [
  'fruit',
  'floral',
  'spice',
  'wood',
  'earth',
  'citrus',
  'berry',
  'vanilla',
  'tobacco',
  'chocolate',
  'leather',
  'mineral',
] as const;

export type AromaTag = (typeof AROMA_KEYS)[number];

interface Props {
  selected: AromaTag[];
  onChange: (next: AromaTag[]) => void;
}

export function AromaChips({ selected, onChange }: Props) {
  const { t } = useTranslation();

  const toggle = (tag: AromaTag) => {
    Haptics.selectionAsync().catch(() => undefined);
    if (selected.includes(tag)) {
      onChange(selected.filter((s) => s !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <View>
      <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
        {t('notes.beginner.aromaTitle')}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {AROMA_KEYS.map((tag) => {
          const active = selected.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => toggle(tag)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={t(`notes.beginner.aromaTags.${tag}`)}
              className={`rounded-full px-3 py-2 ${active ? 'bg-gold' : 'bg-surface'}`}
              style={{
                borderWidth: 1,
                borderColor: active ? brand.gold : 'transparent',
              }}
            >
              <Text
                className={`font-inter text-card-meta ${active ? 'text-bg-deepest' : 'text-text-secondary dark:text-text-secondary'}`}
              >
                {t(`notes.beginner.aromaTags.${tag}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const ALL_AROMA_TAGS = AROMA_KEYS;
