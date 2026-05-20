/**
 * SuggestedActions — first-time 모드, 3 row 버튼.
 *
 * 사양 home.md §2-2 line 178-183, §3-12:
 * - column gap 10, p 0_16, mt 16
 * - button p 14_16, radius 12, bg-surface, border-default, items-center justify-between
 *   - label Inter 14 500 cream
 *   - 우측 ChevronRight 18, strokeWidth 1.75, text-muted
 * - row 1: toast (tour 메시지)
 * - row 2: toast (starter 메시지)
 * - row 3: router.push('/settings/experience')
 *
 * v0.1.0: Toast 컴포넌트는 화면 내 banner state 아닌 단순 컴포넌트 — RN Alert.alert로 대체.
 */
import { View, Text, Pressable, Alert } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useThemeTokens } from '@/lib/use-theme-tokens';

function ActionRow({
  label,
  onPress,
  textMuted,
}: {
  label: string;
  onPress: () => void;
  textMuted: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="bg-surface dark:bg-surface border border-border-default dark:border-border-default"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Text
        className="font-inter-medium text-text-primary dark:text-text-primary"
        style={{ fontSize: 14, flex: 1, marginRight: 8 }}
      >
        {label}
      </Text>
      <ChevronRight size={18} strokeWidth={1.75} color={textMuted} />
    </Pressable>
  );
}

export function SuggestedActions() {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const onToast = (key: 'tour' | 'starter') => () => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t(`home.suggestedToast.${key}`));
  };
  const onExperience = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push('/(tabs)/settings/experience');
  };

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 10 }}>
      <ActionRow
        label={t('home.firstTime.suggestTour')}
        onPress={onToast('tour')}
        textMuted={tokens.text.muted}
      />
      <ActionRow
        label={t('home.firstTime.suggestStarter')}
        onPress={onToast('starter')}
        textMuted={tokens.text.muted}
      />
      <ActionRow
        label={t('home.firstTime.suggestExperience')}
        onPress={onExperience}
        textMuted={tokens.text.muted}
      />
    </View>
  );
}
