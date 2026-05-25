/**
 * RatingSourceCell — 외부 평점 소스 1개 셀.
 *
 * 재사용 목적: ExternalRatingsCard 내 3개 (Vivino / Wine Searcher / CellarTracker) 에 동일하게 사용.
 * stub 상태: score = "—", accentColor = tokens.text.muted 로 호출.
 *
 * No className — cssInterop 우회를 위해 inline style 사용 (CLAUDE.md §4-11).
 */
import { View, Text } from 'react-native';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface RatingSourceCellProps {
  source: string;
  score: string;
  accentColor: string;
}

export function RatingSourceCell({ source, score, accentColor }: RatingSourceCellProps) {
  const tokens = useThemeTokens();

  return (
    <View style={{ flex: 1 }}>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 9,
          color: tokens.text.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {source}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 16,
          color: accentColor,
          marginTop: 2,
        }}
      >
        {score}
      </Text>
    </View>
  );
}
