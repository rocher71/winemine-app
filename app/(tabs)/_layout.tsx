import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '@/components/nav/bottom-nav';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <BottomNav {...p} />}>
      <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="capture" options={{ title: t('nav.capture') }} />
      <Tabs.Screen name="cellar" options={{ title: t('nav.cellar') }} />
      <Tabs.Screen name="notes" options={{ title: t('nav.notes') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
    </Tabs>
  );
}
