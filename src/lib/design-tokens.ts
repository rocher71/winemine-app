/**
 * winemine 디자인 토큰 — RN/StyleSheet 변환 결과
 * 원본: ../winemine-keyscreen/docs/design-system/{colors,typography}.md
 *
 * 하드코딩 hex의 유일한 허용 위치. 다른 모듈에서는 토큰 이름으로 참조.
 * tailwind.config.ts와 dual-source — 변경 시 양쪽 동기화 필수.
 */

// ---- Brand-fixed (테마 무관) ----
export const brand = {
  gold: '#C9A84C',
  wineRed: '#8B1A2A',
  wineRedHover: '#A02030',
  wineRedDeep: '#5b1424',
  cream: '#F5F0E8',
  deepestDark: '#05020A',
} as const;

// ---- 다크 모드 ----
export const dark = {
  bg: {
    deepest: '#251837',
    deep: '#2E1F3F',
    map: '#3A2440',
    surface: '#3D2A4A',
    sunken: 'rgba(0,0,0,0.28)',
  },
  text: {
    primary: '#F8F4ED',
    secondary: '#EBE0CB',
    muted: '#CABDA8',
    disabled: '#7E6E8E',
  },
  border: {
    default: 'rgba(245,240,232,0.12)',
    active: '#C9A84C',
  },
} as const;

// ---- 라이트 모드 ----
export const light = {
  bg: {
    deepest: '#FAF5EC',
    deep: '#F2EAD9',
    map: '#EDE2CC',
    surface: '#FFFFFF',
    sunken: 'rgba(42,26,20,0.06)',
  },
  text: {
    primary: '#2A1A14',
    secondary: '#5A463C',
    muted: '#8B7766',
    disabled: '#C0B0A0',
  },
  border: {
    default: 'rgba(42,26,20,0.12)',
    active: '#C9A84C',
  },
} as const;

// ---- Status ----
export const status = {
  errorDark: '#EF4444',
  errorLight: '#C92020',
  success: '#22C55E',
} as const;

// ---- Level (L1~L5) ----
export const level = {
  L1: '#9B8B7A',
  L2: '#C9A84C',
  L3: '#C9A84C',
  L4: '#8B1A2A',
  L5: '#A02030',
} as const;

// ---- Bottle color defaults by type_canonical ----
export const bottleColorDefault = {
  red: '#5b1424',
  white: '#d9c277',
  rose: '#e8a5a0',
  sparkling: '#caa84e',
  fortified: '#4a1027',
  dessert: '#e1c876',
} as const;

// ---- Bottle gradient end (그라데이션 종점) ----
export const bottleGradientEnd = '#1a0a1e';

// ---- Spacing scale (4-base) ----
export const spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '12': 48,
  '16': 64,
} as const;

// ---- Radius ----
export const radius = {
  sm: 8,
  md: 12,
  full: 999,
} as const;

// ---- Typography (font-family/size/weight/lineHeight/letterSpacing) ----
export const typography = {
  pageTitle: { family: 'PlayfairDisplay_400Regular', size: 24, lineHeight: 28.8, letterSpacing: 0.24 },
  cardTitle: { family: 'PlayfairDisplay_400Regular', size: 16, lineHeight: 20.8 },
  backTitle: { family: 'Inter_600SemiBold', size: 16 },
  modalTitle: { family: 'PlayfairDisplay_400Regular', size: 22 },
  emptyTitle: { family: 'PlayfairDisplay_400Regular', size: 22, lineHeight: 28.6 },
  sectionTitle: { family: 'Inter_500Medium', size: 14, letterSpacing: 0.56, textTransform: 'uppercase' as const },
  cardMeta: { family: 'Inter_400Regular', size: 12 },
  cardBody: { family: 'Inter_400Regular', size: 13, lineHeight: 19.5 },
  levelName: { family: 'Inter_600SemiBold', size: 13 },
  bottomNavActive: { family: 'Inter_600SemiBold', size: 10, letterSpacing: 0.2 },
  bottomNavIdle: { family: 'Inter_400Regular', size: 10, letterSpacing: 0.2 },
  primaryButtonSm: { family: 'Inter_600SemiBold', size: 13 },
  primaryButtonMd: { family: 'Inter_600SemiBold', size: 14 },
  primaryButtonLg: { family: 'Inter_600SemiBold', size: 15 },
} as const;

// ---- Shadows (RN ShadowProps + Android elevation 추산) ----
export const shadows = {
  card: { shadowColor: '#000', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 8 }, shadowRadius: 22, elevation: 8 },
  modal: { shadowColor: '#000', shadowOpacity: 0.8, shadowOffset: { width: 0, height: 25 }, shadowRadius: 80, elevation: 24 },
  fabDark: { shadowColor: brand.wineRed, shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 12 },
  goldGlow: { shadowColor: brand.gold, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, elevation: 6 },
} as const;

// ---- Component sizes ----
export const componentSize = {
  primaryButton: { sm: 36, md: 44, lg: 52 },
  bottomNavTab: 56,
  toast: 48,
  input: 44,
  wineCardThumb: { width: 80, height: 120 },
  wineCardHeight: 96,
} as const;

export type ColorScheme = 'dark' | 'light';
export type TypeCanonical = 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';
