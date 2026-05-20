/**
 * CaptureHeader — capture 화면 전용 헤더 (AppHeader 미사용).
 *
 * design-spec capture.md §3-1 (NW v4 매핑표).
 * height 56 / padding 0 16 / 3-slot space-between (CloseX 36 / title 17 600 cream / spacer 36).
 * stage===choose 시 close → router.back(), 그 외 → onCloseStage (stage='choose'로 복귀).
 */
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { X } from 'lucide-react-native';
import { brand, light, typography } from '@/lib/design-tokens';

interface CaptureHeaderProps {
  title: string;
  onClose: () => void;
  closeAccessibilityLabel: string;
  closeAccessibilityHint?: string;
}

export function CaptureHeader({
  title,
  onClose,
  closeAccessibilityLabel,
  closeAccessibilityHint,
}: CaptureHeaderProps) {
  const scheme = useColorScheme();
  const iconColor = scheme === 'light' ? light.text.primary : brand.cream;

  return (
    <View
      className="shrink-0 flex-row items-center justify-between px-4"
      style={{ height: 56 }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}
        accessibilityHint={closeAccessibilityHint}
        hitSlop={12}
        className="h-9 w-9 items-center justify-center"
      >
        <X size={22} strokeWidth={1.75} color={iconColor} />
      </Pressable>
      <Text
        accessibilityRole="header"
        className="text-text-primary dark:text-text-primary"
        style={{
          fontFamily: typography.captureHeaderTitle.family,
          fontSize: typography.captureHeaderTitle.size,
          lineHeight: typography.captureHeaderTitle.lineHeight,
        }}
      >
        {title}
      </Text>
      <View className="h-9 w-9" accessibilityElementsHidden importantForAccessibility="no" />
    </View>
  );
}
