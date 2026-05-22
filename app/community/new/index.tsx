/**
 * /community/new — 글 작성 타입 picker (5종 PostTypeCard + Tonight CTA).
 *
 * 사양: _workspace/design-specs/community-new.md (1231 LOC) — 화면 A.
 *
 * §0-2 light-only mode (dark variant SKIP).
 *
 * §10 결정 (사양 명시):
 *   A: POST_TYPES href — note→/notes/new, column→/community/new/column,
 *      album→/community/new/album, question/news → deferredToast (Alert.alert).
 *   B: POST_TYPES module = src/lib/community/post-types.ts (이 파일은 import만).
 *   C: LightCloseHeader inline (v0.2.0 모듈 추출 follow-up).
 *   D: Close 미저장 confirm — 본 화면 (picker) 은 입력 state 없음 → 그냥 router.back().
 *   D2: Tonight CTA → deferredToast `community.compose.tonightDeferred` v0.1.0.
 *
 * §4-11 Pressable 안전 패턴:
 *   - Close button: 2-layer (icon 1개)
 *   - PostTypeCard × 5: 3-layer (icon wrap + text wrap + chevron 자식 다수)
 *   - Tonight CTA: 3-layer (Moon + 2 Text + Chevron)
 *
 * §6 RN deviation:
 *   - 6-2: borderBottom 0.5px → StyleSheet.hairlineWidth
 *   - 6-3: cream → light.text.primary, gold → light.border.active (대비)
 *   - 6-5: <br/> → \n (i18n value 내 escape)
 *   - 6-7: postTypeBadgeColorLight (column cream invisible 대체)
 *   - 6-8: lucide Image → ImageIcon alias (expo-image 충돌 회피)
 *   - 6-22: borderRadius 999 (XP badge capsule) — height 작아 999 유지 OK
 */
import { useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Moon, X } from 'lucide-react-native';

import { brand, light, withAlpha } from '@/lib/design-tokens';
import { POST_TYPES, type PostTypeOption } from '@/lib/community/post-types';

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function CommunityNewIndexScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightCloseHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <IntroSection />
        <CardsList />
        <TonightCta />
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LightCloseHeader (inline — §10 C 본 cycle 인라인 유지)
// ────────────────────────────────────────────────────────────────────────────

function LightCloseHeader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    // §10 D: 본 화면 (picker) 은 입력 state 없음 → 그냥 router.back()
    router.back();
  }, []);

  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: light.border.default,
      }}
    >
      <Pressable
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel={t('community.compose.closeLabel')}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <X size={18} strokeWidth={1.75} color={light.text.secondary} />
        </View>
      </Pressable>
      <Text
        allowFontScaling={false}
        accessibilityRole="header"
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'Freesentation_4Regular',
          fontSize: 16,
          color: light.text.primary,
        }}
      >
        {t('community.compose.newPost')}
      </Text>
      {/* Spacer — keyscreen verbatim 36 width */}
      <View style={{ width: 36, flexShrink: 0 }} />
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// IntroSection — Eyebrow + Heading
// ────────────────────────────────────────────────────────────────────────────

function IntroSection() {
  const { t } = useTranslation();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          color: light.border.active,
          letterSpacing: 1.8,
        }}
      >
        {t('community.compose.todayIs').toUpperCase()}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          marginTop: 6,
          fontFamily: 'Freesentation_4Regular',
          fontSize: 24,
          lineHeight: 28.8,
          color: light.text.primary,
        }}
      >
        {t('community.compose.heading')}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// CardsList — 5 PostTypeCard map
// ────────────────────────────────────────────────────────────────────────────

function CardsList() {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 24,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {POST_TYPES.map((opt) => (
        <PostTypeCard key={opt.id} option={opt} />
      ))}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PostTypeCard — §1-A-1 (3-layer Pressable, 자식 복잡)
// ────────────────────────────────────────────────────────────────────────────

interface PostTypeCardProps {
  option: PostTypeOption;
}

function PostTypeCard({ option }: PostTypeCardProps) {
  const { t } = useTranslation();
  const Icon = option.icon;

  const handlePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    if (option.routerKind === 'route') {
      router.push(option.target as never);
    } else {
      Alert.alert(t('app.name'), t(option.target));
    }
  }, [option, t]);

  const label = t(option.labelKey);
  const sub = t(option.descKey);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${sub}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderRadius: 14,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderColor: light.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {/* Icon wrap (44×44) */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: withAlpha(option.colorLight, 0.1),
            borderWidth: 1,
            borderColor: withAlpha(option.colorLight, 0.33),
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} strokeWidth={1.75} color={option.colorLight} />
        </View>
        {/* Text wrap */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontSize: 15,
                color: light.text.primary,
              }}
            >
              {label}
            </Text>
            {option.badge != null && (
              <View
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 7,
                  borderRadius: 999,
                  backgroundColor: withAlpha(brand.gold, 0.13),
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontWeight: '600',
                    fontSize: 9,
                    color: light.border.active,
                  }}
                >
                  {option.badge}
                </Text>
              </View>
            )}
          </View>
          <Text
            allowFontScaling={false}
            style={{
              marginTop: 3,
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: light.text.muted,
            }}
          >
            {sub}
          </Text>
        </View>
        <ChevronRight size={16} strokeWidth={1.75} color={light.text.muted} />
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TonightCta — §1-A 마지막 섹션 (3-layer)
// ────────────────────────────────────────────────────────────────────────────

function TonightCta() {
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    // §10 D2: v0.1.0 = deferredToast (route /community/tonight 미존재)
    Alert.alert(t('app.name'), t('community.compose.tonightDeferred'));
  }, [t]);

  const title = t('community.compose.tonightTitle');
  const sub = t('community.compose.tonightSub');

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 24, marginHorizontal: 16 })}
    >
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: withAlpha(brand.gold, 0.05),
          borderWidth: 1,
          borderColor: light.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Moon size={20} strokeWidth={1.75} color={light.border.active} />
        <View style={{ flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 12,
              color: light.text.primary,
            }}
          >
            {title}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              marginTop: 2,
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
            }}
          >
            {sub}
          </Text>
        </View>
        <ChevronRight size={16} strokeWidth={1.75} color={light.border.active} />
      </View>
    </Pressable>
  );
}
