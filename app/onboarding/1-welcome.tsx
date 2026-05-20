import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';

export default function WelcomeStep() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest px-6"
      style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="font-playfair text-cream" style={{ fontSize: 56, letterSpacing: 0.5 }}>
          winemine
        </Text>
        <Text className="font-playfair text-page-title text-text-primary dark:text-text-primary mt-10 text-center">
          {t('onboarding.welcome.title')}
        </Text>
        <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-3 text-center">
          {t('onboarding.welcome.subtitle')}
        </Text>
      </View>
      <View className="pb-2">
        <PrimaryButton
          label={t('onboarding.welcome.cta')}
          size="lg"
          onPress={() => router.push('/onboarding/2-language')}
        />
      </View>
    </View>
  );
}
