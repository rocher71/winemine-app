/**
 * /settings/appearance — 외관 선택 (dark / light)
 *
 * 출처: _workspace/design-specs/settings-appearance.md
 *
 * 핵심 UX:
 * - 옵션 탭 → Haptics → NW colorScheme.set(next) 즉시 (화면 전체 색 분기) →
 *   profile.theme UPDATE → Toast 표시 → back 호출 안 함
 * - 실패 시: silent — NW 색은 유지, Toast error만 (사양 §5)
 *
 * 주의: DB 컬럼은 `theme` (CHECK in 'system' | 'dark' | 'light'). 본 화면은 사양상
 * 2개 옵션(dark/light)만 노출. system 옵션은 v0.2.0 검토.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colorScheme } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { BackHeader } from '@/components/nav/back-header';
import { Toast } from '@/components/shared/toast';
import { SettingsRadioRow } from '@/components/settings/settings-radio-row';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';

type AppearanceMode = 'dark' | 'light';

const TOAST_DURATION_MS = 2500;

function resolveInitial(profileTheme: string | null | undefined): AppearanceMode {
  if (profileTheme === 'light' || profileTheme === 'dark') return profileTheme;
  // profile.theme가 'system'이거나 비어있을 때 NW 현재값 fallback
  const nw = colorScheme.get();
  return nw === 'light' ? 'light' : 'dark';
}

export default function AppearanceSettingsScreen() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<AppearanceMode>(() => resolveInitial(profile?.theme));
  const [toast, setToast] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // profile fetch 후 동기화
  useEffect(() => {
    if (profile?.theme === 'dark' || profile?.theme === 'light') {
      setSelected(profile.theme);
    }
  }, [profile?.theme]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((tone: 'info' | 'error', message: string) => {
    setToast({ tone, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const apply = useCallback(
    async (next: AppearanceMode) => {
      if (next === selected) return;
      Haptics.selectionAsync().catch(() => undefined);

      // NW colorScheme 즉시 토글 — 화면 전체 색 분기
      colorScheme.set(next);
      setSelected(next);

      try {
        const uid = await getCurrentUserId();
        if (!uid) throw new Error('no session');
        const { error } = await supabase
          .from('profiles')
          .update({ theme: next })
          .eq('id', uid);
        if (error) throw error;

        showToast('info', t('settings.appearancePage.appliedToast'));
        // back 호출 없음 — 사용자가 색 변화를 확인하도록 머무름 (verbatim)
      } catch (err) {
        // silent 실패 — colorScheme은 유지, Toast error만
        console.warn('[settings/appearance] update failed:', err);
        showToast('error', t('errors.onboardingSaveFailed'));
      }
    },
    [selected, showToast, t],
  );

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={t('settings.appearancePage.title')} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      >
        <View className="mx-4 gap-2">
          <SettingsRadioRow
            label={t('settings.appearancePage.darkLabel')}
            description={t('settings.appearancePage.darkDesc')}
            selected={selected === 'dark'}
            onPress={() => void apply('dark')}
            accessibilityHint={t('settings.appearancePage.darkDesc')}
          />
          <SettingsRadioRow
            label={t('settings.appearancePage.lightLabel')}
            description={t('settings.appearancePage.lightDesc')}
            selected={selected === 'light'}
            onPress={() => void apply('light')}
            accessibilityHint={t('settings.appearancePage.lightDesc')}
          />
        </View>
      </ScrollView>

      {toast ? (
        <View className="absolute bottom-6 left-4 right-4">
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}
