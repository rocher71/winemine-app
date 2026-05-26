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

// Badge tier 색 — keyscreen profile-me 배지 패턴 (bronze/silver/gold/platinum).
export const badge = {
  bronze: '#A77044',
  silver: '#C8C8D0',
  // gold/platinum은 brand.gold / brand.goldSoft 재사용
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

// ---- Type filter dot (cellar TypeFilterChips dot — keyscreen page.tsx line 824~831 verbatim) ----
//
// cellar-list 사양 §3-5 + §9 P0. 같은 wine type을 가리키지만 채도가 더 높은 별도 그룹.
// 의도적으로 wineTypeDot과 다름 (필터 chip은 더 또렷, 작은 dot은 부드러움).
export const typeFilterDot = {
  red: '#8B1A2A',          // brand.wineRed 동일
  white: '#E8D89B',
  sparkling: '#F5F0E8',    // brand.cream 동일
  rose: '#D4707A',
  fortified: '#6B1421',
  dessert: '#C9A84C',      // brand.gold 동일
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

// ---- Community tonight Seoul map SVG 야경 plate 색 (§6-3 의도된 deviation) ----
//
// community-side.md tonight 화면 Seoul map 내부 SVG. light 모드라도 야경 plate 유지 (시각 identity).
export const communityTonightMap = {
  bgStart: '#2a141c',           // 야경 시작 (= communityPost.vinePatternBg 와 동일하지만 의미 분리)
  bgEnd: '#0a050f',             // 야경 끝 (매우 어두운 자주)
  gridStroke: 'rgba(245,240,232,0.05)',
  riverDark: '#2D1540',         // 어두운 보라 (≈ dark.bg.deep)
  riverLight: 'rgba(91,156,230,0.15)',
  riverLabel: '#9B8B7A',        // = level.L1
} as const;

// ---- Community post-detail 전용 토큰 (Column hero + Album bottle Pattern + Question card 등) ----
//
// design-spec community-post.md §1-C (column variant) + §1-E (album variant) 내부 SVG pattern 색.
// 의도된 hex 패턴 인장이라 light 모드에서도 변함 없음 (SVG color shading).
export const communityPost = {
  // Column / Question variant cover hero gradient 시작색 (wine-red 디퍼)
  heroDeepStart: '#5A1A28',
  // Album thumb SVG bottle pattern 4색 (vine-like decorative)
  albumPatternColors: ['#1a0a1e', '#2a141c', '#3a1a26', '#1a0a1e'] as readonly string[],
  // wine_metadata.bottle_color null fallback (Album thumb bg)
  bottleColorFallback: '#6B1A2A',
  // Column hero SVG <Pattern id="vine"> 인장 2색 (decorative shading)
  vinePatternBg: '#2a141c',
  vinePatternStripe: '#3a1a26',
  // Album thumb SVG bottle silhouette 색 (4 elements)
  bottleSilhouetteOuter: '#1a0a1e',
  bottleSilhouetteBody: '#5a1a28',
  bottleSilhouetteNeck: '#0a0612',
} as const;

// ---- Capture 화면 전용 토큰 (design-spec capture.md §9 P0 + design-review S4) ----
//
// PhotoFrame gradient end는 wine-detail의 `#1a0a1e`와 다른 값 (colors.md §6-3 verbatim "#1a0a0e").
// light 모드는 review S4 채택값: withAlpha(light.text.primary, 0.85) = '#2A1A14' alpha 0.85.
// FileNotFoundHint bg는 sparse alpha purple (dark) / 추정 sand alpha (light).
// AI banner bg = withAlpha(brand.gold, 0.08).
export const capture = {
  bottlePhotoEnd: {
    dark:  '#1a0a0e',
    light: 'rgba(42, 26, 20, 0.85)',  // = withAlpha(light.text.primary, 0.85)
  },
  fileNotFoundBg: {
    dark:  'rgba(74, 61, 86, 0.2)',
    light: 'rgba(160, 140, 110, 0.12)',
  },
  aiBadgeBg: {
    // gold 0.08 — 양쪽 모드 동일 (gold tint은 dark/light 모두 자연스러움)
    dark:  'rgba(201, 168, 76, 0.08)',
    light: 'rgba(184, 148, 56, 0.10)',  // light gold (#B89438) tint
  },
} as const;

// ---- Overlay scrim (modal backdrop 표준 토큰) ----
//
// capture.tsx의 manual placeholder backdrop / label-scan-result-modal backdrop /
// 그 외 modal full-screen 배경 통일. design-review f-1 하드코딩 4건 제거 목적.
export const overlay = {
  bgScrim: {
    dark:  'rgba(0, 0, 0, 0.55)',
    light: 'rgba(42, 26, 20, 0.40)',  // light 모드는 textInk 0.4
  },
  // 작은 round button 배경 (header X / OptionButton 등 — 라이트 모드는 cream tint)
  pillBg: {
    dark:  'rgba(0, 0, 0, 0.45)',
    light: 'rgba(42, 26, 20, 0.10)',
  },
} as const;

// ---- shade() helper (design-spec cellar-detail.md §9-2 + §13-5) ----
//
// keyscreen src/components/shared/wine-label-art.tsx line 69~76 verbatim 포팅.
// hex 색을 percent(%)만큼 밝게(+)/어둡게(-) 보정한 hex 문자열 반환.
// 사용처: WineLabelArt inner gradient stop 계산 (bottle_color 0% → shade(-20) → shade(-40)).
//
// percent: -100 ~ +100. 음수는 어둡게, 양수는 밝게.
export function shade(hex: string, percent: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return hex;
  const num = parseInt(m, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---- Cellar list 전용 토큰 (design-spec cellar-list.md §9 P0 — retroactive hardening) ----
//
// DrinkWindowBadge bg (5 status 중 too-young, past-peak)는 raw alpha.
// dark 모드는 keyscreen verbatim, light 모드는 사양 §12-8 권장값(text-muted alpha 0.18).
// peak/opening/mature는 brand.wineRed / brand.gold 직접 사용 (별도 토큰 불필요).
export const cellar = {
  tooYoungBg: {
    dark:  'rgba(155, 139, 122, 0.18)',  // = withAlpha('#9B8B7A', 0.18) — keyscreen verbatim
    light: 'rgba(139, 119, 102, 0.18)',  // = withAlpha(light.text.muted, 0.18) — 사양 §12-8 권장
  },
  pastPeakBg: {
    dark:  'rgba(45, 21, 64, 0.60)',     // dark.bg.deep alpha 0.6 — keyscreen verbatim
    light: 'rgba(139, 119, 102, 0.22)',  // light bg에 대조 부드러움 — 사양 §12-8 권장
  },
  // ClearBtn (SearchInput X) bg — cream alpha 0.08 dark + textInk alpha 0.06 light
  clearBtnBg: {
    dark:  'rgba(245, 240, 232, 0.08)',  // = withAlpha(brand.cream, 0.08)
    light: 'rgba(42, 26, 20, 0.08)',     // = withAlpha(light.text.primary, 0.08)
  },
  // Tab count badge text (active 시) — cream alpha 0.7
  tabCountActive: 'rgba(245, 240, 232, 0.70)',  // = withAlpha(brand.cream, 0.7)
  // TypeFilterChip active bg — gold alpha 0.12
  typeFilterActiveBg: 'rgba(201, 168, 76, 0.12)',  // = withAlpha(brand.gold, 0.12)
  // FlatList ItemSeparator (현재 RN hardcoded 'rgba(0,0,0,0.08)' 대체 토큰)
  itemSeparator: {
    dark:  'rgba(0, 0, 0, 0.08)',
    light: 'rgba(42, 26, 20, 0.06)',  // light.bg.sunken 동일
  },
} as const;

// ---- Cellar card BottleZone gradient factory (design-spec cellar-list.md §9 P0) ----
//
// CSS linear-gradient(160deg, ${bottleColor}28 0%, var(--color-bottle-shelf) 80%).
// 160deg: 위→아래 약간 좌측 — start={x:0,y:0} end={x:0.34, y:0.94} (cos(160°)=-0.94, sin(160°)=0.34).
// alpha 0.157 = hex8 "28" / 255 ≈ 0.157.
export function cellarCardBottleGradient(
  bottleColor: string,
  scheme: 'dark' | 'light' = 'dark',
) {
  const end = scheme === 'dark' ? dark.bg.bottleShelf : light.bg.bottleShelf;
  return {
    colors: [withAlpha(bottleColor, 0.157), end] as readonly string[],
    locations: [0, 0.8] as readonly number[],
    start: { x: 0, y: 0 },
    end:   { x: 0.34, y: 0.94 },
  };
}

// ---- Type filter "all" dot gradient (3-stop, 135deg) ----
//
// CSS linear-gradient(135deg, #8B1A2A 0%, #C9A84C 50%, #F5F0E8 100%).
// 135deg = 좌상→우하 (start={0,0} end={1,1}).
export const typeFilterAllGradient = {
  colors: [brand.wineRed, brand.gold, brand.cream] as readonly string[],
  locations: [0, 0.5, 1] as readonly number[],
  start: { x: 0, y: 0 },
  end:   { x: 1, y: 1 },
} as const;

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
  '0.75': 3,    // capture MetaRow mb (design-spec capture.md §9-1)
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
  '26': 104,    // capture OptionCard height (design-spec capture.md §9-1)
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
  '7': 7,       // cellar TabSegment inner tab button (design-spec cellar-list.md §9 P0)
  lg: 8,
  '10': 10,     // capture SecondaryButton radius (design-spec capture.md §9-1)
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
  pageTitle:    { family: 'Freesentation_4Regular', size: 24, lineHeight: 28.8, letterSpacing: -0.24 },
  cardTitle:    { family: 'Freesentation_4Regular', size: 16, lineHeight: 20.8 },
  backTitle:    { family: 'Freesentation_4Regular',          size: 16, lineHeight: 19.2 },
  modalTitle:   { family: 'Freesentation_4Regular', size: 22, lineHeight: 26.4 },
  modalDesc:    { family: 'Freesentation_4Regular',           size: 14, lineHeight: 21 },
  emptyTitle:   { family: 'Freesentation_4Regular', size: 22, lineHeight: 28.6 },
  emptyDesc:    { family: 'Freesentation_4Regular',           size: 14, lineHeight: 22.4 },
  sectionTitle: { family: 'Freesentation_4Regular',            size: 14, lineHeight: 14, letterSpacing: 0.56, textTransform: 'uppercase' as const },
  sectionLink:  { family: 'Freesentation_4Regular',            size: 12, lineHeight: 12 },
  cardMeta:     { family: 'Freesentation_4Regular',           size: 12, lineHeight: 14.4 },
  cardBody:     { family: 'Freesentation_4Regular',           size: 13, lineHeight: 19.5 },
  levelName:    { family: 'Freesentation_4Regular',          size: 13, lineHeight: 15.6 },
  glossaryTerm: { family: 'Freesentation_4Regular', size: 16 },
  glossaryDef:  { family: 'Freesentation_4Regular',           size: 13, lineHeight: 19.5 },
  bottomNavActive: { family: 'Freesentation_4Regular', size: 10, letterSpacing: 0.2 },
  bottomNavIdle:   { family: 'Freesentation_4Regular',  size: 10, letterSpacing: 0.2 },
  primaryButtonSm: { family: 'Freesentation_4Regular', size: 13 },
  primaryButtonMd: { family: 'Freesentation_4Regular', size: 14 },
  primaryButtonLg: { family: 'Freesentation_4Regular', size: 15 },

  // ---- home retroactive (design-spec home.md §9) ----
  peakGreetingQuestion:  { family: 'Freesentation_4Regular', size: 22, lineHeight: 27.5, letterSpacing: -0.22 },
  firstTimeHeadline:     { family: 'Freesentation_4Regular', size: 28, lineHeight: 33.6 },
  mapCameoTitle:         { family: 'Freesentation_4Regular', size: 14 },
  communityPeekTitle:    { family: 'Freesentation_4Regular', size: 17, lineHeight: 20.4 },
  homeEyebrow:           { family: 'Freesentation_4Regular', size: 10, letterSpacing: 1.8, textTransform: 'uppercase' as const },
  homeStatValue:         { family: 'Freesentation_4Regular', size: 20, lineHeight: 22, letterSpacing: -0.4 },
  homeWineFeedTitle:     { family: 'Freesentation_4Regular', size: 18 },
  homeWineFeedRowName:   { family: 'Freesentation_4Regular', size: 15, lineHeight: 18 },
  homeRecentNoteName:    { family: 'Freesentation_4Regular', size: 12, lineHeight: 15 },

  // ---- wine-detail retroactive (design-spec wine-detail.md §9) ----
  cardSectionTitle:    { family: 'Freesentation_4Regular',          size: 14, lineHeight: 16.8 },
  cardBig:             { family: 'Freesentation_4Regular',    size: 20, lineHeight: 22 },
  ratingPillScore:     { family: 'Freesentation_4Regular',    size: 18, lineHeight: 19.8 },
  wineStoryHeadline:   { family: 'Freesentation_4Regular',    size: 22, lineHeight: 26.4 },
  wsetMiniDim:         { family: 'Freesentation_4Regular', size: 13, lineHeight: 14.3 },
  microLabel:          { family: 'Freesentation_4Regular',           size: 9,  letterSpacing: 0.36, textTransform: 'uppercase' as const },
  servingTempPill:     { family: 'Freesentation_4Regular',            size: 11, lineHeight: 13.2 },

  // ---- cellar retroactive (design-spec cellar-list.md §9 P0 — 5 신규) ----
  // TabSegment + AddCta label (Inter 12 600)
  tabSegmentLabel:  { family: 'Freesentation_4Regular', size: 12, lineHeight: 14.4 },
  // TabSegment count badge (Inter 10 700)
  tabCount:         { family: 'Freesentation_4Regular',     size: 10, lineHeight: 12 },
  // TypeFilterChip + SortChip label (Inter 11 600)
  chipLabel:        { family: 'Freesentation_4Regular', size: 11, lineHeight: 13.2 },
  // CellarCard wine name (Playfair 12 lh 15) — keyscreen cellar-card.tsx verbatim
  cellarCardName:   { family: 'Freesentation_4Regular', size: 12, lineHeight: 15 },
  // DrinkWindowBadge label (Inter 10 600 lh 12 nowrap)
  drinkWindowBadge: { family: 'Freesentation_4Regular', size: 10, lineHeight: 12 },

  // ---- cellar-detail retroactive (design-spec cellar-detail.md §9-2 P0 — 2 신규) ----
  // ProducerLine (Inter 13 lh 15.6 = 1.2 ratio) — 기존 cardBody(13 / 19.5) 와 lineHeight 다름
  cellarHeroProducer: { family: 'Freesentation_4Regular', size: 13, lineHeight: 15.6 },
  // Timeline from/to 양끝 라벨 (Inter 10 lh 12) — 기존 bottomNavActive(10) 와 lineHeight 명시
  timelineYearLabel: { family: 'Freesentation_4Regular', size: 10, lineHeight: 12 },

  // ---- capture retroactive (design-spec capture.md §9 P0 — 11 신규) ----
  captureHeaderTitle:  { family: 'Freesentation_4Regular',          size: 17, lineHeight: 20.4 },
  optionCardTitle:     { family: 'Freesentation_4Regular', size: 18, lineHeight: 21.6 },
  optionCardSub:       { family: 'Freesentation_4Regular',           size: 12, lineHeight: 16.8 },
  simulatingMessage:   { family: 'Freesentation_4Regular',           size: 14, lineHeight: 19.6 },
  aiBadgeTitle:        { family: 'Freesentation_4Regular',          size: 13, lineHeight: 15.6 },
  aiBadgeSubtitle:     { family: 'Freesentation_4Regular',           size: 11, lineHeight: 13.2 },
  recognizedName:      { family: 'Freesentation_4Regular', size: 17, lineHeight: 21.25 },
  metaRowLabel:        { family: 'Freesentation_4Regular',           size: 11, lineHeight: 15.4 },
  metaRowValue:        { family: 'Freesentation_4Regular',           size: 11, lineHeight: 15.4 },
  fileNotFoundTitle:   { family: 'Freesentation_4Regular',              size: 11, lineHeight: 16.5 },
  fileNotFoundBody:    { family: 'Freesentation_4Regular',           size: 11, lineHeight: 16.5 },

  // ---- notes-new retroactive (design-spec notes-new.md §4-2 P0 — 10 신규) ----
  //
  // verbatim 원칙: keyscreen page.tsx line 257~290 (TemplateCard) + source-picker.tsx line 39~118
  // (CellarCard / NewWineCard) + bottom-sheet line 117~206 (Cellar BottomSheet).
  // Stage 1 4-tier (title/author/desc/badge) + Stage 2 2-tier (title/sub) + Stage 3 4 tier
  // (sheetTitle/rowName/rowMeta/backLink).
  // CustomBadge letter-spacing 0.05em → 9 × 0.05 = 0.45px. textTransform uppercase.
  templateCardTitle:    { family: 'Freesentation_4Regular',          size: 14, lineHeight: 16.8 },
  templateCardAuthor:   { family: 'Freesentation_4Regular',           size: 11, lineHeight: 13.2 },
  templateCardDesc:     { family: 'Freesentation_4Regular',           size: 12, lineHeight: 17.4 },
  templateCustomBadge:  { family: 'Freesentation_4Regular',          size: 9,  lineHeight: 11, letterSpacing: 0.45, textTransform: 'uppercase' as const },
  sourceCardTitle:      { family: 'Freesentation_4Regular',          size: 16, lineHeight: 19.2 },
  sourceCardSub:        { family: 'Freesentation_4Regular',           size: 12, lineHeight: 16.8 },
  bottomSheetTitle:     { family: 'Freesentation_4Regular', size: 18, lineHeight: 21.6 },
  cellarRowName:        { family: 'Freesentation_4Regular', size: 13, lineHeight: 15.6 },
  cellarRowMeta:        { family: 'Freesentation_4Regular',           size: 11, lineHeight: 13.2 },
  backToTemplateLink:   { family: 'Freesentation_4Regular',          size: 11, lineHeight: 13.2 },

  // ---- notes-write retroactive (design-spec notes-write.md §4-2 P0 — 5 신규) ----
  //
  // verbatim 원칙: keyscreen beginner-note.tsx line 98~136 (BeginnerHeader 3-tier) +
  // beginner-note.tsx StepHeader badge (Inter 700 11) + AutoSummaryCard 2-tier
  // (eyebrow Inter 400 11 ls 1.1 gold uppercase + body Playfair italic 13 lh 19.5).
  // stepHeaderTitle은 cardSectionTitle (Inter 600 14 lh 16.8) 재사용. shareToggleSub은 cellarRowMeta 재사용.
  // beginnerEyebrow letter-spacing 0.16em → 11 × 0.16 = 1.76px.
  // summaryEyebrow letter-spacing 0.10em → 11 × 0.10 = 1.1px.
  beginnerEyebrow:    { family: 'Freesentation_4Regular',            size: 11, lineHeight: 11,   letterSpacing: 1.76, textTransform: 'uppercase' as const },
  beginnerGreeting:   { family: 'Freesentation_4Regular',           size: 12, lineHeight: 18 },
  stepHeaderBadge:    { family: 'Freesentation_4Regular',              size: 11, lineHeight: 13.2 },
  summaryEyebrow:     { family: 'Freesentation_4Regular',           size: 11, lineHeight: 11,   letterSpacing: 1.1,  textTransform: 'uppercase' as const },
  summaryText:        { family: 'Freesentation_4Regular', size: 13, lineHeight: 19.5, fontStyle: 'italic' as const },

  // ---- notes-detail retroactive (design-spec notes-detail.md §6-1 P0 — 10 신규) ----
  //
  // verbatim 원칙: keyscreen src/app/notes/[noteId]/page.tsx line 116~377 (ViewNotePage 본문 트리)
  // + line 394~714 (DimensionsExpert) + line 800~871 (DimensionsBeginner).
  // 카드 Eyebrow 공통 위계는 beginnerEyebrow(11 ls 1.76)와 거의 동일(10 ls 1.8) — 본 cycle은 컴팩트
  // notesDetailCardEyebrow를 별도로 두어 (size 10) keyscreen verbatim 적용.
  // Aroma chip / Fault chip은 chipLabelRegular (Inter 400 11).
  notesDetailCardEyebrow: { family: 'Freesentation_4Regular',          size: 10, lineHeight: 12,   letterSpacing: 1.8,  textTransform: 'uppercase' as const },
  noteAuthorName:         { family: 'Freesentation_4Regular', size: 14, lineHeight: 16.8 },
  noteAvatarLetter:       { family: 'Freesentation_4Regular',    size: 13, lineHeight: 15.6 },
  noteTemplatePill:       { family: 'Freesentation_4Regular',           size: 10, lineHeight: 12 },
  noteRatingChip:         { family: 'Freesentation_4Regular',          size: 12, lineHeight: 14.4 },
  noteMemoBody:           { family: 'Freesentation_4Regular', size: 14, lineHeight: 23.1, fontStyle: 'italic' as const },
  noteBeginnerDimValue:   { family: 'Freesentation_4Regular', size: 14, lineHeight: 15.4 },
  noteRowValue:           { family: 'Freesentation_4Regular', size: 12, lineHeight: 14.4 },
  noteAromaCatLabel:      { family: 'Freesentation_4Regular',           size: 10, lineHeight: 12,   letterSpacing: 0.6,  textTransform: 'uppercase' as const },
  notePeakNote:           { family: 'Freesentation_4Regular',           size: 12, lineHeight: 18,   fontStyle: 'italic' as const },
  chipLabelRegular:       { family: 'Freesentation_4Regular',           size: 11, lineHeight: 13.2 },

  // ---- onboarding step retroactive (design-spec onboarding-2-language.md §3-2 P0 — 3 신규) ----
  //
  // step 2/3/4 (language/experience/mode) 공유 위계. step 1 (welcome) 워드마크(56)는 별도.
  // keyscreen StepLanguage line 184~196 verbatim + line 378~383 (ChoiceCard title).
  // 1.2 ratio (size × 1.2 = lineHeight).
  onboardingStepTitle:    { family: 'Freesentation_4Regular', size: 28, lineHeight: 33.6 },
  onboardingStepSubtitle: { family: 'Freesentation_4Regular',           size: 14, lineHeight: 20 },
  onboardingChoiceLabel:  { family: 'Freesentation_4Regular',          size: 18, lineHeight: 21.6 },
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

// ---- Cellar detail gradient factories (design-spec cellar-detail.md §9-2 P0 — retroactive hardening) ----
//
// 키스크린 src/app/cellar/[id]/page.tsx + wine-label-art.tsx 의 5개 gradient verbatim 포팅.
// 160deg = 좌상→우하 약간 — start={0,0} end={0.342, 0.94} (cos(160°)=-0.94 → x:0.342; sin(160°)=0.342 → y:0.94).
// 180deg = 위→아래 — start={0.5, 0} end={0.5, 1}.
// 90deg  = 좌→우  — start={0, 0.5} end={1, 0.5}.

// (1) Hero outer gradient (160deg, bottle_color → dark.bg.bottleShelf 70%)
// scheme 무관 — keyscreen verbatim line 70: 양쪽 모드 모두 `#1a0a1e` 사용 (와인병의 어두운 분위기).
export function cellarDetailHeroGradient(bottleColor: string) {
  return {
    colors: [bottleColor, dark.bg.bottleShelf] as readonly string[],
    locations: [0, 0.7] as readonly number[],
    start: { x: 0, y: 0 },
    end:   { x: 0.342, y: 0.94 },
  };
}

// (2) WineLabelArt inner gradient (160deg, 3-stop: bottle_color → shade(-20) → shade(-40))
export function wineLabelArtGradient(bottleColor: string) {
  return {
    colors: [bottleColor, shade(bottleColor, -20), shade(bottleColor, -40)] as readonly string[],
    locations: [0, 0.6, 1] as readonly number[],
    start: { x: 0, y: 0 },
    end:   { x: 0.342, y: 0.94 },
  };
}

// (3) WineLabelArt 상단 highlight overlay (180deg, white alpha 0.10 → 0)
// 양쪽 모드 동일 (라벨 광택 effect — 흰색 alpha).
export const wineLabelArtHighlightGradient = {
  colors: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)'] as readonly string[],
  start: { x: 0.5, y: 0 },
  end:   { x: 0.5, y: 1 },
} as const;

// (4) DrinkWindowTimeline track gradient (90deg, 5-stop: gray-gold-wineRed-gold-gray)
// keyscreen page.tsx line 398~400 verbatim — gray는 #9B8B7A alpha 0.3 (양쪽 모드 동일).
export const drinkWindowTimelineGradient = {
  colors: [
    'rgba(155, 139, 122, 0.3)',
    brand.gold,
    brand.wineRed,
    brand.gold,
    'rgba(155, 139, 122, 0.3)',
  ] as readonly string[],
  locations: [0, 0.45, 0.5, 0.55, 1] as readonly number[],
  start: { x: 0, y: 0.5 },
  end:   { x: 1, y: 0.5 },
} as const;

// (5) DrinkThis Bottom fade overlay (180deg, transparent → 0.95)
// 사양 §13-2 light 모드 분기 — light는 `light.bg.deepest` alpha 0.95.
// dark는 keyscreen verbatim `rgba(5,2,10, ...)` (`brand.deepestDark` `#05020A`).
export const cellarBottomFade = {
  dark: {
    colors: ['rgba(5, 2, 10, 0)', 'rgba(5, 2, 10, 0.95)'] as readonly string[],
    locations: [0, 0.6] as readonly number[],
    start: { x: 0.5, y: 0 },
    end:   { x: 0.5, y: 1 },
  },
  light: {
    // light.bg.deepest = #FAF5EC → rgba(250, 245, 236, ...)
    colors: ['rgba(250, 245, 236, 0)', 'rgba(250, 245, 236, 0.95)'] as readonly string[],
    locations: [0, 0.6] as readonly number[],
    start: { x: 0.5, y: 0 },
    end:   { x: 0.5, y: 1 },
  },
} as const;

// ---- Notes-detail gradient tokens (design-spec notes-detail.md §6-2 P0 — retroactive hardening) ----
//
// keyscreen src/app/notes/[noteId]/page.tsx line 171~199 (BottleThumb) + line 244~260 (AuthorAvatar)
// + line 381~389 (levelGradient() function) verbatim 포팅.

// (1) BottleThumb 44×64 gradient — 160deg, [bottleColor, dark.bg.bottleShelf #1a0a1e] 70%.
// end 색은 양쪽 모드 모두 #1a0a1e 고정 (§10 E6 (a) — light에서도 어두운 와인병 분위기 보존).
export function notesDetailBottleThumbGradient(bottleColor: string) {
  return {
    colors: [bottleColor, dark.bg.bottleShelf] as readonly string[],
    locations: [0, 0.7] as readonly number[],
    start: { x: 0, y: 0 },
    end:   { x: 0.342, y: 0.94 },
  };
}

// (2) AuthorAvatar 32×32 gradient — 135deg, level L1~L5별 고정 5-종.
// 양쪽 모드 동일 (라이트에서도 어두운 음영 — keyscreen verbatim).
// home AppHeader LevelChip(gradients.levelChip)과 다른 토큰 그룹 — 의도적으로 분리.
//   - levelChip은 같은 색 + alpha 변형 (밝은 톤)
//   - noteAuthorAvatarGradient는 색 자체가 darken (L4 gold→#0F0718 deep navy)
export const noteAuthorAvatarGradient = {
  L1: { colors: ['#555560', '#2a2a35'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L2: { colors: ['#4a6fa5', '#1a2a45'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L3: { colors: ['#b8b8c0', '#3a3a48'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L4: { colors: [brand.gold,  '#0F0718'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  L5: { colors: [brand.wineRed, '#3a0810'] as readonly string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const;

export type NoteAuthorLevel = keyof typeof noteAuthorAvatarGradient;

// ---- PostTypeBadge color tokens (design-spec home.md §3-6-PATCH — 2026-05-21) ----
//
// keyscreen src/components/community/post-type-badge.tsx TYPE_MAP verbatim 포팅.
// 5색 중 note=brand.gold, column=brand.cream 재사용. question/news/album은 신규 색.
//   - question = #A08EE0 (purple, thoughtful tone)
//   - news     = #5B9CE6 (sky blue, bright/fresh tone)
//   - album    = #E8B4D2 (soft pink, visual/soft tone)
// keyscreen TYPE_MAP의 column 색(#F5F0E8)은 brand.cream(#F5F0E8)과 동일 — 토큰 재사용.
//
// **DEVIATION community-components.md §10 F**: light 모드에서 column = brand.cream (#F5F0E8) 은
// surface (#FFFFFF) 위 invisible. type identity 보존 위해 light fallback = #8B7766 (= light.text.muted)
// — soft brown tone, cream과 같은 "warm neutral" 계열 유지.
export const postTypeBadgeColor = {
  note:     brand.gold,
  question: '#A08EE0',
  column:   brand.cream,
  news:     '#5B9CE6',
  album:    '#E8B4D2',
} as const;

export const postTypeBadgeColorLight = {
  note:     brand.gold,
  question: '#A08EE0',
  column:   '#8B7766',    // light.text.muted — cream verbatim invisible 대체
  news:     '#5B9CE6',
  album:    '#E8B4D2',
} as const;

export type PostTypeKey = keyof typeof postTypeBadgeColor;

// ---- ReactionBar 4종 색 (community-components.md §1-6) ----
//
// keyscreen reaction-bar.tsx REACTION_ITEMS verbatim 포팅.
// glass(잔 들기) / sparkle(통찰) / bookmark(저장) / drank(나도) — type identity 양쪽 모드 동일.
// bookmark 색은 postTypeBadgeColor.question 과 동일 (#A08EE0) — 의미는 다름 (저장 reaction).
export const reactionColor = {
  glass:    brand.gold,
  sparkle:  brand.cream,
  bookmark: '#A08EE0',
  drank:    brand.wineRed,
} as const;

export type ReactionColorKey = keyof typeof reactionColor;

// ---- Capture PhotoFrame gradient factory (design-spec capture.md §9 P0) ----
//
// bottleColor (와인 종별 색) → capture.bottlePhotoEnd[scheme] 180deg (위→아래).
// expo-linear-gradient props 형태로 반환. scheme 인자로 dark/light 분기.
export function captureBottlePhotoGradient(
  bottleColor: string,
  scheme: 'dark' | 'light' = 'dark',
) {
  return {
    colors: [bottleColor, capture.bottlePhotoEnd[scheme]] as readonly string[],
    start: { x: 0.5, y: 0 },
    end:   { x: 0.5, y: 1 },
  };
}

// ---- Component sizes ----
// primaryButton.lg: 48 (was 52) — keyscreen verbatim (primary-button.tsx line 59 + components.md §2-1).
// design-spec onboarding-cta.md §3-1 P0. 4 step CTA verbatim 정합.
export const componentSize = {
  primaryButton: { sm: 36, md: 44, lg: 48 },
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
