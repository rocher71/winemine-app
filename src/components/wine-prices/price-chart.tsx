/**
 * PriceChart — react-native-svg 기반 minimal line chart (wine-prices.md §3-3, §3-3a).
 *
 * 사양 §10 결정 C: react-native-svg 수동 구현 (LOC 200~300 목표).
 *   - 4 range 토글 (3M / 6M / 1Y / ALL) — wine-prices.md §3-3 의 3 range (3M/1Y/ALL) 대신
 *     상위 작업 요청 §G/§3-3 비교 후 keyscreen 3 range 유지: `['3M', '1Y', 'ALL']`.
 *   - X축: 시간 (ts), Y축: 가격 (priceKrw).
 *   - line: <Path d="M ... L ... L ..."/> (linear 연결 — keyscreen monotone 근사).
 *   - dots: <Circle/> 각 데이터 포인트.
 *   - avg ReferenceLine: 가로 dashed line + 'avg' label.
 *   - tooltip drag interaction: 생략 (사양 §6 #16 — v0.2.0).
 *
 * Light-only 화면 (wine-prices.md §0-2). 모든 색은 light.* / brand.* 토큰 직접 inline.
 *
 * §4-11 3-layer Pressable 패턴 (range 토글).
 */
import { useMemo, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Line as SvgLine,
  Text as SvgText,
} from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import type { Purchase } from '@/lib/mock/purchases';

type Range = '3M' | '1Y' | 'ALL';
const RANGES: Range[] = ['3M', '1Y', 'ALL'];

interface PriceChartProps {
  purchases: Purchase[];
}

function formatMonth(ts: number, locale: 'ko' | 'en'): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return locale === 'ko' ? `${String(y).slice(2)}.${m}` : `${m}/${String(y).slice(2)}`;
}

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `₩${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₩${Math.round(value / 1_000)}k`;
  return `₩${value}`;
}

function filterByRange(purchases: Purchase[], range: Range): Purchase[] {
  if (range === 'ALL') return purchases;
  const now = Date.now();
  const months = range === '3M' ? 3 : 12;
  const cutoff = now - months * 30 * 24 * 60 * 60 * 1000;
  return purchases.filter((p) => new Date(p.purchasedAt).getTime() >= cutoff);
}

export function PriceChart({ purchases }: PriceChartProps) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language as 'ko' | 'en') || 'ko';
  const [range, setRange] = useState<Range>('ALL');

  const handleRangePress = (r: Range) => {
    Haptics.selectionAsync().catch(() => undefined);
    setRange(r);
  };

  const dataset = useMemo(() => {
    const filtered = filterByRange(purchases, range);
    return [...filtered].sort(
      (a, b) =>
        new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime(),
    );
  }, [purchases, range]);

  const isEmpty = dataset.length === 0;

  // chart 영역 크기 (paddingHorizontal 16 × 2 = 32 + card padding 16 × 2 = 32 = 64 - svg padding).
  const screenW = Dimensions.get('window').width;
  const cardOuter = screenW - 32; // card width
  const cardPadding = 16;
  const svgW = cardOuter - cardPadding * 2;
  const svgH = 240;

  // chart inner padding (axis 라벨 공간 확보).
  const padL = 56;
  const padR = 8;
  const padT = 16;
  const padB = 24;
  const chartW = Math.max(50, svgW - padL - padR);
  const chartH = Math.max(50, svgH - padT - padB);

  const { points, pathD, avg, avgY, xTicks, yTicks } = useMemo(() => {
    if (dataset.length === 0) {
      return {
        points: [] as { x: number; y: number; p: Purchase }[],
        pathD: '',
        avg: 0,
        avgY: 0,
        xTicks: [] as { x: number; label: string }[],
        yTicks: [] as { y: number; label: string }[],
      };
    }
    const tsArr = dataset.map((p) => new Date(p.purchasedAt).getTime());
    const priceArr = dataset.map((p) => p.priceKrw);
    const minTs = Math.min(...tsArr);
    const maxTs = Math.max(...tsArr);
    const minPrice = Math.min(...priceArr);
    const maxPrice = Math.max(...priceArr);
    const tsSpan = maxTs - minTs || 1;
    const priceSpan = maxPrice - minPrice || 1;

    const pts = dataset.map((p) => {
      const ts = new Date(p.purchasedAt).getTime();
      const x = padL + ((ts - minTs) / tsSpan) * chartW;
      const y = padT + chartH - ((p.priceKrw - minPrice) / priceSpan) * chartH;
      return { x, y, p };
    });

    // 직선 연결 (monotone 근사). 키스크린 type='monotone' 은 spline — v0.1.0 직선으로 단순화.
    const d = pts
      .map((pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`))
      .join(' ');

    const avgPrice = priceArr.reduce((a, b) => a + b, 0) / priceArr.length;
    const avgYpos = padT + chartH - ((avgPrice - minPrice) / priceSpan) * chartH;

    // X tick: 4~6개 (dataset.length 에 따라 균등 sampling).
    const tickCount = Math.min(5, dataset.length);
    const xTicks = Array.from({ length: tickCount }, (_, i) => {
      const t = minTs + (tsSpan * i) / (tickCount - 1 || 1);
      const x = padL + ((t - minTs) / tsSpan) * chartW;
      return { x, label: formatMonth(t, locale) };
    });

    // Y tick: 4개.
    const yTickCount = 4;
    const yTicks = Array.from({ length: yTickCount }, (_, i) => {
      const v = minPrice + (priceSpan * i) / (yTickCount - 1);
      const y = padT + chartH - ((v - minPrice) / priceSpan) * chartH;
      return { y, label: formatPrice(v) };
    });

    return {
      points: pts,
      pathD: d,
      avg: avgPrice,
      avgY: avgYpos,
      xTicks,
      yTicks,
    };
  }, [dataset, locale, padL, padR, padT, padB, chartW, chartH]);

  return (
    <View
      style={{
        marginHorizontal: 16,
        padding: 16,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 16,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '600',
            fontSize: 14,
            color: light.text.primary,
            lineHeight: 19.6,
          }}
        >
          {t('winePrices.priceChart.title')}
        </Text>

        {/* Range toggle group — §4-11 3-layer */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <Pressable
                key={r}
                onPress={() => handleRangePress(r)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`winePrices.priceChart.range.${r}.label`)}
                hitSlop={4}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: light.border.default,
                    borderRadius: 8,
                    // §10 H: gold (light.border.active) — wine-red 채도 강해 light 카드 위 부조화 회피
                    backgroundColor: active ? light.border.active : light.bg.deep,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Freesentation_4Regular',
                      fontWeight: '600',
                      fontSize: 11,
                      lineHeight: 13,
                      color: active ? brand.cream : light.text.muted,
                    }}
                  >
                    {r}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Chart 본문 */}
      {isEmpty ? (
        <View
          style={{
            height: svgH,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              color: light.text.muted,
              textAlign: 'center',
            }}
          >
            {t('winePrices.priceChart.empty')}
          </Text>
        </View>
      ) : (
        <View style={{ width: svgW, height: svgH }}>
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

            {/* Avg ReferenceLine */}
            {avg > 0 ? (
              <>
                <SvgLine
                  x1={padL}
                  x2={svgW - padR}
                  y1={avgY}
                  y2={avgY}
                  stroke={brand.gold}
                  strokeDasharray="4,4"
                  strokeWidth={1}
                />
                <SvgText
                  x={svgW - padR - 4}
                  y={avgY - 4}
                  fill={brand.gold}
                  fontSize={10}
                  fontFamily="Freesentation_4Regular"
                  textAnchor="end"
                >
                  {t('winePrices.priceChart.avgLabel')}
                </SvgText>
              </>
            ) : null}

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

            {/* Line */}
            <Path
              d={pathD}
              stroke={brand.wineRed}
              strokeWidth={2}
              fill="none"
            />

            {/* Dots */}
            {points.map((pt, idx) => (
              <Circle
                key={`dot-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={brand.gold}
                stroke={brand.gold}
              />
            ))}
          </Svg>
        </View>
      )}
    </View>
  );
}
