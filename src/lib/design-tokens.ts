/**
 * winemine 디자인 토큰 — RN/StyleSheet 변환 결과
 * 원본: ../winemine-keyscreen/styles/tokens.css + src/app/globals.css
 *
 * 하드코딩 hex의 유일한 허용 위치. 다른 모듈에서는 토큰 이름으로 참조.
 * tailwind.config.ts와 dual-source — 변경 시 양쪽 동기화 필수.
 */

// ---- Brand-fixed (테마 무관) ----
export const brand = {
  gold: '#C9A84C',
  goldSoft: '#D4B85C',
  goldDeep: '#A07F2E',
  wineRed: '#8B1A2A',
  wineRedHover: '#A02030',
  wineRedDeep: '#5b1424',
  cream: '#F5F0E8',
  deepestDark: '#05020A',
  // SVG primitive 셰이드 (alpha 변형용 raw) — 토큰만 export, raw hex 사용 차단.
  black: '#000000',
  white: '#FFFFFF',
  textInk: '#2a1a14',
} as const;

// ---- 다크 모드 ----
export const dark = {
  bg: {
    deepest: '#251837',
    deep: '#2E1F3F',
    map: '#3A2440',
    surface: '#3D2A4A',
    sunken: 'rgba(0,0,0,0.28)',
    bottleShelf: '#1a0a1e',
  },
  text: {
    primary: '#F8F4ED',
    secondary: '#EBE0CB',
    muted: '#CABDA8',
    disabled: '#7E6E8E',
  },
  border: {
    default: '#5A3D6A',
    active: '#A02030',
  },
  glass: {
    bg: 'rgba(10,5,15,0.72)',
    bgStrong: 'rgba(15,7,24,0.92)',
    border: 'rgba(255,255,255,0.15)',
  },
  map: {
    country: '#3A2440',
    ocean: '#100720',
    stroke: 'rgba(245,240,232,0.18)',
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
    bottleShelf: '#FFFFFF',
  },
  text: {
    primary: '#2A1A14',
    secondary: '#5A463C',
    muted: '#8B7766',
    disabled: '#C0B0A0',
  },
  border: {
    default: '#E0D2BC',
    active: '#B89438',
  },
  glass: {
    bg: 'rgba(255,255,255,0.85)',
    bgStrong: 'rgba(255,255,255,0.95)',
    border: 'rgba(42,26,20,0.12)',
  },
  map: {
    country: '#DDD0BB',
    ocean: '#C8D6E4',
    stroke: 'rgba(160,140,110,0.40)',
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

// ---- Wine type dot (WineHero 타입 dot — keyscreen wine-header.tsx line 12-19 verbatim) ----
//
// wine-detail 사양 §3-3 + §9 P0 신규 토큰 그룹.
// bottleColorDefault와 약간 다른 더 채도 높은 dot 색 (red는 brand.wineRed 동일).
export const wineTypeDot = {
  red: '#8B1A2A',          // brand.wineRed 동일
  white: '#d6c46b',
  sparkling: '#e8d690',
  rose: '#e89b9b',
  fortified: '#5a2218',
  dessert: '#a07030',
} as const;

// ---- Serving temperature 기본값 (wines.serving_temp_{min,max} 컬럼 부재 시 fallback) ----
//
// wine-detail 사양 §12 Q11 — wine type별 권장 시음 온도 (Celsius).
// supabase wines.serving_temp_{min,max} 마이그레이션 부재로 v0.1.0은 type별 default만 사용.
export const servingTempDefault = {
  red:       { min: 16, max: 18 },
  white:     { min: 8,  max: 12 },
  rose:      { min: 8,  max: 12 },
  sparkling: { min: 6,  max: 10 },
  fortified: { min: 12, max: 16 },
  dessert:   { min: 6,  max: 10 },
} as const;

// ---- WSET 4-grid bg (MyTastingNoteCard expert) ----
//
// wine-detail 사양 §9 P0 — dark는 keyscreen verbatim, light는 부조화 회피 alt.
export const wsetGridBg = {
  dark:  'rgba(15,7,24,0.6)',
  light: 'rgba(42,26,20,0.06)',   // = withAlpha(brand.textInk, 0.06)
} as const;

// ---- Bottle gradient end (그라데이션 종점 — 다크 기준; light는 dark.bg.bottleShelf 사용) ----
export const bottleGradientEnd = '#1a0a1e';

// ---- Expert blind mode background gradient ----
export const expertBlindBg = {
  start: '#5A1A24',
  end: '#2D0D12',
} as const;

// ---- Map dark silhouette (대륙 색 — home/MiniMapPreview 등) ----
export const mapDark = {
  continent: '#2D1540',
} as const;

// ---- Alpha helper: brand 토큰 + alpha 비율 → rgba 문자열 ----
//
// brand.wineRed/gold 등은 hex 6자리. 0~1 alpha를 받아 rgba(R,G,B,A) 반환.
// home DraftNoteResume gradient, FirstTimeGreeting gradient, WineFeed active chip 등에서 사용.
export function withAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ---- Spacing scale (4-base; tailwind 기본 scale에 추가하는 winemine 전용 값) ----
//
// Tailwind 기본 scale(0,1,2,3,4,5,6,7,8,9,10,11,12,14,16,20,24,28,32,...)은 그대로 사용.
// 키스크린에서 사용되지만 기본 scale에 없는 값을 여기에 명시 — h-13, gap-13 같은 비표준 값.
export const spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '13': 52,
  '14': 56,
  '16': 64,
  '18': 72,
  '20': 80,
} as const;

// ---- Radius (NW v4 기본 scale 사용 — sm:2 / DEFAULT:4 / md:6 / lg:8 / xl:12 / 2xl:16 / 3xl:24 / full:9999) ----
//
// design-tokens.ts에서는 명시 표기. tailwind.config.ts는 NW v4 기본을 따라 override 안 함.
// home retroactive: 14 (Card·DraftNoteResume·MapCameo·HomeCommunityPeek·QuickActions card),
//                   20 (FirstTimeGreeting outer) 신규 추가.
export const radius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '14': 14,
  '2xl': 16,
  '18': 18,
  '20': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ---- Typography (font-family/size/weight/lineHeight/letterSpacing) ----
//
// 키스크린 globals.css의 .wm-* 유틸 클래스 1:1 변환.
// lineHeight는 키스크린 ratio × size로 계산. letterSpacing은 em → px 변환 (em × size).
export const typography = {
  pageTitle:    { family: 'PlayfairDisplay_400Regular', size: 24, lineHeight: 28.8, letterSpacing: -0.24 },
  cardTitle:    { family: 'PlayfairDisplay_400Regular', size: 16, lineHeight: 20.8 },
  backTitle:    { family: 'Inter_600SemiBold',          size: 16, lineHeight: 19.2 },
  modalTitle:   { family: 'PlayfairDisplay_400Regular', size: 22, lineHeight: 26.4 },
  modalDesc:    { family: 'Inter_400Regular',           size: 14, lineHeight: 21 },
  emptyTitle:   { family: 'PlayfairDisplay_400Regular', size: 22, lineHeight: 28.6 },
  emptyDesc:    { family: 'Inter_400Regular',           size: 14, lineHeight: 22.4 },
  sectionTitle: { family: 'Inter_500Medium',            size: 14, lineHeight: 14, letterSpacing: 0.56, textTransform: 'uppercase' as const },
  sectionLink:  { family: 'Inter_500Medium',            size: 12, lineHeight: 12 },
  cardMeta:     { family: 'Inter_400Regular',           size: 12, lineHeight: 14.4 },
  cardBody:     { family: 'Inter_400Regular',           size: 13, lineHeight: 19.5 },
  levelName:    { family: 'Inter_600SemiBold',          size: 13, lineHeight: 15.6 },
  glossaryTerm: { family: 'PlayfairDisplay_400Regular', size: 16 },
  glossaryDef:  { family: 'Inter_400Regular',           size: 13, lineHeight: 19.5 },
  bottomNavActive: { family: 'Inter_600SemiBold', size: 10, letterSpacing: 0.2 },
  bottomNavIdle:   { family: 'Inter_400Regular',  size: 10, letterSpacing: 0.2 },
  primaryButtonSm: { family: 'Inter_600SemiBold', size: 13 },
  primaryButtonMd: { family: 'Inter_600SemiBold', size: 14 },
  primaryButtonLg: { family: 'Inter_600SemiBold', size: 15 },

  // ---- home retroactive (design-spec home.md §9) ----
  peakGreetingQuestion:  { family: 'PlayfairDisplay_400Regular', size: 22, lineHeight: 27.5, letterSpacing: -0.22 },
  firstTimeHeadline:     { family: 'PlayfairDisplay_400Regular', size: 28, lineHeight: 33.6 },
  mapCameoTitle:         { family: 'PlayfairDisplay_400Regular', size: 14 },
  communityPeekTitle:    { family: 'PlayfairDisplay_400Regular', size: 17, lineHeight: 20.4 },
  homeEyebrow:           { family: 'Inter_500Medium', size: 10, letterSpacing: 1.8, textTransform: 'uppercase' as const },
  homeStatValue:         { family: 'PlayfairDisplay_400Regular', size: 20, lineHeight: 22, letterSpacing: -0.4 },
  homeWineFeedTitle:     { family: 'PlayfairDisplay_400Regular', size: 18 },
  homeWineFeedRowName:   { family: 'PlayfairDisplay_400Regular', size: 15, lineHeight: 18 },
  homeRecentNoteName:    { family: 'PlayfairDisplay_400Regular', size: 12, lineHeight: 15 },

  // ---- wine-detail retroactive (design-spec wine-detail.md §9) ----
  cardSectionTitle:    { family: 'Inter_600SemiBold',          size: 14, lineHeight: 16.8 },
  cardBig:             { family: 'PlayfairDisplay_700Bold',    size: 20, lineHeight: 22 },
  ratingPillScore:     { family: 'PlayfairDisplay_700Bold',    size: 18, lineHeight: 19.8 },
  wineStoryHeadline:   { family: 'PlayfairDisplay_700Bold',    size: 22, lineHeight: 26.4 },
  wsetMiniDim:         { family: 'PlayfairDisplay_400Regular', size: 13, lineHeight: 14.3 },
  microLabel:          { family: 'Inter_400Regular',           size: 9,  letterSpacing: 0.36, textTransform: 'uppercase' as const },
  servingTempPill:     { family: 'Inter_500Medium',            size: 11, lineHeight: 13.2 },
} as const;

// ---- Shadows (RN ShadowProps + Android elevation) ----
//
// 일반 scale(sm/md/lg/xl) + winemine 전용(fab, goldGlow) 의미 토큰.
// design-review-gate 6항목 체크리스트 (1)요소 누락 / (3)gradient 깊이와 매핑.
export const shadows = {
  // 일반 scale — 카드/플로팅/모달 위계
  sm: { shadowColor: '#000', shadowOpacity: 0.10, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,  elevation: 2 },
  md: { shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,  elevation: 4 },
  lg: { shadowColor: '#000', shadowOpacity: 0.28, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 8 },
  xl: { shadowColor: '#000', shadowOpacity: 0.50, shadowOffset: { width: 0, height: 24 }, shadowRadius: 64, elevation: 20 },

  // 의미 토큰 — 기존 사용처 보존
  card:  { shadowColor: '#000', shadowOpacity: 0.50, shadowOffset: { width: 0, height: 8 },  shadowRadius: 22, elevation: 8 },
  modal: { shadowColor: '#000', shadowOpacity: 0.80, shadowOffset: { width: 0, height: 25 }, shadowRadius: 80, elevation: 24 },

  // FAB — 다크는 와인레드 글로, 라이트는 골드 글로 (키스크린 tokens.css 그대로)
  fabDark:  { shadowColor: '#8B1A2A', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 12 },
  fabLight: { shadowColor: '#B89438', shadowOpacity: 0.32, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 12 },

  goldGlow: { shadowColor: '#C9A84C', shadowOpacity: 0.50, shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, elevation: 6 },

  // wine-detail 사양 §9 P0 — wine-red card shadows
  // sm: WriteNoteCta CTA pill (사양 §3-5)
  // lg: AddToCellarCta inline button (사양 §3-12)
  wineRedCardSm: { shadowColor: '#8B1A2A', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4 },
  wineRedCardLg: { shadowColor: '#8B1A2A', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 18, elevation: 6 },
} as const;

// ---- Gradients (expo-linear-gradient props 형태) ----
//
// CSS linear-gradient(angle, c1 stop1, c2 stop2) → { colors, start, end, locations? }
// 각도 → start/end 환산: design-review-gate SKILL §3 참조.
export const gradients = {
  // 135deg (좌상→우하)
  pageBg: {
    dark:  { colors: ['#251837', '#2E1F3F'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    light: { colors: ['#FAF5EC', '#F2EAD9'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  },
  // to top — locations [0, 0.7] (위 30% 투명 → 70% 부터 fade in)
  bottomNavFade: {
    dark:  { colors: ['rgba(37,24,55,0)',  '#251837'] as readonly string[], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, locations: [0, 0.7] as readonly number[] },
    light: { colors: ['rgba(250,245,236,0)', '#FAF5EC'] as readonly string[], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, locations: [0, 0.7] as readonly number[] },
  },
  // FAB — 135deg
  fab: {
    dark:  { colors: ['#8B1A2A', '#5b1424'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    light: { colors: ['#C9A84C', '#A07F2E'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  },
  // Expert blind mode — to bottom (180deg)
  expertBlind: {
    colors: ['#5A1A24', '#2D0D12'] as readonly string[],
    start: { x: 0.5, y: 0 },
    end:   { x: 0.5, y: 1 },
  },

  // home/DraftNoteResume — 135deg, wineRed 45% → surface
  draftResume: {
    dark:  { colors: ['rgba(139, 26, 42, 0.45)', '#3D2A4A'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    light: { colors: ['rgba(139, 26, 42, 0.45)', '#FFFFFF'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  },
  // home/FirstTimeGreeting — 135deg, surface → wineRed 18%
  firstTimeGreeting: {
    dark:  { colors: ['#3D2A4A', 'rgba(139, 26, 42, 0.18)'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    light: { colors: ['#FFFFFF', 'rgba(139, 26, 42, 0.18)'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  },
  // home/AppHeader LevelChip avatar — 135deg, level → level+99
  levelChip: {
    L1: { colors: ['#9B8B7A', '#9B8B7A99'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    L2: { colors: ['#C9A84C', '#C9A84C99'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    L3: { colors: ['#C9A84C', '#C9A84C99'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    L4: { colors: ['#8B1A2A', '#8B1A2A99'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    L5: { colors: ['#A02030', '#A0203099'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  },
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

// ---- Focus ring (접근성 — :focus-visible 대체) ----
export const focus = {
  color: brand.gold,
  width: 2,
  offset: 2,
  radius: 4,
} as const;

export type ColorScheme = 'dark' | 'light';
export type TypeCanonical = 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';
