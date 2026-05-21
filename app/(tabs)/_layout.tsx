/**
 * (tabs) layout — 5 Tabs (home / map / capture(FAB) / cellar / community)
 *
 * 출처: _workspace/design-specs/bottom-nav.md §1-2, §1-4.
 *
 * - 키스크린 verbatim 5 탭. notes / settings / cellar/[lwin] / wine/[lwin]은
 *   root Stack route로 분리 (BottomNav overflow 제거 목적).
 * - 등록 순서가 tab index 순서이며, BottomNav는 route.name === 'capture'를 찾아 FAB로 분기.
 */
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '@/components/nav/bottom-nav';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // expo-router default tabBar 컨테이너의 borderTopWidth/background를 모두 제거해
        // BottomNav custom 컨테이너 내부의 LinearGradient + borderTop이 보이게 함.
        // 또한 height auto + overflow visible로 FAB marginTop -24가 위로 튀어나올 수 있게 함.
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: 'auto',
          overflow: 'visible',
        },
      }}
      tabBar={(p) => <BottomNav {...p} />}
    >
      <Tabs.Screen name="index"     options={{ title: t('nav.home') }} />
      <Tabs.Screen name="map"       options={{ title: t('nav.map') }} />
      <Tabs.Screen name="capture"   options={{ title: t('nav.capture') }} />
      <Tabs.Screen name="cellar"    options={{ title: t('nav.cellar') }} />
      <Tabs.Screen name="community" options={{ title: t('nav.community') }} />
    </Tabs>
  );
}
