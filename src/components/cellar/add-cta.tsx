/**
 * AddCta — TitleBar의 "+ 등록" 버튼.
 *
 * 사양: design-spec cellar-list.md §3-3.
 * 키스크린 원본: src/app/cellar/page.tsx line 219~242.
 *
 * outer: inline-flex items-center gap 4, padding 6_10, radius 10
 *        border 1px border-default, bg transparent
 * icon:  lucide Plus 14, gold
 * label: Inter 12 600 gold
 *
 * onPress: v0.1.0 alpha는 toast (`cellar.addToast`). BottomSheet add-cellar form은 v0.2.0.
 */
import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';

interface Props {
  onPress: () => void;
}

export function AddCta({ onPress }: Props) {
  const { t } = useTranslation();
  const handle = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };
  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel={t('cellar.addCta')}
      className="border border-border-default rounded-[10px]"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Plus size={14} strokeWidth={2} color={brand.gold} />
      <View style={{ flexShrink: 1 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            lineHeight: 14.4,
            color: brand.gold,
          }}
        >
          {t('cellar.addCta')}
        </Text>
      </View>
    </Pressable>
  );
}
