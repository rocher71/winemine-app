/**
 * LanguageChoiceCard — onboarding/2-language step 전용 카드.
 *
 * 사양 onboarding-2-language.md §1-1 (line 66~88) verbatim:
 *   Pressable height 96, paddingHorizontal 18, rounded-2xl(16), flex-row items-center gap 14,
 *   bg-surface (dual), border 1px(unselected: border-default dual) → 2px(selected: brand.gold),
 *   opacity active ? 1 : 0.85.
 *
 *   IconBadge: 44×44 round, bg withAlpha(brand.gold, 0.08) (양쪽 모드 동일 — 사양 §4-4/5),
 *              center alignment, Playfair 16 brand.gold "KR"|"EN" literal (i18n 키 아님 — locale code).
 *
 *   title: Inter 18 / 600 / text-primary (dual).
 *
 * RN deviation (사양 §6):
 *  - boxShadow ring `'0 0 0 1px rgba(139,26,42,0.4)'` → border 1→2px (brand.gold). 단순화 채택.
 *  - press feedback: scale 0.99 + opacity dim (settings-radio-row 일관).
 *
 * 접근성 (사양 §7):
 *  - accessibilityRole="radio", accessibilityState={ selected }, hitSlop 6.
 *  - IconBadge 자체는 accessibilityElementsHidden (보조 식별자).
 *
 * 하드코딩 hex/rgba 0 — 모든 색은 design-tokens.ts 토큰 사용.
 */
import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, dark, light, withAlpha } from '@/lib/design-tokens';

interface LanguageChoiceCardProps {
  /**
   * locale code — "ko" | "en". IconBadge 안에 대문자 ("KR" | "EN")로 표기.
   */
  locale: 'ko' | 'en';
  /**
   * 행 본문 라벨 (예: "한국어" / "English"). 양쪽 모드 모두 자기 언어명 표기.
   */
  title: string;
  /**
   * 선택 상태.
   */
  selected: boolean;
  onPress: () => void;
}

const ICON_TEXT: Record<LanguageChoiceCardProps['locale'], string> = {
  ko: 'KR',
  en: 'EN',
};

export function LanguageChoiceCard({
  locale,
  title,
  selected,
  onPress,
}: LanguageChoiceCardProps) {
  const scheme = useColorScheme();
  const borderUnselected = scheme === 'light' ? light.border.default : dark.border.default;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      hitSlop={6}
      style={({ pressed }) => ({
        opacity: pressed ? (selected ? 0.95 : 0.8) : selected ? 1 : 0.85,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          backgroundColor: scheme === 'light' ? light.bg.surface : dark.bg.surface,
          height: 96,
          paddingHorizontal: 18,
          gap: 14,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? brand.gold : borderUnselected,
        }}
      >
        {/* IconBadge — 44×44 round, gold tint bg, "KR"/"EN" Playfair 16 gold */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: withAlpha(brand.gold, 0.08),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="font-playfair text-gold" style={{ fontSize: 16 }}>
            {ICON_TEXT[locale]}
          </Text>
        </View>

        {/* title — Inter 18 / 600 / text-primary (dual) */}
        <Text className="font-inter-semibold text-onboarding-choice-label text-text-primary dark:text-text-primary">
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
