/**
 * AIBadgeBanner — recognized stage 상단 AI 안내 배너.
 *
 * design-spec capture.md §3-4.
 * flex row items-center gap 8 / padding 10 14 / bg rgba(gold,0.08) / border 1px gold / radius 12.
 * Sparkles 16 + title 13/600 cream + subtitle 11 text-muted (2-line column).
 */
import { View, Text, useColorScheme } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { brand, capture, dark, light, typography } from '@/lib/design-tokens';

interface AIBadgeBannerProps {
  title: string;
  subtitle: string;
}

export function AIBadgeBanner({ title, subtitle }: AIBadgeBannerProps) {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const bg = isLight ? capture.aiBadgeBg.light : capture.aiBadgeBg.dark;
  const borderColor = isLight ? light.border.active : brand.gold;
  const goldColor = borderColor;
  const titleColor = isLight ? light.text.primary : brand.cream;
  const subtitleColor = isLight ? light.text.muted : dark.text.muted;

  return (
    <View
      accessibilityRole="header"
      accessibilityLabel={`${title}. ${subtitle}`}
      className="flex-row items-center gap-2 rounded-xl border"
      style={{
        backgroundColor: bg,
        borderColor,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <Sparkles size={16} strokeWidth={1.75} color={goldColor} />
      <View className="flex-1">
        <Text
          style={{
            fontFamily: typography.aiBadgeTitle.family,
            fontSize: typography.aiBadgeTitle.size,
            lineHeight: typography.aiBadgeTitle.lineHeight,
            color: titleColor,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: typography.aiBadgeSubtitle.family,
            fontSize: typography.aiBadgeSubtitle.size,
            lineHeight: typography.aiBadgeSubtitle.lineHeight,
            color: subtitleColor,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
