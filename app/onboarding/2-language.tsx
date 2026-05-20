import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';
import { OptionCard } from '@/components/shared/option-card';
import { Toast } from '@/components/shared/toast';
import { OnboardingStep } from '@/components/onboarding/onboarding-step';
import { changeLanguage, type AppLocale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';

export default function LanguageStep() {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<AppLocale | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const choose = (locale: AppLocale) => {
    setPicked(locale);
    changeLanguage(locale);
    if (errorMsg) setErrorMsg(null);
  };

  const next = async () => {
    if (!picked) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('no session');
      const { error } = await supabase.from('profiles').update({ language: picked }).eq('id', uid);
      if (error) throw error;
      router.push('/onboarding/3-experience');
    } catch (err) {
      console.warn('[onboarding] language update failed:', err);
      setErrorMsg(t('errors.onboardingSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingStep
      step={2}
      title={t('onboarding.language.title')}
      subtitle={t('onboarding.language.subtitle')}
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
          title={t('language.ko')}
          selected={picked === 'ko'}
          onPress={() => choose('ko')}
        />
        <OptionCard
          title={t('language.en')}
          selected={picked === 'en'}
          onPress={() => choose('en')}
        />
      </View>
    </OnboardingStep>
  );
}
