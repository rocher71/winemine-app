/**
 * RecognizedView — capture recognized stage 메인 컴포넌트.
 *
 * design-spec capture.md §3-4 ~ §3-8 verbatim 변환:
 *   - AIBadgeBanner (Sparkles + 이 와인이 맞나요? + subtitle)
 *   - RecognizedCard (PhotoFrame + MetaColumn (WineNameDisplay + Producer + MetaRow × 5))
 *   - FileNotFoundHint (photoLoadFailed=true 시)
 *   - PrimaryActions (ConfirmNote variant=primary lg / ConfirmCellar variant=cellar lg)
 *   - SecondaryActions (Retry RotateCcw / Edit Pencil)
 *
 * locale region/grapes/drinkWindow 미구현 시 row 숨김 (v0.1.0 fallback — 사양 §12-3).
 */
import { useState } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Pencil, RotateCcw } from 'lucide-react-native';
import { PrimaryButton } from '@/components/shared/primary-button';
import { getLocalizedWineName } from '@/lib/lwin';
import { currentLocale } from '@/lib/i18n';
import { AIBadgeBanner } from './ai-badge-banner';
import { PhotoFrame } from './photo-frame';
import { MetaRow } from './meta-row';
import { FileNotFoundHint } from './file-not-found-hint';
import { SecondaryIconButton } from './secondary-icon-button';
import { brand, dark, light, typography } from '@/lib/design-tokens';

export interface RecognizedWineData {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  producer_name: string | null;
  bottle_color: string;
  vintage: number | null;
  region: string | null;
  country: string | null;
  appellation: string | null;
  grapes: string[] | null;
  drinkWindowFrom: number | null;
  drinkWindowTo: number | null;
  photoUrl: string | null;
}

interface RecognizedViewProps {
  wine: RecognizedWineData;
  onConfirmNote: () => void;
  onConfirmCellar: () => void;
  onRetry: () => void;
  onEdit: () => void;
}

export function RecognizedView({
  wine,
  onConfirmNote,
  onConfirmCellar,
  onRetry,
  onEdit,
}: RecognizedViewProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const producerColor = isLight ? light.text.secondary : dark.text.secondary;
  const nameColor = isLight ? light.text.primary : brand.cream;

  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  const locale = currentLocale();
  const { primary: wineNameText, needsEnFallbackChip } = getLocalizedWineName(locale, {
    name_ko: wine.name_ko,
    display_name: wine.display_name,
  });

  const regionValue =
    wine.region && wine.country
      ? `${wine.region}, ${wine.country}`
      : wine.region || wine.country || null;
  const grapesValue = wine.grapes && wine.grapes.length > 0 ? wine.grapes.join(', ') : null;
  const drinkWindowValue =
    wine.drinkWindowFrom && wine.drinkWindowTo
      ? `${wine.drinkWindowFrom}–${wine.drinkWindowTo}`
      : null;

  return (
    <View className="gap-4">
      <AIBadgeBanner
        title={t('capture.recognized.title')}
        subtitle={t('capture.recognized.subtitle')}
      />

      <View
        className="rounded-2xl border border-border-default bg-surface dark:bg-surface"
        style={{ padding: 16, gap: 14 }}
      >
        {/* Photo+meta row */}
        <View className="flex-row items-start" style={{ gap: 14 }}>
          <PhotoFrame
            bottleColor={wine.bottle_color}
            photoUrl={wine.photoUrl}
            photoLoadFailed={photoLoadFailed}
            onLoadError={() => setPhotoLoadFailed(true)}
            producerName={wine.producer_name}
            wineName={wine.name_ko ?? wine.display_name}
            vintage={wine.vintage}
          />

          <View className="min-w-0 flex-1">
            {/* WineName — keyscreen 17 Playfair / 21.25 lh / mb 4. EN 칩 (ko mode 한글명 부재 시). */}
            <View
              className="flex-row items-center"
              style={{ marginBottom: 4 }}
              accessible
              accessibilityRole="text"
              accessibilityLabel={wineNameText}
            >
              <Text
                numberOfLines={2}
                style={{
                  fontFamily: typography.recognizedName.family,
                  fontSize: typography.recognizedName.size,
                  lineHeight: typography.recognizedName.lineHeight,
                  color: nameColor,
                  flexShrink: 1,
                }}
              >
                {wineNameText}
              </Text>
              {needsEnFallbackChip ? (
                <View className="ml-2 rounded-lg border border-text-muted px-1">
                  <Text
                    className="text-text-muted dark:text-text-muted"
                    style={{
                      fontFamily: typography.cardMeta.family,
                      fontSize: typography.cardMeta.size,
                      lineHeight: typography.cardMeta.lineHeight,
                    }}
                  >
                    {t('wine.enFallbackChip')}
                  </Text>
                </View>
              ) : null}
            </View>

            {wine.producer_name ? (
              <Text
                style={{
                  fontFamily: typography.cardMeta.family,
                  fontSize: typography.cardMeta.size,
                  lineHeight: typography.cardMeta.lineHeight,
                  color: producerColor,
                  marginBottom: 8,
                }}
              >
                {wine.producer_name}
              </Text>
            ) : null}

            {wine.vintage ? (
              <MetaRow label={t('capture.recognized.vintage')} value={String(wine.vintage)} />
            ) : null}
            {regionValue ? (
              <MetaRow label={t('capture.recognized.region')} value={regionValue} />
            ) : null}
            {wine.appellation ? (
              <MetaRow label={t('capture.recognized.appellation')} value={wine.appellation} />
            ) : null}
            {grapesValue ? (
              <MetaRow label={t('capture.recognized.grape')} value={grapesValue} />
            ) : null}
            {drinkWindowValue ? (
              <MetaRow
                label={t('capture.recognized.drinkWindow')}
                value={drinkWindowValue}
              />
            ) : null}
          </View>
        </View>

        {photoLoadFailed ? (
          <FileNotFoundHint
            title={t('capture.fileNotFound.title')}
            body={t('capture.fileNotFound.body')}
            hint={t('capture.fileNotFound.hint')}
          />
        ) : null}
      </View>

      {/* PrimaryActions column gap 10 */}
      <View style={{ gap: 10 }}>
        <PrimaryButton
          label={t('capture.recognized.confirmNote')}
          variant="primary"
          size="lg"
          onPress={onConfirmNote}
          accessibilityLabel={t('capture.recognized.confirmNote')}
        />
        <PrimaryButton
          label={t('capture.recognized.confirmCellar')}
          variant="cellar"
          size="lg"
          onPress={onConfirmCellar}
          accessibilityLabel={t('capture.recognized.confirmCellar')}
        />
      </View>

      {/* SecondaryActions row gap 10 */}
      <View className="flex-row" style={{ gap: 10 }}>
        <SecondaryIconButton
          Icon={RotateCcw}
          label={t('capture.recognized.retry')}
          onPress={onRetry}
          accessibilityHint={t('capture.a11y.retryHint')}
        />
        <SecondaryIconButton
          Icon={Pencil}
          label={t('capture.recognized.edit')}
          onPress={onEdit}
          accessibilityHint={t('capture.a11y.editHint')}
        />
      </View>
    </View>
  );
}
