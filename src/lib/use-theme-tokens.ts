/**
 * useThemeTokens — NW v4 colorScheme 헬퍼.
 *
 * className은 dark: / light: 자동 분기 가능. 그러나 LinearGradient colors,
 * react-native-svg fill, react-native Animated 인라인 style은 직접 hex가 필요.
 * 그때 이 hook을 호출해 현재 colorScheme의 dark/light 토큰 객체를 받는다.
 *
 * design-spec home.md §9 P0 요청 — DraftNoteResume gradient / FirstTimeGreeting gradient /
 * MiniMapPreview SVG fill / Toast tone 등에서 사용.
 */
import { useColorScheme } from 'nativewind';
import { dark, light, type ColorScheme } from './design-tokens';

// dark/light 양쪽이 같은 shape의 일반 string 매핑이라는 것을 명시.
// 그렇지 않으면 union 타입이 좁아져 사용 시점에 색 hex literal로 narrowed.
type TokenBag = {
  bg: { deepest: string; deep: string; map: string; surface: string; sunken: string; bottleShelf: string; surfaceUp: string; inset: string };
  text: { primary: string; secondary: string; muted: string; disabled: string };
  border: { default: string; active: string };
  glass: { bg: string; bgStrong: string; border: string };
  map: { country: string; ocean: string; stroke: string };
};

export interface ThemeTokens extends TokenBag {
  scheme: ColorScheme;
}

export function useThemeTokens(): ThemeTokens {
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'light' ? 'light' : 'dark';
  const tBag: TokenBag = scheme === 'light' ? (light as unknown as TokenBag) : (dark as unknown as TokenBag);
  return { scheme, bg: tBag.bg, text: tBag.text, border: tBag.border, glass: tBag.glass, map: tBag.map };
}
