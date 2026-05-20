/**
 * NoteWineHeaderLink — 노트 상세 화면 상단 컴팩트 와인 헤더 (44×64 thumb + name + meta).
 *
 * 사양: design-spec notes-detail.md §2-2 + §10 E1 (a) — WineHero 88×290 hero 제거,
 * keyscreen verbatim 컴팩트 thumb 헤더로 교체.
 *
 * 키스크린 원본: src/app/notes/[noteId]/page.tsx line 161~222.
 * 구조:
 *   Pressable (px 20 py 14 flex-row items-center gap 12, onPress → /wine/{lwin})
 *   ├── BottleThumb (44×64, radius 6, border withAlpha(gold, 0.18))
 *   │     case A: photoUrl → Image cover
 *   │     case B: no photo → LinearGradient(notesDetailBottleThumbGradient(bottleColor))
 *   └── MetaCol (flex 1, minWidth 0)
 *         ├── WineName (WineNameDisplay size="card" — Playfair 16 lh 20.8 cream)
 *         └── Sub (Inter 12 text-muted mt 0.5) — "{vintage} · {region} · {country}"
 *
 * note: wines_localized view의 컬럼은 region/country (사양 §5-3의 _ko 변형 컬럼은 view 부재 —
 * v0.1.0은 단일 locale 컬럼 사용 — supabase-engineer 영역).
 */
import { View, Text, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import {
  brand,
  withAlpha,
  notesDetailBottleThumbGradient,
} from '@/lib/design-tokens';
import { getDefaultBottleColor } from '@/lib/lwin';

interface Props {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  photoUrl?: string | null;
}

export function NoteWineHeaderLink({
  lwin,
  display_name,
  name_ko,
  bottle_color,
  type_canonical,
  vintage,
  region,
  country,
  photoUrl,
}: Props) {
  const { t } = useTranslation();
  const bottleColor =
    bottle_color ??
    getDefaultBottleColor(
      (type_canonical as 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert' | null) ?? null,
    );
  const gradient = notesDetailBottleThumbGradient(bottleColor);

  const subParts: string[] = [];
  if (typeof vintage === 'number') subParts.push(String(vintage));
  if (region) subParts.push(region);
  if (country) subParts.push(country);
  const subLine = subParts.join(' · ');

  return (
    <Pressable
      onPress={() => router.push(`/wine/${encodeURIComponent(lwin)}`)}
      accessibilityRole="button"
      accessibilityLabel={`${name_ko ?? display_name} — ${t('notes.detail.viewWine')}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 44,
          height: 64,
          borderRadius: 6,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: withAlpha(brand.gold, 0.18),
          flexShrink: 0,
          marginRight: 12,
        }}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <LinearGradient
            colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
            start={gradient.start}
            end={gradient.end}
            locations={gradient.locations as unknown as readonly [number, number, ...number[]]}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <WineNameDisplay
          lwin={lwin}
          name_ko={name_ko}
          display_name={display_name}
          size="card"
        />
        {subLine ? (
          <Text
            allowFontScaling={false}
            className="font-inter text-text-muted dark:text-text-muted"
            style={{ fontSize: 12, lineHeight: 14.4, marginTop: 2 }}
            numberOfLines={1}
          >
            {subLine}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
