/**
 * ExperienceChoiceCard — onboarding/3-experience step 전용 카드.
 *
 * 사양 onboarding-3-experience.md §1-1 (line 80~112) verbatim:
 *   Pressable padding 18 사방, rounded-2xl(16), flex-row items-start gap 14,
 *   bg-surface (dual), border 1px(unselected: border-default dual) → 2px(selected: brand.gold),
 *   opacity active ? 1 : 0.85.
 *
 *   IconWrap: paddingTop 2 (텍스트 첫 줄 baseline 정렬). Lucide GlassWater(beginner) | Award(expert)
 *             size 24, strokeWidth 1.5, color brand.gold.
 *
 *   TextStack: flex-column gap 4
 *     title: Inter 16 / 600 / text-primary (dual) — text-source-card-title (16/19.2)
 *     sub:   Inter 13 / regular / text-muted (dual) — text-card-body (13/19.5, 사양 §6 deviation 10
 *            cardBody 1.5 ratio = 19.5 vs keyscreen 1.4 ratio = 18.2 — 1.3pt 차이 수용)
 *
 * RN deviation (사양 §6):
 *  - boxShadow ring `'0 0 0 1px rgba(139,26,42,0.4)'` → border 1→2px (brand.gold). language-choice-card 일관.
 *  - press feedback: scale 0.99 + opacity dim.
 *  - cursor/all:unset/hover: 제거 (RN N/A).
 *
 * 접근성 (사양 §7):
 *  - accessibilityRole="radio", accessibilityState={ selected }, hitSlop 6.
 *  - accessibilityLabel = title, accessibilityHint = sub.
 *  - IconWrap 자체는 accessibilityElementsHidden (보조 식별자, screen reader 중복 차단).
 *
 * 하드코딩 hex/rgba 0 — 모든 색은 design-tokens.ts 토큰 사용.
 */
import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassWater, Award } from 'lucide-react-native';
import { brand, dark, light } from '@/lib/design-tokens';

export type ExperienceVariant = 'beginner' | 'expert';

interface ExperienceChoiceCardProps {
  /**
   * "beginner" → GlassWater icon, "expert" → Award icon.
   */
  variant: ExperienceVariant;
  /**
   * 1-tier title (Inter 600 16).
   */
  title: string;
  /**
   * 2-tier sub (Inter 13 muted).
   */
  sub: string;
  /**
   * 선택 상태.
   */
  selected: boolean;
  onPress: () => void;
}

export function ExperienceChoiceCard({
  variant,
  title,
  sub,
  selected,
  onPress,
}: ExperienceChoiceCardProps) {
  const scheme = useColorScheme();
  const borderUnselected = scheme === 'light' ? light.border.default : dark.border.default;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  const Icon = variant === 'beginner' ? GlassWater : Award;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      accessibilityHint={sub}
      hitSlop={6}
      style={({ pressed }) => ({
        opacity: pressed ? (selected ? 0.95 : 0.8) : selected ? 1 : 0.85,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          borderRadius: 16,
          backgroundColor: scheme === 'light' ? light.bg.surface : dark.bg.surface,
          padding: 18,
          gap: 14,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? brand.gold : borderUnselected,
        }}
      >
        {/* IconWrap — paddingTop 2 (baseline 정렬), Lucide icon 24 strokeWidth 1.5 brand.gold */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ paddingTop: 2 }}
        >
          <Icon size={24} strokeWidth={1.5} color={brand.gold} />
        </View>

        {/* TextStack — flex-column gap 4 (title + sub) */}
        <View style={{ flex: 1, gap: 4 }}>
          {/* title — Inter 600 16 / text-primary dual (text-source-card-title) */}
          <Text className="font-inter-semibold text-source-card-title text-text-primary dark:text-text-primary">
            {title}
          </Text>
          {/* sub — Inter 13 / muted dual (text-card-body, lineHeight 19.5 vs keyscreen 18.2 §6 deviation 10) */}
          <Text className="font-inter text-card-body text-text-muted dark:text-text-muted">
            {sub}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
