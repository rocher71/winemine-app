import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';
import { OptionCard } from '@/components/shared/option-card';
import { Toast } from '@/components/shared/toast';
import { OnboardingStep } from '@/components/onboarding/onboarding-step';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { setOnboarded } from '@/lib/onboarded';

type Mode = 'first-time' | 'heavy';

export default function ModeStep() {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<Mode | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const choose = (value: Mode) => {
    setPicked(value);
    if (errorMsg) setErrorMsg(null);
  };

  const finish = async () => {
    if (!picked) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('no session');
      const { error } = await supabase.from('profiles').update({ mode: picked }).eq('id', uid);
      if (error) throw error;
      await setOnboarded();
      router.replace('/(tabs)');
    } catch (err) {
      console.warn('[onboarding] mode update failed:', err);
      setErrorMsg(t('errors.onboardingSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingStep
      step={4}
      title={t('onboarding.mode.title')}
      subtitle={t('onboarding.mode.subtitle')}
      footer={
        <View className="gap-3">
          {errorMsg ? <Toast message={errorMsg} tone="error" /> : null}
          <PrimaryButton
            label={t('onboarding.mode.finish')}
            size="lg"
            disabled={!picked}
            loading={saving}
            onPress={finish}
          />
        </View>
      }
    >
      <View className="gap-3">
        <OptionCard
          title={t('mode.firstTime')}
          description={t('onboarding.mode.firstTimeDescription')}
          selected={picked === 'first-time'}
          onPress={() => choose('first-time')}
        />
        <OptionCard
          title={t('mode.heavy')}
          description={t('onboarding.mode.heavyDescription')}
          selected={picked === 'heavy'}
          onPress={() => choose('heavy')}
        />
      </View>
    </OnboardingStep>
  );
}
