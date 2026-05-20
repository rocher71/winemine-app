/**
 * NoteAuthorCard — gold border 시그니처 메타 카드 (avatar + name + chips).
 *
 * 사양: design-spec notes-detail.md §2-3 + §12 표.
 * 키스크린 원본: src/app/notes/[noteId]/page.tsx line 225~332.
 *
 * 구조:
 *   View (mx 16, p 14, radius 14, bg-surface, border 1 border-gold, gap 10)
 *   ├── Row1 (flex-row items-center gap 10)
 *   │     ├── NoteAuthorAvatar 32×32 L1 fallback
 *   │     ├── AuthorName (Playfair 14 cream) — anonymous_display 또는 "나"/"Me"
 *   │     └── TemplatePill (Inter 10 muted, border-default radius 999)
 *   └── Row2 (flex-row gap 14 flex-wrap)
 *         ├── DateChip (Calendar 12 + Inter 12 muted) — tasted_at slice 0,10
 *         ├── RatingChip (Star 12 gold + Inter 12 600 gold) — `${rating}/5`
 *         ├── PriceChip (Inter 12 secondary) — "₩{n}" — priceKrw 있을 때만
 *         └── BlindChip (EyeOff 12 + Inter 10 600 gold, bg-bg-deep radius 999) — expert.blind 일 때만
 *
 * a11y: card 자체는 group, 각 chip은 individual text. Avatar는 decorative.
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, Star, EyeOff } from 'lucide-react-native';
import { brand, withAlpha } from '@/lib/design-tokens';
import { NoteAuthorAvatar } from './note-author-avatar';

interface Props {
  /** anonymous_display 첫 글자 (또는 "M"/"나"). UUID 노출 금지 (§4-5). */
  authorLetter: string;
  /** anonymous_display 또는 "나"/"Me". */
  authorName: string;
  /** Template label — "입문자"/"Beginner" 또는 "전문가"/"Expert". null 이면 hide. */
  templateLabel: string | null;
  /** YYYY-MM-DD. */
  tastedAt: string;
  /** 0~5 half-step. null 이면 chip 숨김. */
  rating: number | null;
  /** KRW. null 이면 chip 숨김. */
  priceKrw: number | null;
  /** Expert blind taste 여부. */
  blind: boolean;
}

function formatRating(value: number): string {
  // 0~5 half-step. integer면 "4/5", half면 "4.5/5".
  return Number.isInteger(value) ? `${value}/5` : `${value.toFixed(1)}/5`;
}

function formatKrw(value: number, locale: string): string {
  try {
    return `₩${value.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR')}`;
  } catch {
    return `₩${value}`;
  }
}

export function NoteAuthorCard({
  authorLetter,
  authorName,
  templateLabel,
  tastedAt,
  rating,
  priceKrw,
  blind,
}: Props) {
  const { t, i18n } = useTranslation();
  const dateText = tastedAt.slice(0, 10);

  return (
    <View
      style={{
        marginHorizontal: 16,
        padding: 14,
        borderRadius: 14,
        backgroundColor: undefined,
        borderWidth: 1,
        borderColor: brand.gold,
        gap: 10,
      }}
      className="bg-surface"
    >
      {/* Row1: avatar + name + TemplatePill */}
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <NoteAuthorAvatar letter={authorLetter} level="L1" />
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{ flex: 1, fontSize: 14, lineHeight: 16.8 }}
        >
          {authorName}
        </Text>
        {templateLabel ? (
          <View
            style={{
              paddingVertical: 4,
              paddingHorizontal: 9,
              borderRadius: 999,
              borderWidth: 1,
            }}
            className="border-border-default"
          >
            <Text
              allowFontScaling={false}
              className="font-inter text-text-muted dark:text-text-muted"
              style={{ fontSize: 10, lineHeight: 12 }}
            >
              {templateLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Row2: DateChip + RatingChip + PriceChip + BlindChip */}
      <View className="flex-row flex-wrap items-center" style={{ rowGap: 6, columnGap: 14 }}>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Calendar size={12} strokeWidth={1.75} color={brand.gold} opacity={0.85} />
          <Text
            allowFontScaling={false}
            className="font-inter text-text-muted dark:text-text-muted"
            style={{ fontSize: 12, lineHeight: 14.4 }}
          >
            {dateText}
          </Text>
        </View>

        {typeof rating === 'number' ? (
          <View
            className="flex-row items-center"
            style={{ gap: 4 }}
            accessibilityRole="text"
            accessibilityLabel={`${rating}/5`}
          >
            <Star size={12} strokeWidth={0} color={brand.gold} fill={brand.gold} />
            <Text
              allowFontScaling={false}
              className="font-inter-semibold"
              style={{ fontSize: 12, lineHeight: 14.4, color: brand.gold }}
            >
              {formatRating(rating)}
            </Text>
          </View>
        ) : null}

        {typeof priceKrw === 'number' && priceKrw > 0 ? (
          <Text
            allowFontScaling={false}
            className="font-inter text-text-secondary dark:text-text-secondary"
            style={{ fontSize: 12, lineHeight: 14.4 }}
          >
            {formatKrw(priceKrw, i18n.language)}
          </Text>
        ) : null}

        {blind ? (
          <View
            className="flex-row items-center"
            style={{
              paddingHorizontal: 9,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: withAlpha(brand.gold, 0.08),
              gap: 4,
            }}
          >
            <EyeOff size={12} strokeWidth={2} color={brand.gold} />
            <Text
              allowFontScaling={false}
              className="font-inter-semibold"
              style={{ fontSize: 10, lineHeight: 12, color: brand.gold }}
            >
              {t('notes.detail.blindBadge')}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
