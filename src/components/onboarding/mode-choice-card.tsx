/**
 * ModeChoiceCard — onboarding/4-mode step 전용 카드.
 *
 * 사양 onboarding-4-mode.md §1-1 (line 90~120) verbatim — ExperienceChoiceCard 패턴을
 * mode variant로 mirror. keyscreen는 모바일 mode UI 자체가 없으므로 (사양 §0 + §10 Q1)
 * StepExperience verbatim baseline 차용 — 카드 시각 구조 100% 동일, icon 매핑만 변경.
 *
 *   Pressable padding 18 사방, rounded-2xl(16), flex-row items-start gap 14,
 *   bg-surface (dual), border 1px(unselected: border-default dual) → 2px(selected: brand.gold),
 *   opacity active ? 1 : 0.85.
 *
 *   IconWrap: paddingTop 2 (텍스트 첫 줄 baseline 정렬).
 *             Lucide Sparkles(first-time) | BookOpen(heavy), size 24, strokeWidth 1.5, color brand.gold.
 *             (사양 §6 deviation 11 — keyscreen mode UI 부재로 icon 매핑은 RN 자체 결정.
 *              Sparkles = "처음/새로움", BookOpen = "꾸준한 기록" 의미.)
 *
 *   TextStack: flex-column gap 4 (flex-1 — 폭 양보)
 *     title: Inter 16 / 600 / text-primary (dual) — text-source-card-title (16/19.2)
 *     sub:   Inter 13 / regular / text-muted (dual) — text-card-body (13/19.5, 사양 §6 deviation 9
 *            cardBody 1.5 ratio = 19.5 vs keyscreen 1.4 ratio = 18.2 — 1.3pt 차이 수용,
 *            experience step §6 deviation 10 일관)
 *
 * RN deviation (사양 §6):
 *  - boxShadow ring `'0 0 0 1px rgba(139,26,42,0.4)'` → border 1→2px (brand.gold).
 *    language/experience-choice-card 일관.
 *  - press feedback: scale 0.99 + opacity dim.
 *  - cursor/all:unset/hover: 제거 (RN N/A).
 *  - icon 자체가 keyscreen에 없음 → Lucide Sparkles/BookOpen 선택 (RN 자체).
 *  - Footer Text 없음 — subtitle에 "언제든 설정에서 바꿀 수 있습니다" 흡수 (사양 §6 deviation 12).
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
import { Sparkles, BookOpen } from 'lucide-react-native';
import { brand, dark, light } from '@/lib/design-tokens';

export type ModeVariant = 'first-time' | 'heavy';

interface ModeChoiceCardProps {
  /**
   * "first-time" → Sparkles icon, "heavy" → BookOpen icon.
   */
  variant: ModeVariant;
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

export function ModeChoiceCard({
  variant,
  title,
  sub,
  selected,
  onPress,
}: ModeChoiceCardProps) {
  const scheme = useColorScheme();
  const borderUnselected = scheme === 'light' ? light.border.default : dark.border.default;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  const Icon = variant === 'first-time' ? Sparkles : BookOpen;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      accessibilityHint={sub}
      hitSlop={6}
      className="flex-row items-start rounded-2xl bg-surface dark:bg-surface"
      style={({ pressed }) => ({
        padding: 18,
        gap: 14,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? brand.gold : borderUnselected,
        opacity: pressed ? (selected ? 0.95 : 0.8) : selected ? 1 : 0.85,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
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
      <View className="flex-1" style={{ gap: 4 }}>
        {/* title — Inter 600 16 / text-primary dual (text-source-card-title) */}
        <Text className="font-inter-semibold text-source-card-title text-text-primary dark:text-text-primary">
          {title}
        </Text>
        {/* sub — Inter 13 / muted dual (text-card-body, lineHeight 19.5 vs keyscreen 18.2 §6 deviation 9) */}
        <Text className="font-inter text-card-body text-text-muted dark:text-text-muted">
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}
