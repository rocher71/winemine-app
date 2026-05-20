/**
 * wm-pulse — capture SimulatingView spinner 애니메이션.
 *
 * 키스크린 globals.css `@keyframes wm-pulse` verbatim:
 *   - scale 0.95 ↔ 1.05
 *   - opacity 0.4 ↔ 1
 *   - duration 1500ms (full cycle = 750ms half × 2, reverse)
 *   - easing ease-in-out
 *
 * design-spec capture.md §9-4 P0 / §3-3 SimulatingView spinner / §6-1 Animations.
 * useReducedMotion true 시 애니메이션 정지 (정적 표시 — opacity 1, scale 1).
 */
import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const HALF_CYCLE_MS = 750;

export function useWmPulse() {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduce) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    scale.value = withRepeat(
      withTiming(1.05, { duration: HALF_CYCLE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: HALF_CYCLE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    // 시작값 = 0.95/0.4. reverse로 양쪽 끝점 도달.
    scale.value = 0.95;
    opacity.value = 0.4;
    // withRepeat reverse가 다시 1.05/1까지 진동하도록 위에 withTiming 재호출 필요 없음.
    scale.value = withRepeat(
      withTiming(1.05, { duration: HALF_CYCLE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: HALF_CYCLE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [reduce, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
}
