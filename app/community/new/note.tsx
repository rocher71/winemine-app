/**
 * /community/new/note — 내 시음 노트로 글 쓰기.
 *
 * Stage 1: 내 노트 목록 (selectedNoteId == null)
 *   - MOCK_TASTING_NOTES 리스트 표시 (와인 이름, 점수, 날짜, 메모 발췌)
 *   - 하단: '새 노트 작성하러 가기' 버튼 → /notes/new
 *   - 노트 0개: empty state + 새 노트 버튼만
 * Stage 2: 글 작성 (selectedNoteId != null)
 *   - Title TextInput
 *   - Body TextInput
 *   - 선택한 노트 embed (NoteEmbedCard) — 탭하면 /notes/[noteId]
 *   - 와인 태그 (노트의 wine_lwin 기반 WineEmbedCard)
 *   - 발행 → deferredToast + router.back()
 *
 * §4-11 Pressable 안전 패턴: 2-layer (opacity-only outer + visual inner).
 * §0-2 light-only mode.
 */
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, PenLine, Plus, X } from 'lucide-react-native';

import { brand, light, withAlpha } from '@/lib/design-tokens';
import { MOCK_TASTING_NOTES } from '@/lib/mock/tasting-notes';
import { getMockWineByLwin } from '@/lib/mock/wines';
import { useImagePicker } from '@/hooks/use-image-picker';
import { useCreatePost } from '@/hooks/use-community-posts';
import { getCachedNickname, loadNickname, saveNickname } from '@/lib/community/nickname';
import { NicknamePrompt } from '@/components/community/nickname-prompt';

const PHOTO_MAX = 9;
const GRID_GAP = 6;

const TITLE_MAX = 80;

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────

export default function CommunityNewNoteScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { pickMultiple } = useImagePicker();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [nicknamePromptVisible, setNicknamePromptVisible] = useState(false);
  const { create, isLoading: publishing } = useCreatePost();

  const handleAddPhotos = useCallback(async () => {
    Haptics.selectionAsync().catch(() => undefined);
    const remaining = PHOTO_MAX - photos.length;
    if (remaining <= 0) return;
    const uris = await pickMultiple(remaining);
    if (uris.length === 0) return;
    setPhotos((prev) => [...prev, ...uris]);
  }, [photos.length, pickMultiple]);

  const handleRemovePhoto = useCallback((index: number) => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('community.album.removePhotoTitle'), undefined, [
      { text: t('community.album.removePhotoCancel'), style: 'cancel' },
      {
        text: t('community.album.removePhotoOk'),
        style: 'destructive',
        onPress: () => setPhotos((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  }, [t]);

  const selectedNote = MOCK_TASTING_NOTES.find((n) => n.id === selectedNoteId) ?? null;
  const canPublish = selectedNote != null && title.trim().length > 0;

  const handleSelectNote = useCallback((noteId: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    setSelectedNoteId(noteId);
  }, []);

  const handleBack = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    if (selectedNoteId != null) {
      // Stage 2 → Stage 1
      setSelectedNoteId(null);
      return;
    }
    router.back();
  }, [selectedNoteId]);

  // 실제 발행 — 닉네임 확보된 상태에서 호출.
  const doPublish = useCallback(async () => {
    if (!selectedNote || title.trim().length === 0) return;
    try {
      await create({
        title: title.trim(),
        body: body.trim(),
        wineLwin: selectedNote.wine_lwin ?? null,
        rating: selectedNote.rating ?? null,
        photoCount: photos.length,
        agoLabel: t('common.justNow'),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      // 발행 글이 피드 최상단에 보이도록 커뮤니티 탭으로 이동.
      router.replace('/(tabs)/community');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      Alert.alert(t('app.name'), t('community.noteShare.publishError'));
    }
  }, [selectedNote, title, body, photos.length, create, t]);

  const handlePublish = useCallback(async () => {
    if (!canPublish || publishing) return;
    // 첫 발행: 닉네임 미설정 시 prompt 먼저.
    const nick = getCachedNickname() ?? (await loadNickname());
    if (!nick) {
      setNicknamePromptVisible(true);
      return;
    }
    await doPublish();
  }, [canPublish, publishing, doPublish]);

  const handleNicknameSubmit = useCallback(
    async (nickname: string) => {
      await saveNickname(nickname);
      setNicknamePromptVisible(false);
      await doPublish();
    },
    [doPublish]
  );

  const handleGoWrite = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push('/notes/new');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: light.bg.deepest }}>
      <NoteHeader
        stage={selectedNoteId != null ? 2 : 1}
        canPublish={canPublish}
        publishLabel={t('community.noteShare.publish')}
        onBack={handleBack}
        onPublish={handlePublish}
      />

      {selectedNoteId == null ? (
        /* ── Stage 1: 노트 목록 ── */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {MOCK_TASTING_NOTES.length === 0 ? (
            <EmptyState onGoWrite={handleGoWrite} />
          ) : (
            <>
              <Text
                allowFontScaling={false}
                style={{
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 10,
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 13,
                  color: light.text.muted,
                }}
              >
                {t('community.noteShare.selectHint')}
              </Text>
              <View style={{ flexDirection: 'column' }}>
                {MOCK_TASTING_NOTES.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    onPress={handleSelectNote}
                  />
                ))}
              </View>
              {/* 하단 새 노트 작성 버튼 */}
              <Pressable
                onPress={handleGoWrite}
                accessibilityRole="button"
                accessibilityLabel={t('community.noteShare.writeNew')}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  marginTop: 16,
                  marginHorizontal: 16,
                })}
              >
                <View
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: light.border.default,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <PenLine size={14} strokeWidth={1.75} color={light.border.active} />
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Freesentation_4Regular',
                      fontWeight: '600',
                      fontSize: 13,
                      color: light.border.active,
                    }}
                  >
                    {t('community.noteShare.writeNew')}
                  </Text>
                </View>
              </Pressable>
            </>
          )}
        </ScrollView>
      ) : (
        /* ── Stage 2: 글 작성 ── */
        <ComposeView
          note={selectedNote}
          title={title}
          body={body}
          photos={photos}
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onAddPhotos={handleAddPhotos}
          onRemovePhoto={handleRemovePhoto}
          onDeselectNote={() => setSelectedNoteId(null)}
          insetsBottom={insets.bottom}
        />
      )}

      {/* 첫 발행 닉네임 설정 */}
      <NicknamePrompt
        visible={nicknamePromptVisible}
        onClose={() => setNicknamePromptVisible(false)}
        onSubmit={handleNicknameSubmit}
        submitting={publishing}
      />
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Header
// ────────────────────────────────────────────────────────────────────────────

interface NoteHeaderProps {
  stage: 1 | 2;
  canPublish: boolean;
  publishLabel: string;
  onBack: () => void;
  onPublish: () => void;
}

function NoteHeader({ stage, canPublish, publishLabel, onBack, onPublish }: NoteHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: light.bg.deepest,
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: light.border.default,
      }}
    >
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t('community.compose.backLabel')}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.75} color={light.text.secondary} />
        </View>
      </Pressable>
      <Text
        allowFontScaling={false}
        accessibilityRole="header"
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'Freesentation_4Regular',
          fontSize: 15,
          color: light.text.primary,
        }}
      >
        {t('community.noteShare.screenTitle')}
      </Text>
      {stage === 2 ? (
        <Pressable
          onPress={onPublish}
          disabled={!canPublish}
          accessibilityRole="button"
          accessibilityLabel={publishLabel}
          accessibilityState={{ disabled: !canPublish }}
          hitSlop={4}
          style={({ pressed }) => ({
            opacity: !canPublish ? 0.5 : pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 14,
              backgroundColor: brand.wineRed,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Freesentation_4Regular',
                fontWeight: '600',
                fontSize: 12,
                color: brand.cream,
              }}
            >
              {publishLabel}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View style={{ width: 36, flexShrink: 0 }} />
      )}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stage 1: NoteRow — 노트 한 줄
// ────────────────────────────────────────────────────────────────────────────

interface NoteRowProps {
  note: (typeof MOCK_TASTING_NOTES)[number];
  onPress: (noteId: string) => void;
}

function NoteRow({ note, onPress }: NoteRowProps) {
  const wine = getMockWineByLwin(note.wine_lwin);
  const wineName = wine?.name_ko ?? wine?.display_name ?? note.wine_lwin ?? '—';
  const date = note.tasted_at?.slice(0, 10) ?? '';
  const rating = note.rating ?? 0;

  const memo: string = (() => {
    const ef = note.expert_fields as { memoKo?: string } | null;
    const bf = note.beginner_fields as { memoKo?: string } | null;
    return ef?.memoKo ?? bf?.memoKo ?? '';
  })();

  const handlePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    onPress(note.id);
  }, [note.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${wineName} · ${date}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: light.border.default,
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* 와인 이름 + 날짜 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: 'Freesentation_6SemiBold',
              fontSize: 14,
              color: light.text.primary,
            }}
          >
            {wineName}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: light.text.muted,
              flexShrink: 0,
            }}
          >
            {date}
          </Text>
        </View>
        {/* 별점 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const filled = i < Math.round(rating);
            return (
              <Text
                key={i}
                allowFontScaling={false}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 11,
                  color: light.border.active,
                  opacity: filled ? 1 : 0.2,
                }}
              >
                {'◆'}
              </Text>
            );
          })}
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 11,
              color: light.text.muted,
              marginLeft: 4,
            }}
          >
            {String(rating)}
          </Text>
        </View>
        {/* 메모 */}
        {memo.length > 0 && (
          <Text
            allowFontScaling={false}
            numberOfLines={2}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontSize: 12,
              lineHeight: 18,
              color: light.text.secondary,
              fontStyle: 'italic',
            }}
          >
            {memo}
          </Text>
        )}
        <View style={{ alignSelf: 'flex-end', marginTop: 2 }}>
          <ChevronRight size={12} strokeWidth={1.75} color={light.text.muted} />
        </View>
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stage 1: EmptyState
// ────────────────────────────────────────────────────────────────────────────

function EmptyState({ onGoWrite }: { onGoWrite: () => void }) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        paddingTop: 64,
        paddingHorizontal: 32,
        alignItems: 'center',
        gap: 16,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'Freesentation_4Regular',
          fontSize: 16,
          color: light.text.primary,
          textAlign: 'center',
        }}
      >
        {t('community.noteShare.empty')}
      </Text>
      <Pressable
        onPress={onGoWrite}
        accessibilityRole="button"
        accessibilityLabel={t('community.noteShare.goWrite')}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
            backgroundColor: brand.wineRed,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '600',
              fontSize: 14,
              color: brand.cream,
            }}
          >
            {t('community.noteShare.goWrite')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stage 2: ComposeView — 노트 임베드 + 글 작성
// ────────────────────────────────────────────────────────────────────────────

interface ComposeViewProps {
  note: (typeof MOCK_TASTING_NOTES)[number] | null;
  title: string;
  body: string;
  photos: string[];
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onAddPhotos: () => void;
  onRemovePhoto: (index: number) => void;
  onDeselectNote: () => void;
  insetsBottom: number;
}

function ComposeView({
  note,
  title,
  body,
  photos,
  onTitleChange,
  onBodyChange,
  onAddPhotos,
  onRemovePhoto,
  onDeselectNote,
  insetsBottom,
}: ComposeViewProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const photoSlotSize = (screenWidth - 20 * 2 - GRID_GAP * 2) / 3;

  if (!note) return null;

  const wine = getMockWineByLwin(note.wine_lwin);
  const wineName = wine?.name_ko ?? wine?.display_name ?? '—';
  const date = note.tasted_at?.slice(0, 10) ?? '';
  const rating = note.rating ?? 0;
  const memo: string = (() => {
    const ef = note.expert_fields as { memoKo?: string } | null;
    const bf = note.beginner_fields as { memoKo?: string } | null;
    return ef?.memoKo ?? bf?.memoKo ?? '';
  })();

  const handleNotePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    router.push(`/notes/${note.id}` as never);
  }, [note.id]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 + insetsBottom }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title input */}
      <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
        <TextInput
          value={title}
          onChangeText={onTitleChange}
          placeholder={t('community.noteShare.titlePlaceholder')}
          placeholderTextColor={light.text.muted}
          maxLength={TITLE_MAX}
          selectionColor={light.border.active}
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_7Bold',
            fontSize: 22,
            lineHeight: 28.6,
            color: light.text.primary,
            padding: 0,
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            marginTop: 4,
            fontFamily: 'Freesentation_4Regular',
            fontSize: 10,
            color: light.text.muted,
            textAlign: 'right',
          }}
        >
          {`${title.length} / ${TITLE_MAX}`}
        </Text>
      </View>

      {/* Body input */}
      <View style={{ paddingTop: 12, paddingHorizontal: 20 }}>
        <TextInput
          value={body}
          onChangeText={onBodyChange}
          placeholder={t('community.noteShare.bodyPlaceholder')}
          placeholderTextColor={light.text.muted}
          multiline
          textAlignVertical="top"
          selectionColor={light.border.active}
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 15,
            lineHeight: 24,
            color: light.text.primary,
            minHeight: 100,
            padding: 0,
          }}
        />
      </View>

      {/* Photo grid */}
      <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 10,
            color: light.border.active,
            letterSpacing: 1.8,
            marginBottom: 8,
          }}
        >
          {t('community.noteShare.photos').toUpperCase()}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
          {photos.map((uri, i) => (
            <NotePhotoSlot
              key={`${uri}-${i}`}
              uri={uri}
              index={i}
              total={photos.length}
              size={photoSlotSize}
              onPress={() => onRemovePhoto(i)}
            />
          ))}
          {photos.length < PHOTO_MAX && (
            <NoteAddSlot size={photoSlotSize} onPress={onAddPhotos} />
          )}
        </View>
      </View>

      {/* 노트 embed — 탭하면 노트 상세로 */}
      <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: 'Freesentation_4Regular',
            fontSize: 10,
            color: light.border.active,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {t('community.noteShare.selectedNote')}
        </Text>
        <Pressable
          onPress={handleNotePress}
          accessibilityRole="button"
          accessibilityLabel={wineName}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: light.bg.deep,
              borderWidth: 1,
              borderColor: withAlpha(light.border.active, 0.2),
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* 노트 헤더 */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Freesentation_6SemiBold',
                    fontSize: 13,
                    color: light.text.primary,
                  }}
                >
                  {wineName}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Freesentation_4Regular',
                    fontSize: 10,
                    color: light.text.muted,
                    marginTop: 2,
                  }}
                >
                  {date}
                </Text>
              </View>
              {/* 별점 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Text
                    key={i}
                    allowFontScaling={false}
                    style={{
                      fontSize: 11,
                      color: light.border.active,
                      opacity: i < Math.round(rating) ? 1 : 0.2,
                    }}
                  >
                    {'◆'}
                  </Text>
                ))}
              </View>
              <Pressable
                onPress={onDeselectNote}
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginLeft: 10 })}
              >
                <X size={14} strokeWidth={1.75} color={light.text.muted} />
              </Pressable>
            </View>
            {/* 메모 */}
            {memo.length > 0 && (
              <Text
                allowFontScaling={false}
                numberOfLines={3}
                style={{
                  fontFamily: 'Freesentation_4Regular',
                  fontSize: 12,
                  lineHeight: 19.2,
                  color: light.text.secondary,
                  fontStyle: 'italic',
                }}
              >
                {memo}
              </Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <ChevronRight size={12} strokeWidth={1.75} color={light.border.active} />
            </View>
          </View>
        </Pressable>

      </View>
    </ScrollView>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// NotePhotoSlot — §4-11 3-layer (Image + Index badge, position absolute)
// ────────────────────────────────────────────────────────────────────────────

interface NotePhotoSlotProps {
  uri: string;
  index: number;
  total: number;
  size: number;
  onPress: () => void;
}

function NotePhotoSlot({ uri, index, total, size, onPress }: NotePhotoSlotProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="imagebutton"
      accessibilityLabel={t('community.album.photoLabel', { index: index + 1, total })}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          width: size,
          aspectRatio: 1,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: light.border.default,
          backgroundColor: light.bg.surface,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri }}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            borderRadius: 4,
          }}
          contentFit="cover"
          transition={150}
        />
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: withAlpha(brand.textInk, 0.85),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Freesentation_4Regular',
              fontWeight: '700',
              fontSize: 10,
              color: brand.cream,
            }}
          >
            {String(index + 1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// NoteAddSlot — dashed border + Plus icon
// ────────────────────────────────────────────────────────────────────────────

interface NoteAddSlotProps {
  size: number;
  onPress: () => void;
}

function NoteAddSlot({ size, onPress }: NoteAddSlotProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('community.noteShare.addPhoto')}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          width: size,
          aspectRatio: 1,
          borderRadius: 8,
          backgroundColor: light.bg.surface,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: light.border.default,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={20} strokeWidth={1.5} color={light.text.muted} />
      </View>
    </Pressable>
  );
}
