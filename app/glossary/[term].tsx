/**
 * /glossary/[term] — 용어 사전 상세 화면.
 *
 * 사양: _workspace/design-specs/glossary-detail.md (Day 6 신규 화면).
 * 진입 경로:
 *   (a) /glossary 리스트 행 tap → router.push(`/glossary/${id}`)
 *   (b) wine-story GlossaryBottomSheet "자세히 보기 →" 링크
 *   (c) 노트 상세 inline (i) → BottomSheet "Learn more"
 *   (d) deep link `winemine://glossary/{id}` (expo-router 기본 처리)
 *
 * §10 결정 사항 (코드 주석으로 영속):
 *   A: `relatedTermIds` 필드를 builtin.ts 에 보강 — keyscreen 9 entries verbatim.
 *      Section D (Related Terms) 활성화.
 *   A-1: caudalie 의 'finish-length' 은 14 entries 에 부재 → chip 렌더 시
 *        `if (!r) return null` safe skip (keyscreen verbatim line 196).
 *   B: notFound 분기 헤더 title = `t('glossary.title')` fallback ("용어 사전").
 *      keyscreen line 45 `<BackHeader />` no title 보다 시각 자연스러움.
 *   C: technique category color (light 모드) = `light.text.primary` (#2A1A14).
 *      keyscreen `var(--color-cream)` 은 light surface 위 대비 부족 → 대체.
 *      glossary-list §10 H 동일 정책.
 *   D: Playfair italic — `PlayfairDisplay_400Regular_Italic` 폰트가 app/_layout.tsx
 *      useFonts 에 이미 로드됨 (home spec §9 P0 적용). 직접 fontFamily 사용 +
 *      안전 fallback `fontStyle: 'italic'`.
 *   E: 카테고리 badge text 대비 keyscreen verbatim — sensory/classification 의
 *      gold on gold tint (12%) 약 2.85:1 (AA Normal 미달, 11px small). 디자인
 *      일관성 우선, v0.1.0 그대로 유지.
 *
 * §0-2 light-only mode:
 *   - dark: className 0.
 *   - useColorScheme 호출 0.
 *   - 모든 색은 light.* / brand.* 토큰 직접 inline.
 *
 * RN deviation (§6):
 *   - #1 light-only (dark variants 생략)
 *   - #2 HTML semantic h1/h2/blockquote/p/span → View+Text, accessibilityRole="header"
 *   - #3 <LocaleText/> → `entry.term[locale] ?? entry.term.en` 직접 lookup
 *   - #4 var(--color-cream) (term name) → light.text.primary
 *   - #5 var(--color-error) (fault) → brand.wineRed
 *   - #6 <Link href/> → Pressable + router.push (3-layer)
 *   - #7 overflowX auto → ScrollView horizontal (related chips)
 *   - #8 display inline-block → alignSelf 'flex-start' (badge, more button)
 *   - #9 letterSpacing '0.04em' → px 환산 (12×0.04=0.48, 10×0.04=0.4)
 *   - #10 Playfair italic — fontFamily italic variant + fontStyle italic fallback
 *   - #15 <BottomNav/> 자동 hide (route 외부)
 *   - #16, #17 borderLeft '3px solid X' shorthand → borderLeftWidth + borderLeftColor 분해
 *
 * CSS web-only primitive 사전 점검 (CLAUDE.md §4-10):
 *   - 음수 margin: 0 (OK)
 *   - position 'sticky': 0 (OK)
 *   - display 'grid': 0 (OK)
 *   - backdropFilter: 0 (OK)
 *   - borderRadius 9999 / radius.full: 0 (badge 10, more 12, chip 16 명시값, OK)
 *   - overflowX auto: 1건 (relatedTerms) → ScrollView horizontal 변환 (OK)
 *   - display inline-block: 2건 (badge, more) → alignSelf flex-start 변환 (OK)
 *   - borderLeft shorthand: 2건 → 분해 (OK)
 */
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  GLOSSARY_BY_ID,
  getGlossaryEntry,
  type GlossaryCategory,
  type GlossaryEntry,
} from '@/lib/glossary/builtin';

// §3-3 categoryColor — keyscreen line 12~26 verbatim + §6 #4, #5 light 분기.
// §10 C: technique 은 light surface 위 cream 대비 부족 → light.text.primary 대체.
function categoryColor(cat: GlossaryCategory): string {
  switch (cat) {
    case 'fault':
      return brand.wineRed;
    case 'classification':
      return light.border.active;
    case 'technique':
      return light.text.primary;
    case 'unit':
      return light.text.secondary;
    case 'sensory':
    case 'other':
    default:
      return light.border.active;
  }
}

export default function GlossaryDetailScreen() {
  const { t } = useTranslation();
  const { term } = useLocalSearchParams<{ term: string }>();
  const locale = currentLocale();
  const entry = term ? getGlossaryEntry(term) : null;

  // §2-2 notFound 분기 — §10 B: 헤더 title = `t('glossary.title')` fallback.
  if (!entry) {
    return (
      <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
        <LightBackHeader title={t('glossary.title')} />
        <View style={{ padding: 24 }}>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 13,
              color: light.text.muted,
            }}
          >
            {t('glossary.notFound')}
          </Text>
        </View>
      </View>
    );
  }

  const headerTitle = entry.term[locale] ?? entry.term.en;

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={headerTitle} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection entry={entry} locale={locale} />
        <DefinitionSection entry={entry} locale={locale} />
        {entry.examples && <ExamplesSection entry={entry} locale={locale} />}
        {entry.relatedTermIds.length > 0 && (
          <RelatedTermsSection entry={entry} locale={locale} />
        )}
        <MoreSection />
      </ScrollView>
    </View>
  );
}

// ---- Inline light-only BackHeader (사양 §3-1, glossary-list 동일 패턴) ----

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
          fontFamily: 'Freesentation_6SemiBold',
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

// ---- Section A — Hero (badge + term name h1) (§3-3) ----

interface SectionProps {
  entry: GlossaryEntry;
  locale: 'ko' | 'en';
}

function HeroSection({ entry, locale }: SectionProps) {
  const { t } = useTranslation();
  const categoryLabel = t(`glossary.categories.${entry.category}`);
  const termText = entry.term[locale] ?? entry.term.en;
  return (
    <View style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 16 }}>
      {/* Category badge — display inline-block → alignSelf flex-start (§6 #8). */}
      <View
        style={{
          alignSelf: 'flex-start',
          paddingVertical: 3,
          paddingHorizontal: 10,
          borderRadius: 10,
          // keyscreen verbatim — brand.gold (#C9A84C) 12% alpha. light/dark 공통.
          backgroundColor: 'rgba(201, 168, 76, 0.12)',
          marginBottom: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Freesentation_6SemiBold',
            fontSize: 11,
            fontWeight: '600',
            color: categoryColor(entry.category),
          }}
        >
          {categoryLabel}
        </Text>
      </View>
      {/* Term name (h1) — Playfair 32 700 (§6 #2, §6 #4). */}
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_7Bold',
          fontSize: 32,
          fontWeight: '700',
          color: light.text.primary,
          lineHeight: 38.4,
        }}
      >
        {termText}
      </Text>
    </View>
  );
}

// ---- Section B — Definition + Source (§3-4) ----

function DefinitionSection({ entry, locale }: SectionProps) {
  const { t } = useTranslation();
  const definitionText = entry.definition[locale] ?? entry.definition.en;
  const sourceText = entry.source
    ? entry.source[locale] ?? entry.source.en
    : null;
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      {/* Section heading h2 (§6 #2, §6 #9 letterSpacing px). */}
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 12,
          fontWeight: '600',
          color: light.text.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.48,
          marginBottom: 8,
        }}
      >
        {t('glossary.definition')}
      </Text>
      {/* Definition body (p). */}
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 14,
          color: light.text.primary,
          lineHeight: 22.4,
        }}
      >
        {definitionText}
      </Text>
      {/* Source block — borderLeft '3px solid gold' shorthand → 분해 (§6 #16). */}
      {sourceText && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderLeftWidth: 3,
            borderLeftColor: light.border.active,
            // keyscreen verbatim — brand.gold (#C9A84C) 6% alpha.
            backgroundColor: 'rgba(201, 168, 76, 0.06)',
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 10,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: light.border.active,
              marginBottom: 4,
            }}
          >
            {t('glossary.source')}
          </Text>
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              color: light.text.secondary,
              lineHeight: 18,
            }}
          >
            {sourceText}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---- Section C — Examples (Playfair italic blockquote) (§3-5, §6 #10, #17) ----

function ExamplesSection({ entry, locale }: SectionProps) {
  const { t } = useTranslation();
  // entry.examples 는 부모에서 조건부 렌더 보장됨 (entry.examples 있을 때만).
  const examplesText = entry.examples
    ? entry.examples[locale] ?? entry.examples.en
    : '';
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 12,
          fontWeight: '600',
          color: light.text.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.48,
          marginBottom: 8,
        }}
      >
        {t('glossary.examples')}
      </Text>
      {/* blockquote — borderLeft '3px solid wineRed' shorthand → 분해 (§6 #17). */}
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderLeftWidth: 3,
          borderLeftColor: brand.wineRed,
        }}
      >
        {/* §10 D — Freesentation_4Regular (Italic fallback) 폰트 로드됨 (app/_layout.tsx).
            fontStyle: 'italic' 도 함께 부여 (안전 fallback — 폰트 미로드 환경에서 RN 자동 italic). */}
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 15,
            fontStyle: 'italic',
            color: light.text.secondary,
            lineHeight: 24,
          }}
        >
          {examplesText}
        </Text>
      </View>
    </View>
  );
}

// ---- Section D — Related Terms (horizontal chip ScrollView) (§3-6, §6 #6, #7) ----

function RelatedTermsSection({ entry, locale }: SectionProps) {
  const { t } = useTranslation();
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'Freesentation_6SemiBold',
          fontSize: 12,
          fontWeight: '600',
          color: light.text.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.48,
          marginBottom: 8,
        }}
      >
        {t('glossary.related')}
      </Text>
      {/* overflowX auto → ScrollView horizontal (§6 #7). */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
      >
        {entry.relatedTermIds.map((rid) => {
          // §10 A-1 / keyscreen line 196 verbatim safe skip.
          const r = GLOSSARY_BY_ID[rid];
          if (!r) return null;
          const rTermText = r.term[locale] ?? r.term.en;
          return (
            <RelatedTermChip
              key={rid}
              rid={rid}
              label={rTermText}
              a11yLabel={t('glossary.detail.chip.a11y', { term: rTermText })}
              a11yHint={t('glossary.detail.chip.hint')}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

// ---- Related Term Chip (3-layer Pressable §4-11) ----

interface RelatedTermChipProps {
  rid: string;
  label: string;
  a11yLabel: string;
  a11yHint: string;
}

function RelatedTermChip({ rid, label, a11yLabel, a11yHint }: RelatedTermChipProps) {
  return (
    // outer wrapper — flexShrink: 0 (수평 스크롤 내 collapse 방지). keyscreen verbatim.
    <View style={{ flexShrink: 0 }}>
      <Pressable
        onPress={() => router.push(`/glossary/${rid}`)}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={a11yHint}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: light.bg.surface,
            borderWidth: 1,
            borderColor: light.border.default,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              color: light.text.primary,
            }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ---- Section E — More button (§3-7, §6 #6, #8) ----

function MoreSection() {
  const { t } = useTranslation();
  return (
    <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
      <Pressable
        onPress={() => router.push('/glossary')}
        accessibilityRole="button"
        accessibilityLabel={t('glossary.detail.more.a11y')}
        accessibilityHint={t('glossary.detail.more.hint')}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          // §6 #8: display inline-block → alignSelf flex-start (좌측 정렬 + 콘텐츠 폭).
          alignSelf: 'flex-start',
        })}
      >
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: light.border.default,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 13,
              fontWeight: '600',
              color: light.border.active,
            }}
          >
            {t('glossary.more')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
