/**
 * CommUserAvatar — 커뮤니티 사용자 아바타.
 *
 * 사양: community-components.md §1-2 (Day 6, 2026-05-22).
 *   - keyscreen verbatim: circle (radius = size/2 §6-9), level gradient,
 *     border 1px {gradientStartColor}88 (= 53% alpha) §6-10,
 *     initial Playfair 700 cream (어두운 gradient 위 가독성)
 *   - default size = 36 (keyscreen verbatim §10 C) — 단, 기존 사용처 (`home-community-peek`)
 *     호환 위해 size optional
 *   - flexShrink:0 (flex parent 안에서 size 보존)
 *   - asLink default false (§10 B: v0.1.0 `/profile/{userId}` route 미존재)
 *
 * 결정 사항 (community-components.md §10 A):
 *   - 기존 RN shape `{ levelId, initial }` 유지 (parent fetch 책임 — RLS·동시성 안전)
 *   - 신규 userId prop 추가 (asLink 라우팅용 — optional). userId 만 줄 때는 levelId/initial 직접 전달.
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * gradient 색은 양쪽 모드 동일 (level identity — keyscreen 정책 일관).
 */
import { Text, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { brand, noteAuthorAvatarGradient, withAlpha } from '@/lib/design-tokens';

type LevelId = 1 | 2 | 3 | 4 | 5;

interface CommUserAvatarProps {
  levelId: LevelId;
  initial: string;
  size?: number;
  /** Supabase user id 또는 mock user id — asLink=true 시 라우팅에만 사용 */
  userId?: string;
  /** true 시 Pressable wrap + profile 라우트 (v0.1.0 미존재 → onPress no-op). default false (nested 안전) */
  asLink?: boolean;
}

export function CommUserAvatar({
  levelId,
  initial,
  size = 36,
  userId,
  asLink = false,
}: CommUserAvatarProps) {
  const router = useRouter();
  const gradient =
    noteAuthorAvatarGradient[`L${levelId}` as keyof typeof noteAuthorAvatarGradient];
  const startColor = gradient.colors[0] ?? brand.gold;
  const borderColor = withAlpha(startColor, 0.53);

  const visual = (
    <LinearGradient
      colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
      start={gradient.start}
      end={gradient.end}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        flexShrink: 0,
        borderWidth: 1,
        borderColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_7Bold',
          fontSize: Math.round(size * 0.42),
          fontWeight: '700',
          color: brand.cream,
        }}
      >
        {initial}
      </Text>
    </LinearGradient>
  );

  if (!asLink) {
    // §10 B 권장 (b): asLink default false — nested 안전 (Card outer Pressable 안에 들어갈 때)
    return <View>{visual}</View>;
  }

  // asLink=true: v0.1.0 `/profile/{userId}` 미존재 → onPress no-op (toast 는 caller 책임)
  // §4-11 패턴: Pressable hit + opacity, inner LinearGradient 가 visual 분리.
  return (
    <Pressable
      onPress={() => {
        if (userId) {
          // v0.2.0 활성: router.push(`/profile/${userId}`)
          // v0.1.0 현재는 미존재 — no-op (호출처에서 Toast 표시 권장)
        }
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      accessibilityRole="button"
      hitSlop={6}
    >
      {visual}
    </Pressable>
  );
}
