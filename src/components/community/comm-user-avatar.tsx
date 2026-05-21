/**
 * CommUserAvatar — 커뮤니티 사용자 아바타.
 *
 * 사양 home.md §3-6-PATCH (line 1126~1235): keyscreen verbatim
 *   - 28×28 circle (radius 9999)
 *   - level-based gradient = `noteAuthorAvatarGradient.L{1..5}` (notes-detail와 공유 토큰)
 *     · levelChip(AppHeader 용도, 같은 색 + alpha) 사용 금지 — keyscreen L4=gold→navy 색조 회복
 *   - initial 텍스트: Playfair, fontSize = round(size * 0.42), weight 700,
 *     color **brand.cream** (어두운 gradient 위 가독성 확보 — keyscreen verbatim)
 */
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand, noteAuthorAvatarGradient } from '@/lib/design-tokens';

type LevelId = 1 | 2 | 3 | 4 | 5;

interface CommUserAvatarProps {
  levelId: LevelId;
  initial: string;
  size?: number;
}

export function CommUserAvatar({ levelId, initial, size = 28 }: CommUserAvatarProps) {
  const gradient = noteAuthorAvatarGradient[`L${levelId}` as keyof typeof noteAuthorAvatarGradient];
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
          fontSize: Math.round(size * 0.42),
          fontWeight: '700',
          color: brand.cream,
        }}
      >
        {initial}
      </Text>
    </LinearGradient>
  );
}
