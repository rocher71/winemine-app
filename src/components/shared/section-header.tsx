/**
 * SectionHeader — eyebrow + title + 우측 action 링크 (home Editorial Stack 공용).
 *
 * 사양 home.md §1 (`.sec-head`), §재사용 맵 9-1. home/notes/community 공용.
 * - eyebrow: 11 ls 1.76 gold uppercase (typography.homeEyebrowSerif)
 * - title: Playfair 20 ls -0.2 (typography.homeSectionTitle)
 * - action(옵션): 우측 정렬 링크 텍스트 — onPress 없으면 비-탭(hint) 텍스트
 *
 * §4-11: action은 Pressable(hit+opacity)만, 텍스트는 inner Text. layout은 inline style.
 */
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brand, typography } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  /** 우측 action 라벨. 없으면 미표시 */
  actionLabel?: string;
  /** action onPress. 없고 actionLabel만 있으면 비-탭 hint 텍스트 */
  onActionPress?: () => void;
}

export function SectionHeader({ eyebrow, title, actionLabel, onActionPress }: SectionHeaderProps) {
  const tokens = useThemeTokens();
  const goldAccent = tokens.scheme === 'light' ? brand.goldDeep : brand.gold;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: typography.homeEyebrowSerif.family,
            fontSize: typography.homeEyebrowSerif.size,
            lineHeight: typography.homeEyebrowSerif.lineHeight,
            letterSpacing: typography.homeEyebrowSerif.letterSpacing,
            textTransform: typography.homeEyebrowSerif.textTransform,
            color: goldAccent,
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </Text>
        <Text
          style={{
            fontFamily: typography.homeSectionTitle.family,
            fontSize: typography.homeSectionTitle.size,
            lineHeight: typography.homeSectionTitle.lineHeight,
            letterSpacing: typography.homeSectionTitle.letterSpacing,
            color: tokens.text.primary,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      {actionLabel ? (
        onActionPress ? (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              onActionPress();
            }}
            accessibilityRole="link"
            accessibilityLabel={actionLabel}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              style={{
                fontFamily: typography.sectionLink.family,
                fontSize: typography.sectionLink.size,
                color: goldAccent,
                marginLeft: 10,
                paddingBottom: 2,
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : (
          <Text
            style={{
              fontFamily: typography.sectionLink.family,
              fontSize: typography.sectionLink.size,
              color: tokens.text.muted,
              marginLeft: 10,
              paddingBottom: 2,
            }}
          >
            {actionLabel}
          </Text>
        )
      ) : null}
    </View>
  );
}
