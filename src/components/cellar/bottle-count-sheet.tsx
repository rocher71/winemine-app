/**
 * BottleCountSheet — "몇 병을 여셨나요?" N-병 선택 시트.
 *
 * 사양: ux-decisions/cellar-cellared-tab.md Decision 3.
 *
 * 구조:
 *   BottomSheet ('50%', gold handle, backdrop 0.6)
 *   ├── Title (Playfair 18 — "몇 병을 여셨나요?")
 *   ├── Stepper row: [−] N [+]  (min 1, max = bottles owned)
 *   └── Confirm button (wine-red, full width)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, dark, light, shadows } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  open: boolean;
  maxCount: number;
  onConfirm: (count: number) => void | Promise<void>;
  onClose: () => void;
}

export function BottleCountSheet({ open, maxCount, onConfirm, onClose }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const [count, setCount] = useState(1);

  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderColor = scheme === 'light' ? light.border.default : dark.border.default;
  const textPrimary = scheme === 'light' ? light.text.primary : dark.text.primary;
  const textMuted = scheme === 'light' ? light.text.muted : dark.text.muted;

  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    if (open) {
      setCount(1);
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.6}
      />
    ),
    [],
  );

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1 && open) onClose();
    },
    [open, onClose],
  );

  const dec = () => {
    if (count <= 1) return;
    Haptics.selectionAsync().catch(() => undefined);
    setCount((n) => Math.max(1, n - 1));
  };

  const inc = () => {
    if (count >= maxCount) return;
    Haptics.selectionAsync().catch(() => undefined);
    setCount((n) => Math.min(maxCount, n + 1));
  };

  const handleConfirm = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    sheetRef.current?.close();
    await onConfirm(count);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: surfaceBg }}
      handleIndicatorStyle={{ backgroundColor: brand.gold, width: 36, height: 4, borderRadius: 2 }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 24,
          paddingBottom: 24 + insets.bottom,
          gap: 28,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 20,
            lineHeight: 24,
            color: textPrimary,
            marginTop: 8,
          }}
        >
          {t('cellar.drinkThisSkipConfirm')}
        </Text>

        {/* Stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          {/* Minus */}
          <View style={{ flex: 0 }}>
            <Pressable
              onPress={dec}
              disabled={count <= 1}
              accessibilityRole="button"
              accessibilityLabel="-1"
              style={({ pressed }) => ({ opacity: count <= 1 ? 0.3 : pressed ? 0.7 : 1 })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minus size={20} strokeWidth={2} color={textMuted} />
              </View>
            </Pressable>
          </View>

          {/* Count */}
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 48,
              lineHeight: 58,
              color: textPrimary,
              minWidth: 64,
              textAlign: 'center',
            }}
          >
            {count}
          </Text>

          {/* Plus */}
          <View style={{ flex: 0 }}>
            <Pressable
              onPress={inc}
              disabled={count >= maxCount}
              accessibilityRole="button"
              accessibilityLabel="+1"
              style={({ pressed }) => ({ opacity: count >= maxCount ? 0.3 : pressed ? 0.7 : 1 })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={20} strokeWidth={2} color={textMuted} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Confirm button */}
        <View style={{ flex: 0 }}>
          <Pressable
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel={t('common.done')}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <View
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: brand.wineRed,
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.wineRedCardLg,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  lineHeight: 18,
                  color: brand.cream,
                }}
              >
                {t('common.done')}
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
