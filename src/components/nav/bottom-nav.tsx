/**
 * BottomNav — expo-router Tabs 커스텀 tabBar.
 *
 * 출처: _workspace/design-specs/bottom-nav.md (keyscreen verbatim 5 tabs).
 *
 * 구조 (verbatim §2):
 *   - 컨테이너: LinearGradient(bottomNavFade) 절대 fill + borderTop 0.5px + paddingBottom 28+insets
 *   - 5 슬롯 (flex-1): home / map / FAB(capture) / cellar / community
 *   - capture 슬롯은 NavTab 대신 52×52 floating FAB (marginTop -24, gradient + gold border + shadow)
 *   - active indicator bar 제거 (D2) — color + fontWeight로만 표현
 *   - capture 라우트 진입 시 BottomNav 자체 렌더 X (HIDE_BOTTOM_NAV_ROUTES)
 *
 * a11y:
 *   - 컨테이너: tablist + nav.a11y.primary
 *   - NavTab: tab + selected state
 *   - FAB: button + nav.captureA11y
 *
 * Haptics:
 *   - NavTab tap: Haptics.selectionAsync()
 *   - FAB tap: Haptics.impactAsync(Light)
 */
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Globe, Camera, Wine, Users, type LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, gradients, shadows, radius, spacing } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

const ICONS: Record<string, LucideIcon> = {
  index: Home,
  map: Globe,
  capture: Camera,
  cellar: Wine,
  community: Users,
};

// HIDE_BOTTOM_NAV_ROUTES: capture 진입 시 BottomNav 자체 숨김 (capture.md §10-5 + bottom-nav.md §1-5).
// keyscreen verbatim — /capture는 noBottomNav.
const HIDE_BOTTOM_NAV_ROUTES = new Set<string>(['capture']);

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tokens = useThemeTokens();
  const { t } = useTranslation();

  const currentRoute = state.routes[state.index];
  if (currentRoute && HIDE_BOTTOM_NAV_ROUTES.has(currentRoute.name)) {
    return null;
  }

  const bgGradient = gradients.bottomNavFade[tokens.scheme];
  const fabGradient = gradients.fab[tokens.scheme];
  const fabShadow = tokens.scheme === 'light' ? shadows.fabLight : shadows.fabDark;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t('nav.a11y.primary')}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: spacing['2'],          // 8
        paddingHorizontal: spacing['3'],   // 12
        paddingBottom: 28 + insets.bottom, // safe area 흡수
        borderTopWidth: 0.5,
        borderTopColor: tokens.border.default,
      }}
    >
      <LinearGradient
        colors={bgGradient.colors as unknown as readonly [string, string]}
        locations={bgGradient.locations as unknown as readonly [number, number] | undefined}
        start={bgGradient.start}
        end={bgGradient.end}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key] ?? {};
        const focused = state.index === index;
        const isCapture = route.name === 'capture';
        const label = options?.title ?? route.name;

        const navigateTo = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (isCapture) {
          // Round 7: capture 슬롯은 flex spacer만 (FAB은 컨테이너의 직접 absolute child로 별도 렌더).
          // Round 5(translateY) / Round 6(nested absolute) 모두 시각 결과 동일 → flex 안에 어떤 형태로
          // 넣어도 안 됨. FAB을 컨테이너 absolute child로 끌어올려 flex layout과 완전 분리.
          return <View key={route.key} style={{ flex: 1 }} />;
        }

        return (
          <NavTab
            key={route.key}
            icon={ICONS[route.name] ?? Home}
            label={label}
            focused={focused}
            idleColor={tokens.text.muted}
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              navigateTo();
            }}
          />
        );
      })}

      {/* FAB — Round 8: Pressable에서 visual style 분리. NativeWind cssInterop + Fabric에서
       *   복잡한 style 함수가 무시되는 케이스 회피. position absolute는 outer wrapper에 (positioning),
       *   visual style은 inner View에 inline (cssInterop wrapping 우회). Pressable은 hit target만.
       */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: 28 + insets.bottom + 10,
          left: '50%',
          marginLeft: -28,
          width: 56,
          height: 56,
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={() => {
            const captureRoute = state.routes.find((r) => r.name === 'capture');
            if (!captureRoute) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
            const event = navigation.emit({
              type: 'tabPress',
              target: captureRoute.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) navigation.navigate('capture');
          }}
          accessibilityRole="button"
          accessibilityLabel={t('nav.captureA11y')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              // light mode: gold FAB (gradients.fab.light 시작색), dark mode: wineRed
              // 키스크린 verbatim — light 모드 FAB은 따뜻한 골드/사플 색.
              backgroundColor: tokens.scheme === 'light' ? '#C9A84C' : brand.wineRed,
              borderWidth: 1.5,
              borderColor: tokens.scheme === 'light' ? '#A07F2E' : brand.gold,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: tokens.scheme === 'light' ? '#A07F2E' : '#8B1A2A',
              shadowOpacity: tokens.scheme === 'light' ? 0.32 : 0.45,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Camera size={26} color={tokens.scheme === 'light' ? brand.cream : brand.cream} strokeWidth={1.6} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

interface NavTabProps {
  icon: LucideIcon;
  label: string;
  focused: boolean;
  idleColor: string;
  onPress: () => void;
}

function NavTab({ icon: Icon, label, focused, idleColor, onPress }: NavTabProps) {
  const color = focused ? brand.gold : idleColor;
  // Round 8 패턴 (§4-11): Pressable은 hit target만, layout(flexDirection: 'column' + gap)은 inner View.
  // 이게 안 되면 icon + label이 horizontal로 나란히 렌더되어 양옆으로 깨져 보임.
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          paddingVertical: 6,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Icon size={22} strokeWidth={1.6} color={color} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_400Regular',
            fontSize: 10,
            lineHeight: 12,
            letterSpacing: 0.2,
            color,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
