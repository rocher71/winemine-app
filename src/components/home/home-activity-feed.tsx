/**
 * HomeActivityFeed — 셀러 새 소식 카드 (신규, 사양 home.md §3-4).
 *
 * Card(bg-surface, border-gold, radius 18, shadows.homeCard) → ActivityRow × N.
 * Row: padding 15/16, gap 13, borderBottom line-soft(마지막 제외), chevron 우측.
 *  - icon chip 38 circle: peak/badge=gold-tint, price=wine-tint.
 *  - body: title 14/500 (wine name = 700) + subtitle 11.5 muted.
 *
 * 데이터: useHomeActivity (실 cellar drink-window 파생). 0건 → EmptyState row.
 * §4-11: ActivityRow Pressable hit+opacity만, layout/visual inner View inline style.
 */
import { View, Text, Pressable } from 'react-native';
import { Flame, TrendingUp, Award, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, typography, shadows, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { HomeActivityRow } from '@/hooks/use-home-activity';

const KIND_ICON = {
  peak: Flame,
  price: TrendingUp,
  badge: Award,
} as const;

function ActivityRow({ row, isLast }: { row: HomeActivityRow; isLast: boolean }) {
  const tokens = useThemeTokens();
  const Icon = KIND_ICON[row.kind];
  const isWine = row.kind === 'price'; // 가격 변동 행만 wine-tint chip (핸드오프 §Activity feed)
  const chipBg = isWine ? withAlpha(brand.wineRed, 0.08) : withAlpha(brand.gold, 0.12);
  const chipBorder = isWine ? withAlpha(brand.wineRed, 0.18) : withAlpha(brand.gold, 0.24);
  const iconColor = isWine ? brand.wineRed : tokens.scheme === 'light' ? brand.goldDeep : brand.gold;
  const lineSoft = withAlpha(brand.textInk, 0.06);

  const onPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    if (row.route) router.push(row.route as never);
  };

  const a11yLabel = `${row.titleLead}${row.emphasis}${row.titleTail}`.trim();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 13,
          paddingVertical: 15,
          paddingHorizontal: 16,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: lineSoft,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chipBg,
            borderWidth: 1,
            borderColor: chipBorder,
          }}
        >
          <Icon size={18} strokeWidth={1.9} color={iconColor} />
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            style={{
              fontFamily: typography.homeActivityTitle.family,
              fontSize: typography.homeActivityTitle.size,
              lineHeight: typography.homeActivityTitle.lineHeight,
              color: tokens.text.primary,
            }}
            numberOfLines={2}
          >
            {row.titleLead}
            {row.emphasis ? (
              <Text style={{ fontFamily: 'Freesentation_7Bold', color: brand.wineRed }}>
                {row.emphasis}
              </Text>
            ) : null}
            {row.titleTail}
          </Text>
          <Text
            style={{ fontFamily: typography.cardMeta.family, fontSize: 11.5, color: tokens.text.muted }}
            numberOfLines={1}
          >
            {row.meta}
          </Text>
        </View>

        <ChevronRight size={17} strokeWidth={1.75} color={tokens.text.muted} />
      </View>
    </Pressable>
  );
}

// 소식이 3개 미만일 때 카드 최하단에 노출되는 "셀러 둘러보기" CTA (사용자 요청 2026-06).
// §4-11: Pressable hit+opacity만, layout/visual inner View inline style.
function CellarBrowseRow({ hasTopBorder }: { hasTopBorder: boolean }) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const goldAccent = tokens.scheme === 'light' ? brand.goldDeep : brand.gold;

  const onPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push('/(tabs)/cellar');
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('home.cellarBrowse')}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderTopWidth: hasTopBorder ? 1 : 0,
          borderTopColor: withAlpha(brand.textInk, 0.06),
        }}
      >
        <Text
          style={{ fontFamily: 'Freesentation_6SemiBold', fontSize: 13.5, color: goldAccent }}
        >
          {t('home.cellarBrowse')}
        </Text>
        <ChevronRight size={16} strokeWidth={1.9} color={goldAccent} />
      </View>
    </Pressable>
  );
}

interface HomeActivityFeedProps {
  rows: HomeActivityRow[];
  loading?: boolean;
  /** 0건 시 빈 상태 문구. 셀러 보유 여부에 따라 home-feed에서 결정·로테이션 (없으면 기본 fallback) */
  emptyText?: string;
}

export function HomeActivityFeed({ rows, loading, emptyText }: HomeActivityFeedProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const borderGold = withAlpha(brand.gold, 0.24);

  return (
    <View style={{ paddingHorizontal: 22 }}>
      <View
        style={{
          borderRadius: 18,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: borderGold,
          overflow: 'hidden',
          ...shadows.homeCard,
        }}
      >
        {loading ? (
          [0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                paddingVertical: 15,
                paddingHorizontal: 16,
                borderBottomWidth: i === 2 ? 0 : 1,
                borderBottomColor: withAlpha(brand.textInk, 0.06),
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: tokens.bg.inset }} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ height: 13, width: '80%', borderRadius: 4, backgroundColor: tokens.bg.inset }} />
                <View style={{ height: 10, width: '40%', borderRadius: 4, backgroundColor: tokens.bg.inset }} />
              </View>
            </View>
          ))
        ) : rows.length === 0 ? (
          <>
            <View style={{ paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center' }}>
              <Text
                style={{ fontFamily: typography.cardBody.family, fontSize: 13, color: tokens.text.muted }}
              >
                {emptyText ?? t('home.moduleEmpty.activityFill')}
              </Text>
            </View>
            <CellarBrowseRow hasTopBorder />
          </>
        ) : (
          <>
            {rows.map((row, i) => (
              <ActivityRow key={row.id} row={row} isLast={i === rows.length - 1} />
            ))}
            {/* 소식 3개 미만이면 하단에 셀러 둘러보기 CTA */}
            {rows.length < 3 ? <CellarBrowseRow hasTopBorder /> : null}
          </>
        )}
      </View>
    </View>
  );
}
