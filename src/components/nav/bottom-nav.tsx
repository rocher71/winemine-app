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
          // iOS shadow + overflow:'hidden' 충돌 회피: shadow는 외부 wrapper에,
          // clip은 내부 Pressable에. 추가로 Pressable backgroundColor에 wineRed
          // solid를 두어 LinearGradient 렌더 실패 시에도 빨간 원이 보이도록 보장.
          return (
            <View
              key={route.key}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
              <View
                style={{
                  marginTop: -24,
                  borderRadius: radius.full,
                  ...fabShadow,
                }}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                    navigateTo();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('nav.captureA11y')}
                  style={({ pressed }) => ({
                    width: spacing['13'],     // 52
                    height: spacing['13'],    // 52
                    borderRadius: radius.full,
                    borderWidth: 1,
                    borderColor: brand.gold,
                    backgroundColor: brand.wineRed, // solid fallback (gradient 렌더 보장)
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <LinearGradient
                    colors={fabGradient.colors as unknown as readonly [string, string]}
                    start={fabGradient.start}
                    end={fabGradient.end}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                  />
                  <Camera size={24} color={brand.cream} strokeWidth={1.6} />
                </Pressable>
              </View>
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: spacing['1.5'],   // 6
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing['0.75'],              // 3
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon size={22} strokeWidth={1.6} color={color} />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className={focused ? 'font-inter-semibold' : 'font-inter'}
        style={{
          fontSize: 10,
          lineHeight: 10,
          letterSpacing: 0.2,
          color,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
