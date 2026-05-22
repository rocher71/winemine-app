/**
 * /profile — 내 프로필 화면 (BackHeader inline 패턴).
 *
 * 사양: _workspace/design-specs/profile-me.md (Day 6 신규 화면).
 *
 * §10 결정 사항 (rn-screen-builder 채택):
 *   A: route = `app/profile/index.tsx` (BottomNav 밖, LightBackHeader inline 패턴).
 *      ※ keyscreen verbatim은 `(tabs)/profile` + AppHeader이지만 BottomNav 5번째 탭 추가가
 *        Day 6 범위 밖이라 BackHeader 변형 채택. v0.2.0에서 (tabs)로 이전 검토.
 *   B: useProfileStats hook 신규 (`src/hooks/use-profile-stats.ts`).
 *   C: PageTitle 제거 — LightBackHeader title만 사용 (중복 회피). keyscreen verbatim
 *      이탈이지만 RN BackHeader 변형 시 PageTitle 중복 노출 부조화 (§6 #3 옵션 X).
 *   D: user_badges v0.2.0 — 본 cycle은 빈 배열 (BadgeDots에 props 미전달).
 *   L: wines_localized.country / .region 단일 locale (현재 schema 그대로) — distinct count만 사용.
 *   G: /profile/ranking 라우트 v0.2.0 보류 — RankingDetailLink onPress = Toast "준비 중".
 *   I: badges/notifications 라우트 v0.2.0 보류 — Toast "준비 중". settings 만 진짜 라우팅.
 *   K: RefreshControl 추가 (useProfile + useProfileStats refresh 합성).
 *   O: SignOut confirm = ConfirmDialog (커스텀 modal). Alert.alert 대신.
 *
 * §0-2 light-only mode:
 *   - dark: className 0.
 *   - useColorScheme 호출 0.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *   - LightBackHeader inline (favorites/wine-story 동일 패턴).
 *
 * RN deviation (§6 박제):
 *   - #3 PageTitle 제거 (§10 C — title 중복 회피)
 *   - #4 anonymous_display 첫 글자 단일 영문 (ko/en 분리 X)
 *   - #5 badges 빈 배열 (§10 D)
 *   - #6 LevelProgressBar `<button>` → Pressable
 *   - #8 transition CSS → 정적
 *   - #9 linear-gradient → expo-linear-gradient (BarFill)
 *   - #10 boxShadow 생략 (overflow:hidden Track 안에서 시각 영향 미미)
 *   - #11 display:grid → flex-row + gap (StatGrid)
 *   - #15 loading skeleton 정적
 *   - #16 unauthenticated EmptyState 신규
 *
 * §4-5 anonymization:
 *   - raw UUID 노출 X — `profile.id` Text 자식 어디서도 X.
 *   - DisplayName / Avatar initial 모두 `profile.anonymous_display` 만 사용.
 *
 * §4-10 CSS Yoga deviation 사전 점검:
 *   - 음수 margin / position:sticky / display:grid (StatGrid에서 변환됨) / backdrop-filter / radius:9999 부재.
 */
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ChevronLeft,
  UserX,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import { signOut } from '@/lib/auth';
import { useProfile } from '@/hooks/use-profile';
import { useProfileStats } from '@/hooks/use-profile-stats';
import { ProfileHero } from '@/components/profile/profile-hero';
import { StatGrid } from '@/components/profile/stat-grid';
import { QuickLinks } from '@/components/profile/quick-links';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Toast } from '@/components/shared/toast';

type Level = 1 | 2 | 3 | 4 | 5;

function clampLevel(value: number): Level {
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return value as Level;
}

interface ToastState {
  message: string;
  key: number;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
  } = useProfile();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useProfileStats();

  const [refreshing, setRefreshing] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    const key = Date.now();
    setToast({ message, key });
    setTimeout(() => {
      setToast((prev) => (prev && prev.key === key ? null : prev));
    }, 2500);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshStats()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile, refreshStats]);

  // §10 G: ranking 라우트 v0.2.0 보류.
  const handlePressRankingDetail = useCallback(() => {
    showToast(t('profile.comingSoonToast'));
  }, [showToast, t]);

  // QuickLinks handlers (§10 I)
  const handleFavorites = useCallback(() => {
    router.push('/favorites');
  }, []);
  const handleBadges = useCallback(() => {
    showToast(t('profile.comingSoonToast'));
  }, [showToast, t]);
  const handleNotifications = useCallback(() => {
    showToast(t('profile.comingSoonToast'));
  }, [showToast, t]);
  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, []);
  const handleSignOutTrigger = useCallback(() => {
    setSignOutVisible(true);
  }, []);

  const handleSignOutCancel = useCallback(() => {
    setSignOutVisible(false);
  }, []);

  const handleSignOutConfirm = useCallback(async () => {
    setSigningOut(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => undefined,
      );
      await signOut();
      setSignOutVisible(false);
      // 토스트 표시 후 onboarding으로 이동
      showToast(t('profile.signOutToast'));
      router.replace('/onboarding/1-welcome');
    } catch (err) {
      console.warn('[profile] signOut failed:', err);
      setSignOutVisible(false);
    } finally {
      setSigningOut(false);
    }
  }, [showToast, t]);

  const isLoading = profileLoading || statsLoading;
  const combinedError = profileError ?? statsError;

  // §2-5 error
  if (combinedError && !isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('profile.title')} />
        <ErrorView
          message={combinedError.message}
          onRetry={() => {
            void handleRefresh();
          }}
        />
      </View>
    );
  }

  // §2-2 loading (initial)
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('profile.title')} />
        <LoadingPlaceholder />
      </View>
    );
  }

  // §2-4 unauthenticated
  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('profile.title')} />
        <UnauthView
          onCta={() => {
            router.push('/onboarding/1-welcome');
          }}
        />
      </View>
    );
  }

  // §2-1 default
  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('profile.title')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={light.border.active}
          />
        }
      >
        <ProfileHero
          anonymousDisplay={profile.anonymous_display}
          levelId={clampLevel(profile.level)}
          xp={profile.xp}
          joinedAt={profile.created_at}
          onPressRankingDetail={handlePressRankingDetail}
        />
        <StatGrid
          winesTasted={stats.winesTasted}
          countriesExplored={stats.countriesExplored}
          regionsExplored={stats.regionsExplored}
          notesCount={stats.notesCount}
        />
        <QuickLinks
          onFavorites={handleFavorites}
          onBadges={handleBadges}
          onNotifications={handleNotifications}
          onSettings={handleSettings}
          onSignOut={handleSignOutTrigger}
        />
      </ScrollView>

      {/* SignOut confirm — §10 O */}
      <ConfirmDialog
        visible={signOutVisible}
        title={t('profile.signOutConfirm.title')}
        description={t('profile.signOutConfirm.desc')}
        confirmLabel={t('profile.signOutConfirm.confirm')}
        cancelLabel={t('profile.signOutConfirm.cancel')}
        onConfirm={() => {
          void handleSignOutConfirm();
        }}
        onCancel={handleSignOutCancel}
        destructive
      />

      {/* Toast — coming soon / sign out success */}
      {toast ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 32,
          }}
        >
          <Toast message={toast.message} tone="info" />
        </View>
      ) : null}

      {/* signOut in-flight — 단순 dim 차단 */}
      {signingOut ? (
        <View
          pointerEvents="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(42, 26, 20, 0.20)',
          }}
        />
      ) : null}
    </View>
  );
}

// ---- Inline light-only BackHeader (사양 §0-2, wine-story.tsx 동일 패턴) ----

interface LightBackHeaderProps {
  title: string;
}

function LightBackHeader({ title }: LightBackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top,
        height: insets.top + 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          marginRight: 12,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 19.2,
          color: light.text.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

// ---- Loading placeholder (§2-2 정적 skeleton — §6-15 shimmer X) ----

function LoadingPlaceholder() {
  const { t } = useTranslation();
  const skeletonBg = 'rgba(139, 119, 102, 0.18)';
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('common.loading')}
      style={{ flex: 1, paddingTop: 8 }}
    >
      {/* Hero skeleton */}
      <View
        style={{
          marginHorizontal: 16,
          height: 180,
          borderRadius: 18,
          backgroundColor: skeletonBg,
        }}
      />
      {/* StatGrid skeleton — 4 column */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginHorizontal: 16,
          marginTop: 12,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 60,
              borderRadius: 12,
              backgroundColor: skeletonBg,
            }}
          />
        ))}
      </View>
      {/* QuickLinks skeleton — 5 row */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              height: 50,
              borderRadius: 12,
              backgroundColor: skeletonBg,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ---- Unauthenticated view (§2-4 — §6 #16 신규) ----

interface UnauthViewProps {
  onCta: () => void;
}

function UnauthView({ onCta }: UnauthViewProps) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <View style={{ opacity: 0.7 }}>
        <UserX size={56} strokeWidth={1.25} color={light.text.muted} />
      </View>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 18,
          lineHeight: 23.4,
          color: light.text.primary,
          textAlign: 'center',
        }}
      >
        {t('profile.unauth.title')}
      </Text>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 13,
          lineHeight: 19.5,
          color: light.text.muted,
          textAlign: 'center',
        }}
      >
        {t('profile.unauth.desc')}
      </Text>
      <Pressable
        onPress={onCta}
        accessibilityRole="button"
        accessibilityLabel={t('profile.unauth.cta')}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          marginTop: 4,
        })}
      >
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: light.border.active,
            backgroundColor: brand.cream,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 13,
              color: light.border.active,
            }}
          >
            {t('profile.unauth.cta')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ---- Error view (§2-5) ----

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontWeight: '600',
          fontSize: 18,
          lineHeight: 23.4,
          color: light.text.primary,
          textAlign: 'center',
        }}
      >
        {t('profile.error.title')}
      </Text>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          lineHeight: 18,
          color: light.text.muted,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          marginTop: 4,
        })}
      >
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: light.border.active,
            backgroundColor: brand.cream,
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 13,
              color: light.border.active,
            }}
          >
            {t('common.retry')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
