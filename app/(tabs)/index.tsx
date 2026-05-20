import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/nav/app-header';
import { LevelPill } from '@/components/shared/level-pill';
import { FirstTimeHome } from '@/components/home/first-time-home';
import { HeavyHome } from '@/components/home/heavy-home';
import { useProfile } from '@/hooks/use-profile';
import { brand } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { localizeAnonymousDisplay } from '@/lib/anonymize';

type LevelId = 1 | 2 | 3 | 4 | 5;

function toLevelId(level: number | undefined): LevelId {
  if (level && level >= 1 && level <= 5) return level as LevelId;
  return 1;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
        <AppHeader title={t('nav.home')} />
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

  const headerRight = (
    <View className="flex-row items-center gap-2">
      <LevelPill level={levelId} size="md" />
      <Text
        className="font-inter text-card-meta text-text-secondary dark:text-text-secondary"
        numberOfLines={1}
      >
        {localizedDisplay}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <AppHeader title={t('nav.home')} right={headerRight} />
      {mode === 'heavy' ? (
        <HeavyHome displayName={localizedDisplay} />
      ) : (
        <FirstTimeHome displayName={localizedDisplay} />
      )}
    </View>
  );
}
