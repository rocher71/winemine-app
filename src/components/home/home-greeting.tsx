/**
 * HomeGreeting — Editorial Stack 정적 2-line 인사 (신규, 사양 home.md §3-2).
 *
 * PeakGreeting(5초 회전·월드맵 잔재)을 대체. eyebrow 패턴만 차용, 회전 없음.
 * - eyebrow "오늘의 셀러" — gold 11 ls 1.76 uppercase (typography.homeEyebrowSerif)
 * - greet "{name}님,\n오늘은 어떤 와인을 여실 건가요?" — 26 / 700 lh 34.3 ls -0.39 (2줄)
 *
 * 데이터: display(익명화 표시명). profile 실패해도 인사말 fallback 유지.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, typography } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface HomeGreetingProps {
  /** 익명화 표시명 (localizeAnonymousDisplay 적용 완료) */
  name: string;
}

export function HomeGreeting({ name }: HomeGreetingProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const goldAccent = tokens.scheme === 'light' ? brand.goldDeep : brand.gold;

  return (
    <View style={{ paddingHorizontal: 22 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: typography.homeEyebrowSerif.family,
          fontSize: typography.homeEyebrowSerif.size,
          lineHeight: typography.homeEyebrowSerif.lineHeight,
          letterSpacing: typography.homeEyebrowSerif.letterSpacing,
          textTransform: typography.homeEyebrowSerif.textTransform,
          color: goldAccent,
          marginBottom: 7,
        }}
      >
        {t('home.greetingEyebrow')}
      </Text>
      <Text
        style={{
          fontFamily: typography.homeGreeting.family,
          fontSize: typography.homeGreeting.size,
          lineHeight: typography.homeGreeting.lineHeight,
          letterSpacing: typography.homeGreeting.letterSpacing,
          color: tokens.text.primary,
        }}
      >
        {t('home.greetingQuestion', { name })}
      </Text>
    </View>
  );
}
