/**
 * /cellar/lists/[id] — 리스트 상세 화면.
 * 공개/비공개 공통. 본인 리스트면 편집·공개전환·삭제 메뉴.
 * 타 사용자 공개 리스트면 저장·가져오기.
 * 디자인 원본: wm-lists-screens.jsx ScreenListDetail.
 */
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Share2,
  MoreHorizontal,
  Pencil,
  Layers,
  Globe,
  Lock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { WineListItemRow } from '@/components/shared/wine-list-item-row';
import { VisibilitySheet } from '@/components/cellar/visibility-sheet';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { LevelPill, type LevelId } from '@/components/shared/level-pill';
import {
  useListDetail,
  useSaveList,
  useImportList,
  useToggleVisibility,
  useDeleteList,
} from '@/hooks/use-wine-lists';
import { useTranslation as useT } from 'react-i18next';

// 작성자 정보 — v0.1.0은 실제 user lookup 미연결 (RLS·anonymous_display 미노출 §4-5).
// DEMO_MODE / mock 표시용 고정 작성자 (실제 프로필 연동은 v0.2.0).
const MOCK_CREATOR = {
  name: '함소믈리에',
  initial: '함',
  level: 5 as LevelId,
};

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(iso).toLocaleDateString();
}

export default function ListDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bg, text, border } = useThemeTokens();

  const { list, wines, isSaved: initialSaved, isOwner, isLoading, error, refetch } =
    useListDetail(id ?? '');

  const { isSaved, save, unsave, isLoading: savingLoading } = useSaveList(
    id ?? '',
    initialSaved,
  );
  const { importList, isLoading: importLoading } = useImportList();
  const { toggle, isLoading: toggling } = useToggleVisibility();
  const { deleteList } = useDeleteList();

  const [showVisibility, setShowVisibility] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleVisibilityConfirm = useCallback(async () => {
    if (!list) return;
    await toggle(list.id, list.visibility);
    setShowVisibility(false);
    await refetch();
  }, [list, toggle, refetch]);

  const handleImport = useCallback(async () => {
    if (!list) return;
    const importedTitle = t('lists.detail.importedTitle', { title: list.title });
    await importList(list.id, importedTitle);
    setToastMsg(t('lists.detail.importSuccess'));
  }, [list, importList, t]);

  const handleMore = useCallback(() => {
    if (!isOwner || !list) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    Alert.alert(
      list.title,
      undefined,
      [
        {
          text: list.visibility === 'private'
            ? t('lists.visibility.public')
            : t('lists.visibility.private'),
          onPress: () => setShowVisibility(true),
        },
        {
          text: t('common.delete', { defaultValue: '삭제' }),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('common.confirmDelete', { defaultValue: '삭제할까요?' }),
              list.title,
              [
                {
                  text: t('common.cancel', { defaultValue: '취소' }),
                  style: 'cancel',
                },
                {
                  text: t('common.delete', { defaultValue: '삭제' }),
                  style: 'destructive',
                  onPress: async () => {
                    await deleteList(list.id);
                    router.back();
                  },
                },
              ],
            );
          },
        },
        { text: t('common.cancel', { defaultValue: '취소' }), style: 'cancel' },
      ],
    );
  }, [isOwner, list, t, deleteList]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg.deepest, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={brand.gold} />
      </SafeAreaView>
    );
  }

  if (!list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg.deepest }}>
        {/* Back */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={8}
          >
            <View
              style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: bg.surface,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.2} color={text.primary} />
            </View>
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 17, color: text.primary, textAlign: 'center' }}>
            {t('lists.detail.privateTitle')}
          </Text>
          <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: text.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            {t('lists.detail.privateSub')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPublic = list.visibility === 'public';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg.deepest }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 6,
          gap: 6,
        }}
      >
        {/* Back */}
        <View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={8}
            accessibilityRole="button"
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: bg.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.2} color={text.primary} />
            </View>
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        {/* Share — 피드에 공유하기 (공개 리스트만) */}
        {isPublic && (
        <View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
              Alert.alert(
                t('lists.detail.shareToFeed'),
                list.title,
                [
                  {
                    text: t('lists.detail.shareToFeed'),
                    onPress: () => {
                      router.push({
                        pathname: '/community/new/index',
                        params: { listId: list.id, listTitle: list.title },
                      });
                    },
                  },
                  { text: t('common.cancel'), style: 'cancel' },
                ],
              );
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            hitSlop={8}
            accessibilityRole="button"
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: bg.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={17} strokeWidth={1.9} color={text.secondary} />
            </View>
          </Pressable>
        </View>
        )}

        {/* Pencil — 편집 바로가기 (owner only) */}
        {isOwner && (
          <View>
            <Pressable
              onPress={() => router.push(`/cellar/lists/${id}/edit`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              hitSlop={8}
              accessibilityRole="button"
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: bg.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Pencil size={16} strokeWidth={1.9} color={text.secondary} />
              </View>
            </Pressable>
          </View>
        )}

        {/* More (owner only) */}
        {isOwner && (
          <View>
            <Pressable
              onPress={handleMore}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              hitSlop={8}
              accessibilityRole="button"
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: bg.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MoreHorizontal size={17} strokeWidth={1.9} color={text.secondary} />
              </View>
            </Pressable>
          </View>
        )}
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 20 }}>
          {/* eyebrow */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Layers size={12} strokeWidth={2} color={brand.goldSoft} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 10,
                color: brand.goldSoft,
                letterSpacing: 2.2,
                textTransform: 'uppercase',
              }}
            >
              {isPublic ? t('lists.detail.publicLabel') : t('lists.detail.privateLabel')}
            </Text>
          </View>

          {/* Title */}
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'PlayfairDisplay_600SemiBold',
              fontStyle: 'italic',
              fontSize: 32,
              color: text.primary,
              letterSpacing: -0.6,
              lineHeight: 38,
              marginTop: 10,
            }}
          >
            {list.title}
          </Text>

          {/* 마지막 수정 + 공개여부 인라인 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 11,
                color: text.muted,
                lineHeight: 15,
              }}
            >
              {t('lists.detail.lastEdited', {
                time: formatRelativeTime(list.updated_at),
                count: list.wine_count,
              })}
            </Text>

            <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: text.muted, opacity: 0.4 }} />

            {/* 공개/비공개 인디케이터 — 오너는 탭 가능 */}
            <Pressable
              onPress={isOwner ? () => setShowVisibility(true) : undefined}
              style={({ pressed }) => ({ opacity: isOwner && pressed ? 0.6 : 1 })}
              accessibilityRole={isOwner ? 'button' : 'text'}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                {isPublic
                  ? <Globe size={10} strokeWidth={1.9} color={text.muted} />
                  : <Lock size={10} strokeWidth={1.9} color={text.muted} />}
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 11,
                    color: text.muted,
                    lineHeight: 15,
                  }}
                >
                  {isPublic
                    ? t('lists.detail.visibilityPublic')
                    : t('lists.detail.visibilityPrivate')}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Creator row — avatar + name + level + follow stub */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 14,
            }}
          >
            <CommUserAvatar
              levelId={MOCK_CREATOR.level}
              initial={MOCK_CREATOR.initial}
              size={36}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 14,
                color: text.primary,
                letterSpacing: -0.1,
              }}
            >
              {MOCK_CREATOR.name}
            </Text>
            <LevelPill level={MOCK_CREATOR.level} size="sm" />

            <View style={{ flex: 1 }} />

            {/* Follow stub */}
            <Pressable
              onPress={() => undefined}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              accessibilityRole="button"
              hitSlop={6}
            >
              <View
                style={{
                  height: 30,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: brand.wineRed,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 12,
                    color: brand.wineRed,
                  }}
                >
                  {t('lists.detail.follow')}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Description — blockquote */}
          {!!list.description && (
            <Text
              allowFontScaling={false}
              style={{
                paddingLeft: 12,
                borderLeftWidth: 2,
                borderLeftColor: brand.gold,
                fontFamily: 'Inter_400Regular',
                fontStyle: 'italic',
                fontSize: 13,
                color: text.secondary,
                lineHeight: 19.5,
                marginTop: 10,
              }}
            >
              {list.description}
            </Text>
          )}

            {/* Attribution — 가져온 리스트일 때만 표시 */}
          {!!list.source_list_title && !!list.source_author_display && (
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 11,
                color: text.muted,
                marginTop: 6,
                lineHeight: 16,
              }}
            >
              {t('lists.detail.attribution', { author: list.source_author_display })}
            </Text>
          )}

        {/* Engagement stats — 3 column row (public only) */}
          {isPublic && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 14,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: border.default,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: border.default,
              }}
            >
              {[
                { key: 'likes', label: t('lists.detail.statLikes'), count: list.like_count ?? 0 },
                { key: 'comments', label: t('lists.detail.statComments'), count: 0 },
                { key: 'saves', label: t('lists.detail.statSaves'), count: list.save_count ?? 0 },
              ].map(({ key, label, count }, i) => (
                <View
                  key={key}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderLeftWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderLeftColor: border.default,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Freesentation_7Bold',
                      fontSize: 18,
                      color: text.primary,
                      letterSpacing: -0.4,
                    }}
                  >
                    {count}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 11,
                      color: text.muted,
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: border.default, marginHorizontal: 20 }} />

        {/* Wine list */}
        {wines.map((item, i) => (
          <WineListItemRow
            key={item.id}
            wine={item.wine}
            idx={i}
            onPress={() => item.wine && router.push(`/wine/${item.wine.lwin}`)}
          />
        ))}
      </ScrollView>

      {/* Bottom action bar — 비오너(저장/가져오기)만 */}
      {!isOwner && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: 28,
            backgroundColor: bg.deepest,
            borderTopWidth: 0.5,
            borderTopColor: border.default,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          {/* Save/Saved toggle */}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={isSaved ? t('lists.detail.saved') : t('lists.detail.save')}
              onPress={isSaved ? unsave : save}
              size="lg"
              variant={isSaved ? 'secondary' : 'primary'}
              loading={savingLoading}
            />
          </View>
          {/* Import to my lists */}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={t('lists.detail.import')}
              onPress={handleImport}
              size="lg"
              variant="ghost"
              loading={importLoading}
            />
          </View>
        </View>
      )}

      {/* Visibility sheet */}
      <VisibilitySheet
        open={showVisibility}
        mode={list.visibility === 'private' ? 'toPublic' : 'toPrivate'}
        saveCount={list.save_count}
        isLoading={toggling}
        onClose={() => setShowVisibility(false)}
        onConfirm={handleVisibilityConfirm}
      />

      {/* Toast */}
      {!!toastMsg && (
        <View style={{ position: 'absolute', bottom: 100, left: 16, right: 16 }}>
          <Toast message={toastMsg} />
        </View>
      )}
    </SafeAreaView>
  );
}
