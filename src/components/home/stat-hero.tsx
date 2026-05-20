/**
 * StatHero — 방문 국가 / 마신 와인 / 작성 노트 3-col grid.
 *
 * 사양 home.md §2-1 line 84-89, §3-4:
 * - grid 1fr 1fr 1fr, gap 6, padding 12_16_0
 * - card padding 8_10, radius 12, bg-surface, border-default
 * - value Playfair 20 cream lh 22 ls -0.4
 * - label Inter 10 text-muted tracking 0.2
 *
 * v0.1.0: profile.stats RPC 없음 (사양 §11 P1). props로 단순 숫자 받음.
 * 부모(HeavyHome)에서 실제 데이터 또는 0 placeholder 주입.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface StatHeroProps {
  countries: number;
  wines: number;
  notes: number;
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View
      className="rounded-xl bg-surface dark:bg-surface border border-border-default dark:border-border-default"
      style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 10, gap: 1 }}
      accessibilityRole="text"
      accessibilityLabel={`${value} ${label}`}
    >
      <Text
        className="font-playfair text-text-primary dark:text-text-primary"
        style={{ fontSize: 20, lineHeight: 22, letterSpacing: -0.4 }}
      >
        {value}
      </Text>
      <Text
        className="font-inter text-text-muted dark:text-text-muted"
        style={{ fontSize: 10, letterSpacing: 0.2 }}
        allowFontScaling={false}
      >
        {label}
      </Text>
    </View>
  );
}

export function StatHero({ countries, wines, notes }: StatHeroProps) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 6, paddingTop: 12, paddingHorizontal: 16 }}>
      <StatCard value={countries} label={t('home.statCountries')} />
      <StatCard value={wines} label={t('home.statWines')} />
      <StatCard value={notes} label={t('home.statNotes')} />
    </View>
  );
}
