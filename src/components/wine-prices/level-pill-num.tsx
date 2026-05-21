/**
 * LevelPillNum — wine-prices PriceDetailTable 의 inline 레벨 칩.
 *
 * keyscreen `src/components/shared/level-pill.tsx` verbatim 포팅 — "L{n}" 표기.
 * (참고: `src/components/shared/level-pill.tsx` 의 LevelPill 은 레벨 이름 표기 — 별개 컴포넌트)
 *
 * 시각 (wine-prices.md §3-4a):
 *   - L1 cream / L2 goldSoft / L3 gold / L4 wineRed / L5 gradient gold→cream (135deg)
 *   - text 색: L1~L3, L5 → brand.textInk (#2A1A14 근사 → keyscreen 정확값 #05020A 사용)
 *              L4 → brand.cream
 *
 * size: 'sm' (padding 2 8, fontSize 10) / 'md' (padding 4 10, fontSize 11) — keyscreen verbatim.
 * default = 'sm' (keyscreen default).
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand } from '@/lib/design-tokens';

type LevelId = 1 | 2 | 3 | 4 | 5;
type Size = 'sm' | 'md';

interface LevelPillNumProps {
  level: LevelId;
  size?: Size;
}

function levelStyle(level: LevelId): { background: string; color: string } {
  switch (level) {
    case 1:
      return { background: brand.cream, color: brand.deepestDark };
    case 2:
      return { background: brand.goldSoft, color: brand.deepestDark };
    case 3:
      return { background: brand.gold, color: brand.deepestDark };
    case 4:
      return { background: brand.wineRed, color: brand.cream };
    case 5:
      return { background: 'gradient', color: brand.deepestDark };
  }
}

export function LevelPillNum({ level, size = 'sm' }: LevelPillNumProps) {
  const { background, color } = levelStyle(level);
  const paddingH = size === 'sm' ? 8 : 10;
  const paddingV = size === 'sm' ? 2 : 4;
  const fontSize = size === 'sm' ? 10 : 11;

  const text = (
    <Text
      style={{
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        fontSize,
        color,
        lineHeight: fontSize,
      }}
      accessibilityLabel={`Level ${level}`}
    >
      L{level}
    </Text>
  );

  if (background === 'gradient') {
    // L5 — LinearGradient 135deg (start={0,0} end={1,1}), gold → cream.
    return (
      <LinearGradient
        colors={[brand.gold, brand.cream]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderRadius: 12,
        }}
      >
        {text}
      </LinearGradient>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: paddingH,
        paddingVertical: paddingV,
        borderRadius: 12,
        backgroundColor: background,
      }}
    >
      {text}
    </View>
  );
}
