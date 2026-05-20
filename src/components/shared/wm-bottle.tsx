/**
 * WMBottle — react-native-svg port of keyscreen wm-bottle.
 *
 * v0.1.0 simplified: 단순 병 실루엣 + bottleColor fill + 라벨 영역.
 * keyscreen 원본은 producer/label/vintage 텍스트가 라벨 안에 들어가지만,
 * RN <Text in SVG>는 제한이 있어 일단 SVG는 병 모양만 그리고 텍스트는 부모가 처리.
 *
 * 사양 home.md §3-7 (RecentNotesStrip) width 26 height 86, §3-8 (WineFeedRow) width 40 height 130.
 */
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { brand, bottleColorDefault, type TypeCanonical } from '@/lib/design-tokens';

interface WMBottleProps {
  width: number;
  height: number;
  bottleColor?: string | null;
  type?: TypeCanonical | null;
}

export function WMBottle({ width, height, bottleColor, type }: WMBottleProps) {
  // bottle color resolution: explicit color > type default > red default
  const fill =
    bottleColor ??
    (type ? bottleColorDefault[type] : null) ??
    bottleColorDefault.red;

  // viewBox 40 × 130 (키스크린 wm-bottle 기본 비율 유지)
  const VB_W = 40;
  const VB_H = 130;
  const hashChar = String.fromCharCode(35);
  const gradientId = `bottle-grad-${fill.split(hashChar).join('')}`;
  const highlightId = `bottle-hl-${fill.split(hashChar).join('')}`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={fill} stopOpacity={1} />
          <Stop offset="0.5" stopColor={fill} stopOpacity={1} />
          <Stop offset="1" stopColor={brand.black} stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient id={highlightId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={brand.white} stopOpacity={0.18} />
          <Stop offset="0.5" stopColor={brand.white} stopOpacity={0} />
          <Stop offset="1" stopColor={brand.white} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* neck */}
      <Rect x={17} y={4} width={6} height={26} fill={`url(#${gradientId})`} />
      {/* shoulder + body */}
      <Path
        d="M14 30 Q14 36 11 42 L11 120 Q11 126 16 126 L24 126 Q29 126 29 120 L29 42 Q26 36 26 30 Z"
        fill={`url(#${gradientId})`}
      />
      {/* foil cap */}
      <Rect x={16} y={2} width={8} height={6} fill={brand.textInk} opacity={0.85} />
      {/* highlight */}
      <Path
        d="M14 30 Q14 36 11 42 L11 120 Q11 126 16 126 L20 126 L20 42 Q17 36 17 30 Z"
        fill={`url(#${highlightId})`}
      />
      {/* label */}
      <Rect
        x={12}
        y={70}
        width={16}
        height={36}
        fill={brand.cream}
        opacity={0.92}
        rx={1}
      />
    </Svg>
  );
}
