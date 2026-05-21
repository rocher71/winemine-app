/**
 * TemplateCard — Stage 1 Template Picker 카드.
 *
 * 사양: design-spec notes-new.md §2 (line 144~167 — TemplateCard 구조 verbatim) + §3 매핑표.
 * 키스크린 원본: src/app/notes/new/page.tsx line 211~305 (인라인 TemplateCard).
 *
 * 구조:
 *   Pressable (flex-row items-center gap-3 px-4 py-3.5, bg-surface,
 *              border 1px (custom: gold/0.4 / others: border-default),
 *              radius 14)
 *   ├── TextStack (flex-1, minWidth:0)
 *   │   ├── TitleRow (flex-row items-center gap-1.5 mb-1)
 *   │   │   ├── Title (Inter 14 600 cream — typography.templateCardTitle)
 *   │   │   └── [if custom] CustomBadge (gold/0.15 bg + gold/0.4 border, Inter 9 600 uppercase ls 0.45)
 *   │   ├── Author (Inter 11 muted — typography.templateCardAuthor)
 *   │   └── [if desc] Description (Inter 12 secondary, numberOfLines=2)
 *   └── ChevronRight 16 muted
 *
 * Press feedback: scale 0.98. Haptics.selectionAsync.
 */
import { Pressable, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, dark, light, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { TemplateKind } from '@/lib/notes/builtin-templates';

interface TemplateCardProps {
  kind: TemplateKind;
  title: string;
  description?: string | null;
  /** custom 양식 작성자 (v0.1.0은 항상 null — builtin만 표시) */
  authorName?: string | null;
  onPress: () => void;
}

export function TemplateCard({
  kind,
  title,
  description,
  authorName,
  onPress,
}: TemplateCardProps) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const isCustom = kind === 'custom';
  const borderColor = isCustom
    ? withAlpha(brand.gold, 0.4)
    : scheme === 'light'
    ? light.border.default
    : dark.border.default;
  const chevronColor = scheme === 'light' ? light.text.muted : dark.text.muted;
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;

  // Author label: builtin → "winemine 제공" / custom + authorName → "by {name}" / else null
  const authorLabel =
    kind === 'builtinBeginner' || kind === 'builtinExpert'
      ? t('notesNew.templatePicker.byWinemine')
      : authorName
      ? `by ${authorName}`
      : null;

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${isCustom ? ` ${t('notesNew.templatePicker.customBadge')}` : ` ${t('notesNew.templatePicker.byWinemine')}`}`}
      accessibilityHint={t('notesNew.templatePicker.cardHint')}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: surfaceBg,
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* TitleRow */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
            }}
          >
            <Text
              className="font-inter-semibold text-text-primary dark:text-text-primary"
              style={{ fontSize: 14, lineHeight: 16.8 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {isCustom ? (
              <View
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 9999,
                  backgroundColor: withAlpha(brand.gold, 0.15),
                  borderWidth: 1,
                  borderColor: withAlpha(brand.gold, 0.4),
                }}
              >
                <Text
                  className="font-inter-semibold"
                  style={{
                    fontSize: 9,
                    lineHeight: 11,
                    color: brand.gold,
                    letterSpacing: 0.45,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('notesNew.templatePicker.customBadge')}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Author */}
          {authorLabel ? (
            <Text
              className="font-inter text-text-muted dark:text-text-muted"
              style={{ fontSize: 11, lineHeight: 13.2 }}
              numberOfLines={1}
            >
              {authorLabel}
            </Text>
          ) : null}

          {/* Description (numberOfLines=2) */}
          {description ? (
            <Text
              className="font-inter text-text-secondary dark:text-text-secondary"
              style={{ fontSize: 12, lineHeight: 17.4, marginTop: 6 }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          ) : null}
        </View>

        <ChevronRight size={16} color={chevronColor} />
      </View>
    </Pressable>
  );
}
