/**
 * FollowCountRow — profile-me §CH-2 신규 컴포넌트.
 *
 * handoff `ProfileScreen` line 41~62 (FollowCountRow).
 * ProfileHero LevelProgressBar 아래 + RankingDetailLink 위에 삽입 (내 프로필).
 * OtherUserHero 에서는 tappable=false 로 재활용.
 *
 * §CH-D2: ProfileHero outer card gap 14 이미 적용 → marginTop 제거.
 *         borderTopWidth + paddingTop 14 만 유지.
 * §CH-D3: count 천 단위 — Number.toLocaleString() verbatim.
 * §CH-D4: tappable=true 시 Pressable 3-layer (§4-11). tappable=false 시 순수 View.
 *
 * §4-11 3-layer:
 *   - flex 분배는 outer wrapper View (§4-11 3.5)
 *   - Pressable style 함수에는 opacity 만
 *   - layout/visual 은 inner View
 *
 * §0-2 light-only.
 */
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { light } from '@/lib/design-tokens';

interface FollowCountRowProps {
  followerCount: number;
  followingCount: number;
  /** 내 프로필: true (탭 시 팔로우 리스트 진입). 남의 프로필: false (정적 표시). 기본 false. */
  tappable?: boolean;
  /** tappable=true 일 때만 호출. 팔로워 셀 탭. */
  onPressFollowers?: () => void;
  /** tappable=true 일 때만 호출. 팔로잉 셀 탭. */
  onPressFollowing?: () => void;
}

const countStyle = {
  fontFamily: 'Freesentation_4Regular',
  fontWeight: '500' as const,
  fontSize: 18,
  lineHeight: 21.6,
  color: light.text.primary,
};

const labelStyle = {
  fontFamily: 'Freesentation_4Regular',
  fontSize: 10,
  lineHeight: 12,
  letterSpacing: 0.4,
  color: light.text.muted,
};

interface CellProps {
  count: number;
  label: string;
  a11yLabel: string;
  tappable: boolean;
  onPress?: () => void;
}

function Cell({ count, label, a11yLabel, tappable, onPress }: CellProps) {
  if (tappable) {
    // §4-11 3-layer: flex 분배(outer) → Pressable(opacity) → visual(inner)
    return (
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              paddingVertical: 4,
            }}
          >
            <Text style={countStyle}>{count.toLocaleString()}</Text>
            <Text style={labelStyle}>{label}</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // tappable=false — 정적 View (flex 분배만)
  return (
    <View
      accessibilityLabel={a11yLabel}
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        paddingVertical: 4,
      }}
    >
      <Text style={countStyle}>{count.toLocaleString()}</Text>
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}

export function FollowCountRow({
  followerCount,
  followingCount,
  tappable = false,
  onPressFollowers,
  onPressFollowing,
}: FollowCountRowProps) {
  const { t } = useTranslation();

  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: light.border.default,
        paddingTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Cell
        count={followerCount}
        label={t('profile.followers')}
        a11yLabel={t('profile.a11y.followers', { count: followerCount })}
        tappable={tappable}
        onPress={onPressFollowers}
      />
      <View
        style={{ width: 1, height: 28, backgroundColor: light.border.default }}
      />
      <Cell
        count={followingCount}
        label={t('profile.following')}
        a11yLabel={t('profile.a11y.following', { count: followingCount })}
        tappable={tappable}
        onPress={onPressFollowing}
      />
    </View>
  );
}
