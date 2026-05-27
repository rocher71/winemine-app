import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Line, Rect } from 'react-native-svg';
import { Text as SvgText } from 'react-native-svg';
import { light } from '@/lib/design-tokens';

interface RegionFlagProps {
  accent: string;   // region.accent — e.g. '#8B1A2A'
  code: string;     // 3-letter ISO code displayed italic
  height?: number;
}

export function RegionFlag({ accent, code, height = 78 }: RegionFlagProps) {
  const displayCode = code.slice(0, 3).toUpperCase();

  return (
    <View
      style={{
        width: '100%',
        height,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: light.border.default,
        position: 'relative',
      }}
    >
      {/* Color gradient */}
      <LinearGradient
        colors={[accent, `${accent}aa`, `${accent}55`]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.15, y: 0.15 }}
        end={{ x: 0.85, y: 0.85 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* 45-deg stripe pattern via SVG — deviation D4 */}
      <Svg
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        width="100%"
        height={height}
      >
        <Defs>
          <Pattern id="stripe" x="0" y="0" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Line x1="0" y1="0" x2="0" y2="13" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height={height} fill="url(#stripe)" />
      </Svg>

      {/* Italic code text bottom-right */}
      <View
        style={{
          position: 'absolute',
          right: 10,
          bottom: 8,
        }}
      >
        <Svg width={50} height={30}>
          <SvgText
            x="50"
            y="22"
            textAnchor="end"
            fontFamily="PlayfairDisplay_400Regular"
            fontSize={22}
            fontStyle="italic"
            fill="rgba(255,250,240,0.85)"
            letterSpacing={0.88}
          >
            {displayCode}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}
