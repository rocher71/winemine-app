/**
 * ExternalRatingsCard — Vivino / Wine Searcher / CellarTracker 3분할 평점 카드.
 *
 * 사양: wine-detail.md §3-6 verbatim.
 *
 * SCOPE-OUT (사양 §12 Q3): external_ratings 테이블·API 부재 → v0.1.0은 stub.
 *   - 시각 형태 verbatim (header + 3 RatingSourceCell placeholders)
 *   - 점수는 "—" dash, color = text.muted
 * v0.2.0에서 external_ratings 테이블 + scheduled sync로 채움.
 *
 * 라이트 모드 업데이트 (wine-detail-light-mode-tasks.md T2):
 *   - 외부 mx-4 제거 → WineRatingsAndPriceRow 가 margin 담당
 *   - padding: 12 (vertical) + 14 (horizontal)
 *   - borderRadius: 12
 *   - Info 버튼 + footer row 제거 (compact 형태)
 *   - RatingSourceCell 사용
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { RatingSourceCell } from './rating-source-cell';

const VIVINO_COLOR = '#E10047';
const CT_COLOR = '#5b9ce6';

const SOURCES = [
  { key: 'Vivino',         accentColor: VIVINO_COLOR },
  { key: 'Wine Searcher',  accentColor: brand.gold },
  { key: 'CellarTracker',  accentColor: CT_COLOR },
] as const;

export function ExternalRatingsCard() {
  const { t } = useTranslation();
  const tokens = useThemeTokens();

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: tokens.bg.surface,
        borderWidth: 1,
        borderColor: tokens.border.default,
      }}
    >
      {/* Header */}
      <Text
        accessibilityRole="header"
        allowFontScaling={false}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 10,
          color: tokens.text.muted,
          marginBottom: 8,
        }}
      >
        {t('wineDetail.externalRatings.title')}
      </Text>

      {/* 3-col source cells */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {SOURCES.map((s) => (
          <RatingSourceCell
            key={s.key}
            source={s.key}
            score="—"
            accentColor={tokens.text.muted}
          />
        ))}
      </View>
    </View>
  );
}
