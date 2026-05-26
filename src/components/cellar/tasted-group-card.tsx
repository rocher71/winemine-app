/**
 * TastedGroupCard — tasted 탭 2-col grid 카드.
 *
 * UX 결정: ux-decisions/cellar-tasted-tab.md Decision 1.
 * 기존 CellarCard 구조 재사용 — DrinkWindowBadge 자리를 ConsumptionBadge(병 아이콘 + "N회")로 교체.
 *
 * 구조:
 *   outer flex View → Pressable(opacity only) → inner visual View
 *   BottleZone: LinearGradient + WMBottle
 *   Meta:       TypeDot row + wine name + producer + ConsumptionBadge
 *
 * navigation: /cellar/${lwin}/history — 음용 기록 페이지 (Decision 2).
 */
import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Wine } from 'lucide-react-native';
import { WMBottle } from '@/components/shared/wm-bottle';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import {
  cellarCardBottleGradient,
  wineTypeDot,
  cellar,
  brand,
  type TypeCanonical,
} from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { TastedGroup } from '@/hooks/use-cellar';

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
  group: TastedGroup;
}

export function TastedGroupCard({ group }: Props) {
  const { t } = useTranslation();
  const { scheme, bg, border, text } = useThemeTokens();
  const wine = group.wine;
  if (!wine?.lwin || !wine?.display_name) return null;

  const typeCanon = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);
  const vintage = wine.vintage ?? parseLwinVintage(wine.lwin);

  const bottleZoneGradient = cellarCardBottleGradient(bottleColor, scheme);

  const openHistory = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/cellar/${encodeURIComponent(wine.lwin ?? '')}/history` as never);
  };

  const producerShort = wine.producer_name?.split(' ')[0] ?? null;
  const nameShort = (wine.name_ko ?? wine.display_name)?.split(' ')[0] ?? null;
  const dotColor = typeCanon ? wineTypeDot[typeCanon] : null;

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={openHistory}
        accessibilityRole="link"
        accessibilityLabel={`${wine.name_ko ?? wine.display_name} ${t('cellar.tasted.timesCount', { count: group.count })}`.trim()}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            overflow: 'hidden',
            borderRadius: 14,
            backgroundColor: bg.surface,
            borderWidth: 1,
            borderColor: border.default,
          }}
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

            {/* Vintage (Inter 10 text-secondary) */}
            {vintage ? (
              <Text
                allowFontScaling={false}
                className="font-inter text-text-secondary dark:text-text-secondary"
                style={{ fontSize: 10, lineHeight: 12.5 }}
              >
                {vintage}
              </Text>
            ) : null}

            {/* ConsumptionBadge — 병 아이콘 + "N회" (DrinkWindowBadge 자리) */}
            <View style={{ marginTop: 4 }}>
              <View
                accessibilityRole="text"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: cellar.tooYoungBg[scheme],
                  alignSelf: 'flex-start',
                }}
              >
                <Wine size={10} strokeWidth={2} color={brand.wineRed} />
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 10,
                    lineHeight: 12,
                    color: text.muted,
                  }}
                >
                  {t('cellar.tasted.timesCount', { count: group.count })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
