/**
 * CommunityShortcutCard — 홈 화면의 커뮤니티 진입 카드.
 *
 * 사양: community-components.md §1-4 verbatim.
 *   - LinearGradient 135deg, colors [brand.wineRed@0.2, light.bg.surface (#FFFFFF)]
 *   - padding 14/16, radius 14, border 1px gold@0.33
 *   - flex row gap 12 (Content + ChevronRight)
 *   - Title pill (gold tint, uppercase) + NEW pill (wine-red solid) + Title text + (optional) latest preview
 *
 * **DEVIATION §6-4, §6-14**: horizontal margin '0 16px' 제거 — parent (홈 화면 ScrollView contentContainerStyle paddingHorizontal:16) 분리.
 * **light-only mode** (§0-2): dark variant 생략. light.bg.surface 끝점 (#FFFFFF) 그대로 사용 (§6-13).
 * **DEVIATION §10 D**: 신규 모듈 추출 — home 화면에서 import 교체 (별도 fix).
 * **DEVIATION §10 E**: onPress = deferredToast (Toast 표시는 caller 책임 — 본 컴포넌트는 onPress prop 받음 또는 default no-op).
 *
 * §4-11 3-layer Pressable: outer Pressable + inner LinearGradient (visual + layout) + 자식.
 */
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { Toast } from '@/components/shared/toast';
import { getCommunityPosts } from '@/lib/mock/community-posts';

const TOAST_DURATION_MS = 2500;

export function CommunityShortcutCard() {
  const { t } = useTranslation();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const posts = getCommunityPosts();
  const latest = posts[0]; // 가장 최신 (mock 정렬 가정)

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    // §10 E: /community route v0.1.0 미존재 → deferredToast
    setToastMsg(t('community.shortcut.deferredToast'));
    setTimeout(() => setToastMsg(null), TOAST_DURATION_MS);
  };

  return (
    <View>
      <Pressable
        onPress={handlePress}
        accessibilityRole="link"
        accessibilityLabel={t('community.shortcut.cardLabel', {
          title: t('community.shortcut.title'),
        })}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <LinearGradient
          colors={[withAlpha(brand.wineRed, 0.2), light.bg.surface] as unknown as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: withAlpha(brand.gold, 0.33),
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Badges row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 6,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 7,
                  borderRadius: 999,
                  backgroundColor: withAlpha(brand.gold, 0.13),
                  borderWidth: 1,
                  borderColor: withAlpha(brand.gold, 0.4),
                  color: light.border.active,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 9,
                  fontWeight: '600',
                  letterSpacing: 0.72,
                  textTransform: 'uppercase',
                }}
              >
                {t('community.title')}
              </Text>

              <Text
                allowFontScaling={false}
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 7,
                  borderRadius: 999,
                  backgroundColor: brand.wineRed,
                  color: brand.cream,
                  // Inter_700Bold 폰트 미로드 — Inter_600SemiBold + fontWeight 700 사용 (system fallback bold)
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 9,
                  fontWeight: '700',
                  letterSpacing: 0.54,
                }}
              >
                NEW
              </Text>
            </View>

            {/* Title */}
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 14,
                lineHeight: 18.2,
                color: light.text.primary,
              }}
            >
              {t('community.shortcut.title')}
            </Text>

            {/* Latest preview (locale verbatim — §10 J: mock 한국어 단독 v0.1.0) */}
            {latest ? (
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 11,
                  color: light.text.muted,
                  marginTop: 4,
                }}
              >
                {latest.title}
              </Text>
            ) : null}
          </View>

          <ChevronRight size={16} strokeWidth={1.75} color={light.border.active} />
        </LinearGradient>
      </Pressable>

      {toastMsg ? (
        <View
          style={{ position: 'absolute', left: 16, right: 16, bottom: -56 }}
          pointerEvents="none"
        >
          <Toast message={toastMsg} tone="info" />
        </View>
      ) : null}
    </View>
  );
}
