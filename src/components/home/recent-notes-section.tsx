import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { getDefaultBottleColor } from '@/lib/lwin';
import type { TypeCanonical } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import type { TastingNoteWithWine } from '@/hooks/use-notes';

interface Props {
  notes: TastingNoteWithWine[];
}

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

function NoteCard({ note }: { note: TastingNoteWithWine }) {
  const tokens = useThemeTokens();
  const wine = note.wine;
  if (!wine?.lwin || !wine?.display_name) return null;
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical));

  // Round 8 패턴 (§4-11): Pressable은 hit target만, layout/visual은 inner View.
  return (
    <Pressable
      onPress={() => router.push(`/notes/${note.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          backgroundColor: tokens.bg.surface,
          padding: 12,
        }}
      >
        <View
          style={{
            width: 56,
            height: 80,
            backgroundColor: bottleColor,
            borderRadius: 6,
          }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <WineNameDisplay
            lwin={wine.lwin}
            name_ko={wine.name_ko}
            display_name={wine.display_name}
            size="card"
          />
          <Text
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              color: tokens.text.muted,
              marginTop: 4,
            }}
          >
            {note.tasted_at}
            {typeof note.rating === 'number' ? `  ·  ${note.rating.toFixed(1)}` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function RecentNotesSection({ notes }: Props) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  return (
    <View>
      <Text
        style={{
          fontFamily: 'Freesentation_4Regular',
          color: tokens.text.secondary,
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        {t('home.heavy.recentNotes')}
      </Text>
      {notes.length === 0 ? (
        <Text
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            color: tokens.text.muted,
            marginTop: 12,
          }}
        >
          {t('home.heavy.recentNotesEmpty')}
        </Text>
      ) : (
        <View style={{ marginTop: 12, gap: 12 }}>
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </View>
      )}
    </View>
  );
}
