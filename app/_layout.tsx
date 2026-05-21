import '../global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  useFonts as usePlayfairFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { initI18n, changeLanguage, type AppLocale } from '@/lib/i18n';
import { signInAnonymouslyIfNeeded, getCurrentUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { brand } from '@/lib/design-tokens';

// Keep the native splash visible while fonts + auth/profile bootstrap.
// home spec §9 P0: PlayfairDisplay_400Regular_Italic is required for
// PeakGreeting wine name inline italic — system fake italic must not be used.
// Inter weights match tailwind.config.ts fontFamily mapping (400/500/600).
// Playfair weights cover: 400 Regular (font-playfair default), 700 Bold
// (LevelChip avatar + CommUserAvatar initial — see home spec §3-1, §3-6),
// 400 Italic (PeakGreeting wine name — home spec §9 P0).
SplashScreen.preventAutoHideAsync().catch(() => {
  /* preventAutoHideAsync may reject if called too late — non-fatal. */
});

export default function RootLayout() {
  const [bootstrapped, setBootstrapped] = useState(false);

  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [playfairLoaded, playfairError] = usePlayfairFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
  });

  const fontsReady = interLoaded && playfairLoaded;

  useEffect(() => {
    if (interError) console.warn('[winemine] Inter fonts failed to load:', interError);
    if (playfairError) console.warn('[winemine] Playfair fonts failed to load:', playfairError);
  }, [interError, playfairError]);

  useEffect(() => {
    let cancelled = false;
    // Default app theme = light. profile.theme이 명시되어 있으면 override.
    // (이전: OS scheme follow → dark 환경에서 첫 진입이 dark였음. 사용자 요청으로 light 기본.)
    colorScheme.set('light');
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
      if (!cancelled) setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = bootstrapped && fontsReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        /* hideAsync may reject if already hidden — non-fatal. */
      });
    }
  }, [ready]);

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
          {/* Stack routes (BottomNav 비표시) — bottom-nav.md §1-3, Q1 결정 (b) */}
          <Stack.Screen name="notes" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="cellar/[lwin]" />
          <Stack.Screen name="wine/[lwin]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
