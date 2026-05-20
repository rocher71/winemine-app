/**
 * WineHero — wine-detail 사양 §3-3 verbatim 재작성.
 *
 * 구조 (keyscreen wine-header.tsx verbatim, 사양 §2):
 *   - 외부 section: px-4 pb-5 + radius 18 + border + LinearGradient
 *     - Hero gradient outer (radius 18, padding 32_0_24)
 *       - WMBottle 88×290 (centered) — producer/label/vintage 텍스트 포함
 *       - ServingTempPill (abs right:12 bottom:12)
 *   - 텍스트 메타 블록 (mt-4, padding 0_16)
 *     - type dot 8×8 + type text (Inter 11 text-secondary capitalize)
 *     - h1 wine name (Playfair 24 — WineNameDisplay size=title)
 *     - producer (Inter 13 text-secondary)
 *     - "region · country" + "vintage · grapes" lines (Inter 11 text-muted lh 1.5)
 *
 * RN deviation (사양 §8):
 *   - radial gradient → LinearGradient 수직 fade (start={0.5,0} end={0.5,1} locations=[0,0.7])
 *   - bottleColor alpha 21% (0x35) verbatim
 *   - light 모드 분기 (gradient end = bg.bottleShelf — dark=#1a0a1e, light=#FFFFFF) — §4-9
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WMBottle } from '@/components/shared/wm-bottle';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { ServingTempPill } from '@/components/wine/serving-temp-pill';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import {
  dark,
  light,
  withAlpha,
  wineTypeDot,
  type TypeCanonical,
} from '@/lib/design-tokens';
import { useColorScheme } from 'react-native';

interface Props {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
  producer_name: string | null;
  region: string | null;
  country: string | null;
}

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(value: string | null | undefined): TypeCanonical | null {
  if (value && TYPE_CANONICAL.has(value as TypeCanonical)) return value as TypeCanonical;
  return null;
}

export function WineHero({
  lwin,
  display_name,
  name_ko,
  bottle_color,
  type_canonical,
  vintage,
  producer_name,
  region,
  country,
}: Props) {
  const scheme = useColorScheme();
  const type = asTypeCanonical(type_canonical);
  const startColor = bottle_color ?? getDefaultBottleColor(type);
  const resolvedVintage = vintage ?? parseLwinVintage(lwin);

  // gradient end는 테마 분기 (사양 §6 — light 모드에서 cream 배경에 부조화 회피)
  const gradientEnd =
    scheme === 'light' ? light.bg.bottleShelf : dark.bg.bottleShelf;

  // bottleColor alpha 21% (keyscreen `${bottleColor}35` verbatim)
  const startWithAlpha = withAlpha(startColor, 0.21);

  // WMBottle용 단어 (producer 첫 단어, display_name 첫 단어)
  const producerFirstWord = producer_name?.split(/\s+/)[0] ?? null;
  const labelFirstWord = display_name.split(/\s+/)[0];

  // type dot 색
  const dotColor = type ? wineTypeDot[type] : wineTypeDot.red;

  return (
    <View className="px-4 pb-5">
      {/* Hero gradient outer — radius 18 + border + padding 32_0_24 */}
      <LinearGradient
        colors={[startWithAlpha, gradientEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.7]}
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor:
            scheme === 'light' ? light.border.default : dark.border.default,
          paddingTop: 32,
          paddingBottom: 24,
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <WMBottle
          width={88}
          height={290}
          bottleColor={startColor}
          type={type}
          producer={producerFirstWord}
          label={labelFirstWord}
          vintage={resolvedVintage}
        />
        {/* ServingTempPill abs right:12 bottom:12 */}
        <View style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 5 }}>
          <ServingTempPill type={type} />
        </View>
      </LinearGradient>

      {/* 텍스트 메타 블록 — mt-4 (16px) */}
      <View className="mt-4">
        {/* type dot + type text */}
        <View
          className="flex-row items-center mb-1.5"
          style={{ gap: 6 }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              backgroundColor: dotColor,
            }}
          />
          {type ? (
            <Text className="font-inter text-[11px] text-text-secondary dark:text-text-secondary capitalize">
              {type}
            </Text>
          ) : null}
        </View>

        {/* h1 wine name (Playfair 24 — WineNameDisplay size=title) */}
        <WineNameDisplay
          lwin={lwin}
          name_ko={name_ko}
          display_name={display_name}
          size="title"
        />

        {/* producer */}
        {producer_name ? (
          <Text
            className="font-inter text-[13px] text-text-secondary dark:text-text-secondary mt-1"
            numberOfLines={1}
          >
            {producer_name}
          </Text>
        ) : null}

        {/* region · country / vintage line */}
        {(region || country || resolvedVintage) ? (
          <Text
            className="font-inter text-[11px] text-text-muted dark:text-text-muted mt-1.5"
            style={{ lineHeight: 16.5 }}
          >
            {region && country
              ? `${region} · ${country}`
              : region || country || ''}
            {resolvedVintage && (region || country) ? '\n' : ''}
            {resolvedVintage ? String(resolvedVintage) : ''}
          </Text>
        ) : null}
      </View>

    </View>
  );
}
