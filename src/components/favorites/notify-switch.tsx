/**
 * NotifySwitch — favorites row 우측 알림 토글 (38×22 track, 18 knob, transform translateX 0→16).
 *
 * 사양: _workspace/design-specs/favorites.md §3-5 / §6-7 / §6-8.
 *
 * 패턴:
 *   - 3-layer Pressable (CLAUDE.md §4-11): outer Pressable opacity-only + inner Track visual View
 *   - Animated.timing translateX (useNativeDriver:true) — CSS `transition: left 200ms` 의 RN 변환 (§6-8)
 *   - Track color: on=light.border.active (#B89438 deep gold — §6-7 light 모드 명도 대비), off=light.border.default
 *   - Knob color: brand.cream (keyscreen verbatim)
 *
 * §0-2 light-only — dark className/useColorScheme 0.
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';

interface NotifySwitchProps {
  value: boolean;
  onToggle: (next: boolean) => void;
  accessibilityLabel: string;
}

export function NotifySwitch({
  value,
  onToggle,
  accessibilityLabel,
}: NotifySwitchProps) {
  // translateX 0 (off) → 16 (on). knob.width=18 + 양쪽 padding 2 = track.width 38 → 이동 거리 38-18-2-2 = 16.
  const animValue = useRef(new Animated.Value(value ? 16 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 16 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, animValue]);

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onToggle(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          position: 'relative',
          width: 38,
          height: 22,
          borderRadius: 11,
          backgroundColor: value ? light.border.active : light.border.default,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: brand.cream,
            transform: [{ translateX: animValue }],
          }}
        />
      </View>
    </Pressable>
  );
}
