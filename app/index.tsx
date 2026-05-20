import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { isOnboarded } from '@/lib/onboarded';
import { brand } from '@/lib/design-tokens';

type Destination = '/onboarding/1-welcome' | '/(tabs)';

export default function Index() {
  const [target, setTarget] = useState<Destination | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const done = await isOnboarded();
      if (cancelled) return;
      setTarget(done ? '/(tabs)' : '/onboarding/1-welcome');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
        <ActivityIndicator color={brand.gold} />
      </View>
    );
  }

  return <Redirect href={target} />;
}
