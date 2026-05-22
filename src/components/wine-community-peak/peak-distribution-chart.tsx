/**
 * PeakDistributionChart — react-native-svg 기반 manual BarChart
 *   + 3 ReferenceLine (systemPeak / mean / median)
 *   + tap-driven Tooltip
 *   + Legend.
 *
 * 사양: wine-community-peak.md §3-4 / §3-4a.
 *
 * §10 결정 C: react-native-svg 수동 구현 (~250 LOC, wine-prices/price-chart 패턴 재사용).
 * §10 K: tap-driven manual callout — long-press 불필요, 같은 bar 재탭 시 close.
 *
 * Light-only 화면 (wine-community-peak.md §0-2). 모든 색은 light.* / brand.* 토큰 직접 inline.
 *
 * §4-11 3-layer Pressable 패턴 — bar invisible Rect overlay.
 */
import { useMemo, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Svg, { Rect, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import type { CommunityPeakAggregate } from '@/lib/community-peak-aggregator';

interface PeakDistributionChartProps {
  aggregate: CommunityPeakAggregate;
  /** SVG height (default 240 — keyscreen 280 - card padding). */
  height?: number;
  /** Legend 렌더 여부. */
  showLegend?: boolean;
}

export function PeakDistributionChart({
  aggregate,
  height = 240,
  showLegend = true,
}: PeakDistributionChartProps) {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // chart 영역 — screen width - section paddingHorizontal 16 × 2 - card padding 16 × 2.
  const screenW = Dimensions.get('window').width;
  const cardOuterW = screenW - 32;
  const cardPadding = 16;
  const svgW = cardOuterW - cardPadding * 2;
  const svgH = height;

  // chart inner padding (axis 라벨 공간).
  const padL = 40;
  const padR = 12;
  const padT = 24; // ReferenceLine label 위 공간.
  const padB = 22;
  const chartW = Math.max(50, svgW - padL - padR);
  const chartH = Math.max(50, svgH - padT - padB);

  const { bars, xTicks, yTicks, refLines } = useMemo(() => {
    const dist = aggregate.distribution;
    if (dist.length === 0) {
      return {
        bars: [] as {
          x: number;
          y: number;
          w: number;
          h: number;
          year: number;
          count: number;
        }[],
        xTicks: [] as { x: number; label: string }[],
        yTicks: [] as { y: number; label: string }[],
        refLines: [] as {
          x: number;
          stroke: string;
          dash: string | undefined;
          strokeWidth: number;
          label: string;
        }[],
      };
    }

    const years = dist.map((d) => d.year);
    const counts = dist.map((d) => d.count);
    let minYear = Math.min(...years);
    let maxYear = Math.max(...years);
    const maxCount = Math.max(...counts);

    // 양쪽 1년 여유 (refLine 가시성 확보).
    const systemPeak = aggregate.systemPeakYear;
    const meanRounded = Math.round(aggregate.meanPeakYear);
    const median = aggregate.medianPeakYear;
    const allYears = [
      minYear,
      maxYear,
      systemPeak,
      meanRounded,
      median,
    ].filter((y) => y > 0);
    minYear = Math.min(...allYears) - 1;
    maxYear = Math.max(...allYears) + 1;
    const yearSpan = maxYear - minYear || 1;

    const yearToX = (year: number) =>
      padL + ((year - minYear) / yearSpan) * chartW;

    // bar width — 1년 step 의 ~60%.
    const stepW = chartW / yearSpan;
    const barW = Math.max(8, Math.min(28, stepW * 0.6));

    const bars = dist.map((d) => {
      const cx = yearToX(d.year);
      const x = cx - barW / 2;
      const h = (d.count / maxCount) * chartH;
      const y = padT + chartH - h;
      return { x, y, w: barW, h, year: d.year, count: d.count };
    });

    // X ticks — 4~6 (균등 sampling).
    const xTickCount = Math.min(6, Math.max(3, Math.round(yearSpan) + 1));
    const xTicks: { x: number; label: string }[] = [];
    for (let i = 0; i < xTickCount; i++) {
      const y =
        Math.round(minYear + (yearSpan * i) / (xTickCount - 1 || 1));
      xTicks.push({ x: yearToX(y), label: String(y) });
    }

    // Y ticks — 4 (0, max/3, 2max/3, max).
    const yTickCount = 4;
    const yTicks: { y: number; label: string }[] = [];
    for (let i = 0; i < yTickCount; i++) {
      const v = (maxCount * i) / (yTickCount - 1);
      const yi = padT + chartH - (v / maxCount) * chartH;
      yTicks.push({
        y: yi,
        label:
          maxCount < 5
            ? v.toFixed(1)
            : String(Math.round(v)),
      });
    }

    // 3 ReferenceLines.
    const refLines: {
      x: number;
      stroke: string;
      dash: string | undefined;
      strokeWidth: number;
      label: string;
    }[] = [];
    if (systemPeak > 0) {
      refLines.push({
        x: yearToX(systemPeak),
        stroke: brand.gold,
        dash: '4,4',
        strokeWidth: 1,
        label: t('wineCommunityPeak.histogram.refLine.system'),
      });
    }
    if (meanRounded > 0) {
      refLines.push({
        x: yearToX(meanRounded),
        stroke: brand.wineRedHover,
        dash: undefined,
        strokeWidth: 2,
        label: t('wineCommunityPeak.histogram.refLine.mean'),
      });
    }
    if (median > 0) {
      refLines.push({
        x: yearToX(median),
        // §6 #3: cream → light.text.primary (light 모드 가시성).
        stroke: light.text.primary,
        dash: '2,2',
        strokeWidth: 1,
        label: t('wineCommunityPeak.histogram.refLine.median'),
      });
    }

    return { bars, xTicks, yTicks, refLines };
  }, [aggregate, chartW, chartH, padL, padT, t]);

  const handleBarPress = (idx: number) => {
    Haptics.selectionAsync().catch(() => undefined);
    setActiveIdx((prev) => (prev === idx ? null : idx));
  };

  const activeBar = activeIdx !== null ? bars[activeIdx] ?? null : null;

  // Tooltip 위치 clamp (svg 영역 내 유지).
  const tooltipW = 140;
  const tooltipH = 50;
  const tooltipLeft = activeBar
    ? Math.max(
        4,
        Math.min(
          svgW - tooltipW - 4,
          activeBar.x + activeBar.w / 2 - tooltipW / 2,
        ),
      )
    : 0;
  const tooltipTop = activeBar
    ? Math.max(2, activeBar.y - tooltipH - 6)
    : 0;

  return (
    <View>
      <View style={{ width: svgW, height: svgH, alignSelf: 'center' }}>
        <Svg width={svgW} height={svgH}>
          {/* Y grid (horizontal dashed) */}
          {yTicks.map((tick, idx) => (
            <SvgLine
              key={`yg-${idx}`}
              x1={padL}
              x2={svgW - padR}
              y1={tick.y}
              y2={tick.y}
              stroke={light.border.default}
              strokeDasharray="3,3"
              strokeOpacity={0.4}
            />
          ))}

          {/* Y axis tick labels */}
          {yTicks.map((tick, idx) => (
            <SvgText
              key={`yl-${idx}`}
              x={padL - 6}
              y={tick.y + 3}
              fill={light.text.muted}
              fontSize={10}
              fontFamily="Freesentation_4Regular"
              textAnchor="end"
            >
              {tick.label}
            </SvgText>
          ))}

          {/* X axis tick labels */}
          {xTicks.map((tick, idx) => (
            <SvgText
              key={`xl-${idx}`}
              x={tick.x}
              y={svgH - 6}
              fill={light.text.muted}
              fontSize={10}
              fontFamily="Freesentation_4Regular"
              textAnchor="middle"
            >
              {tick.label}
            </SvgText>
          ))}

          {/* Bars */}
          {bars.map((b, idx) => (
            <Rect
              key={`bar-${idx}`}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={4}
              ry={4}
              fill={
                activeIdx === idx ? brand.wineRedHover : brand.wineRed
              }
            />
          ))}

          {/* ReferenceLines + labels */}
          {refLines.map((r, idx) => (
            <SvgLine
              key={`rl-${idx}`}
              x1={r.x}
              x2={r.x}
              y1={padT}
              y2={padT + chartH}
              stroke={r.stroke}
              strokeWidth={r.strokeWidth}
              strokeDasharray={r.dash}
            />
          ))}
          {refLines.map((r, idx) => (
            <SvgText
              key={`rll-${idx}`}
              x={r.x}
              y={padT - 6}
              fill={r.stroke}
              fontSize={9}
              fontFamily="Freesentation_4Regular"
              textAnchor="middle"
            >
              {r.label}
            </SvgText>
          ))}
        </Svg>

        {/* Invisible Pressable overlay per bar (tap target). svg <Rect onPress> 가 일부 환경에서
            안정적이지 않아 absolute <Pressable> 로 분리. */}
        {bars.map((b, idx) => (
          <Pressable
            key={`bar-hit-${idx}`}
            onPress={() => handleBarPress(idx)}
            accessibilityRole="button"
            accessibilityLabel={t('wineCommunityPeak.histogram.bar.a11yLabel', {
              year: b.year,
              count: b.count,
            })}
            accessibilityState={{ selected: activeIdx === idx }}
            hitSlop={2}
            style={({ pressed }) => ({
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.w,
              // 최소 24 hit-target (작은 막대도 누르기 쉽도록).
              height: Math.max(24, b.h),
              opacity: pressed ? 0.8 : 1,
            })}
          />
        ))}

        {/* Tooltip callout */}
        {activeBar ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: tooltipLeft,
              top: tooltipTop,
              width: tooltipW,
              padding: 10,
              backgroundColor: light.bg.surface,
              borderWidth: 1,
              borderColor: brand.gold,
              borderRadius: 10,
              shadowColor: brand.black,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 22,
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '700',
                fontSize: 12,
                color: brand.gold,
                lineHeight: 14.4,
              }}
            >
              {activeBar.year}
            </Text>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                color: light.text.secondary,
                marginTop: 2,
                lineHeight: 16,
              }}
            >
              {t('wineCommunityPeak.histogram.tooltip.count', {
                count: activeBar.count.toFixed(1),
              })}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Legend */}
      {showLegend ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 8,
          }}
        >
          <LegendDot
            color={brand.gold}
            dashed
            label={t('wineCommunityPeak.histogram.legend.system')}
          />
          <LegendDot
            color={brand.wineRedHover}
            dashed={false}
            label={t('wineCommunityPeak.histogram.legend.mean')}
          />
          <LegendDot
            color={light.text.primary}
            dashed
            label={t('wineCommunityPeak.histogram.legend.median')}
          />
        </View>
      ) : null}
    </View>
  );
}

// ---- LegendDot ----
//
// §6 #6: CSS repeating-linear-gradient → react-native-svg <Line strokeDasharray="3 3"/>.

function LegendDot({
  color,
  dashed,
  label,
}: {
  color: string;
  dashed: boolean;
  label: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Svg width={14} height={2}>
        <SvgLine
          x1="0"
          y1="1"
          x2="14"
          y2="1"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dashed ? '3,3' : undefined}
        />
      </Svg>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          color: light.text.muted,
          lineHeight: 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
