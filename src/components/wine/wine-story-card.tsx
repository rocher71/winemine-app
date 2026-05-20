/**
 * WineStoryCard — 와이너리 스토리 카드 (stub).
 *
 * 사양: wine-detail.md §3-10 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q6): wine_stories 테이블·콘텐츠 부재 → v0.1.0은 empty state.
 *   - 외부: padding 16 + minHeight 220 + radius 16 + border
 *   - empty fallback: "이 와인의 스토리는 준비 중" / "Story coming soon"
 *   - more link은 표시 X (empty 상태에서 의미 없음)
 * v0.2.0에서 wine_stories 테이블 + winery 콘텐츠 채움. funFact popover 동시.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

export function WineStoryCard() {
  const { t } = useTranslation();

  return (
    <View
      className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4 items-center justify-center"
      style={{ minHeight: 220 }}
      accessibilityRole="text"
      accessibilityLabel={t('wineDetail.story.empty')}
    >
      <Text
        allowFontScaling={false}
        className="font-inter-medium text-[12px] mb-3"
        style={{ color: brand.gold, letterSpacing: 0.48 }}
      >
        {t('wineDetail.story.label')}
      </Text>
      <Text className="font-inter text-[13px] text-text-muted dark:text-text-muted text-center">
        {t('wineDetail.story.empty')}
      </Text>
    </View>
  );
}
