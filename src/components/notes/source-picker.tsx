/**
 * SourcePicker — Stage 2 인라인 picker (CellarCard + NewWineCard).
 *
 * 사양: design-spec notes-new.md §2 (line 85~118) + §3 매핑표.
 * 키스크린 원본: src/components/tasting-note/source-picker.tsx (line 39~118 verbatim).
 *
 * 구조:
 *   View (gap-2.5)
 *   ├── CellarCard (Pressable)
 *   │   - bg-surface, border 1px (gold if !disabled, border-default if disabled)
 *   │   - radius 14, padding 18, gap 6
 *   │   - opacity 1 (or 0.5 if cellarCount===0)
 *   │   ├── Wine icon (28 strokeWidth 1.5 gold)
 *   │   ├── Title (Inter 16 600 cream — sourceCardTitle)
 *   │   └── Sub (Inter 12 secondary — sourceCardSub) — "{count}병 보관 중" or "셀러가 비어있어요"
 *   └── NewWineCard (Pressable)
 *       - bg-surface, border 1px wine-red, radius 14, padding 18, gap 6
 *       ├── Camera icon (28 strokeWidth 1.5 wine-red)
 *       ├── Title (Inter 16 600 cream)
 *       └── Sub (Inter 12 secondary)
 */
import { Pressable, View, Text } from 'react-native';
import { Wine, Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface SourcePickerProps {
  cellarCount: number;
  onPickCellar: () => void;
  onPickNewEntry: () => void;
}

export function SourcePicker({ cellarCount, onPickCellar, onPickNewEntry }: SourcePickerProps) {
  const { t } = useTranslation();
  const cellarDisabled = cellarCount === 0;

  return (
    <View style={{ gap: 10 }}>
      <CellarCard
        disabled={cellarDisabled}
        cellarCount={cellarCount}
        onPress={() => {
          if (cellarDisabled) return;
          Haptics.selectionAsync().catch(() => undefined);
          onPickCellar();
        }}
        title={t('notes.source.fromCellar')}
        subEmpty={t('notes.source.fromCellarEmpty')}
        subWithCount={t('notes.source.fromCellarSub', { count: cellarCount })}
        a11yHint={t('notesNew.sourcePicker.cellarHint')}
      />
      <NewWineCard
        onPress={() => {
          Haptics.selectionAsync().catch(() => undefined);
          onPickNewEntry();
        }}
        title={t('notes.source.newEntry')}
        sub={t('notes.source.newEntrySub')}
        a11yHint={t('notesNew.sourcePicker.newEntryHint')}
      />
    </View>
  );
}

interface CellarCardProps {
  disabled: boolean;
  cellarCount: number;
  onPress: () => void;
  title: string;
  subEmpty: string;
  subWithCount: string;
  a11yHint: string;
}

function CellarCard({
  disabled,
  cellarCount,
  onPress,
  title,
  subEmpty,
  subWithCount,
  a11yHint,
}: CellarCardProps) {
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const disabledBorder = scheme === 'light' ? light.border.default : dark.border.default;
  const borderColor = disabled ? disabledBorder : brand.gold;
  const sub = disabled ? subEmpty : subWithCount;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title} ${sub}`}
      accessibilityHint={disabled ? undefined : a11yHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: surfaceBg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor,
          padding: 18,
          gap: 6,
        }}
      >
        <Wine size={28} strokeWidth={1.5} color={brand.gold} />
        <Text
          className="font-inter-semibold text-text-primary dark:text-text-primary"
          style={{ fontSize: 16, lineHeight: 19.2 }}
        >
          {title}
        </Text>
        <Text
          className="font-inter text-text-secondary dark:text-text-secondary"
          style={{ fontSize: 12, lineHeight: 16.8 }}
        >
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}

interface NewWineCardProps {
  onPress: () => void;
  title: string;
  sub: string;
  a11yHint: string;
}

function NewWineCard({ onPress, title, sub, a11yHint }: NewWineCardProps) {
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={a11yHint}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          backgroundColor: surfaceBg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: brand.gold,
          padding: 18,
          gap: 6,
        }}
      >
        <Camera size={28} strokeWidth={1.5} color={brand.gold} />
        <Text
          className="font-inter-semibold text-text-primary dark:text-text-primary"
          style={{ fontSize: 16, lineHeight: 19.2 }}
        >
          {title}
        </Text>
        <Text
          className="font-inter text-text-secondary dark:text-text-secondary"
          style={{ fontSize: 12, lineHeight: 16.8 }}
        >
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}
