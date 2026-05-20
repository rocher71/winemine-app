import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react-native';
import { brand } from '@/lib/design-tokens';

export function CommunityPeakPlaceholder() {
  const { t } = useTranslation();
  return (
    <View className="rounded-md bg-surface px-4 py-4 mx-4 opacity-60" accessibilityRole="text">
      <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
        {t('wineDetail.community.title')}
      </Text>
      <View className="flex-row items-center mt-3">
        <Users size={18} strokeWidth={1.8} color={brand.gold} />
        <Text className="font-inter text-card-body text-text-muted dark:text-text-muted ml-2">
          {t('wineDetail.community.comingSoon')}
        </Text>
      </View>
    </View>
  );
}
