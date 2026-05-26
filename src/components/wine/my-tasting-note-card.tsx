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
  /** 전체 노트 수 — 1 이상일 때 헤더에 "N개 전체 보기 →" 표시 */
  noteCount?: number;
  /** "전체 보기 →" 탭 핸들러 — noteCount > 1일 때만 사용 */
  onViewAll?: () => void;
}

const DIM_KEYS = ['sweetness', 'acidity', 'body', 'tannin'] as const;
type DimKey = (typeof DIM_KEYS)[number];

function readDim(
  fields: TastingNoteRow['expert_fields'] | TastingNoteRow['beginner_fields'],
  key: DimKey,
): string | null {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return null;
  const obj = fields as Record<string, unknown>;
  // 신규 BeginnerFields shape (Day 6+): { palate: { sweetness, acidity, body, tannin } } 또는
  // Expert shape: { palate: { sweetness:n, acidity:n, ... } }.
  const palate = obj.palate;
  if (palate && typeof palate === 'object' && !Array.isArray(palate)) {
    const v = (palate as Record<string, unknown>)[key];
    if (v !== null && v !== undefined) return String(v);
  }
  // legacy beginner shape (wset.{sweetness/acidity/tannin/body}):
  const wset = obj.wset;
  if (wset && typeof wset === 'object' && !Array.isArray(wset)) {
    const v = (wset as Record<string, unknown>)[key];
    if (v !== null && v !== undefined) return String(v);
  }
  // top-level fallback (drop-through):
  const value = obj[key];
  if (value === null || value === undefined) return null;
  return String(value);
}

function shortWsetValue(t: (k: string) => string, raw: string | null): string {
  if (!raw) return '—';
  const low = raw.toLowerCase();
  // 신규 BeginnerFields palate level (low/mid/high) — palateLevel.* 키 사용
  if (low === 'low') return t('notes.beginner.palateLevel.low');
  if (low === 'mid') return t('notes.beginner.palateLevel.mid');
  if (low === 'high') return t('notes.beginner.palateLevel.high');
  // legacy WSET 5-step labels
  if (low === 'medium-' || low === 'm-' || low === 'mediumminus')
    return t('notes.beginner.wsetShort.mediumMinus');
  if (low === 'medium' || low === 'm') return t('notes.beginner.wsetShort.medium');
  if (low === 'medium+' || low === 'm+' || low === 'mediumplus')
    return t('notes.beginner.wsetShort.mediumPlus');
  // Expert numeric (1~5) — 그대로 표시
  return raw;
}

export function MyTastingNoteCard({ note, wineLwin: _wineLwin, noteCount, onViewAll }: Props) {
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

  const ratingDisplay =
    note.rating !== null && note.rating !== undefined
      ? mode === 'expert'
        ? `${note.rating}/100`
        : `${note.rating}/5`
      : '—';

  const tastedAtDisplay = note.tasted_at?.slice(0, 10) ?? '';

  // §4-11 3-layer: outer View = margin, Pressable = hit target, inner View = visual
  return (
    <View style={{ marginHorizontal: 16 }}>
    <Pressable
      onPress={handleOpen}
      accessibilityRole="link"
      accessibilityLabel={`${t('wineDetail.myNote.label')} ${ratingDisplay}`}
      accessibilityHint={t('wineDetail.myNote.openHint')}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        className="bg-surface dark:bg-surface"
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: brand.gold,
          padding: 16,
          gap: 12,
          ...shadows.goldGlow,
        }}
      >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} color={brand.gold} />
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'Freesentation_4Regular', fontSize: 12, textTransform: 'uppercase', color: brand.gold, letterSpacing: 0.72 }}
          >
            {t('wineDetail.myNote.label')}
            {noteCount && noteCount > 0 ? (
              <Text style={{ color: brand.gold }}>{`  ${noteCount}개`}</Text>
            ) : null}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onViewAll && noteCount && noteCount > 1 ? (
            <Pressable
              onPress={onViewAll}
              accessibilityRole="link"
              accessibilityLabel={t('wineDetail.myNote.viewAll')}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text
                allowFontScaling={false}
                style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11, color: brand.gold }}
              >
                {t('wineDetail.myNote.viewAll')}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleOpen}
            accessibilityRole="button"
            accessibilityLabel={t('wineDetail.myNote.edit')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Pencil size={11} color={brand.cream} />
              <Text
                allowFontScaling={false}
                className="text-text-secondary dark:text-text-secondary"
                style={{ fontFamily: 'Freesentation_4Regular', fontSize: 11 }}
              >
                {t('wineDetail.myNote.edit')}
              </Text>
            </View>
          </Pressable>
        </View>
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
        style={{
          flexDirection: 'row',
          gap: 6,
          padding: 10,
          backgroundColor: wsetBg,
          borderRadius: 10,
        }}
      >
        {DIM_KEYS.map((key) => {
          const raw = readDim(fields, key);
          return (
            <View key={key} style={{ flex: 1, alignItems: 'center' }}>
              <Text
                allowFontScaling={false}
                className="text-text-muted dark:text-text-muted"
                style={{ fontSize: 9, textTransform: 'uppercase', textAlign: 'center', marginBottom: 2, letterSpacing: 0.36 }}
              >
                {t(`notes.beginner.wset${key.charAt(0).toUpperCase() + key.slice(1)}`)}
              </Text>
              <Text
                allowFontScaling={false}
                className="text-text-primary dark:text-text-primary"
                style={{ fontFamily: 'Freesentation_4Regular', fontSize: 13, textAlign: 'center', lineHeight: 14.3 }}
              >
                {shortWsetValue(t, raw)}
              </Text>
            </View>
          );
        })}
      </View>
      </View>
    </Pressable>
    </View>
  );
}
