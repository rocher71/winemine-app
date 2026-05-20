import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface OnboardingStepProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}

export function OnboardingStep({
  step,
  totalSteps = 4,
  title,
  subtitle,
  children,
  footer,
}: OnboardingStepProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-6">
        <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted uppercase">
          {t('onboarding.progress', { current: step, total: totalSteps })}
        </Text>
        <Text className="font-playfair text-page-title text-text-primary dark:text-text-primary mt-3">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary mt-2">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <View
        className="px-6"
        style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12 }}
      >
        {footer}
      </View>
    </View>
  );
}
