/**
 * QuickLinks — profile-me §3-10 사양 변환.
 *
 * 키스크린 원본: src/components/profile/quick-links.tsx (88 LOC).
 *
 * §1 verbatim 5 row: Favorites → Badges → Notifications → Settings → SignOut.
 *
 * §4-11 3-layer Pressable:
 *   <Pressable opacity 만> + <View visual> + 자식 (Icon + Label + ChevronRight).
 *
 * §6 #2 lucide icon set: Star/Award/Bell/Settings/LogOut (JSX 우선).
 * §6 #13 brand.gold light 명도 verbatim 유지 (sibling 동일 정책 — design-reviewer 후 결정).
 * §6 #14 SignOut row ChevronRight 유지 (keyscreen verbatim).
 *
 * §10 I: badges/notifications 라우트 v0.2.0 보류 → Toast "준비 중" 패턴.
 * §10 O: SignOut confirm은 ConfirmDialog (커스텀 modal — Alert.alert 대체).
 *
 * §0-2 light-only.
 */
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Award,
  Bell,
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, light } from '@/lib/design-tokens';

interface Item {
  key: 'favorites' | 'badges' | 'notifications' | 'settings' | 'signOut';
  icon: ReactNode;
  labelKey: string;
  onPress: () => void;
}

interface Props {
  onFavorites: () => void;
  onBadges: () => void;
  onNotifications: () => void;
  onSettings: () => void;
  onSignOut: () => void;
}

export function QuickLinks({
  onFavorites,
  onBadges,
  onNotifications,
  onSettings,
  onSignOut,
}: Props) {
  const { t } = useTranslation();

  const handlePress = (cb: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    cb();
  };

  const items: Item[] = [
    {
      key: 'favorites',
      icon: <Star size={18} color={brand.gold} />,
      labelKey: 'profile.links.favorites',
      onPress: handlePress(onFavorites),
    },
    {
      key: 'badges',
      icon: <Award size={18} color={brand.gold} />,
      labelKey: 'profile.links.badges',
      onPress: handlePress(onBadges),
    },
    {
      key: 'notifications',
      icon: <Bell size={18} color={brand.gold} />,
      labelKey: 'profile.links.notifications',
      onPress: handlePress(onNotifications),
    },
    {
      key: 'settings',
      icon: <SettingsIcon size={18} color={brand.gold} />,
      labelKey: 'profile.links.settings',
      onPress: handlePress(onSettings),
    },
    {
      key: 'signOut',
      icon: <LogOut size={18} color={brand.gold} />,
      labelKey: 'profile.links.signOut',
      onPress: handlePress(onSignOut),
    },
  ];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {items.map((item) => {
        const label = t(item.labelKey);
        return (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 14,
                backgroundColor: light.bg.surface,
                borderWidth: 1,
                borderColor: light.border.default,
                borderRadius: 12,
              }}
            >
              {item.icon}
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'Freesentation_4Regular',
                  fontWeight: '500',
                  fontSize: 14,
                  lineHeight: 17,
                  color: light.text.primary,
                }}
              >
                {label}
              </Text>
              <ChevronRight size={16} color={light.text.muted} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
