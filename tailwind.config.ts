import type { Config } from 'tailwindcss';
import nativewindPreset from 'nativewind/preset';

/**
 * winemine NativeWind v4 tailwind 설정
 * dark/light dual mode (selector: 'class' — _layout.tsx의 useColorScheme에서 nativewindClassName 토글)
 * 토큰 동기화: src/lib/design-tokens.ts와 1:1 일치 (변경 시 양쪽 함께 수정).
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
        'wine-red': '#8B1A2A',
        'wine-red-hover': '#A02030',
        'wine-red-deep': '#5b1424',
        cream: '#F5F0E8',
        'deepest-dark': '#05020A',

        // Dual-mode 토큰: dark 기본값, light는 dark: variant
        // NativeWind v4의 변수 시스템 대신 명시적 토큰 이름으로 (명확성)
        'bg-deepest': {
          DEFAULT: '#251837',      // dark
          light: '#FAF5EC',
        },
        'bg-deep': {
          DEFAULT: '#2E1F3F',
          light: '#F2EAD9',
        },
        'bg-map': {
          DEFAULT: '#3A2440',
          light: '#EDE2CC',
        },
        surface: {
          DEFAULT: '#3D2A4A',
          light: '#FFFFFF',
        },
        'text-primary': {
          DEFAULT: '#F8F4ED',
          light: '#2A1A14',
        },
        'text-secondary': {
          DEFAULT: '#EBE0CB',
          light: '#5A463C',
        },
        'text-muted': {
          DEFAULT: '#CABDA8',
          light: '#8B7766',
        },
        'text-disabled': {
          DEFAULT: '#7E6E8E',
          light: '#C0B0A0',
        },

        // Status
        'status-error': {
          DEFAULT: '#EF4444',
          light: '#C92020',
        },
        'status-success': '#22C55E',

        // Level pills
        'level-1': '#9B8B7A',
        'level-2': '#C9A84C',
        'level-3': '#C9A84C',
        'level-4': '#8B1A2A',
        'level-5': '#A02030',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        full: '999px',
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_400Regular'],
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
      },
      fontSize: {
        'page-title': ['24px', { lineHeight: '28.8px', letterSpacing: '0.24px' }],
        'card-title': ['16px', { lineHeight: '20.8px' }],
        'back-title': ['16px'],
        'modal-title': ['22px'],
        'empty-title': ['22px', { lineHeight: '28.6px' }],
        'section-title': ['14px', { letterSpacing: '0.56px' }],
        'card-meta': ['12px'],
        'card-body': ['13px', { lineHeight: '19.5px' }],
        'level-name': ['13px'],
        'bnav-active': ['10px', { letterSpacing: '0.2px' }],
        'bnav-idle': ['10px', { letterSpacing: '0.2px' }],
      },
    },
  },
  plugins: [],
};

export default config;
