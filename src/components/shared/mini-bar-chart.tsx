import Svg, { Rect, Text as SvgText, Line as SvgLine } from 'react-native-svg';

interface MiniBarChartProps {
  bars: number[];
  width: number;
  height: number;
  peakIndex: number;
  color: string;
  compact?: boolean;
}

export function MiniBarChart({
  bars,
  width,
  height,
  peakIndex,
  color,
  compact = false,
}: MiniBarChartProps) {
  if (bars.length === 0) return null;

  const pad = compact ? 6 : 18;
  const labelH = compact ? 0 : 14;
  const chartH = height - labelH;
  const chartW = width - pad * 2;

  const maxBar = Math.max(...bars);
  const barW = chartW / bars.length;
  const gap = barW * 0.15;
  const bW = barW - gap;

  return (
    <Svg width={width} height={height}>
      {bars.map((v, i) => {
        const bH = (v / maxBar) * (chartH - pad);
        const bX = pad + i * barW + gap / 2;
        const bY = chartH - bH;
        const isPeak = i === peakIndex;

        return (
          <Rect
            key={i}
            x={bX}
            y={bY}
            width={bW}
            height={bH}
            rx={2}
            fill={isPeak ? color : color + '55'}
            stroke={isPeak ? '#F5ECD7' : 'none'}
            strokeWidth={isPeak ? 0.5 : 0}
          />
        );
      })}

      {!compact &&
        bars.map((_, i) => {
          if (i % 2 !== 0) return null;
          const bX = pad + i * barW + bW / 2 + gap / 2;
          return (
            <SvgText
              key={i}
              x={bX}
              y={height - 2}
              textAnchor="middle"
              fontSize={8}
              fill="#8B7766"
              fontFamily="Inter_400Regular"
            >
              {String(i)}
            </SvgText>
          );
        })}

      {!compact && (
        <SvgLine
          x1={pad + peakIndex * barW + bW / 2 + gap / 2}
          y1={0}
          x2={pad + peakIndex * barW + bW / 2 + gap / 2}
          y2={chartH}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3,2"
          strokeOpacity={0.6}
        />
      )}
    </Svg>
  );
}
