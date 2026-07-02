/**
 * WineFeedRow — 와인 피드 개별 카드 행.
 *
 * 사용처: WineFeed 리스트. 재사용 후보: 와인 검색 결과, 셀러 목록 등 와인 카드가 필요한 모든 곳.
 *
 * 레이아웃 (사양 home.md §3-8-PATCH):
 *   - Pressable (hit + opacity) > inner View flexDirection row alignItems stretch
 *   - [bottle col width 96] [meta col flex-1] [right col rating+price minWidth 76]
 *   - padding 16 / gap 16 / radius 14 / bg-surface / border-default
 *
 * §4-11 패턴: Pressable은 hit target + opacity만, 모든 layout/visual은 inner View (inline style).
 *
 * MockWine 타입은 이 파일에서만 사용. 실 데이터 연결 시 wine_metadata row 타입으로 교체.
 */
import { View, Text, Pressable } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, bottleColorDefault, typography, shadows, withAlpha, type TypeCanonical } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { WMBottle } from '@/components/shared/wm-bottle';
import { WMGlassRating } from '@/components/shared/wm-glass-rating';

export interface MockWine {
  id: string;
  lwin: string;
  name: string;
  producer: string;
  vintage: number;
  region: string;
  country: string;
  /** 실 wines_localized 카탈로그엔 없음 — 있을 때만 렌더 */
  grapes?: string;
  /** tasting_notes 집계 VIEW 부재(v0.1.0) — 있을 때만 rating 렌더 */
  score?: number;
  /** 가격 소스(use-wine-prices) per-wine 미연결 — 있을 때만 price 렌더 */
  priceKrw?: number;
  type: TypeCanonical;
}

export function formatKrwShort(krw: number, locale: string): string {
  if (locale === 'en') {
    if (krw >= 1_000_000) return `${(krw / 1_000_000).toFixed(1)}M`;
    if (krw >= 1_000) return `${Math.round(krw / 1000)}K`;
    return `${krw}`;
  }
  if (krw >= 10000) return `${Math.round(krw / 10000)}만`;
  return `${krw}`;
}

interface WineFeedRowProps {
  wine: MockWine;
}

export function WineFeedRow({ wine }: WineFeedRowProps) {
  const tokens = useThemeTokens();
  const bottleColor = bottleColorDefault[wine.type];
  const { t, i18n } = useTranslation();

  const hasScore = typeof wine.score === 'number';
  const hasPrice = typeof wine.priceKrw === 'number';
  const ratingMeta = hasScore && hasPrice
    ? (i18n.language === 'en'
        ? `, rated ${wine.score!.toFixed(1)} out of 5, price ₩${formatKrwShort(wine.priceKrw!, i18n.language)}`
        : ` 평점 ${wine.score!.toFixed(1)} 가격 ₩${formatKrwShort(wine.priceKrw!, i18n.language)}`)
    : hasScore
      ? (i18n.language === 'en' ? `, rated ${wine.score!.toFixed(1)} out of 5` : ` 평점 ${wine.score!.toFixed(1)}`)
      : '';
  const a11yLabel =
    i18n.language === 'en'
      ? `${wine.name}, ${wine.producer}, ${wine.vintage}${ratingMeta}`
      : `${wine.name} ${wine.producer} ${wine.vintage}${ratingMeta}`;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        router.push(`/wine/${wine.lwin}` as never);
      }}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel}
      accessibilityHint={t('home.wineFeed.openDetail')}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 16,
          padding: 18,
          borderRadius: 18,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: withAlpha(brand.gold, 0.24),
          ...shadows.homeCard,
        }}
      >
        <View style={{ width: 62, alignItems: 'center', justifyContent: 'center' }}>
          <WMBottle width={58} height={97} bottleColor={bottleColor} type={wine.type} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            style={{ fontSize: typography.homeWineName21.size, lineHeight: typography.homeWineName21.lineHeight, letterSpacing: typography.homeWineName21.letterSpacing, fontFamily: typography.homeWineName21.family, color: tokens.text.primary }}
            numberOfLines={2}
          >
            {wine.name}
          </Text>
          <Text
            style={{ fontSize: 14, lineHeight: 16.8, fontFamily: 'Freesentation_4Regular', color: tokens.text.secondary }}
            numberOfLines={1}
          >
            {wine.producer} · {wine.vintage}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} strokeWidth={1.75} color={tokens.text.muted} />
            <Text
              style={{ fontSize: 13, fontFamily: 'Freesentation_4Regular', color: tokens.text.muted }}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {wine.region}, {wine.country}
            </Text>
          </View>
          {wine.grapes ? (
            <Text
              style={{ fontSize: 11, marginTop: 1, opacity: 0.85, fontFamily: 'Freesentation_4Regular', color: tokens.text.muted }}
              numberOfLines={1}
            >
              {wine.grapes}
            </Text>
          ) : null}
        </View>
        {hasScore || hasPrice ? (
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'center',
              flexShrink: 0,
              minWidth: 76,
            }}
          >
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              {hasScore ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <WMGlassRating value={wine.score!} size={10} />
                  <Text style={{ color: brand.gold, fontSize: 12, fontFamily: 'Freesentation_4Regular' }}>
                    {wine.score!.toFixed(1)}
                  </Text>
                </View>
              ) : null}
              {hasPrice ? (
                <Text style={{ fontSize: 14, lineHeight: 16.8, fontFamily: 'Freesentation_4Regular', color: tokens.text.primary }}>
                  ₩{formatKrwShort(wine.priceKrw!, i18n.language)}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
