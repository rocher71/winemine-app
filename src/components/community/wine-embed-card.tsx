/**
 * WineEmbedCard — 커뮤니티 노트/칼럼 포스트의 와인 임베드 카드.
 *
 * 사양: GAP-REPORT §Shared components — WineEmbedCard (P0).
 *   - 기존 inline stub (wineId 슬러그 텍스트 / 아이콘) 대체.
 *   - WMBottle 실루엣 + `이 와인` eyebrow + nameKo + producer · vintage + chevron.
 *   - 사용처: A (피드 노트 카드), D (상세 노트), E (상세 칼럼 inline).
 *
 * 데이터: getWineEmbed(wineId) — 슬러그 → 와인 메타 (mock, v0.2.0 supabase 대체).
 *   resolve 실패(null) 시 컴포넌트 자체가 null 반환 (stub 텍스트 노출 제거).
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * **DEVIATION §6-2**: keyscreen cream nameKo → light.text.primary (cream invisible on white).
 * **DEVIATION §6-5**: keyscreen gold (pin/eyebrow/chevron) → light.border.active (deep gold AA pass).
 *   디자인 dark 토큰 (WM.bgDeep / WM.gold@0.2) 직역 금지 — light 매핑:
 *     bg = light.bg.deep, border = withAlpha(light.border.active, 0.2).
 * **DEVIATION (LWIN 카탈로그 한계 §4-9)**: nameKo 는 와인명 데이터 — en 모드에서도 한글명 fallback 허용.
 *
 * §4-11 Pressable 3-layer: onPress 있으면 outer Pressable (opacity-only) + inner visual View.
 *   onPress 없으면 plain View (hit target 불필요).
 */
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Pin, ChevronRight } from 'lucide-react-native';
import { light, withAlpha } from '@/lib/design-tokens';
import { WMBottle } from '@/components/shared/wm-bottle';
import { getWineEmbed } from '@/lib/mock/community-posts';

interface WineEmbedCardProps {
  wineId?: string;
  mini?: boolean;
  onPress?: () => void;
}

export function WineEmbedCard({ wineId, mini = false, onPress }: WineEmbedCardProps) {
  const { t } = useTranslation();
  const wine = getWineEmbed(wineId);
  if (!wine) return null;

  const bottleW = mini ? 22 : 28;
  const bottleH = mini ? 74 : 94;

  const visual = (
    <View
      style={{
        marginTop: 10,
        padding: mini ? 10 : 12,
        borderRadius: 12,
        backgroundColor: light.bg.deep,
        borderWidth: 1,
        borderColor: withAlpha(light.border.active, 0.2),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <WMBottle
        width={bottleW}
        height={bottleH}
        bottleColor={wine.bottleColor}
        type={wine.type}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        {/* eyebrow row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pin size={10} strokeWidth={1.75} color={light.border.active} />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 9,
              fontWeight: '600',
              color: light.border.active,
              letterSpacing: 1.26,
              textTransform: 'uppercase',
            }}
          >
            {t('community.wineEmbed.eyebrow')}
          </Text>
        </View>

        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            marginTop: 3,
            fontFamily: 'Freesentation_6SemiBold',
            fontSize: 12.5,
            lineHeight: 16.25,
            color: light.text.primary,
          }}
        >
          {wine.nameKo}
        </Text>

        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            marginTop: 1,
            fontFamily: 'Freesentation_4Regular',
            fontSize: 10,
            color: light.text.muted,
          }}
        >
          {`${wine.producer} · ${wine.vintage}`}
        </Text>
      </View>

      <ChevronRight size={14} strokeWidth={1.75} color={light.border.active} />
    </View>
  );

  if (!onPress) return visual;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('community.wineEmbed.eyebrow')} · ${wine.nameKo}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      {visual}
    </Pressable>
  );
}
