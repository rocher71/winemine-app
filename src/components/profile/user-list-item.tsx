/**
 * UserListItem — follow-list §N-1 신규 컴포넌트.
 *
 * handoff `FollowListScreen` line 636~677.
 * Avatar(44 gold gradient) + Name + L배지 + 맞팔배지 + handle + bio + FollowButton.
 *
 * §6 #2: handoff gold gradient + border 1.5 cream (CommUserAvatar 재활용 X — level gradient 다름).
 * §N-1a nested Pressable: 행 전체 Pressable(onPressProfile) 안에 FollowButton Pressable(onPressFollow).
 *   - 행 opacity 0.9 (미세) / 버튼 0.7 (또렷) — 시각 구분.
 *   - Pressable style 함수에는 opacity 만 (§4-11). layout/bg/border 는 inner View.
 *   - RN nested Pressable: 자식 onPress 우선 — 별도 stopPropagation 불필요.
 * §4-5 anonymization: userId 는 onPress 내부용. UI Text 자식 출력 X — anonymousDisplay 만.
 *
 * §0-2 light-only.
 */
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import type { LevelId } from './level-pill-style';

interface UserListItemProps {
  /** 프로필 이동용 raw UUID 내부 key. Text 출력 X (§4-5). */
  userId: string;
  anonymousDisplay: string;
  /** @handle. null 시 생략. */
  handle: string | null;
  levelId: LevelId;
  /** 자기소개. null 시 생략. */
  bio: string | null;
  isMutual: boolean;
  isFollowing: boolean;
  onPressFollow: () => void;
  onPressUnfollow: () => void;
  onPressProfile: () => void;
  followPending?: boolean;
}

function avatarInitial(anonymous: string): string {
  const first = anonymous?.charAt(0) ?? '';
  return first ? first.toUpperCase() : '?';
}

function resolveHandle(handle: string | null): string | null {
  if (!handle) return null;
  return handle.startsWith('@') ? handle : `@${handle}`;
}

export function UserListItem({
  userId,
  anonymousDisplay,
  handle,
  levelId,
  bio,
  isMutual,
  isFollowing,
  onPressFollow,
  onPressUnfollow,
  onPressProfile,
  followPending = false,
}: UserListItemProps) {
  const { t } = useTranslation();

  const initial = avatarInitial(anonymousDisplay);
  const handleText = resolveHandle(handle);
  // userId 는 a11y/onPress 에서만 — Text 자식 출력 X (§4-5).
  void userId;

  return (
    <Pressable
      onPress={onPressProfile}
      accessibilityRole="button"
      accessibilityLabel={`${anonymousDisplay}, L${levelId}${
        isMutual ? `, ${t('followList.mutual')}` : ''
      }`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          borderRadius: 12,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
        }}
      >
        {/* Avatar 44×44 gold gradient — borderRadius 22 (=44/2) §4-10 */}
        <LinearGradient
          colors={[brand.gold, brand.goldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: brand.cream,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 18,
              lineHeight: 21,
              color: brand.white,
            }}
          >
            {initial}
          </Text>
        </LinearGradient>

        {/* Info col */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '500',
                fontSize: 14,
                lineHeight: 16.8,
                color: light.text.primary,
                flexShrink: 1,
              }}
            >
              {anonymousDisplay}
            </Text>
            {/* L 배지 */}
            <View
              style={{
                paddingVertical: 1,
                paddingHorizontal: 5,
                borderRadius: 4,
                backgroundColor: withAlpha(brand.gold, 0.12),
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontWeight: '600',
                  fontSize: 9,
                  lineHeight: 11,
                  letterSpacing: 0.36,
                  color: brand.goldDeep,
                }}
              >
                L{levelId}
              </Text>
            </View>
            {/* 맞팔 배지 */}
            {isMutual ? (
              <View
                style={{
                  paddingVertical: 1,
                  paddingHorizontal: 5,
                  borderRadius: 4,
                  borderWidth: 0.5,
                  borderColor: light.border.default,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontWeight: '500',
                    fontSize: 9,
                    lineHeight: 11,
                    color: light.text.muted,
                  }}
                >
                  {t('followList.mutual')}
                </Text>
              </View>
            ) : null}
          </View>

          {handleText ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                lineHeight: 13.2,
                color: light.text.muted,
                marginTop: 2,
              }}
            >
              {handleText}
            </Text>
          ) : null}

          {bio ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                lineHeight: 14.3,
                color: light.text.secondary,
                marginTop: 4,
              }}
            >
              {bio}
            </Text>
          ) : null}
        </View>

        {/* FollowButton — §N-1a nested 3-layer */}
        <Pressable
          onPress={isFollowing ? onPressUnfollow : onPressFollow}
          disabled={followPending}
          accessibilityRole="button"
          accessibilityState={{ selected: isFollowing, disabled: followPending }}
          accessibilityLabel={
            isFollowing ? t('followList.a11y.unfollow') : t('followList.a11y.follow')
          }
          hitSlop={6}
          style={({ pressed }) => ({
            opacity: pressed || followPending ? 0.7 : 1,
          })}
        >
          <View
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 999,
              backgroundColor: isFollowing ? 'transparent' : brand.wineRed,
              borderWidth: isFollowing ? 1 : 0,
              borderColor: isFollowing ? light.border.default : 'transparent',
              flexShrink: 0,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                lineHeight: 13.2,
                color: isFollowing ? light.text.secondary : brand.white,
              }}
            >
              {isFollowing ? t('followList.following') : t('followList.follow')}
            </Text>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}
