/**
 * ResultCount — "총 N병" / "N병 중 M개 결과" + ClearFilters btn.
 *
 * 사양: design-spec cellar-list.md §3-7.
 * 키스크린 원본: src/app/cellar/page.tsx line 389~424.
 *
 * row: padding 0_20_10 + flex row items-center justify-between
 * text: Inter 11 text-muted
 * clear btn: Inter 11 600 gold (light 모드 goldDeep 권장 §12-7)
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  total: number;
  shown: number;
  /** 필터/검색이 적용된 상태 — filtered 표시 + ClearFilters 노출 */
  isFiltered: boolean;
  onClear: () => void;
}

export function ResultCount({ total, shown, isFiltered, onClear }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  // light 모드 gold(#C9A84C) on cream(#FAF5EC) 대비 2.8:1 — WCAG AA 미달 (사양 §12-7).
  // light 모드는 goldDeep(#A07F2E) 대체로 대비 5.0:1+ 확보.
  const goldText = scheme === 'light' ? brand.goldDeep : brand.gold;
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text
        allowFontScaling={false}
        className="font-inter text-text-muted dark:text-text-muted"
        style={{ fontSize: 11, lineHeight: 13.2 }}
      >
        {isFiltered
          ? t('cellar.resultCount.filtered', { total, shown })
          : t('cellar.resultCount.total', { total })}
      </Text>
      {isFiltered && shown !== total ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={t('cellar.clearFilters')}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          hitSlop={6}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 11,
              lineHeight: 13.2,
              color: goldText,
            }}
          >
            {t('cellar.clearFilters')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
