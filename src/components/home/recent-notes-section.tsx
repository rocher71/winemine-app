import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { getDefaultBottleColor } from '@/lib/lwin';
import type { TypeCanonical } from '@/lib/design-tokens';
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
  const wine = note.wine;
  if (!wine?.lwin || !wine?.display_name) return null;
  const bottleColor = wine.bottle_color ?? getDefaultBottleColor(asTypeCanonical(wine.type_canonical));

  return (
    <Pressable
      onPress={() => router.push(`/notes/${note.id}`)}
      accessibilityRole="button"
      className="flex-row items-center rounded-xl bg-surface p-3"
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
    >
      <View
        style={{
          width: 56,
          height: 80,
          backgroundColor: bottleColor,
          borderRadius: 6,
        }}
      />
      <View className="ml-3 flex-1">
        <WineNameDisplay
          lwin={wine.lwin}
          name_ko={wine.name_ko}
          display_name={wine.display_name}
          size="card"
        />
        <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-1">
          {note.tasted_at}
          {typeof note.rating === 'number' ? `  ·  ${note.rating.toFixed(1)}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export function RecentNotesSection({ notes }: Props) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
        {t('home.heavy.recentNotes')}
      </Text>
      {notes.length === 0 ? (
        <Text className="font-inter text-card-body text-text-muted dark:text-text-muted mt-3">
          {t('home.heavy.recentNotesEmpty')}
        </Text>
      ) : (
        <View className="mt-3 gap-3">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </View>
      )}
    </View>
  );
}
