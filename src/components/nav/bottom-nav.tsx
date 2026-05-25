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
import { brand, gradients, shadows } from '@/lib/design-tokens';
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
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8 + insets.bottom,
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
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  navigateTo();
                }}
                accessibilityRole="button"
                accessibilityLabel={t('nav.captureA11y')}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                {/* shadow wrapper — overflow:hidden 없이 shadow 보존 */}
                <View style={{ width: 52, height: 52, borderRadius: 26, ...fabShadow }}>
                  {/* gradient + border container */}
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 26,
                      borderWidth: 1,
                      borderColor: brand.gold,
                      overflow: 'hidden',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LinearGradient
                      colors={fabGradient.colors as unknown as readonly [string, string]}
                      start={fabGradient.start}
                      end={fabGradient.end}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                      }}
                    />
                    <Camera size={26} color={brand.cream} strokeWidth={1.6} />
                  </View>
                </View>
              </Pressable>
            </View>
          );
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
  // Round 10 — 진짜 fix: flex:1을 outer View에. Pressable의 style 함수에 flex:1이 있으면
  // NativeWind cssInterop + Fabric에서 무시되어 NavTab이 content 폭으로 collapse →
  // 5개 슬롯 균등 분포 안 되고 좌우 끝으로 cluster ("양옆 깨짐"의 진짜 원인).
  // outer View에 flex:1 + 내부 Pressable은 hit target + opacity만 → flex 정상 분포.
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <View
          style={{
            paddingVertical: 4,
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
              fontFamily: focused ? 'Freesentation_4Regular' : 'Freesentation_4Regular',
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
    </View>
  );
}
