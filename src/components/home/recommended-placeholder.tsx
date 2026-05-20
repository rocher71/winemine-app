import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export function RecommendedPlaceholder() {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
        {t('home.heavy.recommended')}
      </Text>
      <View className="mt-3 items-center justify-center rounded-xl bg-surface px-4 py-8">
        <Text className="font-inter text-card-body text-text-muted dark:text-text-muted">
          {t('home.heavy.recommendedPlaceholder')}
        </Text>
      </View>
    </View>
  );
}
