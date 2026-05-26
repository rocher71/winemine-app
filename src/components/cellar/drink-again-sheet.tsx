/**
 * DrinkAgainSheet — "또 마셨어요" 흐름의 노트 작성 유도 바텀시트.
 *
 * UX 결정: ux-decisions/cellar-tasted-tab.md Decision 3.
 * cellar-bottom-sheet.tsx 패턴 참고 (BottomSheet, backdrop, snapPoints).
 *
 * 흐름:
 *   1. History Page CTA "또 마셨어요" 탭 → insertDrinkAgain(lwin) → 새 cellar_item.id
 *   2. 이 시트 오픈 ("테이스팅 노트를 작성할까요?")
 *   3. [노트 작성하기] → onWriteNote(cellarItemId) / [나중에] → onClose()
 */
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/shared/primary-button';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  open: boolean;
  /** insertDrinkAgain 반환값 — onWriteNote에 전달할 새 cellar_item.id */
  cellarItemId: string | null;
  onClose: () => void;
  onWriteNote: (cellarItemId: string) => void;
}

export function DrinkAgainSheet({ open, cellarItemId, onClose, onWriteNote }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const sheetRef = useRef<BottomSheet>(null);
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;

  const snapPoints = useMemo(() => ['35%'], []);

  useEffect(() => {
    if (open) {
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

  const handleWriteNote = useCallback(() => {
    if (cellarItemId) onWriteNote(cellarItemId);
  }, [cellarItemId, onWriteNote]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: surfaceBg }}
      handleIndicatorStyle={{
        backgroundColor: brand.gold,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
      accessible
      accessibilityRole="none"
      accessibilityLabel={t('cellar.drinkAgainSheet.title')}
    >
      <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 }}>
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{ fontSize: 18, lineHeight: 24 }}
        >
          {t('cellar.drinkAgainSheet.title')}
        </Text>

        <View style={{ gap: 10 }}>
          <PrimaryButton
            label={t('cellar.drinkAgainSheet.writeNote')}
            size="lg"
            variant="primary"
            onPress={handleWriteNote}
          />
          <PrimaryButton
            label={t('cellar.drinkAgainSheet.later')}
            size="lg"
            variant="ghost"
            onPress={onClose}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
