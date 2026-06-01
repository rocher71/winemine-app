/**
 * Home Screen — '/' (BottomNav 홈 탭).
 *
 * Editorial Stack 재설계 (사양 home.md, 2026-06). mode 분기 제거 — 단일 피드 홈(HomeFeed).
 *  - SafeAreaView edges 처리: HomeHeader가 insets 처리
 *  - HomeHeader (logo + bell + LevelChip) — mode 분기 없이 항상 LevelChip
 *  - 진입 가드: first-time + !onboardingComplete → /onboarding redirect (mode 무관 보존)
 *  - scroll-aware sticky header (community 동일 패턴)
 */
import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeHeader } from '@/components/home/home-header';
import { HomeFeed } from '@/components/home/home-feed';
import { useProfile } from '@/hooks/use-profile';
import { currentLocale } from '@/lib/i18n';
import { localizeAnonymousDisplay } from '@/lib/anonymize';
import { isOnboarded } from '@/lib/onboarded';

type LevelId = 1 | 2 | 3 | 4 | 5;

function toLevelId(level: number | undefined): LevelId {
  if (level && level >= 1 && level <= 5) return level as LevelId;
  return 1;
}

function initialOf(name: string): string {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0);
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  // ── Scroll-aware header (community 탭 동일 패턴) ───────────────────────────
  const HEADER_HEIGHT = insets.top + 62;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    const THRESHOLD = 8;

    if (currentY <= 0) {
      if (!headerVisible.current) {
        headerVisible.current = true;
        Animated.timing(headerTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    } else if (diff > THRESHOLD && headerVisible.current) {
      headerVisible.current = false;
      Animated.timing(headerTranslateY, { toValue: -HEADER_HEIGHT, duration: 250, useNativeDriver: true }).start();
    } else if (diff < -THRESHOLD && !headerVisible.current) {
      headerVisible.current = true;
      Animated.timing(headerTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }

    lastScrollY.current = currentY;
  };
  // ──────────────────────────────────────────────────────────────────────────

  // 진입 가드 — mode 무관하게 보존 (사양 §현재 구현 차이: 진입 가드 유지)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const done = await isOnboarded();
      if (cancelled) return;
      const mode = profile?.mode;
      if (!done && (mode === 'first-time' || !mode)) {
        router.replace('/onboarding');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.mode]);

  const rawDisplay = profile?.anonymous_display ?? null;
  const localizedDisplay = rawDisplay
    ? currentLocale() === 'ko'
      ? localizeAnonymousDisplay(rawDisplay)
      : rawDisplay
    : t('home.anonymousFallback');
  const levelId = toLevelId(profile?.level);
  const displayInitial = initialOf(localizedDisplay);

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      {/* ── Scroll-aware 헤더 ── */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <HomeHeader levelId={levelId} displayInitial={displayInitial} />
      </Animated.View>

      <HomeFeed displayName={localizedDisplay} onScroll={handleScroll} paddingTop={HEADER_HEIGHT} />
    </View>
  );
}
