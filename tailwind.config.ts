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

        // Dual-mode 토큰 (NativeWind v4 표준 — 2026-05-21 fix):
        // DEFAULT = light mode color (기본 = light)
        // dark    = dark mode override (NW v4가 .dark selector에서 CSS 변수 swap)
        // 코드의 `bg-bg-deepest` 단독 사용 시 mode에 따라 자동 분기. `dark:bg-bg-deepest`도 함께
        // 작동 (NW v4 dark: prefix가 .dark selector에 해당하는 variant 값 적용).
        //
        // 이전 (DEFAULT=dark, light=light) 패턴은 NW v4의 CSS 변수 자동 swap이 작동 안 함.
        // light가 단순 sub-shade로 처리되어 bg-bg-deepest-light 같은 suffix 클래스만 생성됨.
        'bg-deepest':   { DEFAULT: '#FAF5EC', dark: '#251837' },
        'bg-deep':      { DEFAULT: '#F2EAD9', dark: '#2E1F3F' },
        'bg-map':       { DEFAULT: '#EDE2CC', dark: '#3A2440' },
        'bg-sunken':    { DEFAULT: 'rgba(42,26,20,0.06)', dark: 'rgba(0,0,0,0.28)' },
        'bottle-shelf': { DEFAULT: '#FFFFFF', dark: '#1a0a1e' },
        surface:        { DEFAULT: '#FFFFFF', dark: '#3D2A4A' },

        'text-primary':   { DEFAULT: '#2A1A14', dark: '#F8F4ED' },
        'text-secondary': { DEFAULT: '#5A463C', dark: '#EBE0CB' },
        'text-muted':     { DEFAULT: '#8B7766', dark: '#CABDA8' },
        'text-disabled':  { DEFAULT: '#C0B0A0', dark: '#7E6E8E' },

        'border-default': { DEFAULT: '#E0D2BC', dark: '#5A3D6A' },
        'border-active':  { DEFAULT: '#B89438', dark: '#A02030' },

        'glass-bg':        { DEFAULT: 'rgba(255,255,255,0.85)',  dark: 'rgba(10,5,15,0.72)' },
        'glass-bg-strong': { DEFAULT: 'rgba(255,255,255,0.95)',  dark: 'rgba(15,7,24,0.92)' },
        'glass-border':    { DEFAULT: 'rgba(42,26,20,0.12)', dark: 'rgba(255,255,255,0.15)' },

        'map-country': { DEFAULT: '#DDD0BB', dark: '#3A2440' },
        'map-ocean':   { DEFAULT: '#C8D6E4', dark: '#100720' },

        // Status
        'status-error':   { DEFAULT: '#C92020', dark: '#EF4444' },
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

        // notes-detail retroactive (design-spec notes-detail.md §6-1 P0 — 10 신규)
        // 카드 Eyebrow 공통(10 + ls 1.8 + uppercase) + author/avatar/chip/memo/dim/row/aroma 위계.
        'notes-detail-card-eyebrow': ['10px', { lineHeight: '12px', letterSpacing: '1.8px' }],
        'note-author-name':          ['14px', { lineHeight: '16.8px' }],
        'note-avatar-letter':        ['13px', { lineHeight: '15.6px' }],
        'note-template-pill':        ['10px', { lineHeight: '12px' }],
        'note-rating-chip':          ['12px', { lineHeight: '14.4px' }],
        'note-memo-body':            ['14px', { lineHeight: '23.1px' }],
        'note-beginner-dim-value':   ['14px', { lineHeight: '15.4px' }],
        'note-row-value':            ['12px', { lineHeight: '14.4px' }],
        'note-aroma-cat-label':      ['10px', { lineHeight: '12px', letterSpacing: '0.6px' }],
        'note-peak-note':            ['12px', { lineHeight: '18px' }],
        'chip-label-regular':        ['11px', { lineHeight: '13.2px' }],

        // onboarding step retroactive (design-spec onboarding-2-language.md §3-2 P0 — 3 신규)
        // step 2/3/4 공유. step 1 워드마크(56)는 별도.
        'onboarding-step-title':    ['28px', { lineHeight: '33.6px' }],
        'onboarding-step-subtitle': ['14px', { lineHeight: '20px' }],
        'onboarding-choice-label':  ['18px', { lineHeight: '21.6px' }],
      },
    },
  },
  plugins: [],
};

export default config;
