/**
 * NoteBodyBeginner — note detail 화면에서 BeginnerFields 표시 (read-only).
 *
 * 사양: design-spec notes-write.md §16 — BeginnerFields shape 변경 (impression/palate/aromas/finish/memo).
 * Day 6 retroactive: shape 변경에 따라 표시 로직 재작성.
 *
 * 기존 jsonb (구 shape: wset/aroma_tags/comments) 호환을 위해 양쪽 모두 읽음 (legacy fallback).
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WSETReadOnly } from './wset-readonly';
import type { BeginnerFields } from './beginner-form';

// legacy shape (Day 5 이전 노트 — wset/aroma_tags/comments)
interface LegacyBeginnerFields {
  wset?: { sweetness: number; acidity: number; tannin: number; body: number };
  aroma_tags?: string[];
  comments?: string;
}

type AnyBeginnerFields = BeginnerFields & LegacyBeginnerFields;

interface Props {
  fields: BeginnerFields;
}

const PALATE_DIMS = ['sweetness', 'acidity', 'body', 'tannin', 'bubble'] as const;

export function NoteBodyBeginner({ fields }: Props) {
  const { t } = useTranslation();
  const anyFields = fields as AnyBeginnerFields;
  const isLegacy = anyFields.wset !== undefined && anyFields.palate === undefined;

  // memo: 신규 fields.memo 우선, fallback legacy comments.
  const memo = (fields as { memo?: string }).memo ?? anyFields.comments ?? '';

  // aromas: 신규 fields.aromas 우선, fallback legacy aroma_tags.
  const aromas: readonly string[] =
    Array.isArray((fields as { aromas?: unknown }).aromas) && (fields as { aromas?: string[] }).aromas
      ? ((fields as { aromas: string[] }).aromas as string[])
      : Array.isArray(anyFields.aroma_tags)
      ? anyFields.aroma_tags
      : [];

  return (
    <View className="gap-4">
      {/* Palate (신규 triad 표시 / legacy WSET 1~5 dot) */}
      {isLegacy && anyFields.wset ? (
        <View className="rounded-xl bg-surface p-4 gap-3">
          <WSETReadOnly label={t('notes.beginner.wsetSweetness')} value={anyFields.wset.sweetness} />
          <WSETReadOnly label={t('notes.beginner.wsetAcidity')} value={anyFields.wset.acidity} />
          <WSETReadOnly label={t('notes.beginner.wsetTannin')} value={anyFields.wset.tannin} />
          <WSETReadOnly label={t('notes.beginner.wsetBody')} value={anyFields.wset.body} />
        </View>
      ) : (
        <View className="rounded-xl bg-surface p-4">
          <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
            {t('notes.writeForm.beginnerStep.palate')}
          </Text>
          <View className="mt-3" style={{ rowGap: 6 }}>
            {PALATE_DIMS.map((dim) => {
              const value = (fields.palate as unknown as Record<string, string | undefined> | undefined)?.[
                dim
              ];
              if (!value) return null;
              return (
                <View key={dim} className="flex-row items-center justify-between">
                  <Text className="font-inter text-card-body text-text-secondary dark:text-text-secondary">
                    {t(`notes.beginner.palateDim.${dim}`)}
                  </Text>
                  <Text className="font-inter text-card-body text-text-primary dark:text-text-primary">
                    {t(`notes.beginner.palateLevel.${value}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Aroma */}
      <View className="rounded-xl bg-surface p-4">
        <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.detail.sectionAroma')}
        </Text>
        {aromas.length === 0 ? (
          <Text className="font-inter text-card-meta text-text-muted dark:text-text-muted mt-3">
            {t('notes.detail.noAroma')}
          </Text>
        ) : (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {aromas.map((tag) => (
              <View
                key={tag}
                className="rounded-full bg-bg-deep px-3 py-1"
                accessibilityRole="text"
              >
                <Text className="font-inter text-card-meta text-gold">
                  {/* 신규 aromaCard.* 키 우선, fallback legacy aromaTags.* */}
                  {translateAromaLabel(t, tag)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Memo / Comment */}
      <View className="rounded-xl bg-surface p-4">
        <Text className="font-inter text-section-title text-text-secondary dark:text-text-secondary uppercase">
          {t('notes.detail.sectionComment')}
        </Text>
        <Text className="font-inter text-card-body text-text-primary dark:text-text-primary mt-3">
          {memo.trim() ? memo : t('notes.detail.noComment')}
        </Text>
      </View>
    </View>
  );
}

// 신규 aromaCard.* 키가 있으면 그것, 없으면 legacy aromaTags.* fallback.
function translateAromaLabel(
  t: (key: string, opts?: Record<string, unknown>) => string,
  tag: string,
): string {
  const cardKey = `notes.beginner.aromaCard.${tag}`;
  const tagKey = `notes.beginner.aromaTags.${tag}`;
  // i18next는 missing key를 그대로 반환 → cardKey 시도 후 != cardKey면 사용.
  const cardLabel = t(cardKey);
  if (cardLabel !== cardKey) return cardLabel;
  const tagLabel = t(tagKey);
  if (tagLabel !== tagKey) return tagLabel;
  return tag;
}
