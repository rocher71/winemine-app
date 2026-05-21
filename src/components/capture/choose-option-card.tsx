/**
 * ChooseOptionCard — capture choose stage 4-card OptionCard.
 *
 * design-spec capture.md §3-2 (NW v4 매핑표) + §6 인터랙션 (haptic + scale press).
 * height 104 (spacing.26) / padding 18 / gap 16 row / bg surface / radius 16 / border 1px border-default
 * IconWell (32px lucide, strokeWidth 1.5, 4종 다른 색) + TextColumn (Playfair 18 title + Inter 12 sub).
 */
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { ComponentType } from 'react';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { brand, dark, light, typography } from '@/lib/design-tokens';

export type ChooseIconColor = 'wineRed' | 'gold' | 'primary' | 'secondary';

interface ChooseOptionCardProps {
  Icon: LucideIcon | ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconColor: ChooseIconColor;
  title: string;
  sub: string;
  onPress: () => void;
  hapticStyle?: 'selection' | 'medium';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

function useIconColor(kind: ChooseIconColor): string {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  switch (kind) {
    case 'wineRed':
      // light에서 wine-red는 gold tone으로 fallback (colors.md §2-1)
      return isLight ? light.border.active : brand.wineRed;
    case 'gold':
      return isLight ? light.border.active : brand.gold;
    case 'primary':
      return isLight ? light.text.primary : brand.cream;
    case 'secondary':
      return isLight ? light.text.secondary : dark.text.secondary;
  }
}

export function ChooseOptionCard({
  Icon,
  iconColor,
  title,
  sub,
  onPress,
  hapticStyle = 'selection',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: ChooseOptionCardProps) {
  const color = useIconColor(iconColor);

  const handlePress = () => {
    if (disabled) return;
    if (hapticStyle === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    } else {
      Haptics.selectionAsync().catch(() => undefined);
    }
    onPress();
  };

  // Round 8 패턴 (§4-11): Pressable은 hit target만, layout/visual은 inner View.
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const surfaceBg = isLight ? light.bg.surface : dark.bg.surface;
  const borderColor = isLight ? light.border.default : dark.border.default;
  const titleColor = isLight ? light.text.primary : dark.text.primary;
  const subColor = isLight ? light.text.muted : dark.text.muted;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title} — ${sub}`}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          height: 104,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor,
          backgroundColor: surfaceBg,
        }}
      >
        <View style={{ flexShrink: 0 }}>
          <Icon size={32} strokeWidth={1.5} color={color} />
        </View>
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: typography.optionCardTitle.family,
              fontSize: typography.optionCardTitle.size,
              lineHeight: typography.optionCardTitle.lineHeight,
              marginBottom: 4,
              color: titleColor,
            }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: typography.optionCardSub.family,
              fontSize: typography.optionCardSub.size,
              lineHeight: typography.optionCardSub.lineHeight,
              color: subColor,
            }}
          >
            {sub}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
