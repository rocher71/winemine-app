/**
 * WriteNoteCta — 사용자가 이 와인에 노트가 없을 때 표시.
 *
 * 사양: wine-detail.md §3-5 verbatim.
 *
 * 구조 (flex row, gap 14):
 *   - icon circle 40×40 radius full bg wineRed 15% border wineRed 30% — 인라인 glass SVG (path)
 *   - text col (flex 1): "아직 노트가 없어요" Inter 13 600 cream + "이 와인의 시음 경험..." Inter 11 text-muted lh 1.4
 *   - CTA pill: bg wine-red, color cream, padding 8_14, radius full, shadow wineRedCardSm
 */
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { brand, shadows, withAlpha } from '@/lib/design-tokens';

interface Props {
  wineLwin: string;
}

export function WriteNoteCta({ wineLwin }: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/notes/new/write?wine_lwin=${encodeURIComponent(wineLwin)}`);
  };

  return (
    <View
      className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default flex-row items-center"
      style={{ padding: 16, gap: 14 }}
    >
      {/* icon circle 40×40 */}
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 40,
          height: 40,
          backgroundColor: withAlpha(brand.wineRed, 0.15),
          borderWidth: 1,
          borderColor: withAlpha(brand.wineRed, 0.3),
          flexShrink: 0,
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8 3h8s0 6-4 8c-4-2-4-8-4-8z"
            stroke={brand.wineRed}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 11v9M9 20h6"
            stroke={brand.wineRed}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* text col */}
      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text className="font-inter-semibold text-[13px] text-text-primary dark:text-text-primary mb-0.5">
          {t('wineDetail.writeNote.title')}
        </Text>
        <Text
          className="font-inter text-[11px] text-text-muted dark:text-text-muted"
          style={{ lineHeight: 15.4 }}
          numberOfLines={2}
        >
          {t('wineDetail.writeNote.sub')}
        </Text>
      </View>

      {/* CTA pill */}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('wineDetail.writeNote.cta')}
        accessibilityHint={t('wineDetail.writeNote.subA11y')}
        className="rounded-full"
        style={({ pressed }) => ({
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: brand.wineRed,
          borderWidth: 1,
          borderColor: withAlpha(brand.gold, 0.4),
          flexShrink: 0,
          opacity: pressed ? 0.9 : 1,
          ...shadows.wineRedCardSm,
        })}
      >
        <Text
          allowFontScaling={false}
          className="font-inter-semibold text-[12px]"
          style={{ color: brand.cream }}
          numberOfLines={1}
        >
          {t('wineDetail.writeNote.cta')}
        </Text>
      </Pressable>
    </View>
  );
}
