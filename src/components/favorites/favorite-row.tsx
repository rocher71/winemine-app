/**
 * FavoriteRow — favorites 리스트 각 행.
 *
 * 사양: _workspace/design-specs/favorites.md §1 / §3-3 / §3-4 / §3-5.
 *
 * 구조:
 *   row outer View (marginVertical 8, marginHorizontal 16, bg surface, border default, radius 14, padding 12)
 *   ├── Left tap area (3.5-layer §4-11): outer flex-wrapper View + Pressable opacity-only + inner visual View
 *   │     ├── Bottle mini (LinearGradient 44×60 — §6-2 CSS linear-gradient(160deg) verbatim)
 *   │     └── Text col: name (Playfair 14) + vintage·region (Inter 11 muted) + price (Inter 12 secondary)
 *   └── Right notify column (NotifySwitch + label "알림" Inter 10 muted)
 *
 * §0-2 light-only — dark className/useColorScheme 0.
 * §4-11 — Pressable className 0, layout/visual은 inner View, flex 분포는 outer View.
 * §6 deviations: #1 (3.5-layer), #2 (LinearGradient), #3 (EN fallback chip), #4 (inline Text not WineNameDisplay), #5 (region 직접 Text), #6 (price null safe), #7 (gold→border.active), #8 (translateX).
 */
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { bottleGradientEnd, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { getLocalizedWineName } from '@/lib/lwin';
import type { FavoriteRow as FavoriteRowData } from '@/hooks/use-favorites';
import { NotifySwitch } from './notify-switch';

interface FavoriteRowProps {
  favorite: FavoriteRowData;
  onPress: () => void;
  onToggleNotify: (next: boolean) => void;
}

export function FavoriteRow({
  favorite,
  onPress,
  onToggleNotify,
}: FavoriteRowProps) {
  const { t } = useTranslation();
  const locale = currentLocale();

  const { primary: nameText, needsEnFallbackChip } = getLocalizedWineName(
    locale,
    { display_name: favorite.displayName, name_ko: favorite.nameKo },
  );
  const regionText = favorite.region[locale] ?? favorite.region.en;
  const priceText =
    favorite.averagePriceKrw !== null
      ? `₩${favorite.averagePriceKrw.toLocaleString('en-US')}`
      : '—'; // em dash

  const a11yName =
    locale === 'ko' && favorite.nameKo ? favorite.nameKo : favorite.displayName;

  const notifyA11y = favorite.notifyOnPurchase
    ? t('favorites.notifyOnA11y')
    : t('favorites.notifyOffA11y');

  return (
    <View
      style={{
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        borderRadius: 14,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Left tap area — 3.5-layer (§6-1 / CLAUDE.md §4-11 3.5) */}
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={t('favorites.row.openA11y', { name: a11yName })}
          accessibilityHint={t('favorites.row.openHint')}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Bottle mini 44×60 — §6-2 CSS linear-gradient(160deg, bottleColor 0%, bottleGradientEnd 70%) */}
            <LinearGradient
              colors={[favorite.bottleColor, bottleGradientEnd]}
              locations={[0, 0.7]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.342, y: 0.94 }}
              style={{
                width: 44,
                height: 60,
                borderRadius: 6,
                borderWidth: 1,
                // keyscreen verbatim — gold 18% alpha border (사양 §1 line 117)
                borderColor: 'rgba(201, 168, 76, 0.18)',
                flexShrink: 0,
              }}
            />

            {/* Right text col */}
            <View style={{ flex: 1 }}>
              {/* 와인명 — Playfair 14 + EN fallback chip (§6-3, #4) */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    flexShrink: 1,
                    fontFamily: 'PlayfairDisplay_400Regular',
                    fontSize: 14,
                    lineHeight: 18,
                    color: light.text.primary,
                  }}
                >
                  {nameText}
                </Text>
                {needsEnFallbackChip ? (
                  <View
                    style={{
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderWidth: 1,
                      borderColor: light.text.muted,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 9,
                        lineHeight: 11,
                        color: light.text.muted,
                      }}
                    >
                      {t('wine.enFallbackChip')}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* vintage · region — Inter 11 muted (§6-5) */}
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 2,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  lineHeight: 14,
                  color: light.text.muted,
                }}
              >
                {favorite.vintage} · {regionText}
              </Text>

              {/* 평균가 — Inter 12 secondary (§6-6 null safe) */}
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  lineHeight: 16,
                  color: light.text.secondary,
                }}
              >
                {priceText}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Right notify column */}
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 10,
            lineHeight: 12,
            color: light.text.muted,
          }}
        >
          {t('favorites.notifyLabel')}
        </Text>
        <NotifySwitch
          value={favorite.notifyOnPurchase}
          onToggle={onToggleNotify}
          accessibilityLabel={notifyA11y}
        />
      </View>
    </View>
  );
}
