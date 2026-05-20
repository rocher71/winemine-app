/**
 * /onboarding/1-welcome — winemine 워드마크 + tagline + 와인잔 글로우 + CTA.
 *
 * 사양: _workspace/design-specs/onboarding-1-welcome.md (v1 retroactive)
 * 디자인 리뷰: _workspace/design-review_onboarding-1-welcome_20260521_015749.md
 *
 * 레이아웃 트리 (사양 §1 verbatim):
 *   SafeAreaView (bg-bg-deepest)
 *   └ PageRoot       (px-6, paddingTop=insets.top+32, paddingBottom=max(insets.bottom,0)+40, gap-6)
 *     └ StepRoot     (flex-1 items-center justify-center gap-4)
 *       ├ Logo Text     (Playfair 56, lh 56, letterSpacing -1.12, cream)
 *       ├ Tagline Text  (Playfair italic 18, gold, i18n onboarding.tagline)
 *       └ WelcomeGlassGlow (90×90 radial gradient + GlassWater 56 gold)
 *     └ CtaWrapper   (mt-auto w-full)
 *       └ PrimaryButton primary lg → router.push('/onboarding/2-language')
 *
 * Reanimated FadeIn staggered (사양 §5, design-reviewer Q2 P2 채택):
 *   Logo 0ms → Tagline 200ms → Glass 500ms → CTA 700ms (각 400ms duration).
 */
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PrimaryButton } from '@/components/shared/primary-button';
import { WelcomeGlassGlow } from '@/components/onboarding/welcome-glass-glow';

const STAGGER = {
  logo:    0,
  tagline: 200,
  glass:   500,
  cta:     700,
};
const FADE_DUR = 400;

export default function WelcomeStep() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 bg-bg-deepest px-6"
      style={{
        paddingTop: insets.top + 32,
        paddingBottom: Math.max(insets.bottom, 0) + 40,
        gap: 24,
      }}
    >
      {/* StepRoot — 컨텐츠 수직 가운데 정렬 */}
      <View className="flex-1 items-center justify-center" style={{ gap: 16 }}>
        <Animated.Text
          accessibilityRole="header"
          accessibilityLabel="winemine"
          entering={FadeIn.delay(STAGGER.logo).duration(FADE_DUR)}
          className="font-playfair text-cream text-center"
          style={{ fontSize: 56, lineHeight: 56, letterSpacing: -1.12 }}
        >
          winemine
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(STAGGER.tagline).duration(FADE_DUR)}
          className="font-playfair italic text-gold text-center"
          style={{ fontSize: 18 }}
        >
          {t('onboarding.tagline')}
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(STAGGER.glass).duration(FADE_DUR)}>
          <WelcomeGlassGlow />
        </Animated.View>
      </View>

      {/* CTA — marginTop:'auto'로 하단 push */}
      <Animated.View
        entering={FadeIn.delay(STAGGER.cta).duration(FADE_DUR)}
        className="w-full"
        style={{ marginTop: 'auto' }}
      >
        <PrimaryButton
          label={t('onboarding.welcome.cta')}
          size="lg"
          onPress={() => router.push('/onboarding/2-language')}
        />
      </Animated.View>
    </View>
  );
}
