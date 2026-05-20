/**
 * Home Screen — '/' (BottomNav 홈 탭).
 *
 * 사양 home.md §1, §2 verbatim 변환. retroactive hardening (2026-05-20).
 *  - SafeAreaView edges=['top'] (HomeHeader가 insets 처리)
 *  - HomeHeader (logo + bell + LevelChip/Avatar) — title 텍스트 없음
 *  - mode 분기: heavy → HeavyHome (8섹션) / first-time → FirstTimeHome (4섹션)
 *  - 진입 가드 (사양 §1, §1 a14): first-time + !onboardingComplete → /onboarding redirect
 *  - loading 시 ActivityIndicator + HomeHeader(first-time fallback)
 */
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { HomeHeader } from '@/components/home/home-header';
import { FirstTimeHome } from '@/components/home/first-time-home';
import { HeavyHome } from '@/components/home/heavy-home';
import { useProfile } from '@/hooks/use-profile';
import { brand } from '@/lib/design-tokens';
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
  // 한글이면 첫 글자, 영어면 첫 알파벳 대문자.
  return trimmed.charAt(0);
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile, loading } = useProfile();

  // 진입 가드 — 사양 §1, §1 a14
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

  if (loading) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <HomeHeader mode="first-time" levelId={1} displayInitial="?" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  const rawDisplay = profile?.anonymous_display ?? null;
  const localizedDisplay = rawDisplay
    ? currentLocale() === 'ko'
      ? localizeAnonymousDisplay(rawDisplay)
      : rawDisplay
    : t('home.anonymousFallback');
  const mode = profile?.mode ?? 'first-time';
  const levelId = toLevelId(profile?.level);
  const displayInitial = initialOf(localizedDisplay);

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <HomeHeader
        mode={mode === 'heavy' ? 'heavy' : 'first-time'}
        levelId={levelId}
        displayInitial={displayInitial}
      />
      {mode === 'heavy' ? (
        <HeavyHome displayName={localizedDisplay} />
      ) : (
        <FirstTimeHome displayName={localizedDisplay} />
      )}
    </View>
  );
}
