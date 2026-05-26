/**
 * PriceCompareCard — 내 구매가 vs 현재 평균 컴팩트 카드.
 *
 * 사양: ux-decisions/cellar-cellared-tab.md Decision 6.
 *
 * 가시성 규칙:
 *   - 가격 입력된 병 전무 AND 현재 평균 없음 → 카드 전체 숨김 (null 반환)
 *   - 가격 입력된 병 전무 AND 현재 평균 있음 → "내 구매가" 행만 숨김, 카드 유지
 *   - 1병 → 라벨 "내 구매가"
 *   - 2병+ → 가격 입력된 병들의 평균, 라벨 "평균 구매가"
 */
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { brand } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { getPurchasesByLwin } from '@/lib/mock/purchases';
import type { CellarItemWithWine } from '@/hooks/use-cellar';

interface Props {
  /** 이 LWIN의 모든 cellared 아이템 */
  allItems: CellarItemWithWine[];
  /** allItems가 비어있을 때 단일 fallback 아이템 (primary item) */
  singleItemFallback: CellarItemWithWine | null;
  wineLwin: string;
}

function formatPrice(krw: number): string {
  const isKo = currentLocale() === 'ko';
  return isKo ? `₩${krw.toLocaleString()}` : `${krw.toLocaleString()} KRW`;
}

function computeCommunityAvg(lwin: string): number | null {
  const purchases = getPurchasesByLwin(lwin);
  if (purchases.length === 0) return null;
  const sum = purchases.reduce((acc, p) => acc + p.priceKrw, 0);
  return Math.round(sum / purchases.length);
}

export function PriceCompareCard({ allItems, singleItemFallback, wineLwin }: Props) {
  const { t } = useTranslation();
  const { bg, border, text, scheme } = useThemeTokens();
  const goldText = scheme === 'light' ? brand.goldDeep : brand.gold;

  const items = allItems.length > 0 ? allItems : (singleItemFallback ? [singleItemFallback] : []);
  const isMulti = items.length >= 2;

  // 가격이 입력된 병들만 추려서 평균 계산
  const pricedItems = items.filter((i): i is CellarItemWithWine & { purchase_price_krw: number } =>
    typeof i.purchase_price_krw === 'number',
  );
  const myAvgPrice: number | null = pricedItems.length > 0
    ? Math.round(pricedItems.reduce((acc, i) => acc + i.purchase_price_krw, 0) / pricedItems.length)
    : null;

  const communityAvg = computeCommunityAvg(wineLwin);

  // 전체 숨김: 내 가격도 없고 커뮤니티 평균도 없을 때
  if (myAvgPrice === null && communityAvg === null) return null;

  const myPriceLabel = isMulti && pricedItems.length > 0
    ? t('cellar.priceCompare.avgMyPrice')
    : t('cellar.priceCompare.myPrice');

  return (
    <View
      style={{
        marginHorizontal: 16,
        borderRadius: 14,
        backgroundColor: bg.surface,
        borderWidth: 1,
        borderColor: border.default,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
      }}
    >
      {/* "내 구매가" 행 — 가격 입력 없으면 숨김 */}
      {myAvgPrice !== null ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: text.muted }}
            >
              {myPriceLabel}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: text.primary }}
            >
              {formatPrice(myAvgPrice)}
            </Text>
          </View>
          <View style={{ height: 0.5, backgroundColor: border.default }} />
        </>
      ) : null}

      {/* "현재 평균" 행 + "가격 상세 →" */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: text.muted }}
        >
          {t('cellar.priceCompare.communityAvg')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: text.primary }}
          >
            {communityAvg !== null ? formatPrice(communityAvg) : t('cellar.priceCompare.noData')}
          </Text>
          <View style={{ flex: 0 }}>
            <Pressable
              onPress={() => router.push(`/wine/${encodeURIComponent(wineLwin)}/prices` as never)}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              accessibilityRole="link"
              accessibilityLabel={t('cellar.priceCompare.priceDetail')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: goldText }}
                >
                  {t('cellar.priceCompare.priceDetail')}
                </Text>
                <ChevronRight size={12} strokeWidth={2} color={goldText} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
