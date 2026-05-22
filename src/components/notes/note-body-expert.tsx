/**
 * NoteBodyExpert — note detail에서 ExpertFields 표시 (read-only).
 *
 * 새 canonical shape (variant/aroma_intensity/aromas/palate/finish/quality/readiness/...) 우선.
 * Legacy shape (appearance/nose/palate/conclusions) fallback 지원 (Day 5 이전 노트 호환).
 *
 * 사양: design-spec notes-detail.md §2-5B + §13.
 * 키스크린 영감: src/app/notes/[noteId]/page.tsx DimensionsExpert.
 *
 * Light 모드만 (light.* 직접 사용).
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, light, withAlpha } from '@/lib/design-tokens';
import type { ExpertFields, Readiness } from './expert-form';

// ---- Legacy shape (Day 5 이전) ----
interface LegacyExpertFields {
  appearance?: { intensity: number; clarity: number; notes: string };
  nose?: { intensity: number; development: number; aromas: string };
  palate?: {
    sweetness: number;
    acidity: number;
    tannin: number;
    alcohol: number;
    body: number;
    flavor: number;
    finish: number;
  };
  conclusions?: {
    quality: number;
    readiness: Readiness;
    estimated_price_krw: number | null;
  };
  blind?: boolean;
}

type AnyExpertFields = ExpertFields & LegacyExpertFields;

interface Props {
  fields: ExpertFields;
}

const WSET_LABELS_KO: Record<number, string> = { 1: '낮음', 2: '중−', 3: '중', 4: '중+', 5: '높음' };
const WSET_LABELS_EN: Record<number, string> = { 1: 'Low', 2: 'M−', 3: 'Med', 4: 'M+', 5: 'High' };

const AROMA_LABEL_KEY = (id: string) => `notes.beginner.aromaCard.${id}`;
const FINISH_LABEL_KEY = (id: string) => `notes.beginner.finishLevel.${id}`;

function isNewShape(f: AnyExpertFields): boolean {
  return (
    f.variant !== undefined ||
    f.aroma_intensity !== undefined ||
    (f.palate && typeof (f.palate as { flavor_intensity?: number }).flavor_intensity === 'number')
  );
}

function readinessLabel(t: (k: string) => string, r: Readiness): string {
  if (r === 'tooYoung') return t('notes.expert.readinessTooYoung');
  if (r === 'pastPeak') return t('notes.expert.readinessPastPeak');
  return t('notes.expert.readinessDrink');
}

function Eyebrow({ children }: { children: string }) {
  return (
    <Text
      allowFontScaling={false}
      style={{
        fontFamily: 'Inter_600SemiBold',
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: light.bg.surface,
        borderColor: light.border.default,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
      }}
    >
      {children}
    </View>
  );
}

function DimRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: withAlpha(brand.gold, 0.12),
      }}
    >
      <Text
        allowFontScaling={false}
        style={{ fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 14.4, color: light.text.muted }}
      >
        {label}
      </Text>
      <Text
        allowFontScaling={false}
        style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 14.4, color: light.text.primary }}
      >
        {value}
      </Text>
    </View>
  );
}

function DimGrid({
  items,
  cols,
}: {
  items: ReadonlyArray<{ label: string; value: string }>;
  cols: number;
}) {
  // RN flex-wrap grid (D1 verbatim deviation: CSS grid → flex-wrap with width %)
  const widthPct = `${100 / cols - 1}%`;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 8 }}>
      {items.map((it, i) => (
        <View key={`${it.label}-${i}`} style={{ width: widthPct as `${number}%`, alignItems: 'center' }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 9,
              lineHeight: 11,
              letterSpacing: 0.36,
              textTransform: 'uppercase',
              color: light.text.muted,
              marginBottom: 4,
            }}
          >
            {it.label}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 13,
              lineHeight: 14.3,
              color: light.text.primary,
            }}
          >
            {it.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function wsetShort(value: number, locale: 'ko' | 'en'): string {
  const labels = locale === 'en' ? WSET_LABELS_EN : WSET_LABELS_KO;
  return labels[value] ?? labels[3] ?? 'Med';
}

import { currentLocale } from '@/lib/i18n';

export function NoteBodyExpert({ fields }: Props) {
  const { t } = useTranslation();
  const any = fields as AnyExpertFields;
  const locale = currentLocale() === 'en' ? 'en' : 'ko';

  // ---- Legacy fallback (appearance / nose / palate(numeric 4-section) / conclusions) ----
  if (!isNewShape(any) && any.appearance && any.nose && any.palate && any.conclusions) {
    const p = any.palate as NonNullable<LegacyExpertFields['palate']>;
    const c = any.conclusions as NonNullable<LegacyExpertFields['conclusions']>;
    return (
      <View style={{ rowGap: 16 }}>
        <Card>
          <Eyebrow>{t('notes.expert.sectionAppearance')}</Eyebrow>
          <DimGrid
            items={[
              { label: t('notes.expert.appearanceIntensity'), value: wsetShort(any.appearance.intensity, locale) },
              { label: t('notes.expert.appearanceClarity'), value: `${any.appearance.clarity}/3` },
            ]}
            cols={2}
          />
        </Card>
        <Card>
          <Eyebrow>{t('notes.expert.sectionNose')}</Eyebrow>
          <DimGrid
            items={[
              { label: t('notes.expert.noseIntensity'), value: wsetShort(any.nose.intensity, locale) },
              { label: t('notes.expert.noseDevelopment'), value: `${any.nose.development}/3` },
            ]}
            cols={2}
          />
        </Card>
        <Card>
          <Eyebrow>{t('notes.expert.sectionPalate')}</Eyebrow>
          <DimGrid
            items={[
              { label: t('notes.expert.palateSweetness'), value: wsetShort(p.sweetness, locale) },
              { label: t('notes.expert.palateAcidity'), value: wsetShort(p.acidity, locale) },
              { label: t('notes.expert.palateTannin'), value: wsetShort(p.tannin, locale) },
              { label: t('notes.expert.palateAlcohol'), value: wsetShort(p.alcohol, locale) },
              { label: t('notes.expert.palateBody'), value: wsetShort(p.body, locale) },
            ]}
            cols={5}
          />
        </Card>
        <Card>
          <Eyebrow>{t('notes.expert.sectionConclusions')}</Eyebrow>
          <DimRow label={t('notes.expert.conclusionsQuality')} value={wsetShort(c.quality, locale)} />
          <DimRow label={t('notes.expert.conclusionsReadiness')} value={readinessLabel(t, c.readiness)} />
          {typeof c.estimated_price_krw === 'number' ? (
            <DimRow
              label={t('notes.expert.conclusionsPriceKrw')}
              value={`₩${c.estimated_price_krw.toLocaleString()}`}
            />
          ) : null}
        </Card>
      </View>
    );
  }

  // ---- New canonical shape — palate has WSETScale fields ----
  const palate = fields.palate as unknown as { flavor_intensity?: string; tannin?: string; bubble?: string } | undefined;
  const palateItems: { label: string; value: string }[] = [];
  if (palate?.tannin) {
    palateItems.push({ label: t('notes.expert.palateTannin'), value: palate.tannin });
  }
  if (palate?.bubble) {
    palateItems.push({ label: t('notes.expert.palateBubble'), value: palate.bubble });
  }

  return (
    <View style={{ rowGap: 16 }}>
      {/* Variant + aroma intensity */}
      <Card>
        <Eyebrow>{t('notes.expert.sectionAroma')}</Eyebrow>
        {typeof fields.aroma_intensity === 'number' && (
          <DimRow label={t('notes.expert.aromaIntensity')} value={wsetShort(fields.aroma_intensity, locale)} />
        )}
        {palate?.flavor_intensity && (
          <DimRow label={t('notes.expert.palateFlavor')} value={String(palate.flavor_intensity)} />
        )}
        {fields.aromas?.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 10,
                lineHeight: 12,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: light.text.muted,
                marginBottom: 6,
              }}
            >
              {t('notes.detail.sectionAromaWheel')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, rowGap: 6 }}>
              {fields.aromas.map((id) => (
                <View
                  key={id}
                  style={{
                    paddingVertical: 3,
                    paddingHorizontal: 9,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: light.border.default,
                    backgroundColor: light.bg.sunken,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 11,
                      lineHeight: 13.2,
                      color: light.text.primary,
                    }}
                  >
                    {t(AROMA_LABEL_KEY(id))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </Card>

      {/* Palate WSET dimensions */}
      <Card>
        <Eyebrow>{t('notes.detail.sectionWset')}</Eyebrow>
        <DimGrid items={palateItems} cols={palateItems.length <= 4 ? palateItems.length : 5} />
      </Card>

      {/* Finish */}
      <Card>
        <Eyebrow>{t('notes.expert.sectionFinish')}</Eyebrow>
        <DimRow
          label={t('notes.expert.palateFinish')}
          value={t(FINISH_LABEL_KEY(fields.finish))}
        />
      </Card>

      {/* Conclusions */}
      <Card>
        <Eyebrow>{t('notes.expert.sectionConclusions')}</Eyebrow>
        <DimRow
          label={t('notes.expert.conclusionsQuality')}
          value={`${fields.quality}/5`}
        />
        <DimRow
          label={t('notes.expert.conclusionsReadiness')}
          value={readinessLabel(t, fields.readiness)}
        />
        {typeof fields.estimated_price_krw === 'number' && fields.estimated_price_krw > 0 ? (
          <DimRow
            label={t('notes.expert.conclusionsPriceKrw')}
            value={`₩${fields.estimated_price_krw.toLocaleString()}`}
          />
        ) : null}
        <DimRow
          label={t('notes.expert.wouldBuyAgain')}
          value={
            fields.would_buy_again
              ? locale === 'en'
                ? 'Yes — will reorder'
                : '네, 다시 살 거예요'
              : locale === 'en'
                ? 'Not this time'
                : '이번엔 한 번이면 충분'
          }
        />
      </Card>
    </View>
  );
}
