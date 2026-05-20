/**
 * CommUserAvatar — 커뮤니티 사용자 아바타.
 *
 * 사양 home.md §3-6: 28×28 circle, level-based gradient (5종), initial 텍스트.
 * AppHeader LevelChip와 동일 gradient 토큰 사용 (gradients.levelChip.{L1..L5}).
 */
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand, gradients } from '@/lib/design-tokens';

type LevelId = 1 | 2 | 3 | 4 | 5;

interface CommUserAvatarProps {
  levelId: LevelId;
  initial: string;
  size?: number;
}

export function CommUserAvatar({ levelId, initial, size = 28 }: CommUserAvatarProps) {
  const gradient = gradients.levelChip[`L${levelId}` as keyof typeof gradients.levelChip];
  return (
    <LinearGradient
      colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
      start={gradient.start}
      end={gradient.end}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: Math.round(size * 0.43),
          fontWeight: '700',
          color: brand.deepestDark,
        }}
      >
        {initial}
      </Text>
    </LinearGradient>
  );
}
