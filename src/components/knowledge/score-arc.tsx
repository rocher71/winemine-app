import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useColorScheme } from 'nativewind';
import { light, dark, brand } from '@/lib/design-tokens';

interface ScoreArcProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreArc({ value, size = 52, strokeWidth = 2.5 }: ScoreArcProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? dark : light;
  const goldColor = isDark ? brand.gold : light.border.active;

  const r = size / 2 - strokeWidth - 1;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={tokens.border.default}
          strokeWidth={strokeWidth}
        />
        {/* Value arc — rotated -90 deg around center */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={goldColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
        {/* Center score text */}
        <SvgText
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="PlayfairDisplay_700Bold"
          fontSize={size < 60 ? 14 : 18}
          fontWeight="700"
          fill={tokens.text.primary}
        >
          {value}
        </SvgText>
      </Svg>
    </View>
  );
}
