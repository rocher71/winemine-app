/**
 * SecondaryIconButton — capture recognized stage Retry/Edit 버튼.
 *
 * design-spec capture.md §3-8.
 * flex 1 / padding 10 14 / bg transparent / color text-secondary /
 * border 1px border-default / radius 10 (신규 토큰) / Inter 12 / icon size 14 (좌측 gap 6).
 */
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { ComponentType } from 'react';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { dark, light, typography } from '@/lib/design-tokens';

interface SecondaryIconButtonProps {
  Icon: LucideIcon | ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
}

export function SecondaryIconButton({
  Icon,
  label,
  onPress,
  accessibilityHint,
}: SecondaryIconButtonProps) {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const textColor = isLight ? light.text.secondary : dark.text.secondary;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      className="flex-1 flex-row items-center justify-center border border-border-default rounded-10"
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 10,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        // RN NW v4 'rounded-10' arbitrary — fallback inline radius 10
        borderRadius: 10,
      })}
    >
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Icon size={14} strokeWidth={1.75} color={textColor} />
        <Text
          style={{
            fontFamily: typography.cardMeta.family,
            fontSize: typography.cardMeta.size,
            lineHeight: typography.cardMeta.lineHeight,
            color: textColor,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
