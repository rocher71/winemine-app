/**
 * OnboardingStepLayout — keyscreen `<main>` PageRoot + StepRoot verbatim wrapper.
 *
 * 사양 onboarding-2-language.md §1 (line 32~64) + Q2 (b/c 채택):
 *   PageRoot: flex-1 / paddingTop: SafeArea.top + 32 / paddingBottom: SafeArea.bottom + 40 /
 *             paddingHorizontal 24 / gap 24 / bg-bg-deepest
 *   StepRoot: flex-1 / flex-column / gap 16
 *   CtaWrapper: mt-auto (children 자체 결정 — Title/Subtitle/Body 정적 stack 후 CTA 하단 push)
 *
 * step 2/3/4 (language/experience/mode) 공유 — step 1 (welcome)은 거의 동일하나 별도 구현
 * (가운데 정렬 워드마크 + Reanimated stagger).
 *
 * 본 컴포넌트는 기존 onboarding-step.tsx (progress eyebrow 강제 표시)를 대체하는 verbatim 변형.
 * 사양 §10 Q2: 본 cycle은 2-language만 적용. 3/4 step은 후속 cycle에서 마이그레이션.
 *
 * 토큰 사용: bg-bg-deepest (dual), 모든 spacing는 NW v4 표준 또는 사양 verbatim 수치.
 */
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ReactNode } from 'react';

interface OnboardingStepLayoutProps extends Pick<ViewProps, 'accessibilityLabel'> {
  /**
   * StepRoot children — Title / Subtitle / 본문 그룹. CTA는 `cta` prop으로 분리하여 mt-auto 위치 보장.
   */
  children: ReactNode;
  /**
   * CtaWrapper 내용 (PrimaryButton + Toast 등). mt-auto로 하단 push.
   */
  cta: ReactNode;
}

export function OnboardingStepLayout({ children, cta }: OnboardingStepLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-deepest dark:bg-bg-deepest"
      style={{
        paddingTop: insets.top + 32,
        paddingBottom: Math.max(insets.bottom, 0) + 40,
        paddingHorizontal: 24,
        gap: 24,
      }}
    >
      {/* StepRoot — flex-1 + gap 16. 자식이 Title/Subtitle/본문 단순 stack. */}
      <View className="flex-1" style={{ gap: 16 }}>
        {children}
      </View>

      {/* CtaWrapper — keyscreen verbatim marginTop:'auto'. PageRoot의 gap:24가 StepRoot ↔ CtaWrapper 사이 적용. */}
      <View className="w-full" style={{ marginTop: 'auto' }}>
        {cta}
      </View>
    </View>
  );
}
