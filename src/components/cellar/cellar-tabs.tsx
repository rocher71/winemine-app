/**
 * CellarTabs — inline TabSegment (cellar / tasted).
 *
 * 사양: design-spec cellar-list.md §3-2.
 * 키스크린 원본: src/app/cellar/page.tsx line 153~219.
 *
 * outer: bg-surface border-default radius 10 padding 3 gap 2 flexShrink 0
 * active tab: wine-red bg + cream text + cream/0.7 count badge
 * idle tab:   transparent + text-muted + text-disabled count badge
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, cellar } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export type CellarTab = 'cellar' | 'tasted' | 'list';

interface Props {
  value: CellarTab;
  onChange: (v: CellarTab) => void;
  /** 셀러 탭 count (보관 중 와인 수) */
  cellarCount: number;
  /** 마신 탭 count (consumed 또는 tasting_notes 기반 — v0.1.0은 consumed로 표시) */
  tastedCount: number;
  /** 리스트 탭 count */
  listCount: number;
}

function TabButton({
  active,
  label,
  count,
  onPress,
}: {
  active: boolean;
  label: string;
  count: number;
  onPress: () => void;
}) {
  const { text } = useThemeTokens();
  const labelColor = active ? brand.cream : text.muted;
  const countColor = active ? cellar.tabCountActive : text.disabled;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} ${count}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 7,
        backgroundColor: active ? brand.wineRed : 'transparent',
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          lineHeight: 14.4,
          color: labelColor,
        }}
      >
        {label}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          lineHeight: 12,
          color: countColor,
        }}
      >
        {count}
      </Text>
    </Pressable>
  );
}

export function CellarTabs({ value, onChange, cellarCount, tastedCount, listCount }: Props) {
  const { t } = useTranslation();
  const handle = (next: CellarTab) => {
    if (next === value) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(next);
  };
  return (
    <View
      className="flex-row rounded-[10px] bg-surface dark:bg-surface border border-border-default"
      style={{ padding: 3, gap: 2, flexShrink: 0, alignSelf: 'flex-start' }}
    >
      <TabButton
        active={value === 'cellar'}
        label={t('cellar.tabs.cellar')}
        count={cellarCount}
        onPress={() => handle('cellar')}
      />
      <TabButton
        active={value === 'tasted'}
        label={t('cellar.tabs.tasted')}
        count={tastedCount}
        onPress={() => handle('tasted')}
      />
      <TabButton
        active={value === 'list'}
        label={t('cellar.tabs.list')}
        count={listCount}
        onPress={() => handle('list')}
      />
    </View>
  );
}
