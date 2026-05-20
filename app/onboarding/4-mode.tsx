/**
 * /onboarding/4-mode — 사용 모드 선택 step (retroactive hardening v1).
 *
 * 사양: _workspace/design-specs/onboarding-4-mode.md (v1 retroactive)
 * 1차 디자인 리뷰: _workspace/design-review_onboarding-4-mode_20260521_025433.md (FAIL 5 — a/b/d/e/f)
 *
 * 1차 리뷰 FAIL 해소 (5/5):
 *  (a) 요소 누락:
 *      - a-1: wrapper `OnboardingStep` → `OnboardingStepLayout` 교체 (step 2/3와 일관)
 *      - a-2: progress eyebrow "4 / 4" 제거 (wrapper 교체로 자동 해결)
 *      - a-3: `OptionCard` → 신규 `ModeChoiceCard` 교체 (좌측 Lucide Sparkles/BookOpen + 2-tier 텍스트)
 *      - a-4: 사양 §11 요구 `mode-choice-card.tsx` 신규 작성 (ExperienceChoiceCard 패턴 mirror)
 *      - a-5: 좌측 Lucide icon (Sparkles for first-time / BookOpen for heavy, size 24 strokeWidth 1.5 gold)
 *  (b) Spacing:
 *      - b-1: 카드 padding 16/16 → 18 사방 (ModeChoiceCard)
 *      - b-2: 카드 gap icon↔text 14 (ModeChoiceCard)
 *      - b-3: ChoiceList marginTop 8 (mt-2 추가)
 *      - b-4: 상단 영역 PageRoot 32/24/40 + StepRoot gap 16 (OnboardingStepLayout)
 *  (d) Corner radius: rounded-xl(12) → rounded-2xl(16) (ModeChoiceCard)
 *  (e) Typography:
 *      - e-1: Title Playfair 24/28.8 → Playfair 26 / lineHeight 31.2 (inline arbitrary, experience step 일관)
 *      - e-2: Subtitle text-card-body text-text-secondary → text-onboarding-step-subtitle text-text-muted
 *      - e-3: Card title Playfair 16 → Inter 600 16 (text-source-card-title) (ModeChoiceCard)
 *      - e-4: Card sub Inter 12 → Inter 13 (text-card-body) (ModeChoiceCard)
 *      - e-5: progress eyebrow "4 / 4" 제거 (wrapper 교체)
 *  (f) Color:
 *      - f-1: 카드 unselected border-text-disabled → border.default dual (ModeChoiceCard useColorScheme 분기)
 *      - f-2: 카드 unselected opacity 0.85 추가 (ModeChoiceCard)
 *      - f-3: subtitle text-text-secondary → text-text-muted (의미상 정합)
 *
 * 레이아웃 트리 (사양 §1 verbatim — StepExperience baseline 차용, 사양 §10 Q1 5-step 채택):
 *   OnboardingStepLayout (PageRoot 32/24/40 + StepRoot flex-1 gap 16)
 *   ├ Title    (Playfair 26 / lh 31.2 / text-primary — experience step과 동일, 사양 §10 Q4)
 *   ├ Subtitle (Inter 14 / text-muted — text-onboarding-step-subtitle)
 *   ├ ChoiceList (flex-col gap-3 mt-2)
 *   │ ├ ModeChoiceCard "first-time" (Sparkles + label + sub)
 *   │ └ ModeChoiceCard "heavy"      (BookOpen + label + sub)
 *   └ cta prop:
 *     ├ Toast (error 시)
 *     └ PrimaryButton primary lg (block) → profiles.update + setOnboarded() + router.replace('/(tabs)')
 *
 * 동작 (사양 §5):
 *  - ModeChoiceCard onPress → Haptics.selectionAsync + setPicked + errorMsg clear
 *  - PrimaryButton onPress (picked 있을 때만 활성) →
 *    setSaving + supabase profiles.update({mode}) + setOnboarded() + router.replace('/(tabs)')
 *    실패 시 errorMsg Toast (CTA 위)
 *
 * SCOPE-IN 결정 (호출자):
 *  - Q1 5-step 정식 채택 (사양 §10 Q1) — onboarding-3-experience Q1 해소.
 *  - Q5 ModeChoiceCard 분리 (b) 채택 — experience-choice-card / language-choice-card 짝 일관.
 *
 * Footer Text는 keyscreen ExperienceStep만 보유 — mode step 사양 §6 deviation 12로 의도적 제거
 * (subtitle "언제든 설정에서 바꿀 수 있습니다"에 이미 흡수).
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { ModeChoiceCard } from '@/components/onboarding/mode-choice-card';
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
    <OnboardingStepLayout
      cta={
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
      {/*
       * Title — Playfair 26 / lineHeight 31.2 (=1.2 ratio) / text-primary dual.
       * NW arbitrary inline (사양 §3-2 — 토큰 보류, experience step과 동일 사용처 2건).
       * `onboardingStepTitleSm` (Playfair 26/31.2) 토큰화는 P0 후속 cycle.
       */}
      <Text
        accessibilityRole="header"
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 26, lineHeight: 31.2 }}
      >
        {t('onboarding.mode.title')}
      </Text>

      {/* Subtitle — Inter 14 / text-muted dual (text-onboarding-step-subtitle) */}
      <Text className="font-inter text-onboarding-step-subtitle text-text-muted dark:text-text-muted">
        {t('onboarding.mode.subtitle')}
      </Text>

      {/* ChoiceList — flex-col gap 12, marginTop 8 (사양 §1 verbatim) */}
      <View className="gap-3 mt-2">
        <ModeChoiceCard
          variant="first-time"
          title={t('mode.firstTime')}
          sub={t('onboarding.mode.firstTimeDescription')}
          selected={picked === 'first-time'}
          onPress={() => choose('first-time')}
        />
        <ModeChoiceCard
          variant="heavy"
          title={t('mode.heavy')}
          sub={t('onboarding.mode.heavyDescription')}
          selected={picked === 'heavy'}
          onPress={() => choose('heavy')}
        />
      </View>

      {/*
       * Footer Text 없음 — 사양 §6 deviation 12.
       * keyscreen ExperienceStep는 "설정에서 언제든 변경할 수 있어요" footer 보유했으나,
       * mode step에서는 동일 안내가 subtitle("언제든 설정에서 바꿀 수 있습니다")에 이미 흡수.
       * 중복 회피 — 현재 RN 그대로.
       */}
    </OnboardingStepLayout>
  );
}
