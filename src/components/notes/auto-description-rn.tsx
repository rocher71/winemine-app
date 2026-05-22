/**
 * AutoDescriptionRn — 입력값 종합 → 자동 한국어/영어 묘사 문장 생성 (200ms 디바운스).
 *
 * 사양: 랜딩페이지 auto-description.tsx 기반 RN 포팅.
 *   - intro/aroma/palate/redTannin/finish/evolution/rating 단편 → 한 문장 join
 *   - 200ms debounce typing animation 효과
 *   - 카드 외관: gold border + gold tint bg, Playfair italic body 17px
 *
 * RN deviation: Light 모드만.
 */
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react-native';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import {
  DESCRIPTION_TEMPLATES,
  LEX_BY_ID,
  WSET_LABELS_KO,
  WSET_LABELS_EN,
  type FormVariant,
  type WSETScale,
  type FinishLength,
  type EvolutionPoint,
} from '@/lib/notes/tasting-note-lexicon';

interface Meta {
  vintage: number | null;
  producer: string;
  region: string;
  wineName: string;
}

interface Aroma {
  intensity: WSETScale;
  primary: string[];
  secondary: string[];
}

interface Palate {
  sweetness: WSETScale;
  acidity: WSETScale;
  body: WSETScale;
  alcohol: WSETScale;
  tannin?: { intensity: WSETScale; texture: string };
}

interface FinishField {
  caudalies: number | null;
  length: FinishLength;
  qualityKey?: string;
}

interface Props {
  variant: FormVariant;
  meta: Meta;
  aroma: Aroma;
  palate: Palate;
  finish: FinishField;
  rating: number;
  evolution?: { peak: EvolutionPoint | null };
}

export function AutoDescriptionRn({
  variant,
  meta,
  aroma,
  palate,
  finish,
  rating,
  evolution,
}: Props) {
  const { t } = useTranslation();
  const locale = currentLocale() === 'en' ? 'en' : 'ko';
  const [shown, setShown] = useState('');

  const target = buildSentence(
    { variant, meta, aroma, palate, finish, rating, evolution },
    locale,
    t,
  );

  useEffect(() => {
    const id = setTimeout(() => setShown(target), 200);
    return () => clearTimeout(id);
  }, [target]);

  return (
    <View
      style={{
        padding: 18,
        borderWidth: 1,
        borderColor: brand.gold,
        borderRadius: 12,
        backgroundColor: withAlpha(brand.gold, 0.04),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: 6,
          marginBottom: 10,
        }}
      >
        <Sparkles size={12} strokeWidth={2} color={brand.gold} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 11,
            lineHeight: 13.2,
            letterSpacing: 1.76,
            color: brand.gold,
            textTransform: 'uppercase',
          }}
        >
          {t('notes.expert.autoDescriptionTitle')}
        </Text>
      </View>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: 16,
          fontStyle: 'italic',
          lineHeight: 27.2,
          color: light.text.primary,
          minHeight: 80,
        }}
      >
        {shown || t('notes.expert.autoDescriptionPlaceholder')}
      </Text>
    </View>
  );
}

function buildSentence(
  data: {
    variant: FormVariant;
    meta: Meta;
    aroma: Aroma;
    palate: Palate;
    finish: FinishField;
    rating: number;
    evolution?: { peak: EvolutionPoint | null };
  },
  locale: 'ko' | 'en',
  t: (k: string) => string,
): string {
  const { variant, meta, aroma, palate, finish, rating, evolution } = data;
  const tpl = DESCRIPTION_TEMPLATES[locale];
  const labels = locale === 'ko' ? WSET_LABELS_KO : WSET_LABELS_EN;

  const parts: string[] = [];

  if (meta.wineName) {
    if (meta.vintage) {
      parts.push(
        tpl.intro
          .replace('{vintage}', String(meta.vintage))
          .replace('{region}', meta.region)
          .replace('{producer}', meta.producer)
          .replace('{wineName}', meta.wineName),
      );
    } else {
      parts.push(
        tpl.introNV
          .replace('{producer}', meta.producer)
          .replace('{wineName}', meta.wineName),
      );
    }
  }

  const primaryNames = aroma.primary
    .slice(0, 3)
    .map((id) => lexLabel(id, locale))
    .filter(Boolean);
  const secondaryNames = aroma.secondary
    .slice(0, 2)
    .map((id) => lexLabel(id, locale))
    .filter(Boolean);
  if (primaryNames.length > 0) {
    parts.push(
      tpl.aroma
        .replace('{intensity}', labels[aroma.intensity])
        .replace('{primary}', primaryNames.join(' · '))
        .replace(
          '{secondary}',
          secondaryNames.join(' · ') ||
            (locale === 'ko' ? '복합적인 향들' : 'layered aromas'),
        ),
    );
  }

  parts.push(
    tpl.palate
      .replace('{body}', labels[palate.body])
      .replace('{acidity}', labels[palate.acidity])
      .replace('{sweetness}', labels[palate.sweetness]),
  );

  if (variant === 'red' && palate.tannin) {
    parts.push(
      tpl.redTannin
        .replace('{tanninIntensity}', labels[palate.tannin.intensity])
        .replace('{tanninTexture}', palate.tannin.texture),
    );
  }

  if (finish.caudalies != null && finish.caudalies > 0) {
    parts.push(
      tpl.finish
        .replace('{caudalies}', String(finish.caudalies))
        .replace('{finishLength}', finish.length)
        .replace(
          '{finishQuality}',
          finish.qualityKey ?? (locale === 'ko' ? '균형 잡힌' : 'balanced'),
        ),
    );
  } else {
    parts.push(
      tpl.finishNoCaudalie
        .replace('{finishLength}', finish.length)
        .replace(
          '{finishQuality}',
          finish.qualityKey ?? (locale === 'ko' ? '균형 잡힌' : 'balanced'),
        ),
    );
  }

  if (evolution?.peak) {
    const newAromas = evolution.peak.newAromasEmerged
      .slice(0, 2)
      .map((id) => lexLabel(id, locale))
      .filter(Boolean)
      .join(' · ');
    parts.push(
      tpl.evolution
        .replace('{peakLabel}', evolution.peak.label)
        .replace(
          '{firstChange}',
          evolution.peak.reductionPresent
            ? locale === 'ko'
              ? '환원취가'
              : 'reduction'
            : locale === 'ko'
            ? '닫힌 향이'
            : 'closed aromas',
        )
        .replace(
          '{newAromas}',
          newAromas || (locale === 'ko' ? '복합적인 향' : 'layered notes'),
        ),
    );
  }

  if (rating > 0) {
    parts.push(tpl.rating.replace('{rating}', String(rating)));
  }

  if (parts.length === 0) {
    return t('notes.expert.autoDescriptionPlaceholder') || tpl.placeholder;
  }
  return parts.join(' ');
}

function lexLabel(id: string, locale: 'ko' | 'en'): string {
  const l = LEX_BY_ID[id];
  if (!l) return '';
  return locale === 'ko' ? l.ko : l.en;
}
