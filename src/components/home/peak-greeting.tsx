/**
 * PeakGreeting — heavy 모드 상단 hero 인사말 (5초마다 회전).
 *
 * 사양 home.md §2-1 line 70-72, §3-2, §5 의사코드.
 * - eyebrow Inter 10 500 gold UPPER tracking 1.8
 * - question Playfair 22 cream lh 27.5 ls -0.22
 * - wine name inline italic gold
 * - 5초마다 idx++ → Reanimated FadeInDown(450).springify().damping(18) entering / FadeOutUp(450) exiting
 *
 * v0.1.0: 와인 데이터 (peak wines) supabase에 없음 → fallback 또는 빈 wines 배열.
 * 그러나 사양 §11 "PeakGreeting 정점 인사말 실 와인 데이터" P2(v0.2.0) — alpha는 fallback만.
 * 향후 wines 배열 prop 받아 cycle 가능하도록 인터페이스 유지.
 */
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Trans, useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

interface PeakGreetingProps {
  name: string;
  wines?: string[];
}

const CYCLE_LENGTH = 4;
const ROTATE_MS = 5000;

export function PeakGreeting({ name, wines = [] }: PeakGreetingProps) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (wines.length === 0) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % CYCLE_LENGTH);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [wines.length]);

  const wineName = wines.length > 0 ? wines[idx % wines.length] : null;
  const questionKey = `home.peakGreeting.questions.${idx % CYCLE_LENGTH}`;

  return (
    <View style={{ paddingTop: 18, paddingHorizontal: 20 }}>
      <Text
        className="font-inter-medium uppercase"
        style={{ color: brand.gold, fontSize: 10, letterSpacing: 1.8, marginBottom: 6 }}
        accessibilityRole="text"
      >
        {t('home.peakGreeting.eyebrow')}
      </Text>
      <View style={{ minHeight: 56, position: 'relative' }}>
        <Animated.View
          key={idx}
          entering={FadeInDown.duration(450).springify().damping(18)}
          exiting={FadeOutUp.duration(450)}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
        >
          {wineName ? (
            <Text
              className="font-playfair text-text-primary dark:text-text-primary"
              style={{ fontSize: 22, lineHeight: 27.5, letterSpacing: -0.22 }}
              allowFontScaling
            >
              <Trans
                i18nKey={questionKey}
                values={{ name, wine: wineName }}
                components={{
                  wine: (
                    <Text
                      style={{
                        color: brand.gold,
                        // home spec §9 P0 — use the dedicated italic face,
                        // not system fake italic on the Regular face.
                        fontFamily: 'Freesentation_4Regular',
                      }}
                    />
                  ),
                }}
              />
            </Text>
          ) : (
            <Text
              className="font-playfair text-text-primary dark:text-text-primary"
              style={{ fontSize: 22, lineHeight: 27.5, letterSpacing: -0.22 }}
              allowFontScaling
            >
              {t('home.peakGreeting.fallback', { name })}
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
}
