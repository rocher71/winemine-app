/**
 * /wine/[lwin]/story — 와이너리 스토리 화면.
 *
 * 사양: _workspace/design-specs/wine-story.md (Day 6 신규 화면).
 *
 * Step 1 §10 결정 사항:
 *   A: wine_stories mock 사용 (src/lib/mock/wine-stories.ts).
 *   B: glossary 정적 모듈 (src/lib/glossary/builtin.ts).
 *   C: CTA "Back to wine" → router.back() (자연 stack pop).
 *   D: i18n 신규 키 `wineStory.empty.body` (기존 `wineDetail.story.empty` 와 같은 문구이지만 namespace 분리).
 *   E: wine.grapes 는 mock WINE_STORIES.grapes (string[]) — wines_localized VIEW 에 grapes 컬럼 미존재.
 *   F: Hero linear-gradient 끝점 = light.bg.deepest (#FAF5EC) verbatim.
 *   G: GlossaryTooltip → BottomSheet 모달.
 *   H: wine-detail WineStoryCard deferredToast 본 cycle 미해제 (별도 follow-up).
 *
 * §0-2 light-only mode:
 *   - dark: className 금지.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *   - useColorScheme 호출 안 함.
 *   - BackHeader 공통 컴포넌트는 dark/light 자동 분기 → 본 화면은 inline light-only header 사용.
 *
 * RN deviation (§6):
 *   - #5 grid 2×2 → flex-row 2 row × 2 col wrap.
 *   - #6 GlossaryTooltip popover → BottomSheet.
 *   - #4 FunFact card boxShadow ring 생략.
 *   - #11 hero 끝점 light.bg.deepest verbatim (§10 F).
 */
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Lightbulb,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useWine } from '@/hooks/use-wine';
import { useWineStory } from '@/hooks/use-wine-story';
import { StoryImage } from '@/components/wine-story/story-image';
import { StoryHistoryBody } from '@/components/wine-story/story-history-body';
import { MetaCell } from '@/components/wine-story/meta-cell';
import { GlossaryBottomSheet } from '@/components/wine-story/glossary-bottom-sheet';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import { getDefaultBottleColor } from '@/lib/lwin';
import type { TypeCanonical } from '@/lib/design-tokens';
import type { WineStory } from '@/lib/mock/wine-stories';
import type { WineLocalized } from '@/hooks/use-wine';

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(v: string | null | undefined): TypeCanonical | null {
  if (v && TYPE_CANONICAL.has(v as TypeCanonical)) return v as TypeCanonical;
  return null;
}

export default function WineStoryScreen() {
  const { lwin: lwinParam } = useLocalSearchParams<{ lwin: string }>();
  const lwin = typeof lwinParam === 'string' ? lwinParam : null;
  const { t } = useTranslation();
  const { wine, loading: wineLoading } = useWine(lwin);
  const { story, loading: storyLoading } = useWineStory(lwin);

  const [openTermId, setOpenTermId] = useState<string | null>(null);
  const openGlossary = useCallback((id: string) => setOpenTermId(id), []);
  const closeGlossary = useCallback(() => setOpenTermId(null), []);

  // Loading
  if (wineLoading || storyLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('wineStory.header.title')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={brand.gold} />
        </View>
      </View>
    );
  }

  // Error — wine 없음
  if (!wine?.lwin) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('wineStory.header.title')} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          <AlertCircle size={32} strokeWidth={1.5} color={light.text.muted} />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: light.text.muted,
              textAlign: 'center',
            }}
          >
            {t('wineStory.notFound')}
          </Text>
        </View>
      </View>
    );
  }

  // Empty — story 없음
  if (!story) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('wineStory.header.title')} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: light.text.muted,
              textAlign: 'center',
            }}
          >
            {t('wineStory.empty.body')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('wineStory.header.title')} />
      <StoryContent
        wine={wine}
        story={story}
        onOpenGlossary={openGlossary}
      />
      <GlossaryBottomSheet
        open={openTermId !== null}
        termId={openTermId}
        onClose={closeGlossary}
      />
    </View>
  );
}

// ---- Inline light-only BackHeader (사양 §0-2) ----

interface LightBackHeaderProps {
  title: string;
}

function LightBackHeader({ title }: LightBackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top,
        height: insets.top + 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          marginRight: 12,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChevronLeft size={24} strokeWidth={1.75} color={light.text.primary} />
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: 'Inter_600SemiBold',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 19.2,
          color: light.text.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

// ---- Story 본문 ----

interface StoryContentProps {
  wine: WineLocalized;
  story: WineStory;
  onOpenGlossary: (termId: string) => void;
}

function StoryContent({ wine, story, onOpenGlossary }: StoryContentProps) {
  const { t } = useTranslation();
  const locale = currentLocale();

  const typeCanon = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(typeCanon);

  const wineryNameText =
    story.wineryName[locale] ?? story.wineryName.en;
  const locationText = story.location[locale] ?? story.location.en;
  const funFactText = story.funFact[locale] ?? story.funFact.en;
  const philosophyText = story.philosophy
    ? story.philosophy[locale] ?? story.philosophy.en
    : null;

  // Step 1 §10 결정 E: grapes 는 string[] — 단순 slice(0,2).join(', ').
  // Meta grid 3번 cell (주요 품종) — locale 무관 단일 표기.
  const grapeSummary = story.grapes.slice(0, 2).join(', ') || '—';

  // KRW 통화 표시 — locale 무관 (i18n 만 라벨).
  const priceText = `₩${story.averagePriceKrw.toLocaleString('en-US')}`;

  const handleBackToWine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    // Step 1 §10 결정 C: router.back().
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 32, gap: 20 }}
      showsVerticalScrollIndicator={false}
      accessibilityLabel={t('wineStory.a11y.scroll')}
    >
      {/* Section A — Hero */}
      <View style={{ paddingHorizontal: 16 }}>
        <StoryImage bottleColor={bottleColor} height={220} />
        <View style={{ marginTop: 14 }}>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontSize: 28,
              fontWeight: '700',
              color: light.text.primary,
              lineHeight: 32.2,
              letterSpacing: -0.28,
            }}
          >
            {wineryNameText}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: light.text.secondary,
              lineHeight: 18,
            }}
            numberOfLines={2}
          >
            {t('wineStory.hero.foundedAt', { year: story.foundedYear })}
            {locationText}
          </Text>
        </View>
      </View>

      {/* Section B — History */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            fontWeight: '600',
            color: light.border.active,
            textTransform: 'uppercase',
            letterSpacing: 0.56,
            marginBottom: 12,
          }}
        >
          {t('wineStory.history.title')}
        </Text>
        <StoryHistoryBody
          history={story.history}
          onOpenGlossary={onOpenGlossary}
        />
      </View>

      {/* Section C — FunFact card */}
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            padding: 16,
            backgroundColor: light.bg.surface,
            borderWidth: 1,
            borderColor: light.border.active,
            borderRadius: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Lightbulb
              size={20}
              strokeWidth={1.75}
              color={light.border.active}
            />
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 13,
                fontWeight: '600',
                color: light.border.active,
                letterSpacing: 0.52,
              }}
            >
              {t('wineStory.funFact.label')}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 22.4,
              color: light.text.primary,
            }}
          >
            {funFactText}
          </Text>
        </View>
      </View>

      {/* Section D — Philosophy (조건부) */}
      {philosophyText ? (
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              fontWeight: '600',
              color: light.border.active,
              textTransform: 'uppercase',
              letterSpacing: 0.56,
              marginBottom: 12,
            }}
          >
            {t('wineStory.philosophy.title')}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 23.1,
              color: light.text.secondary,
              fontStyle: 'italic',
            }}
          >
            {philosophyText}
          </Text>
        </View>
      ) : null}

      {/* Section E — Meta grid 2×2 — §6 #5 flex-row wrap 변환 */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MetaCell
              label={{ ko: '설립년도', en: 'Founded' }}
              value={String(story.foundedYear)}
            />
            <MetaCell
              label={{ ko: '포도밭 면적', en: 'Vineyard area' }}
              value={story.vineyardArea ?? t('wineStory.meta.noValue')}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MetaCell
              label={{ ko: '주요 품종', en: 'Main grapes' }}
              value={grapeSummary}
            />
            <MetaCell
              label={{ ko: '평균 시판가', en: 'Avg price' }}
              value={priceText}
            />
          </View>
        </View>
      </View>

      {/* Section F — Bottom CTA — §4-11 3-layer 패턴 */}
      <View style={{ paddingTop: 8, paddingHorizontal: 16 }}>
        <Pressable
          onPress={handleBackToWine}
          accessibilityRole="link"
          accessibilityLabel={t('wineStory.cta.backToWine')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: light.border.active,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} color={light.border.active} />
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                fontWeight: '600',
                color: light.border.active,
              }}
            >
              {t('wineStory.cta.backToWine')}
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
