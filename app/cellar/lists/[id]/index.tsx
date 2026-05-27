/**
 * /cellar/lists/[id] — 리스트 상세 화면.
 * isOwner true  → 내 리스트 뷰 (progress strip, WINES 헤더, 와인 추가 CTA)
 * isOwner false → 타인 공개 리스트 뷰 (creator row, stats, 저장/가져오기 CTA)
 *
 * 공개/비공개 인라인 칩 + 헤더 연필 버튼은 현재 상태 유지.
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
  Heart,
  MessageSquare,
  Bookmark,
  Plus,
  GripVertical,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { WineListItemRow } from '@/components/shared/wine-list-item-row';
import { VisibilitySheet } from '@/components/cellar/visibility-sheet';
import { Toast } from '@/components/shared/toast';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { LevelPill, type LevelId } from '@/components/shared/level-pill';
import {
  useListDetail,
  useImportList,
  useToggleVisibility,
  useDeleteList,
} from '@/hooks/use-wine-lists';

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

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export default function ListDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bg, text, border, scheme } = useThemeTokens();

  const { list, wines, isOwner, isLoading, error, refetch } =
    useListDetail(id ?? '');

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

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  const handleImport = useCallback(async () => {
    if (!list) return;
    const importedTitle = t('lists.detail.importedTitle', { title: list.title });
    await importList(list.id, importedTitle);
    showToast(t('lists.detail.importSuccess'));
  }, [list, importList, t, showToast]);

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
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('common.confirmDelete'),
              list.title,
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.delete'),
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
        { text: t('common.cancel'), style: 'cancel' },
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
        <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} hitSlop={8}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: bg.surface, alignItems: 'center', justifyContent: 'center' }}>
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
  const creatorInitial = list.creator_name?.[0]?.toUpperCase() ?? '?';

  // ─── Icon button helper ───────────────────────────────────────────
  const IconBtn = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
    <View>
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} hitSlop={8} accessibilityRole="button">
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: bg.surface, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg.deepest }}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, gap: 6 }}>
        <IconBtn onPress={() => router.back()}>
          <ChevronLeft size={20} strokeWidth={2.2} color={text.primary} />
        </IconBtn>

        <View style={{ flex: 1 }} />

        {/* Share — 공개 리스트만 */}
        {isPublic && (
          <IconBtn onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
            Alert.alert(
              t('lists.detail.shareToFeed'), list.title,
              [
                { text: t('lists.detail.shareToFeed'), onPress: () => router.push({ pathname: '/community/new/index', params: { listId: list.id, listTitle: list.title } }) },
                { text: t('common.cancel'), style: 'cancel' },
              ],
            );
          }}>
            <Share2 size={17} strokeWidth={1.9} color={text.secondary} />
          </IconBtn>
        )}

        {/* Pencil — 편집 (owner only, 현재 상태 유지) */}
        {isOwner && (
          <IconBtn onPress={() => router.push(`/cellar/lists/${id}/edit`)}>
            <Pencil size={16} strokeWidth={1.9} color={text.secondary} />
          </IconBtn>
        )}

        {/* More (owner only) */}
        {isOwner && (
          <IconBtn onPress={handleMore}>
            <MoreHorizontal size={17} strokeWidth={1.9} color={text.secondary} />
          </IconBtn>
        )}
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>

        {/* Hero section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 20 }}>

          {/* Eyebrow */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Layers size={12} strokeWidth={2} color={brand.goldSoft} />
            <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: brand.goldSoft, letterSpacing: 2.2, textTransform: 'uppercase' }}>
              {isOwner ? t('lists.detail.privateLabel') : t('lists.detail.publicLabel')}
            </Text>
          </View>

          {/* Title */}
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontStyle: 'italic', fontSize: 32, color: text.primary, letterSpacing: -0.6, lineHeight: 38, marginTop: 10 }}
          >
            {list.title}
          </Text>

          {/* ── OWNER META ROW ── */}
          {isOwner && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}>
                <Text style={{ fontFamily: 'Inter_700Bold', color: text.primary }}>{list.wine_count}</Text>
                {' '}{t('common.bottleUnit')}
              </Text>
              <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: text.muted, opacity: 0.4 }} />
              <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}>
                {t('lists.detail.createdAt', { date: formatCreatedAt(list.created_at) })}
              </Text>
              <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: text.muted, opacity: 0.4 }} />
              <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}>
                {formatRelativeTime(list.updated_at)} {t('common.edit', { defaultValue: '수정' })}
              </Text>
              <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: text.muted, opacity: 0.4 }} />
              {/* 공개/비공개 인라인 칩 — 현재 상태 유지 */}
              <Pressable
                onPress={() => setShowVisibility(true)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityRole="button"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  {isPublic
                    ? <Globe size={10} strokeWidth={1.9} color={text.muted} />
                    : <Lock size={10} strokeWidth={1.9} color={text.muted} />}
                  <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}>
                    {isPublic ? t('lists.detail.visibilityPublic') : t('lists.detail.visibilityPrivate')}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* ── NON-OWNER CREATOR ROW ── */}
          {!isOwner && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <CommUserAvatar levelId={5 as LevelId} initial={creatorInitial} size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: text.primary, letterSpacing: -0.1 }}>
                    {list.creator_name ?? '—'}
                  </Text>
                  <LevelPill level={5 as LevelId} size="sm" />
                </View>
                <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted, marginTop: 1 }}>
                  {t('lists.detail.lastEdited', { time: formatRelativeTime(list.updated_at), count: list.wine_count })}
                </Text>
              </View>
            </View>
          )}

          {/* Description — blockquote with gold left border */}
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
                marginTop: 14,
              }}
            >
              {list.description}
            </Text>
          )}

          {/* Attribution */}
          {!!list.source_list_title && !!list.source_author_display && (
            <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted, marginTop: 6, lineHeight: 16 }}>
              {t('lists.detail.attribution', { author: list.source_author_display })}
            </Text>
          )}


          {/* ── NON-OWNER STATS ROW ── */}
          {!isOwner && isPublic && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 16,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: border.default,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: border.default,
              }}
            >
              {[
                { icon: <Heart size={12} strokeWidth={2} color={brand.goldSoft} />, count: list.like_count ?? 0, label: t('lists.detail.statLikes') },
                { icon: <MessageSquare size={12} strokeWidth={2} color={brand.goldSoft} />, count: 0, label: t('lists.detail.statComments') },
                { icon: <Bookmark size={12} strokeWidth={2} color={brand.goldSoft} />, count: list.save_count ?? 0, label: t('lists.detail.statSaves') },
              ].map(({ icon, count, label }, i) => (
                <View
                  key={label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderLeftWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderLeftColor: border.default,
                    gap: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    {icon}
                    <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: text.primary, letterSpacing: -0.4 }}>
                      {count}
                    </Text>
                  </View>
                  <Text allowFontScaling={false} style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: text.muted }}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── WINES SECTION HEADER ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            paddingHorizontal: 24,
            paddingBottom: 8,
            gap: 8,
          }}
        >
          <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: brand.goldSoft, letterSpacing: 1.8, textTransform: 'uppercase' }}>
            {t('lists.detail.winesSection')}
          </Text>
          <Text allowFontScaling={false} style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: text.primary }}>
            {t('common.bottleUnit', { defaultValue: '병' })} {list.wine_count}
          </Text>
          <View style={{ flex: 1 }} />
          {isOwner && (
            <Pressable
              onPress={() => showToast(t('placeholders.comingSoon'))}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              hitSlop={6}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <GripVertical size={11} strokeWidth={1.8} color={text.secondary} />
                <Text allowFontScaling={false} style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: text.secondary }}>
                  {t('lists.detail.reorder')}
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: border.default, marginHorizontal: 0 }} />

        {/* Wine rows */}
        {wines.map((item, i) => (
          <WineListItemRow
            key={item.id}
            wine={item.wine}
            idx={i}
            onPress={() => item.wine && router.push(`/wine/${item.wine.lwin}`)}
          />
        ))}
      </ScrollView>

      {/* ── BOTTOM ACTION BAR ─────────────────────────────────────── */}

      {/* Owner: 와인 추가 (v0.3.0 예정) */}
      {isOwner && (
        <View
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
            backgroundColor: bg.deepest,
            borderTopWidth: 0.5, borderTopColor: border.default,
          }}
        >
          <Pressable
            onPress={() => showToast(t('placeholders.comingSoon'))}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            accessibilityRole="button"
          >
            <View
              style={{
                height: 52, borderRadius: 14,
                backgroundColor: brand.wineRed,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                shadowColor: brand.wineRed,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
              }}
            >
              <Plus size={16} strokeWidth={2.4} color={brand.cream} />
              <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: brand.cream, letterSpacing: -0.1 }}>
                {t('lists.detail.addWine')}
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Non-owner: 가져오기 */}
      {!isOwner && (
        <View
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
            backgroundColor: bg.deepest,
            borderTopWidth: 0.5, borderTopColor: border.default,
          }}
        >
          <Pressable
            onPress={handleImport}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            accessibilityRole="button"
            disabled={importLoading}
          >
            <View
              style={{
                height: 52, borderRadius: 14,
                backgroundColor: brand.wineRed,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                shadowColor: brand.wineRed,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
              }}
            >
              <Text allowFontScaling={false} style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: brand.cream, letterSpacing: -0.1 }}>
                {t('lists.detail.import')}
              </Text>
            </View>
          </Pressable>
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
        <View style={{ position: 'absolute', bottom: 100, left: 16, right: 16 }} pointerEvents="none">
          <Toast message={toastMsg} />
        </View>
      )}
    </SafeAreaView>
  );
}
