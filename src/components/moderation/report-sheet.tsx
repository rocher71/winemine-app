/**
 * ReportSheet — 신고 사유 선택 바텀시트 (M3 moderation 공용 컴포넌트).
 *
 * 사양: _workspace/design-specs/moderation-report-sheet.md.
 *   - 모든 신고 진입점(post/comment/note/list/profile)이 공유.
 *   - 사유 6종 라디오 + other 선택 시 detail textarea(필수, maxLength 1000).
 *   - 제출 시 use-report → reports INSERT. UNIQUE 위반 → isDuplicate 인라인 안내(오류 아님).
 *   - 골격 1차 레퍼런스: src/components/cellar/visibility-sheet.tsx (BottomSheet + backdrop + PrimaryButton).
 *   - light-only mode (§0-2): 모든 색 light.* / brand.* inline.
 *
 * §4-11 Pressable 2-layer: ReasonRow = hit target(Pressable) + visual(inner View) 분리.
 * other 입력은 BottomSheetTextInput (키보드 회피 내장 — 일반 TextInput 은 시트를 가림, 사양 deviation 표).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Info } from 'lucide-react-native';
import { brand, light, radius, withAlpha } from '@/lib/design-tokens';
import { PrimaryButton } from '@/components/shared/primary-button';
import {
  useReport,
  type ReportReason,
  type ReportTargetType,
} from '@/hooks/use-report';

const REASONS: ReportReason[] = [
  'spam',
  'harassment',
  'sexual',
  'misinfo',
  'impersonation',
  'other',
];

const DETAIL_MAX = 1000;

interface ReportSheetProps {
  open: boolean;
  targetType: ReportTargetType;
  /** uuid — §4-5: UI Text 로 출력 금지. */
  targetId: string;
  onClose: () => void;
  /** 성공 후 부모 토스트 트리거용. */
  onSubmitted?: () => void;
}

export function ReportSheet({
  open,
  targetType,
  targetId,
  onClose,
  onSubmitted,
}: ReportSheetProps) {
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const { submit, loading } = useReport();

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [focused, setFocused] = useState(false);

  const snapPoints = useMemo(() => ['65%'], []);

  // open 토글 + 닫힐 때 상태 리셋.
  useEffect(() => {
    if (open) {
      setReason(null);
      setDetail('');
      setIsDuplicate(false);
      setFocused(false);
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
        opacity={0.55}
      />
    ),
    [],
  );

  const isOther = reason === 'other';
  const submitDisabled =
    !reason || (isOther && detail.trim().length === 0) || isDuplicate || loading;

  const handleSelect = (r: ReportReason) => {
    Haptics.selectionAsync().catch(() => undefined);
    setReason(r);
    setIsDuplicate(false);
  };

  const handleSubmit = async () => {
    if (!reason) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    const result = await submit({
      targetType,
      targetId,
      reason,
      detail: isOther ? detail : undefined,
    });
    if (result === 'ok') {
      onClose();
      onSubmitted?.();
    } else if (result === 'duplicate') {
      setIsDuplicate(true);
    } else {
      // error — 시트 유지, 부모 토스트는 onSubmitted 분리 흐름이 없으므로 인라인 미표시.
      // 사용자가 재시도 가능 (제출 버튼 재활성).
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: light.bg.surface }}
      handleIndicatorStyle={{ backgroundColor: light.border.default, width: 44 }}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ marginTop: 6, marginBottom: 14 }}>
          <Text
            accessibilityRole="header"
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 18,
              color: light.text.primary,
            }}
          >
            {t('moderation.report.title')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 13,
              color: light.text.muted,
              marginTop: 4,
            }}
          >
            {t('moderation.report.subtitle')}
          </Text>
        </View>

        {/* Reason list */}
        <View style={{ gap: 8 }}>
          {REASONS.map((r) => (
            <ReasonRow
              key={r}
              label={t(`moderation.reason.${r}`)}
              selected={reason === r}
              disabled={loading}
              onPress={() => handleSelect(r)}
            />
          ))}
        </View>

        {/* Detail field — other 선택 시만 */}
        {isOther && (
          <View style={{ marginTop: 12 }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12,
                color: light.text.secondary,
                marginBottom: 6,
              }}
            >
              {t('moderation.report.detailLabel')}
            </Text>
            <BottomSheetTextInput
              value={detail}
              onChangeText={(v) => setDetail(v.slice(0, DETAIL_MAX))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('moderation.report.detailPlaceholder')}
              placeholderTextColor={light.text.muted}
              accessibilityLabel={t('moderation.report.detailLabel')}
              multiline
              editable={!loading}
              maxLength={DETAIL_MAX}
              style={{
                minHeight: 88,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: focused ? light.border.active : light.border.default,
                padding: 12,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 14,
                color: light.text.primary,
                textAlignVertical: 'top',
              }}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 11,
                color: detail.length >= DETAIL_MAX ? brand.wineRed : light.text.muted,
                alignSelf: 'flex-end',
                marginTop: 4,
              }}
            >
              {`${detail.length}/${DETAIL_MAX}`}
            </Text>
          </View>
        )}

        {/* Duplicate notice — inline (정상 흐름) */}
        {isDuplicate && (
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Info size={14} strokeWidth={1.9} color={light.text.muted} />
            <Text
              allowFontScaling={false}
              style={{
                flex: 1,
                fontFamily: 'Freesentation_4Regular',
                fontSize: 12.5,
                color: light.text.muted,
              }}
            >
              {t('moderation.report.duplicateNotice')}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={{ marginTop: 20, gap: 8 }}>
          <PrimaryButton
            label={t('moderation.report.submit')}
            onPress={() => void handleSubmit()}
            size="lg"
            variant="primary"
            loading={loading}
            disabled={submitDisabled}
          />
          <PrimaryButton
            label={t('common.cancel')}
            onPress={onClose}
            size="lg"
            variant="ghost"
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// ---- ReasonRow (§4-11 2-layer: hit + visual) ----

function ReasonRow({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: radius.xl,
          backgroundColor: selected
            ? withAlpha(brand.wineRed, 0.06)
            : light.bg.surface,
          borderWidth: 1,
          borderColor: selected ? light.border.active : light.border.default,
        }}
      >
        {/* RadioDot */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: selected ? light.border.active : light.border.default,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: brand.wineRed,
              }}
            />
          ) : null}
        </View>
        <Text
          allowFontScaling={false}
          style={{
            flex: 1,
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            color: light.text.primary,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
