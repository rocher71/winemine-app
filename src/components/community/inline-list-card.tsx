/**
 * InlineListCard — 커뮤니티 게시물에 임베드되는 리스트 카드.
 * 상단 헤더 스트립 (LIST eyebrow + 작성자 + 레벨 배지) +
 * 본문 (제목 + 병 수 + 저장 수) +
 * 와인 미리보기 3개 + "외 N병 더" 행.
 * §4-11: 3-layer Pressable. onPress 없으면 정적 렌더.
 * 디자인 원본: wm-lists-screens.jsx InlineListCard.
 */
import { View, Text, Pressable } from 'react-native';
import { Layers, Wine as WineIcon, Bookmark, ChevronRight, ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { LevelPill } from '@/components/shared/level-pill';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import type { LevelId } from '@/components/shared/level-pill';

export interface InlineListWine {
  lwin: number;
  display_name: string | null;
  name_ko: string | null;
  producer_name: string | null;
  vintage: number | null;
}

export interface InlineListData {
  id: string;
  title: string;
  wineCount: number;
  saveCount: number;
  authorName: string;
  authorInitial: string;
  authorLevel: LevelId;
  authorUserId?: string;
  previewWines: InlineListWine[];
}

interface Props {
  list: InlineListData;
  onPress?: () => void;
}

function WinePreviewRow({ wine, idx }: { wine: InlineListWine; idx: number }) {
  const { text, border } = useThemeTokens();
  const displayName = wine.display_name ?? wine.name_ko ?? '—';
  const producer = wine.producer_name ?? '';
  const vintage = wine.vintage ? String(wine.vintage) : '';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 7,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontStyle: 'italic',
          fontSize: 12,
          color: brand.goldSoft,
          fontWeight: '500',
          minWidth: 18,
          textAlign: 'right',
        }}
      >
        {String(idx + 1).padStart(2, '0')}
      </Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            color: text.primary,
            letterSpacing: -0.1,
          }}
        >
          {vintage ? `${displayName} ${vintage}` : displayName}
        </Text>
        {!!producer && (
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 10,
              color: text.muted,
              marginTop: 1,
            }}
          >
            {producer}
          </Text>
        )}
      </View>
    </View>
  );
}

export function InlineListCard({ list, onPress }: Props) {
  const { t } = useTranslation();
  const { bg, text, border } = useThemeTokens();

  const previewWines = list.previewWines.slice(0, 3);
  const remaining = list.wineCount - previewWines.length;

  const visual = (
    <View
      style={{
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.33),
        backgroundColor: bg.deep,
        shadowColor: brand.textInk,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Header strip */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: withAlpha(brand.gold, 0.06),
        }}
      >
        {/* List icon badge */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            backgroundColor: brand.goldDeep,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Layers size={12} strokeWidth={2.4} color={brand.cream} />
        </View>

        {/* Eyebrow + author */}
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 9.5,
              color: brand.goldSoft,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {t('lists.tab')}
          </Text>
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: border.default }} />
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10.5, color: text.muted }}
          >
            {list.authorName}
          </Text>
          <LevelPill level={list.authorLevel} size="sm" />
        </View>

        <ChevronRight size={13} strokeWidth={2.2} color={brand.goldSoft} />
      </View>

      {/* Body */}
      <View style={{ padding: 16, paddingTop: 14 }}>
        {/* Title */}
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 16,
            color: text.primary,
            letterSpacing: -0.3,
            lineHeight: 21,
          }}
        >
          {list.title}
        </Text>

        {/* Stats row */}
        <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <WineIcon size={11} strokeWidth={1.8} color={brand.goldSoft} />
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_700Bold', fontSize: 11.5, color: text.primary }}
            >
              {list.wineCount}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_400Regular', fontSize: 11.5, color: text.muted }}
            >
              {t('common.bottleUnit')}
            </Text>
          </View>

          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: border.default }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Bookmark size={11} strokeWidth={1.8} color={brand.goldSoft} />
            <Text
              allowFontScaling={false}
              style={{ fontFamily: 'Inter_400Regular', fontSize: 11.5, color: text.muted }}
            >
              {list.saveCount}
            </Text>
          </View>
        </View>

        {/* Wine preview list */}
        {previewWines.length > 0 && (
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 0.5,
              borderTopColor: border.default,
            }}
          >
            {previewWines.map((w, i) => (
              <WinePreviewRow key={w.lwin} wine={w} idx={i} />
            ))}

            {remaining > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingTop: 6,
                  marginLeft: 26,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: brand.goldSoft }}
                >
                  {t('common.andMore', { count: remaining, defaultValue: `외 ${remaining}병 더` })}
                </Text>
                <ArrowRight size={11} strokeWidth={2.2} color={brand.goldSoft} />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (!onPress) return visual;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      accessibilityRole="button"
    >
      {visual}
    </Pressable>
  );
}
