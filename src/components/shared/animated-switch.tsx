/**
 * AnimatedSwitch — 44×26 커스텀 토글 스위치.
 *
 * 토글 상태 전환 시 knob 슬라이드 + track 색 변경 (200ms ease-out).
 * ON: gold track + knob right / OFF: border-default track + knob left
 *
 * 사용 사례:
 *   - NotifyToggleCard (셀러 상세 § 알림 토글)
 *   - 설정 화면 토글 행 (future)
 *
 * Props:
 *   value            — 현재 on/off 상태
 *   onChange         — 상태 변경 콜백 (내부 haptic 포함)
 *   accessibilityLabel — role="switch" 레이블
 *   accessibilityHint  — 선택적 힌트
 *   hitSlop            — tap 영역 확장 (기본 8)
 */
import { useEffect, useRef } from 'react';
import { Pressable, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface AnimatedSwitchProps {
  value: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  hitSlop?: number;
}

export function AnimatedSwitch({
  value,
  onChange,
  accessibilityLabel,
  accessibilityHint,
  hitSlop = 8,
}: AnimatedSwitchProps) {
  const { border } = useThemeTokens();
  const knobLeft = useRef(new Animated.Value(value ? 21 : 3)).current;
  const bgProgress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(knobLeft, {
        toValue: value ? 21 : 3,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(bgProgress, {
        toValue: value ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, knobLeft, bgProgress]);

  const trackBg = bgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [border.default, brand.gold],
  });

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={hitSlop}
    >
      <Animated.View
        style={{
          position: 'relative',
          width: 44,
          height: 26,
          borderRadius: 13,
          backgroundColor: trackBg,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 3,
            left: knobLeft,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: brand.cream,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
