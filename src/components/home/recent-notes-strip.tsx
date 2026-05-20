/**
 * RecentNotesStrip — 가로 snap 스크롤 (heavy 모드).
 *
 * 사양 home.md §2-1 line 117-129, §3-7:
 * - section mt 18 — 노트 0개 시 미렌더
 * - header padding 0_20_8 baseline justify-between
 *   - eyebrow "최근 노트" Inter 10 500 gold UPPER tracking 1.8
 *   - h2 "최근 마신 와인" Playfair 17 cream tracking -0.17
 * - ScrollView horizontal snap, paddingHorizontal 16, gap 10, paddingBottom 4
 * - Card width 200, p 12, radius 12, bg-surface, border-default, gap 8
 *   - Row inner: WMBottle 26×86 + meta col
 *     - wine name Playfair 12 cream lh 15 2-line
 *     - "{vintage} · {dateStr}" 9px text-muted mt 4
 *     - WMGlassRating size 8 mt 6
 *   - aroma hint 10px text-secondary lh 14.5 1-line (optional)
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { getDefaultBottleColor } from '@/lib/lwin';
import type { TypeCanonical } from '@/lib/design-tokens';
import type { TastingNoteWithWine } from '@/hooks/use-notes';
import { WMBottle } from '@/components/shared/wm-bottle';
import { WMGlassRating } from '@/components/shared/wm-glass-rating';
import { WineNameDisplay } from '@/components/shared/wine-name-display';

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(value: string | null | undefined): TypeCanonical | null {
  if (value && TYPE_CANONICAL.has(value as TypeCanonical)) return value as TypeCanonical;
  return null;
}

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '';
  // 'YYYY-MM-DD' → 'M/D'
  const parts = iso.split('-');
  const mm = parts[1];
  const dd = parts[2];
  if (!mm || !dd) return iso;
  return `${parseInt(mm, 10)}/${parseInt(dd, 10)}`;
}

function NoteCard({ note }: { note: TastingNoteWithWine }) {
  const wine = note.wine;
  if (!wine?.lwin || !wine?.display_name) return null;
  const type = asTypeCanonical(wine.type_canonical);
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(type);
  const rating = typeof note.rating === 'number' ? note.rating : 0;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        router.push(`/wine/${wine.lwin}` as never);
      }}
      accessibilityRole="link"
      accessibilityLabel={`${wine.name_ko ?? wine.display_name} ${wine.vintage ?? ''} ${rating} stars`}
      className="rounded-xl bg-surface dark:bg-surface border border-border-default dark:border-border-default"
      style={({ pressed }) => ({
        width: 200,
        flexShrink: 0,
        padding: 12,
        gap: 8,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <WMBottle width={26} height={86} bottleColor={bottleColor} type={type} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <WineNameDisplay
            lwin={wine.lwin}
            name_ko={wine.name_ko}
            display_name={wine.display_name}
            size="card"
          />
          <Text
            className="text-text-muted dark:text-text-muted"
            style={{ fontSize: 9, marginTop: 4 }}
            allowFontScaling={false}
          >
            {wine.vintage ?? ''}
            {wine.vintage && note.tasted_at ? ' · ' : ''}
            {formatDateShort(note.tasted_at)}
          </Text>
          <View style={{ marginTop: 6 }}>
            <WMGlassRating value={rating} size={8} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface RecentNotesStripProps {
  notes: TastingNoteWithWine[];
}

export function RecentNotesStrip({ notes }: RecentNotesStripProps) {
  const { t } = useTranslation();
  if (notes.length === 0) return null;
  const display = notes.slice(0, 8);

  return (
    <View style={{ marginTop: 18 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingBottom: 8,
          paddingHorizontal: 20,
        }}
      >
        <Text
          className="font-inter-medium uppercase"
          style={{
            color: brand.gold,
            fontSize: 10,
            letterSpacing: 1.8,
          }}
          allowFontScaling={false}
        >
          {t('home.heavy.recentNotes')}
        </Text>
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{ fontSize: 17, letterSpacing: -0.17 }}
        >
          {t('home.recentTasted')}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={210}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4, gap: 10 }}
      >
        {display.map((n) => (
          <NoteCard key={n.id} note={n} />
        ))}
      </ScrollView>
    </View>
  );
}
