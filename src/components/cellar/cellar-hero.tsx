/**
 * CellarHero — Section 1: 240px Hero frame + WineLabelArt placeholder + 텍스트 메타.
 *
 * 사양: design-spec cellar-detail.md §2 line 64~83, §3-2.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 71~128 verbatim.
 *
 * 구조:
 *   outer View (px-4 pb-2)
 *     HeroFrame (height 240, radius 18, LinearGradient 160deg bottle_color→#1a0a1e 70%)
 *       └── WineLabelArt centered (100×150)
 *     h1 wine name (Playfair 24 cream, mt 12 mb 4)
 *     ProducerLine "{producer} · {vintage}" (Inter 13 secondary)
 *     RegionLine "{region} · {country}" (Inter 12 muted, mt 2)
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { cellarDetailHeroGradient } from '@/lib/design-tokens';
import { WineLabelArt } from '@/components/cellar/wine-label-art';

interface Props {
  wineName: string;
  displayName: string;
  bottleColor: string;
  producerName?: string | null;
  vintage?: number | null;
  region?: string | null;
  country?: string | null;
}

export function CellarHero({
  wineName,
  displayName,
  bottleColor,
  producerName,
  vintage,
  region,
  country,
}: Props) {
  const { border } = useThemeTokens();
  const heroGrad = cellarDetailHeroGradient(bottleColor);

  // ProducerLine: producer + vintage 단일 줄. 둘 다 없으면 행 생략.
  let producerLine = '';
  if (producerName && vintage != null) {
    producerLine = `${producerName} · ${vintage}`;
  } else if (producerName) {
    producerLine = producerName;
  } else if (vintage != null) {
    producerLine = String(vintage);
  }

  // RegionLine: region + country 단일 줄. 둘 다 없으면 행 생략.
  const regionParts = [region, country].filter((v): v is string => !!v && v.length > 0);
  const regionLine = regionParts.length > 0 ? regionParts.join(' · ') : null;

  return (
    <View className="px-4 pb-2">
      <LinearGradient
        colors={heroGrad.colors as unknown as readonly [string, string]}
        locations={heroGrad.locations as unknown as readonly [number, number]}
        start={heroGrad.start}
        end={heroGrad.end}
        style={{
          height: 240,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: border.default,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <WineLabelArt bottleColor={bottleColor} displayName={displayName} />
      </LinearGradient>

      <Text
        accessibilityRole="header"
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 24, lineHeight: 28.8, letterSpacing: -0.24, marginTop: 12, marginBottom: 4 }}
        numberOfLines={2}
      >
        {wineName}
      </Text>

      {producerLine ? (
        <Text
          className="font-inter text-text-secondary dark:text-text-secondary"
          style={{ fontSize: 13, lineHeight: 15.6 }}
          numberOfLines={1}
        >
          {producerLine}
        </Text>
      ) : null}

      {regionLine ? (
        <Text
          className="font-inter text-text-muted dark:text-text-muted"
          style={{ fontSize: 12, lineHeight: 14.4, marginTop: 2 }}
          numberOfLines={1}
        >
          {regionLine}
        </Text>
      ) : null}
    </View>
  );
}
