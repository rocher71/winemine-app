/**
 * WMLogoMark — 앱 브랜드 로고 마크 (와인잔 SVG).
 *
 * 사용처: HomeHeader 로고 영역 좌측. 온보딩 등 브랜드 노출 화면에서도 사용 가능.
 * - 기본 size 26 (height = size * 140/120)
 * - gold stroke 외곽선 + wineRed fill + stem/base
 */
import Svg, { Path, Line } from 'react-native-svg';
import { brand } from '@/lib/design-tokens';

interface WMLogoMarkProps {
  size?: number;
}

export function WMLogoMark({ size = 26 }: WMLogoMarkProps) {
  const height = size * (140 / 120);
  return (
    <Svg width={size} height={height} viewBox="0 0 120 140" fill="none">
      <Path
        d="M20 14 H100 L96 50 C96 76 80 92 60 92 C40 92 24 76 24 50 Z"
        stroke={brand.gold}
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M28 30 H92 L89 50 C89 71 76 84 60 84 C44 84 31 71 31 50 Z"
        fill={brand.wineRed}
      />
      <Line x1={60} y1={92} x2={60} y2={120} stroke={brand.gold} strokeWidth={2} />
      <Line x1={32} y1={124} x2={88} y2={124} stroke={brand.gold} strokeWidth={2} />
    </Svg>
  );
}
