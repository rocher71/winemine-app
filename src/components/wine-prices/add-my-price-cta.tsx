/**
 * AddMyPriceCta — wine-prices 화면 하단 fixed CTA.
 *
 * 사양: wine-prices.md §3-5 + §6 #7.
 *
 * keyscreen line 50~84 verbatim — 단, `bottom: 80` (BottomNav 위) 는 RN tabs 외부라
 * `bottom: 16 + insets.bottom` 으로 대체 (§6 #7).
 *
 * §4-11 3-layer Pressable 패턴:
 *   - outer Pressable: hit only (opacity press feedback).
 *   - inner View: layout/visual (size, bg, shadow, gradient X — flat wine-red).
 */
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';

interface AddMyPriceCtaProps {
  onPress: () => void;
}

export function AddMyPriceCta({ onPress }: AddMyPriceCtaProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onPress();
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 16 + insets.bottom,
        left: 16,
        right: 16,
        zIndex: 5,
      }}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('winePrices.cta.addLabel')}
        accessibilityHint={t('winePrices.cta.addHint')}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            width: '100%',
            height: 52,
            borderRadius: 14,
            backgroundColor: brand.wineRed,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            // §6 #8: shadow 4속성 inline (iOS) + elevation (Android).
            shadowColor: brand.wineRed,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 18,
            elevation: 6,
          }}
        >
          <Plus size={18} strokeWidth={2} color={brand.cream} />
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 15,
              color: brand.cream,
              lineHeight: 20,
            }}
          >
            {t('winePrices.cta.addLabel')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
