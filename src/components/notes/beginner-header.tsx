/**
 * BeginnerHeader — BeginnerForm 상단 eyebrow + WineName + Producer + Greeting.
 *
 * 사양: design-spec notes-write.md §2-2 BeginnerHeader.
 * 키스크린 원본: beginner-note.tsx line 98~136.
 *
 * 구조:
 *   View
 *   ├── Eyebrow (Inter 500 11 gold uppercase ls 1.76)
 *   ├── WineName (Playfair 22 600 cream, mt 4 mb 4)
 *   ├── Producer (Inter 13 secondary)
 *   └── Greeting (Inter 12 muted lh 18 mt 8)
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { brand } from '@/lib/design-tokens';
import type { WineLocalized } from '@/hooks/use-wine';

interface Props {
  wine: WineLocalized | null;
  variant?: 'beginner' | 'expert';
}

export function BeginnerHeader({ wine, variant = 'beginner' }: Props) {
  const { t } = useTranslation();

  return (
    <View>
      {/* Eyebrow */}
      <Text
        allowFontScaling={false}
        className="font-inter-medium"
        style={{
          fontSize: 11,
          lineHeight: 11,
          letterSpacing: 1.76,
          textTransform: 'uppercase',
          color: brand.gold,
        }}
      >
        {variant === 'expert'
          ? t('notes.writeForm.modeExpertEyebrow')
          : t('notes.writeForm.modeBeginnerEyebrow')}
      </Text>

      {/* WineName (Playfair 22 600 cream, mt 4 mb 4 — sava §2-2) */}
      <View style={{ marginTop: 4, marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
        {wine?.lwin && wine.display_name ? (
          <WineNameInline
            name_ko={wine.name_ko}
            display_name={wine.display_name}
            fallbackChipLabel={t('wine.enFallbackChip')}
          />
        ) : (
          <Text
            className="font-playfair text-text-primary dark:text-text-primary"
            style={{ fontSize: 22, lineHeight: 26.4 }}
            numberOfLines={2}
          >
            {t('notes.writeForm.todaysGlass')}
          </Text>
        )}
      </View>

      {/* Producer (only when present) */}
      {wine?.producer_name ? (
        <Text
          className="font-inter text-card-body text-text-secondary dark:text-text-secondary"
          numberOfLines={1}
        >
          {wine.producer_name}
        </Text>
      ) : null}

      {/* Greeting (mt 8) */}
      <Text
        className="font-inter text-text-muted dark:text-text-muted"
        style={{ fontSize: 12, lineHeight: 18, marginTop: 8 }}
      >
        {t('notes.writeForm.beginnerGreeting')}
      </Text>
    </View>
  );
}

/**
 * 인라인 WineName — Playfair 22 (modal-title, lh 26.4) + en-fallback chip.
 * WineNameDisplay는 size 'page' 미지원이므로 BeginnerHeader 전용 인라인.
 */
function WineNameInline({
  name_ko,
  display_name,
  fallbackChipLabel,
}: {
  name_ko: string | null;
  display_name: string;
  fallbackChipLabel: string;
}) {
  const locale = currentLocale();
  const { primary, needsEnFallbackChip } = getLocalizedWineName(locale, {
    name_ko,
    display_name,
  });
  return (
    <>
      <Text
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 22, lineHeight: 26.4, flexShrink: 1 }}
        numberOfLines={2}
      >
        {primary}
      </Text>
      {needsEnFallbackChip ? (
        <View
          className="ml-2 rounded-lg border border-text-muted px-1"
          style={{ alignSelf: 'flex-start' }}
        >
          <Text className="text-card-meta font-inter text-text-muted">
            {fallbackChipLabel}
          </Text>
        </View>
      ) : null}
    </>
  );
}
