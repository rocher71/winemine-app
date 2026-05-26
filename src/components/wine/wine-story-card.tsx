/**
 * WineStoryCard — 와이너리 스토리 카드.
 *
 * 사양: wine-detail.md §3-10 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q6): wine_stories 테이블·콘텐츠 부재 → v0.1.0은 empty state.
 *   - 외부: padding 16 + minHeight 220 + radius 16 + border
 *   - empty fallback: "이 와인의 스토리는 준비 중" / "Story coming soon"
 *   - more link은 표시 X (empty 상태에서 의미 없음)
 * v0.2.0에서 wine_stories 테이블 + winery 콘텐츠 채움. funFact popover 동시.
 *
 * V2 업데이트 (wine-detail-v2-tasks.md T9):
 *   - story?: WineStoryData prop 추가 — 데이터 있으면 preview + quote 표시
 *   - lwin?: string prop 추가 — "전체 읽기 →" 링크용
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { WineStoryData } from '@/lib/types/wine-detail';

interface Props {
  story?: WineStoryData;
  lwin?: string;
}

export function WineStoryCard({ story, lwin }: Props) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();

  const handleMore = () => {
    if (!lwin) return;
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/wine/${lwin}/story`);
  };

  if (!story) {
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

  return (
    <View
      className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default p-4"
      accessibilityRole="text"
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text
          allowFontScaling={false}
          className="font-inter-medium text-[12px]"
          style={{ color: brand.gold, letterSpacing: 0.48 }}
        >
          {t('wineDetail.story.label')}
        </Text>
        {lwin ? (
          <Pressable
            onPress={handleMore}
            accessibilityRole="link"
            accessibilityLabel={t('wineDetail.story.more')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text
                allowFontScaling={false}
                className="font-inter-semibold text-[12px]"
                style={{ color: brand.gold }}
              >
                {t('wineDetail.story.more')}
              </Text>
              <ArrowRight size={14} strokeWidth={2} color={brand.gold} />
            </View>
          </Pressable>
        ) : null}
      </View>

      {/* Preview */}
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          lineHeight: 12 * 1.55,
          color: tokens.text.secondary,
          marginBottom: 10,
        }}
      >
        {story.preview}
      </Text>

      {/* Quote */}
      {story.quote ? (
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'PlayfairDisplay_400Regular_Italic',
            fontSize: 12,
            lineHeight: 12 * 1.55,
            color: tokens.text.muted,
          }}
        >
          {`"${story.quote}"`}
        </Text>
      ) : null}
    </View>
  );
}
