import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'ghost' | 'cellar';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

const HEIGHT: Record<Size, string> = {
  sm: 'h-[36px]',
  md: 'h-[44px]',
  lg: 'h-[52px]',
};
const TEXT_SIZE: Record<Size, string> = {
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[15px]',
};
const VARIANT_BG: Record<Variant, string> = {
  primary: 'bg-wine-red active:bg-wine-red-hover',
  secondary: 'bg-surface border border-gold',
  ghost: 'bg-transparent',
  // capture ConfirmCellar — transparent bg + gold border (dark) / border-active (light) + gold text
  // design-spec capture.md §3-7 / §9-3 P0 / design-review S3
  cellar: 'bg-transparent border border-gold dark:border-gold',
};
const VARIANT_TEXT: Record<Variant, string> = {
  primary: 'text-cream',
  secondary: 'text-gold',
  ghost: 'text-text-primary dark:text-text-primary',
  cellar: 'text-gold',
};

export function PrimaryButton({
  label,
  onPress,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${HEIGHT[size]} ${VARIANT_BG[variant]} flex-row items-center justify-center rounded-lg px-4 ${disabled ? 'opacity-50' : ''}`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View className="flex-row items-center">
          <Text className={`${VARIANT_TEXT[variant]} ${TEXT_SIZE[size]} font-inter-semibold`}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
