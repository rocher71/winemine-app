/**
 * DrinkThisCta — Section 6: absolute fixed bottom + fade gradient + 풀폭 wine-red CTA.
 *
 * 사양: design-spec cellar-detail.md §2 line 150~162, §3-11.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 305~320 verbatim + drink-this-button.tsx.
 *
 * 구조:
 *   outer View (position absolute bottom 0 left 0 right 0 zIndex 10 pointerEvents box-none)
 *     LinearGradient (180deg, transparent → bg-deepest alpha 0.95, locations [0, 0.6])
 *       padding 12 16 18
 *       Pressable (full width, height 52, radius 14, bg wine-red, shadows.wineRedCardLg)
 *         flex-row items-center justify-center gap 8
 *         GlassWater icon 18 strokeWidth 1.75 cream
 *         label "이 와인 마시기" (Inter 15 600 cream)
 *
 * press → ConfirmDialog → confirm → onConfirm callback (status update + navigate).
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { GlassWater } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, cellarBottomFade, shadows } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface Props {
  /** confirm 후 호출되는 콜백 — 상위에서 status update + navigate */
  onConfirm: () => void | Promise<void>;
  /** loading state — Pressable disable + opacity 0.6 */
  disabled?: boolean;
  /**
   * true 시 ConfirmDialog를 생략하고 onConfirm 직접 호출 (N병 BottleCountSheet 흐름).
   * Decision 3: 멀티보틀 셀러에서 상위가 직접 흐름 제어.
   */
  skipConfirm?: boolean;
}

export function DrinkThisCta({ onConfirm, disabled = false, skipConfirm = false }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { scheme } = useThemeTokens();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fade = cellarBottomFade[scheme];

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (skipConfirm) {
      void onConfirm();
    } else {
      setConfirmOpen(true);
    }
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    await onConfirm();
  };

  return (
    <>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <LinearGradient
          colors={fade.colors as unknown as readonly [string, string]}
          locations={fade.locations as unknown as readonly [number, number]}
          start={fade.start}
          end={fade.end}
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            // bottom safe-area inset + 18px keyscreen verbatim
            paddingBottom: 18 + Math.max(0, insets.bottom),
          }}
        >
          <Pressable
            onPress={handlePress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={t('cellar.drinkThis')}
            accessibilityHint={t('cellar.detail.a11y.drinkThisHint')}
            style={({ pressed }) => ({
              opacity: disabled ? 0.6 : pressed ? 0.92 : 1,
            })}
          >
            <View
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                backgroundColor: brand.wineRed,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                ...shadows.wineRedCardLg,
              }}
            >
              <GlassWater size={18} strokeWidth={1.75} color={brand.cream} />
              <Text
                className="font-inter-semibold"
                style={{ fontSize: 15, lineHeight: 18, color: brand.cream }}
              >
                {t('cellar.drinkThis')}
              </Text>
            </View>
          </Pressable>
        </LinearGradient>
      </View>

      <ConfirmDialog
        visible={confirmOpen}
        title={t('cellar.drinkThisConfirm')}
        confirmLabel={t('common.yes')}
        cancelLabel={t('common.no')}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
