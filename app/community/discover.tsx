/**
 * /community/discover — 팔로우 추천 (헤더 + 5 UserCard with compatibility bar + Follow btn).
 *
 * 사양: _workspace/design-specs/community-side.md §1-B (1차 진실 소스).
 *
 * §0-2 light-only mode.
 *
 * §10 결정 (사양 명시):
 *   A: DISCOVER_ROWS → src/lib/mock/community-discover.ts 분리.
 *   D: Follow / Name Pressable = deferredToast (Alert.alert).
 *   F: LightBackHeader inline.
 *   G: Level pill text color 일괄 light.text.secondary (L1~L5 대비 통일, bg/border만 user.color alpha).
 *   J: BottomNav 미노출.
 *   N: paddingBottom = 40 + insets.bottom.
 *
 * §4-11 Pressable 안전 패턴:
 *   - Back / Name / Follow btn / Avatar 모두 2-layer
 *
 * §6 RN deviation:
 *   - 6-2: gold → light.border.active
 *   - 6-7: 헤더 하단 hairlineWidth border
 *   - 6-8: `${user.color}22` / `${user.color}66` → withAlpha(user.color, 0.13/0.4)
 *   - 6-9 / 10-G: Level pill text color = light.text.secondary (대비 통일)
 *   - 6-10: Compatibility bar wrap bg = light.bg.deep, fill = light.border.active
 *
 * isFollowing 정적 (index === 0 만 true — keyscreen verbatim).
 */
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { getCommunityUser } from '@/lib/mock/community-posts';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { DISCOVER_ROWS, type DiscoverRow } from '@/lib/mock/community-discover';

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection />
        <UserCardsList />
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LightBackHeader (inline — §10 F)
// ────────────────────────────────────────────────────────────────────────────

function LightBackHeader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    router.back();
  }, []);

  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top + 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: light.border.default,
      }}
    >
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t('nav.back', { defaultValue: 'Back' })}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
        </View>
      </Pressable>
      <Text
        allowFontScaling={false}
        accessibilityRole="header"
        style={{
          marginLeft: 4,
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 16,
          color: light.text.primary,
        }}
      >
        {t('community.discover.headerTitle')}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// HeaderSection — 'People close to' + accent + sub
// ────────────────────────────────────────────────────────────────────────────

function HeaderSection() {
  const { t } = useTranslation();
  const title = t('community.discover.title');
  const accent = t('community.discover.titleAccent');
  const sub = t('community.discover.sub');

  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 22 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 22,
          lineHeight: 26.4,
          color: light.text.primary,
        }}
      >
        {title}
        {'\n'}
        <Text style={{ color: light.border.active, fontStyle: 'italic' }}>{accent}</Text>
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          marginTop: 8,
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          color: light.text.muted,
        }}
      >
        {sub}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// UserCardsList — 5 UserCard map
// ────────────────────────────────────────────────────────────────────────────

function UserCardsList() {
  return (
    <View
      style={{
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 30,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {DISCOVER_ROWS.map((row, i) => (
        <UserCard key={row.userId} row={row} isFollowing={i === 0} />
      ))}
    </View>
  );
}

interface UserCardProps {
  row: DiscoverRow;
  isFollowing: boolean;
}

function UserCard({ row, isFollowing }: UserCardProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const user = getCommunityUser(row.userId);
  if (!user) return null;

  const sub = locale === 'en' ? row.subEn : row.subKo;
  const pctText = t('community.discover.compatibility', { pct: row.pct });
  const followLabel = isFollowing
    ? t('community.discover.following')
    : t('community.discover.follow');

  const handleNamePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.profile.deferred'));
  }, [t]);

  const handleFollowPress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.discover.followDeferred'));
  }, [t]);

  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <CommUserAvatar
        levelId={user.level}
        initial={user.initial}
        userId={row.userId}
        size={48}
        asLink
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable
            onPress={handleNamePress}
            accessibilityRole="button"
            accessibilityLabel={user.name}
            hitSlop={4}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 14,
                color: light.text.primary,
              }}
            >
              {user.name}
            </Text>
          </Pressable>
          <View
            style={{
              paddingVertical: 1,
              paddingHorizontal: 5,
              borderRadius: 999,
              backgroundColor: withAlpha(user.color, 0.13),
              borderWidth: 1,
              borderColor: withAlpha(user.color, 0.4),
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 9,
                color: light.text.secondary,
              }}
            >
              {`L${user.level}`}
            </Text>
          </View>
        </View>
        <Text
          allowFontScaling={false}
          style={{
            marginTop: 3,
            fontFamily: 'Freesentation_4Regular',
            fontSize: 10,
            color: light.text.muted,
          }}
        >
          {sub}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 6,
          }}
        >
          <View
            style={{
              height: 4,
              width: 56,
              borderRadius: 999,
              backgroundColor: light.bg.deep,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${row.pct}%`,
                height: '100%',
                backgroundColor: light.border.active,
              }}
            />
          </View>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 10,
              color: light.border.active,
            }}
          >
            {pctText}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={handleFollowPress}
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        accessibilityState={{ selected: isFollowing }}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexShrink: 0 })}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 999,
            backgroundColor: isFollowing ? brand.wineRed : 'transparent',
            borderWidth: 1,
            borderColor: isFollowing ? brand.wineRed : light.border.active,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 11,
              color: isFollowing ? brand.cream : light.border.active,
            }}
          >
            {followLabel}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
