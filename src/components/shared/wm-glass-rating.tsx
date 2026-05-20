/**
 * WMGlassRating — 와인잔 5개 별점 표시 (keyscreen 포팅).
 *
 * value: 0~5 (소수 가능, 0.5 단위)
 * size: 한 잔의 가로 크기 (px) — 사양 home.md RecentNotesStrip/WineFeedRow size=8
 *
 * 와인잔 모양은 단순화된 SVG path. filled=gold, empty=text-muted (현재 colorScheme dark/light).
 */
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface WMGlassRatingProps {
  value: number;
  size?: number;
  max?: number;
  gap?: number;
}

function Glass({ filled, size, color }: { filled: boolean; size: number; color: string }) {
  // viewBox 12 × 14 — 잔 모양
  return (
    <Svg width={size} height={size * (14 / 12)} viewBox="0 0 12 14">
      <Path
        d="M2 1 L10 1 Q10 5 6 7 Q2 5 2 1 Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1}
      />
      <Path d="M6 7 L6 12" stroke={color} strokeWidth={1} />
      <Path d="M3 12 L9 12" stroke={color} strokeWidth={1} />
    </Svg>
  );
}

export function WMGlassRating({ value, size = 12, max = 5, gap = 2 }: WMGlassRatingProps) {
  const tokens = useThemeTokens();
  const emptyColor = tokens.text.muted;
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <Glass key={i} filled={filled} size={size} color={filled ? brand.gold : emptyColor} />
        );
      })}
    </View>
  );
}
