/**
 * DrinkWindowBadge — cellar 카드의 5 status pill.
 *
 * 사양: design-spec cellar-list.md §3-9.
 * 키스크린 원본: src/components/cellar/drink-window-badge.tsx (66 LOC).
 *
 * 5 status별 색·라벨 분기:
 *   peak       → wine-red bg + cream text + "절정"
 *   opening    → gold bg + deepestDark text + "지금 마시기 좋아요"
 *   mature     → gold bg + deepestDark text + "성숙기"
 *   too-young  → tooYoungBg + text-muted + "{from}년부터" (또는 "아직 일러요")
 *   past-peak  → pastPeakBg + text-muted + "절정 지남"
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, cellar } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { DrinkWindowStatus, DrinkWindow } from '@/lib/drink-window';

interface Props {
  status: DrinkWindowStatus;
  /** too-young 상태에서 "{from}년부터" 라벨에 사용 — 없으면 fallback "아직 일러요" */
  dw?: DrinkWindow | null;
}

export function DrinkWindowBadge({ status, dw }: Props) {
  const { t } = useTranslation();
  const { scheme, text } = useThemeTokens();

  let bg: string;
  let color: string;
  let label: string;

  switch (status) {
    case 'peak':
      bg = brand.wineRed;
      color = brand.cream;
      label = t('cellar.drinkWindow.peak');
      break;
    case 'opening':
      bg = brand.gold;
      color = brand.deepestDark;
      label = t('cellar.drinkWindow.now');
      break;
    case 'mature':
      bg = brand.gold;
      color = brand.deepestDark;
      label = t('cellar.drinkWindow.mature');
      break;
    case 'too-young':
      bg = cellar.tooYoungBg[scheme];
      color = text.muted;
      // dw.from 있으면 "YYYY년부터", 없으면 fallback
      label = dw?.from ? t('cellar.drinkWindow.fromYear', { year: dw.from }) : t('cellar.drinkWindow.tooYoung');
      break;
    case 'past-peak':
    default:
      bg = cellar.pastPeakBg[scheme];
      color = text.muted;
      label = t('cellar.drinkWindow.pastPeak');
      break;
  }

  return (
    <View
      accessibilityRole="text"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: bg,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          lineHeight: 12,
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

