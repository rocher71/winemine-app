/**
 * LevelChip — AppHeader 우측에 표시되는 avatar gradient circle + L{n} 텍스트.
 *
 * 기존 LevelPill (단일 chip)과 별개. 사양 home.md §3-1 verbatim:
 * - outer: gap 8, h 32, padding 0 10 0 4, radius full, bg-surface, border-default
 * - avatar: 24×24 radius full, linear-gradient 135deg [color, color+99]
 * - initial: Playfair 12px 700, deepest-dark
 * - level text: Inter 11px 600, color, tracking 0.04em
 */
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { brand, gradients, level as levelColors } from '@/lib/design-tokens';

type LevelId = 1 | 2 | 3 | 4 | 5;

interface LevelChipProps {
  levelId: LevelId;
  initial: string;
  onPress?: () => void;
}

export function LevelChip({ levelId, initial, onPress }: LevelChipProps) {
  const color = levelColors[`L${levelId}` as keyof typeof levelColors];
  const gradient = gradients.levelChip[`L${levelId}` as keyof typeof gradients.levelChip];

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    if (onPress) onPress();
    else router.push('/profile' as never);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`Level ${levelId} · Profile`}
      className="flex-row items-center rounded-full bg-surface dark:bg-surface border border-border-default dark:border-border-default"
      style={{ gap: 8, height: 32, paddingLeft: 4, paddingRight: 10 }}
    >
      <LinearGradient
        colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
        start={gradient.start}
        end={gradient.end}
        style={{
          width: 24,
          height: 24,
          borderRadius: 9999,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 12,
            fontWeight: '700',
            color: brand.deepestDark,
          }}
        >
          {initial}
        </Text>
      </LinearGradient>
      <Text
        className="font-inter-semibold"
        style={{ color, fontSize: 11, letterSpacing: 0.44 }}
      >
        L{levelId}
      </Text>
    </Pressable>
  );
}
