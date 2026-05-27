import '../global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { initI18n, changeLanguage, type AppLocale } from '@/lib/i18n';
import { signInAnonymouslyIfNeeded, getCurrentUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { brand } from '@/lib/design-tokens';

// Freesentation 로컬 폰트 — Inter + Playfair 대체 (4/5/6/7 weight).
// Italic 폰트 없으므로 4Regular로 fallback.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* preventAutoHideAsync may reject if called too late — non-fatal. */
});

export default function RootLayout() {
  const [bootstrapped, setBootstrapped] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    // Korean UI font (4~7 weight)
    Freesentation_4Regular:  require('../assets/fonts/Freesentation-4Regular.ttf'),
    Freesentation_5Medium:   require('../assets/fonts/Freesentation-5Medium.ttf'),
    Freesentation_6SemiBold: require('../assets/fonts/Freesentation-6SemiBold.ttf'),
    Freesentation_7Bold:     require('../assets/fonts/Freesentation-7Bold.ttf'),
    // English UI fonts (locale='en' + 워드마크 고정 사용)
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  const fontsReady = fontsLoaded;

  useEffect(() => {
    if (fontError) console.warn('[winemine] Font load error:', fontError);
  }, [fontError]);

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
          {/* Stack routes (BottomNav 비표시) — bottom-nav.md §1-3, Q1 결정 (b)
           * notes/ 와 settings/ 는 디렉토리. 각 sub-route를 명시 등록. expo-router는
           * Stack.Screen name="notes" 같은 디렉토리 단일 등록은 매칭 못 함 (warning 발생). */}
          <Stack.Screen name="notes/index" />
          <Stack.Screen name="notes/new" />
          <Stack.Screen name="notes/new/write" />
          <Stack.Screen name="notes/[noteId]" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/language" />
          <Stack.Screen name="settings/experience" />
          <Stack.Screen name="settings/appearance" />
          <Stack.Screen name="cellar/[lwin]" />
          <Stack.Screen name="cellar/lists/[id]/index" />
          <Stack.Screen name="cellar/lists/[id]/edit" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="cellar/lists/create" options={{ presentation: 'modal' }} />
          <Stack.Screen name="wine/[lwin]" />
          {/* glossary 그룹 — 자체 _layout.tsx 가 있는 디렉토리 라우트.
           * 단일 등록 가능 (notes/settings 처럼 sub-route 명시 불필요 — _layout 있는 경우). */}
          <Stack.Screen name="glossary" />
          {/* community/[postId] 그룹 — 자체 _layout.tsx 가 있는 디렉토리 라우트.
           * 포스트 상세 + 댓글 화면. */}
          <Stack.Screen name="community/[postId]" />
          {/* community/new 그룹 — 글 작성 (intro + column + album). */}
          <Stack.Screen name="community/new/index" />
          <Stack.Screen name="community/new/column" />
          <Stack.Screen name="community/new/album" />
          {/* community 부가 화면. */}
          <Stack.Screen name="community/tonight" />
          <Stack.Screen name="community/discover" />
          <Stack.Screen name="community/templates" />
          {/* knowledge 상세 화면 — 레슨/지역/와이너리/빈티지 */}
          <Stack.Screen name="knowledge/lesson/[lessonId]" />
          <Stack.Screen name="knowledge/lesson/[lessonId]/done" />
          <Stack.Screen name="knowledge/lesson/history" />
          <Stack.Screen name="knowledge/region/[regionId]" />
          <Stack.Screen name="knowledge/winery/[wineryId]" />
          <Stack.Screen name="knowledge/winery/[wineryId]/lineup" />
          <Stack.Screen name="knowledge/vintage/[vintageId]" />
          <Stack.Screen name="knowledge/vintage/compare" />
          <Stack.Screen name="knowledge/vintage/[regionId]/chart" />
          {/* P3 화면 — favorites, profile, notifications */}
          <Stack.Screen name="favorites/index" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="notifications/index" />
          {/* wine 서브 라우트 — story, prices, community-peak */}
          <Stack.Screen name="wine/[lwin]/story" />
          <Stack.Screen name="wine/[lwin]/prices" />
          <Stack.Screen name="wine/[lwin]/community-peak" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
