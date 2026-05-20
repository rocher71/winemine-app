/**
 * /onboarding/3-experience — 와인 경험 선택 step (retroactive hardening v1).
 *
 * 사양: _workspace/design-specs/onboarding-3-experience.md (v1 retroactive)
 * 1차 디자인 리뷰: _workspace/design-review_onboarding-3-experience_20260521_023233.md (FAIL 4 — a/b/d/e)
 *
 * 1차 리뷰 FAIL 해소 (4/4):
 *  (a) 요소 누락:
 *      - a-1: progress eyebrow "3 / 4" 제거 → OnboardingStep 사용 중단 + OnboardingStepLayout 사용
 *      - a-2/3: 좌측 Lucide icon (GlassWater/Award) + paddingTop 2 → ExperienceChoiceCard 신규
 *      - a-4: 2-tier 텍스트 (title 16 / sub 13 muted) → ExperienceChoiceCard
 *      - a-5: Footer 안내 문구 추가 → t('onboarding.experience.footer')
 *      - a-6: ChoiceList marginTop 8 → mt-2
 *      - a-7: unselected opacity 0.85 → ExperienceChoiceCard inline
 *      - a-8: accessibilityHint=sub → ExperienceChoiceCard
 *      - a-9: PageRoot/StepRoot wrapper → OnboardingStepLayout
 *      - a-10: unselected border-default dual → ExperienceChoiceCard useColorScheme 분기
 *  (b) Spacing: PageRoot 32/24/40, StepRoot gap 16, ChoiceList gap 12 mt-2, Card padding 18 사방, gap 14
 *      → OnboardingStepLayout + ExperienceChoiceCard
 *  (d) Corner radius: rounded-xl(12) → rounded-2xl(16) → ExperienceChoiceCard
 *  (e) Typography: Title 24→26 inline, Subtitle text-card-body→text-onboarding-step-subtitle,
 *      Card title Playfair 16→Inter 600 16 (text-source-card-title), Sub Inter 12→Inter 13 (text-card-body),
 *      Footer 12 muted → text-card-meta
 *
 * 레이아웃 트리 (사양 §1 verbatim):
 *   OnboardingStepLayout (PageRoot 32/24/40 + StepRoot flex-1 gap-4)
 *   ├ Title    (Playfair 26 / lh 31.2 / text-primary — language step 28과 다름, 사양 §10 Q4 verbatim 유지)
 *   ├ Subtitle (Inter 14 / text-muted)
 *   ├ ChoiceList (flex-col gap-3 mt-2)
 *   │ ├ ExperienceChoiceCard "beginner" (GlassWater + label + sub)
 *   │ └ ExperienceChoiceCard "expert"   (Award + label + sub)
 *   ├ Footer (Inter 12 / muted "설정에서 언제든 변경할 수 있어요")
 *   └ cta prop:
 *     ├ Toast (error 시)
 *     └ PrimaryButton primary lg (block) → profiles.update + router.push('/onboarding/4-mode')
 *
 * 동작 (사양 §5):
 *  - ExperienceChoiceCard onPress → Haptics.selectionAsync + setPicked (i18n changeLanguage 호출 안 함 — language step과 다름)
 *  - PrimaryButton onPress (picked 있을 때만 활성) →
 *    Haptics impact Light + setSaving + supabase profiles.update({experience}) + router.push('/onboarding/4-mode')
 *  - 실패 시 errorMsg Toast (CTA 위)
 *
 * SCOPE-IN 결정 (호출자):
 *  - Q1 5-step vs 4-step: 현재 RN 5-step 유지 (router.push('/onboarding/4-mode')).
 *  - Q4 title 26 vs 28: 사양 권장 26 채택 (language step 28과 의도적 차이 — keyscreen verbatim).
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { ExperienceChoiceCard } from '@/components/onboarding/experience-choice-card';
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
      const { error } = await supabase
        .from('profiles')
        .update({ experience: picked })
        .eq('id', uid);
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
      {/*
       * Title — Playfair 26 / lineHeight 31.2 (=1.2 ratio) / text-primary dual.
       * NW arbitrary inline arbitrary (사양 §3-2 — 토큰 보류, 단발 사용처).
       * language step 28과 의도적 차이 (keyscreen verbatim, 사양 §10 Q4).
       */}
      <Text
        accessibilityRole="header"
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 26, lineHeight: 31.2 }}
      >
        {t('onboarding.experience.title')}
      </Text>

      {/* Subtitle — Inter 14 / text-muted dual (text-onboarding-step-subtitle) */}
      <Text className="font-inter text-onboarding-step-subtitle text-text-muted dark:text-text-muted">
        {t('onboarding.experience.subtitle')}
      </Text>

      {/* ChoiceList — flex-col gap 12, marginTop 8 (사양 §1 verbatim) */}
      <View className="gap-3 mt-2">
        <ExperienceChoiceCard
          variant="beginner"
          title={t('onboarding.experience.beginnerLabel')}
          sub={t('onboarding.experience.beginnerSub')}
          selected={picked === 'beginner'}
          onPress={() => choose('beginner')}
        />
        <ExperienceChoiceCard
          variant="expert"
          title={t('onboarding.experience.expertLabel')}
          sub={t('onboarding.experience.expertSub')}
          selected={picked === 'expert'}
          onPress={() => choose('expert')}
        />
      </View>

      {/* Footer 안내 — Inter 12 / muted dual (text-card-meta) */}
      <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted">
        {t('onboarding.experience.footer')}
      </Text>
    </OnboardingStepLayout>
  );
}
