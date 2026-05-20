/**
 * /onboarding/2-language — 언어 선택 step (retroactive hardening v1).
 *
 * 사양: _workspace/design-specs/onboarding-2-language.md (v1 retroactive)
 * 1차 디자인 리뷰: _workspace/design-review_onboarding-2-language_20260521_021458.md (FAIL 5)
 *
 * 1차 리뷰 FAIL 해소 (5/5):
 *  (a) 요소 누락:
 *      - a-1/2: IconBadge 44×44 + "KR"/"EN" Playfair 16 gold → LanguageChoiceCard 신규 컴포넌트
 *      - a-3:   opacity active ? 1 : 0.85 → LanguageChoiceCard inline style
 *      - a-4:   active border 2px (boxShadow ring deviation §6) → LanguageChoiceCard inline
 *      - a-5:   progress eyebrow "2 / 4" 제거 → OnboardingStep 사용 중단 + OnboardingStepLayout 사용
 *      - a-6:   i18n 키 `onboarding.language.{ko,en}` 추가 (ko/en JSON 2건씩) + t() 키 교체
 *  (b) Spacing: PageRoot padding 32/24/40, StepRoot gap 16, ChoiceList gap 12 + mt-2 (=8),
 *               ChoiceCard h-24 paddingHorizontal 18 — OnboardingStepLayout + ChoiceList 직접 구성
 *  (d) Corner radius: ChoiceCard rounded-xl(12) → rounded-2xl(16) — LanguageChoiceCard
 *  (e) Typography: Title 24→28 + Subtitle 13→14 + Choice 16→18 — 신규 토큰 onboarding-step-* 사용
 *  (f) Color: subtitle text-text-muted (secondary→muted), unselected border-default
 *
 * 레이아웃 트리 (사양 §1 verbatim):
 *   OnboardingStepLayout (PageRoot 32/24/40 + StepRoot flex-1 gap-4)
 *   ├ Title    (Playfair 28 / lh 33.6 / text-primary)
 *   ├ Subtitle (Inter 14 / text-muted)
 *   ├ ChoiceList (flex-col gap-3 mt-2)
 *   │ ├ LanguageChoiceCard "ko" (IconBadge KR + "한국어")
 *   │ └ LanguageChoiceCard "en" (IconBadge EN + "English")
 *   └ cta prop:
 *     ├ Toast (error 시)
 *     └ PrimaryButton primary lg (block) → profiles.update + router.push
 *
 * 동작 (사양 §5):
 *  - ChoiceCard onPress → Haptics.selectionAsync + setPicked + changeLanguage(locale) 즉시 적용
 *  - PrimaryButton onPress (picked 있을 때만 활성) →
 *    Haptics impact Light + setSaving + supabase profiles.update + router.push('/onboarding/3-experience')
 *  - 실패 시 errorMsg Toast (CTA 위)
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { LanguageChoiceCard } from '@/components/onboarding/language-choice-card';
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
      const { error } = await supabase
        .from('profiles')
        .update({ language: picked })
        .eq('id', uid);
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
    <OnboardingStepLayout
      cta={
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
      {/* Title — Playfair 28 / lh 33.6 / text-primary dual */}
      <Text
        accessibilityRole="header"
        className="font-playfair text-onboarding-step-title text-text-primary dark:text-text-primary"
      >
        {t('onboarding.language.title')}
      </Text>

      {/* Subtitle — Inter 14 / text-muted dual */}
      <Text className="font-inter text-onboarding-step-subtitle text-text-muted dark:text-text-muted">
        {t('onboarding.language.subtitle')}
      </Text>

      {/* ChoiceList — flex-col gap 12, marginTop 8 */}
      <View className="gap-3 mt-2">
        <LanguageChoiceCard
          locale="ko"
          title={t('onboarding.language.ko')}
          selected={picked === 'ko'}
          onPress={() => choose('ko')}
        />
        <LanguageChoiceCard
          locale="en"
          title={t('onboarding.language.en')}
          selected={picked === 'en'}
          onPress={() => choose('en')}
        />
      </View>
    </OnboardingStepLayout>
  );
}
