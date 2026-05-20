import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Wine } from 'lucide-react-native';
import { PrimaryButton } from '@/components/shared/primary-button';
import { brand } from '@/lib/design-tokens';

interface Props {
  displayName: string;
}

export function FirstTimeHome({ displayName }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View
        className="items-center justify-center rounded-full bg-surface"
        style={{ width: 96, height: 96 }}
      >
        <Wine size={40} strokeWidth={1.5} color={brand.gold} />
      </View>
      <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-6 uppercase">
        {t('home.firstTime.greeting', { name: displayName })}
      </Text>
      <Text className="font-playfair text-empty-title text-text-primary dark:text-text-primary mt-3 text-center">
        {t('home.firstTime.title')}
      </Text>
      <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-2 text-center">
        {t('home.firstTime.description')}
      </Text>
      <View className="mt-8 w-full max-w-xs">
        <PrimaryButton
          label={t('home.firstTime.cta')}
          size="lg"
          onPress={() => router.push('/(tabs)/capture')}
        />
      </View>
    </View>
  );
}
