/**
 * InfiniteLoader — 리스트 하단 "더 불러오는 중" spinner + 텍스트 (공용).
 *
 * 사양 home.md §3-8, §Deviation D4: CSS spin keyframe → ActivityIndicator (표준·저비용).
 * 모든 페이지 리스트(FlatList footer / ScrollView 하단)에서 재사용.
 */
import { View, Text, ActivityIndicator } from 'react-native';
import { brand, typography } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface InfiniteLoaderProps {
  label: string;
}

export function InfiniteLoader({ label }: InfiniteLoaderProps) {
  const tokens = useThemeTokens();
  const goldAccent = tokens.scheme === 'light' ? brand.goldDeep : brand.gold;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        paddingVertical: 20,
      }}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <ActivityIndicator size="small" color={goldAccent} />
      <Text
        style={{
          fontFamily: typography.cardMeta.family,
          fontSize: 12.5,
          color: tokens.text.muted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
