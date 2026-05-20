/**
 * MiniMapPreview — 320×100 SVG, 6 대륙 silhouette + 14 dot.
 *
 * 사양 home.md §2-1 line 95-98, §3-5:
 * - 6 ellipse fill mapDark.continent, opacity 0.8
 * - 14 circle dots: strong 6개 (wineRed r=3.5 op 0.9) + soft 8개 (gold r=2.5 op 0.7)
 *
 * 키스크린 verbatim 14 dot 위치 (직접 mock 좌표 — 실제 visited countries 데이터로 추후 교체).
 */
import Svg, { G, Ellipse, Circle } from 'react-native-svg';
import { brand, mapDark } from '@/lib/design-tokens';

const CONTINENTS: Array<{ cx: number; cy: number; rx: number; ry: number }> = [
  { cx: 60, cy: 55, rx: 38, ry: 22 },   // North America
  { cx: 110, cy: 80, rx: 18, ry: 14 },  // South America
  { cx: 170, cy: 48, rx: 28, ry: 18 },  // Europe
  { cx: 195, cy: 72, rx: 26, ry: 20 },  // Africa
  { cx: 240, cy: 55, rx: 42, ry: 22 },  // Asia
  { cx: 285, cy: 88, rx: 16, ry: 8 },   // Oceania
];

const STRONG_DOTS: Array<{ cx: number; cy: number }> = [
  { cx: 165, cy: 50 },
  { cx: 175, cy: 45 },
  { cx: 180, cy: 55 },
  { cx: 235, cy: 60 },
  { cx: 245, cy: 55 },
  { cx: 60, cy: 60 },
];

const SOFT_DOTS: Array<{ cx: number; cy: number }> = [
  { cx: 110, cy: 80 },
  { cx: 105, cy: 75 },
  { cx: 195, cy: 78 },
  { cx: 200, cy: 72 },
  { cx: 250, cy: 60 },
  { cx: 230, cy: 65 },
  { cx: 285, cy: 88 },
  { cx: 70, cy: 50 },
];

interface MiniMapPreviewProps {
  height?: number;
}

export function MiniMapPreview({ height = 100 }: MiniMapPreviewProps) {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 320 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ marginTop: 6 }}
    >
      <G fill={mapDark.continent} opacity={0.8}>
        {CONTINENTS.map((c, i) => (
          <Ellipse key={`con-${i}`} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} />
        ))}
      </G>
      {STRONG_DOTS.map((d, i) => (
        <Circle
          key={`strong-${i}`}
          cx={d.cx}
          cy={d.cy}
          r={3.5}
          fill={brand.wineRed}
          opacity={0.9}
        />
      ))}
      {SOFT_DOTS.map((d, i) => (
        <Circle
          key={`soft-${i}`}
          cx={d.cx}
          cy={d.cy}
          r={2.5}
          fill={brand.gold}
          opacity={0.7}
        />
      ))}
    </Svg>
  );
}
