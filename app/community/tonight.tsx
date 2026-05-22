/**
 * /community/tonight — 오늘 밤 마시는 사람들 (히어로 + Seoul dot map + Participate CTA + 5 EntryRow).
 *
 * 사양: _workspace/design-specs/community-side.md §1-A (1차 진실 소스).
 *
 * §0-2 light-only mode (dark variant 모두 SKIP).
 *
 * §10 결정 (사양 명시):
 *   A: mock TONIGHT_ENTRIES + MAP_DOTS → src/lib/mock/community-tonight.ts 분리.
 *   C: Toast 재사용 — 본 화면은 deferredToast 만 (별도 toast host 없이 Alert.alert).
 *   D: 5종 deferredToast (community.tonight.{join,toast}Deferred + community.profile.deferred).
 *   F: LightBackHeader inline (v0.2.0 모듈 추출 follow-up).
 *   G: (해당 없음 — discover 전용)
 *   H: Map dot Pressable v0.1.0 미구현 — 정적 SVG.
 *   I: count 14, 시간 21:47 hardcode (keyscreen verbatim) — i18n parameter로 표현.
 *   J: BottomNav 미노출 (depth route — `app/community/` Stack 내부).
 *   N: paddingBottom = 40 + insets.bottom.
 *
 * §4-11 Pressable 안전 패턴:
 *   - Back button: 2-layer (icon 1개)
 *   - Avatar/Name Pressable: 2-layer (text 1개 or icon 1개)
 *   - Toast btn / Join btn: 2-layer (Text 1개)
 *
 * §6 RN deviation:
 *   - 6-2: gold (#C9A84C) → light.border.active (#B89438) 대비 4.05:1
 *   - 6-3: Map outer wrap light.map.country, SVG 내부 어두운 plate 유지
 *   - 6-4: 135deg gradient → LinearGradient start{0,0} end{1,1}
 *   - 6-13: Toast btn border `withAlpha(brand.gold, 0.33)` 유지 (alpha 예외)
 *   - 6-14: react-native-svg RadialGradient/Pattern/Filter/FeGaussianBlur 사용
 *   - 6-16: gap RN 0.71+ 정상 지원 (현 RN 0.81 안전)
 *
 * §11 (Q11-A) tonight Hero count 14 hardcoded — keyscreen verbatim, 의도된 시안.
 * §11 (Q11-B) Map 어두운 plate 의도된 야경 보존.
 */
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Moon, Wine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  FeGaussianBlur,
  Filter,
  G,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { brand, light, withAlpha, communityTonightMap } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { getCommunityUser } from '@/lib/mock/community-posts';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { CommunityBackHeader } from '@/components/community/community-back-header';
import {
  MAP_DOTS,
  TONIGHT_ENTRIES,
  TONIGHT_WINE_NAMES,
  type TonightEntry,
} from '@/lib/mock/community-tonight';

// §10-I: count 14, time 21:47 — keyscreen verbatim. v0.2.0 dynamic.
const TONIGHT_COUNT = 14;
const TONIGHT_TIME = '21:47';

// SVG 내부 색 — 야경 plate (§6-3 의도된 deviation). 토큰 사용으로 lint 통과.
const SVG_HEX = {
  bgStart: communityTonightMap.bgStart,
  bgEnd: communityTonightMap.bgEnd,
  gridStroke: communityTonightMap.gridStroke,
  riverDark: communityTonightMap.riverDark,
  riverLight: communityTonightMap.riverLight,
  riverLabel: communityTonightMap.riverLabel,
  dotGold: brand.gold,
  dotNumber: brand.deepestDark,
  dotLabel: brand.cream,
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function TonightScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <CommunityBackHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Hero />
        <SeoulDotMap />
        <ParticipateCta />
        <SectionLabel />
        <EntriesList />
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hero — eyebrow + headline (14 gold) + sub
// ────────────────────────────────────────────────────────────────────────────

function Hero() {
  const { t } = useTranslation();
  const eyebrow = t('community.tonight.eyebrow', { time: TONIGHT_TIME }).toUpperCase();
  const lead = t('community.tonight.headlineLead', { count: TONIGHT_COUNT });
  const trail = t('community.tonight.headlineTrail');
  const places = t('community.tonight.places');

  // 숫자(14)를 highlight 하려면 lead 텍스트를 number/non-number 분할.
  // ko: '14명이' → ['14', '명이']
  // en: '14 people' → ['14', ' people']
  // 단순 정규식 split — count 위치 보존
  const numStr = String(TONIGHT_COUNT);
  const leadIdx = lead.indexOf(numStr);
  const beforeNum = leadIdx >= 0 ? lead.slice(0, leadIdx) : '';
  const afterNum = leadIdx >= 0 ? lead.slice(leadIdx + numStr.length) : lead;

  return (
    <View style={{ paddingTop: 12, paddingHorizontal: 22 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          color: light.border.active,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          marginTop: 6,
          fontFamily: 'Freesentation_4Regular',
          fontSize: 26,
          lineHeight: 29.9,
          fontStyle: 'italic',
          color: light.text.primary,
        }}
      >
        {beforeNum}
        <Text style={{ color: light.border.active }}>{numStr}</Text>
        {afterNum}
        {'\n'}
        {trail}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          marginTop: 8,
          fontFamily: 'Freesentation_4Regular',
          fontSize: 12,
          color: light.text.muted,
        }}
      >
        {places}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SeoulDotMap (§1-A-3, §6-3 §6-14)
// ────────────────────────────────────────────────────────────────────────────

function SeoulDotMap() {
  const locale = currentLocale();
  const { t } = useTranslation();

  return (
    <View
      style={{
        marginTop: 16,
        marginHorizontal: 16,
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: light.map.country,
        borderWidth: 1,
        borderColor: light.border.default,
      }}
    >
      <Svg width="100%" height={220} viewBox="0 0 358 220" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="seoulBg">
            <Stop offset="0%" stopColor={SVG_HEX.bgStart} />
            <Stop offset="100%" stopColor={SVG_HEX.bgEnd} />
          </RadialGradient>
          <Pattern id="grid2" patternUnits="userSpaceOnUse" width={30} height={30}>
            <Path
              d="M 30 0 L 0 0 0 30"
              stroke={SVG_HEX.gridStroke}
              strokeWidth={0.4}
              fill="none"
            />
          </Pattern>
          <Filter id="dotglow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation={2.5} />
          </Filter>
        </Defs>
        <Rect width={358} height={220} fill="url(#seoulBg)" />
        <Rect width={358} height={220} fill="url(#grid2)" />
        {/* Han River — 2 paths overlay */}
        <Path
          d="M 0 130 Q 80 110 160 130 Q 240 145 358 120"
          stroke={SVG_HEX.riverDark}
          strokeWidth={14}
          fill="none"
          opacity={0.6}
        />
        <Path
          d="M 0 130 Q 80 110 160 130 Q 240 145 358 120"
          stroke={SVG_HEX.riverLight}
          strokeWidth={10}
          fill="none"
        />
        <SvgText x={280} y={118} fontFamily="Inter" fontSize={7} fill={SVG_HEX.riverLabel} fontStyle="italic">
          {t('community.tonight.hanRiver')}
        </SvgText>
        {/* Dots (5 entries) */}
        {MAP_DOTS.map((d) => (
          <G key={d.label.en}>
            <Circle
              cx={d.x}
              cy={d.y}
              r={d.n * 2 + 4}
              fill={SVG_HEX.dotGold}
              opacity={0.18}
              filter="url(#dotglow)"
            />
            <Circle cx={d.x} cy={d.y} r={Math.min(8, 3 + d.n)} fill={SVG_HEX.dotGold} />
            <SvgText
              x={d.x}
              y={d.y + 1}
              textAnchor="middle"
              fontFamily="PlayfairDisplay"
              fontSize={9}
              fill={SVG_HEX.dotNumber}
              fontWeight="700"
            >
              {d.n}
            </SvgText>
            <SvgText
              x={d.x}
              y={d.y + d.n * 2 + 16}
              textAnchor="middle"
              fontFamily="Inter"
              fontSize={8}
              fill={SVG_HEX.dotLabel}
            >
              {locale === 'ko' ? d.label.ko : d.label.en}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ParticipateCta (§1-A-4, §6-4)
// ────────────────────────────────────────────────────────────────────────────

function ParticipateCta() {
  const { t } = useTranslation();

  const handleJoin = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.tonight.joinDeferred'));
  }, [t]);

  const title = t('community.tonight.participateCta');
  const sub = t('community.tonight.participateSub');
  const join = t('community.tonight.joinLabel');

  return (
    <View
      style={{
        marginTop: 14,
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.4),
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={[withAlpha(brand.wineRed, 0.4), light.bg.surface] as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Moon size={18} strokeWidth={1.75} color={light.border.active} />
        <View style={{ flex: 1, minWidth: 0 }}>
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
        <Pressable
          onPress={handleJoin}
          accessibilityRole="button"
          accessibilityLabel={join}
          hitSlop={6}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexShrink: 0 })}
        >
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: brand.wineRed,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                color: brand.cream,
              }}
            >
              {join}
            </Text>
          </View>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SectionLabel — '이 순간의 잔들'
// ────────────────────────────────────────────────────────────────────────────

function SectionLabel() {
  const { t } = useTranslation();
  return (
    <View style={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 6 }}>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 10,
          color: light.border.active,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
        }}
      >
        {t('community.tonight.sectionTitle')}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// EntriesList — 5 EntryRow
// ────────────────────────────────────────────────────────────────────────────

function EntriesList() {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingBottom: 30,
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {TONIGHT_ENTRIES.map((entry) => (
        <EntryRow key={entry.userId} entry={entry} />
      ))}
    </View>
  );
}

function EntryRow({ entry }: { entry: TonightEntry }) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const user = getCommunityUser(entry.userId);
  const wineName = TONIGHT_WINE_NAMES[entry.wineId] ?? '';
  const wineNameShort = wineName.split(' ').slice(0, 3).join(' ');
  const place = locale === 'ko' ? entry.place.ko : entry.place.en;
  const vibe = locale === 'ko' ? entry.vibe.ko : entry.vibe.en;

  const handleProfilePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.profile.deferred'));
  }, [t]);

  const handleToastPress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('community.tonight.toastDeferred'));
  }, [t]);

  const userName = user?.name ?? entry.userId;
  const toastLabel = t('community.tonight.toastLabel');

  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: light.bg.surface,
        borderWidth: 1,
        borderColor: light.border.default,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {user ? (
        <CommUserAvatar
          levelId={user.level}
          initial={user.initial}
          userId={entry.userId}
          size={28}
          asLink
        />
      ) : (
        <View style={{ width: 28, height: 28 }} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable
            onPress={handleProfilePress}
            accessibilityRole="button"
            accessibilityLabel={userName}
            hitSlop={4}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 11,
                color: light.text.primary,
              }}
            >
              {userName}
            </Text>
          </Pressable>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10,
              color: light.text.muted,
            }}
          >
            {`· ${place} · ${entry.hour}`}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 3,
          }}
        >
          <Wine size={10} strokeWidth={1.75} color={light.border.active} />
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 10.5,
              color: light.text.secondary,
            }}
          >
            {wineNameShort}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={{
            marginTop: 2,
            fontFamily: 'Freesentation_4Regular',
            fontStyle: 'italic',
            fontSize: 10,
            color: light.text.muted,
          }}
        >
          {vibe}
        </Text>
      </View>
      <Pressable
        onPress={handleToastPress}
        accessibilityRole="button"
        accessibilityLabel={toastLabel}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flexShrink: 0 })}
      >
        <View
          style={{
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: withAlpha(brand.gold, 0.33),
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 10,
              color: light.border.active,
            }}
          >
            {toastLabel}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

