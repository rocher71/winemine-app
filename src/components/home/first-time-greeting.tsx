/**
 * FirstTimeGreeting — 화면 상단 카드 (first-time 모드).
 *
 * 사양 home.md §2-2 line 166-173, §3-10:
 * - outer m 8_16_0, radius 20, padding 24, gap 14, minHeight 220, justify-center
 *   - LinearGradient 135deg [surface, wineRed 0.18], border 1px border-default
 * - eyebrow Inter 13 text-secondary "{name}님, 환영합니다"
 * - headline Playfair 28 cream lh 33.6 "와인 여정을 시작하세요"
 * - sub Inter 14 text-muted "첫 와인을 등록해보세요"
 * - PrimaryButton variant primary size lg, mt 8, label "라벨 스캔하기"
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { gradients } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { PrimaryButton } from '@/components/shared/primary-button';

interface FirstTimeGreetingProps {
  name: string;
}

export function FirstTimeGreeting({ name }: FirstTimeGreetingProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const gradient =
    tokens.scheme === 'light' ? gradients.firstTimeGreeting.light : gradients.firstTimeGreeting.dark;

  return (
    <LinearGradient
      colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
      start={gradient.start}
      end={gradient.end}
      style={{
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 24,
        gap: 14,
        minHeight: 220,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: tokens.border.default,
      }}
    >
      <Text
        className="font-inter text-text-secondary dark:text-text-secondary"
        style={{ fontSize: 13 }}
      >
        {t('home.greetingNew', { name })}
      </Text>
      <Text
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 28, lineHeight: 33.6 }}
      >
        {t('home.firstTime.greeting')}
      </Text>
      <Text
        className="font-inter text-text-muted dark:text-text-muted"
        style={{ fontSize: 14 }}
      >
        {t('home.firstTime.sub')}
      </Text>
      <View style={{ marginTop: 8 }}>
        <PrimaryButton
          label={t('home.firstTime.scanCta')}
          size="lg"
          onPress={() => router.push('/(tabs)/capture')}
        />
      </View>
    </LinearGradient>
  );
}
