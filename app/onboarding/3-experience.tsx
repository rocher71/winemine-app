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

type Experience = 'beginner' | 'expert';

export default function ExperienceStep() {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<Experience | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const choose = (value: Experience) => {
    setPicked(value);
    if (errorMsg) setErrorMsg(null);
  };

  const next = async () => {
    if (!picked) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('no session');
      const { error } = await supabase.from('profiles').update({ experience: picked }).eq('id', uid);
      if (error) throw error;
      router.push('/onboarding/4-mode');
    } catch (err) {
      console.warn('[onboarding] experience update failed:', err);
      setErrorMsg(t('errors.onboardingSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingStep
      step={3}
      title={t('onboarding.experience.title')}
      subtitle={t('onboarding.experience.subtitle')}
      footer={
        <View className="gap-3">
          {errorMsg ? <Toast message={errorMsg} tone="error" /> : null}
          <PrimaryButton
            label={t('common.next')}
            size="lg"
            disabled={!picked}
            loading={saving}
            onPress={next}
          />
        </View>
      }
    >
      <View className="gap-3">
        <OptionCard
          title={t('experience.beginner')}
          description={t('onboarding.experience.beginnerDescription')}
          selected={picked === 'beginner'}
          onPress={() => choose('beginner')}
        />
        <OptionCard
          title={t('experience.expert')}
          description={t('onboarding.experience.expertDescription')}
          selected={picked === 'expert'}
          onPress={() => choose('expert')}
        />
      </View>
    </OnboardingStep>
  );
}
