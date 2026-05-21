/**
 * /settings — 설정 인덱스 화면
 *
 * 구조:
 *   - BackHeader "설정"
 *   - Section "환경설정"
 *     - 언어 row → /settings/language (현재값 ko/en)
 *     - 외관 row → /settings/appearance (현재 테마)
 *     - 와인 경험 row → /settings/experience (현재 모드)
 *   - Section "계정"
 *     - 계정 연결 (disabled, v0.2.0 hint)
 *
 * Row: Pressable wrapper + inner View (Round 8 패턴, §4-11).
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BackHeader } from '@/components/nav/back-header';
import { useProfile } from '@/hooks/use-profile';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { currentLocale, type AppLocale } from '@/lib/i18n';
import { useColorScheme } from 'nativewind';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  hint?: string;
}

function SettingsRow({ label, value, onPress, disabled = false, hint }: RowProps) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.selectionAsync().catch(() => undefined);
        onPress?.();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({ opacity: disabled ? 0.55 : pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 12,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: tokens.border.default,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              lineHeight: 20,
              color: tokens.text.primary,
            }}
          >
            {label}
          </Text>
          {hint ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                lineHeight: 17,
                color: tokens.text.muted,
              }}
            >
              {hint}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {value ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: tokens.text.muted,
              }}
            >
              {value}
            </Text>
          ) : null}
          {!disabled ? (
            <ChevronRight size={18} strokeWidth={2} color={tokens.text.muted} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  const tokens = useThemeTokens();
  return (
    <Text
      style={{
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 0.56,
        textTransform: 'uppercase',
        color: tokens.text.secondary,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {children}
    </Text>
  );
}

export default function SettingsIndexScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useThemeTokens();
  const { profile } = useProfile();
  const { colorScheme } = useColorScheme();

  const langValue =
    ((profile?.language as AppLocale) ?? currentLocale()) === 'ko'
      ? t('settings.values.ko')
      : t('settings.values.en');

  const themeValue =
    colorScheme === 'light'
      ? t('theme.light')
      : colorScheme === 'dark'
        ? t('theme.dark')
        : t('theme.system');

  const expValue =
    profile?.experience === 'expert'
      ? t('settings.values.expert')
      : t('settings.values.beginner');

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg.deepest }}>
      <BackHeader title={t('settings.title')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
          gap: 24,
        }}
      >
        <View>
          <SectionLabel>{t('settings.sections.preferences')}</SectionLabel>
          <View style={{ gap: 8 }}>
            <SettingsRow
              label={t('settings.languagePage.title')}
              value={langValue}
              onPress={() => router.push('/settings/language' as never)}
            />
            <SettingsRow
              label={t('settings.appearancePage.title')}
              value={themeValue}
              onPress={() => router.push('/settings/appearance' as never)}
            />
            <SettingsRow
              label={t('settings.experiencePage.title')}
              value={expValue}
              onPress={() => router.push('/settings/experience' as never)}
            />
          </View>
        </View>

        <View>
          <SectionLabel>{t('settings.sections.account')}</SectionLabel>
          <View style={{ gap: 8 }}>
            <SettingsRow
              label={t('settings.sections.linkAccount')}
              hint={t('settings.sections.linkAccountHint')}
              disabled
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
