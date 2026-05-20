/**
 * EmptyStatHero — first-time 모드, dashed border 카드 + 4 ellipse placeholder.
 *
 * 사양 home.md §2-2 line 174-177, §3-11:
 * - outer m 12_16_0, p 20, radius 16, bg-surface, border 1px DASHED border-default
 * - SVG cluster 4 ellipse, opacity 0.15, fill mapDark.continent
 * - title Playfair 18 cream "아직 마신 와인이 없어요"
 * - hint Inter 12 text-muted "당신의 와인 지도를 만들어보세요"
 */
import { View, Text } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { mapDark } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

const ELLIPSES = [
  { cx: 30, cy: 32, rx: 18, ry: 10 },
  { cx: 60, cy: 22, rx: 12, ry: 7 },
  { cx: 70, cy: 38, rx: 16, ry: 9 },
  { cx: 50, cy: 45, rx: 9, ry: 6 },
];

export function EmptyStatHero() {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  return (
    <View
      className="bg-surface dark:bg-surface items-center"
      style={{
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
        gap: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: tokens.border.default,
      }}
    >
      <Svg
        width="100%"
        height={70}
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid meet"
        opacity={0.15}
      >
        {ELLIPSES.map((e, i) => (
          <Ellipse
            key={i}
            cx={e.cx}
            cy={e.cy}
            rx={e.rx}
            ry={e.ry}
            fill={mapDark.continent}
          />
        ))}
      </Svg>
      <Text
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 18 }}
      >
        {t('home.firstTime.emptyMap')}
      </Text>
      <Text
        className="font-inter text-text-muted dark:text-text-muted text-center"
        style={{ fontSize: 12 }}
      >
        {t('home.firstTime.emptyMapHint')}
      </Text>
    </View>
  );
}
