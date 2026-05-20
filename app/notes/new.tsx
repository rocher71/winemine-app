/**
 * /notes/new — Note Source Picker (2-stage Template/Source/Cellar)
 *
 * 사양: design-spec notes-new.md (Option A verbatim 2-stage 채택).
 * 키스크린 원본: ../winemine-keyscreen/src/app/notes/new/page.tsx (305 LOC).
 *
 * Stage 1: TemplatePicker (selectedTemplateId == null)
 * Stage 2: SourcePicker (selectedTemplateId != null) — Cellar/NewWine 2-card
 * Stage 3: Cellar BottomSheet (pickOpen) — cellar wine 선택
 *
 * Routing:
 *   - NewWineCard press → /notes/new/write?from=newEntry&templateId={tid}{&wine_lwin}{&photo_url}
 *   - CellarRow press   → /notes/new/write?from=cellar&itemId={id}&templateId={tid}&wine_lwin={lwin}{&photo_url}
 */
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { BackHeader } from '@/components/nav/back-header';
import { TemplateCard } from '@/components/notes/template-card';
import { SourcePicker } from '@/components/notes/source-picker';
import { CellarBottomSheet } from '@/components/notes/cellar-bottom-sheet';
import {
  BUILTIN_TEMPLATES,
  BUILTIN_BEGINNER_ID,
  type BuiltinTemplateId,
} from '@/lib/notes/builtin-templates';
import { useCellarList, type CellarItemWithWine } from '@/hooks/use-cellar';
import { brand } from '@/lib/design-tokens';

export default function NoteSourcePickerScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ wine_lwin?: string; photo_url?: string }>();

  const [selectedTemplateId, setSelectedTemplateId] = useState<BuiltinTemplateId | null>(null);
  const [pickOpen, setPickOpen] = useState(false);

  const { items: cellarItems, loading: cellarLoading } = useCellarList('cellared');
  const cellarCount = cellarItems.length;

  // query forward helper
  const buildQuery = useCallback(
    (extra: Record<string, string>) => {
      const q = new URLSearchParams(extra);
      const wineLwin = typeof params.wine_lwin === 'string' ? params.wine_lwin : null;
      const photoUrl = typeof params.photo_url === 'string' ? params.photo_url : null;
      if (wineLwin && !q.has('wine_lwin')) q.set('wine_lwin', wineLwin);
      if (photoUrl) q.set('photo_url', photoUrl);
      return q.toString();
    },
    [params.wine_lwin, params.photo_url],
  );

  // Stage transitions
  const handlePickTemplate = (id: BuiltinTemplateId) => {
    setSelectedTemplateId(id);
  };

  const handleBackToTemplate = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setSelectedTemplateId(null);
  };

  const handlePickCellar = () => {
    setPickOpen(true);
  };

  const handlePickNewEntry = () => {
    const tid = selectedTemplateId ?? BUILTIN_BEGINNER_ID;
    const qs = buildQuery({
      from: 'newEntry',
      templateId: encodeURIComponent(tid),
    });
    router.push(`/notes/new/write?${qs}` as never);
  };

  const handlePickCellarItem = (item: CellarItemWithWine) => {
    const tid = selectedTemplateId ?? BUILTIN_BEGINNER_ID;
    const wineLwin = item.wine?.lwin;
    if (!wineLwin) return;
    setPickOpen(false);
    const qs = buildQuery({
      from: 'cellar',
      itemId: item.id,
      templateId: encodeURIComponent(tid),
      wine_lwin: wineLwin,
    });
    router.push(`/notes/new/write?${qs}` as never);
  };

  return (
    <View className="flex-1 bg-bg-deepest dark:bg-bg-deepest">
      <BackHeader title={t('notes.source.title')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 32 }}
      >
        {selectedTemplateId === null ? (
          <Stage1TemplatePicker onPick={handlePickTemplate} />
        ) : (
          <Stage2SourcePicker
            cellarCount={cellarCount}
            cellarLoading={cellarLoading}
            onBack={handleBackToTemplate}
            onPickCellar={handlePickCellar}
            onPickNewEntry={handlePickNewEntry}
          />
        )}
      </ScrollView>

      {/* Stage 3 overlay */}
      <CellarBottomSheet
        open={pickOpen}
        items={cellarItems}
        onClose={() => setPickOpen(false)}
        onPickItem={handlePickCellarItem}
      />
    </View>
  );
}

interface Stage1Props {
  onPick: (id: BuiltinTemplateId) => void;
}

function Stage1TemplatePicker({ onPick }: Stage1Props) {
  const { t } = useTranslation();
  return (
    <View>
      {/* Header (mb-3.5 = 14) */}
      <View style={{ marginBottom: 14 }}>
        <Text className="font-playfair text-modal-title text-text-primary dark:text-text-primary">
          {t('notesNew.templatePicker.title')}
        </Text>
        <Text
          className="font-inter text-card-body text-text-muted dark:text-text-muted"
          style={{ marginTop: 4, lineHeight: 19.5 }}
        >
          {t('notesNew.templatePicker.subtitle')}
        </Text>
      </View>

      {/* TemplateList (gap-2.5 = 10) */}
      <View style={{ gap: 10 }}>
        {BUILTIN_TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            kind={tpl.kind}
            title={t(tpl.titleKey)}
            description={t(tpl.descKey)}
            onPress={() => onPick(tpl.id)}
          />
        ))}
      </View>
    </View>
  );
}

interface Stage2Props {
  cellarCount: number;
  cellarLoading: boolean;
  onBack: () => void;
  onPickCellar: () => void;
  onPickNewEntry: () => void;
}

function Stage2SourcePicker({
  cellarCount,
  cellarLoading,
  onBack,
  onPickCellar,
  onPickNewEntry,
}: Stage2Props) {
  const { t } = useTranslation();
  return (
    <View>
      {/* BackToTemplateLink (mb-3 = 12) */}
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t('notesNew.sourcePicker.changeTemplate')}
        accessibilityHint={t('notesNew.sourcePicker.changeTemplateHint')}
        hitSlop={8}
        style={{ marginBottom: 12, alignSelf: 'flex-start' }}
      >
        <Text
          className="font-inter-semibold"
          style={{ fontSize: 11, lineHeight: 13.2, color: brand.gold }}
        >
          {`← ${t('notesNew.sourcePicker.changeTemplate')}`}
        </Text>
      </Pressable>

      {/* Header (mb-1 = 4) */}
      <View style={{ marginBottom: 4 }}>
        <Text className="font-playfair text-modal-title text-text-primary dark:text-text-primary">
          {t('notes.source.question')}
        </Text>
        <Text
          className="font-inter text-card-body text-text-muted dark:text-text-muted"
          style={{ marginTop: 4, lineHeight: 19.5 }}
        >
          {t('notesNew.sourcePicker.subtitle')}
        </Text>
      </View>

      {/* Stage 2: 12 spacer */}
      <View style={{ height: 12 }} />

      {cellarLoading ? (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <ActivityIndicator color={brand.gold} />
        </View>
      ) : (
        <SourcePicker
          cellarCount={cellarCount}
          onPickCellar={onPickCellar}
          onPickNewEntry={onPickNewEntry}
        />
      )}
    </View>
  );
}
