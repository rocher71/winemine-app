/**
 * MyTastingNoteCard — 사용자가 이 와인에 노트가 있을 때 표시.
 *
 * 사양: wine-detail.md §3-4 verbatim.
 *
 * 구조:
 *   - Outer Pressable (padding 16, bg surface, border 1px gold, radius 16, shadow goldGlow, gap 12 col)
 *   - Header row: BookOpen 16 gold + "내 노트" UPPER ls 0.06em / Edit btn (Pencil 11 + "수정")
 *   - Meta row (flex-wrap, gap 14): Calendar+date / Star+rating / Mode badge (expert wine-red / beginner gold18%)
 *   - (expert only) WSET 4-grid mini (sweetness/acidity/body/tannin) — wsetGridBg dual
 *
 * 데이터 의존:
 *   - tasting_notes row (use-my-note-for-wine hook)
 *   - expert WSET dims: note.expert_fields JSON에서 sweetness/acidity/body/tannin 추출
 *   - beginner WSET dims: note.beginner_fields JSON 같은 4종 key
 *
 * SCOPE-OUT:
 *   - Community compare box (≥10 expert reviews): community_peak_estimates 부재 → 제거 (사양 §12 Q15)
 */
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Pencil, Calendar, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  brand,
  shadows,
  withAlpha,
  wsetGridBg,
} from '@/lib/design-tokens';
import { useColorScheme } from 'react-native';
import type { Database } from '@shared/types/database.types';

type TastingNoteRow = Database['public']['Tables']['tasting_notes']['Row'];

interface Props {
  note: TastingNoteRow;
  wineLwin: string;
}

const DIM_KEYS = ['sweetness', 'acidity', 'body', 'tannin'] as const;
type DimKey = (typeof DIM_KEYS)[number];

function readDim(
  fields: TastingNoteRow['expert_fields'] | TastingNoteRow['beginner_fields'],
  key: DimKey,
): string | null {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return null;
  const value = (fields as Record<string, unknown>)[key];
  if (value === null || value === undefined) return null;
  return String(value);
}

function shortWsetValue(t: (k: string) => string, raw: string | null): string {
  if (!raw) return '—';
  const low = raw.toLowerCase();
  if (low === 'low') return t('notes.beginner.wsetShort.low');
  if (low === 'medium-' || low === 'm-' || low === 'mediumminus')
    return t('notes.beginner.wsetShort.mediumMinus');
  if (low === 'medium' || low === 'm') return t('notes.beginner.wsetShort.medium');
  if (low === 'medium+' || low === 'm+' || low === 'mediumplus')
    return t('notes.beginner.wsetShort.mediumPlus');
  if (low === 'high') return t('notes.beginner.wsetShort.high');
  return raw;
}

export function MyTastingNoteCard({ note, wineLwin }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const scheme = useColorScheme();

  const wsetBg = scheme === 'light' ? wsetGridBg.light : wsetGridBg.dark;

  const mode: 'expert' | 'beginner' = note.mode === 'expert' ? 'expert' : 'beginner';
  const fields = mode === 'expert' ? note.expert_fields : note.beginner_fields;

  const handleOpen = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/notes/${note.id}`);
  };

  const handleEdit = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(
      `/notes/new/write?wine_lwin=${encodeURIComponent(wineLwin)}&edit=1&noteId=${encodeURIComponent(note.id)}`,
    );
  };

  const ratingDisplay =
    note.rating !== null && note.rating !== undefined
      ? mode === 'expert'
        ? `${note.rating}/100`
        : `${note.rating}/5`
      : '—';

  const tastedAtDisplay = note.tasted_at?.slice(0, 10) ?? '';

  return (
    <Pressable
      onPress={handleOpen}
      accessibilityRole="link"
      accessibilityLabel={`${t('wineDetail.myNote.label')} ${ratingDisplay}`}
      accessibilityHint={t('wineDetail.myNote.openHint')}
      className="mx-4 rounded-2xl bg-surface dark:bg-surface"
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: brand.gold,
        padding: 16,
        gap: 12,
        opacity: pressed ? 0.92 : 1,
        ...shadows.goldGlow,
      })}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <BookOpen size={16} color={brand.gold} />
          <Text
            allowFontScaling={false}
            className="font-inter-semibold text-[12px] uppercase"
            style={{ color: brand.gold, letterSpacing: 0.72 }}
          >
            {t('wineDetail.myNote.label')}
          </Text>
        </View>
        <Pressable
          onPress={handleEdit}
          accessibilityRole="button"
          accessibilityLabel={t('wineDetail.myNote.edit')}
          hitSlop={8}
          className="flex-row items-center"
          style={({ pressed }) => ({ gap: 4, opacity: pressed ? 0.7 : 1 })}
        >
          <Pencil size={11} color={brand.cream} />
          <Text
            allowFontScaling={false}
            className="font-inter-semibold text-[11px] text-text-secondary dark:text-text-secondary"
          >
            {t('wineDetail.myNote.edit')}
          </Text>
        </Pressable>
      </View>

      {/* Meta row */}
      <View className="flex-row items-center flex-wrap" style={{ gap: 14 }}>
        {tastedAtDisplay ? (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Calendar size={11} strokeWidth={1.75} color={brand.cream} />
            <Text className="font-inter text-[12px] text-text-muted dark:text-text-muted">
              {tastedAtDisplay}
            </Text>
          </View>
        ) : null}
        {note.rating !== null && note.rating !== undefined ? (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Star size={11} fill={brand.gold} strokeWidth={0} color={brand.gold} />
            <Text
              className="font-inter-semibold text-[12px]"
              style={{ color: brand.gold }}
            >
              {ratingDisplay}
            </Text>
          </View>
        ) : null}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
            backgroundColor:
              mode === 'expert' ? brand.wineRed : withAlpha(brand.gold, 0.18),
          }}
        >
          <Text
            allowFontScaling={false}
            className="text-[10px] uppercase"
            style={{
              fontWeight: '700',
              color: mode === 'expert' ? brand.cream : brand.gold,
              letterSpacing: 0.4,
            }}
          >
            {t(`wineDetail.myNote.mode.${mode}`)}
          </Text>
        </View>
      </View>

      {/* WSET 4-grid mini (mode-specific dims) */}
      <View
        className="flex-row"
        style={{
          gap: 6,
          padding: 10,
          backgroundColor: wsetBg,
          borderRadius: 10,
        }}
      >
        {DIM_KEYS.map((key) => {
          const raw = readDim(fields, key);
          return (
            <View key={key} className="flex-1 items-center">
              <Text
                allowFontScaling={false}
                className="text-[9px] uppercase text-text-muted dark:text-text-muted text-center mb-0.5"
                style={{ letterSpacing: 0.36 }}
              >
                {t(`notes.beginner.wset${key.charAt(0).toUpperCase() + key.slice(1)}`)}
              </Text>
              <Text
                allowFontScaling={false}
                className="font-playfair text-[13px] text-text-primary dark:text-text-primary text-center"
                style={{ lineHeight: 14.3 }}
              >
                {shortWsetValue(t, raw)}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
