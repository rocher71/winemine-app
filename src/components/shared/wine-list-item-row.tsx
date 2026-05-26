/**
 * WineListItemRow — 리스트 상세 화면의 와인 1행.
 * 번호(Cormorant italic, zero-pad) + 와인명/생산자/지역 + note chip + chevron.
 * 스펙: "리스트 표시 시 일러스트/이미지 없음" → 텍스트만 표시.
 * §4-11: 3-layer Pressable (outer flex → Pressable opacity → inner View visual).
 */
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Wine {
  lwin: number;
  display_name: string | null;
  name_ko: string | null;
  producer_name: string | null;
  country: string | null;
  region: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
  note?: string | null;
}

interface Props {
  wine: Wine | null;
  idx: number;
  onPress?: () => void;
}

export function WineListItemRow({ wine, idx, onPress }: Props) {
  const { t } = useTranslation();
  const { bg, text, border } = useThemeTokens();
  const displayName = wine?.display_name ?? wine?.name_ko ?? '—';
  const producer = wine?.producer_name ?? '';
  const region = [wine?.region, wine?.country].filter(Boolean).join(', ');
  const vintage = wine?.vintage ? String(wine.vintage) : '';
  const hasNote = !!wine?.note;

  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 20,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: border.default,
            backgroundColor: bg.surface,
          }}
        >
          {/* 번호 — Cormorant italic, zero-pad */}
          <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'PlayfairDisplay_600SemiBold',
                fontStyle: 'italic',
                fontSize: 15,
                color: text.muted,
                lineHeight: 18,
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </Text>
          </View>

          {/* 텍스트 정보 */}
          <View style={{ flex: 1 }}>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={{ fontFamily: 'Inter_500Medium', fontSize: 13.5, color: text.primary, lineHeight: 18 }}
            >
              {vintage ? `${displayName} ${vintage}` : displayName}
            </Text>
            {!!producer && (
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.secondary, lineHeight: 15, marginTop: 2 }}
              >
                {producer}
              </Text>
            )}
            {!!region && (
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted, lineHeight: 14, marginTop: 1 }}
              >
                {region}
              </Text>
            )}
          </View>

          {/* note chip */}
          {hasNote && (
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: withAlpha(brand.gold, 0.12),
                borderWidth: 1,
                borderColor: withAlpha(brand.gold, 0.35),
              }}
            >
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: brand.gold, lineHeight: 13 }}
              >
                {t('lists.note_chip')}
              </Text>
            </View>
          )}

          {/* chevron */}
          {!!onPress && <ChevronRight size={16} strokeWidth={1.75} color={text.muted} />}
        </View>
      </Pressable>
    </View>
  );
}
