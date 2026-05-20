/**
 * DraftNoteResume — 작성 중인 노트 이어 쓰기 카드.
 *
 * 사양 home.md §2-1 line 74-83, §3-3:
 * - LinearGradient 135deg [wineRed 0.45, surface] + border 1px wineRed 0.55, radius 14, m 14_16_0
 * - Pen icon circle 32×32 bg-bg-deep, border-default
 * - Title Inter 12 600 cream / Subtitle Inter 11 text-secondary
 * - CTA pill border 1px gold, gold text, Inter 11 600
 *
 * v0.1.0: draft 시스템 (사양 §12 Q5) 미해결 — props로 받아 부모(HeavyHome)가 hide 결정.
 * 없으면 컴포넌트 자체 null. mock으로 props 채워서 노출 가능.
 */
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { brand, gradients, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface DraftNoteResumeProps {
  shortWineName: string;
  progressPct: number;
  wineLwin?: string;
}

export function DraftNoteResume({ shortWineName, progressPct, wineLwin }: DraftNoteResumeProps) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const gradient = tokens.scheme === 'light' ? gradients.draftResume.light : gradients.draftResume.dark;
  const borderColor = withAlpha(brand.wineRed, 0.55);

  const onPress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    const target = wineLwin ? `/notes/new/write?wineLwin=${wineLwin}` : '/notes/new/write';
    router.push(target as never);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${t('home.draftResume.title')} ${shortWineName}`}
      accessibilityHint={t('home.draftResume.cta')}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <LinearGradient
        colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
        start={gradient.start}
        end={gradient.end}
        style={{
          marginTop: 14,
          marginHorizontal: 16,
          padding: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            className="bg-bg-deep dark:bg-bg-deep border border-border-default dark:border-border-default"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pencil size={16} strokeWidth={1.7} color={brand.gold} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              className="font-inter-semibold text-text-primary dark:text-text-primary"
              style={{ fontSize: 12, lineHeight: 15.6 }}
              numberOfLines={1}
            >
              {t('home.draftResume.title')}
            </Text>
            <Text
              className="font-inter text-text-secondary dark:text-text-secondary"
              style={{ fontSize: 11, marginTop: 2 }}
              numberOfLines={1}
            >
              {t('home.draftResume.subtitle', { wine: shortWineName, progress: progressPct })}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: brand.gold,
            }}
          >
            <Text
              className="font-inter-semibold"
              style={{ color: brand.gold, fontSize: 11 }}
            >
              {t('home.draftResume.cta')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
