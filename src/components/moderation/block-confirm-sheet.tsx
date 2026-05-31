/**
 * BlockConfirmSheet — 차단/차단 해제 확인 바텀시트 (M3 moderation 공용 컴포넌트).
 *
 * 사양: _workspace/design-specs/moderation-block-confirm-sheet.md.
 *   - mode='block': Ban 아이콘(wineRed) + ImpactCard 2 bullet(양방향 비가시 + 팔로우 해제) + 확인 primary.
 *   - mode='unblock': UserCheck 아이콘(gold) + ImpactCard 생략 + 확인 secondary.
 *   - 1차 레퍼런스: src/components/cellar/visibility-sheet.tsx (hero 원 + 제목 + body + bullet 카드 + PrimaryButton 2).
 *   - {{name}} 보간 = anonymousDisplay 만 (§4-5 UUID 노출 금지).
 *   - light-only mode (§0-2): 모든 색 light.* / brand.* inline.
 *
 * follows 양방향 해제는 DB 트리거 — undoBody 에 "자동 복구 안 됨" 명시(사양 CRITICAL).
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Ban, UserCheck, EyeOff, UserMinus } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { PrimaryButton } from '@/components/shared/primary-button';

export type BlockMode = 'block' | 'unblock';

interface BlockConfirmSheetProps {
  open: boolean;
  mode: BlockMode;
  /** 익명 표시명만 (§4-5). */
  anonymousDisplay: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockConfirmSheet({
  open,
  mode,
  anonymousDisplay,
  isLoading = false,
  onClose,
  onConfirm,
}: BlockConfirmSheetProps) {
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%'], []);
  const isBlock = mode === 'block';
  const toneColor = isBlock ? brand.wineRed : light.border.active;

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
        opacity={0.55}
      />
    ),
    [],
  );

  const name = { name: anonymousDisplay };

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
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        {/* Hero icon — 원형 64 radius 32 명시값 (§4-10 radius.full 미사용) */}
        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 18 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: withAlpha(toneColor, 0.12),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: toneColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {isBlock ? (
              <Ban size={28} strokeWidth={1.7} color={brand.wineRed} />
            ) : (
              <UserCheck size={28} strokeWidth={1.7} color={light.border.active} />
            )}
          </View>
        </View>

        {/* Title */}
        <Text
          accessibilityRole="header"
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 20,
            color: light.text.primary,
            letterSpacing: -0.4,
            lineHeight: 26,
            textAlign: 'center',
            paddingHorizontal: 12,
          }}
        >
          {isBlock
            ? t('moderation.block.confirmTitle', name)
            : t('moderation.block.undoTitle', name)}
        </Text>

        {/* Body */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 13,
            color: light.text.secondary,
            lineHeight: 20,
            textAlign: 'center',
            marginTop: 8,
            paddingHorizontal: 14,
          }}
        >
          {isBlock
            ? t('moderation.block.confirmBody')
            : t('moderation.block.undoBody')}
        </Text>

        {/* ImpactCard — block mode만 */}
        {isBlock && (
          <View
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 14,
              backgroundColor: light.bg.surfaceUp,
              borderWidth: 1,
              borderColor: light.border.default,
              gap: 12,
            }}
          >
            <Bullet icon={<EyeOff size={12} strokeWidth={2} color={light.text.muted} />}>
              {t('moderation.block.bulletHidden')}
            </Bullet>
            <Bullet icon={<UserMinus size={12} strokeWidth={2} color={light.text.muted} />}>
              {t('moderation.block.bulletFollow')}
            </Bullet>
          </View>
        )}

        {/* Actions */}
        <View style={{ marginTop: 20, gap: 8 }}>
          <PrimaryButton
            label={isBlock ? t('moderation.block.action') : t('moderation.block.undo')}
            onPress={onConfirm}
            size="lg"
            variant={isBlock ? 'primary' : 'secondary'}
            loading={isLoading}
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

function Bullet({ icon, children }: { icon: React.ReactNode; children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: light.bg.deep,
          borderWidth: 1,
          borderColor: light.border.default,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text
        allowFontScaling={false}
        style={{
          flex: 1,
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12.5,
          color: light.text.secondary,
          lineHeight: 17,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
