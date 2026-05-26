import React from 'react';
import Svg, { Rect, Path, Text as SvgText } from 'react-native-svg';

// SVG raw hex — KTL bottle color group (§9 P0 knowledgeBottle)
const BOTTLE_CAP   = '#160809';
const BOTTLE_LABEL = '#f3e6c6';
const LABEL_TEXT   = '#3d1a26';

interface BottleMiniProps {
  color?: string;   // winery.accent — bottle body fill
  vintage?: string; // optional year on label
  width?: number;
  height?: number;
}

export function BottleMini({
  color = '#8B1A2A',
  vintage,
  width = 26,
  height = 78,
}: BottleMiniProps) {
  // Scale factor from viewBox 28×80
  const scaleX = width / 28;
  const scaleY = height / 80;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 28 80"
    >
      {/* Bottle body */}
      <Path
        d="M10 8 Q10 6 14 4 Q18 6 18 8 L19 16 Q22 20 22 40 L22 74 Q22 79 14 79 Q6 79 6 74 L6 40 Q6 20 9 16 Z"
        fill={color}
      />
      {/* Cap */}
      <Rect x="10" y="0" width="8" height="9" rx="0.6" fill={BOTTLE_CAP} />
      {/* Label */}
      <Rect x="6.5" y="40" width="15" height="22" rx="0.6" fill={BOTTLE_LABEL} />
      {vintage && (
        <SvgText
          x="14"
          y="55"
          textAnchor="middle"
          fontFamily="PlayfairDisplay_700Bold"
          fontSize={6.5}
          fontWeight="700"
          fill={LABEL_TEXT}
        >
          {vintage}
        </SvgText>
      )}
    </Svg>
  );
}
