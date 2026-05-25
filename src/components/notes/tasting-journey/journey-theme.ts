/**
 * journey-theme.ts — 디자인의 buildNVTheme(scheme)를 winemine 디자인 토큰으로 매핑.
 *
 * 원본 hex(#251837 등)는 전부 design-tokens.ts의 dark/light/brand 토큰과 1:1 대응한다.
 * design-spec deviation 없음 — 하드코딩 hex 0 (§4-9). light는 가독성 위해 brand.goldDeep 사용.
 */
import { brand, dark, light, withAlpha, type ColorScheme } from '@/lib/design-tokens';

export interface JourneyTheme {
  scheme: ColorScheme;
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceUp: string;
  sunken: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  gold: string;
  goldBright: string;
  wine: string;
  wineSoft: string;
  cream: string;
  ink: string;
  onAccent: string;
  // hero glow는 react-native-svg <Stop>가 rgba() alpha를 무시하므로
  // 솔리드 색 + stopOpacity로 분리 (디자인 heroGlow alpha 그대로).
  heroGlowColor: string;
  heroGlowOpacity: number;
  goldGlow: string;
  wheelCenter: [string, string];
  // fonts
  display: string;
  serif: string;
  body: string;
  bodyMed: string;
  bold: string;
}

const FONTS = {
  display: 'Freesentation_6SemiBold',
  serif: 'Freesentation_5Medium',
  body: 'Freesentation_4Regular',
  bodyMed: 'Freesentation_5Medium',
  bold: 'Freesentation_7Bold',
} as const;

export function buildJourneyTheme(scheme: ColorScheme): JourneyTheme {
  if (scheme === 'light') {
    return {
      scheme: 'light',
      bg: light.bg.deepest,
      bgDeep: light.bg.deep,
      surface: light.bg.surface,
      surfaceUp: light.bg.deep,
      sunken: light.bg.sunken,
      border: light.border.default,
      textPrimary: light.text.primary,
      textSecondary: light.text.secondary,
      textMuted: light.text.muted,
      textDisabled: light.text.disabled,
      gold: brand.goldDeep, // 가독성 위해 deeper gold (light)
      goldBright: brand.gold,
      wine: brand.wineRed,
      wineSoft: brand.wineRedDeep,
      cream: brand.cream,
      ink: light.text.primary,
      onAccent: brand.white,
      heroGlowColor: brand.wineRed, // rgba(139,26,42, …)
      heroGlowOpacity: 0.12,
      goldGlow: withAlpha(light.border.active, 0.28),
      wheelCenter: [light.bg.deepest, light.bg.map],
      ...FONTS,
    };
  }
  return {
    scheme: 'dark',
    bg: dark.bg.deepest,
    bgDeep: dark.bg.deep,
    surface: dark.bg.surface,
    surfaceUp: dark.bg.map,
    sunken: dark.bg.sunken,
    border: dark.border.default,
    textPrimary: dark.text.primary,
    textSecondary: dark.text.secondary,
    textMuted: dark.text.muted,
    textDisabled: dark.text.disabled,
    gold: brand.gold,
    goldBright: brand.goldSoft,
    wine: brand.wineRed,
    wineSoft: brand.wineRedDeep,
    cream: brand.cream,
    ink: brand.deepestDark,
    onAccent: brand.deepestDark,
    heroGlowColor: brand.wineRedDeep, // rgba(91,20,36, …)
    heroGlowOpacity: 0.5,
    goldGlow: withAlpha(brand.gold, 0.35),
    wheelCenter: [dark.bg.surface, dark.bg.deepest],
    ...FONTS,
  };
}
