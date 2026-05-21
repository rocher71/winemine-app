/**
 * /glossary — 용어 사전 리스트 화면.
 *
 * 사양: _workspace/design-specs/glossary-list.md (Day 6 신규 화면).
 *
 * §10 결정 사항:
 *   A: builtin.ts 14 entries (keyscreen 12 verbatim + grand-cru/1855-classification 보존).
 *   B: 진입 경로는 설정 메뉴 → follow-up (본 화면 작업 범위 외).
 *   C: 정적 모듈 v0.1.0 (`src/lib/glossary/builtin.ts`).
 *   D: GlossaryBottomSheet "Learn more →" 활성화 — router.push(`/glossary/${termId}`).
 *      (`src/components/wine-story/glossary-bottom-sheet.tsx` 1행 변경 동시 적용)
 *   E: 'other' 카테고리는 BookOpen 16 muted icon fallback. chip 은 5종(+all) 유지.
 *   F: search input bg = `light.bg.sunken` (= `rgba(42,26,20,0.06)`).
 *   G: search X 버튼 없음 (keyscreen verbatim).
 *   H: technique icon color = `light.text.primary` (light 대비 보장).
 *   I: glossary semantic token v0.1.0 inline (모듈화 v0.2.0).
 *   J: chip 변경 시 `Haptics.selectionAsync()`.
 *
 * §0-2 light-only mode:
 *   - dark: className 0.
 *   - useColorScheme 호출 0.
 *   - 모든 색은 light.* 또는 brand.* 토큰 직접 inline.
 *
 * RN deviation (§6):
 *   - #2 (chip horizontal scroll: overflowX auto → <ScrollView horizontal>)
 *   - #3 (search bg var(--color-bg-map) → light.bg.sunken)
 *   - #6 (<Link> → Pressable + router.push, 3-layer)
 *   - #8 (<input type="search"> → TextInput returnKeyType="search")
 *   - #10 (textOverflow ellipsis → numberOfLines + ellipsizeMode)
 */
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  AlertTriangle,
  Award,
  Beaker,
  BookOpen,
  ChevronLeft,
  Ruler,
  Sparkles,
} from 'lucide-react-native';
import { brand, light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  GLOSSARY_BUILTIN,
  type GlossaryCategory,
  type GlossaryEntry,
} from '@/lib/glossary/builtin';

// §10 E — keyscreen 5 chips + 'all'. 'other' 카테고리는 list row icon fallback 만 (chip 미노출).
type Cat = 'all' | Exclude<GlossaryCategory, 'other'>;
const CHIP_KEYS: readonly Cat[] = [
  'all',
  'sensory',
  'fault',
  'classification',
  'technique',
  'unit',
] as const;

// §10 H — light 모드 분기: technique 은 light.text.primary (대비 보장). 그 외 keyscreen verbatim.
function categoryIcon(category: GlossaryCategory) {
  switch (category) {
    case 'sensory':
      return <Sparkles size={16} color={light.border.active} />;
    case 'fault':
      return <AlertTriangle size={16} color={brand.wineRed} />;
    case 'classification':
      return <Award size={16} color={light.border.active} />;
    case 'technique':
      return <Beaker size={16} color={light.text.primary} />;
    case 'unit':
      return <Ruler size={16} color={light.text.secondary} />;
    case 'other':
    default:
      // §10 E — keyscreen CATEGORY_ICON 5종 only → other fallback.
      return <BookOpen size={16} color={light.text.muted} />;
  }
}

export default function GlossaryListScreen() {
  const { t } = useTranslation();
  const [cat, setCat] = useState<Cat>('all');
  const [q, setQ] = useState('');

  // §1 데이터 흐름 — keyscreen verbatim.
  const filtered = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    return GLOSSARY_BUILTIN.filter((g) => {
      if (cat !== 'all' && g.category !== cat) return false;
      if (!trimmed) return true;
      const hay = `${g.term.ko}${g.term.en}${g.definition.ko}${g.definition.en}`.toLowerCase();
      return hay.includes(trimmed);
    }).sort((a, b) => a.term.en.localeCompare(b.term.en));
  }, [cat, q]);

  const handleChipChange = (next: Cat) => {
    if (next === cat) return;
    // §10 J — chip 변경 light haptic feedback.
    Haptics.selectionAsync().catch(() => undefined);
    setCat(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <LightBackHeader title={t('glossary.title')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CategoryChips cat={cat} onChange={handleChipChange} />
        <SearchSection value={q} onChange={setQ} />
        {filtered.length === 0 ? (
          <NoResults />
        ) : (
          <TermList items={filtered} />
        )}
      </ScrollView>
    </View>
  );
}

// ---- Inline light-only BackHeader (사양 §3-1, favorites/wine-story 동일 패턴) ----

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

// ---- Section A — Category Chips (§3-3, §6 #2 overflowX → horizontal ScrollView) ----

interface CategoryChipsProps {
  cat: Cat;
  onChange: (next: Cat) => void;
}

function CategoryChips({ cat, onChange }: CategoryChipsProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 8,
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        alignItems: 'center',
      }}
    >
      {CHIP_KEYS.map((k) => {
        const active = cat === k;
        const label = t(`glossary.categories.${k}`);
        return (
          // 3-layer Pressable (§4-11): outer flex wrapper → middle hit → inner visual.
          <View key={k} style={{ flexShrink: 0 }}>
            <Pressable
              onPress={() => onChange(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t('glossary.chip.a11y', { cat: label })}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor: active ? brand.wineRed : 'transparent',
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
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12,
                    fontWeight: '600',
                    color: active ? brand.cream : light.text.secondary,
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ---- Section B — Search Input (§3-4, §6 #3 / #8) ----

interface SearchSectionProps {
  value: string;
  onChange: (next: string) => void;
}

function SearchSection({ value, onChange }: SearchSectionProps) {
  const { t } = useTranslation();
  const placeholder = t('glossary.searchPlaceholder');
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={light.text.muted}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={{
          width: '100%',
          height: 40,
          paddingHorizontal: 14,
          // §10 F — light.bg.sunken (= rgba(42,26,20,0.06)) — design-tokens.ts line 64.
          backgroundColor: light.bg.sunken,
          borderWidth: 1,
          borderColor: light.border.default,
          borderRadius: 12,
          color: light.text.primary,
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
        }}
      />
    </View>
  );
}

// ---- Section C — Term List (§3-5, §6 #6 Link → Pressable 3-layer) ----

interface TermListProps {
  items: GlossaryEntry[];
}

function TermList({ items }: TermListProps) {
  return (
    <View>
      {items.map((g) => (
        <TermRow key={g.id} entry={g} />
      ))}
    </View>
  );
}

interface TermRowProps {
  entry: GlossaryEntry;
}

function TermRow({ entry }: TermRowProps) {
  const { t } = useTranslation();
  const locale = currentLocale();
  const termText = entry.term[locale] ?? entry.term.en;
  const defText = entry.definition[locale] ?? entry.definition.en;
  return (
    // 3-layer Pressable (§4-11): outer hit only + inner visual.
    <Pressable
      onPress={() => router.push(`/glossary/${entry.id}`)}
      accessibilityRole="button"
      accessibilityLabel={t('glossary.row.openA11y', { term: termText })}
      accessibilityHint={t('glossary.row.openHint')}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: light.border.default,
          minHeight: 72,
        }}
      >
        {/* Category icon circle — keyscreen verbatim gold 8% alpha. */}
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(201, 168, 76, 0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {categoryIcon(entry.category)}
        </View>
        {/* Text col */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              fontWeight: '600',
              color: light.text.primary,
              lineHeight: 18,
            }}
          >
            {termText}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: light.text.muted,
              marginTop: 2,
              lineHeight: 16,
            }}
          >
            {defText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---- noResults EmptyState (§3-6, §2-5) ----

function NoResults() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        paddingVertical: 32,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: light.text.muted,
          textAlign: 'center',
        }}
      >
        {t('glossary.noResults')}
      </Text>
    </View>
  );
}
