/**
 * NoResults — 검색/필터 결과 0건 표시 (dashed border 카드).
 *
 * 사양: design-spec cellar-list.md §3-11.
 * 키스크린 원본: src/app/cellar/page.tsx line 846~892.
 *
 * outer: margin 8_16_24, padding 32_20, text-center, border 1px dashed, radius 14
 * title: Playfair 16 cream mb 6
 * body:  Inter 12 text-muted lh 1.5 mb 14
 * btn:   padding 8_16, radius 10, border 1px gold, transparent, Inter 12 600 gold
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  onClear: () => void;
}

export function NoResults({ onClear }: Props) {
  const { t } = useTranslation();
  const { border } = useThemeTokens();
  return (
    <View
      className="rounded-[14px] items-center"
      style={{
        marginTop: 8,
        marginHorizontal: 16,
        marginBottom: 24,
        paddingHorizontal: 20,
        paddingVertical: 32,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: border.default,
      }}
    >
      <Text
        className="font-playfair text-text-primary dark:text-text-primary text-center"
        style={{ fontSize: 16, lineHeight: 20, marginBottom: 6 }}
      >
        {t('cellar.noResults.title')}
      </Text>
      <Text
        className="font-inter text-text-muted dark:text-text-muted text-center"
        style={{ fontSize: 12, lineHeight: 18, marginBottom: 14 }}
      >
        {t('cellar.noResults.body')}
      </Text>
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel={t('cellar.clearFilters')}
        style={({ pressed }) => ({
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: brand.gold,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            lineHeight: 14.4,
            color: brand.gold,
          }}
        >
          {t('cellar.clearFilters')}
        </Text>
      </Pressable>
    </View>
  );
}
