/**
 * CommentWineCard — 댓글에 첨부된 와인 카드 (요구4).
 *
 * 커뮤니티 포스트의 WineEmbedCard 와 동일한 시각 언어(bottle + 이 와인 eyebrow + 이름 + chevron)를
 * 댓글 맥락에 맞게 compact 하게 재현. 단, 데이터 소스는 슬러그 기반 WINE_EMBEDS 가 아니라
 * 실 MOCK_WINES(LWIN) 이므로 별도 컴포넌트로 분리.
 *
 * 데이터: getMockWineByLwin(lwin) — resolve 실패 시 null 반환 (카드 미렌더).
 *
 * **light-only mode** (§0-2): dark variant 생략.
 * §4-11 Pressable 2-layer: outer Pressable(opacity-only) + inner visual View.
 * §4-10: borderRadius 원형 없음 / marginTop poke-out 없음 — 변환 대상 아님.
 */
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pin, ChevronRight } from 'lucide-react-native';
import { brand, light, withAlpha, type TypeCanonical } from '@/lib/design-tokens';
import { WMBottle } from '@/components/shared/wm-bottle';
import { getMockWineByLwin } from '@/lib/mock/wines';

interface CommentWineCardProps {
  lwin: string;
  /** true 시 카드 탭으로 /wine/[lwin] 라우팅 (CommentRow 의 outer Pressable 충돌 없음 — row 는 Pressable 아님). */
  linkToWine?: boolean;
}

export function CommentWineCard({ lwin, linkToWine = true }: CommentWineCardProps) {
  const { t } = useTranslation();
  const wine = getMockWineByLwin(lwin);
  if (!wine) return null;

  const displayName = wine.name_ko ?? wine.display_name ?? 'Wine';
  const sub = [wine.producer_name, wine.vintage].filter(Boolean).join(' · ');

  const wineLwin = wine.lwin;
  const handlePress =
    linkToWine && wineLwin
      ? () => router.push(`/wine/${encodeURIComponent(wineLwin)}`)
      : undefined;

  const visual = (
    <View
      style={{
        marginTop: 8,
        padding: 10,
        borderRadius: 12,
        backgroundColor: light.bg.deep,
        borderWidth: 1,
        borderColor: withAlpha(light.border.active, 0.2),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <WMBottle
        width={22}
        height={74}
        bottleColor={wine.bottle_color ?? brand.wineRed}
        type={(wine.type_canonical as TypeCanonical | null) ?? null}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
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
            fontSize: 12,
            lineHeight: 15.6,
            color: light.text.primary,
          }}
        >
          {displayName}
        </Text>

        {!!sub && (
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
            {sub}
          </Text>
        )}
      </View>

      <ChevronRight size={14} strokeWidth={1.75} color={light.border.active} />
    </View>
  );

  if (!handlePress) return visual;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${t('community.wineEmbed.eyebrow')} · ${displayName}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      {visual}
    </Pressable>
  );
}
