/**
 * AddMyPriceSheet — wine-prices 화면 BottomSheet 폼.
 *
 * 사양: wine-prices.md §3-6 + §6 #9~#13.
 *
 * 결정 (작업 요청):
 *   - F: mock submit + Toast (`console.log` + sheet close + reset). 실제 supabase insert 는 v0.2.0.
 *   - G: native Picker 미설치 → BottomSheet 내 inline store chip list (수평 scroll). 동일 패턴
 *     으로 date 는 TextInput (YYYY-MM-DD format hint + zod regex).
 *
 * §4-11 3-layer Pressable 패턴 (submit + store chip 선택).
 *
 * §5 zod 검증 — src/lib/schemas/add-price.ts 의 addPriceSchema 적용.
 *   - price: 정수 100 ~ 100_000_000.
 *   - storeId: STORES 중 1.
 *   - purchasedAt: YYYY-MM-DD regex.
 *
 * 패턴 reference: src/components/wine-story/glossary-bottom-sheet.tsx (BottomSheet 사용).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { STORES } from '@/lib/mock/stores';
import {
  addPriceSchema,
  firstAddPriceError,
} from '@/lib/schemas/add-price';

interface AddMyPriceSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msgKey: string, params: { xp: number }) => void;
  onError: (errMsgKey: string) => void;
  /** 화면 라우트 LWIN (mock submit log 용). */
  lwin: string | null;
}

export function AddMyPriceSheet({
  open,
  onClose,
  onSuccess,
  onError,
  lwin,
}: AddMyPriceSheetProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const sheetRef = useRef<BottomSheet>(null);

  const [price, setPrice] = useState('');
  const [storeId, setStoreId] = useState<string>(STORES[0]?.id ?? '');
  const [purchasedAt, setPurchasedAt] = useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );

  // sheet 닫힐 때 입력값 초기화 (다음 open 새 상태).
  useEffect(() => {
    if (!open) {
      setPrice('');
      setStoreId(STORES[0]?.id ?? '');
      setPurchasedAt(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const snapPoints = useMemo(() => ['70%'], []);
  const scrollMaxHeight = useMemo(
    () => Dimensions.get('window').height * 0.55,
    [],
  );

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

  const handleSubmit = () => {
    const parse = addPriceSchema.safeParse({ price, storeId, purchasedAt });
    if (!parse.success) {
      const { messageKey } = firstAddPriceError(parse.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => undefined,
      );
      onError(`winePrices.sheet.error.${messageKey}`);
      return;
    }
    // §10 F: mock submit. 실제 insert 는 v0.2.0.
    // eslint-disable-next-line no-console
    console.log('[AddMyPriceSheet] mock submit', {
      lwin,
      ...parse.data,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    onSuccess('winePrices.sheet.success', { xp: 5 });
  };

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
      accessibilityLabel={t('winePrices.sheet.title')}
    >
      <BottomSheetView
        style={{
          paddingTop: 8,
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 14,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_7Bold',
            fontSize: 22,
            fontWeight: '700',
            color: light.text.primary,
            margin: 0,
            lineHeight: 26.4,
          }}
        >
          {t('winePrices.sheet.title')}
        </Text>

        <ScrollView
          style={{ maxHeight: scrollMaxHeight }}
          contentContainerStyle={{ gap: 14, paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Field — Price */}
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                color: light.text.muted,
                lineHeight: 14,
              }}
            >
              {t('winePrices.sheet.field.price.label')}
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder={t('winePrices.sheet.field.price.placeholder')}
              placeholderTextColor={light.text.muted}
              accessibilityLabel={t('winePrices.sheet.field.price.label')}
              returnKeyType="next"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: light.bg.deep,
                borderWidth: 1,
                borderColor: light.border.default,
                borderRadius: 10,
                color: light.text.primary,
                fontSize: 14,
                fontFamily: 'Freesentation_4Regular',
              }}
            />
          </View>

          {/* Field — Store (inline chip list — §10 G fallback) */}
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                color: light.text.muted,
                lineHeight: 14,
              }}
            >
              {t('winePrices.sheet.field.store.label')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
              accessibilityRole="menu"
              accessibilityLabel={t('winePrices.sheet.field.store.label')}
            >
              {STORES.map((s) => {
                const active = s.id === storeId;
                const nameText = s.name[locale] ?? s.name.en;
                const branchText = s.branch
                  ? s.branch[locale] ?? s.branch.en
                  : null;
                const labelText = branchText
                  ? `${nameText} · ${branchText}`
                  : nameText;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => undefined);
                      setStoreId(s.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={labelText}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: active
                          ? light.border.active
                          : light.border.default,
                        borderRadius: 10,
                        backgroundColor: active
                          ? light.border.active
                          : light.bg.deep,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Freesentation_6SemiBold',
                          fontWeight: '600',
                          fontSize: 12,
                          color: active ? brand.cream : light.text.primary,
                          lineHeight: 14.4,
                        }}
                      >
                        {labelText}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Field — Date (YYYY-MM-DD TextInput) */}
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                color: light.text.muted,
                lineHeight: 14,
              }}
            >
              {t('winePrices.sheet.field.date.label')}
            </Text>
            <TextInput
              value={purchasedAt}
              onChangeText={setPurchasedAt}
              keyboardType="numbers-and-punctuation"
              placeholder="YYYY-MM-DD"
              placeholderTextColor={light.text.muted}
              accessibilityLabel={t('winePrices.sheet.field.date.label')}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              maxLength={10}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: light.bg.deep,
                borderWidth: 1,
                borderColor: light.border.default,
                borderRadius: 10,
                color: light.text.primary,
                fontSize: 14,
                fontFamily: 'Freesentation_4Regular',
              }}
            />
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel={t('winePrices.sheet.submit.a11yLabel')}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View
              style={{
                marginTop: 4,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: brand.wineRed,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Freesentation_6SemiBold',
                  fontWeight: '600',
                  fontSize: 14,
                  color: brand.cream,
                  lineHeight: 16.8,
                }}
              >
                {t('winePrices.sheet.submit.label')}
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
