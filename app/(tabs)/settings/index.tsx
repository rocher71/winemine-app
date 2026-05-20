import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SettingsPlaceholder() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
      <Text className="font-playfair text-page-title text-text-primary dark:text-text-primary">
        {t('settings.title')}
      </Text>
    </View>
  );
}
