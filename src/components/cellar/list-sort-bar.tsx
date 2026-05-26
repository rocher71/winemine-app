/**
 * ListSortBar — "총 N개의 리스트 + 정렬 드롭다운" 헤더 바.
 * 정렬 메뉴는 ActionSheet (expo-haptics + 인라인 드롭다운 없음 — §4-11 패턴).
 */
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { ListSortKey } from '@/hooks/use-wine-lists';

interface Props {
  count: number;
  sort: ListSortKey;
  onSortPress: () => void;
}

export function ListSortBar({ count, sort, onSortPress }: Props) {
  const { t } = useTranslation();
  const { text } = useThemeTokens();

  const sortLabel =
    sort === 'recent'  ? t('lists.sortRecent')  :
    sort === 'created' ? t('lists.sortCreated') :
    sort === 'name'    ? t('lists.sortName')    :
    t('lists.sortCount');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: text.muted,
          lineHeight: 16,
        }}
      >
        {t('lists.totalCount', { count })}
      </Text>

      <View style={{ flex: 1 }} />

      {/* 정렬 버튼 */}
      <Pressable
        onPress={onSortPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        accessibilityRole="button"
        accessibilityLabel={t('lists.sortRecent')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              color: text.secondary,
              lineHeight: 16,
            }}
          >
            {sortLabel}
          </Text>
          <ChevronRight size={11} strokeWidth={2.2} color={text.secondary} />
        </View>
      </Pressable>
    </View>
  );
}
