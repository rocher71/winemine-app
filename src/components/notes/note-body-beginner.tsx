/**
 * NoteBodyBeginner — note detail 화면에서 BeginnerFields 표시 (read-only).
 *
 * 사양: design-spec notes-detail.md §2-5A + §13 — Beginner 본문은 Palate Section + Aroma Section.
 * Memo는 mode 무관 공통 NoteMemoCard가 책임 (§10 E3 (a)), 본 컴포넌트는 Comment Section 미렌더.
 *
 * 카드 Eyebrow는 keyscreen verbatim (Inter 600 10 gold uppercase ls 1.8).
 * Aroma chip은 chipLabelRegular(Inter 11 400) — gap 1.5(=6px) keyscreen verbatim.
 *
 * 기존 jsonb (구 shape: wset/aroma_tags/comments) 호환은 legacy fallback 으로 유지.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
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

function Eyebrow({ children }: { children: string }) {
  return (
    <Text
      allowFontScaling={false}
      className="font-inter-semibold"
      style={{
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: brand.gold,
        marginBottom: 10,
      }}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

export function NoteBodyBeginner({ fields }: Props) {
  const { t } = useTranslation();
  const anyFields = fields as AnyBeginnerFields;
  const isLegacy = anyFields.wset !== undefined && anyFields.palate === undefined;

  // aromas: 신규 fields.aromas 우선, fallback legacy aroma_tags.
  const aromas: readonly string[] =
    Array.isArray((fields as { aromas?: unknown }).aromas) && (fields as { aromas?: string[] }).aromas
      ? ((fields as { aromas: string[] }).aromas as string[])
      : Array.isArray(anyFields.aroma_tags)
      ? anyFields.aroma_tags
      : [];

  return (
    <View className="gap-4">
      {/* Palate */}
      {isLegacy && anyFields.wset ? (
        <View
          className="bg-surface border-border-default"
          style={{
            borderRadius: 14,
            borderWidth: 1,
            padding: 14,
            rowGap: 12,
          }}
        >
          <Eyebrow>{t('notes.detail.sectionPalateBeginner')}</Eyebrow>
          <WSETReadOnly label={t('notes.beginner.wsetSweetness')} value={anyFields.wset.sweetness} />
          <WSETReadOnly label={t('notes.beginner.wsetAcidity')} value={anyFields.wset.acidity} />
          <WSETReadOnly label={t('notes.beginner.wsetTannin')} value={anyFields.wset.tannin} />
          <WSETReadOnly label={t('notes.beginner.wsetBody')} value={anyFields.wset.body} />
        </View>
      ) : (
        <View
          className="bg-surface border-border-default"
          style={{
            borderRadius: 14,
            borderWidth: 1,
            padding: 14,
          }}
        >
          <Eyebrow>{t('notes.detail.sectionPalateBeginner')}</Eyebrow>
          <View style={{ rowGap: 6 }}>
            {PALATE_DIMS.map((dim) => {
              const value = (fields.palate as unknown as Record<string, string | undefined> | undefined)?.[
                dim
              ];
              if (!value) return null;
              return (
                <View key={dim} className="flex-row items-center justify-between">
                  <Text
                    allowFontScaling={false}
                    className="font-inter text-text-secondary dark:text-text-secondary"
                    style={{ fontSize: 12, lineHeight: 18 }}
                  >
                    {t(`notes.beginner.palateDim.${dim}`)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    className="font-playfair text-text-primary dark:text-text-primary"
                    style={{ fontSize: 14, lineHeight: 15.4 }}
                  >
                    {t(`notes.beginner.palateLevel.${value}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Aroma */}
      <View
        className="bg-surface border-border-default"
        style={{
          borderRadius: 14,
          borderWidth: 1,
          padding: 14,
        }}
      >
        <Eyebrow>{t('notes.detail.sectionAroma')}</Eyebrow>
        {aromas.length === 0 ? (
          <Text
            allowFontScaling={false}
            className="font-inter text-text-muted dark:text-text-muted"
            style={{ fontSize: 12, lineHeight: 18 }}
          >
            {t('notes.detail.noAroma')}
          </Text>
        ) : (
          <View className="flex-row flex-wrap" style={{ rowGap: 6, columnGap: 6 }}>
            {aromas.map((tag) => (
              <View
                key={tag}
                className="bg-bg-sunken border-border-default"
                style={{
                  paddingVertical: 3,
                  paddingHorizontal: 9,
                  borderRadius: 999,
                  borderWidth: 1,
                }}
                accessibilityRole="text"
              >
                <Text
                  allowFontScaling={false}
                  className="font-inter text-text-primary dark:text-text-primary"
                  style={{ fontSize: 11, lineHeight: 13.2 }}
                >
                  {translateAromaLabel(t, tag)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  const cardLabel = t(cardKey);
  if (cardLabel !== cardKey) return cardLabel;
  const tagLabel = t(tagKey);
  if (tagLabel !== tagKey) return tagLabel;
  return tag;
}
