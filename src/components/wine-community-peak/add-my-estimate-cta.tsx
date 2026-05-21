/**
 * AddMyEstimateCta — wine-community-peak 화면 하단 fixed CTA.
 *
 * 사양: wine-community-peak.md §3-6 + §6 #11~16.
 *
 * §10 결정 F: keyscreen verbatim mock toast — 실제 BottomSheet 폼은 v0.2.0.
 * §10 H (b): locked text color = light.text.primary (접근성 우선 — cream 위 disabled bg 1.61:1 [NO]).
 * §6 #11: bottom 80 (BottomNav 위) → bottom 16 + insets.bottom (RN tabs 외부).
 * §6 #12: allowed=false 여도 onPress 호출 가능 — disabled=true 시 toast 안내.
 *
 * §4-11 3-layer Pressable 패턴:
 *   - outer Pressable: hit only (opacity press feedback).
 *   - inner View: layout/visual (size, bg, shadow, gap).
 *
 * Light-only — wine-community-peak.md §0-2.
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Lock, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import { Toast } from '@/components/shared/toast';

interface AddMyEstimateCtaProps {
  /** 현재 사용자의 levelId (0~5). L3+ 만 allowed=true. */
  userLevelId: number;
}

export function AddMyEstimateCta({ userLevelId }: AddMyEstimateCtaProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const allowed = userLevelId >= 3;
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'info' | 'success' | 'error'>(
    'info',
  );

  const showToast = (
    message: string,
    tone: 'info' | 'success' | 'error',
  ) => {
    setToastMsg(message);
    setToastTone(tone);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handlePress = () => {
    if (!allowed) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      ).catch(() => undefined);
      showToast(t('wineCommunityPeak.cta.locked.toast'), 'info');
      return;
    }
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    // §10 F (a): mock toast — 실제 BottomSheet 폼은 v0.2.0.
    showToast(t('wineCommunityPeak.cta.add.toast'), 'success');
  };

  return (
    <>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: 16 + insets.bottom,
          left: 16,
          right: 16,
          zIndex: 5,
        }}
      >
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityState={{ disabled: !allowed }}
          accessibilityLabel={
            allowed
              ? t('wineCommunityPeak.cta.add.label')
              : t('wineCommunityPeak.cta.locked.label')
          }
          accessibilityHint={
            allowed
              ? t('wineCommunityPeak.cta.add.hint')
              : t('wineCommunityPeak.cta.locked.hint')
          }
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              backgroundColor: allowed ? brand.wineRed : light.text.disabled,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: allowed ? 1 : 0.85,
              // shadow (allowed only) — §6 #11 wineRed glow.
              ...(allowed
                ? {
                    shadowColor: brand.wineRed,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.45,
                    shadowRadius: 18,
                    elevation: 6,
                  }
                : {
                    elevation: 0,
                  }),
            }}
          >
            {allowed ? (
              <Plus size={18} strokeWidth={2} color={brand.cream} />
            ) : (
              <Lock
                size={16}
                strokeWidth={2}
                // §10 H (b): locked icon 도 light.text.primary (접근성).
                color={light.text.primary}
              />
            )}
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontWeight: '600',
                // §10 G (a): locked 한국어 길이 → fontSize 축소.
                fontSize: allowed ? 15 : 13,
                // §10 H (b): locked 시 light.text.primary (접근성 우선).
                color: allowed ? brand.cream : light.text.primary,
                lineHeight: allowed ? 20 : 16,
              }}
            >
              {allowed
                ? t('wineCommunityPeak.cta.add.label')
                : t('wineCommunityPeak.cta.locked.label')}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Toast — CTA 위 (bottom 88 = CTA height 52 + spacing 20 + insets) */}
      {toastMsg ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16 + insets.bottom + 52 + 12,
            zIndex: 6,
          }}
        >
          <Toast message={toastMsg} tone={toastTone} />
        </View>
      ) : null}
    </>
  );
}
