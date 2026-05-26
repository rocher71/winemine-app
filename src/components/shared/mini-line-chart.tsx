import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Polyline,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import type { PricePoint } from '@/lib/types/wine-detail';

interface MiniLineChartProps {
  data: PricePoint[];
  width: number;
  height: number;
  color: string;
  compact?: boolean;
}

export function MiniLineChart({ data, width, height, color, compact = false }: MiniLineChartProps) {
  if (data.length === 0) return null;

  const pad = compact ? 8 : 18;
  const labelH = compact ? 0 : 14;
  const chartH = height - labelH;
  const chartW = width - pad * 2;

  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const toX = (i: number) => pad + (i / (data.length - 1)) * chartW;
  const toY = (p: number) => pad + (1 - (p - minP) / range) * (chartH - pad * 2);

  const points = data.map((d, i) => `${toX(i)},${toY(d.price)}`).join(' ');

  const firstX = toX(0);
  const firstY = toY(prices[0] ?? minP);
  const lastX = toX(data.length - 1);

  const fillPath = `M${firstX},${firstY} ${data
    .map((d, i) => `L${toX(i)},${toY(d.price)}`)
    .join(' ')} L${lastX},${chartH - pad} L${firstX},${chartH - pad} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="mini-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.30" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Path d={fillPath} fill="url(#mini-fill)" />

      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const cx = toX(i);
        const cy = toY(d.price);
        if (isLast) {
          return (
            <Circle key={i} cx={cx} cy={cy} r={3.5} fill="#F5ECD7" stroke={color} strokeWidth={1.5} />
          );
        }
        return <Circle key={i} cx={cx} cy={cy} r={1.5} fill={color} />;
      })}

      {!compact &&
        data.map((d, i) => {
          if (i % 2 !== 0) return null;
          return (
            <SvgText
              key={i}
              x={toX(i)}
              y={height - 2}
              textAnchor="middle"
              fontSize={8}
              fill="#8B7766"
              fontFamily="Inter_400Regular"
            >
              {d.month}
            </SvgText>
          );
        })}
    </Svg>
  );
}
