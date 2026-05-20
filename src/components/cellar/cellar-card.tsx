/**
 * CellarCard — 2-col grid 카드.
 *
 * 사양: design-spec cellar-list.md §3-8.
 * 키스크린 원본: src/components/cellar/cellar-card.tsx (115 LOC).
 *
 * 구조:
 *   outer Pressable: bg-surface border-default radius 14 overflow-hidden column
 *   BottleZone:      LinearGradient (160deg, bottleColor/0.157 → bottleShelf 80%) padding 14_0_8
 *                    WMBottle 40×130
 *   Meta:            padding 10_12_12 gap 4 minWidth 0
 *                    TypeDot row + wine name + producer + vintage + DrinkWindowBadge
 *
 * - swipe action 제거 (사양 §5, §12-3 — 2-col grid에 부자연)
 * - navigation: /(tabs)/cellar/${lwin}?id=${item.id} (현재 RN 표준 유지, 사양 §12-6)
 */
import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { WMBottle } from '@/components/shared/wm-bottle';
import { DrinkWindowBadge } from '@/components/cellar/drink-window-badge';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import { getDrinkWindow, getDrinkWindowStatus } from '@/lib/drink-window';
import { cellarCardBottleGradient, wineTypeDot, type TypeCanonical } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { CellarItemWithWine } from '@/hooks/use-cellar';

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

interface Props {
  item: CellarItemWithWine;
}

export function CellarCard({ item }: Props) {
  const { scheme } = useThemeTokens();
  const wine = item.wine;
  if (!wine?.lwin || !wine?.display_name) return null;

  const typeCanon = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);
  const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);

  // drink window (vintage 없으면 status null — Badge 미렌더)
  const dw = getDrinkWindow({
    vintage,
    type_canonical: wine.type_canonical ?? null,
  });
  const status = getDrinkWindowStatus({
    vintage,
    type_canonical: wine.type_canonical ?? null,
  });

  const bottleZoneGradient = cellarCardBottleGradient(bottleColor, scheme);

  const openDetail = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(
      `/(tabs)/cellar/${encodeURIComponent(wine.lwin ?? '')}?id=${encodeURIComponent(item.id)}`,
    );
  };

  // WMBottle SVG의 라벨에 노출할 producer/label (첫 단어만)
  const producerShort = wine.producer_name?.split(' ')[0] ?? null;
  const nameShort = (wine.name_ko ?? wine.display_name)?.split(' ')[0] ?? null;

  // type dot color (6×6 inline) — wineTypeDot 재사용
  const dotColor = typeCanon ? wineTypeDot[typeCanon] : null;

  return (
    <Pressable
      onPress={openDetail}
      accessibilityRole="link"
      accessibilityLabel={`${wine.name_ko ?? wine.display_name} ${wine.producer_name ?? ''} ${vintage ?? ''}`.trim()}
      className="overflow-hidden rounded-[14px] bg-surface dark:bg-surface border border-border-default"
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* BottleZone */}
      <LinearGradient
        colors={bottleZoneGradient.colors as unknown as readonly [string, string]}
        locations={bottleZoneGradient.locations as unknown as readonly [number, number]}
        start={bottleZoneGradient.start}
        end={bottleZoneGradient.end}
        style={{
          paddingTop: 14,
          paddingBottom: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WMBottle
          width={40}
          height={130}
          bottleColor={bottleColor}
          producer={producerShort}
          label={nameShort}
          vintage={vintage ?? undefined}
        />
      </LinearGradient>

      {/* Meta */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 4 }}>
        {/* TypeDot row */}
        {dotColor ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: dotColor }}
            />
          </View>
        ) : null}

        {/* Wine name (Playfair 12 lh 15, 2-line clamp, minHeight 30) */}
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          numberOfLines={2}
          style={{ fontSize: 12, lineHeight: 15, minHeight: 30 }}
        >
          {wine.name_ko ?? wine.display_name}
        </Text>

        {/* Producer (Inter 10 text-muted) */}
        {wine.producer_name ? (
          <Text
            allowFontScaling={false}
            className="font-inter text-text-muted dark:text-text-muted"
            numberOfLines={1}
            style={{ fontSize: 10, lineHeight: 12.5 }}
          >
            {wine.producer_name}
          </Text>
        ) : null}

        {/* Vintage (Inter 10 text-secondary) — producer와 다른 색 */}
        {vintage ? (
          <Text
            allowFontScaling={false}
            className="font-inter text-text-secondary dark:text-text-secondary"
            style={{ fontSize: 10, lineHeight: 12.5 }}
          >
            {vintage}
          </Text>
        ) : null}

        {/* DrinkWindowBadge — status 추정 가능할 때만 */}
        {status ? (
          <View style={{ marginTop: 4 }}>
            <DrinkWindowBadge status={status} dw={dw} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
