/**
 * WMLogoMark — 앱 브랜드 로고 마크 (와인잔 실루엣 SVG).
 *
 * 사용처: HomeHeader 로고 영역 좌측. 온보딩 등 브랜드 노출 화면에서도 사용 가능.
 * - 기본 size 26
 * - 와인잔 실루엣: wineRed fill + gold stroke
 * - 잔 받침: gold stroke
 */
import Svg, { Path } from 'react-native-svg';
import { brand } from '@/lib/design-tokens';

interface WMLogoMarkProps {
  size?: number;
}

export function WMLogoMark({ size = 26 }: WMLogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M10 4 L22 4 Q22 14 16 18 Q10 14 10 4 Z"
        stroke={brand.gold}
        strokeWidth={1.5}
        fill={brand.wineRed}
        fillOpacity={0.9}
      />
      <Path d="M16 18 L16 26" stroke={brand.gold} strokeWidth={1.5} />
      <Path d="M11 27 L21 27" stroke={brand.gold} strokeWidth={1.5} />
    </Svg>
  );
}
