/**
 * VisibilitySheet — 공개/비공개 전환 확인 바텀시트.
 * mode='toPublic': 골드 글로브 아이콘 + 3개 bullet.
 * mode='toPrivate': 경고 아이콘 + 저장자 수 경고.
 * 디자인 원본: wm-lists-screens.jsx ScreenMakePublic / ScreenMakePrivate.
 */
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Globe, Lock, Eye, Bookmark, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { brand, dark, light, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { PrimaryButton } from '@/components/shared/primary-button';

export type VisibilitySheetMode = 'toPublic' | 'toPrivate';

interface Props {
  open: boolean;
  mode: VisibilitySheetMode;
  saveCount?: number;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function VisibilitySheet({
  open,
  mode,
  saveCount = 0,
  isLoading = false,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const { scheme, bg, text, border } = useThemeTokens();
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['60%'], []);
  const surfaceBg = scheme === 'light' ? light.bg.deep : dark.bg.deep;

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

  const isToPublic = mode === 'toPublic';

  const bullets = isToPublic
    ? [
        { icon: <Eye size={12} strokeWidth={2} color={brand.goldSoft} />, text: t('lists.makePublic.bullet1') },
        { icon: <Bookmark size={12} strokeWidth={2} color={brand.goldSoft} />, text: t('lists.makePublic.bullet2') },
        { icon: <Lock size={12} strokeWidth={2} color={brand.goldSoft} />, text: t('lists.makePublic.bullet3') },
      ]
    : [
        { icon: <Eye size={12} strokeWidth={2} color={text.muted} />, text: t('lists.makePrivate.effect1') },
        { icon: <Bookmark size={12} strokeWidth={2} color={text.muted} />, text: t('lists.makePrivate.effect2') },
        { icon: <Globe size={12} strokeWidth={2} color={text.muted} />, text: t('lists.makePrivate.effect3') },
      ];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: surfaceBg }}
      handleIndicatorStyle={{ backgroundColor: border.default, width: 44 }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        {/* Hero icon */}
        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 18 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isToPublic
                ? withAlpha(brand.gold, 0.18)
                : withAlpha(brand.wineRedHover, 0.12),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isToPublic ? brand.gold : brand.wineRed,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {isToPublic
              ? <Globe size={28} strokeWidth={1.7} color={brand.goldSoft} />
              : <AlertCircle size={28} strokeWidth={1.7} color={brand.wineRed} />
            }
          </View>
        </View>

        {/* Title */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 20,
            color: text.primary,
            letterSpacing: -0.4,
            lineHeight: 26,
            textAlign: 'center',
            paddingHorizontal: 12,
          }}
        >
          {isToPublic ? t('lists.makePublic.title') : t('lists.makePrivate.title')}
        </Text>

        {/* Savers preview — stacked avatar circles (mock) */}
        {(saveCount ?? 0) > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            {[0, 1, 2].slice(0, Math.min(3, saveCount)).map((i) => (
              <View
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: withAlpha(brand.wineRed, 0.15 + i * 0.1),
                  borderWidth: 2,
                  borderColor: bg.surface,
                  marginLeft: i === 0 ? 0 : -10,
                }}
              />
            ))}
          </View>
        ) : null}

        {/* Body text */}
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: text.secondary,
            lineHeight: 20,
            textAlign: 'center',
            marginTop: 8,
            paddingHorizontal: 14,
          }}
        >
          {isToPublic
            ? t('lists.makePublic.body')
            : t('lists.makePrivate.body', { count: saveCount })}
        </Text>

        {/* Savers note for toPrivate */}
        {!isToPublic && saveCount > 0 && (
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: text.muted,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {t('lists.makePrivate.saversSub')}
          </Text>
        )}

        {/* Bullet info card */}
        <View
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 14,
            backgroundColor: bg.surface,
            borderWidth: 1,
            borderColor: border.default,
            gap: 12,
          }}
        >
          {bullets.map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: bg.deep,
                  borderWidth: 1,
                  borderColor: border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {b.icon}
              </View>
              <Text
                allowFontScaling={false}
                style={{
                  flex: 1,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12.5,
                  color: text.secondary,
                  letterSpacing: -0.1,
                  lineHeight: 17,
                }}
              >
                {b.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={{ marginTop: 20, gap: 8 }}>
          <PrimaryButton
            label={isToPublic ? t('lists.makePublic.confirm') : t('lists.makePrivate.confirm')}
            onPress={onConfirm}
            size="lg"
            variant={isToPublic ? 'primary' : 'cellar'}
            loading={isLoading}
          />
          <PrimaryButton
            label={isToPublic ? t('lists.makePublic.cancel') : t('lists.makePrivate.cancel')}
            onPress={onClose}
            size="lg"
            variant="ghost"
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({});
