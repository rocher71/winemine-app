/**
 * ListCard — 내 리스트 탭의 카드 1장.
 * 왼쪽 accent stripe + 제목/설명 + 공개/비공개 chip + 푸터(병 수 · 수정일 · 저장 수).
 * §4-11: 3-layer Pressable.
 */
import { View, Text, Pressable } from 'react-native';
import { Globe, Lock, Bookmark } from 'lucide-react-native';
import { brand, listAccent, type ListAccentIndex } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { useTranslation } from 'react-i18next';
import type { WineListStats } from '@/hooks/use-wine-lists';

interface Props {
  item: WineListStats;
  onPress?: () => void;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(iso).toLocaleDateString();
}

export function ListCard({ item, onPress }: Props) {
  const { t } = useTranslation();
  const { bg, text, border } = useThemeTokens();
  const accentIdx = (item.id.charCodeAt(0) % 4) as ListAccentIndex;
  const accentColor = listAccent[accentIdx];
  const isPublic = item.visibility === 'public';

  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
        accessibilityRole="button"
      >
        <View
          style={{
            backgroundColor: bg.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: border.default,
            overflow: 'hidden',
            // shadow
            shadowColor: brand.textInk,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          {/* left accent stripe */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: accentColor,
            }}
          />

          <View style={{ padding: 12, paddingLeft: 18 }}>
            {/* header: title + visibility chip */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    fontFamily: 'PlayfairDisplay_600SemiBold',
                    fontStyle: 'italic',
                    fontSize: 20,
                    color: text.primary,
                    letterSpacing: -0.25,
                    lineHeight: 22,
                  }}
                >
                  {item.title}
                </Text>
                {!!item.description && (
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 11.5,
                      color: text.muted,
                      lineHeight: 15,
                      marginTop: 3,
                    }}
                  >
                    {item.description}
                  </Text>
                )}
              </View>

              {/* visibility icon chip */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: bg.deep,
                  borderWidth: 1,
                  borderColor: border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isPublic
                  ? <Globe size={11} strokeWidth={1.9} color={brand.goldSoft} />
                  : <Lock size={11} strokeWidth={1.9} color={text.secondary} />
                }
              </View>
            </View>

            {/* footer */}
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}
              >
                <Text style={{ fontFamily: 'Inter_700Bold', color: text.primary }}>
                  {item.wine_count}
                </Text>
                {' '}{t('common.bottleUnit', { defaultValue: '병' })}
              </Text>

              <View
                style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: border.default }}
              />

              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}
              >
                {timeAgo(item.updated_at)}
              </Text>

              {!!item.creator_name && (
                <>
                  <View
                    style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: border.default }}
                  />
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 11,
                      color: text.muted,
                      maxWidth: 72,
                    }}
                  >
                    {item.creator_name}
                  </Text>
                </>
              )}

              <View style={{ flex: 1 }} />

              {item.save_count > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Bookmark size={11} strokeWidth={2} color={isPublic ? brand.wineRed : accentColor} />
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_700Bold',
                      fontSize: 11,
                      color: isPublic ? brand.wineRed : accentColor,
                    }}
                  >
                    {item.save_count}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
