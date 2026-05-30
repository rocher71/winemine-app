/**
 * OtherUserHero — profile-other §N-1 신규 컴포넌트.
 *
 * handoff `OtherUserScreen` line 128~174.
 * 외곽 카드 + Row(Avatar gold gradient + DisplayName/handle·가입일 + LevelPill compact + FollowButton)
 * + FollowCountRow(tappable=false 재활용).
 *
 * §6 #1 Hero bg: light 모드 wineSoft tint 약함 → 단색 light.bg.surface.
 * §6 #2 Avatar: gold→goldDeep gradient + border 2 cream (내 프로필 wine-red 단색과 의도적 차이).
 * §6 #5 handle: profiles handle 컬럼 있을 수 있음. null 시 `@${anonymous_display}` 파생 fallback.
 * §4-11 3-layer (FollowButton): Pressable opacity 만 + inner View visual.
 * §4-5 anonymization: raw UUID 노출 X — anonymousDisplay 만 표시.
 *
 * §0-2 light-only.
 */
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brand, light } from '@/lib/design-tokens';
import { levelPillStyle, type LevelId } from './level-pill-style';
import { FollowCountRow } from './follow-count-row';

interface OtherUserHeroProps {
  anonymousDisplay: string;
  /** @handle. null 시 anonymous_display 파생 (`@slug`). */
  handle: string | null;
  /** ISO date string. null 시 가입일 생략. */
  joinedAt: string | null;
  levelId: LevelId;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  onPressFollow: () => void;
  onPressUnfollow: () => void;
  followPending?: boolean;
}

function avatarInitial(anonymous: string): string {
  const first = anonymous?.charAt(0) ?? '';
  return first ? first.toUpperCase() : '?';
}

/** ISO date → "YYYY.MM" (handoff "2023.02"). null/invalid 시 null. */
function joinedYearMonth(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}.${mm}`;
}

/** handle null 시 anonymous_display 기반 파생. */
function resolveHandle(handle: string | null, anonymousDisplay: string): string {
  if (handle) return handle.startsWith('@') ? handle : `@${handle}`;
  return `@${anonymousDisplay}`;
}

export function OtherUserHero({
  anonymousDisplay,
  handle,
  joinedAt,
  levelId,
  isFollowing,
  followerCount,
  followingCount,
  onPressFollow,
  onPressUnfollow,
  followPending = false,
}: OtherUserHeroProps) {
  const { t } = useTranslation();

  const initial = avatarInitial(anonymousDisplay);
  const pill = levelPillStyle(levelId);
  const ym = joinedYearMonth(joinedAt);
  const handleText = resolveHandle(handle, anonymousDisplay);
  const subText = ym
    ? `${handleText} · ${t('profile.other.joined', { date: ym })}`
    : handleText;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 8,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
      }}
    >
      {/* Row 1 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {/* Avatar 64×64 gold gradient — borderRadius 32 (=64/2) §4-10 */}
        <LinearGradient
          colors={[brand.gold, brand.goldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 2,
            borderColor: brand.cream,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '700',
              fontSize: 28,
              lineHeight: 33,
              color: brand.deepestDark,
            }}
          >
            {initial}
          </Text>
        </LinearGradient>

        {/* Col */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 20,
              lineHeight: 24,
              color: light.text.primary,
            }}
          >
            {anonymousDisplay}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              lineHeight: 14,
              color: light.text.muted,
              marginTop: 2,
            }}
          >
            {subText}
          </Text>
          {/* LevelPill compact */}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <View
              accessibilityLabel={t('profile.a11y.level', { level: levelId })}
              style={{
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 12,
                backgroundColor: pill.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontWeight: '600',
                  fontSize: 10,
                  lineHeight: 10,
                  color: pill.fg,
                }}
              >
                L{levelId}
              </Text>
            </View>
          </View>
        </View>

        {/* FollowButton — §4-11 3-layer */}
        <Pressable
          onPress={isFollowing ? onPressUnfollow : onPressFollow}
          disabled={followPending}
          accessibilityRole="button"
          accessibilityState={{ selected: isFollowing, disabled: followPending }}
          accessibilityLabel={
            isFollowing ? t('profile.a11y.unfollow') : t('profile.a11y.follow')
          }
          hitSlop={6}
          style={({ pressed }) => ({
            opacity: pressed || followPending ? 0.7 : 1,
          })}
        >
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: isFollowing ? 'transparent' : brand.wineRed,
              borderWidth: isFollowing ? 1 : 0,
              borderColor: isFollowing ? light.border.default : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 12,
                lineHeight: 14.4,
                color: isFollowing ? light.text.secondary : brand.white,
              }}
            >
              {isFollowing ? t('profile.other.following') : t('profile.other.follow')}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* FollowCountRow (tappable=false) — §CH-2 재활용. marginTop 14 (gap 부재 컨텍스트). */}
      <View style={{ marginTop: 14 }}>
        <FollowCountRow
          followerCount={followerCount}
          followingCount={followingCount}
          tappable={false}
        />
      </View>
    </View>
  );
}
