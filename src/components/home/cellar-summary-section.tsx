import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ChevronRight, Wine } from 'lucide-react-native';
import { brand } from '@/lib/design-tokens';

interface Props {
  cellaredCount: number;
}

export function CellarSummarySection({ cellaredCount }: Props) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
        {t('home.heavy.cellarSummary')}
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/cellar')}
        accessibilityRole="button"
        accessibilityLabel={t('home.heavy.viewAll')}
        className="mt-3 flex-row items-center justify-between rounded-md bg-surface px-4 py-4"
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <View className="flex-row items-center">
          <Wine size={22} strokeWidth={1.5} color={brand.gold} />
          <Text className="font-inter-semibold text-card-title text-text-primary dark:text-text-primary ml-3">
            {t('home.heavy.cellaredCount', { count: cellaredCount })}
          </Text>
        </View>
        <ChevronRight size={20} strokeWidth={2} color={brand.gold} />
      </Pressable>
    </View>
  );
}
