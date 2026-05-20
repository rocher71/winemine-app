/**
 * WMBottle — react-native-svg port of keyscreen wm-bottle.
 *
 * 사용처:
 *   - home RecentNotesStrip: 26×86 (라벨 텍스트 없음)
 *   - home WineFeedRow:      40×130 (라벨 텍스트 없음)
 *   - wine-detail WineHero:  88×290 (라벨 텍스트 producer/label/vintage 포함 — wine-detail 사양 §3-3)
 *
 * 텍스트는 SvgText로 라벨 영역 안에 직접 렌더 (RN <Text> in SVG는 react-native-svg 지원).
 */
import Svg, { Path, Rect, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { brand, bottleColorDefault, type TypeCanonical } from '@/lib/design-tokens';

interface WMBottleProps {
  width: number;
  height: number;
  bottleColor?: string | null;
  type?: TypeCanonical | null;
  /** label 영역에 표시할 producer (첫 단어) — wine-detail hero에서만 사용 */
  producer?: string | null;
  /** label 영역에 표시할 wine name (첫 단어) — wine-detail hero에서만 사용 */
  label?: string | null;
  /** label 영역에 표시할 vintage — wine-detail hero에서만 사용 */
  vintage?: number | string | null;
}

export function WMBottle({
  width,
  height,
  bottleColor,
  type,
  producer,
  label,
  vintage,
}: WMBottleProps) {
  // bottle color resolution: explicit color > type default > red default
  const fill =
    bottleColor ??
    (type ? bottleColorDefault[type] : null) ??
    bottleColorDefault.red;

  // viewBox 40 × 130 (키스크린 wm-bottle 기본 비율 유지)
  const VB_W = 40;
  const VB_H = 130;
  const hashChar = String.fromCharCode(35);
  const gradientId = `bottle-grad-${fill.split(hashChar).join('')}`;
  const highlightId = `bottle-hl-${fill.split(hashChar).join('')}`;

  // 텍스트는 hero 사이즈(>= 80) 이상에서만 표시. 비율(viewBox 좌표)로 적용.
  const showText = width >= 60 && (producer || label || vintage);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={fill} stopOpacity={1} />
          <Stop offset="0.5" stopColor={fill} stopOpacity={1} />
          <Stop offset="1" stopColor={brand.black} stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient id={highlightId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={brand.white} stopOpacity={0.18} />
          <Stop offset="0.5" stopColor={brand.white} stopOpacity={0} />
          <Stop offset="1" stopColor={brand.white} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* neck */}
      <Rect x={17} y={4} width={6} height={26} fill={`url(#${gradientId})`} />
      {/* shoulder + body */}
      <Path
        d="M14 30 Q14 36 11 42 L11 120 Q11 126 16 126 L24 126 Q29 126 29 120 L29 42 Q26 36 26 30 Z"
        fill={`url(#${gradientId})`}
      />
      {/* foil cap */}
      <Rect x={16} y={2} width={8} height={6} fill={brand.textInk} opacity={0.85} />
      {/* highlight */}
      <Path
        d="M14 30 Q14 36 11 42 L11 120 Q11 126 16 126 L20 126 L20 42 Q17 36 17 30 Z"
        fill={`url(#${highlightId})`}
      />
      {/* label */}
      <Rect
        x={12}
        y={70}
        width={16}
        height={36}
        fill={brand.cream}
        opacity={0.92}
        rx={1}
      />

      {showText ? (
        <>
          {producer ? (
            <SvgText
              x={20}
              y={80}
              fontSize={3.5}
              fontWeight="600"
              fill={brand.textInk}
              textAnchor="middle"
            >
              {String(producer).slice(0, 10)}
            </SvgText>
          ) : null}
          {label ? (
            <SvgText
              x={20}
              y={88}
              fontSize={3.2}
              fill={brand.textInk}
              textAnchor="middle"
            >
              {String(label).slice(0, 12)}
            </SvgText>
          ) : null}
          {vintage ? (
            <SvgText
              x={20}
              y={100}
              fontSize={4}
              fontWeight="700"
              fill={brand.textInk}
              textAnchor="middle"
            >
              {String(vintage)}
            </SvgText>
          ) : null}
        </>
      ) : null}
    </Svg>
  );
}
