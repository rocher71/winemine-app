/**
 * /settings/experience — 와인 경험 선택 (beginner / expert)
 *
 * 출처: _workspace/design-specs/settings-experience.md
 *
 * 핵심 UX:
 * - 옵션 탭 → Haptics → 로컬 selected 즉시 갱신 (낙관적) → profile.experience UPDATE →
 *   Toast 표시 → 280ms 후 router.back()
 * - 실패 시: selected 롤백, Toast error, 머무름
 * - i18n 변경 없음 — 다음 노트 작성 화면 진입 시 새 experience 적용
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

type ExperienceLevel = 'beginner' | 'expert';

const BACK_DELAY_MS = 280;
const TOAST_DURATION_MS = 2500;

export default function ExperienceSettingsScreen() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  const initial: ExperienceLevel = (profile?.experience as ExperienceLevel) ?? 'beginner';
  const [selected, setSelected] = useState<ExperienceLevel>(initial);
  const [toast, setToast] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);

  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profile?.experience === 'beginner' || profile?.experience === 'expert') {
      setSelected(profile.experience);
    }
  }, [profile?.experience]);

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
    async (next: ExperienceLevel) => {
      if (next === selected) return;
      Haptics.selectionAsync().catch(() => undefined);

      const prev = selected;
      setSelected(next);

      try {
        const uid = await getCurrentUserId();
        if (!uid) throw new Error('no session');
        const { error } = await supabase
          .from('profiles')
          .update({ experience: next })
          .eq('id', uid);
        if (error) throw error;

        showToast('info', t('settings.experiencePage.appliedToast'));
        if (backTimerRef.current) clearTimeout(backTimerRef.current);
        backTimerRef.current = setTimeout(() => {
          router.back();
        }, BACK_DELAY_MS);
      } catch (err) {
        console.warn('[settings/experience] update failed:', err);
        setSelected(prev);
        showToast('error', t('errors.onboardingSaveFailed'));
      }
    },
    [selected, showToast, t],
  );

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={t('settings.experiencePage.title')} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      >
        <View className="mx-4 gap-2">
          <SettingsRadioRow
            label={t('settings.values.beginner')}
            description={t('settings.experiencePage.beginnerDesc')}
            selected={selected === 'beginner'}
            onPress={() => void apply('beginner')}
            accessibilityHint={t('settings.experiencePage.beginnerDesc')}
          />
          <SettingsRadioRow
            label={t('settings.values.expert')}
            description={t('settings.experiencePage.expertDesc')}
            selected={selected === 'expert'}
            onPress={() => void apply('expert')}
            accessibilityHint={t('settings.experiencePage.expertDesc')}
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
