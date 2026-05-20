/**
 * CellarSearchInput — 검색바 + ClearBtn (X circle).
 *
 * 사양: design-spec cellar-list.md §3-4.
 * 키스크린 원본: src/app/cellar/page.tsx line 255~309.
 *
 * wrapper: padding 0_16_10
 * box:     flex row items-center gap 8, padding 10_12, bg-surface, border-default, radius 12
 * icon:    lucide Search 16 text-muted
 * input:   flex-1 Inter 13 text-primary, transparent
 * clear:   22×22 circle, bg cream/0.08 (dark) | textInk/0.08 (light), X 12
 */
import { View, TextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { cellar } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
}

export function CellarSearchInput({ query, onQueryChange }: Props) {
  const { t } = useTranslation();
  const { scheme, text } = useThemeTokens();
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
      <View
        className="flex-row items-center bg-surface dark:bg-surface border border-border-default rounded-xl"
        style={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        <Search size={16} strokeWidth={2} color={text.muted} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={t('cellar.searchPlaceholder')}
          placeholderTextColor={text.disabled}
          className="flex-1 font-inter text-text-primary dark:text-text-primary"
          style={{ padding: 0, minWidth: 0, fontSize: 13 }}
          accessibilityLabel={t('cellar.searchPlaceholder')}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => onQueryChange('')}
            accessibilityRole="button"
            accessibilityLabel={t('cellar.clearSearch')}
            hitSlop={8}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: cellar.clearBtnBg[scheme],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={12} strokeWidth={2.25} color={text.secondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
