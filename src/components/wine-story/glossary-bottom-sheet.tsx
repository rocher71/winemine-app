/**
 * GlossaryBottomSheet — wine-story 본문 inline (i) 트리거 시 열리는 시트.
 *
 * 사양: _workspace/design-specs/wine-story.md §4-2 + §6 #6.
 *
 * keyscreen `<GlossaryTooltip>` (popover with framer-motion) → RN BottomSheet 모달 변환.
 * 패턴 reference: src/components/notes/cellar-bottom-sheet.tsx.
 *
 * Light-only 화면 — 모든 색은 light.* 또는 brand.* 토큰. surfaceBg 는 light.bg.surface 고정.
 *
 * 내용 구조:
 *   - DragHandle (gold)
 *   - title: entry.term (Playfair 18 primary)
 *   - definition: Inter 14 lh 22.4 secondary
 *   - (optional) examples: Inter 13 lh 19.5 muted italic
 *   - (optional) source: Inter 11 muted (관용 footer)
 *   - close 버튼: Inter 13 600 gold (시각 가벼움 — 닫기는 backdrop/drag 가 primary)
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { getGlossaryEntry } from '@/lib/glossary/builtin';

interface GlossaryBottomSheetProps {
  open: boolean;
  termId: string | null;
  onClose: () => void;
}

export function GlossaryBottomSheet({
  open,
  termId,
  onClose,
}: GlossaryBottomSheetProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const sheetRef = useRef<BottomSheet>(null);

  const entry = termId ? getGlossaryEntry(termId) : null;

  const snapPoints = useMemo(() => ['55%'], []);
  const scrollMaxHeight = useMemo(
    () => Dimensions.get('window').height * 0.4,
    [],
  );

  useEffect(() => {
    if (open && entry) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open, entry]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
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

  if (!entry) {
    // termId 가 잠시 null 이거나 매칭 entry 가 없는 경우 안전 렌더.
    return null;
  }

  const termText = entry.term[locale] ?? entry.term.en;
  const defText = entry.definition[locale] ?? entry.definition.en;
  const exampleText = entry.examples
    ? entry.examples[locale] ?? entry.examples.en
    : null;
  const sourceText = entry.source
    ? entry.source[locale] ?? entry.source.en
    : null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: light.bg.surface }}
      handleIndicatorStyle={{
        backgroundColor: brand.gold,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
      accessible
      accessibilityRole="none"
      accessibilityLabel={termText}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
          gap: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
            lineHeight: 21.6,
            color: light.text.primary,
          }}
        >
          {termText}
        </Text>

        <BottomSheetScrollView
          style={{ maxHeight: scrollMaxHeight }}
          contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 22.4,
              color: light.text.secondary,
            }}
          >
            {defText}
          </Text>

          {exampleText ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 19.5,
                color: light.text.muted,
                fontStyle: 'italic',
              }}
            >
              {exampleText}
            </Text>
          ) : null}

          {sourceText ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 11,
                lineHeight: 13.2,
                color: light.text.muted,
              }}
            >
              {sourceText}
            </Text>
          ) : null}
        </BottomSheetScrollView>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('wineStory.glossary.close')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            alignSelf: 'flex-end',
          })}
          hitSlop={8}
        >
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 13,
                fontWeight: '600',
                color: light.border.active,
              }}
            >
              {t('wineStory.glossary.close')}
            </Text>
          </View>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
