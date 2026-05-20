/**
 * DrinkWindowCard — Section 2 wrapper: Badge + RangeText + Timeline + TipRow.
 *
 * 사양: design-spec cellar-detail.md §2 line 84~99, §3-3.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 130~176 verbatim.
 *
 * 구조:
 *   outer (mx-4 rounded-2xl bg-surface border padding 16)
 *     HeaderRow (flex-row items-center justify-between mb-3)
 *       └── DrinkWindowBadge (status, dw)
 *       └── RangeText (Inter 11 muted "2026년 ~ 2050년")
 *     DrinkWindowTimeline (height 28)
 *     TipRow (mt 12, Inter 12 secondary)
 *       └── "이 와인은 {peak}년에 절정에 도달합니다"
 *       └── inline gold span (ml 6) "· 절정까지 +{n}년"  (n > 0일 때만)
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { DrinkWindowBadge } from '@/components/cellar/drink-window-badge';
import { DrinkWindowTimeline } from '@/components/cellar/drink-window-timeline';
import type { DrinkWindow, DrinkWindowStatus } from '@/lib/drink-window';

interface Props {
  status: DrinkWindowStatus;
  dw: DrinkWindow;
  currentYear?: number;
}

export function DrinkWindowCard({ status, dw, currentYear }: Props) {
  const { t } = useTranslation();
  const now = currentYear ?? new Date().getFullYear();
  const yearsToPeak = dw.peak - now;

  return (
    <View
      className="mx-4 rounded-2xl bg-surface dark:bg-surface border border-border-default"
      style={{ padding: 16 }}
    >
      {/* HeaderRow */}
      <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
        <DrinkWindowBadge status={status} dw={dw} />
        <Text
          allowFontScaling={false}
          className="font-inter text-text-muted dark:text-text-muted"
          style={{ fontSize: 11, lineHeight: 13.2 }}
        >
          {t('cellar.drinkWindow.fromTo', { from: dw.from, to: dw.to })}
        </Text>
      </View>

      {/* Timeline */}
      <DrinkWindowTimeline from={dw.from} peak={dw.peak} to={dw.to} currentYear={now} />

      {/* TipRow — main text + inline gold span (절정까지 +N년) */}
      <Text
        className="font-inter text-text-secondary dark:text-text-secondary"
        style={{ fontSize: 12, lineHeight: 14.4, marginTop: 12 }}
      >
        {t('cellar.drinkWindow.tip', { year: dw.peak })}
        {yearsToPeak > 0 ? (
          <Text style={{ color: brand.gold, marginLeft: 6 }}>
            {`  ·  ${t('cellar.drinkWindow.peakInYears', { n: yearsToPeak })}`}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
