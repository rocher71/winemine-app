import type { Config } from 'tailwindcss';
import nativewindPreset from 'nativewind/preset';

/**
 * winemine NativeWind v4 tailwind 설정
 *
 * - dark/light dual mode (selector: 'class')
 * - 토큰 동기화: src/lib/design-tokens.ts와 1:1 일치 (변경 시 양쪽 함께 수정).
 * - borderRadius·spacing은 NW v4 기본 scale을 그대로 사용. design-tokens.ts의 `radius`·`spacing`
 *   값은 NW v4 기본과 동일해야 함 (이 파일은 색·타이포·spacing 추가분만 extend).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [nativewindPreset],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand-fixed (테마 무관)
        gold: '#C9A84C',
        'gold-soft': '#D4B85C',
        'gold-deep': '#A07F2E',
        'wine-red': '#8B1A2A',
        'wine-red-hover': '#A02030',
        'wine-red-deep': '#5b1424',
        cream: '#F5F0E8',
        'deepest-dark': '#05020A',

        // Dual-mode 토큰: DEFAULT=dark, light=light variant (className: bg-X / dark:bg-X 패턴)
        // NW v4 darkMode:'class'에서 dark: 접두사로 다크 모드 토글.
        'bg-deepest':   { DEFAULT: '#251837', light: '#FAF5EC' },
        'bg-deep':      { DEFAULT: '#2E1F3F', light: '#F2EAD9' },
        'bg-map':       { DEFAULT: '#3A2440', light: '#EDE2CC' },
        'bg-sunken':    { DEFAULT: 'rgba(0,0,0,0.28)', light: 'rgba(42,26,20,0.06)' },
        'bottle-shelf': { DEFAULT: '#1a0a1e', light: '#FFFFFF' },
        surface:        { DEFAULT: '#3D2A4A', light: '#FFFFFF' },

        'text-primary':   { DEFAULT: '#F8F4ED', light: '#2A1A14' },
        'text-secondary': { DEFAULT: '#EBE0CB', light: '#5A463C' },
        'text-muted':     { DEFAULT: '#CABDA8', light: '#8B7766' },
        'text-disabled':  { DEFAULT: '#7E6E8E', light: '#C0B0A0' },

        'border-default': { DEFAULT: '#5A3D6A', light: '#E0D2BC' },
        'border-active':  { DEFAULT: '#A02030', light: '#B89438' },

        'glass-bg':        { DEFAULT: 'rgba(10,5,15,0.72)',  light: 'rgba(255,255,255,0.85)' },
        'glass-bg-strong': { DEFAULT: 'rgba(15,7,24,0.92)',  light: 'rgba(255,255,255,0.95)' },
        'glass-border':    { DEFAULT: 'rgba(255,255,255,0.15)', light: 'rgba(42,26,20,0.12)' },

        'map-country': { DEFAULT: '#3A2440', light: '#DDD0BB' },
        'map-ocean':   { DEFAULT: '#100720', light: '#C8D6E4' },

        // Status
        'status-error':   { DEFAULT: '#EF4444', light: '#C92020' },
        'status-success': '#22C55E',

        // Level pills (테마 무관)
        'level-1': '#9B8B7A',
        'level-2': '#C9A84C',
        'level-3': '#C9A84C',
        'level-4': '#8B1A2A',
        'level-5': '#A02030',
      },

      // Tailwind 기본 spacing scale에 winemine 비표준 값 추가.
      // 기본 scale에 없는 13(52px), 18(72px), 22(88px) 등을 명시. 9/10/11/14는 기본 scale에 이미 있음.
      // capture retroactive: 0.75(3px MetaRow mb), 26(104px OptionCard height).
      spacing: {
        '0.75': '3px',
        '13': '52px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
      },

      // home retroactive: 14, 20 신규 (NW v4 기본은 12=xl, 16=2xl, 24=3xl).
      // wine-detail retroactive: 18 (WineHero outer — 사양 §3-3, §9 P0).
      // capture retroactive: 10 (SecondaryButton — 사양 §9 P0).
      borderRadius: {
        '7': '7px',
        '10': '10px',
        '14': '14px',
        '18': '18px',
        '20': '20px',
      },

      fontFamily: {
        playfair: ['PlayfairDisplay_400Regular'],
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
      },

      // 키스크린 globals.css의 .wm-* 유틸 클래스 1:1 매핑.
      // [size, { lineHeight, letterSpacing }] 형식 — RN 변환 시 size+lineHeight+letterSpacing(px) 적용.
      fontSize: {
        'page-title':     ['24px', { lineHeight: '28.8px', letterSpacing: '-0.24px' }],
        'card-title':     ['16px', { lineHeight: '20.8px' }],
        'back-title':     ['16px', { lineHeight: '19.2px' }],
        'modal-title':    ['22px', { lineHeight: '26.4px' }],
        'modal-desc':     ['14px', { lineHeight: '21px' }],
        'empty-title':    ['22px', { lineHeight: '28.6px' }],
        'empty-desc':     ['14px', { lineHeight: '22.4px' }],
        'section-title':  ['14px', { lineHeight: '14px', letterSpacing: '0.56px' }],
        'section-link':   ['12px', { lineHeight: '12px' }],
        'card-meta':      ['12px', { lineHeight: '14.4px' }],
        'card-body':      ['13px', { lineHeight: '19.5px' }],
        'level-name':     ['13px', { lineHeight: '15.6px' }],
        'glossary-term':  '16px',
        'glossary-def':   ['13px', { lineHeight: '19.5px' }],
        'bnav-active':    ['10px', { letterSpacing: '0.2px' }],
        'bnav-idle':      ['10px', { letterSpacing: '0.2px' }],

        // home retroactive (design-spec home.md §9)
        'peak-greeting':       ['22px', { lineHeight: '27.5px', letterSpacing: '-0.22px' }],
        'first-time-headline': ['28px', { lineHeight: '33.6px' }],
        'map-cameo-title':     '14px',
        'community-peek-title':['17px', { lineHeight: '20.4px' }],
        'home-eyebrow':        ['10px', { letterSpacing: '1.8px' }],
        'home-stat-value':     ['20px', { lineHeight: '22px', letterSpacing: '-0.4px' }],
        'home-feed-title':     '18px',
        'home-feed-row-name':  ['15px', { lineHeight: '18px' }],
        'home-recent-name':    ['12px', { lineHeight: '15px' }],

        // wine-detail retroactive (design-spec wine-detail.md §9)
        'card-section-title':  ['14px', { lineHeight: '16.8px' }],
        'card-big':            ['20px', { lineHeight: '22px' }],
        'rating-pill-score':   ['18px', { lineHeight: '19.8px' }],
        'wine-story-headline': ['22px', { lineHeight: '26.4px' }],
        'wset-mini-dim':       ['13px', { lineHeight: '14.3px' }],
        'micro-label':         ['9px',  { letterSpacing: '0.36px' }],
        'serving-temp-pill':   ['11px', { lineHeight: '13.2px' }],

        // cellar-list retroactive (design-spec cellar-list.md §9 P0)
        'tab-segment-label':   ['12px', { lineHeight: '14.4px' }],
        'tab-count':           ['10px', { lineHeight: '12px' }],
        'chip-label':          ['11px', { lineHeight: '13.2px' }],
        'cellar-card-name':    ['12px', { lineHeight: '15px' }],
        'drink-window-badge':  ['10px', { lineHeight: '12px' }],

        // cellar-detail retroactive (design-spec cellar-detail.md §9-2 P0)
        'cellar-hero-producer': ['13px', { lineHeight: '15.6px' }],
        'timeline-year-label':  ['10px', { lineHeight: '12px' }],

        // notes-new retroactive (design-spec notes-new.md §4-2 P0 — 10 신규)
        'template-card-title':   ['14px', { lineHeight: '16.8px' }],
        'template-card-author':  ['11px', { lineHeight: '13.2px' }],
        'template-card-desc':    ['12px', { lineHeight: '17.4px' }],
        'template-custom-badge': ['9px',  { lineHeight: '11px', letterSpacing: '0.45px' }],
        'source-card-title':     ['16px', { lineHeight: '19.2px' }],
        'source-card-sub':       ['12px', { lineHeight: '16.8px' }],
        'bottom-sheet-title':    ['18px', { lineHeight: '21.6px' }],
        'cellar-row-name':       ['13px', { lineHeight: '15.6px' }],
        'cellar-row-meta':       ['11px', { lineHeight: '13.2px' }],
        'back-to-template':      ['11px', { lineHeight: '13.2px' }],

        // notes-write retroactive (design-spec notes-write.md §4-2 P0 — 5 신규)
        // stepHeaderTitle은 card-section-title 재사용. shareToggleSub은 cellar-row-meta 재사용.
        'beginner-eyebrow':      ['11px', { lineHeight: '11px', letterSpacing: '1.76px' }],
        'beginner-greeting':     ['12px', { lineHeight: '18px' }],
        'step-header-badge':     ['11px', { lineHeight: '13.2px' }],
        'summary-eyebrow':       ['11px', { lineHeight: '11px', letterSpacing: '1.1px' }],
        'summary-text':          ['13px', { lineHeight: '19.5px' }],
      },
    },
  },
  plugins: [],
};

export default config;
