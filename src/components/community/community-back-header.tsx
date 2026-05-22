/**
 * CommunityBackHeader — 커뮤니티 서브 화면 공통 백 헤더.
 *
 * tonight / discover / templates 화면에서 반복되던 LightBackHeader 통합.
 *
 * 변형:
 *   - title 없음 + 보더 없음  → /community/tonight (타이틀 숨기고 배경과 자연스럽게 이어짐)
 *   - title 있음 + 보더 있음  → /community/discover, /community/templates
 *
 * §0-2 light-only: dark variant 없음.
 * §4-11: Back Pressable 2-layer (hit + inner View 32×32).
 */
import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
import { light } from '@/lib/design-tokens';

interface CommunityBackHeaderProps {
  /** 헤더 타이틀. 미전달 시 백 버튼만 표시 (tonight 화면 패턴). */
  title?: string;
  /**
   * 하단 hairline 보더 표시 여부.
   * 기본값: title이 있으면 true, 없으면 false.
   */
  showBorder?: boolean;
  /** 커스텀 뒤로가기 핸들러. 미전달 시 router.back(). */
  onBack?: () => void;
}

export function CommunityBackHeader({
  title,
  showBorder = !!title,
  onBack,
}: CommunityBackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack]);

  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top + 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...(showBorder
          ? {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: light.border.default,
            }
          : undefined),
      }}
    >
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t('nav.back', { defaultValue: 'Back' })}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
        </View>
      </Pressable>

      {title ? (
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            marginLeft: 4,
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '600',
            fontSize: 16,
            color: light.text.primary,
          }}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}
