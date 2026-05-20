import { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, X, Check } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';
import type { CellarSortKey } from '@/hooks/use-cellar';

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  sort: CellarSortKey;
  onSortChange: (s: CellarSortKey) => void;
}

const SORT_KEYS: CellarSortKey[] = ['recent', 'vintage', 'price'];

export function SearchSortBar({ query, onQueryChange, sort, onSortChange }: Props) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const iconColor = scheme === 'light' ? light.text.muted : dark.text.muted;
  const placeholderColor = scheme === 'light' ? light.text.disabled : dark.text.disabled;
  const [showSort, setShowSort] = useState(false);

  return (
    <View className="px-4 pt-3 gap-3">
      <View
        className="flex-row items-center rounded-md bg-surface px-3"
        style={{ height: 44 }}
      >
        <Search size={16} strokeWidth={2} color={iconColor} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={t('cellar.search.placeholder')}
          placeholderTextColor={placeholderColor}
          className="ml-2 flex-1 font-inter text-card-body text-text-primary dark:text-text-primary"
          accessibilityLabel={t('cellar.search.placeholder')}
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => onQueryChange('')}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={8}
          >
            <X size={16} strokeWidth={2} color={iconColor} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={() => setShowSort(true)}
        accessibilityRole="button"
        accessibilityLabel={t('cellar.sort.label')}
        className="flex-row items-center self-end rounded-full bg-surface px-3 py-2"
      >
        <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary">
          {t('cellar.sort.label')}: {t(`cellar.sort.${sort}`)}
        </Text>
        <ChevronDown size={14} strokeWidth={2} color={iconColor} style={{ marginLeft: 6 }} />
      </Pressable>

      <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}>
        <Pressable
          className="flex-1 items-center justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setShowSort(false)}
        >
          <View className="w-full rounded-t-md bg-bg-deep dark:bg-bg-deep px-5 py-5">
            <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
              {t('cellar.sort.label')}
            </Text>
            <View className="mt-3 gap-2">
              {SORT_KEYS.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    onSortChange(key);
                    setShowSort(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: sort === key }}
                  className="flex-row items-center justify-between rounded-sm bg-surface px-4 py-3"
                >
                  <Text className="font-inter text-card-body text-text-primary dark:text-text-primary">
                    {t(`cellar.sort.${key}`)}
                  </Text>
                  {sort === key ? <Check size={18} strokeWidth={2.5} color={brand.gold} /> : null}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
