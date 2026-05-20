/**
 * /settings/language — 언어 선택 (ko / en)
 *
 * 출처: _workspace/design-specs/settings-language.md
 *
 * 핵심 UX:
 * - 옵션 탭 → Haptics → i18n 즉시 전환 (낙관적) → profile.language UPDATE → Toast 표시 →
 *   250ms 후 router.back()
 * - 실패 시: i18n + selected 롤백, Toast error, 머무름
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { BackHeader } from '@/components/nav/back-header';
import { Toast } from '@/components/shared/toast';
import { SettingsRadioRow } from '@/components/settings/settings-radio-row';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { changeLanguage, currentLocale, type AppLocale } from '@/lib/i18n';

const BACK_DELAY_MS = 250;
const TOAST_DURATION_MS = 2500;

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  const initial: AppLocale = (profile?.language as AppLocale) ?? currentLocale();
  const [selected, setSelected] = useState<AppLocale>(initial);
  const [toast, setToast] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);

  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // profile fetch 후 selected 동기화 (mount 시 profile이 null → 이후 fetch 완료 시 갱신)
  useEffect(() => {
    if (profile?.language) {
      setSelected(profile.language as AppLocale);
    }
  }, [profile?.language]);

  // 언마운트 시 타이머 클린업
  useEffect(() => {
    return () => {
      if (backTimerRef.current) clearTimeout(backTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((tone: 'info' | 'error', message: string) => {
    setToast({ tone, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const apply = useCallback(
    async (next: AppLocale) => {
      if (next === selected) return;
      Haptics.selectionAsync().catch(() => undefined);

      const prev = selected;
      // 낙관적 업데이트: i18n + 로컬 selected 즉시 변경
      changeLanguage(next);
      setSelected(next);

      try {
        const uid = await getCurrentUserId();
        if (!uid) throw new Error('no session');
        const { error } = await supabase
          .from('profiles')
          .update({ language: next })
          .eq('id', uid);
        if (error) throw error;

        showToast('info', t('settings.languagePage.appliedToast'));
        // 250ms 후 자동 back
        if (backTimerRef.current) clearTimeout(backTimerRef.current);
        backTimerRef.current = setTimeout(() => {
          router.back();
        }, BACK_DELAY_MS);
      } catch (err) {
        console.warn('[settings/language] update failed:', err);
        // 롤백
        changeLanguage(prev);
        setSelected(prev);
        showToast('error', t('errors.onboardingSaveFailed'));
      }
    },
    [selected, showToast, t],
  );

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={t('settings.languagePage.title')} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      >
        <View className="mx-4 gap-2">
          <SettingsRadioRow
            label={t('settings.values.ko')}
            selected={selected === 'ko'}
            onPress={() => void apply('ko')}
            accessibilityHint={t('settings.languagePage.a11yHint')}
          />
          <SettingsRadioRow
            label={t('settings.values.en')}
            selected={selected === 'en'}
            onPress={() => void apply('en')}
            accessibilityHint={t('settings.languagePage.a11yHint')}
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
