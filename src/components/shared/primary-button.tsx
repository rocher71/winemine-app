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

// ---- Size scale (keyscreen verbatim, design-spec onboarding-cta.md §2-2) ----
// lg: 48 (was 52) — keyscreen primary-button.tsx line 59 + components.md §2-1.
const HEIGHT: Record<Size, string> = {
  sm: 'h-[36px]',
  md: 'h-[44px]',
  lg: 'h-[48px]',
};
// lg: px-5 (=20) — keyscreen `padding: 14px 20px` verbatim. sm/md unchanged.
const PX: Record<Size, string> = {
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-5',
};
const TEXT_SIZE: Record<Size, string> = {
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[15px]',
};

// ---- Enabled variants ----
// primary: bg + 1px border 동일 색 (keyscreen verbatim line 27-29).
// secondary/ghost/cellar는 본 PATCH scope-out — 4 step CTA는 모두 primary. 기존 시각 보존.
const VARIANT_BG: Record<Variant, string> = {
  primary: 'bg-wine-red active:bg-wine-red-hover border border-wine-red',
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

// ---- Disabled variants (keyscreen verbatim, design-spec onboarding-cta.md §2-2/§4-2) ----
// bg-text-disabled (dark #7E6E8E 보라회색 / light #C0B0A0 sand) — dual 자동 (tailwind.config.ts:41).
// text-text-muted (dark #CABDA8 warm gold / light #8B7766 muted brown) — dual 자동 (tailwind.config.ts:40).
// border-transparent — keyscreen line 21.
// opacity 적용 X (사용자 image #2 "placeholder 같음" 호소 해소).
const VARIANT_BG_DISABLED: Record<Variant, string> = {
  primary: 'bg-text-disabled border border-transparent',
  secondary: 'bg-text-disabled border border-transparent',
  ghost: 'bg-transparent',
  cellar: 'bg-text-disabled border border-transparent',
};
const VARIANT_TEXT_DISABLED: Record<Variant, string> = {
  primary: 'text-text-muted',
  secondary: 'text-text-muted',
  ghost: 'text-text-muted',
  cellar: 'text-text-muted',
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

  const bgClass = disabled ? VARIANT_BG_DISABLED[variant] : VARIANT_BG[variant];
  const textClass = disabled ? VARIANT_TEXT_DISABLED[variant] : VARIANT_TEXT[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${HEIGHT[size]} ${bgClass} flex-row items-center justify-center rounded-xl ${PX[size]}`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View className="flex-row items-center">
          <Text
            numberOfLines={1}
            className={`${textClass} ${TEXT_SIZE[size]} font-inter-semibold tracking-[-0.01em]`}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
