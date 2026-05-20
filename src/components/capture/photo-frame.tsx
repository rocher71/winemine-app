/**
 * PhotoFrame — recognized stage 와인 라벨 사진 frame.
 *
 * design-spec capture.md §3-5 PhotoFrame + FallbackLabel (SVG).
 * width 90 / height 130 / radius 8 / overflow hidden / border 1px border-default.
 * background = LinearGradient 180deg (bottleColor → capture.bottlePhotoEnd[scheme]).
 * photoLoadFailed=false → <Image uri=photo_url onError → setPhotoLoadFailed(true) />
 * photoLoadFailed=true  → FallbackLabel SVG (라벨 stroke gold 0.5, label fill cream, text-ink texts).
 */
import { View, Image, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import {
  brand,
  captureBottlePhotoGradient,
  light,
  dark,
  withAlpha,
} from '@/lib/design-tokens';

interface PhotoFrameProps {
  bottleColor: string;
  photoUrl: string | null;
  photoLoadFailed: boolean;
  onLoadError: () => void;
  producerName?: string | null;
  wineName?: string | null;
  vintage?: number | null;
}

export function PhotoFrame({
  bottleColor,
  photoUrl,
  photoLoadFailed,
  onLoadError,
  producerName,
  wineName,
  vintage,
}: PhotoFrameProps) {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const gradient = captureBottlePhotoGradient(bottleColor, isLight ? 'light' : 'dark');
  const borderColor = isLight ? light.border.default : dark.border.default;

  return (
    <View
      style={{
        width: 90,
        height: 130,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor,
        position: 'relative',
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
        start={gradient.start}
        end={gradient.end}
        style={StyleSheet.absoluteFill}
      />
      {!photoLoadFailed && photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={onLoadError}
        />
      ) : (
        <FallbackLabel
          producerName={producerName ?? null}
          wineName={wineName ?? null}
          vintage={vintage ?? null}
        />
      )}
    </View>
  );
}

interface FallbackLabelProps {
  producerName: string | null;
  wineName: string | null;
  vintage: number | null;
}

// 라벨 stroke gold opacity 0.5 / label fill cream / texts brand.textInk.
// viewBox 90×130 verbatim — 라벨 영역은 (10, 30, 70, 70) (margin 10 좌우, 30 top).
function FallbackLabel({ producerName, wineName, vintage }: FallbackLabelProps) {
  const labelStroke = withAlpha(brand.gold, 0.5);
  const labelFill = brand.cream;
  const textColor = brand.textInk;
  const lineGap = 14;

  // wineName 2-line split
  const name = wineName ?? '';
  const halfIdx = Math.ceil(name.length / 2);
  const line1 = name.slice(0, halfIdx);
  const line2 = name.slice(halfIdx);

  return (
    <Svg width="100%" height="100%" viewBox="0 0 90 130">
      <Rect
        x={10}
        y={30}
        width={70}
        height={70}
        rx={4}
        ry={4}
        fill={labelFill}
        stroke={labelStroke}
        strokeWidth={1}
      />
      {producerName ? (
        <SvgText
          x={45}
          y={48}
          fontSize="6"
          fontFamily="Inter_500Medium"
          fill={textColor}
          textAnchor="middle"
        >
          {producerName}
        </SvgText>
      ) : null}
      {line1 ? (
        <SvgText
          x={45}
          y={48 + lineGap}
          fontSize="7"
          fontFamily="PlayfairDisplay_400Regular"
          fill={textColor}
          textAnchor="middle"
        >
          {line1}
        </SvgText>
      ) : null}
      {line2 ? (
        <SvgText
          x={45}
          y={48 + lineGap * 2}
          fontSize="7"
          fontFamily="PlayfairDisplay_400Regular"
          fill={textColor}
          textAnchor="middle"
        >
          {line2}
        </SvgText>
      ) : null}
      {vintage ? (
        <SvgText
          x={45}
          y={48 + lineGap * 3}
          fontSize="6"
          fontFamily="Inter_400Regular"
          fill={textColor}
          textAnchor="middle"
        >
          {String(vintage)}
        </SvgText>
      ) : null}
    </Svg>
  );
}
