/**
 * WineRowCompact — profile-other §N-3 신규 컴포넌트.
 *
 * handoff `OtherUserScreen` line 234~246 (WineRow).
 * 병 실루엣(22×74) + name + producer·vintage + 별점.
 *
 * §6 #8: 기존 WineFeedRow/note-wine-header-link 와 thumb 크기·별점 다름 → 신규.
 * §6 #9: handoff WMBottle → 기존 WMBottle 컴포넌트 재활용 (22×74).
 * §4-11: Pressable opacity 만, 모든 layout/visual 은 inner View (자식 3개 nested — 반드시 3-layer).
 *
 * §0-2 light-only.
 */
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { light, type TypeCanonical } from '@/lib/design-tokens';
import { WMBottle } from '@/components/shared/wm-bottle';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { WMGlassRating } from '@/components/shared/wm-glass-rating';

interface WineRowCompactProps {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
  producer_name: string | null;
  /** 0~5 평점 (반올림 표시 — handoff Math.round) */
  rating: number;
  onPress?: () => void;
}

export function WineRowCompact({
  lwin,
  display_name,
  name_ko,
  bottle_color,
  type_canonical,
  vintage,
  producer_name,
  rating,
  onPress,
}: WineRowCompactProps) {
  const { t } = useTranslation();

  const metaParts: string[] = [];
  if (producer_name) metaParts.push(producer_name);
  if (vintage != null) metaParts.push(String(vintage));
  const meta = metaParts.join(' · ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name_ko ?? display_name}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
        }}
      >
        {/* BottleThumb 22×74 */}
        <View style={{ flexShrink: 0 }}>
          <WMBottle
            width={22}
            height={74}
            bottleColor={bottle_color}
            type={(type_canonical as TypeCanonical | null) ?? null}
          />
        </View>

        {/* Col */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <WineNameDisplay
            lwin={lwin}
            name_ko={name_ko}
            display_name={display_name}
            size="card"
          />
          {meta ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 10,
                lineHeight: 12,
                color: light.text.muted,
                marginTop: 2,
              }}
            >
              {meta}
            </Text>
          ) : null}
        </View>

        {/* 별점 */}
        <View
          accessibilityLabel={t('profile.a11y.stat', {
            value: Math.round(rating),
            label: '',
          })}
          style={{ flexShrink: 0 }}
        >
          <WMGlassRating value={Math.round(rating)} size={9} />
        </View>
      </View>
    </Pressable>
  );
}
