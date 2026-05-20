/**
 * AddToCellarCta inline — wine-detail 페이지 하단 풀 너비 액션 버튼.
 *
 * 사양: wine-detail.md §3-12 verbatim.
 *
 * 구조:
 *   - wrap: px-4 pt-2 (사양: keyscreen page 측 padding 8 16 0)
 *   - button: width 100% height 52 radius 14 bg wine-red, Plus 18 + "셀러에 추가", shadow wineRedCardLg
 *   - press → onPress (parent에서 AddToCellarSheet open)
 *
 * RN deviation (사양 §8): keyscreen은 Link href="/capture"이지만 우리는 sheet open 유지.
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, shadows } from '@/lib/design-tokens';

interface Props {
  onPress: () => void;
}

export function AddToCellarCta({ onPress }: Props) {
  const { t } = useTranslation();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <View className="px-4 pt-2">
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('wineDetail.actions.addToCellar')}
        className="rounded-[14px] flex-row items-center justify-center"
        style={({ pressed }) => ({
          height: 52,
          paddingHorizontal: 20,
          gap: 8,
          backgroundColor: brand.wineRed,
          opacity: pressed ? 0.92 : 1,
          ...shadows.wineRedCardLg,
        })}
      >
        <Plus size={18} strokeWidth={2} color={brand.cream} />
        <Text
          allowFontScaling={false}
          className="font-inter-semibold text-[15px]"
          style={{ color: brand.cream }}
          numberOfLines={1}
        >
          {t('wineDetail.actions.addToCellar')}
        </Text>
      </Pressable>
    </View>
  );
}
