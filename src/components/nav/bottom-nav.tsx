/**
 * BottomNav — expo-router의 Tabs와 함께 쓰는 커스텀 tabBar 컴포넌트.
 * (tabs)/_layout.tsx에서 <Tabs tabBar={(p) => <BottomNav {...p} />} />로 사용 예정.
 *
 * v0.1.0 골격: 5탭(홈/캡처/셀러/노트/설정) shape만. 실제 화면 라우팅은 Day 2 이후.
 */
import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Camera, BookOpen, Wine, Settings } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { brand, dark, light } from '@/lib/design-tokens';

const ICONS: Record<string, typeof Home> = {
  index: Home,
  capture: Camera,
  cellar: Wine,
  notes: BookOpen,
  settings: Settings,
};

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const idleColor = scheme === 'light' ? light.text.muted : dark.text.muted;
  const bg = scheme === 'light' ? light.bg.deep : dark.bg.deep;

  return (
    <View
      className="flex-row items-stretch"
      style={{ paddingBottom: insets.bottom, backgroundColor: bg }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key] ?? {};
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        const color = focused ? brand.gold : idleColor;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options?.title ?? route.name}
            className="h-14 flex-1 items-center justify-center"
          >
            {focused ? (
              <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: brand.gold }}
              />
            ) : null}
            <Icon size={20} strokeWidth={2} color={color} />
            <Text
              className={`mt-1 ${focused ? 'font-inter-semibold' : 'font-inter'}`}
              style={{ fontSize: 10, letterSpacing: 0.2, color }}
            >
              {options?.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
