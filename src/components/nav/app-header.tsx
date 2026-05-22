/**
 * AppHeader — 탭 화면 공용 헤더 (community 탭 기준 통일).
 *
 * community.tsx 헤더와 동일한 구조:
 *   - eyebrow: Freesentation_5Medium 11px uppercase letterSpacing 1.8 (섹션 레이블)
 *   - title:   Freesentation_7Bold 24px lineHeight 29 (페이지 제목)
 *   - padding: top(insets.top+10) / bottom(10) / horizontal(20)
 *   - borderBottom: hairline, border.default 토큰
 *
 * Animated.View 내부에서도 사용 가능 (community 탭 scroll-aware 헤더).
 * `eyebrow`는 필수 — 생략 시 두 탭 간 높이 불일치 발생.
 */
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ReactNode } from 'react';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface AppHeaderProps {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}

export function AppHeader({ eyebrow, title, right }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const tokens = useThemeTokens();

  return (
    <View
      style={{
        backgroundColor: tokens.bg.deepest,
        paddingTop: insets.top + 10,
        paddingBottom: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: tokens.border.default,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_5Medium',
            fontSize: 11,
            color: tokens.border.active,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
        <Text
          allowFontScaling={false}
          accessibilityRole="header"
          style={{
            fontFamily: 'Freesentation_7Bold',
            fontSize: 24,
            lineHeight: 29,
            color: tokens.text.primary,
            marginTop: 2,
          }}
        >
          {title}
        </Text>
      </View>
      {right ?? null}
    </View>
  );
}
