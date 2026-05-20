/**
 * DrinkWindowTimeline — Section 2 inner: 4px track + 5-stop gradient + peak marker + current dot + from/to 라벨.
 *
 * 사양: design-spec cellar-detail.md §3-4.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 372~447 인라인 컴포넌트 verbatim.
 *
 * ratio 계산:
 *   total   = to - from
 *   nowPct  = ((now - from) / total) * 100, clamp [0, 100]
 *   peakPct = ((peak - from) / total) * 100
 *
 * 구조 (height 28):
 *   - track bar (top 12 left 0 right 0 height 4 radius 2 LinearGradient 90deg 5-stop)
 *   - peak marker (top 6 left peakPct% width 2 height 16 bg wineRed translateX -50%)
 *   - current dot (top 8 left nowPct% width 12 height 12 radius 6 bg cream + border 2px deepest translateX -50%)
 *   - from/to year labels (top 22 left/right 0, Inter 10 muted)
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brand, drinkWindowTimelineGradient } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  from: number;
  peak: number;
  to: number;
  /** 현재 연도 — test 주입 가능 */
  currentYear?: number;
}

function clampPct(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function DrinkWindowTimeline({ from, peak, to, currentYear }: Props) {
  const { t } = useTranslation();
  const { bg } = useThemeTokens();
  const now = currentYear ?? new Date().getFullYear();

  const total = to - from;
  const nowPct = total > 0 ? clampPct(((now - from) / total) * 100) : 50;
  const peakPct = total > 0 ? clampPct(((peak - from) / total) * 100) : 50;

  return (
    <View style={{ position: 'relative', height: 28 }}>
      {/* Track bar — 5-stop horizontal gradient */}
      <LinearGradient
        colors={
          drinkWindowTimelineGradient.colors as unknown as readonly [
            string,
            string,
            string,
            string,
            string,
          ]
        }
        locations={
          drinkWindowTimelineGradient.locations as unknown as readonly [
            number,
            number,
            number,
            number,
            number,
          ]
        }
        start={drinkWindowTimelineGradient.start}
        end={drinkWindowTimelineGradient.end}
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: 2,
        }}
      />

      {/* Peak marker — 2×16 wineRed vertical line */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          top: 6,
          left: `${peakPct}%`,
          width: 2,
          height: 16,
          backgroundColor: brand.wineRed,
          marginLeft: -1,
        }}
      />

      {/* Current dot — 12×12 cream circle + border 2px deepest */}
      <View
        accessibilityRole="text"
        accessibilityLabel={t('cellar.drinkWindow.a11y.currentYear', { year: now })}
        style={{
          position: 'absolute',
          top: 8,
          left: `${nowPct}%`,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: brand.cream,
          borderWidth: 2,
          borderColor: bg.deepest,
          marginLeft: -6,
        }}
      />

      {/* from/to year labels (Inter 10 muted) */}
      <View
        style={{
          position: 'absolute',
          top: 22,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text
          allowFontScaling={false}
          className="font-inter text-text-muted dark:text-text-muted"
          style={{ fontSize: 10, lineHeight: 12 }}
        >
          {from}
        </Text>
        <Text
          allowFontScaling={false}
          className="font-inter text-text-muted dark:text-text-muted"
          style={{ fontSize: 10, lineHeight: 12 }}
        >
          {to}
        </Text>
      </View>
    </View>
  );
}
