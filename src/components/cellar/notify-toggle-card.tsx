/**
 * NotifyToggleCard — Section 3: "절정 시점에 알림받기" + 44×26 custom Switch.
 *
 * 사양: design-spec cellar-detail.md §2 line 101~112, §3-5.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 178~240 verbatim.
 *
 * 구조:
 *   outer (mx-4 rounded-[14px] bg-surface border padding 14 16, flex-row items-center justify-between)
 *     Label (Inter 13 500 cream)
 *     Switch (44×26 radius 13, bg gold ON / border-default OFF)
 *       └── knob (20×20 radius 10 cream, left 21 ON / 3 OFF, top 3, transition 200ms)
 *
 * 토글 변경 시 setNotify + Toast (cellar.notify.{toggledOn,toggledOff}) + haptic (selectionAsync).
 */
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  notify: boolean;
  onChange: (next: boolean) => void;
}

export function NotifyToggleCard({ notify, onChange }: Props) {
  const { t } = useTranslation();
  const { border } = useThemeTokens();
  const knobLeft = useRef(new Animated.Value(notify ? 21 : 3)).current;
  // bg color animated value — 0=OFF, 1=ON
  const bgProgress = useRef(new Animated.Value(notify ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(knobLeft, {
        toValue: notify ? 21 : 3,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(bgProgress, {
        toValue: notify ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [notify, knobLeft, bgProgress]);

  const trackBg = bgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [border.default, brand.gold],
  });

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onChange(!notify);
  };

  return (
    <View
      className="mx-4 flex-row items-center justify-between bg-surface dark:bg-surface border border-border-default"
      style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14 }}
    >
      <Text
        className="font-inter-medium text-text-primary dark:text-text-primary"
        style={{ fontSize: 13, lineHeight: 15.6 }}
        numberOfLines={1}
      >
        {t('cellar.notify.label')}
      </Text>
      <Pressable
        onPress={handlePress}
        accessibilityRole="switch"
        accessibilityState={{ checked: notify }}
        accessibilityLabel={t('cellar.notify.label')}
        accessibilityHint={t('cellar.notify.a11yHint')}
        hitSlop={8}
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
    </View>
  );
}
