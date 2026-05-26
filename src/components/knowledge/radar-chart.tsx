import React from 'react';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { useColorScheme } from 'nativewind';

import { brand, dark } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import type { RadarAxisData } from '@/lib/mock/knowledge';

interface Props {
  axes: RadarAxisData[];
  size?: number;
}

const N = 5;

function polarToXY(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function axisAngle(i: number): number {
  // Start at top (12 o'clock = -π/2), go clockwise
  return -Math.PI / 2 + (2 * Math.PI * i) / N;
}

function pointsString(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

function ringPoints(cx: number, cy: number, r: number): { x: number; y: number }[] {
  return Array.from({ length: N }, (_, i) => polarToXY(cx, cy, r, axisAngle(i)));
}

function dataPoints(
  cx: number,
  cy: number,
  rMax: number,
  values: number[],
): { x: number; y: number }[] {
  return values.map((v, i) => polarToXY(cx, cy, (v / 5) * rMax, axisAngle(i)));
}

// Text-anchor helper for 5 axes starting at top
function textAnchor(i: number): 'middle' | 'start' | 'end' {
  if (i === 0) return 'middle';
  const angle = axisAngle(i);
  const cos = Math.cos(angle);
  if (cos > 0.2) return 'start';
  if (cos < -0.2) return 'end';
  return 'middle';
}

export function RadarChart({ axes, size = 220 }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const locale = currentLocale();

  const cx = size / 2;
  const cy = size / 2 + 8;
  const rMax = 72;
  const labelPush = rMax + 16;

  const borderSoft = isDark ? '#38243A' : '#E0D2BC';
  const wineColor = brand.wineRed;
  const goldColor = '#B89438';
  const textColor = isDark ? dark.text.primary : '#3B2314';

  const aValues = axes.map((a) => a.aVal);
  const bValues = axes.map((a) => a.bVal);

  return (
    <Svg width={size} height={size}>
      {/* Concentric rings (5 pentagon rings) */}
      {[1, 2, 3, 4, 5].map((step) => {
        const r = (rMax * step) / 5;
        const pts = ringPoints(cx, cy, r);
        return (
          <Polygon
            key={step}
            points={pointsString(pts)}
            fill="none"
            stroke={borderSoft}
            strokeWidth={step === 5 ? 1 : 0.5}
          />
        );
      })}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const vertex = polarToXY(cx, cy, rMax, axisAngle(i));
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={vertex.x}
            y2={vertex.y}
            stroke={borderSoft}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon A (2019 — wineRed) */}
      <Polygon
        points={pointsString(dataPoints(cx, cy, rMax, aValues))}
        fill={`${wineColor}2E`}
        stroke={wineColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Data polygon B (2020 — gold) */}
      <Polygon
        points={pointsString(dataPoints(cx, cy, rMax, bValues))}
        fill={`${goldColor}38`}
        stroke={goldColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Axis labels */}
      {axes.map((axis, i) => {
        const angle = axisAngle(i);
        const lx = cx + labelPush * Math.cos(angle);
        const ly = cy + labelPush * Math.sin(angle);
        const anchor = textAnchor(i);
        const label = locale === 'ko' ? axis.label.ko : axis.label.en;
        return (
          <SvgText
            key={i}
            x={lx}
            y={ly + 4}
            textAnchor={anchor}
            fontFamily="Freesentation_6SemiBold"
            fontSize={10}
            fill={textColor}
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}
