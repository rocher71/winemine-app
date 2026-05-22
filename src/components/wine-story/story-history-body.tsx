/**
 * StoryHistoryBody — wine-story History 본문 + inline GlossaryTooltip (i).
 *
 * 사양: _workspace/design-specs/wine-story.md §3-4 + §1 (Section B).
 *
 * keyscreen src/app/wine/[id]/story/story-history-body.tsx verbatim 변환:
 *   - paragraphs = text.split('\n\n')
 *   - 각 paragraph 의 매칭된 termId 첫 hit 만 inline 표시 (한 paragraph 한 번)
 *   - 매칭 단어: cream/text-primary, fontWeight 500
 *   - (i) trigger: Info icon 14×14, gold, BottomSheet open
 *
 * RN deviation (§6 #6): keyscreen popover → RN BottomSheet — onOpenGlossary 콜백으로 위임.
 */
import { type ReactNode, Fragment } from 'react';
import { Text, Pressable, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { light } from '@/lib/design-tokens';
import { currentLocale } from '@/lib/i18n';
import type { LocalizedString } from '@/components/shared/locale-text';

interface StoryHistoryBodyProps {
  history: LocalizedString;
  onOpenGlossary: (termId: string) => void;
}

export function StoryHistoryBody({
  history,
  onOpenGlossary,
}: StoryHistoryBodyProps) {
  const locale = currentLocale();
  const text = history[locale] ?? history.en;
  const paragraphs = text.split('\n\n');

  return (
    <View style={{ gap: 16 }}>
      {paragraphs.map((para, idx) => (
        <Text
          key={idx}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 14,
            lineHeight: 23.1,
            color: light.text.secondary,
          }}
        >
          {annotateGlossaryTerms(para, onOpenGlossary)}
        </Text>
      ))}
    </View>
  );
}

// keyscreen TERM_DEFS line 54~84 verbatim — case 동일 유지.
type TermDef = { id: string; patterns: RegExp };

const TERM_DEFS: TermDef[] = [
  {
    id: 'appellation',
    patterns: /(아펠라시옹|Appellation|appellation)/,
  },
  {
    id: 'terroir',
    patterns: /(떼루아|terroir|Terroir|terroirs)/,
  },
  {
    id: 'grand-cru',
    patterns:
      /(그랑 크뤼|그랑크뤼|Grand Cru|grand cru|Grands Crus|First Growths?|1er Grand Cru|1등급)/,
  },
  {
    id: '1855-classification',
    patterns:
      /(1855년? ?등급 분류|1855 classification|1855년 메독 분류|1855 Médoc classification)/,
  },
  {
    id: 'decanting',
    patterns: /(디캔팅|decant(?:ing)?|Decant(?:ing)?)/,
  },
  {
    id: 'wset',
    patterns: /(WSET)/,
  },
  {
    id: 'brett',
    patterns: /(브렛|Brett|Brettanomyces|브레타노마이세스)/,
  },
];

/**
 * 한 paragraph 를 받아, 첫 매칭 위치마다 (i) Pressable 을 inline 삽입한 ReactNode[] 반환.
 *
 * 알고리즘 keyscreen verbatim:
 *   - 모든 매칭 위치 수집 → 위치 정렬 → 같은 termId 첫 hit 만 유지 → 겹침 방지
 *   - 매칭 단어 inline Text + 바로 뒤 Pressable<Info>
 */
function annotateGlossaryTerms(
  text: string,
  onOpenGlossary: (termId: string) => void,
): ReactNode[] {
  const inserted = new Set<string>();
  type Hit = { index: number; length: number; id: string; match: string };
  const hits: Hit[] = [];

  for (const def of TERM_DEFS) {
    const re = new RegExp(def.patterns.source, def.patterns.flags + 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      hits.push({
        index: m.index,
        length: m[0].length,
        id: def.id,
        match: m[0],
      });
    }
  }
  hits.sort((a, b) => a.index - b.index);

  const result: ReactNode[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (inserted.has(hit.id)) continue;
    if (hit.index < cursor) continue;

    if (hit.index > cursor) {
      result.push(text.slice(cursor, hit.index));
    }
    result.push(
      <Fragment key={`${hit.id}-${hit.index}`}>
        <Text
          style={{
            color: light.text.primary,
            fontFamily: 'Freesentation_4Regular',
            fontWeight: '500',
          }}
        >
          {hit.match}
        </Text>
        <GlossaryInlineTrigger
          termId={hit.id}
          onPress={() => onOpenGlossary(hit.id)}
        />
      </Fragment>,
    );
    inserted.add(hit.id);
    cursor = hit.index + hit.length;
  }
  if (cursor < text.length) {
    result.push(text.slice(cursor));
  }
  return result;
}

interface GlossaryInlineTriggerProps {
  termId: string;
  onPress: () => void;
}

/**
 * inline (i) Pressable — RN Text 안 nested Pressable 표준.
 *
 * §4-11 3-layer 패턴은 nested 자식 단일 아이콘이라 minimal 적용:
 *   - Pressable 의 style 함수는 opacity 만
 *   - 자식 단일 <Info> 만 — flexDirection / padding 등 layout prop 부재
 */
function GlossaryInlineTrigger({ termId, onPress }: GlossaryInlineTriggerProps) {
  const { t } = useTranslation();
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };
  return (
    <Text>
      {' '}
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('wineStory.glossary.openLabel', { termId })}
        accessibilityHint={t('wineStory.glossary.openHint')}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Info size={14} strokeWidth={1.75} color={light.border.active} />
      </Pressable>
    </Text>
  );
}
