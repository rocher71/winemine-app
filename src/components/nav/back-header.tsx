import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { type ReactNode } from 'react';
import { dark, light } from '@/lib/design-tokens';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function BackHeader({ title, onBack, right }: BackHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const handleBack = onBack ?? (() => router.back());
  const scheme = useColorScheme();
  const iconColor = scheme === 'light' ? light.text.primary : dark.text.primary;

  return (
    <View
      className="bg-bg-deepest dark:bg-bg-deepest flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top, height: insets.top + 56 }}
    >
      <View className="flex-row items-center flex-1">
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={12}
          className="mr-3"
        >
          <ChevronLeft size={24} strokeWidth={2} color={iconColor} />
        </Pressable>
        <Text
          className="font-inter-semibold text-back-title text-text-primary dark:text-text-primary flex-1"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {right ?? null}
    </View>
  );
}
