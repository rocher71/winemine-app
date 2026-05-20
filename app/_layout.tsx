import '../global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { initI18n, changeLanguage, type AppLocale } from '@/lib/i18n';
import { signInAnonymouslyIfNeeded, getCurrentUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { brand } from '@/lib/design-tokens';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      initI18n('ko');
      try {
        await signInAnonymouslyIfNeeded();
        // Apply persisted user preferences (language + theme) from profiles.
        const uid = await getCurrentUserId();
        if (uid) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language, theme')
            .eq('id', uid)
            .maybeSingle();
          if (profile?.language === 'ko' || profile?.language === 'en') {
            changeLanguage(profile.language as AppLocale);
          }
          if (profile?.theme === 'dark' || profile?.theme === 'light' || profile?.theme === 'system') {
            colorScheme.set(profile.theme);
          }
        }
      } catch (err) {
        console.warn('[winemine] anonymous sign-in failed:', err);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-deepest dark:bg-bg-deepest">
        <ActivityIndicator color={brand.gold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
