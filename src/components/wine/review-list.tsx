/**
 * ReviewList — 커뮤니티 리뷰 목록 (stub).
 *
 * 사양: wine-detail.md §3-11 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q7): reviews 테이블 + 공개 정책 미정 → v0.1.0은 empty state.
 *   - 외부: mx-4
 *   - header: "리뷰 0" + SortBtn × 2 (Recent / Top rated)
 *   - empty fallback: "아직 리뷰가 없어요" / "No reviews yet"
 * v0.2.0에서 reviews 테이블 + LevelPill+ReviewBadge 동반 (닉네임 단독 금지 CRITICAL — 사양 §3-11).
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';

type Sort = 'recent' | 'topRated';
const SORTS: Sort[] = ['recent', 'topRated'];

export function ReviewList() {
  const { t } = useTranslation();
  const [sort, setSort] = useState<Sort>('recent');

  const handleSort = (s: Sort) => {
    Haptics.selectionAsync().catch(() => undefined);
    setSort(s);
  };

  return (
    <View className="mx-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text
          accessibilityRole="header"
          className="font-inter-semibold text-card-section-title text-text-primary dark:text-text-primary"
        >
          {t('wineDetail.reviews.title')}
          {'  '}
          <Text className="font-inter text-text-muted dark:text-text-muted">0</Text>
        </Text>

        <View className="flex-row" style={{ gap: 4 }}>
          {SORTS.map((s) => {
            const active = s === sort;
            return (
              <Pressable
                key={s}
                onPress={() => handleSort(s)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`wineDetail.reviews.sort.${s}`)}
                className="rounded-lg border border-border-default"
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: active ? brand.wineRed : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  allowFontScaling={false}
                  className="font-inter-semibold text-[11px]"
                  style={{ color: brand.cream }}
                >
                  {t(`wineDetail.reviews.sort.${s}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Empty */}
      <View
        className="items-center"
        style={{ padding: 24 }}
        accessibilityRole="text"
        accessibilityLabel={t('wineDetail.reviews.empty')}
      >
        <Text className="font-inter text-[13px] text-text-muted dark:text-text-muted">
          {t('wineDetail.reviews.empty')}
        </Text>
      </View>
    </View>
  );
}
