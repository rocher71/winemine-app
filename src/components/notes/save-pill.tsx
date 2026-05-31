/**
 * SavePill — Beginner/Expert form footer wine-red pill 버튼.
 *
 * 사양: design-spec notes-write.md §10 E8 (header SaveBtn + footer pill 둘 다 유지).
 * 키스크린 원본: note-write-beginner.tsx footer pill.
 *
 * 구조:
 *   Pressable (radius 999, bg wine-red, padding 14v_16h)
 *   └── Text (Inter 600 15 cream center) — or ActivityIndicator(cream) when saving.
 *
 * disabled: opacity 0.5 + pointerEvents none.
 */
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

interface Props {
  onPress: () => void;
  disabled?: boolean;
  saving?: boolean;
}

export function SavePill({ onPress, disabled = false, saving = false }: Props) {
  const { t } = useTranslation();

  const handlePress = () => {
    if (disabled || saving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || saving}
      accessibilityRole="button"
      accessibilityLabel={t('notes.writeForm.save')}
      accessibilityHint={t('notes.writeForm.saveHint')}
      accessibilityState={{ disabled, busy: saving }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          borderRadius: 9999,
          backgroundColor: brand.gold,
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}
      >
        {saving ? (
          <ActivityIndicator color={brand.deepestDark} />
        ) : (
          <Text
            allowFontScaling={false}
            className="font-inter-semibold"
            style={{ fontSize: 15, color: brand.deepestDark, textAlign: 'center' }}
          >
            {t('notes.writeForm.save')}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
