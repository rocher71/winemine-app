/**
 * WineLabelArt — Hero 중앙의 라벨 placeholder.
 *
 * 사양: design-spec cellar-detail.md §3-2 + §9-2.
 * 키스크린 원본: src/components/shared/wine-label-art.tsx (77 LOC, SVG-free div + gradient + 이니셜).
 *
 * 구조:
 *   outer LinearGradient (160deg, 3-stop: bottle_color → shade(-20) → shade(-40))
 *     + border rgba(gold, 0.18) + radius 8 + overflow hidden + width 100 height 150
 *   inner highlight overlay (180deg, white alpha 0.10 → 0, top 40%)
 *   inner Text — 와인명 첫 글자 (Playfair 42, cream, uppercase, decorative)
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  brand,
  withAlpha,
  wineLabelArtGradient,
  wineLabelArtHighlightGradient,
} from '@/lib/design-tokens';

interface Props {
  bottleColor: string;
  /** 와인명 — 첫 글자(첫 문자)만 라벨에 노출 */
  displayName: string;
  width?: number;
  height?: number;
}

export function WineLabelArt({ bottleColor, displayName, width = 100, height = 150 }: Props) {
  const labelGrad = wineLabelArtGradient(bottleColor);
  // 첫 문자 (한글/영문 모두 동작). emoji는 미사용 (정책 §4-1).
  const initial = (displayName?.trim().charAt(0) ?? '').toUpperCase();
  // 폰트 크기: max(20, min(width, height) * 0.42). 100×150 기준 42.
  const fontSize = Math.max(20, Math.min(width, height) * 0.42);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width,
        height,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.18),
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* 3-stop bottle_color gradient */}
      <LinearGradient
        colors={labelGrad.colors as unknown as readonly [string, string, string]}
        locations={labelGrad.locations as unknown as readonly [number, number, number]}
        start={labelGrad.start}
        end={labelGrad.end}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize,
            color: brand.cream,
            letterSpacing: -fontSize * 0.02,
            textTransform: 'uppercase',
            // RN은 lineHeight 0 미지원 — fontSize 로 align 중앙
            lineHeight: fontSize,
            includeFontPadding: false,
          }}
        >
          {initial}
        </Text>
      </LinearGradient>

      {/* 상단 highlight overlay (40% height) */}
      <LinearGradient
        pointerEvents="none"
        colors={wineLabelArtHighlightGradient.colors as unknown as readonly [string, string]}
        start={wineLabelArtHighlightGradient.start}
        end={wineLabelArtHighlightGradient.end}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
        }}
      />
    </View>
  );
}
